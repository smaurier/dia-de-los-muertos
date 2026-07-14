// src/scene/salon/Chien.tsx
// Chiot stylisé (Sketchfab) — 5 clips : IdleLayDown / IdleEnergetic / Walk / Run / TPOSE.
// Phase salon sandbox : couché à côté de la table côté TV, head-look passif.

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'

const MODEL_URL = '/models/characters/chien-puppy2.glb?v=3'

const POSITION: [number, number, number] = [3.5, 0, -3.8]
const ROTATION_Y = Math.PI * 0.75
const SCALE = 1.6   // 1.0 = chiot (0.37m), 1.6 = chien moyen, 2.2 = grand chien

const CLIP_IDLE = 'Armature|PuppyALL_IdleLayDown'
const HEAD_BONE = 'Bip01_Head'

export function Chien() {
  const groupRef = useRef<THREE.Group>(null)
  const neckBoneRef = useRef<THREE.Object3D | null>(null)
  const { camera } = useThree()

  const { scene, animations } = useGLTF(MODEL_URL)
  const { actions, names } = useAnimations(animations, groupRef)

  useEffect(() => {
    scene.traverse(obj => {
      if (!(obj as THREE.Mesh).isMesh) return
      const mesh = obj as THREE.Mesh
      const old = mesh.material as THREE.MeshStandardMaterial
      mesh.material = new THREE.MeshToonMaterial({
        map: old.map ?? null,
        color: old.map ? '#ffffff' : '#C4824A',
        gradientMap: toonGradient,
      })
      mesh.geometry.computeBoundingSphere()
      if (mesh.geometry.boundingSphere) mesh.geometry.boundingSphere.radius *= 2.5
      mesh.frustumCulled = true // sphère réelle élargie : cull sans disparitions
      mesh.geometry.computeVertexNormals()
    })
    neckBoneRef.current = scene.getObjectByName(HEAD_BONE) ?? null
  }, [scene])

  useEffect(() => {
    const action = actions[CLIP_IDLE] ?? actions[names[0]]
    action?.reset().setLoop(THREE.LoopRepeat, Infinity).play()
    return () => { action?.stop() }
  }, [actions, names])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    // Regard passif vers la caméra si proche (<4 m)
    const bone = neckBoneRef.current
    if (!bone) return
    const dx = camera.position.x - group.position.x
    const dz = camera.position.z - group.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist < 4) {
      const worldYaw = Math.atan2(dx, dz)
      const localYaw = THREE.MathUtils.clamp(worldYaw - ROTATION_Y, -0.5, 0.5)
      bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, localYaw, delta * 2)
    } else {
      bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, 0, delta * 1.5)
    }
  })

  return (
    <group ref={groupRef} position={POSITION} rotation={[0, ROTATION_Y, 0]} scale={SCALE}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
