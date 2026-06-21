// src/scene/salon/GrandUncle.tsx
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { useGameStore } from '../../game/store/gameStore'
import { useSubtitleStore } from '../../game/store/subtitleStore'
import { npcPositions } from './npcRegistry'
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

  const showSubtitle = useSubtitleStore(s => s.showSubtitle)
  const scenarioTimer = useRef(0)
  const currentScenario = useRef<Scenario>(GRAND_UNCLE_SCENARIOS[0])
  const seedRef = useRef(Math.floor(Math.random() * 1000))
  const durationRef = useRef(0)
  const dirRef = useRef(new THREE.Vector3())

  useEffect(() => {
    currentScenario.current = pickScenario(GRAND_UNCLE_SCENARIOS, seedRef.current)
    const [min, max] = currentScenario.current.duration
    durationRef.current = min + Math.random() * (max - min)
  }, [])

  useFrame((_, delta) => {
    const group = ref.current
    if (!group) return

    npcPositions.set('grand-uncle', [group.position.x, group.position.z])

    // Head turn toward player when nearby
    const playerPos: [number, number, number] = [camera.position.x, camera.position.y, camera.position.z]
    const pos = group.position
    const npcPos: [number, number, number] = [pos.x, pos.y, pos.z]

    if (headRef.current && shouldTurnTowardPlayer(npcPos, playerPos, 3)) {
      dirRef.current.set(playerPos[0] - pos.x, 0, playerPos[2] - pos.z).normalize()
      headRef.current.rotation.y = Math.atan2(dirRef.current.x, dirRef.current.z)
    } else if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y, 0, delta * 2
      )
    }

    // Scenario timer
    scenarioTimer.current += delta

    if (scenarioTimer.current > durationRef.current) {
      scenarioTimer.current = 0
      seedRef.current = (seedRef.current + 1337) % 10000
      currentScenario.current = pickScenario(GRAND_UNCLE_SCENARIOS, seedRef.current)
      const [min, max] = currentScenario.current.duration
      durationRef.current = min + Math.random() * (max - min)

      if (currentScenario.current.id === 'laugh_at_tv') {
        showSubtitle('¡Ja ja ja!', 'Tío Abuelo')
      }
    }
  })

  const worldPos = GRAND_UNCLE_POSITIONS[grandUnclePosition]

  // Tío Abuelo : guayabera ivoire, pantalon gris-bleu, quelques cheveux gris (vieil homme)
  // bodyY=0.875, headY=1.75, headR=0.18, capsuleR=0.25
  const pantsH  = 0.835  // 0.875 - 0.04
  const pantsY  = 0.44
  const shirtH  = 0.76   // 1.75 - 0.18*0.6 - 0.875
  const shirtY  = 1.255

  return (
    <group ref={ref} position={worldPos}>
      {/* Pantalon gris-bleu */}
      <mesh position={[0, pantsY, 0]}>
        <cylinderGeometry args={[0.25, 0.25, pantsH, 8]} />
        <meshToonMaterial color="#3A4A5C" gradientMap={toonGradient} />
        <Outlines thickness={0.030} color="black" />
      </mesh>
      {/* Guayabera ivoire — chemise typique du grand-oncle mexicain */}
      <mesh position={[0, shirtY, 0]}>
        <cylinderGeometry args={[0.26, 0.25, shirtH, 8]} />
        <meshToonMaterial color="#EDE8DE" gradientMap={toonGradient} />
        <Outlines thickness={0.030} color="black" />
      </mesh>
      {/* Tête */}
      <mesh ref={headRef} position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshToonMaterial color="#c8956c" gradientMap={toonGradient} />
        <Outlines thickness={0.035} color="black" />
      </mesh>
      {/* Cheveux gris clairsemés — calotte partielle */}
      <mesh position={[0, 1.768, 0]}>
        <sphereGeometry args={[0.192, 8, 3, 0, Math.PI * 2, 0, Math.PI * 0.38]} />
        <meshToonMaterial color="#C0BCBA" gradientMap={toonGradient} />
      </mesh>
    </group>
  )
}
