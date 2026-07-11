import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { shouldTurnTowardPlayer } from '../../game/systems/npcSystem'
import { SEATED_Y } from './chairConfig'

const MODEL_URL = '/models/characters/mama.glb'

// chair-1 (nord table) — assise face au centre de la pièce (sud)
const POSITION: [number, number, number] = [-3.05, SEATED_Y, 1.60]
const ROTATION_Y = Math.PI   // mixamorig face +Z par défaut → PI = face sud

const CLIP_IDLE = 'sitting-idle-1'

export function Mama() {
  const groupRef = useRef<THREE.Group>(null)
  const headBoneRef = useRef<THREE.Object3D | null>(null)
  const { camera } = useThree()
  const dirRef = useRef(new THREE.Vector3())

  const { scene, animations } = useGLTF(MODEL_URL)
  const { actions, names } = useAnimations(animations, groupRef)

  useEffect(() => {
    scene.traverse(obj => {
      if (!(obj as THREE.Mesh).isMesh) return
      const mesh = obj as THREE.Mesh
      const old = mesh.material as THREE.MeshStandardMaterial
      mesh.material = new THREE.MeshToonMaterial({
        map: old.map ?? null,
        color: old.map ? '#ffffff' : '#c68642',
        gradientMap: toonGradient,
      })
      mesh.frustumCulled = false
    })
    headBoneRef.current =
      scene.getObjectByName('mixamorigHead') ??
      scene.getObjectByName('mixamorig:Head') ??
      null
  }, [scene])

  useEffect(() => {
    const action = actions[CLIP_IDLE] ?? actions[names[0]]
    action?.reset().setLoop(THREE.LoopRepeat, Infinity).play()
    return () => { action?.stop() }
  }, [actions, names])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    const head = headBoneRef.current
    if (!head) return
    const pos = group.position
    const npcPos: [number, number, number] = [pos.x, pos.y, pos.z]
    const playerPos: [number, number, number] = [
      camera.position.x, camera.position.y, camera.position.z,
    ]
    if (shouldTurnTowardPlayer(npcPos, playerPos, 3)) {
      dirRef.current.set(playerPos[0] - pos.x, 0, playerPos[2] - pos.z).normalize()
      const worldYaw = Math.atan2(dirRef.current.x, dirRef.current.z)
      const localYaw = THREE.MathUtils.clamp(worldYaw - ROTATION_Y, -0.6, 0.6)
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, localYaw, delta * 4)
    }
  })

  return (
    <group ref={groupRef} position={POSITION}>
      <primitive object={scene} rotation={[0, ROTATION_Y, 0]} />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
