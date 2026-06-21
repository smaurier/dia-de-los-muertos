// src/scene/salon/FamilyMember.tsx
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { useSubtitleStore } from '../../game/store/subtitleStore'
import { isBlocked } from './salonCollision'
import { npcPositions } from './npcRegistry'
import {
  pickScenario, getNextStep, shouldUpdatePosition, shouldTurnTowardPlayer
} from '../../game/systems/npcSystem'
import type { NPCConfig, NPCState } from '../../game/systems/npcSystem'

interface FamilyMemberProps {
  config: NPCConfig
}

export function FamilyMember({ config }: FamilyMemberProps) {
  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  const showSubtitle = useSubtitleStore(s => s.showSubtitle)
  const npcState = useRef<NPCState>('idle')
  const targetPos = useRef<THREE.Vector3 | null>(null)
  const scenarioTimer = useRef(Math.random() * 5)
  const stepIndex = useRef(0)
  const seedRef = useRef(Math.floor(Math.random() * 10000))
  const currentScenario = useRef(
    config.scenarios.length > 0
      ? pickScenario(config.scenarios, seedRef.current)
      : null
  )
  const dirRef = useRef(new THREE.Vector3())
  const walkDirRef = useRef(new THREE.Vector3())

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(...config.startPosition)
    }
    npcPositions.set(config.id, [config.startPosition[0], config.startPosition[2]])
    return () => { npcPositions.delete(config.id) }
  }, [config.id, config.startPosition])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    // Tier 3 — statique, mais on enregistre la position quand même
    npcPositions.set(config.id, [group.position.x, group.position.z])
    if (config.tier === 3) return

    const playerPos: [number, number, number] = [
      camera.position.x, camera.position.y, camera.position.z
    ]
    const pos = group.position
    const npcPos: [number, number, number] = [pos.x, pos.y, pos.z]

    // Head turn (Tier 1 & 2)
    if (headRef.current && shouldTurnTowardPlayer(npcPos, playerPos, 2)) {
      dirRef.current.set(playerPos[0] - pos.x, 0, playerPos[2] - pos.z).normalize()
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        Math.atan2(dirRef.current.x, dirRef.current.z),
        delta * 3
      )
    }

    // Tier 2 — semi-actif : pas de mouvement autonome
    if (config.tier === 2 || config.scenarios.length === 0) return

    // Tier 1 — state machine + scénarios
    scenarioTimer.current += delta

    if (shouldUpdatePosition(npcState.current) && targetPos.current) {
      walkDirRef.current.copy(targetPos.current).sub(group.position)
      if (walkDirRef.current.length() < 0.1) {
        group.position.copy(targetPos.current)
        npcState.current = 'idle'
        targetPos.current = null
      } else {
        const step = walkDirRef.current.normalize().multiplyScalar(delta * 1.2)
        const nx = group.position.x + step.x
        const nz = group.position.z + step.z
        if (!isBlocked(nx, group.position.z)) group.position.x = nx
        if (!isBlocked(group.position.x, nz)) group.position.z = nz
      }
      return
    }

    if (currentScenario.current) {
      const [min, max] = currentScenario.current.duration
      const duration = min + (max - min) * 0.5

      if (scenarioTimer.current > duration) {
        scenarioTimer.current = 0
        stepIndex.current = 0
        seedRef.current = (seedRef.current * 1664525 + 1013904223) >>> 0
        currentScenario.current = pickScenario(config.scenarios, seedRef.current)
        return
      }

      const step = getNextStep(currentScenario.current, stepIndex.current)
      if (!step) return

      if (step.type === 'walk') {
        targetPos.current = new THREE.Vector3(...step.target)
        npcState.current = 'walking'
        stepIndex.current += 1
      } else if (step.type === 'idle') {
        npcState.current = 'idle'
        stepIndex.current += 1
      } else if (step.type === 'dialogue') {
        showSubtitle(step.text, step.speakerName)
        stepIndex.current += 1
      } else if (step.type === 'sit') {
        npcState.current = 'sitting'
        stepIndex.current += 1
      } else if (step.type === 'react_to_player') {
        npcState.current = 'reacting'
        stepIndex.current += 1
      }
    }
  })

  const isChild = config.tier === 1 && config.id.startsWith('enfant')
  const isBaby = config.id === 'bebe'
  const capsuleR = isBaby ? 0.12 : isChild ? 0.18 : 0.25
  const capsuleH = isBaby ? 0.2 : isChild ? 0.7 : 1.25
  const bodyY = isBaby ? 0.4 : isChild ? 0.6 : 0.875
  const headY = isBaby ? 0.55 : isChild ? 1.15 : 1.75
  const headR = capsuleR * 0.72

  return (
    <group ref={groupRef} position={config.startPosition}>
      <mesh position={[0, bodyY, 0]}>
        <capsuleGeometry args={[capsuleR, capsuleH, 4, 8]} />
        <meshToonMaterial color={config.meshColor} gradientMap={toonGradient} />
        <Outlines thickness={0.030} color="black" />
      </mesh>
      <mesh ref={headRef} position={[0, headY, 0]}>
        <sphereGeometry args={[headR, 8, 8]} />
        <meshToonMaterial color={config.meshColor} gradientMap={toonGradient} />
        <Outlines thickness={0.030} color="black" />
      </mesh>
    </group>
  )
}
