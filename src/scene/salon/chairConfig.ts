// src/scene/salon/chairConfig.ts
// World positions for sit targetIds used in familyConfig scenarios.
// Indices 0-6 = north row (z=1.60), 7-13 = south row (z=-1.60), matches CHAIRS array order.
export const SIT_TARGETS: Record<string, [number, number, number]> = {
  'table-chair-1': [-3.05, 0,  1.60],  // maman — nord
  'table-chair-2': [-2.05, 0,  1.60],  // papa — nord
  'table-chair-3': [-1.05, 0,  1.60],  // oncle — nord
  'table-chair-4': [-0.05, 0, -1.60],  // tante — sud
  'table-chair-5': [-0.05, 0,  1.60],  // enfant4 — nord
  'under-table':   [-0.55, 0,   0.0],  // dessous table (pas de walk, en place)
  'fauteuil':      [-6.42, 0, -0.6],  // fauteuil dossier au bas de la fenêtre, face est (refs)
}

// NPC group Y when seated: pieds à -0.45m (sol opaque → invisibles),
// torse à ≈0.43m (niveau coussin siège 0.52m), tête à ≈1.30m (adulte assis).
export const SEATED_Y = -0.45
