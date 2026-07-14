// src/scene/salon/chairConfig.ts
// World positions for sit targetIds used in familyConfig scenarios.
export const SIT_TARGETS: Record<string, [number, number, number]> = {
  // ─── Adults — north row (z=2.60) ────────────────────────────────────────────
  'table-chair-1': [-3.05, 0,  2.60],  // mom
  'table-chair-2': [-2.05, 0,  2.60],  // dad
  'table-chair-3': [-1.05, 0,  2.60],  // uncle1
  'table-chair-4': [-0.05, 0,  2.60],  // uncle2  (was z=-0.60 → north)
  // ─── Young couple — west ends ────────────────────────────────────────────────
  'table-chair-west-1': [-4.55, 0,  1.40],  // young-uncle
  'table-chair-west-2': [-4.55, 0,  0.60],  // young-aunt
  // ─── Child4 — east end ──────────────────────────────────────────────────────
  'table-chair-5': [ 4.65, 0,  0.60],  // child4/Mariana (was [-0.05, 0, 2.60])
  // ─── Special ────────────────────────────────────────────────────────────────
  'under-table':   [-0.55, 0,   1.0],  // hiding under table
  'fauteuil':      [-6.42, 0,  -0.6],  // great-aunt (west armchair)
}

// NPC group Y when seated (geometric placeholders only): feet at -0.45m
// (opaque floor → invisible), torso at ≈0.43m, head at ≈1.30m.
// Animated 3D models (e.g. Mama) use y=0 — animation handles height.
export const SEATED_Y = -0.45
