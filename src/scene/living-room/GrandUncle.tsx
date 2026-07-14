// src/scene/living-room/GrandUncle.tsx
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
  couch: [-2.62, 0, -3.7],  // back of seat, offset by sofa depth (+0.2)
  buffet: [3.2, 0, 4.6],    // sideboard on north wall
  window: [-6, 0, 2],
}

// 3D model v2 (Hunyuan textured + projected face + 3D moustache → Mixamo).
// Origin at feet, 1.75 m, embedded 2048 texture. 7 clips: sitting-idle,
// sit-to-stand, stand-to-sit, sitting-clap, sitting-disbelief, standing-idle,
// happy-walk (in-place).
const MODEL_URL = '/models/characters/grand-oncle.glb?v=3'
const CLIP_SIT = 'sitting-idle'
const MODEL_TUNING = {
  scale: 1,
  color: '#EDE8DE',
}

// Per-position tuning: offset, rotation, clip
const POSITION_TUNING: Record<string, {
  offset: [number, number, number]
  rotationY: number
  clip: string
}> = {
  couch:  { offset: [0.08, 0, 0], rotationY: -Math.PI / 2, clip: 'sitting-idle' },
  buffet: { offset: [0, 0, 0],    rotationY: Math.PI,       clip: 'standing-idle' },
  window: { offset: [0, 0, 0],    rotationY: Math.PI / 2,   clip: 'standing-idle' },
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
      { type: 'dialogue', text: '¡Ja ja ja!', speakerName: 'Tío Abuelo Aurelio' },
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

  // Toon materials: GLB texture when present (body), source material color
  // otherwise (3D moustache) + locate head bone
  useEffect(() => {
    scene.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        const old = mesh.material as THREE.MeshStandardMaterial
        mesh.material = new THREE.MeshToonMaterial({
          map: old.map ?? null,
          color: old.map ? '#ffffff' : (old.color ?? new THREE.Color(MODEL_TUNING.color)),
          gradientMap: toonGradient,
        })
        mesh.frustumCulled = false // skinned: bounding spheres cull incorrectly
      }
    })
    headBoneRef.current =
      scene.getObjectByName('mixamorigHead') ??
      scene.getObjectByName('mixamorig:Head') ??
      null
  }, [scene])

  // Animation by position (sitting-idle on sofa, standing-idle elsewhere)
  useEffect(() => {
    const tuning = POSITION_TUNING[grandUnclePosition]
    const clipName = tuning?.clip ?? CLIP_SIT
    // Stop all active actions before starting a new one
    Object.values(actions).forEach(a => a?.fadeOut(0.3))
    const action = actions[clipName] ?? actions[names[0]]
    action?.reset().fadeIn(0.3).setLoop(THREE.LoopRepeat, Infinity).play()
    return () => { action?.fadeOut(0.3) }
  }, [actions, names, grandUnclePosition])

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

    // Head turn toward player when nearby — applied on head bone, after mixer
    const playerPos: [number, number, number] = [camera.position.x, camera.position.y, camera.position.z]
    const pos = group.position
    const npcPos: [number, number, number] = [pos.x, pos.y, pos.z]

    const head = headBoneRef.current
    if (head && shouldTurnTowardPlayer(npcPos, playerPos, 3)) {
      dirRef.current.set(playerPos[0] - pos.x, 0, playerPos[2] - pos.z).normalize()
      const worldYaw = Math.atan2(dirRef.current.x, dirRef.current.z)
      const localYaw = THREE.MathUtils.clamp(worldYaw - POSITION_TUNING[grandUnclePosition].rotationY, -0.6, 0.6)
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
  const tuning   = POSITION_TUNING[grandUnclePosition]

  return (
    <group ref={ref} position={worldPos}>
      <primitive
        object={scene}
        position={tuning.offset}
        rotation={[0, tuning.rotationY, 0]}
        scale={MODEL_TUNING.scale}
      />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
