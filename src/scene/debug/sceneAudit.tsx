// src/scene/debug/sceneAudit.tsx
// Audit graphique runtime : ?audit dans l'URL → 4 s après le montage, la
// scène est traversée et un rapport tombe dans la console.
// Détecte :
//   1. Z-FIGHTING : paires de planes coplanaires (< 4 mm) qui se chevauchent
//   2. MURS UNE FACE : grands planes FrontSide (invisibles de dos — normal
//      pour un mur de fond, suspect pour une cloison entre deux zones)
//   3. HORS TOON : matériaux mesh sans gradientMap (oubli de style)
//   4. BUDGET : lumières, réflecteurs planaires, textures lourdes
// Aucun impact hors ?audit. Lecture seule — ne modifie rien.
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
      // MeshReflectorMaterial (drei) expose `mirror`
      if (m.mirror !== undefined) reflectorCount++
      // Hors toon : mesh « décor » sans gradientMap ni statut spécial
      if (
        (m as THREE.Material).type === 'MeshStandardMaterial' ||
        ((m as THREE.Material).type === 'MeshLambertMaterial')
      ) {
        noToon.push(`${obj.name || '(anonyme)'} @ ${fmt(obj.getWorldPosition(p))} [${(m as THREE.Material).type}]`)
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

    // Collecte des planes pour la détection de coplanarité
    if (mesh.geometry.type === 'PlaneGeometry') {
      const geo = mesh.geometry as THREE.PlaneGeometry
      const w = geo.parameters.width
      const h = geo.parameters.height
      const area = w * h
      if (area < 0.2) return // petits éléments décoratifs : ignorés
      n.set(0, 0, 1).transformDirection(mesh.matrixWorld).normalize()
      mesh.getWorldPosition(p)
      const box = new THREE.Box3().setFromObject(mesh)
      planes.push({
        name: mesh.name || '(anonyme)',
        normal: n.clone(),
        offset: n.dot(p),
        box,
        area,
        doubleSided: mats.some(m => (m as THREE.Material).side === THREE.DoubleSide),
        pos: p.clone(),
      })
    }
  })

  // 1. Z-fighting : même orientation (±), plans distants < 4 mm, AABB qui
  // se chevauchent une fois élargies de 5 mm.
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

  // 2. Grands planes une face (candidats « mur invisible de dos »)
  const singleSided = planes
    .filter(pl => !pl.doubleSided && pl.area >= 2.0)
    .map(pl => `${pl.name} ${fmt(pl.pos)} — ${pl.area.toFixed(1)} m², normale ${fmt(pl.normal)}`)

  /* eslint-disable no-console */
  console.group('%c=== AUDIT GRAPHIQUE DE LA SCÈNE ===', 'color:#E8940A;font-weight:bold')
  console.log(`Meshes : ${meshCount} | Lumières : ${lightCount} | Réflecteurs planaires : ${reflectorCount} | Planes ≥0.2 m² : ${planes.length}`)
  if (lightCount > 40) console.warn(`⚠ ${lightCount} lumières — budget élevé pour une 1660 Ti`)
  if (reflectorCount > 6) console.warn(`⚠ ${reflectorCount} réflecteurs planaires — chaque un = une passe de rendu`)
  if (bigTextures.length) console.warn(`⚠ textures > 2048² : ${bigTextures.join(', ')}`)

  console.group(`Z-FIGHTING candidats : ${zfights.length}`)
  zfights.forEach(z => console.warn(z))
  console.groupEnd()

  console.group(`Murs une face ≥ 2 m² : ${singleSided.length} (vérifier ceux entre deux zones accessibles)`)
  singleSided.forEach(s => console.log(s))
  console.groupEnd()

  console.group(`Matériaux hors toon : ${noToon.length}`)
  noToon.forEach(s => console.warn(s))
  console.groupEnd()

  console.groupEnd()
  /* eslint-enable no-console */
}

// Sonde à monter dans la scène : ne fait rien sans ?audit.
export function SceneAuditProbe() {
  const scene = useThree(s => s.scene)
  useEffect(() => {
    if (!ENABLED) return
    const t = setTimeout(() => runSceneAudit(scene), 4000)
    return () => clearTimeout(t)
  }, [scene])
  return null
}
