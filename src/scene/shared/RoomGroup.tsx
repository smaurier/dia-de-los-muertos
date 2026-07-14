// src/scene/shared/RoomGroup.tsx
// Room culling : masque les MESHES de la pièce (y compris coques Outlines et
// réflecteurs) quand le joueur n'est ni dedans ni dans une zone visuellement
// adjacente (roomZones.ts).
//
// IMPORTANT — les LUMIÈRES ne sont jamais cullées : masquer une lumière
// change le set de lumières de la scène et force Three à RECOMPILER tous les
// shaders à chaque bascule de zone (freeze de plusieurs centaines de ms —
// « les pièces mettent trop de temps à se réafficher »). En gardant le set
// constant, la bascule est instantanée ; on garde le gain draw calls.
//
// La visibilité est appliquée mesh par mesh via traverse :
//  - à chaque changement d'état (rare),
//  - et toutes les ~30 frames en régime : les GLB (Prop) chargent en async
//    et ajoutent leurs meshes APRÈS le montage — la réapplication les attrape.
// Désactivable pour comparaison : ?noculling.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { isZoneVisible, type ZoneId } from '../../game/systems/roomZones'
import { usePlayerStore } from '../../game/store/playerStore'

const DISABLED = new URLSearchParams(window.location.search).has('noculling')

function applyMeshVisibility(root: THREE.Object3D, visible: boolean): void {
  root.traverse(obj => {
    const m = obj as THREE.Mesh
    if (m.isMesh || (obj as THREE.Points).isPoints) m.visible = visible
  })
}

export function RoomGroup({ zone, children }: { zone: ZoneId; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  const lastVis = useRef(true)
  const frame = useRef(0)

  useFrame(() => {
    if (!ref.current) return
    const [px, , pz] = usePlayerStore.getState().position
    const vis = DISABLED || isZoneVisible(zone, px, pz)
    frame.current++
    // Bascule immédiate + réapplication périodique (meshes GLB tardifs)
    if (vis !== lastVis.current || frame.current % 30 === 0) {
      lastVis.current = vis
      applyMeshVisibility(ref.current, vis)
    }
  })

  return <group ref={ref}>{children}</group>
}
