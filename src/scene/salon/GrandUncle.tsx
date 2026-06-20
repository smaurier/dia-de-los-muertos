// src/scene/salon/GrandUncle.tsx
import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { toonGradient } from '../shared/toonGradient'
import { useGameStore } from '../../game/store/gameStore'
import { shouldTurnTowardPlayer, pickScenario } from '../../game/systems/npcSystem'
import type { Scenario } from '../../game/systems/npcSystem'

const GRAND_UNCLE_POSITIONS: Record<string, [number, number, number]> = {
  couch:  [5, 0, 2.5],
  buffet: [-6, 0, -2.5],
  window: [-6, 0, 2],
}

const GRAND_UNCLE_SCENARIOS: Scenario[] = [
  {
    id: 'watch_tv', weight: 5, duration: [10, 20],
    steps: [{ type: 'idle', duration: 12 }],
  },
  {
    id: 'laugh_at_tv', weight: 2, duration: [3, 5],
    steps: [
      { type: 'idle', duration: 1 },
      { type: 'dialogue', text: '¡Ja ja ja!', speakerName: 'Tío Abuelo' },
      { type: 'idle', duration: 2 },
    ],
  },
  {
    id: 'adjust_on_couch', weight: 2, duration: [4, 6],
    steps: [{ type: 'idle', duration: 4 }],
  },
  {
    id: 'look_around', weight: 1, duration: [3, 5],
    steps: [{ type: 'react_to_player' }, { type: 'idle', duration: 3 }],
  },
]

interface GrandUncleProps {
  meshRef?: React.RefObject<THREE.Group | null>
}

export function GrandUncle({ meshRef }: GrandUncleProps) {
  const internalRef = useRef<THREE.Group>(null)
  const ref = meshRef ?? internalRef
  const headRef = useRef<THREE.Mesh>(null)
  const grandUnclePosition = useGameStore(s => s.grandUnclePosition)
  const { camera } = useThree()

  const [subtitle, setSubtitle] = useState<string | null>(null)
  const scenarioTimer = useRef(0)
  const currentScenario = useRef<Scenario>(GRAND_UNCLE_SCENARIOS[0])
  const seedRef = useRef(Math.floor(Math.random() * 1000))

  useEffect(() => {
    currentScenario.current = pickScenario(GRAND_UNCLE_SCENARIOS, seedRef.current)
  }, [])

  useFrame((_, delta) => {
    const group = ref.current
    if (!group) return

    // Head turn toward player when nearby
    const playerPos: [number, number, number] = [camera.position.x, camera.position.y, camera.position.z]
    const pos = group.position
    const npcPos: [number, number, number] = [pos.x, pos.y, pos.z]

    if (headRef.current && shouldTurnTowardPlayer(npcPos, playerPos, 3)) {
      const dir = new THREE.Vector3(
        playerPos[0] - pos.x, 0, playerPos[2] - pos.z
      ).normalize()
      headRef.current.rotation.y = Math.atan2(dir.x, dir.z)
    } else if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y, 0, delta * 2
      )
    }

    // Scenario timer
    scenarioTimer.current += delta
    const [min, max] = currentScenario.current.duration
    const duration = min + Math.random() * (max - min)

    if (scenarioTimer.current > duration) {
      scenarioTimer.current = 0
      seedRef.current = (seedRef.current + 1337) % 10000
      currentScenario.current = pickScenario(GRAND_UNCLE_SCENARIOS, seedRef.current)

      if (currentScenario.current.id === 'laugh_at_tv') {
        setSubtitle('¡Ja ja ja!')
        setTimeout(() => setSubtitle(null), 2500)
      }
    }
  })

  const worldPos = GRAND_UNCLE_POSITIONS[grandUnclePosition]

  return (
    <group ref={ref} position={worldPos}>
      {/* Corps */}
      <mesh position={[0, 0.875, 0]}>
        <capsuleGeometry args={[0.25, 1.25, 4, 8]} />
        <meshToonMaterial color="#2a1a0e" gradientMap={toonGradient} />
      </mesh>
      {/* Tête */}
      <mesh ref={headRef} position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshToonMaterial color="#c8956c" gradientMap={toonGradient} />
      </mesh>
      {/* Sous-titre */}
      {subtitle && (
        <Html position={[0, 2.2, 0]} center distanceFactor={6}>
          <div style={{
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '13px',
            whiteSpace: 'nowrap',
            fontFamily: 'sans-serif',
          }}>
            <span style={{ color: '#f5c87a', fontWeight: 'bold' }}>Tío Abuelo</span>
            {' '}{subtitle}
          </div>
        </Html>
      )}
    </group>
  )
}
