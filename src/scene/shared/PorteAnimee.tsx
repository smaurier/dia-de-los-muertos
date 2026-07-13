// src/scene/shared/PorteAnimee.tsx
// Porte interactive : lit son état dans doorStore et anime la rotation autour
// du gond (lerp). Fermée par défaut ; s'ouvre/referme via toggleDoor (touche F).
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Porte } from './Porte'
import { useDoorStore } from '../../game/store/doorStore'

type PorteAnimeeProps = {
  id: string
  position: [number, number, number]
  rotationY?: number
  openAngle: number
  width?: number
  height?: number
}

export function PorteAnimee({ id, position, rotationY = 0, openAngle, width, height }: PorteAnimeeProps) {
  const hingeRef = useRef<THREE.Group>(null)
  const isOpen = useDoorStore(s => !!s.open[id])

  useFrame((_, delta) => {
    if (!hingeRef.current) return
    const target = isOpen ? openAngle : 0
    hingeRef.current.rotation.y = THREE.MathUtils.lerp(
      hingeRef.current.rotation.y, target, delta * 5,
    )
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group ref={hingeRef}>
        <Porte position={[0, 0, 0]} width={width} height={height} />
      </group>
    </group>
  )
}
