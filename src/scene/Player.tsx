// src/scene/Player.tsx
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls, PointerLockControls, Outlines } from '@react-three/drei'
import * as THREE from 'three'
import { toonGradient } from './shared/toonGradient'
import { usePlayerStore } from '../game/store/playerStore'
import { isBlocked } from './salon/salonCollision'
import { npcPositions } from './salon/npcRegistry'

const SPEED = 3
const CAM_BACK = 1.2  // metres derriere le garçon
const CAM_UP = 1.3    // hauteur camera

export function Player() {
  const boyRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const [, getKeys] = useKeyboardControls()
  const setPosition = usePlayerStore(s => s.setPosition)
  const setLastMoveTime = usePlayerStore(s => s.setLastMoveTime)
  const setHidden = usePlayerStore(s => s.setHidden)

  const boyPos = useRef(new THREE.Vector3(0, 0, 3))
  const direction = useRef(new THREE.Vector3())
  const frontVector = useRef(new THREE.Vector3())
  const sideVector = useRef(new THREE.Vector3())
  const camDir = useRef(new THREE.Vector3())
  const prevHide = useRef(false)

  useFrame((_, delta) => {
    const { forward, backward, left, right, hide } = getKeys()

    // addVectors (pas subVectors) + (right-left) = strafing correct
    frontVector.current.set(0, 0, Number(backward) - Number(forward))
    sideVector.current.set(Number(right) - Number(left), 0, 0)

    direction.current
      .addVectors(frontVector.current, sideVector.current)
      .normalize()
      .multiplyScalar(SPEED * delta)
      .applyEuler(camera.rotation)

    direction.current.y = 0

    const moving = direction.current.lengthSq() > 0.00001

    if (moving) {
      const nx = boyPos.current.x + direction.current.x
      const nz = boyPos.current.z + direction.current.z

      if (!isBlocked(nx, boyPos.current.z)) boyPos.current.x = nx
      if (!isBlocked(boyPos.current.x, nz)) boyPos.current.z = nz

      // Garçon tourne vers direction de déplacement
      if (boyRef.current) {
        boyRef.current.rotation.y = Math.atan2(direction.current.x, direction.current.z)
      }

      setLastMoveTime(Date.now())
      setPosition([boyPos.current.x, boyPos.current.y, boyPos.current.z])
    }

    // Sync position mesh
    if (boyRef.current) {
      boyRef.current.position.copy(boyPos.current)
    }

    // Collision NPC : repousser le garçon si trop proche
    const NPC_RADIUS = 0.45
    for (const [nx, nz] of npcPositions.values()) {
      const dx = boyPos.current.x - nx
      const dz = boyPos.current.z - nz
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist < NPC_RADIUS && dist > 0.001) {
        const inv = NPC_RADIUS / dist
        boyPos.current.x = nx + dx * inv
        boyPos.current.z = nz + dz * inv
      }
    }

    // Caméra suit derrière le garçon (basée sur direction caméra horizontale)
    camera.getWorldDirection(camDir.current)
    camDir.current.y = 0
    if (camDir.current.lengthSq() > 0.001) camDir.current.normalize()

    camera.position.x = boyPos.current.x - camDir.current.x * CAM_BACK
    camera.position.y = CAM_UP
    camera.position.z = boyPos.current.z - camDir.current.z * CAM_BACK

    if (hide !== prevHide.current) {
      prevHide.current = hide
      setHidden(hide)
    }
  })

  return (
    <>
      <PointerLockControls />
      <group ref={boyRef}>
        {/* Corps */}
        <mesh position={[0, 0.6, 0]}>
          <capsuleGeometry args={[0.18, 0.7, 4, 8]} />
          <meshToonMaterial color="#8B5E3C" gradientMap={toonGradient} />
          <Outlines thickness={0.032} color="black" />
        </mesh>
        {/* Tête */}
        <mesh position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.13, 8, 8]} />
          <meshToonMaterial color="#c8956c" gradientMap={toonGradient} />
          <Outlines thickness={0.032} color="black" />
        </mesh>
      </group>
    </>
  )
}
