// src/scene/salon/Chien.tsx
// Chien bâtard — asset Sketchfab low-poly, 6 clips (iddle/walk/run/walksent/jump/attack1).
// Phase salon sandbox : idle sous la table côté TV, head-look vers Aurelio (DEF-spine.011).

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'

const MODEL_URL = '/models/characters/chien.glb'

// À côté de la table (côté TV, extrémité nord-est) — visible, pas sous la nappe
const POSITION: [number, number, number] = [3.5, 0, -3.8]
const ROTATION_Y = Math.PI * 0.75   // orienté vers la pièce

const CLIP_IDLE = 'walksent'  // reniflage en marchant = plus vivant qu'iddle statique

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
      mesh.frustumCulled = false
    })
    // DEF-spine.011 = bout de chaîne dorsale → cou/tête chez ce quadrupède
    neckBoneRef.current = scene.getObjectByName('DEF-spine.011') ?? null
  }, [scene])

  useEffect(() => {
    const action = actions[CLIP_IDLE] ?? actions[names[0]]
    action?.reset().setLoop(THREE.LoopRepeat, Infinity).play()
    return () => { action?.stop() }
  }, [actions, names])

  useFrame((_, delta) => {
    const bone = neckBoneRef.current
    if (!bone) return
    const group = groupRef.current
    if (!group) return

    // Regard passif vers la caméra si proche (<4 m)
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
    <group ref={groupRef} position={POSITION} rotation={[0, ROTATION_Y, 0]}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
