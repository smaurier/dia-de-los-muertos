// src/scene/salon/doorConfig.ts
// Portes interactives de la maison (touche INTERACT_KEY à proximité).
import type { DoorDef } from '../../game/systems/doorSystem'

export const DOOR_INTERACT_DIST = 1.4

export const DOORS: DoorDef[] = [
  // Cuisine ↔ cellier : bloque le passage tant qu'elle est fermée.
  { id: 'cellier', x: -5.8, z: 12.0, aabb: [-6.3, -5.3, 11.8, 12.2] },
  // Cuisine ↔ couloir nord-est (mur en pierre percé).
  { id: 'couloir-cuisine', x: -0.6, z: 6.9, aabb: [-0.85, -0.35, 6.4, 7.4] },
  // Couloir ↔ chambre 1 (Emilio + Sofía), en face de l'arche 2.
  { id: 'chambre-1', x: 4.5, z: 7.6, aabb: [4.0, 5.0, 7.45, 7.75] },
  // Couloir ↔ chambre 2 (les parents), au bout du couloir prolongé.
  { id: 'chambre-2', x: 10.67, z: 7.6, aabb: [10.15, 11.2, 7.45, 7.75] },
  // Couloir ↔ salle de bain, en face de la porte de la chambre 2.
  { id: 'salle-de-bain', x: 10.67, z: 6.2, aabb: [10.15, 11.2, 6.05, 6.35] },
  // Portes bleues vers le jardin : verrouillées — Emilio commente.
  { id: 'jardin-cuisine', x: -6.96, z: 10.0, aabb: null, locked: true },
  { id: 'jardin-cellier', x: -6.96, z: 13.6, aabb: null, locked: true },
]
