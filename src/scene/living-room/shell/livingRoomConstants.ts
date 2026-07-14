// src/scene/living-room/shell/livingRoomConstants.ts
// Shared constants extracted from LivingRoomShell — pure data, no JSX.
import * as THREE from 'three'

// Debug: ?aabb shows collision boxes (translucent red) and hides the ceiling
export const SHOW_AABB = new URLSearchParams(window.location.search).has('aabb')

// Kitchen arch intrados: half-cylinder seen from BELOW → normals and
// winding are inverted, otherwise the face is lit backwards (black in toon).
export const intradosGeometry = (() => {
  const g = new THREE.CylinderGeometry(0.9, 0.9, 0.35, 24, 1, true, Math.PI / 2, Math.PI)
  g.rotateX(Math.PI / 2)
  const normals = g.getAttribute('normal')
  for (let i = 0; i < normals.count; i++) {
    normals.setXYZ(i, -normals.getX(i), -normals.getY(i), -normals.getZ(i))
  }
  const index = g.getIndex()
  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i)
      index.setX(i, index.getX(i + 2))
      index.setX(i + 2, a)
    }
  }
  return g
})()

// ─── Colours ──────────────────────────────────────────────────────────────────
export const C_WOOD_DARK  = '#3A2008'
export const C_WOOD_MED   = '#5C3010'
export const C_UPHOLSTERY = '#4A2E1A'
export const C_CEIL       = '#F0E0C8'
export const C_IRON       = '#1A1512' // wrought iron almost-black (old #2A3530 pulled green)
export const C_GOLD       = '#C8A040'
export const C_FRAME      = '#2A1A08'
export const C_PHOTO      = '#4A4858'
export const C_CACTUS     = '#2D7A2D'
export const C_POT        = '#C47A3A'
export const C_CANDLE     = '#F5E8D0'
export const C_FLAME      = '#FF7700'
export const C_LEAF       = '#3E7C3A'
export const C_CERAMIC    = '#E8E0D0'

// ─── Papel picado ─────────────────────────────────────────────────────────────
export const PAPEL_COLORS = ['#C0392B', '#8E44AD', '#E67E22', '#27AE60', '#F1C40F', '#2980B9']
// Garlands perpendicular to the table (along Z), hung under the
// vigas (even x): tight cluster near the entrance + one at the back (ref).
export const PAPEL_X = [4, 2, 0, -4]
export const FLAG_X  = [-4.9, -4.1, -3.3, -2.5, -1.7, -0.9, -0.1, 0.7, 1.5, 2.3, 3.1, 3.9, 4.7]

// ─── Chairs ───────────────────────────────────────────────────────────────────
export type ChairCfg = { pos: [number, number, number]; rot: number }
// Table centre z=1.0. North z=2.60, south z=-0.60 — ~1 m gap between south chairs and sofa (front z≈-2.1).
// End chairs: West end faces +x → rot=+π/2. East end faces -x → rot=-π/2.
// x positions outside table range [-4.75, 3.75].
export const CHAIRS: ChairCfg[] = [
  { pos: [-3.05, 0, 2.60], rot: Math.PI },    // north — facing south (table)
  { pos: [-2.05, 0, 2.60], rot: Math.PI },
  { pos: [-1.05, 0, 2.60], rot: Math.PI },
  { pos: [-0.05, 0, 2.60], rot: Math.PI },
  { pos: [0.95,  0, 2.60], rot: Math.PI },
  { pos: [1.95,  0, 2.60], rot: Math.PI },
  { pos: [2.95,  0, 2.60], rot: Math.PI },
  { pos: [-3.05, 0, -0.60], rot: 0 },         // south — facing north (table)
  { pos: [-2.05, 0, -0.60], rot: 0 },
  { pos: [-1.05, 0, -0.60], rot: 0 },
  { pos: [-0.05, 0, -0.60], rot: 0 },
  { pos: [0.95,  0, -0.60], rot: 0 },
  { pos: [1.95,  0, -0.60], rot: 0 },
  { pos: [2.95,  0, -0.60], rot: 0 },
  { pos: [-4.55, 0,  0.60], rot:  Math.PI / 2 }, // west — facing +x (table)
  { pos: [-4.55, 0,  1.40], rot:  Math.PI / 2 },
  { pos: [ 4.65, 0,  0.60], rot: -Math.PI / 2 }, // east — facing -x (table)
  { pos: [ 4.65, 0,  1.40], rot: -Math.PI / 2 }, // Emi's empty chair
  { pos: [ 3.95, 0,  2.60], rot: Math.PI },        // north +1 — great-aunt's empty chair (she is in the armchair)
]

export const TABLE_LEG_X = [-3.55, -0.05, 3.45]
export const TABLE_LEG_Z = [0.25, 1.75]

// Wall frames (ref entrance-view). North: around the arch and above the
// sideboard. South: above the lounge corner. East: either side of the door.
export const FRAMES_SOUTH: [number, number, number][] = [[3.6, 2.1, -5.77], [4.8, 1.95, -5.77], [6.0, 2.15, -5.77]]
export const FRAMES_EAST:  [number, number, number][] = [[6.97, 1.9, 2.0], [6.97, 1.9, -1.8]]
// Candles removed (were blocking navigation toward the arches)
// Single large curtained window, centred on the west wall (ref salon-vue-entree-01)
export const WINDOW_CZ = 0.5
export const REJA_DZ   = [-1.32, -0.88, -0.44, 0, 0.44, 0.88, 1.32]
export const PLATE_X   = [-3.05, -2.05, -1.05, -0.05, 0.95, 1.95, 2.95]
export const PLATE_Z   = [1.80, 0.20]  // table centre z=1.0, plates at z=1.0±0.80
