// src/scene/Player.tsx
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls, PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import { usePlayerStore } from '../game/store/playerStore'

const SPEED = 3
const CHILD_HEIGHT = 1.1

export function Player() {
  const { camera } = useThree()
  const [, getKeys] = useKeyboardControls()
  const setPosition = usePlayerStore((s) => s.setPosition)
  const setLastMoveTime = usePlayerStore((s) => s.setLastMoveTime)
  const setHidden = usePlayerStore((s) => s.setHidden)
  const direction = useRef(new THREE.Vector3())
  const frontVector = useRef(new THREE.Vector3())
  const sideVector = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const { forward, backward, left, right, hide } = getKeys()

    frontVector.current.set(0, 0, Number(backward) - Number(forward))
    sideVector.current.set(Number(right) - Number(left), 0, 0)
    direction.current
      .subVectors(frontVector.current, sideVector.current)
      .normalize()
      .multiplyScalar(SPEED * delta)
      .applyEuler(camera.rotation)

    direction.current.y = 0

    const moving = direction.current.lengthSq() > 0.00001

    if (moving) {
      camera.position.add(direction.current)
      setLastMoveTime(Date.now())
      setPosition([camera.position.x, camera.position.y, camera.position.z])
    }

    camera.position.y = CHILD_HEIGHT
    setHidden(hide)
  })

  return <PointerLockControls />
}
