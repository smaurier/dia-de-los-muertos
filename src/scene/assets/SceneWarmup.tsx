// src/scene/assets/SceneWarmup.tsx
// Compiles all scene shader programs, then signals done. Deterministic warmup:
// the loader dismisses exactly when compileAsync resolves. Render as the LAST
// child of the Canvas so its effect runs after the scene has mounted.
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

export function SceneWarmup({ onWarmed }: { onWarmed: () => void }) {
  const gl = useThree(s => s.gl)
  const scene = useThree(s => s.scene)
  const camera = useThree(s => s.camera)
  useEffect(() => {
    let cancelled = false
    gl.compileAsync(scene, camera).then(() => { if (!cancelled) onWarmed() })
    return () => { cancelled = true }
  }, [gl, scene, camera, onWarmed])
  return null
}
