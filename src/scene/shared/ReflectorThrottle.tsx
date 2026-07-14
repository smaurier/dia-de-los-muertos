// src/scene/shared/ReflectorThrottle.tsx
// Throttle des réflecteurs planaires. Chaque MeshReflectorMaterial re-rend la
// scène ET recalcule les matrices de tous les objets (~2 300), chaque frame,
// via mesh.onBeforeRender. Sol + fenêtre du salon = deux passes complètes par
// frame — mesuré comme LE coût dominant du salon (11-24 fps à 59 k tris).
// Ici : chaque réflecteur ne rafraîchit son reflet qu'une frame sur deux,
// déphasés entre eux → au plus UNE passe réflecteur par frame. Entre deux
// rafraîchissements le reflet garde l'image précédente — invisible pour un
// sol flouté ou une vitre. Les reflets restent intacts, à moitié prix.
// Debug : ?nothrottle désactive (comparaison A/B).
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { isZoneVisible, type ZoneId } from '../../game/systems/roomZones'
import { usePlayerStore } from '../../game/store/playerStore'

const DISABLED = new URLSearchParams(window.location.search).has('nothrottle')

export function ReflectorThrottle() {
  const scene = useThree(s => s.scene)

  useEffect(() => {
    if (DISABLED) return
    let frame = 0
    let phase = 0
    const originals = new Map<THREE.Mesh, THREE.Mesh['onBeforeRender']>()

    // Patch différé et répété : les réflecteurs (Suspense, GLB) montent après.
    let satellites: THREE.Object3D | null = null
    const patchAll = () => {
      if (!satellites) satellites = scene.getObjectByName('satellite-rooms') ?? null
      scene.traverse(obj => {
        const mesh = obj as THREE.Mesh
        if (!mesh.isMesh || originals.has(mesh)) return
        const mat = mesh.material as THREE.Material & { mirror?: number }
        if (Array.isArray(mesh.material) || mat?.mirror === undefined) return
        const original = mesh.onBeforeRender
        originals.set(mesh, original)
        const myPhase = phase++
        // Scope 'salon' (sol, fenêtre) : leur reflet ne montre que le salon —
        // les 10 pièces satellites sont masquées PENDANT la passe (bissection :
        // re-rendre la maison entière coûtait ~35 ms/frame).
        const salonOnly = mesh.userData?.reflectorScope === 'salon'
        // Zone : la passe ne tourne que si le joueur peut VOIR ce réflecteur
        // (zone courante ou adjacente — roomZones). Hors zone, le reflet garde
        // sa dernière image : personne ne le regarde. Ça rend les réflecteurs
        // quasi gratuits loin d'eux → toutes les vitres ont le vrai verre.
        const zone = mesh.userData?.reflectorZone as ZoneId | undefined
        mesh.onBeforeRender = function (...args) {
          if (frame % 2 !== myPhase % 2) return
          if (zone) {
            const [px, , pz] = usePlayerStore.getState().position
            if (!isZoneVisible(zone, px, pz)) return
          }
          if (salonOnly && satellites) {
            satellites.visible = false
            original.apply(this, args)
            satellites.visible = true
          } else {
            original.apply(this, args)
          }
        }
      })
    }
    patchAll()
    const interval = setInterval(patchAll, 2000)

    // Compteur de frames aligné sur le rendu
    let raf = 0
    const loop = () => {
      frame++
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      clearInterval(interval)
      cancelAnimationFrame(raf)
      for (const [mesh, original] of originals) mesh.onBeforeRender = original
    }
  }, [scene])

  return null
}
