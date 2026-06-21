// src/scene/salon/salonCollision.ts
// AABB collision zones — [minX, maxX, minZ, maxZ]
//
// Règle : l'AABB doit être PLUS PETITE que les startPositions des NPCs qui vivent
// dans cette zone. Les NPCs "à table" spawnent à z=±1.5 → AABB z max = 1.45 (strict
// inequality : 1.5 > 1.45 → outside → ils peuvent se placer et bouger librement).

export const SALON_OBSTACLES: readonly [number, number, number, number][] = [
  // Table x[-4.75,3.75] z[-1.15,1.15] + buffer 0.3m.
  // z=±1.45 : couvre les sièges (z=±1.60, assise front à z=±1.39) sans bloquer NPCs à z=±1.5.
  // x=-5.3 : chaises ouest déplacées à x=-5.0, assise s'étend à x=-5.21 → buffer 0.1m.
  [-5.3, 4.5,  -1.45, 1.45],
  [ 3.6, 6.5,   1.9,  3.2 ],  // canapé
  [ 4.1, 5.9,   3.2,  3.9 ],  // repose-pied (ottoman)
  [ 2.5, 3.7,   3.6,  4.7 ],  // fauteuil
  [-6.7, -5.7, -4.3, -1.4 ],  // buffet + chaises coin (z=-3.9 s'étend à z≈-4.12)
]

// Murs du salon
export const SALON_BOUNDS = { minX: -6.7, maxX: 6.7, minZ: -4.8, maxZ: 4.8 }

export function isBlocked(x: number, z: number): boolean {
  if (x < SALON_BOUNDS.minX || x > SALON_BOUNDS.maxX) return true
  if (z < SALON_BOUNDS.minZ || z > SALON_BOUNDS.maxZ) return true
  return SALON_OBSTACLES.some(([mx, Mx, mz, Mz]) => x > mx && x < Mx && z > mz && z < Mz)
}
