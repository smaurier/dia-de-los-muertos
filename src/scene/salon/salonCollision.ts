// src/scene/salon/salonCollision.ts
// AABB collision zones — [minX, maxX, minZ, maxZ]

export const SALON_OBSTACLES: readonly [number, number, number, number][] = [
  // Table : x[-4.75,3.75] z[-1.15,1.15] + chaises nord/sud z=±1.25 prof=0.42 → z atteint ±1.67
  [-5.1, 4.2,  -1.7, 1.7],
  [ 3.6, 6.5,   1.9, 3.2],   // canapé
  [ 4.1, 5.9,   3.2, 3.9],   // repose-pied (ottoman) — manquait
  [ 2.5, 3.7,   3.6, 4.7],   // fauteuil
  [-6.7, -5.7, -4.3, -1.4],  // buffet + 2 chaises coin (z=-3.1 et z=-3.9, rot=-π/2 → s'étendent à z≈-4.12)
]

// Murs du salon
export const SALON_BOUNDS = { minX: -6.7, maxX: 6.7, minZ: -4.8, maxZ: 4.8 }

export function isBlocked(x: number, z: number): boolean {
  if (x < SALON_BOUNDS.minX || x > SALON_BOUNDS.maxX) return true
  if (z < SALON_BOUNDS.minZ || z > SALON_BOUNDS.maxZ) return true
  return SALON_OBSTACLES.some(([mx, Mx, mz, Mz]) => x > mx && x < Mx && z > mz && z < Mz)
}
