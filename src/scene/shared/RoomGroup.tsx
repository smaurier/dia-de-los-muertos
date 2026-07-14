// src/scene/shared/RoomGroup.tsx
// Room culling : masque la pièce (meshes + coques Outlines + lumières +
// réflecteurs, d'un coup via group.visible) quand le joueur n'est ni dedans
// ni dans une zone visuellement adjacente (roomZones.ts).
// visible=false plutôt qu'un démontage React : pas de re-création de
// géométrie ni de rechargement GLB au retour — juste zéro rendu.
// Désactivable pour comparaison : ?noculling.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { isZoneVisible, type ZoneId } from '../../game/systems/roomZones'
import { usePlayerStore } from '../../game/store/playerStore'

const DISABLED = new URLSearchParams(window.location.search).has('noculling')

export function RoomGroup({ zone, children }: { zone: ZoneId; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (!ref.current) return
    const [px, , pz] = usePlayerStore.getState().position
    const vis = DISABLED || isZoneVisible(zone, px, pz)
    if (ref.current.visible !== vis) ref.current.visible = vis
  })
  return <group ref={ref}>{children}</group>
}
