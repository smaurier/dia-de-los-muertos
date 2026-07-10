// src/scene/salon/GrandUncle.tsx
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { useGameStore } from '../../game/store/gameStore'
import { useSubtitleStore } from '../../game/store/subtitleStore'
import { npcPositions } from './npcRegistry'
import { shouldTurnTowardPlayer, pickScenario } from '../../game/systems/npcSystem'
import type { Scenario } from '../../game/systems/npcSystem'

const GRAND_UNCLE_POSITIONS: Record<string, [number, number, number]> = {
  couch: [5, 0, 2.5],
  buffet: [-6, 0, -2.5],
  window: [-6, 0, 2],
}

// Modèle 3D (pipeline Hunyuan3D → Mixamo). Mesh sans UV → couleur unie toon.
// TODO : clip standing pour les positions buffet/window (sitting partout en attendant).
const MODEL_URL = '/models/characters/grand-oncle.glb'
const MODEL_TUNING = {
  scale: 1,                                         // échelle native OK (1.83m debout)
  offset: [0, 0, 0.62] as [number, number, number], // hanches sur l'avant de l'assise, pieds au sol devant
  rotationY: 0,                                     // face au repose-pied (sud)
  color: '#EDE8DE',                                 // guayabera ivoire (une seule couleur, pas d'UV)
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
  const headBoneRef = useRef<THREE.Object3D | null>(null)
  const grandUnclePosition = useGameStore(s => s.grandUnclePosition)
  const { camera } = useThree()

  const { scene, animations } = useGLTF(MODEL_URL)
  const { actions, names } = useAnimations(animations, ref)

  // Matériau toon uni sur tout le mesh (pas d'UV → pas de texture) + repère le bone tête
  useEffect(() => {
    scene.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        mesh.material = new THREE.MeshToonMaterial({ color: MODEL_TUNING.color, gradientMap: toonGradient })
        mesh.frustumCulled = false // skinned mesh : bounds de repos faux une fois assis
      }
    })
    headBoneRef.current = scene.getObjectByName('mixamorigHead') ?? null
  }, [scene])

  // Sitting idle en boucle
  useEffect(() => {
    const action = actions[names[0]]
    action?.reset().setLoop(THREE.LoopRepeat, Infinity).play()
    return () => { action?.stop() }
  }, [actions, names])

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

    // Head turn toward player when nearby — appliqué sur le bone tête, après le mixer
    const playerPos: [number, number, number] = [camera.position.x, camera.position.y, camera.position.z]
    const pos = group.position
    const npcPos: [number, number, number] = [pos.x, pos.y, pos.z]

    const head = headBoneRef.current
    if (head && shouldTurnTowardPlayer(npcPos, playerPos, 3)) {
      dirRef.current.set(playerPos[0] - pos.x, 0, playerPos[2] - pos.z).normalize()
      const worldYaw = Math.atan2(dirRef.current.x, dirRef.current.z)
      const localYaw = THREE.MathUtils.clamp(worldYaw - MODEL_TUNING.rotationY, -0.6, 0.6)
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, localYaw, delta * 4)
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

  return (
    <group ref={ref} position={worldPos}>
      <primitive
        object={scene}
        position={MODEL_TUNING.offset}
        rotation={[0, MODEL_TUNING.rotationY, 0]}
        scale={MODEL_TUNING.scale}
      />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
