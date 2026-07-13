// src/game/systems/doorSystem.ts
// Logique pure d'interaction avec les portes.

export type DoorDef = {
  id: string
  // Point d'interaction (centre de l'embrasure au sol)
  x: number
  z: number
  // AABB [minX, maxX, minZ, maxZ] bloquée quand la porte est FERMÉE.
  // null : la porte est purement visuelle (ex. passage condamné derrière).
  aabb: readonly [number, number, number, number] | null
  // Verrouillée : F ne l'ouvre pas — Emilio commente ("Está cerrado.")
  locked?: boolean
}

// Porte la plus proche du joueur à portée d'interaction, sinon null.
export function nearestDoorId(
  px: number, pz: number,
  doors: readonly DoorDef[],
  maxDist: number,
): string | null {
  let best: string | null = null
  let bestD2 = maxDist * maxDist
  for (const d of doors) {
    const dx = d.x - px
    const dz = d.z - pz
    const d2 = dx * dx + dz * dz
    if (d2 <= bestD2) {
      bestD2 = d2
      best = d.id
    }
  }
  return best
}

// AABBs des portes fermées (à passer à canMove comme obstacles dynamiques).
export function closedDoorObstacles(
  doors: readonly DoorDef[],
  isOpen: (id: string) => boolean,
): readonly [number, number, number, number][] {
  return doors
    .filter((d): d is DoorDef & { aabb: readonly [number, number, number, number] } =>
      d.aabb !== null && !isOpen(d.id))
    .map(d => d.aabb)
}
