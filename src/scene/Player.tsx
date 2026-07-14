// src/scene/Player.tsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls, PointerLockControls, useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { toonGradient } from './shared/toonGradient'
import { makeFaceTextures } from './shared/blinkTexture'
import { advanceFace, type FaceState } from './shared/faceState'
import { usePlayerStore } from '../game/store/playerStore'
import { useDoorStore } from '../game/store/doorStore'
import { useSubtitleStore } from '../game/store/subtitleStore'
import { nearestDoorId, closedDoorObstacles } from '../game/systems/doorSystem'
import { resolvePlayerNpcCollision } from '../game/systems/npcSystem'
import { canMove, cameraBackDistance, clampCameraToRoom, LIVING_ROOM_BOUNDS } from './living-room/livingRoomCollision'
import { DOORS, DOOR_INTERACT_DIST } from './living-room/doorConfig'
import { npcPositions } from './living-room/npcRegistry'

const SPEED = 3
const CAM_BACK = 1.2      // metres behind the boy
const CAM_UP = 1.3        // camera height
const BOY_HIDE_DIST = 0.35 // camera too close → hide boy mesh

// Textured hero (Hunyuan → Mixamo pipeline, 5 clips).
const HERO_URL = '/models/characters/heros.glb?v=3'
const HERO_HEIGHT = 1.15  // child ~1.15 m (model comes out at ~2 m)
// Clips per state; crossfade smooths transitions.
const CLIP_IDLE = 'standing-idle'
const CLIP_WALK = 'walking'
const CLIP_HIDE = 'crouching-idle'
const FADE = 0.22

// Blink: painted-eyelid texture variant generated in memory from the GLB
// texture (no blendshapes on a Hunyuan mesh — toon technique via map swap).
// Eye atlas coordinates, specific to each character.
const HERO_EYES = [
  { x: 385, y: 410, r: 42 },
  { x: 1500, y: 1628, r: 42 },
]
// ?blinktest: slow frequent blink for visual validation
const BLINK_TEST = new URLSearchParams(window.location.search).has('blinktest')
const BLINK_DURATION = BLINK_TEST ? 1.0 : 0.15
const blinkDelay = () => (BLINK_TEST ? 0.9 : 2.2 + Math.random() * 3.4)
// Micro-saccades: gaze holds 0.7-2.4 s then JUMPS to another variant
// (strong bias toward center gaze, index 0)
const saccadeDelay = () => 0.7 + Math.random() * 1.7
const pickGaze = (count: number) => (Math.random() < 0.45 ? 0 : 1 + Math.floor(Math.random() * (count - 1)))

export function Player() {
  const boyRef = useRef<THREE.Group>(null)
  // PointerLockControls mounted AFTER the first click: mounted immediately it
  // tries to lock while the document doesn't have focus yet (reload with
  // DevTools open) → unhandled DOMException "document is not focused" on
  // every launch.
  const [pointerReady, setPointerReady] = useState(false)
  useEffect(() => {
    const arm = () => setPointerReady(true)
    document.addEventListener('pointerdown', arm, { once: true })
    return () => document.removeEventListener('pointerdown', arm)
  }, [])
  const { camera } = useThree()
  const [, getKeys] = useKeyboardControls()
  const setPosition = usePlayerStore(s => s.setPosition)
  const setLastMoveTime = usePlayerStore(s => s.setLastMoveTime)
  const setHidden = usePlayerStore(s => s.setHidden)

  const { scene: heroScene, animations } = useGLTF(HERO_URL)
  const { actions, mixer } = useAnimations(animations, boyRef)
  const currentClip = useRef<string | null>(null)

  // Child scale + feet on ground: baked into the GLB by merge_mixamo.py.
  // Here: toon materials (map + gradientMap), frustum culling off (the bbox
  // of an animated skinned mesh is wrong → pop-in), and generation of the
  // "eyes closed" texture from the GLB source texture.
  const face = useMemo(() => {
    const mats: THREE.MeshToonMaterial[] = []
    let baseMap: THREE.Texture | null = null
    heroScene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        const old = child.material as THREE.MeshStandardMaterial
        const mat = new THREE.MeshToonMaterial({
          map: old.map,
          gradientMap: toonGradient,
        })
        child.material = mat
        // frustumCulled=false is intentional: Hunyuan skinned mesh bounding
        // spheres cull incorrectly (2 attempts to fix) and profiling showed
        // geometry is not the dominant cost (59k tris → 15 fps in the salon).
        child.frustumCulled = false
        if (old.map) {
          mats.push(mat)
          baseMap = old.map
        }
      }
    })
    const faceSet = baseMap ? makeFaceTextures(baseMap, HERO_EYES) : null
    return { baseMap: baseMap as THREE.Texture | null, faceSet }
  }, [heroScene])

  // Blink: eyes closed for BLINK_DURATION every 2-6 s.
  // Saccades: gaze variant sampled every 0.7-2.4 s.
  const faceRef = useRef<FaceState>({
    clock: 0, blinkAt: blinkDelay(), saccadeAt: saccadeDelay(), gazeIdx: 0,
  })

  // Anti T-pose: idle started BEFORE the first paint (useLayoutEffect, not
  // useEffect which lets a few bind-pose frames through) and pose applied
  // immediately to the skeleton (mixer.update(0)). Cleanup resets
  // currentClip: in StrictMode double-mount, drei stops all actions on
  // unmount — without this the guard blocked re-launch.
  useLayoutEffect(() => {
    const idle = actions[CLIP_IDLE]
    if (idle && !currentClip.current) {
      idle.play()
      mixer.update(0)
      currentClip.current = CLIP_IDLE
    }
    return () => {
      currentClip.current = null
    }
  }, [actions, mixer])

  const boyPos = useRef(new THREE.Vector3(0, 0, 3))
  const direction = useRef(new THREE.Vector3())
  const frontVector = useRef(new THREE.Vector3())
  const sideVector = useRef(new THREE.Vector3())
  const camDir = useRef(new THREE.Vector3())
  const prevHide = useRef(false)
  const prevInteract = useRef(false)

  useFrame((_, delta) => {
    const { forward, backward, left, right, hide, interact } = getKeys()

    // Interact key (rising edge): opens/closes the nearest door.
    // Locked door → Emilio comments instead of opening.
    if (interact && !prevInteract.current) {
      const doorId = nearestDoorId(boyPos.current.x, boyPos.current.z, DOORS, DOOR_INTERACT_DIST)
      if (doorId) {
        const door = DOORS.find(d => d.id === doorId)
        if (door?.locked) {
          useSubtitleStore.getState().showSubtitle('Está cerrado.', 'Emilio')
        } else {
          useDoorStore.getState().toggleDoor(doorId)
        }
      }
    }
    prevInteract.current = interact

    // Closed doors = dynamic obstacles for canMove.
    const doorObstacles = closedDoorObstacles(DOORS, useDoorStore.getState().isOpen)

    // addVectors (not subVectors) + (right-left) = correct strafing
    frontVector.current.set(0, 0, Number(backward) - Number(forward))
    sideVector.current.set(Number(right) - Number(left), 0, 0)

    direction.current
      .addVectors(frontVector.current, sideVector.current)
      .normalize()
      // delta capped: at low fps a step of SPEED*delta exceeds wall
      // thickness (0.3 m) → canMove tunnels through, player exits the house
      .multiplyScalar(SPEED * Math.min(delta, 0.05))
      .applyEuler(camera.rotation)

    direction.current.y = 0

    const moving = direction.current.lengthSq() > 0.00001

    if (moving) {
      const nx = boyPos.current.x + direction.current.x
      const nz = boyPos.current.z + direction.current.z

      if (canMove(boyPos.current.x, boyPos.current.z, nx, boyPos.current.z, doorObstacles)) boyPos.current.x = nx
      if (canMove(boyPos.current.x, boyPos.current.z, boyPos.current.x, nz, doorObstacles)) boyPos.current.z = nz

      // Boy rotates toward movement direction
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

    // NPC collision: push boy away if too close
    const [resolvedX, resolvedZ] = resolvePlayerNpcCollision(
      boyPos.current.x, boyPos.current.z, npcPositions.values(), 0.45,
    )
    boyPos.current.x = resolvedX
    boyPos.current.z = resolvedZ

    // Camera follows behind the boy (based on horizontal camera direction)
    camera.getWorldDirection(camDir.current)
    camDir.current.y = 0
    if (camDir.current.lengthSq() > 0.001) camDir.current.normalize()

    // Clamp camera to salon walls only when the player IS in the salon.
    // Elsewhere camera follows freely (adjacent rooms have their own walls).
    const inSalon = boyPos.current.x >= LIVING_ROOM_BOUNDS.minX && boyPos.current.x <= LIVING_ROOM_BOUNDS.maxX
                 && boyPos.current.z >= LIVING_ROOM_BOUNDS.minZ && boyPos.current.z <= LIVING_ROOM_BOUNDS.maxZ
    // Pull-back shortened to first obstruction (furniture everywhere, salon
    // walls only inside — otherwise ghost walls → camera glued outside salon).
    const backDist = cameraBackDistance(
      boyPos.current.x, boyPos.current.z,
      -camDir.current.x, -camDir.current.z,
      CAM_BACK,
      inSalon,
    )
    const rawCamX = boyPos.current.x - camDir.current.x * backDist
    const rawCamZ = boyPos.current.z - camDir.current.z * backDist
    const [camX, camZ] = inSalon ? clampCameraToRoom(rawCamX, rawCamZ) : [rawCamX, rawCamZ]
    camera.position.x = camX
    camera.position.y = CAM_UP
    camera.position.z = camZ

    // Camera very close to boy: hide him rather than filling the screen with his mesh.
    if (boyRef.current) boyRef.current.visible = backDist > BOY_HIDE_DIST

    if (hide !== prevHide.current) {
      prevHide.current = hide
      setHidden(hide)
    }

    // Face life: blink + micro-saccades, via texture swap.
    // We mutate the material CURRENTLY carried by the mesh (traverse): in
    // StrictMode double-render creates two materials and a captured reference
    // may point to the orphan not being rendered — swap has no visible effect.
    const { state: nextFace, output: faceOut } = advanceFace(faceRef.current, delta, {
      blinkDuration: BLINK_DURATION,
      nextBlinkDelay: blinkDelay,
      nextSaccadeDelay: saccadeDelay,
      pickGaze: () => face.faceSet ? pickGaze(face.faceSet.gaze.length) : 0,
    })
    faceRef.current = nextFace
    if (face.faceSet) {
      const want = faceOut.closed ? face.faceSet.blink : face.faceSet.gaze[faceOut.gazeIdx]
      heroScene.traverse(child => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshToonMaterial
          if (mat?.map && mat.map !== want) mat.map = want
        }
      })
      // Sync indicator (?blinktest): eye state in the tab title
      if (BLINK_TEST) document.title = faceOut.closed ? '👁 EYES CLOSED' : 'eyes open'
    }

    // Animation state machine: hidden > walk > idle, smooth crossfade.
    const target = hide ? CLIP_HIDE : moving ? CLIP_WALK : CLIP_IDLE
    if (target !== currentClip.current) {
      if (currentClip.current) actions[currentClip.current]?.fadeOut(FADE)
      const next = actions[target]
      if (next) {
        next.reset().fadeIn(FADE).play()
        // Walk synced to SPEED (Mixamo clip ~1.5 m/s, child scaled down → speed up)
        next.timeScale = target === CLIP_WALK ? 1.5 : 1
      }
      currentClip.current = target
    }
  })

  return (
    <>
      {pointerReady && <PointerLockControls />}
      <group ref={boyRef}>
        <primitive object={heroScene} />
      </group>
    </>
  )
}

useGLTF.preload(HERO_URL)
