import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { shouldTurnTowardPlayer } from '../../game/systems/npcSystem'
import { MAMA_URL } from '../assets/manifest'
// SEATED_Y not used here: the animated mama.glb model manages its own height

// chair-1 (north table) — seated facing room center (south)
// y=0: sitting-idle animation places hips at y≈0.4 local → floor visible, not below tiles
const POSITION: [number, number, number] = [-3.05, 0, 2.60]
const ROTATION_Y = Math.PI   // mixamorig faces +Z by default → PI = facing south

const CLIP_IDLE = 'sitting-idle-1'

export function Mama() {
  const groupRef = useRef<THREE.Group>(null)
  const headBoneRef = useRef<THREE.Object3D | null>(null)
  const skirtBonesRef = useRef<THREE.Bone[]>([])
  const { camera } = useThree()
  const dirRef = useRef(new THREE.Vector3())

  const { scene, animations } = useGLTF(MAMA_URL)
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
      mesh.frustumCulled = false // skinned: bounding spheres cull incorrectly
    })
    headBoneRef.current =
      scene.getObjectByName('mixamorigHead') ??
      scene.getObjectByName('mixamorig:Head') ??
      null

    // Find skirt bones for spring simulation
    const SKIRT_NAMES = ['SkirtFront', 'SkirtBack', 'SkirtLeft', 'SkirtRight']
    skirtBonesRef.current = []
    scene.traverse(obj => {
      if (SKIRT_NAMES.includes(obj.name)) {
        skirtBonesRef.current.push(obj as THREE.Bone)
      }
    })
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

    // Skirt spring simulation: counteract Hips rotation toward gravity
    const STIFFNESS = 0.10
    const worldDown = new THREE.Vector3(0, -1, 0)
    for (const bone of skirtBonesRef.current) {
      if (!bone.parent) continue
      bone.parent.updateMatrixWorld(true)
      const parentInvMatrix = new THREE.Matrix4().copy(bone.parent.matrixWorld).invert()
      // Express world-down in the bone's parent local space
      const localDown = worldDown.clone().transformDirection(parentInvMatrix).normalize()
      // The bone should point toward localDown ("down" direction in parent space)
      // Current bone rotation = identity at rest (points toward local -Y)
      const restDir = new THREE.Vector3(0, -1, 0)
      const targetQuat = new THREE.Quaternion().setFromUnitVectors(restDir, localDown)
      bone.quaternion.slerp(targetQuat, STIFFNESS)
    }
  })

  return (
    <group ref={groupRef} position={POSITION}>
      <primitive object={scene} rotation={[0, ROTATION_Y, 0]} />
    </group>
  )
}

useGLTF.preload(MAMA_URL)
