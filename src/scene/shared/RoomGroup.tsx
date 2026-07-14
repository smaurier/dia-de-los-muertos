// src/scene/shared/RoomGroup.tsx
// Room culling: hides the room's MESHES (including Outline shells and
// reflectors) when the player is neither inside nor in a visually adjacent
// zone (roomZones.ts).
//
// IMPORTANT — LIGHTS are never culled: hiding a light changes the scene's
// light set and forces Three to RECOMPILE all shaders on every zone toggle
// (freeze of several hundred ms — "rooms take too long to reappear").
// Keeping the set constant makes the toggle instant; we still gain on draw calls.
//
// Visibility is applied mesh by mesh via traverse:
//  - on every state change (rare),
//  - and every ~30 frames at steady state: GLBs (Prop) load asynchronously
//    and add their meshes AFTER mount — the periodic reapply catches them.
// Disable for comparison: ?noculling.
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
    // Immediate toggle + periodic reapply (late-loaded GLB meshes)
    if (vis !== lastVis.current || frame.current % 30 === 0) {
      lastVis.current = vis
      applyMeshVisibility(ref.current, vis)
    }
  })

  return <group ref={ref}>{children}</group>
}
