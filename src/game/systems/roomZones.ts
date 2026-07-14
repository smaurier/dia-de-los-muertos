// src/game/systems/roomZones.ts
// Découpage de la maison en zones + graphe d'adjacence visuelle.
// Sert au room culling (RoomGroup : une pièce ni courante ni adjacente est
// masquée — meshes, coques Outlines, lumières et réflecteurs d'un coup) et
// posera la fondation du depthZone audio (house-rooms §3, même découpage).
//
// L'adjacence est VISUELLE, pas seulement physique : une pièce est adjacente
// si on peut la voir depuis l'autre par une arche ou une porte ouverte.
// D'où salon↔chambre1 : la porte de la chambre 1 fait face à l'arche 2.
// Limite connue (assumée) : les enfilades à profondeur 2 par portes ouvertes
// (ex. cuisine → couloir → chambre 1 à 25 m) peuvent montrer une pièce
// masquée par sa porte ouverte — rare, sombre, à itérer si visible en jeu.

export type ZoneId =
  | 'salon' | 'cuisine' | 'cellier' | 'couloir' | 'chambre1' | 'chambre2'
  | 'sdb' | 'debarras' | 'zaguan' | 'bureau' | 'patio' | 'garage'

// Rectangles [minX, maxX, minZ, maxZ] par zone, testés dans l'ordre.
// Le salon est le fallback (dernier).
const ZONE_RECTS: readonly [ZoneId, number, number, number, number][] = [
  ['cellier',  -7.2, -0.6, 12.0, 15.4],
  ['cuisine',  -7.2, -0.6,  5.8, 12.0],
  ['chambre1', -0.6,  7.0,  7.6, 12.2],
  ['chambre2',  7.0, 13.6,  7.6, 12.2],
  ['couloir',  -0.6, 13.6,  6.2,  7.6],   // branche nord + prolongement
  ['sdb',       8.9, 11.9,  3.4,  6.2],
  ['debarras',  8.9, 13.6,  1.2,  3.4],
  ['zaguan',    8.75, 10.2, -0.9,  0.9],  // couloir d'entrée (porte principale)
  ['bureau',    8.9, 12.55, -4.2, -1.2],
  ['couloir',   7.0,  8.9, -5.45,  6.2],  // branche est + couloir sud
  ['garage',    9.0, 15.2, -10.75, -5.45],
  ['patio',    -2.2,  9.0, -10.75, -5.45],
]

export function zoneAt(x: number, z: number): ZoneId {
  for (const [id, mx, Mx, mz, Mz] of ZONE_RECTS) {
    if (x >= mx && x <= Mx && z >= mz && z <= Mz) return id
  }
  return 'salon'
}

// Graphe d'adjacence visuelle (symétrique — vérifié par test).
export const ZONE_ADJACENCY: Record<ZoneId, readonly ZoneId[]> = {
  salon:    ['cuisine', 'couloir', 'zaguan', 'chambre1'],
  cuisine:  ['salon', 'cellier', 'couloir'],
  cellier:  ['cuisine'],
  couloir:  ['salon', 'cuisine', 'chambre1', 'chambre2', 'sdb', 'debarras', 'zaguan', 'bureau', 'patio'],
  chambre1: ['couloir', 'salon'],
  chambre2: ['couloir'],
  sdb:      ['couloir'],
  debarras: ['couloir'],
  zaguan:   ['salon', 'couloir'],
  bureau:   ['couloir'],
  patio:    ['couloir', 'garage'],
  garage:   ['patio'],
}

// Une zone est-elle visible depuis la position courante ?
export function isZoneVisible(zone: ZoneId, px: number, pz: number): boolean {
  const current = zoneAt(px, pz)
  return current === zone || ZONE_ADJACENCY[current].includes(zone)
}
