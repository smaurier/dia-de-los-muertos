// src/scene/assets/SceneWarmup.tsx
// Compiles the SPAWN-VISIBLE shaders (the living room), then signals done.
// The whole house has ~60 shader programs; compiling all of them up front is a
// ~12 s block on GPUs without KHR_parallel_shader_compile (e.g. Firefox). We
// detach the `satellite-rooms` group so compileAsync only compiles what the
// player sees at spawn — a far smaller batch, universal across browsers. The
// satellite rooms compile lazily the first time they render (a small hitch on
// entering a room, tied to a door transition). Render as the LAST child of the
// Canvas so its effect runs after the scene has mounted.
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import type * as THREE from 'three'

export function SceneWarmup({ onWarmed }: { onWarmed: () => void }) {
  const gl = useThree(s => s.gl)
  const scene = useThree(s => s.scene)
  const camera = useThree(s => s.camera)
  useEffect(() => {
    let cancelled = false
    const satellites = scene.getObjectByName('satellite-rooms') as THREE.Object3D | null
    const parent = satellites?.parent ?? null
    // Detach satellite rooms so only the living room compiles up front.
    if (satellites && parent) parent.remove(satellites)
    const reattach = () => { if (satellites && parent && satellites.parent !== parent) parent.add(satellites) }
    gl.compileAsync(scene, camera).then(() => {
      reattach()
      if (!cancelled) onWarmed()
    })
    return () => { cancelled = true; reattach() }
  }, [gl, scene, camera, onWarmed])
  return null
}
