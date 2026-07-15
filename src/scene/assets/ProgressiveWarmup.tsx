// src/scene/assets/ProgressiveWarmup.tsx
// Compiles the scene's shader programs a few objects per frame with the scene
// hidden, yielding between frames so the main thread breathes (bar rises, phrases
// rotate). Reveals the scene at 100%. Render as the LAST child of the Canvas.
import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { dedupePriority, progressOf } from './compileQueue'
import { useCompileProgress } from './compileProgressStore'

const OBJECTS_PER_FRAME = 6            // tune: more = faster load, longer per-frame hitch
const SATELLITE_GROUP = 'satellite-rooms'

function isDescendant(obj: THREE.Object3D, ancestor: THREE.Object3D): boolean {
  let p: THREE.Object3D | null = obj
  while (p) { if (p === ancestor) return true; p = p.parent }
  return false
}

export function ProgressiveWarmup() {
  const gl = useThree(s => s.gl)
  const scene = useThree(s => s.scene)
  const camera = useThree(s => s.camera)
  const setProgress = useCompileProgress(s => s.setProgress)
  const markDone = useCompileProgress(s => s.markDone)

  const queue = useRef<THREE.Object3D[]>([])
  const total = useRef(0)
  const compiled = useRef(0)
  const finished = useRef(false)

  useEffect(() => {
    const sat = scene.getObjectByName(SATELLITE_GROUP)
    const items: { key: string; priority: boolean; value: THREE.Object3D }[] = []
    scene.traverse(obj => {
      const o = obj as THREE.Mesh
      if (!(o.isMesh || (obj as THREE.Points).isPoints || (obj as THREE.Line).isLine || (obj as THREE.Sprite).isSprite)) return
      const priority = !(sat && isDescendant(obj, sat)) // living-room first
      items.push({ key: obj.uuid, priority, value: obj })
    })
    queue.current = dedupePriority(items)
    total.current = queue.current.length
    compiled.current = 0
    finished.current = false
    scene.visible = false // render nothing heavy while we compile hidden
    return () => { scene.visible = true }
  }, [scene])

  useFrame(() => {
    if (finished.current) return
    for (let i = 0; i < OBJECTS_PER_FRAME && queue.current.length > 0; i++) {
      const obj = queue.current.shift()!
      try { gl.compile(obj, camera, scene) } catch (e) { console.warn('[warmup] compile skipped', e) }
      compiled.current++
    }
    setProgress(progressOf(compiled.current, total.current))
    if (queue.current.length === 0) {
      scene.visible = true
      finished.current = true
      markDone()
    }
  })

  return null
}
