// src/scene/salon/salonCollision.ts
// AABB collision zones — [minX, maxX, minZ, maxZ]

export const SALON_OBSTACLES: readonly [number, number, number, number][] = [
  [-4.6, 3.6,  -1.2, 1.2],   // table + légère marge
  [ 3.6, 6.5,   1.9, 3.2],   // canapé
  [ 2.7, 3.7,   3.7, 4.7],   // fauteuil
  [-6.7, -5.8, -3.6, -1.4],  // buffet
]

// Murs du salon
export const SALON_BOUNDS = { minX: -6.7, maxX: 6.7, minZ: -4.8, maxZ: 4.8 }

export function isBlocked(x: number, z: number): boolean {
  if (x < SALON_BOUNDS.minX || x > SALON_BOUNDS.maxX) return true
  if (z < SALON_BOUNDS.minZ || z > SALON_BOUNDS.maxZ) return true
  return SALON_OBSTACLES.some(([mx, Mx, mz, Mz]) => x > mx && x < Mx && z > mz && z < Mz)
}
