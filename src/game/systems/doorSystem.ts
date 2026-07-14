// src/game/systems/doorSystem.ts
// Pure logic for door interactions.

export type DoorDef = {
  id: string
  // Interaction point (center of the doorway at floor level)
  x: number
  z: number
  // AABB [minX, maxX, minZ, maxZ] blocked when the door is CLOSED.
  // null: door is purely visual (e.g. a sealed passage behind it).
  aabb: readonly [number, number, number, number] | null
  // Locked: F does not open it — Emilio comments ("Está cerrado.")
  locked?: boolean
}

// Nearest door to the player within interaction range, or null.
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

// AABBs of closed doors (pass to canMove as dynamic obstacles).
export function closedDoorObstacles(
  doors: readonly DoorDef[],
  isOpen: (id: string) => boolean,
): readonly [number, number, number, number][] {
  return doors
    .filter((d): d is DoorDef & { aabb: readonly [number, number, number, number] } =>
      d.aabb !== null && !isOpen(d.id))
    .map(d => d.aabb)
}
