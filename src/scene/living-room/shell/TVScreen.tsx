// src/scene/living-room/shell/TVScreen.tsx
// CRT screen: bluish glow that flickers (distant TV programme).
// Placed on the east face of the TV body (TV at (-6.33, -2.15) world,
// screen facing east toward the sofa).
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { toonGradient } from '../../shared/toonGradient'

export function TVScreen() {
  const matRef = useRef<THREE.MeshToonMaterial>(null)
  const t = useRef(0)
  useFrame((_, delta) => {
    t.current += delta
    if (matRef.current) {
      const flicker =
        0.95 +
        0.25 * Math.sin(t.current * 9.3) * Math.sin(t.current * 2.7) +
        (Math.random() < 0.03 ? 0.35 : 0)
      matRef.current.emissiveIntensity = flicker
    }
  })
  return (
    <mesh position={[-6.01, 0.78, -4.81]} rotation={[0, Math.PI / 4, 0]}>
      <planeGeometry args={[0.44, 0.34]} />
      <meshToonMaterial
        ref={matRef}
        color="#5a7ab0"
        gradientMap={toonGradient}
        emissive="#7a9ad0"
        emissiveIntensity={0.55}
      />
    </mesh>
  )
}
