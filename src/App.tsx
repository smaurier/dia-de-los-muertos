// src/App.tsx
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import type * as THREE from 'three'
import { KeyboardControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Suspense, useState, useEffect, useRef } from 'react'
import { Player } from './scene/Player'
import { Salon } from './scene/salon/Salon'
import { Subtitles } from './scene/ui/Subtitles'
import { DoorHint } from './scene/ui/DoorHint'
import { INTERACT_KEY } from './game/controlsConfig'

// Toon riche (expérience DA) : fog chaud + bloom bougies + vignette.
// Cible mood : docs/references/rooms/cuisine/cuisine-entree-02.png
const TOON_RICHE = {
  enabled: true,
  fogColor: '#26140b',   // brun profond, prolonge le fond #1a0e07
  fogNear: 7,            // resserré : les fonds de pièce fondent dans la pénombre (palier 2)
  fogFar: 24,
  bloomThreshold: 0.75,  // halo peint : les sources chaudes fleurissent plus tôt
  bloomIntensity: 0.55,
  vignetteDarkness: 0.35,
  grainOpacity: 0.055,   // grain de papier — rendu gouache des refs
}

const CONTROLS_MAP = [
  { name: 'forward',  keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left',     keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right',    keys: ['ArrowRight', 'KeyD'] },
  { name: 'hide',     keys: ['KeyE', 'Space'] },
  { name: 'interact', keys: [INTERACT_KEY] },
]

// Mode photo (vérification visuelle sans pointer lock) :
// http://localhost:5173/?photo=camX,camY,camZ,lookX,lookY,lookZ
// Debug : ?nofx désactive le postprocessing (bloom/vignette)
const NOFX = new URLSearchParams(window.location.search).has('nofx')

const PHOTO = (() => {
  const raw = new URLSearchParams(window.location.search).get('photo')
  if (!raw) return null
  const nums = raw.split(',').map(Number)
  return nums.length === 6 && nums.every(n => !Number.isNaN(n)) ? nums : null
})()

// Les réflecteurs drei (sol, vitre) rendent leur passe dans useFrame (prio 0) :
// la caméra virtuelle, mirroir de la nôtre, voit le joueur 2× plus loin et le
// fog l'avale (on « disparaît » du reflet en reculant). Un vrai reflet ne
// prend pas le fog en double → fog coupé pendant les passes réflecteur,
// restauré avant le rendu principal.
function ReflectionsSansFog() {
  const scene = useThree(s => s.scene)
  const saved = useRef<THREE.Scene['fog']>(null)
  useFrame(() => {
    saved.current = scene.fog
    scene.fog = null
  }, -1)
  useFrame(() => {
    scene.fog = saved.current
  }, 1)
  return null
}

// Écran de chargement + fondu d'ouverture : couvre le chargement des assets
// (sans lui : impression de freeze, puis couleurs brûlées avant le montage de
// l'EffectComposer qui vit dans le Suspense). Titre + barre de progression
// cempasúchil pendant le chargement ; le noir reste 400 ms après la fin
// (le temps que le composer s'installe) puis fond en 900 ms.
function FadeIn() {
  const { active, progress } = useProgress()
  const [gone, setGone] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (!active && !fading) {
      const t1 = setTimeout(() => setFading(true), 400)
      const t2 = setTimeout(() => setGone(true), 1700)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [active, fading])

  if (gone) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 20, background: '#12080a',
      opacity: fading ? 0 : 1, transition: 'opacity 900ms ease',
      pointerEvents: 'none',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Georgia, serif',
    }}>
      {!fading && (
        <>
          <div style={{ color: '#E8940A', fontSize: '42px', letterSpacing: '3px', marginBottom: '6px' }}>
            Día de Muertos
          </div>
          <div style={{ color: '#8a6a5a', fontSize: '15px', fontStyle: 'italic', marginBottom: '36px' }}>
            la casa se prepara…
          </div>
          {/* Barre de progression cempasúchil */}
          <div style={{
            width: '280px', height: '5px', borderRadius: '3px',
            background: 'rgba(232,148,10,0.15)', overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`, height: '100%', borderRadius: '3px',
              background: 'linear-gradient(90deg, #C0392B, #E8940A)',
              transition: 'width 300ms ease',
            }} />
          </div>
          <div style={{ color: '#6a5248', fontSize: '12px', marginTop: '12px' }}>
            {Math.round(progress)} %
          </div>
        </>
      )}
    </div>
  )
}

function PhotoCamera({ conf }: { conf: number[] }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(conf[0], conf[1], conf[2])
    camera.lookAt(conf[3], conf[4], conf[5])
  }, [camera, conf])
  return null
}

export default function App() {
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    const handleChange = () => setLocked(document.pointerLockElement !== null)
    document.addEventListener('pointerlockchange', handleChange)
    return () => document.removeEventListener('pointerlockchange', handleChange)
  }, [])

  return (
    <>
      {!locked && !PHOTO && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.55)', pointerEvents: 'none',
          color: '#f5c87a', fontFamily: 'sans-serif', textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px', fontWeight: 'bold' }}>Cliquez pour naviguer</div>
          <div style={{ fontSize: '18px', color: '#c9a87c' }}>WASD · souris · E pour se cacher</div>
        </div>
      )}
      <FadeIn />
      <Subtitles />
      <DoorHint />
      <KeyboardControls map={CONTROLS_MAP}>
        <Canvas
          camera={{ fov: 65, near: 0.1, far: 100, position: [0, 1.3, 4.2] }}
          // DPR plafonné à 1.5 : sur écran hi-dpi le jeu rendait à 2× la
          // résolution — fill rate doublé pour un gain invisible en toon
          dpr={[1, 1.5]}
          style={{ width: '100vw', height: '100vh', background: '#1a0e07' }}
        >
          {TOON_RICHE.enabled && (
            <fog attach="fog" args={[TOON_RICHE.fogColor, TOON_RICHE.fogNear, TOON_RICHE.fogFar]} />
          )}
          <ReflectionsSansFog />
          <Suspense fallback={null}>
            {PHOTO ? <PhotoCamera conf={PHOTO} /> : <Player />}
            <Salon />
            {/* DANS le Suspense : monté hors Suspense, le composer capture un
                framebuffer vide pendant le chargement des GLB et rend un écran
                uniforme (couleur fog) définitivement. */}
            {TOON_RICHE.enabled && !NOFX && (
              // multisampling 2 (défaut 8) : l'anti-aliasing 8× coûtait cher
              // pour un rendu toon à contours noirs + grain qui masque tout
              <EffectComposer multisampling={2}>
                <Bloom
                  luminanceThreshold={TOON_RICHE.bloomThreshold}
                  intensity={TOON_RICHE.bloomIntensity}
                  mipmapBlur
                />
                <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={TOON_RICHE.grainOpacity} />
                <Vignette darkness={TOON_RICHE.vignetteDarkness} />
              </EffectComposer>
            )}
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </>
  )
}
