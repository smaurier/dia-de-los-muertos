// src/scene/shared/PorteAnimee.tsx
// Interactive door: reads its state from doorStore and animates rotation around
// the hinge (lerp). Closed by default; opens/closes via toggleDoor (F key).
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
  color?: string
  panelColor?: string
}

export function PorteAnimee({ id, position, rotationY = 0, openAngle, width, height, color, panelColor }: PorteAnimeeProps) {
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
        <Porte position={[0, 0, 0]} width={width} height={height} color={color} panelColor={panelColor} />
      </group>
    </group>
  )
}
