// src/scene/debug/sceneAudit.tsx
// Runtime graphical audit: ?audit in the URL → 4 s after mount, the scene
// is traversed and a report is printed to the console.
// Detects:
//   1. Z-FIGHTING: pairs of coplanar planes (< 4 mm apart) that overlap
//   2. SINGLE-SIDED WALLS: large FrontSide planes (invisible from behind —
//      normal for a back wall, suspect for a partition between two zones)
//   3. NON-TOON: mesh materials without gradientMap (style oversight)
//   4. BUDGET: lights, planar reflectors, heavy textures
// No impact outside ?audit. Read-only — modifies nothing.
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

const ENABLED = new URLSearchParams(window.location.search).has('audit')

type PlaneInfo = {
  name: string
  normal: THREE.Vector3
  offset: number
  box: THREE.Box3
  area: number
  doubleSided: boolean
  pos: THREE.Vector3
}

function fmt(v: THREE.Vector3): string {
  return `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`
}

export function runSceneAudit(scene: THREE.Scene): void {
  const planes: PlaneInfo[] = []
  const noToon: string[] = []
  let meshCount = 0
  let lightCount = 0
  let reflectorCount = 0
  const bigTextures: string[] = []
  const seenTextures = new Set<THREE.Texture>()

  scene.updateMatrixWorld(true)
  const n = new THREE.Vector3()
  const p = new THREE.Vector3()

  scene.traverse(obj => {
    if ((obj as THREE.Light).isLight) lightCount++
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    meshCount++

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const mat of mats) {
      const m = mat as THREE.MeshToonMaterial & { mirror?: number }
      // MeshReflectorMaterial (drei) exposes `mirror`
      if (m.mirror !== undefined) reflectorCount++
      // Non-toon: "decor" mesh without gradientMap or special status
      if (
        (m as THREE.Material).type === 'MeshStandardMaterial' ||
        ((m as THREE.Material).type === 'MeshLambertMaterial')
      ) {
        noToon.push(`${obj.name || '(unnamed)'} @ ${fmt(obj.getWorldPosition(p))} [${(m as THREE.Material).type}]`)
      }
      const map = (m as THREE.MeshToonMaterial).map
      if (map && !seenTextures.has(map)) {
        seenTextures.add(map)
        const img = map.image as { width?: number; height?: number } | undefined
        if (img?.width && img.width * (img.height ?? 0) > 2048 * 2048) {
          bigTextures.push(`${img.width}×${img.height}`)
        }
      }
    }

    // Collect planes for coplanarity detection
    if (mesh.geometry.type === 'PlaneGeometry') {
      const geo = mesh.geometry as THREE.PlaneGeometry
      const w = geo.parameters.width
      const h = geo.parameters.height
      const area = w * h
      if (area < 0.2) return // small decorative elements: ignored
      n.set(0, 0, 1).transformDirection(mesh.matrixWorld).normalize()
      mesh.getWorldPosition(p)
      const box = new THREE.Box3().setFromObject(mesh)
      planes.push({
        name: mesh.name || '(unnamed)',
        normal: n.clone(),
        offset: n.dot(p),
        box,
        area,
        doubleSided: mats.some(m => (m as THREE.Material).side === THREE.DoubleSide),
        pos: p.clone(),
      })
    }
  })

  // 1. Z-fighting: same orientation (±), planes < 4 mm apart, AABBs that
  // overlap once expanded by 5 mm.
  const zfights: string[] = []
  for (let i = 0; i < planes.length; i++) {
    for (let j = i + 1; j < planes.length; j++) {
      const a = planes[i]
      const b = planes[j]
      const dot = a.normal.dot(b.normal)
      if (Math.abs(dot) < 0.999) continue
      const offB = dot > 0 ? b.offset : -b.offset
      if (Math.abs(a.offset - offB) > 0.004) continue
      const boxA = a.box.clone().expandByScalar(0.005)
      if (!boxA.intersectsBox(b.box)) continue
      zfights.push(`${a.name} ${fmt(a.pos)} ↔ ${b.name} ${fmt(b.pos)} — Δ ${(Math.abs(a.offset - offB) * 1000).toFixed(1)} mm`)
    }
  }

  // 2. Large single-sided planes (candidates for "invisible from behind" walls)
  const singleSided = planes
    .filter(pl => !pl.doubleSided && pl.area >= 2.0)
    .map(pl => `${pl.name} ${fmt(pl.pos)} — ${pl.area.toFixed(1)} m², normale ${fmt(pl.normal)}`)

  /* eslint-disable no-console */
  console.group('%c=== SCENE GRAPHICAL AUDIT ===', 'color:#E8940A;font-weight:bold')
  console.log(`Meshes: ${meshCount} | Lights: ${lightCount} | Planar reflectors: ${reflectorCount} | Planes ≥0.2 m²: ${planes.length}`)
  if (lightCount > 40) console.warn(`⚠ ${lightCount} lights — high budget for a 1660 Ti`)
  if (reflectorCount > 6) console.warn(`⚠ ${reflectorCount} planar reflectors — each one = one render pass`)
  if (bigTextures.length) console.warn(`⚠ textures > 2048²: ${bigTextures.join(', ')}`)

  console.group(`Z-FIGHTING candidates: ${zfights.length}`)
  zfights.forEach(z => console.warn(z))
  console.groupEnd()

  console.group(`Single-sided walls ≥ 2 m²: ${singleSided.length} (check those between two accessible zones)`)
  singleSided.forEach(s => console.log(s))
  console.groupEnd()

  console.group(`Non-toon materials: ${noToon.length}`)
  noToon.forEach(s => console.warn(s))
  console.groupEnd()

  console.groupEnd()
  /* eslint-enable no-console */
}

// Probe to mount in the scene: does nothing without ?audit.
export function SceneAuditProbe() {
  const scene = useThree(s => s.scene)
  useEffect(() => {
    if (!ENABLED) return
    const t = setTimeout(() => runSceneAudit(scene), 4000)
    return () => clearTimeout(t)
  }, [scene])
  return null
}
