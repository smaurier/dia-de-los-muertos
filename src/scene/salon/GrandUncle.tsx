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
  couch: [-2.62, 0, -3.7],  // fond de l'assise, interpolé avec le recul du canapé (+0.2)
  buffet: [3.2, 0, 4.6],    // buffet au mur nord
  window: [-6, 0, 2],
}

// Modèle 3D v2 (Hunyuan texturé + visage projeté + moustache 3D → Mixamo).
// Origine aux pieds, 1,75 m, texture 2048 embarquée. 7 clips : sitting-idle,
// sit-to-stand, stand-to-sit, sitting-clap, sitting-disbelief, standing-idle,
// happy-walk (in-place).
const MODEL_URL = '/models/characters/grand-oncle.glb'
const CLIP_SIT = 'sitting-idle'
const MODEL_TUNING = {
  scale: 1,                                        // normalisé au merge (1,75 m)
  offset: [0.08, 0, 0] as [number, number, number], // hanches sur le coussin, chaussures devant la base (dossier à l'est)
  rotationY: -Math.PI / 2,                          // face à la TV (ouest) — le modèle regarde +z par défaut
  color: '#EDE8DE',                                 // repli si un mesh n'a pas de texture
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

  // Matériaux toon : texture du GLB quand elle existe (corps), couleur du
  // matériau source sinon (moustache 3D) + repère le bone tête
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
        mesh.frustumCulled = false // skinned mesh : bounds de repos faux une fois assis
      }
    })
    headBoneRef.current =
      scene.getObjectByName('mixamorigHead') ??
      scene.getObjectByName('mixamorig:Head') ??
      null
  }, [scene])

  // Sitting idle en boucle (par NOM — names[0] est alphabétique, plus fiable)
  useEffect(() => {
    const action = actions[CLIP_SIT] ?? actions[names[0]]
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
