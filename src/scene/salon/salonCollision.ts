// src/scene/salon/salonCollision.ts
// AABB collision zones — [minX, maxX, minZ, maxZ]
//
// Règle : l'AABB doit être PLUS PETITE que les startPositions des NPCs qui vivent
// dans cette zone. Les NPCs "à table" spawnent à z=±1.5 → AABB z max = 1.45 (strict
// inequality : 1.5 > 1.45 → outside → ils peuvent se placer et bouger librement).

export const SALON_OBSTACLES: readonly [number, number, number, number][] = [
  // Table x[-4.75,3.75] z[-1.05,1.05] + sièges.
  // z=±1.45 : couvre les sièges (z=±1.60, assise front à z=±1.39) sans bloquer NPCs à z=±1.5.
  // x=-5.3 : chaises ouest déplacées à x=-5.0, assise s'étend à x=-5.21 → buffer 0.1m.
  [-4.85, 4.95,  -1.45, 1.45],
  // Coin salon SUD-OUEST (refs) : canapé face à l'ouest, TV au mur ouest près
  // de la fenêtre, repose-pied entre les deux, lampe derrière le canapé.
  [-3.05, -1.80, -5.70, -2.10],  // canapé model (bbox mesurée, recul +0.2) : segment principal
  [-4.55, -3.00, -5.75, -4.40],  // canapé model : retour d'angle (recul +0.2)
  [-4.85, -4.25, -4.75, -3.15],  // repose-pied (ottoman)
  [-6.90, -5.95, -1.10, -0.10],  // fauteuil (dossier contre le bas de la fenêtre, face est)
  [ 2.2, 4.5,   5.0,  5.7 ],  // buffet mur nord (photos/vase/bougies)
  [-6.90, -5.75, -2.75, -1.55],  // TV CRT + meuble (mur ouest, écran vers l'est)
  [ 6.1, 6.7,   0.85, 1.55],  // plante en pot mur est
  [-5.32, -4.68, -5.78, -5.12],  // commode + lampe + mini plante (mur sud, entre retour et TV)
  [-6.6, -5.6,  4.3,  5.1 ],  // cactus coin nord-ouest
  [-6.6, -6.1,  2.1,  2.6 ],  // plante fenêtre nord
  [-6.65, -6.15, -1.85, -1.35],  // plante fenêtre sud (décalée : place du fauteuil)
  [ 5.2,  6.4,  5.15, 5.75],  // vaisselier coin nord-est
]

// Murs du salon (pièce élargie : z=±5.8 — l'arche sud reste infranchissable
// tant que la cuisine n'est pas jouable)
export const SALON_BOUNDS = { minX: -6.7, maxX: 6.7, minZ: -5.6, maxZ: 5.6 }

// Murs physiques du salon (plans à x=±7, z=±5.8) et marge caméra.
// CAM_MARGIN > near plane (0.1) : la caméra clampée ne coupe jamais un mur.
// Doit rester ≥ SALON_BOUNDS pour ne pas clamper plus fort que le garçon.
const WALL_X = 7
const WALL_Z = 5.8
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

// Déplacement autorisé ? Bloqué seulement en ENTRANT dans un obstacle : un
// personnage déjà à l'intérieur (NPC assis à sa chaise, spawn limite) peut
// toujours en sortir au lieu de geler sur place.
export function canMove(fromX: number, fromZ: number, toX: number, toZ: number): boolean {
  if (toX < SALON_BOUNDS.minX || toX > SALON_BOUNDS.maxX) return false
  if (toZ < SALON_BOUNDS.minZ || toZ > SALON_BOUNDS.maxZ) return false
  return !SALON_OBSTACLES.some(([mx, Mx, mz, Mz]) => {
    const toInside = toX > mx && toX < Mx && toZ > mz && toZ < Mz
    if (!toInside) return false
    const fromInside = fromX > mx && fromX < Mx && fromZ > mz && fromZ < Mz
    return !fromInside
  })
}
