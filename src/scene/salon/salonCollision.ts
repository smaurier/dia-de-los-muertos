// src/scene/salon/salonCollision.ts
// AABB collision zones — [minX, maxX, minZ, maxZ]
//
// Rule: the AABB must be SMALLER than the startPositions of NPCs that live
// in this zone. NPCs "at table" spawn at z=±1.5 → AABB z max = 1.45 (strict
// inequality: 1.5 > 1.45 → outside → they can place themselves and move freely).

// Furniture obstacles only — used by cameraBackDistance AND canMove.
export const SALON_OBSTACLES: readonly [number, number, number, number][] = [
  // Table x[-4.75,3.75] z[-0.05,1.95] (center z=1.0) + seats.
  // z=[-0.55, 2.55]: covers seats (north z=2.60, south z=-0.60), NPCs at those positions = outside.
  // x=-5.3: west chairs at x=-4.55, seat extends to x≈-5.0 → 0.1m buffer.
  [-4.85, 4.95,  -0.55, 2.55],
  // SOUTH-WEST living area (refs): sofa facing west, TV on west wall near
  // window, ottoman between them, lamp behind sofa.
  [-3.05, -1.80, -5.70, -2.10],  // sofa model (measured bbox, +0.2 clearance): main segment
  [-4.55, -3.00, -5.75, -4.40],  // sofa model: corner return (+0.2 clearance)
  [-4.85, -4.25, -4.75, -3.15],  // ottoman
  [-6.90, -5.95, -1.10, -0.10],  // armchair (back against lower window, facing east)
  [-6.65, -5.85, 0.0, 0.72],     // baby basket (at Rosa's armchair foot)
  [ 1.0, 3.3,   5.03, 5.73],  // sideboard north wall (shifted west, arch 2 clear)
  [-6.90, -5.75, -2.75, -1.55],  // CRT TV + cabinet (west wall, screen facing east)
  [ 6.1, 6.7,   2.50, 3.10],  // potted plant east wall (moved from z=1.2 to z=2.8)
  [-5.32, -4.68, -5.78, -5.12],  // dresser + lamp + small plant (south wall, between corner and TV)
  [-6.6, -5.6,  4.3,  5.1 ],  // cactus north-west corner
  [-6.6, -6.1,  2.1,  2.6 ],  // plant north window
  [-6.65, -6.15, -1.85, -1.35],  // plant south window (shifted: armchair spot)
  [ 5.65, 6.85, 5.15, 5.75],  // china cabinet north-east corner (shifted east, arch 2 clear)
]

// Physical wall sections — used by canMove only (not camera).
// Arches = gaps in these sections → free passage.
// (exported for houseAudit.test.ts integrity check)
export const ROOM_WALLS: readonly [number, number, number, number][] = [
  // ── North wall z=5.8: open kitchen arch x∈[-3.4,-1.6] ───────────────────────
  [-7.2, -3.45, 5.55, 6.2],   // west section of north wall
  // east section: arch 2 open x∈[3.6,5.4] → corridor
  [-1.55, 3.55, 5.55, 6.2],   // between the two arches
  [ 5.45,  7.2, 5.55, 6.2],   // east of arch 2
  // ── Kitchen (z∈[5.8,12.0], x∈[-7,-0.6]) ────────────────────────────────────
  [-7.2, -6.95, 5.8, 12.2],   // solid west wall (locked blue garden door)
  // east stone wall with opening: corridor door z∈[6.4,7.4] (dynamic AABB doorConfig)
  [-0.65, -0.45, 5.8, 6.4],   // stone, south segment
  [-0.65, -0.45, 7.4, 12.2],  // stone, north segment
  // ── L-shaped corridor: north branch (x∈[-0.6,7], z∈[6.2,7.6]) then east branch
  //    (x∈[7.35,8.75], z∈[2,7.6]) opening into the zaguán ──────────────────────
  // north corridor wall z=7.6: opening x∈[4.03,4.97] (bedroom 1 door) and
  // x∈[10.2,11.14] (bedroom 2 door) — dynamic AABBs doorConfig
  [-0.6, 4.0, 7.45, 7.75],    // north corridor wall, west segment
  [ 5.0, 10.15, 7.45, 7.75],  // north corridor wall, between the two doors
  [11.2, 13.6, 7.45, 7.75],   // north corridor wall, east segment
  // east branch east wall (x=8.75): opening z∈[2.25,3.19] (storage room door),
  // open z∈[-0.9,0.9] (entry crossroads), opening z∈[-2.5,-1.56]
  // (office door)
  [ 8.6, 8.9, 0.9, 2.25],     // between crossroads and storage door
  [ 8.6, 8.9, 3.19, 6.2],     // north segment (up to T-junction)
  [ 8.6, 8.9, -1.56, -0.9],   // between crossroads and office door
  [ 8.6, 8.9, -5.3, -2.5],    // south of office door
  // south end of corridor z=-5.3: GREEN DOOR openable x∈[7.58,8.52]
  [ 7.2, 7.6, -5.45, -5.15],  // west sliver
  [ 8.5, 8.9, -5.45, -5.15],  // east sliver
  // ── Patio (x∈[-2,13.4], z∈[-10.6,-5.6]) — behind the green door ─────────────
  [-7.2, 6.95, -6.2, -5.75],  // south wall of salon (patio is behind)
  [ 6.9, 7.6, -5.6, -5.15],   // west corner pillar of green door
  [ 8.75, 15.2, -5.75, -5.45], // north-east facade (back of office + garage)
  [-2.2, -1.8, -10.6, -5.6],  // west enclosure
  [-2.2, 15.2, -10.75, -10.45], // south enclosure (patio + garage, high windows)
  // shared patio/garage wall x=9.0: arch z∈[-8.6,-7.6], openable wooden door
  // (dynamic AABB doorConfig)
  [ 8.85, 9.15, -10.6, -8.6], // south segment
  [ 8.85, 9.15, -7.6, -5.6],  // north segment
  // ── Patio furniture (nav only) ───────────────────────────────────────────────
  [-2.0, -1.2, -8.95, -7.25], // ofrenda (against west wall)
  [ 4.85, 6.35, -6.7, -6.2],  // wooden bench (back to wall)
  [ 7.1, 8.1, -10.6, -9.7],   // bougainvillea (south wall)
  [-1.75, -0.85, -10.25, -9.35], // large agave
  [ 7.9, 8.7, -6.5, -5.7],    // small agave
  // ── Garage elongated EAST (x∈[9.0,15.0], z∈[-10.6,-5.6]) — tilt-up gate
  //    on the east side (street side), in line with the car ────────────────────
  [14.85, 15.2, -10.6, -5.6], // east wall + tilt-up gate (closed)
  // ── Garage furniture (nav only) ─────────────────────────────────────────────
  [10.4, 14.0, -9.15, -7.45], // the vocho (east-west axis)
  [ 9.75, 11.45, -6.35, -5.6], // workbench (north wall)
  [ 9.15, 9.85, -10.5, -9.8], // stacked tires (south-west corner)
  [14.15, 14.9, -6.35, -5.6], // oil cans (north-east corner)
  [ 6.95, 7.4, 2.0, 6.2],     // west wall of east branch (thick east wall of salon)
  // south wall of extension (z=6.2): opening x∈[10.2,11.14] → bathroom door
  // (dynamic AABB doorConfig), ACROSS from bedroom 2 door
  [ 8.75, 10.15, 5.9, 6.35],  // west segment
  [11.2, 13.6, 5.9, 6.35],    // east segment
  [13.25, 13.6, 6.2, 7.6],    // corridor end cap (x=13.4)
  // ── Bedroom 1 (x∈[-0.6,7], z∈[7.6,12]) — west wall = stone (already listed) ─
  [-0.45, 7.2, 11.8, 12.2],   // north bedroom wall (z=12)
  [ 6.8, 7.2, 7.6, 12.2],     // east bedroom wall (x=7)
  // ── Bedroom 1 furniture (nav only) ──────────────────────────────────────────
  [ 0.85, 1.75, 10.05, 11.95], // Emilio's bed
  [ 4.55, 5.45, 10.05, 11.95], // Sofía's bed
  [ 2.85, 3.45, 11.45, 11.95], // nightstand + lamp
  [ 6.35, 7.0, 8.45, 9.75],   // wardrobe (east wall)
  [ 5.05, 6.05, 7.75, 8.4],   // toy chest (near door)
  // ── Bedroom 2 (parents, x∈[7.35,13.4], z∈[7.6,12]) ─────────────────────────
  [ 7.2, 7.5, 7.6, 12.2],     // west wall bedroom 2 (shared with bedroom 1)
  [ 7.2, 13.6, 11.8, 12.2],   // north wall bedroom 2 (z=12)
  [13.25, 13.6, 7.6, 12.2],   // east wall bedroom 2 (x=13.4)
  // ── Bedroom 2 furniture (nav only) ──────────────────────────────────────────
  [10.7, 12.5, 9.8, 12.0],    // double bed (frame + headboard)
  [10.1, 10.7, 11.35, 12.0],  // west nightstand
  [12.5, 13.15, 11.35, 12.0], // east nightstand
  [10.85, 12.35, 9.3, 9.8],   // bench-chest at foot of bed
  [ 7.35, 8.05, 8.55, 10.25], // large wardrobe (west wall)
  [12.75, 13.4, 8.1, 9.3],    // dresser (east wall)
  // ── Bathroom (x∈[8.9,11.9], z∈[3.4,6.2]) — west wall = east branch ─────────
  [11.75, 12.05, 3.4, 6.2],   // east bathroom wall (x=11.9)
  [ 8.6, 12.05, 3.05, 3.55],  // south bathroom wall (z=3.4)
  // ── Bathroom furniture (nav only) ───────────────────────────────────────────
  [ 9.5, 11.1, 3.55, 4.35],   // bathtub
  [ 8.9, 9.6, 5.0, 5.7],      // toilet
  [11.3, 11.9, 4.7, 5.3],     // pedestal sink
  [11.3, 11.85, 3.55, 4.05],  // laundry basket
  // ── Storage room rectangle (x∈[8.9,13.4], z∈[1.2,3.25]) — east of bathroom:
  //    exterior (its window faces out) ────────────────────────────────────────
  [ 8.85, 13.6, 1.0, 1.35],   // south storage wall (z=1.2, back of entry corridor)
  [13.25, 13.6, 1.2, 3.25],   // east storage wall (x=13.4)
  [12.05, 13.6, 3.05, 3.55],  // north storage wall, east part (faces outside)
  // ── Storage room furniture (nav only) ───────────────────────────────────────
  [ 9.1, 11.7, 1.25, 1.75],   // south wall shelves (boxes, jars, newspapers)
  [12.25, 13.25, 1.5, 2.4],   // draped armchair (south-east corner)
  [12.7, 13.4, 2.5, 3.25],    // stacked boxes (north-east corner)
  [ 9.9, 10.8, 2.6, 3.25],    // trunk + blankets (north wall)
  [ 9.15, 9.55, 2.85, 3.25],  // broom + bucket (near door)
  [10.2, 11.0, 1.25, 2.0],    // box pile (south-center)
  [11.65, 12.05, 1.3, 1.7],   // rolled rug
  [ 9.45, 9.75, 1.4, 1.7],    // paint can
  // ── Office (x∈[8.9,12.4], z∈[-4.2,-1.2]) ───────────────────────────────────
  [ 8.9, 12.55, -1.35, -1.05], // north office wall (back of entry corridor)
  [ 8.9, 12.55, -4.35, -4.05], // south office wall
  [12.25, 12.55, -4.2, -1.2],  // east office wall (window)
  // ── Office furniture (nav only) ─────────────────────────────────────────────
  [11.5, 12.2, -3.45, -1.95],  // writing desk (under window)
  [10.9, 11.4, -2.95, -2.45],  // chair
  [ 9.75, 11.25, -4.2, -3.7],  // bookcase (south wall)
  [11.85, 12.35, -1.75, -1.25], // metal filing cabinet (north-east corner)
  [ 9.0, 9.5, -4.1, -3.6],     // potted plant
  // back z=12: OPENABLE door to pantry x∈[-6.3,-5.3]
  [-7.2, -6.3, 11.8, 12.2],   // kitchen back, west segment
  [-5.3, -0.45, 11.8, 12.2],  // kitchen back, east segment
  // ── Pantry (x∈[-7,-0.6], z∈[12,15.2]) — full kitchen width ──────────────────
  [-7.2, -6.95, 12.0, 15.4],  // west pantry wall (decorative blue garden door)
  [-7.2, -0.4, 15.0, 15.4],   // back pantry wall (z=15.2)
  [-0.8, -0.4, 12.0, 15.4],   // east pantry wall (x=-0.6)
  // ── Pantry furniture (nav only) ─────────────────────────────────────────────
  [-1.0, -0.5, 12.3, 14.9],   // canned goods shelves (east wall)
  [-6.9, -5.65, 13.85, 15.2], // grain sacks (north-west corner)
  [-4.4, -2.9, 14.3, 15.1],   // barrel + crate (back, center)
  [-2.85, -1.7, 14.55, 15.2], // stacked ollas (back wall)
  // ── Kitchen furniture (nav only) ────────────────────────────────────────────
  [-4.50, -3.10, 8.40, 9.40], // kitchen table (room center)
  [-3.90, -3.30, 7.75, 8.35], // south chair
  [-5.15, -4.55, 8.60, 9.20], // west chair
  [-2.55, -1.85, 11.25, 12.0], // fogón (back wall)
  [-7.0,  -6.40, 7.30, 7.90], // ofrenda (west wall)
  [-7.0, -6.25, 10.9, 11.7],  // fridge (north-west corner)
  [-4.6, -3.4, 11.35, 12.0],  // sink + dishes (under wall shelf)
  [-1.6, -0.9, 11.2, 11.7],   // stone-corner sideboard (petal bowl)
  [-1.65, -1.05, 8.0, 8.6],   // dog basket (empty)
  // ── East wall x=7 (thick, x∈[7,7.35]): open zaguán arch z∈[-0.9,0.9] ───────
  // x=6.75 (< 7): obstacle starts before wall so x=6.8 is inside (strict >).
  [ 6.75,  7.4,  0.95, 5.85],  // north section of east wall
  [ 6.75,  7.4, -5.85, -0.95], // south section of east wall
  // ── Zaguán: entry corridor (x∈[7.35,10], z∈[-0.9,0.9] — arch width).
  //    Open crossroads to the west (x∈[7.35,8.75]). ─────────────────────────
  [ 8.75, 10.2,  0.75, 1.05],  // north entry corridor wall (z=0.9)
  [ 8.75, 10.2, -1.05, -0.75], // south entry corridor wall (z=-0.9)
  [ 9.85, 10.2, -0.9, 0.9],   // east wall + exterior door (blocked for now)
]

// Salon-only bounds — used by camera and tests.
export const SALON_BOUNDS = { minX: -6.7, maxX: 6.7, minZ: -5.6, maxZ: 5.6 }

// Total navigation bounds — covers salon + kitchen (north) + zaguán (east).
// South arch removed → minZ = -5.7 (solid wall).
// canMove uses NAV_BOUNDS; camera stays within SALON_BOUNDS.
export const NAV_BOUNDS = { minX: -7.2, maxX: 15.2, minZ: -10.5, maxZ: 15.4 }

// Physical salon walls (planes at x=±7, z=±5.8) and camera margin.
// CAM_MARGIN > near plane (0.1): clamped camera never clips a wall.
// Must stay >= SALON_BOUNDS so it doesn't clamp harder than the player.
const WALL_X = 7
const WALL_Z = 5.8
const CAM_MARGIN = 0.15

// Camera (1.2 m behind the player) can exit the room when the player faces a
// wall — single-sided walls → fully black screen. We keep it inside.
export function clampCameraToRoom(x: number, z: number): [number, number] {
  return [
    Math.min(Math.max(x, -WALL_X + CAM_MARGIN), WALL_X - CAM_MARGIN),
    Math.min(Math.max(z, -WALL_Z + CAM_MARGIN), WALL_Z - CAM_MARGIN),
  ]
}

// Camera follows 1.2 m behind the player: without obstruction it enters
// furniture and <Outlines> shells (BackSide, black, visible from inside)
// → black screen. We shorten the pullback at the first obstruction:
// salon walls (CAM_MARGIN limits) and AABBs widened by CAM_MARGIN.
// (backX, backZ): normalized direction from player to camera.
// clampWalls: only apply WALL limits when the player IS inside the salon —
// outside the salon they act as phantom walls that stuck the camera
// (corridor/patio, looking toward outside of bounds → pullback 0).
export function cameraBackDistance(
  px: number, pz: number,
  backX: number, backZ: number,
  maxBack: number,
  clampWalls = true,
): number {
  let t = maxBack

  // Walls: first crossing of each camera limit per axis.
  if (clampWalls) {
    const LIMIT_X = WALL_X - CAM_MARGIN
    const LIMIT_Z = WALL_Z - CAM_MARGIN
    if (backX > 0) t = Math.min(t, (LIMIT_X - px) / backX)
    if (backX < 0) t = Math.min(t, (-LIMIT_X - px) / backX)
    if (backZ > 0) t = Math.min(t, (LIMIT_Z - pz) / backZ)
    if (backZ < 0) t = Math.min(t, (-LIMIT_Z - pz) / backZ)
  }

  // Furniture: ray entry into each widened AABB (slab method).
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

// Movement allowed? Blocked only when ENTERING an obstacle: a character
// already inside (NPC seated at their chair, spawn edge) can always exit
// instead of freezing in place.
// extraObstacles: dynamic obstacles (e.g. closed doors — doorSystem).
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
