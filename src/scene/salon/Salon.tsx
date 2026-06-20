// src/scene/salon/Salon.tsx
import { useRef } from 'react'
import * as THREE from 'three'
import { SalonRoom } from './SalonRoom'
import { GrandUncle } from './GrandUncle'

export function Salon() {
  const grandUncleRef = useRef<THREE.Group>(null)

  return (
    <group>
      <SalonRoom />
      <GrandUncle meshRef={grandUncleRef} />
    </group>
  )
}
