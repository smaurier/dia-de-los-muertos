// src/scene/salon/doorConfig.ts
// Portes interactives de la maison (touche F à proximité).
import type { DoorDef } from '../../game/systems/doorSystem'

export const DOOR_INTERACT_DIST = 1.4

export const DOORS: DoorDef[] = [
  // Cuisine ↔ cellier : bloque le passage tant qu'elle est fermée.
  { id: 'cellier', x: -5.8, z: 12.0, aabb: [-6.3, -5.3, 11.8, 12.2] },
  // Cuisine → futur couloir (mur en pierre) : purement visuelle pour
  // l'instant — le mur de collision reste plein tant que le couloir
  // n'existe pas (aabb null).
  { id: 'couloir-cuisine', x: -0.6, z: 6.9, aabb: null },
]
