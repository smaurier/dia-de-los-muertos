// src/scene/shared/ZoneReflector.tsx
// Réflecteurs « gated » par zone — la bonne version.
//
// Leçon apprise : la passe de MeshReflectorMaterial (drei) vit dans son
// propre useFrame interne, PAS dans mesh.onBeforeRender — l'interception
// par onBeforeRender (ReflectorThrottle, supprimé) ne throttlait rien.
// Ici on monte/démonte le MATÉRIAU : hors zone, la surface porte un
// matériau statique (fallback) et le réflecteur n'existe plus du tout —
// zéro passe, zéro FBO actif. Le swap se produit aux frontières de zone
// (programme shader déjà en cache après la première fois → hitch minime).
//
// ZoneMaterial : <mesh><ZoneMaterial zone="sdb" active={<MeshReflector…/>}
//                fallback={<meshToonMaterial…/>} /></mesh>
//
// SalonReflectorScope : pendant les passes des réflecteurs du salon
// (caméra ≠ caméra principale, joueur au salon), les pièces satellites
// sont masquées via scene.onBeforeRender — le reflet du sol ne re-rend
// que le salon (~5× moins d'objets).
//
// ?noreflect : fallback partout (bissection).
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { isZoneVisible, type ZoneId } from '../../game/systems/roomZones'
import { usePlayerStore } from '../../game/store/playerStore'
import { zoneAt } from '../../game/systems/roomZones'

const NO_REFLECT = new URLSearchParams(window.location.search).has('noreflect')

export function ZoneMaterial({ zone, active, fallback }: {
  zone: ZoneId
  active: ReactNode
  fallback: ReactNode
}) {
  const [on, setOn] = useState(false)
  const frame = useRef(0)
  useFrame(() => {
    // Vérification toutes les 15 frames (~4×/s) — suffisant pour une
    // transition de pièce, et le setState ne fire qu'au changement.
    if (frame.current++ % 15 !== 0) return
    const [px, , pz] = usePlayerStore.getState().position
    const v = !NO_REFLECT && isZoneVisible(zone, px, pz)
    if (v !== on) setOn(v)
  })
  return <>{on ? active : fallback}</>
}

export function SalonReflectorScope() {
  const scene = useThree(s => s.scene)
  const camera = useThree(s => s.camera)

  useEffect(() => {
    let satellites: THREE.Object3D | null = null
    scene.onBeforeRender = (_renderer, _scene, cam) => {
      // Passe d'un réflecteur (caméra virtuelle) pendant que le joueur est
      // au salon → seuls sol/fenêtre du salon sont montés (zone gating) :
      // leur reflet n'a pas besoin des autres pièces.
      if (cam === camera) return
      const [px, , pz] = usePlayerStore.getState().position
      if (zoneAt(px, pz) !== 'salon') return
      if (!satellites) satellites = scene.getObjectByName('satellite-rooms') ?? null
      if (satellites) satellites.visible = false
    }
    scene.onAfterRender = () => {
      if (satellites && !satellites.visible) satellites.visible = true
    }
    return () => {
      scene.onBeforeRender = () => {}
      scene.onAfterRender = () => {}
    }
  }, [scene, camera])

  return null
}
