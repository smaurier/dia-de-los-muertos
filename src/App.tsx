// src/App.tsx
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import type * as THREE from 'three'
import { KeyboardControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Suspense, useState, useEffect, useRef } from 'react'
import { Player } from './scene/Player'
import { LivingRoom } from './scene/living-room/LivingRoom'
import { Subtitles } from './scene/ui/Subtitles'
import { DoorHint } from './scene/ui/DoorHint'
import { INTERACT_KEY } from './game/controlsConfig'
import { advanceLoader, initialLoaderState, type LoaderState } from './scene/assets/loaderState'
import { preloadAll } from './scene/assets/preloadAssets'
import { ProgressiveWarmup } from './scene/assets/ProgressiveWarmup'
import { useCompileProgress } from './scene/assets/compileProgressStore'

// Rich toon (art direction experience): warm fog + candle bloom + vignette.
// Mood target: docs/references/rooms/cuisine/cuisine-entree-02.png
const TOON_RICHE = {
  enabled: true,
  fogColor: '#26140b',   // deep brown, extends the #1a0e07 background
  fogNear: 7,            // tight: room backs fade into shadow (level 2)
  fogFar: 24,
  bloomThreshold: 0.75,  // painted halo: warm sources bloom earlier
  bloomIntensity: 0.55,
  vignetteDarkness: 0.35,
  grainOpacity: 0.055,   // paper grain — gouache look from the refs
}

const CONTROLS_MAP = [
  { name: 'forward',  keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left',     keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right',    keys: ['ArrowRight', 'KeyD'] },
  { name: 'hide',     keys: ['KeyE', 'Space'] },
  { name: 'interact', keys: [INTERACT_KEY] },
]

// Photo mode (visual check without pointer lock):
// http://localhost:5173/?photo=camX,camY,camZ,lookX,lookY,lookZ
// Debug: ?nofx disables postprocessing (bloom/vignette)
const NOFX = new URLSearchParams(window.location.search).has('nofx')

const PHOTO = (() => {
  const raw = new URLSearchParams(window.location.search).get('photo')
  if (!raw) return null
  const nums = raw.split(',').map(Number)
  return nums.length === 6 && nums.every(n => !Number.isNaN(n)) ? nums : null
})()

// ?nofx cuts the composer — but ReflectionsSansFog (useFrame at priority ≠ 0)
// disables R3F automatic rendering: without the composer, nothing rendered
// → black screen. In NOFX mode, this component takes over rendering manually.
function ManualRender() {
  const { gl, scene, camera } = useThree()
  useFrame(() => {
    gl.render(scene, camera)
  }, 2)
  return null
}

// Drei reflectors (floor, glass) render their pass in useFrame (priority 0):
// the virtual mirror camera sees the player 2× farther and fog swallows them
// (you "disappear" from the reflection when stepping back). A real reflection
// doesn't double-apply fog → fog disabled during reflector passes,
// restored before the main render.
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

// Loading screen + opening fade: covers asset loading (without it: freeze
// impression, then blown-out colors before the EffectComposer mounts inside
// Suspense). Title + cempasúchil progress bar during loading; black stays
// 400 ms after completion (time for the composer to settle) then fades 900 ms.
// Lines that rotate during loading — the house is getting ready.
const LOADING_LINES = [
  'la casa se prepara…',
  'se encienden las velas…',
  'el papel picado se cuelga…',
  'la vaporera empieza a silbar…',
  'el perro sueña bajo la mesa…',
  'las estrellas se acomodan…',
  'la familia llega…',
]

// Drives scene mounting: keeps the loading gate held until the drei loader has
// been idle long enough (advanceLoader debounce), independent of the fade.
function useLoaderReady(): boolean {
  const active = useProgress(s => s.active)
  const activeRef = useRef(active)
  activeRef.current = active
  const [ready, setReady] = useState(false)
  const stateRef = useRef<LoaderState>(initialLoaderState)
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = now - last; last = now
      stateRef.current = advanceLoader(stateRef.current, activeRef.current, dt)
      if (stateRef.current.ready) { setReady(true); return }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return ready
}

function FadeIn({ done }: { done: boolean }) {
  const assetActive = useProgress(s => s.active)
  const assetProgress = useProgress(s => s.progress)
  const compileProgress = useCompileProgress(s => s.progress) // 0..1
  const shown = useRef(0)
  // Asset phase fills 0→30 %, compile phase fills 30→100 %.
  const raw = assetActive ? assetProgress * 0.30 : 30 + compileProgress * 70
  if (raw > shown.current) shown.current = raw
  const [gone, setGone] = useState(false)
  const [fading, setFading] = useState(false)
  const [lineIdx, setLineIdx] = useState(0)

  // Rotate lines every 1.8 s
  useEffect(() => {
    const t = setInterval(() => setLineIdx(i => (i + 1) % LOADING_LINES.length), 1800)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!done) return
    setFading(true)
    const t = setTimeout(() => setGone(true), 900)
    return () => clearTimeout(t)
  }, [done])

  if (gone) return null
  const pct = fading ? 100 : Math.min(99, Math.round(shown.current))
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
          <div style={{ color: '#8a6a5a', fontSize: '15px', fontStyle: 'italic', marginBottom: '36px', minHeight: '20px' }}>
            {LOADING_LINES[lineIdx]}
          </div>
          {/* Cempasúchil progress bar */}
          <div style={{
            width: '280px', height: '5px', borderRadius: '3px',
            background: 'rgba(232,148,10,0.15)', overflow: 'hidden',
          }}>
            <div style={{
              width: `${pct}%`, height: '100%', borderRadius: '3px',
              background: 'linear-gradient(90deg, #C0392B, #E8940A)',
              transition: 'width 300ms ease',
            }} />
          </div>
          <div style={{ color: '#6a5248', fontSize: '12px', marginTop: '12px' }}>
            {pct} %
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

  useEffect(() => { preloadAll() }, [])
  const ready = useLoaderReady()
  const compileDone = useCompileProgress(s => s.done)
  useEffect(() => {
    const t = setTimeout(() => useCompileProgress.getState().markDone(), 25000) // fallback: never hang
    return () => clearTimeout(t)
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
      <FadeIn done={compileDone} />
      <Subtitles />
      <DoorHint />
      <KeyboardControls map={CONTROLS_MAP}>
        <Canvas
          camera={{ fov: 65, near: 0.1, far: 100, position: [0, 1.3, 4.2] }}
          // DPR capped at 1.5: on hi-dpi screens the game rendered at 2× resolution
          // — doubled fill rate for no visible gain in toon style
          dpr={[1, 1.5]}
          style={{ width: '100vw', height: '100vh', background: '#1a0e07' }}
        >
          {TOON_RICHE.enabled && (
            <fog attach="fog" args={[TOON_RICHE.fogColor, TOON_RICHE.fogNear, TOON_RICHE.fogFar]} />
          )}
          <ReflectionsSansFog />
          {NOFX && <ManualRender />}
          <Suspense fallback={null}>
            {ready && (
              <>
                {PHOTO ? <PhotoCamera conf={PHOTO} /> : <Player />}
                <LivingRoom />
                {/* INSIDE Suspense: mounted outside Suspense, the composer captures an
                    empty framebuffer during GLB loading and renders a solid screen
                    (fog color) permanently. */}
                {TOON_RICHE.enabled && !NOFX && (
                  // multisampling 2 (default 8): 8× anti-aliasing was expensive
                  // for a toon render with black outlines + grain that masks it all
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
                <ProgressiveWarmup />
              </>
            )}
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </>
  )
}
