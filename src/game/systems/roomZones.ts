// src/game/systems/roomZones.ts
// Divides the house into zones + visual adjacency graph.
// Drives room culling (RoomGroup: a room that is neither current nor adjacent
// is hidden — meshes, Outline shells, lights, and reflectors all at once) and
// will underpin the depthZone audio system (house-rooms §3, same partition).
//
// Adjacency is VISUAL, not merely physical: a room is adjacent if it can be
// seen from the other through an arch or an open door.
// Hence salon↔chambre1: bedroom-1's door faces arch 2.
// Known (accepted) limit: enfilades at depth 2 through open doors
// (e.g. cuisine → couloir → chambre 1 at 25 m) may reveal a room hidden
// behind its own open door — rare, dark, iterate if noticeable in-game.

export type ZoneId =
  | 'salon' | 'cuisine' | 'cellier' | 'couloir' | 'chambre1' | 'chambre2'
  | 'sdb' | 'debarras' | 'zaguan' | 'bureau' | 'patio' | 'garage'

// Rectangles [minX, maxX, minZ, maxZ] per zone, tested in order.
// Salon is the fallback (last).
const ZONE_RECTS: readonly [ZoneId, number, number, number, number][] = [
  ['cellier',  -7.2, -0.6, 12.0, 15.4],
  ['cuisine',  -7.2, -0.6,  5.8, 12.0],
  ['chambre1', -0.6,  7.0,  7.6, 12.2],
  ['chambre2',  7.0, 13.6,  7.6, 12.2],
  ['couloir',  -0.6, 13.6,  6.2,  7.6],   // north branch + extension
  ['sdb',       8.9, 11.9,  3.4,  6.2],
  ['debarras',  8.9, 13.6,  1.2,  3.4],
  ['zaguan',    8.75, 10.2, -0.9,  0.9],  // entry vestibule (front door)
  ['bureau',    8.9, 12.55, -4.2, -1.2],
  ['couloir',   7.0,  8.9, -5.45,  6.2],  // east branch + south corridor
  ['garage',    9.0, 15.2, -10.75, -5.45],
  ['patio',    -2.2,  9.0, -10.75, -5.45],
]

export function zoneAt(x: number, z: number): ZoneId {
  for (const [id, mx, Mx, mz, Mz] of ZONE_RECTS) {
    if (x >= mx && x <= Mx && z >= mz && z <= Mz) return id
  }
  return 'salon'
}

// Visual adjacency graph (symmetric — verified by tests).
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

// Is a zone visible from the current player position?
export function isZoneVisible(zone: ZoneId, px: number, pz: number): boolean {
  const current = zoneAt(px, pz)
  return current === zone || ZONE_ADJACENCY[current].includes(zone)
}
