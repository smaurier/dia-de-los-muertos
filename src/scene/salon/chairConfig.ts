// src/scene/salon/chairConfig.ts
// World positions for sit targetIds used in familyConfig scenarios.
export const SIT_TARGETS: Record<string, [number, number, number]> = {
  // ─── Adultes — rangée nord (z=2.60) ────────────────────────────────────────
  'table-chair-1': [-3.05, 0,  2.60],  // maman
  'table-chair-2': [-2.05, 0,  2.60],  // papa
  'table-chair-3': [-1.05, 0,  2.60],  // oncle1
  'table-chair-4': [-0.05, 0,  2.60],  // oncle2  (ex z=-0.60 → nord)
  // ─── Couple jeune — têtes ouest ─────────────────────────────────────────────
  'table-chair-west-1': [-4.55, 0,  1.40],  // oncle-jeune
  'table-chair-west-2': [-4.55, 0,  0.60],  // tante-jeune
  // ─── Enfant4 — tête est ─────────────────────────────────────────────────────
  'table-chair-5': [ 4.65, 0,  0.60],  // enfant4/Mariana (ex [-0.05, 0, 2.60])
  // ─── Spéciaux ───────────────────────────────────────────────────────────────
  'under-table':   [-0.55, 0,   1.0],  // cache-cache sous table
  'fauteuil':      [-6.42, 0,  -0.6],  // grande-tante (buffet ouest)
}

// NPC group Y when seated (placeholders géométriques uniquement): pieds à -0.45m
// (sol opaque → invisibles), torse à ≈0.43m, tête à ≈1.30m.
// Les modèles 3D animés (ex. Mama) utilisent y=0 — l'animation gère la hauteur.
export const SEATED_Y = -0.45
