// src/scene/Player.tsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls, PointerLockControls, useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { toonGradient } from './shared/toonGradient'
import { makeFaceTextures } from './shared/blinkTexture'
import { usePlayerStore } from '../game/store/playerStore'
import { useDoorStore } from '../game/store/doorStore'
import { useSubtitleStore } from '../game/store/subtitleStore'
import { nearestDoorId, closedDoorObstacles } from '../game/systems/doorSystem'
import { resolvePlayerNpcCollision } from '../game/systems/npcSystem'
import { canMove, cameraBackDistance, clampCameraToRoom, SALON_BOUNDS } from './salon/salonCollision'
import { DOORS, DOOR_INTERACT_DIST } from './salon/doorConfig'
import { npcPositions } from './salon/npcRegistry'

const SPEED = 3
const CAM_BACK = 1.2      // metres derriere le garçon
const CAM_UP = 1.3        // hauteur camera
const BOY_HIDE_DIST = 0.35 // caméra plus proche → garçon masqué

// Héros texturé (pipeline Hunyuan → Mixamo, 5 clips).
const HERO_URL = '/models/characters/heros.glb?v=3'
const HERO_HEIGHT = 1.15  // enfant ~1,15 m (le modèle sort à ~2 m)
// Clips par état ; le crossfade lisse les transitions.
const CLIP_IDLE = 'standing-idle'
const CLIP_WALK = 'walking'
const CLIP_HIDE = 'crouching-idle'
const FADE = 0.22

// Clignement : variante de texture aux paupières peintes, générée en mémoire
// depuis la texture du GLB (pas de blendshapes sur un mesh Hunyuan — technique
// toon du swap de map). Coordonnées atlas des yeux, propres à chaque perso.
const HERO_EYES = [
  { x: 385, y: 410, r: 42 },
  { x: 1500, y: 1628, r: 42 },
]
// ?blinktest : clignement lent et fréquent pour la validation visuelle
const BLINK_TEST = new URLSearchParams(window.location.search).has('blinktest')
const BLINK_DURATION = BLINK_TEST ? 1.0 : 0.15
const blinkDelay = () => (BLINK_TEST ? 0.9 : 2.2 + Math.random() * 3.4)
// Micro-saccades : le regard tient 0,7-2,4 s puis SAUTE sur une autre
// variante (biais fort vers le regard centré, index 0)
const saccadeDelay = () => 0.7 + Math.random() * 1.7
const pickGaze = (count: number) => (Math.random() < 0.45 ? 0 : 1 + Math.floor(Math.random() * (count - 1)))

export function Player() {
  const boyRef = useRef<THREE.Group>(null)
  // PointerLockControls monté APRÈS le premier clic : monté d'emblée, il
  // tente le verrouillage alors que le document n'a pas encore le focus
  // (reload avec DevTools actifs) → DOMException « document is not focused »
  // en rejection non gérée à chaque lancement.
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

  // Échelle enfant + pieds au sol : bakés dans le GLB par merge_mixamo.py.
  // Ici : matériaux toon (map + gradientMap), frustum culling off (la bbox
  // d'un skinned mesh animé est fausse → disparitions), et génération de la
  // texture « yeux fermés » depuis la texture source du GLB.
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
        // frustumCulled=false assumé : les sphères des skinned meshes
        // Hunyuan cullent à tort (2 tentatives) et la mesure a montré que la
        // géométrie n'est pas le coût dominant (59k tris → 15 fps au salon).
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

  // Clignement : yeux fermés BLINK_DURATION toutes les 2-6 s.
  // Saccades : variante de regard tirée toutes les 0,7-2,4 s.
  const blinkAt = useRef(blinkDelay())
  const saccadeAt = useRef(saccadeDelay())
  const gazeIdx = useRef(0)
  const clock = useRef(0)

  // Anti T-pose : idle lancé AVANT le premier paint (useLayoutEffect, pas
  // useEffect qui laisse passer quelques frames de bind pose) et pose
  // appliquée immédiatement au squelette (mixer.update(0)). Le cleanup
  // réarme currentClip : en double montage StrictMode, drei stoppe toutes
  // les actions au démontage — sans ça le garde-fou bloquait la relance.
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

    // Touche interact (front montant) : ouvre/ferme la porte la plus proche.
    // Porte verrouillée → Emilio commente au lieu d'ouvrir.
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

    // Portes fermées = obstacles dynamiques pour canMove.
    const doorObstacles = closedDoorObstacles(DOORS, useDoorStore.getState().isOpen)

    // addVectors (pas subVectors) + (right-left) = strafing correct
    frontVector.current.set(0, 0, Number(backward) - Number(forward))
    sideVector.current.set(Number(right) - Number(left), 0, 0)

    direction.current
      .addVectors(frontVector.current, sideVector.current)
      .normalize()
      // delta borné : à bas fps, un pas de SPEED*delta dépasse l'épaisseur
      // des murs (0,3 m) → canMove saute par-dessus, on sort de la maison
      .multiplyScalar(SPEED * Math.min(delta, 0.05))
      .applyEuler(camera.rotation)

    direction.current.y = 0

    const moving = direction.current.lengthSq() > 0.00001

    if (moving) {
      const nx = boyPos.current.x + direction.current.x
      const nz = boyPos.current.z + direction.current.z

      if (canMove(boyPos.current.x, boyPos.current.z, nx, boyPos.current.z, doorObstacles)) boyPos.current.x = nx
      if (canMove(boyPos.current.x, boyPos.current.z, boyPos.current.x, nz, doorObstacles)) boyPos.current.z = nz

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
    const [resolvedX, resolvedZ] = resolvePlayerNpcCollision(
      boyPos.current.x, boyPos.current.z, npcPositions.values(), 0.45,
    )
    boyPos.current.x = resolvedX
    boyPos.current.z = resolvedZ

    // Caméra suit derrière le garçon (basée sur direction caméra horizontale)
    camera.getWorldDirection(camDir.current)
    camDir.current.y = 0
    if (camDir.current.lengthSq() > 0.001) camDir.current.normalize()

    // Clamp caméra aux murs salon uniquement quand le joueur EST dans le salon.
    // Ailleurs la caméra suit librement (pièces adjacentes ont leurs propres murs).
    const inSalon = boyPos.current.x >= SALON_BOUNDS.minX && boyPos.current.x <= SALON_BOUNDS.maxX
                 && boyPos.current.z >= SALON_BOUNDS.minZ && boyPos.current.z <= SALON_BOUNDS.maxZ
    // Recul raccourci à la première obstruction (meubles partout, murs du
    // salon seulement dedans — sinon murs fantômes → caméra collée hors salon).
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

    // Caméra collée au garçon : on le masque plutôt que d'emplir l'écran de sa coque.
    if (boyRef.current) boyRef.current.visible = backDist > BOY_HIDE_DIST

    if (hide !== prevHide.current) {
      prevHide.current = hide
      setHidden(hide)
    }

    // Vie du visage : clignement + micro-saccades, par swap de texture.
    // On mute le matériau ACTUELLEMENT porté par le mesh (traverse) : en
    // StrictMode le double rendu crée deux matériaux et une référence capturée
    // peut pointer sur l'orphelin non rendu — swap sans effet visible.
    clock.current += delta
    if (face.faceSet) {
      let closed = clock.current > blinkAt.current
      if (closed && clock.current > blinkAt.current + BLINK_DURATION) {
        blinkAt.current = clock.current + blinkDelay()
        closed = false
      }
      if (clock.current > saccadeAt.current) {
        saccadeAt.current = clock.current + saccadeDelay()
        gazeIdx.current = pickGaze(face.faceSet.gaze.length)
      }
      const want = closed ? face.faceSet.blink : face.faceSet.gaze[gazeIdx.current]
      heroScene.traverse(child => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshToonMaterial
          if (mat?.map && mat.map !== want) mat.map = want
        }
      })
      // Témoin de synchro (?blinktest) : l'état des yeux dans le titre d'onglet
      if (BLINK_TEST) document.title = closed ? '👁 YEUX FERMÉS' : 'yeux ouverts'
    }

    // Machine à états d'animation : caché > marche > idle, crossfade doux.
    const target = hide ? CLIP_HIDE : moving ? CLIP_WALK : CLIP_IDLE
    if (target !== currentClip.current) {
      if (currentClip.current) actions[currentClip.current]?.fadeOut(FADE)
      const next = actions[target]
      if (next) {
        next.reset().fadeIn(FADE).play()
        // Marche calée sur SPEED (clip Mixamo ~1,5 m/s, enfant réduit → accélérer)
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
