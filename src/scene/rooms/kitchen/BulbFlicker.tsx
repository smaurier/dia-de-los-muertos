// src/scene/rooms/kitchen/BulbFlicker.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { toonGradient } from '../../shared/toonGradient'

// Bare bulb that FLICKERS (kitchen sheet: narrative prop — a permanent
// micro-tension, "because it's old"). A brief random dip every 6-14 s,
// otherwise full intensity.
export function BulbFlicker() {
  const matRef = useRef<THREE.MeshToonMaterial>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const t = useRef(0)
  const nextDip = useRef(6 + Math.random() * 8)
  const dipEnd = useRef(0)
  useFrame((_, delta) => {
    t.current += delta
    if (t.current > nextDip.current) {
      dipEnd.current = t.current + 0.12 + Math.random() * 0.2
      nextDip.current = t.current + 6 + Math.random() * 8
    }
    const dipping = t.current < dipEnd.current
    const k = dipping ? 0.25 + Math.random() * 0.2 : 1
    if (lightRef.current) lightRef.current.intensity = 3.2 * k
    if (matRef.current) matRef.current.emissiveIntensity = 3.0 * k
  })
  return (
    <group position={[-3.8, 0, 8.9]}>
      <mesh position={[0, 2.74, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.44, 5]} />
        <meshToonMaterial color="#1A1010" gradientMap={toonGradient} />
      </mesh>
      <mesh position={[0, 2.51, 0]}>
        <cylinderGeometry args={[0.022, 0.018, 0.058, 8]} />
        <meshToonMaterial color="#B0A080" gradientMap={toonGradient} />
      </mesh>
      <mesh position={[0, 2.46, 0]}>
        <sphereGeometry args={[0.050, 10, 10]} />
        <meshToonMaterial ref={matRef} color="#F8E8A0" gradientMap={toonGradient} emissive="#F5D040" emissiveIntensity={3.0} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 2.40, 0]} intensity={3.2} color="#f5b060" distance={5.5} decay={2} />
    </group>
  )
}
