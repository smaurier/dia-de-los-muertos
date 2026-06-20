// src/scene/chapter3/Corridor.tsx
import { forwardRef } from 'react'
import * as THREE from 'three'
import { toonGradient } from './toonGradient'

export const Corridor = forwardRef<THREE.Group>(function Corridor(_, ref) {
  return (
    <group ref={ref}>
      <ambientLight intensity={0.15} color="#f5c87a" />
      <pointLight position={[0, 2.2, 0]} intensity={1.5} color="#f0d89a" distance={6} decay={2} />
      <directionalLight intensity={0.8} color="#f5c87a" position={[0, 3, 2]} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[2, 8]} />
        <meshToonMaterial color="#5c3d2e" gradientMap={toonGradient} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.5, 0]}>
        <planeGeometry args={[2, 8]} />
        <meshToonMaterial color="#2a1f1a" gradientMap={toonGradient} />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-1, 1.25, 0]}>
        <planeGeometry args={[8, 2.5]} />
        <meshToonMaterial color="#3d2b1f" gradientMap={toonGradient} />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[1, 1.25, 0]}>
        <planeGeometry args={[8, 2.5]} />
        <meshToonMaterial color="#3d2b1f" gradientMap={toonGradient} />
      </mesh>

      {/* End wall */}
      <mesh position={[0, 1.25, -4]}>
        <planeGeometry args={[2, 2.5]} />
        <meshToonMaterial color="#2e1e15" gradientMap={toonGradient} />
      </mesh>

      {/* Start wall */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 1.25, 4]}>
        <planeGeometry args={[2, 2.5]} />
        <meshToonMaterial color="#2e1e15" gradientMap={toonGradient} />
      </mesh>
    </group>
  )
})
