// src/App.tsx
import { Canvas, useThree } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Suspense, useState, useEffect } from 'react'
import { Player } from './scene/Player'
import { Salon } from './scene/salon/Salon'
import { Subtitles } from './scene/ui/Subtitles'

// Toon riche (expérience DA) : fog chaud + bloom bougies + vignette.
// Cible mood : docs/references/rooms/cuisine/cuisine-entree-02.png
const TOON_RICHE = {
  enabled: true,
  fogColor: '#26140b',   // brun profond, prolonge le fond #1a0e07
  fogNear: 7,            // resserré : les fonds de pièce fondent dans la pénombre (palier 2)
  fogFar: 24,
  bloomThreshold: 0.85,  // seules les sources vives (bougies, lustre) fleurissent
  bloomIntensity: 0.45,
  vignetteDarkness: 0.35,
}

const CONTROLS_MAP = [
  { name: 'forward',  keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left',     keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right',    keys: ['ArrowRight', 'KeyD'] },
  { name: 'hide',     keys: ['KeyE', 'Space'] },
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
      <Subtitles />
      <KeyboardControls map={CONTROLS_MAP}>
        <Canvas
          camera={{ fov: 65, near: 0.1, far: 100, position: [0, 1.3, 4.2] }}
          style={{ width: '100vw', height: '100vh', background: '#1a0e07' }}
        >
          {TOON_RICHE.enabled && (
            <fog attach="fog" args={[TOON_RICHE.fogColor, TOON_RICHE.fogNear, TOON_RICHE.fogFar]} />
          )}
          <Suspense fallback={null}>
            {PHOTO ? <PhotoCamera conf={PHOTO} /> : <Player />}
            <Salon />
            {/* DANS le Suspense : monté hors Suspense, le composer capture un
                framebuffer vide pendant le chargement des GLB et rend un écran
                uniforme (couleur fog) définitivement. */}
            {TOON_RICHE.enabled && !NOFX && (
              <EffectComposer>
                <Bloom
                  luminanceThreshold={TOON_RICHE.bloomThreshold}
                  intensity={TOON_RICHE.bloomIntensity}
                  mipmapBlur
                />
                <Vignette darkness={TOON_RICHE.vignetteDarkness} />
              </EffectComposer>
            )}
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </>
  )
}
