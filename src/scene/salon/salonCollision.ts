// src/scene/salon/salonCollision.ts
// AABB collision zones — [minX, maxX, minZ, maxZ]
//
// Règle : l'AABB doit être PLUS PETITE que les startPositions des NPCs qui vivent
// dans cette zone. Les NPCs "à table" spawnent à z=±1.5 → AABB z max = 1.45 (strict
// inequality : 1.5 > 1.45 → outside → ils peuvent se placer et bouger librement).

// Obstacles mobilier uniquement — utilisés par cameraBackDistance ET canMove.
export const SALON_OBSTACLES: readonly [number, number, number, number][] = [
  // Table x[-4.75,3.75] z[-0.05,1.95] (centre z=1.0) + sièges.
  // z=[-0.55, 2.55] : couvre sièges (nord z=2.60, sud z=-0.60), NPCs à ces positions = extérieurs.
  // x=-5.3 : chaises ouest à x=-4.55, assise s'étend à x≈-5.0 → buffer 0.1m.
  [-4.85, 4.95,  -0.55, 2.55],
  // Coin salon SUD-OUEST (refs) : canapé face à l'ouest, TV au mur ouest près
  // de la fenêtre, repose-pied entre les deux, lampe derrière le canapé.
  [-3.05, -1.80, -5.70, -2.10],  // canapé model (bbox mesurée, recul +0.2) : segment principal
  [-4.55, -3.00, -5.75, -4.40],  // canapé model : retour d'angle (recul +0.2)
  [-4.85, -4.25, -4.75, -3.15],  // repose-pied (ottoman)
  [-6.90, -5.95, -1.10, -0.10],  // fauteuil (dossier contre le bas de la fenêtre, face est)
  [ 1.0, 3.3,   5.03, 5.73],  // buffet mur nord (décalé ouest, dégagé arche 2)
  [-6.90, -5.75, -2.75, -1.55],  // TV CRT + meuble (mur ouest, écran vers l'est)
  [ 6.1, 6.7,   2.50, 3.10],  // plante en pot mur est (déplacée de z=1.2 à z=2.8)
  [-5.32, -4.68, -5.78, -5.12],  // commode + lampe + mini plante (mur sud, entre retour et TV)
  [-6.6, -5.6,  4.3,  5.1 ],  // cactus coin nord-ouest
  [-6.6, -6.1,  2.1,  2.6 ],  // plante fenêtre nord
  [-6.65, -6.15, -1.85, -1.35],  // plante fenêtre sud (décalée : place du fauteuil)
  [ 5.65, 6.85, 5.15, 5.75],  // vaisselier coin nord-est (décalé est, dégagé arche 2)
]

// Sections de mur physiques — utilisées par canMove uniquement (pas caméra).
// Les arches = gaps dans ces sections → passage libre.
const ROOM_WALLS: readonly [number, number, number, number][] = [
  // ── Mur nord z=5.8 : arche cuisine ouverte x∈[-3.4,-1.6] ──────────────────
  [-7.2, -3.45, 5.55, 6.2],   // section ouest du mur nord
  // section est : arche 2 ouverte x∈[3.6,5.4] → couloir
  [-1.55, 3.55, 5.55, 6.2],   // entre les deux arches
  [ 5.45,  7.2, 5.55, 6.2],   // à l'est de l'arche 2
  // ── Cuisine (z∈[5.8,12.0], x∈[-7,-0.6]) ──────────────────────────────────
  [-7.2, -6.95, 5.8, 12.2],   // mur ouest plein (porte bleue jardin verrouillée)
  // mur est pierre percé : porte couloir z∈[6.4,7.4] (AABB dynamique doorConfig)
  [-0.65, -0.45, 5.8, 6.4],   // pierre, segment sud
  [-0.65, -0.45, 7.4, 12.2],  // pierre, segment nord
  // ── Couloir en L : branche nord (x∈[-0.6,7], z∈[6.2,7.6]) puis branche est
  //    (x∈[7.35,8.75], z∈[2,7.6]) qui débouche dans le zaguán ────────────────
  // mur nord couloir z=7.6 : percé x∈[4.03,4.97] (porte chambre 1) et
  // x∈[10.2,11.14] (porte chambre 2) — AABB dynamiques doorConfig
  [-0.6, 4.0, 7.45, 7.75],    // mur nord couloir, segment ouest
  [ 5.0, 10.15, 7.45, 7.75],  // mur nord couloir, entre les deux portes
  [11.2, 13.6, 7.45, 7.75],   // mur nord couloir, segment est
  [ 8.6, 8.9, 2.0, 6.2],      // mur est branche est (x=8.75, s'arrête au T)
  [ 6.95, 7.4, 2.0, 6.2],     // mur ouest branche est (mur est épais du salon)
  // mur sud du prolongement (z=6.2) : percé x∈[10.2,11.14] → porte salle de
  // bain (AABB dynamique doorConfig), EN FACE de la porte chambre 2
  [ 8.75, 10.15, 5.9, 6.35],  // segment ouest
  [11.2, 13.6, 5.9, 6.35],    // segment est
  [13.25, 13.6, 6.2, 7.6],    // bout du couloir (x=13.4)
  // ── Chambre 1 (x∈[-0.6,7], z∈[7.6,12]) — mur ouest = pierre (déjà listé) ──
  [-0.45, 7.2, 11.8, 12.2],   // mur nord chambre (z=12)
  [ 6.8, 7.2, 7.6, 12.2],     // mur est chambre (x=7)
  // ── Mobilier chambre 1 (nav seulement) ────────────────────────────────────
  [ 0.85, 1.75, 10.05, 11.95], // lit Emilio
  [ 4.55, 5.45, 10.05, 11.95], // lit Sofía
  [ 2.85, 3.45, 11.45, 11.95], // table de chevet + veilleuse
  [ 6.35, 7.0, 8.45, 9.75],   // armoire (mur est)
  [ 5.05, 6.05, 7.75, 8.4],   // coffre à jouets (près de la porte)
  // ── Chambre 2 (parents, x∈[7.35,13.4], z∈[7.6,12]) ────────────────────────
  [ 7.2, 7.5, 7.6, 12.2],     // mur ouest chambre 2 (mitoyen chambre 1)
  [ 7.2, 13.6, 11.8, 12.2],   // mur nord chambre 2 (z=12)
  [13.25, 13.6, 7.6, 12.2],   // mur est chambre 2 (x=13.4)
  // ── Mobilier chambre 2 (nav seulement) ────────────────────────────────────
  [10.7, 12.5, 9.8, 12.0],    // lit double (cadre + tête)
  [10.1, 10.7, 11.35, 12.0],  // chevet ouest
  [12.5, 13.15, 11.35, 12.0], // chevet est
  [10.85, 12.35, 9.3, 9.8],   // banc-coffre au pied du lit
  [ 7.35, 8.05, 8.55, 10.25], // grande armoire (mur ouest)
  [12.75, 13.4, 8.1, 9.3],    // commode (mur est)
  // ── Salle de bain (x∈[8.9,11.9], z∈[3.4,6.2]) — mur ouest = branche est ──
  [11.75, 12.05, 3.4, 6.2],   // mur est SDB (x=11.9)
  [ 8.6, 12.05, 3.05, 3.55],  // mur sud SDB (z=3.4)
  // ── Mobilier salle de bain (nav seulement) ────────────────────────────────
  [ 9.5, 11.1, 3.55, 4.35],   // baignoire
  [ 8.9, 9.6, 5.0, 5.7],      // WC
  [11.3, 11.9, 4.7, 5.3],     // lavabo colonne
  [11.3, 11.85, 3.55, 4.05],  // panier à linge
  // fond z=12 : porte OUVRABLE vers le cellier x∈[-6.3,-5.3]
  [-7.2, -6.3, 11.8, 12.2],   // fond cuisine, segment ouest
  [-5.3, -0.45, 11.8, 12.2],  // fond cuisine, segment est
  // ── Cellier (x∈[-7,-0.6], z∈[12,15.2]) — toute la largeur de la cuisine ──
  [-7.2, -6.95, 12.0, 15.4],  // mur ouest cellier (porte bleue jardin décorative)
  [-7.2, -0.4, 15.0, 15.4],   // mur fond cellier (z=15.2)
  [-0.8, -0.4, 12.0, 15.4],   // mur est cellier (x=-0.6)
  // ── Mobilier cellier (nav seulement) ──────────────────────────────────────
  [-1.0, -0.5, 12.3, 14.9],   // étagères à conserves (mur est)
  [-6.9, -5.65, 13.85, 15.2], // sacs de grain (coin nord-ouest)
  [-4.4, -2.9, 14.3, 15.1],   // tonneau + caisse (fond, au centre)
  [-2.85, -1.7, 14.55, 15.2], // ollas empilées (mur du fond)
  // ── Mobilier cuisine (nav seulement) ──────────────────────────────────────
  [-4.50, -3.10, 8.40, 9.40], // table cuisine (centre pièce)
  [-3.90, -3.30, 7.75, 8.35], // chaise sud
  [-5.15, -4.55, 8.60, 9.20], // chaise ouest
  [-2.55, -1.85, 11.25, 12.0], // fogón (mur du fond)
  [-7.0,  -6.40, 7.30, 7.90], // ofrenda (mur ouest)
  // ── Mur est x=7 (épais, x∈[7,7.35]) : arche zaguán ouverte z∈[-0.9,0.9] ──
  // x=6.75 (< 7) : obstacle commence avant le mur pour que x=6.8 soit dedans (strict >).
  [ 6.75,  7.4,  0.95, 5.85],  // section nord du mur est
  [ 6.75,  7.4, -5.85, -0.95], // section sud du mur est
  // ── Zaguán (x∈[7,10], z∈[-2,2]) ──────────────────────────────────────────
  // mur nord zaguán : ouvert x∈[7.55,8.55] → couloir (branche est)
  [ 7.35, 7.55,  1.85,  2.2 ], // mur nord zaguán, sliver ouest
  [ 8.55, 10.2,  1.85,  2.2 ], // mur nord zaguán, segment est
  [ 7.0, 10.2, -2.2,  -1.85], // mur sud zaguán
  [ 9.85, 10.2, -1.85, 1.85], // mur est zaguán (porte ext. bloquée pour l'instant)
]

// Bounds du salon uniquement — utilisés par la caméra et les tests.
export const SALON_BOUNDS = { minX: -6.7, maxX: 6.7, minZ: -5.6, maxZ: 5.6 }

// Bounds de navigation totaux — couvre salon + cuisine (nord) + zaguán (est).
// L'arche sud est supprimée → minZ = -5.7 (mur plein).
// canMove utilise NAV_BOUNDS ; la caméra reste dans SALON_BOUNDS.
export const NAV_BOUNDS = { minX: -7.2, maxX: 13.6, minZ: -5.7, maxZ: 15.4 }

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
// extraObstacles : obstacles dynamiques (ex. portes fermées — doorSystem).
export function canMove(
  fromX: number, fromZ: number, toX: number, toZ: number,
  extraObstacles: readonly [number, number, number, number][] = [],
): boolean {
  if (toX < NAV_BOUNDS.minX || toX > NAV_BOUNDS.maxX) return false
  if (toZ < NAV_BOUNDS.minZ || toZ > NAV_BOUNDS.maxZ) return false
  const allObstacles = (SALON_OBSTACLES as readonly [number,number,number,number][])
    .concat(ROOM_WALLS as unknown as [number,number,number,number][])
    .concat(extraObstacles)
  return !allObstacles.some(([mx, Mx, mz, Mz]) => {
    const toInside = toX > mx && toX < Mx && toZ > mz && toZ < Mz
    if (!toInside) return false
    const fromInside = fromX > mx && fromX < Mx && fromZ > mz && fromZ < Mz
    return !fromInside
  })
}
