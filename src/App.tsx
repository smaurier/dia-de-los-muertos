// src/App.tsx
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { Suspense, useState, useEffect } from 'react'
import { Player } from './scene/Player'
import { Salon } from './scene/salon/Salon'
import { Subtitles } from './scene/ui/Subtitles'

const CONTROLS_MAP = [
  { name: 'forward',  keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left',     keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right',    keys: ['ArrowRight', 'KeyD'] },
  { name: 'hide',     keys: ['KeyE', 'Space'] },
]

export default function App() {
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    const handleChange = () => setLocked(document.pointerLockElement !== null)
    document.addEventListener('pointerlockchange', handleChange)
    return () => document.removeEventListener('pointerlockchange', handleChange)
  }, [])

  return (
    <>
      {!locked && (
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
          <Suspense fallback={null}>
            <Player />
            <Salon />
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </>
  )
}
