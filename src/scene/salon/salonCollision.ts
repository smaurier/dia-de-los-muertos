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
  [ 5.6, 6.7,   3.7,  4.8 ],  // TV CRT coin nord-est (en diagonale)
  [ 6.1, 6.7,   0.85, 1.55],  // plante en pot mur est
  [ 2.9, 3.4,   2.35, 2.85],  // lampe à abat-jour (coin canapé)
  [-6.6, -5.6,  3.5,  4.3 ],  // cactus coin nord-ouest
  [-6.6, -6.1,  2.1,  2.6 ],  // plante fenêtre nord
  [-6.6, -6.1, -1.3, -0.8 ],  // plante fenêtre sud
]

// Murs du salon
export const SALON_BOUNDS = { minX: -6.7, maxX: 6.7, minZ: -4.8, maxZ: 4.8 }

// Murs physiques du salon (plans à x=±7, z=±5) et marge caméra.
// CAM_MARGIN > near plane (0.1) : la caméra clampée ne coupe jamais un mur.
// Doit rester ≥ SALON_BOUNDS pour ne pas clamper plus fort que le garçon.
const WALL_X = 7
const WALL_Z = 5
const CAM_MARGIN = 0.15

// La caméra (1,2 m derrière le garçon) peut sortir de la pièce quand il est dos
// à un mur — murs une face → écran entièrement sombre. On la garde dedans.
export function clampCameraToRoom(x: number, z: number): [number, number] {
  return [
    Math.min(Math.max(x, -WALL_X + CAM_MARGIN), WALL_X - CAM_MARGIN),
    Math.min(Math.max(z, -WALL_Z + CAM_MARGIN), WALL_Z - CAM_MARGIN),
  ]
}

// La caméra suit 1,2 m derrière le garçon : sans obstruction, elle entre dans
// les meubles et les coques <Outlines> (BackSide, noires, visibles de
// l'intérieur) → écran noir. On raccourcit le recul à la première obstruction :
// murs (limites CAM_MARGIN) et AABB élargies de CAM_MARGIN.
// (backX, backZ) : direction normalisée du garçon vers la caméra.
export function cameraBackDistance(
  px: number, pz: number,
  backX: number, backZ: number,
  maxBack: number,
): number {
  let t = maxBack

  // Murs : premier franchissement des limites caméra sur chaque axe.
  const LIMIT_X = WALL_X - CAM_MARGIN
  const LIMIT_Z = WALL_Z - CAM_MARGIN
  if (backX > 0) t = Math.min(t, (LIMIT_X - px) / backX)
  if (backX < 0) t = Math.min(t, (-LIMIT_X - px) / backX)
  if (backZ > 0) t = Math.min(t, (LIMIT_Z - pz) / backZ)
  if (backZ < 0) t = Math.min(t, (-LIMIT_Z - pz) / backZ)

  // Meubles : entrée du rayon dans chaque AABB élargie (méthode des slabs).
  for (const [mx, Mx, mz, Mz] of SALON_OBSTACLES) {
    const minX = mx - CAM_MARGIN
    const maxX = Mx + CAM_MARGIN
    const minZ = mz - CAM_MARGIN
    const maxZ = Mz + CAM_MARGIN

    let tEntry = -Infinity
    let tExit = Infinity
    if (backX !== 0) {
      const t1 = (minX - px) / backX
      const t2 = (maxX - px) / backX
      tEntry = Math.max(tEntry, Math.min(t1, t2))
      tExit = Math.min(tExit, Math.max(t1, t2))
    } else if (px <= minX || px >= maxX) {
      continue
    }
    if (backZ !== 0) {
      const t1 = (minZ - pz) / backZ
      const t2 = (maxZ - pz) / backZ
      tEntry = Math.max(tEntry, Math.min(t1, t2))
      tExit = Math.min(tExit, Math.max(t1, t2))
    } else if (pz <= minZ || pz >= maxZ) {
      continue
    }

    if (tEntry <= tExit && tExit > 0) t = Math.min(t, tEntry)
  }

  return Math.max(0, t)
}

export function isBlocked(x: number, z: number): boolean {
  if (x < SALON_BOUNDS.minX || x > SALON_BOUNDS.maxX) return true
  if (z < SALON_BOUNDS.minZ || z > SALON_BOUNDS.maxZ) return true
  return SALON_OBSTACLES.some(([mx, Mx, mz, Mz]) => x > mx && x < Mx && z > mz && z < Mz)
}
