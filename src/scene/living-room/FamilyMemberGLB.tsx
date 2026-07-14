// src/scene/living-room/FamilyMemberGLB.tsx
// GLB-based NPC renderer. Used by FamilyMember when config.modelUrl is set.
import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { toonGradient } from '../shared/toonGradient'
import { shouldTurnTowardPlayer } from '../../game/systems/npcSystem'
import type { NPCConfig } from '../../game/systems/npcSystem'

interface Props { config: NPCConfig }

function applyToon(scene: THREE.Object3D, meshColor: string) {
  scene.traverse(obj => {
    if (!(obj as THREE.Mesh).isMesh) return
    const mesh = obj as THREE.Mesh
    // Handle both single material and material array
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mesh.material = mats.map(m => {
      const std = m as THREE.MeshStandardMaterial
      return new THREE.MeshToonMaterial({
        map:         std.map ?? null,
        color:       std.map ? '#ffffff' : meshColor,
        gradientMap: toonGradient,
      })
    })
    if ((mesh.material as THREE.Material[]).length === 1) {
      mesh.material = (mesh.material as THREE.Material[])[0]
    }
    mesh.frustumCulled = false // skinned: bounding spheres cull incorrectly
    mesh.geometry.computeVertexNormals()
  })
}

export function FamilyMemberGLB({ config }: Props) {
  const groupRef    = useRef<THREE.Group>(null)
  const headBoneRef = useRef<THREE.Object3D | null>(null)
  const { camera }  = useThree()
  const dirRef      = useRef(new THREE.Vector3())

  const { scene: originalScene, animations } = useGLTF(config.modelUrl!)
  // Clone per instance so shared GLBs (base-01 used by 3 NPCs) don't share the same scene graph
  const clonedScene = useMemo(() => SkeletonUtils.clone(originalScene), [originalScene])

  // Bind the mixer to the cloned hierarchy (which already holds every bone),
  // NOT the outer group. Binding to the group races the primitive mount:
  // three resolves PropertyBindings lazily on first play() and caches a failed
  // bind if the bones aren't mounted yet → intermittent T-pose. clonedScene is
  // stable (useMemo) and always contains the bones. (drei-recommended root.)
  const { actions, names } = useAnimations(animations, clonedScene)

  useEffect(() => {
    applyToon(clonedScene, config.meshColor)

    const boneName = config.headBoneName ?? 'mixamorigHead'
    headBoneRef.current =
      clonedScene.getObjectByName(boneName) ??
      clonedScene.getObjectByName('mixamorig:Head') ??
      null
  }, [clonedScene, config.meshColor, config.headBoneName])

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
      <primitive object={clonedScene} rotation={[0, rotY, 0]} scale={100} />
    </group>
  )
}
