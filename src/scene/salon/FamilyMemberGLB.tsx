// src/scene/salon/FamilyMemberGLB.tsx
// GLB-based NPC renderer. Used by FamilyMember when config.modelUrl is set.
// No movement logic: GLB characters use idle animation only until animations are wired.
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { shouldTurnTowardPlayer } from '../../game/systems/npcSystem'
import type { NPCConfig } from '../../game/systems/npcSystem'

interface Props { config: NPCConfig }

export function FamilyMemberGLB({ config }: Props) {
  const groupRef  = useRef<THREE.Group>(null)
  const headBoneRef = useRef<THREE.Object3D | null>(null)
  const { camera } = useThree()
  const dirRef = useRef(new THREE.Vector3())

  const { scene, animations } = useGLTF(config.modelUrl!)
  const { actions, names }    = useAnimations(animations, groupRef)

  useEffect(() => {
    scene.traverse(obj => {
      if (!(obj as THREE.Mesh).isMesh) return
      const mesh = obj as THREE.Mesh
      const old = mesh.material as THREE.MeshStandardMaterial
      mesh.material = new THREE.MeshToonMaterial({
        map:         old.map ?? null,
        color:       old.map ? '#ffffff' : config.meshColor,
        gradientMap: toonGradient,
      })
      mesh.frustumCulled = false
      mesh.geometry.computeVertexNormals()
    })

    const boneName = config.headBoneName ?? 'mixamorigHead'
    headBoneRef.current =
      scene.getObjectByName(boneName) ??
      scene.getObjectByName('mixamorig:Head') ??
      null
  }, [scene, config.meshColor, config.headBoneName])

  useEffect(() => {
    const clip   = config.clipIdle ?? names[0]
    const action = (clip ? actions[clip] : null) ?? actions[names[0]]
    action?.reset().setLoop(THREE.LoopRepeat, Infinity).play()
    return () => { action?.stop() }
  }, [actions, names, config.clipIdle])

  const rotY = config.rotationY ?? 0

  useFrame((_, delta) => {
    const group = groupRef.current
    const head  = headBoneRef.current
    if (!group || !head) return
    const pos = group.position
    const npcPos: [number, number, number]    = [pos.x, pos.y, pos.z]
    const playerPos: [number, number, number] = [camera.position.x, camera.position.y, camera.position.z]
    if (shouldTurnTowardPlayer(npcPos, playerPos, 3)) {
      dirRef.current.set(playerPos[0] - pos.x, 0, playerPos[2] - pos.z).normalize()
      const worldYaw = Math.atan2(dirRef.current.x, dirRef.current.z)
      const localYaw = THREE.MathUtils.clamp(worldYaw - rotY, -0.6, 0.6)
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, localYaw, delta * 4)
    }
  })

  return (
    <group ref={groupRef} position={config.startPosition}>
      <primitive object={scene} rotation={[0, rotY, 0]} />
    </group>
  )
}
