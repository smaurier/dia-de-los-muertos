// src/scene/living-room/doorConfig.ts
// Interactive doors in the house (INTERACT_KEY when nearby).
import type { DoorDef } from '../../game/systems/doorSystem'

export const DOOR_INTERACT_DIST = 1.4

export const DOORS: DoorDef[] = [
  // Kitchen ↔ pantry: blocks passage while closed.
  { id: 'cellier', x: -5.8, z: 12.0, aabb: [-6.3, -5.3, 11.8, 12.2] },
  // Kitchen ↔ north-east corridor (stone wall with opening).
  { id: 'couloir-cuisine', x: -0.6, z: 6.9, aabb: [-0.85, -0.35, 6.4, 7.4] },
  // Corridor ↔ bedroom 1 (Emilio + Sofía), opposite arch 2.
  { id: 'chambre-1', x: 4.5, z: 7.6, aabb: [4.0, 5.0, 7.45, 7.75] },
  // Corridor ↔ bedroom 2 (parents), at end of extended corridor.
  { id: 'chambre-2', x: 10.67, z: 7.6, aabb: [10.15, 11.2, 7.45, 7.75] },
  // Corridor ↔ bathroom, across from bedroom 2 door.
  { id: 'salle-de-bain', x: 10.67, z: 6.2, aabb: [10.15, 11.2, 6.05, 6.35] },
  // East corridor branch ↔ storage room (between bathroom and entry).
  { id: 'debarras', x: 8.75, z: 2.72, aabb: [8.6, 8.9, 2.2, 3.24] },
  // South corridor ↔ office (between storage room and garage).
  { id: 'bureau', x: 8.75, z: -2.03, aabb: [8.6, 8.9, -2.56, -1.5] },
  // GREEN DOOR at end of south corridor — opens onto patio.
  { id: 'porte-verte', x: 8.05, z: -5.3, aabb: [7.5, 8.6, -5.45, -5.15] },
  // Patio ↔ garage: wooden door in arch of shared wall.
  { id: 'garage', x: 9.0, z: -8.1, aabb: [8.85, 9.15, -8.62, -7.58] },
  // Blue garden doors: locked — Emilio comments.
  { id: 'jardin-cuisine', x: -6.96, z: 10.0, aabb: null, locked: true },
  { id: 'jardin-cellier', x: -6.96, z: 13.6, aabb: null, locked: true },
]
