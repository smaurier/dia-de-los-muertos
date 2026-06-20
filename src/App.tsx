// src/App.tsx
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { Suspense } from 'react'
import { Player } from './scene/Player'
import { Chapter3 } from './scene/chapter3/Chapter3'

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
        style={{ width: '100vw', height: '100vh', background: '#0a0705' }}
      >
        <Suspense fallback={null}>
          <Player />
          <Chapter3 />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  )
}
