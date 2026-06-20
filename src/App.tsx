// src/App.tsx
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { Suspense } from 'react'
import { Player } from './scene/Player'
import { Salon } from './scene/salon/Salon'

const CONTROLS_MAP = [
  { name: 'forward',  keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left',     keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right',    keys: ['ArrowRight', 'KeyD'] },
  { name: 'hide',     keys: ['KeyE', 'Space'] },
]

export default function App() {
  return (
    <KeyboardControls map={CONTROLS_MAP}>
      <Canvas
        camera={{ fov: 65, near: 0.1, far: 100, position: [0, 1.1, 0] }}
        style={{ width: '100vw', height: '100vh', background: '#1a0e07' }}
      >
        <Suspense fallback={null}>
          <Player />
          <Salon />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  )
}
