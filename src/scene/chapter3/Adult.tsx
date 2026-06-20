// src/scene/chapter3/Adult.tsx
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface AdultProps {
  onNearPlayer: (near: boolean) => void
  meshRef: React.RefObject<THREE.Group | null>
}

const WALK_SPEED = 0.8
const PATH_Z = [3, 0, -3]

export function Adult({ onNearPlayer, meshRef }: AdultProps) {
  const phase = useRef<'waiting' | 'walking' | 'done'>('waiting')
  const phaseIndex = useRef(0)

  useEffect(() => {
    const t = setTimeout(() => {
      phase.current = 'walking'
    }, 2000)
    return () => clearTimeout(t)
  }, [])

  useFrame((_, delta) => {
    const group = meshRef.current
    if (!group || phase.current !== 'walking') return

    const target = PATH_Z[phaseIndex.current + 1]
    if (target === undefined) {
      phase.current = 'done'
      group.visible = false
      return
    }

    const direction = target - group.position.z
    const step = Math.sign(direction) * WALK_SPEED * delta
    group.position.z += step

    if (Math.abs(group.position.z - target) < 0.05) {
      group.position.z = target
      phaseIndex.current += 1
    }

    onNearPlayer(Math.abs(group.position.z) < 2)
  })

  return (
    <group ref={meshRef} position={[0.3, 0, 3]}>
      {/* Body — dark capsule ~1.75m */}
      <mesh position={[0, 0.875, 0]}>
        <capsuleGeometry args={[0.25, 1.25, 4, 8]} />
        <meshStandardMaterial color="#2a1a0e" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#c8956c" roughness={0.7} />
      </mesh>
    </group>
  )
}
