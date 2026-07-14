// src/scene/living-room/houseAudit.test.ts
// House data integrity audit: collisions, doors, bounds.
// Permanent guard against technical oversights when a room moves.
import { describe, it, expect } from 'vitest'
import { SALON_OBSTACLES, ROOM_WALLS, NAV_BOUNDS, canMove } from './livingRoomCollision'
import { DOORS, DOOR_INTERACT_DIST } from './doorConfig'

const ALL = [...SALON_OBSTACLES, ...ROOM_WALLS]

function inObstacle(x: number, z: number, boxes: readonly (readonly [number, number, number, number])[]): boolean {
  return boxes.some(([mx, Mx, mz, Mz]) => x > mx && x < Mx && z > mz && z < Mz)
}

describe('AABB integrity', () => {
  it('all boxes are well-formed (min < max)', () => {
    for (const [mx, Mx, mz, Mz] of ALL) {
      expect(mx, `minX<maxX for [${mx},${Mx},${mz},${Mz}]`).toBeLessThan(Mx)
      expect(mz, `minZ<maxZ for [${mx},${Mx},${mz},${Mz}]`).toBeLessThan(Mz)
    }
  })

  it('all boxes stay within NAV_BOUNDS (0.5 m margin)', () => {
    for (const [mx, Mx, mz, Mz] of ALL) {
      expect(mx).toBeGreaterThanOrEqual(NAV_BOUNDS.minX - 0.5)
      expect(Mx).toBeLessThanOrEqual(NAV_BOUNDS.maxX + 0.5)
      expect(mz).toBeGreaterThanOrEqual(NAV_BOUNDS.minZ - 0.5)
      expect(Mz).toBeLessThanOrEqual(NAV_BOUNDS.maxZ + 0.5)
    }
  })

  it('no exact AABB duplicate', () => {
    const seen = new Set<string>()
    for (const box of ALL) {
      const key = box.join(',')
      expect(seen.has(key), `duplicate AABB: [${key}]`).toBe(false)
      seen.add(key)
    }
  })
})

describe('door integrity', () => {
  it('no duplicate id', () => {
    const ids = DOORS.map(d => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every door with an AABB leaves a gap in the static walls (the closed panel is the only blocker)', () => {
    for (const door of DOORS) {
      if (!door.aabb) continue
      const [mx, Mx, mz, Mz] = door.aabb
      const cx = (mx + Mx) / 2
      const cz = (mz + Mz) / 2
      expect(
        inObstacle(cx, cz, ALL),
        `door ${door.id}: the center of its AABB is already covered by a static wall`,
      ).toBe(false)
    }
  })

  it('every door is reachable (interaction point outside obstacle, within range)', () => {
    for (const door of DOORS) {
      // The (x,z) point of the DoorDef is used for distance calculations: it must
      // be within DOOR_INTERACT_DIST of a position the player can stand on.
      // We probe a small grid around the point.
      let reachable = false
      for (let dx = -1.2; dx <= 1.2 && !reachable; dx += 0.2) {
        for (let dz = -1.2; dz <= 1.2 && !reachable; dz += 0.2) {
          const px = door.x + dx
          const pz = door.z + dz
          const dist = Math.hypot(dx, dz)
          if (dist > DOOR_INTERACT_DIST) continue
          if (px < NAV_BOUNDS.minX || px > NAV_BOUNDS.maxX) continue
          if (pz < NAV_BOUNDS.minZ || pz > NAV_BOUNDS.maxZ) continue
          if (!inObstacle(px, pz, ALL)) reachable = true
        }
      }
      expect(reachable, `door ${door.id}: no accessible interaction point`).toBe(true)
    }
  })

  it('every unlocked door with an AABB is passable once opened', () => {
    for (const door of DOORS) {
      if (!door.aabb || door.locked) continue
      const [mx, Mx, mz, Mz] = door.aabb
      const cx = (mx + Mx) / 2
      const cz = (mz + Mz) / 2
      // Perpendicular crossing through the gap: shortest side of the AABB
      const alongX = Mx - mx < Mz - mz
      const from: [number, number] = alongX ? [mx - 0.25, cz] : [cx, mz - 0.25]
      const to: [number, number] = alongX ? [Mx + 0.25, cz] : [cx, Mz + 0.25]
      // Door open = no extraObstacles: canMove on statics only.
      const step1 = canMove(from[0], from[1], cx, cz)
      const step2 = canMove(cx, cz, to[0], to[1])
      expect(step1 && step2, `door ${door.id}: passage blocked even when open`).toBe(true)
    }
  })
})

describe('navigation consistency', () => {
  it('key positions in each room are outside obstacles', () => {
    const spots: [string, number, number][] = [
      ['salon (spawn)', 0, 3],
      ['cuisine', -3.8, 10],
      ['cellier', -3.5, 13.5],
      ['couloir nord', 3.2, 6.9],
      ['couloir prolongé', 12.0, 6.9],
      ['chambre 1', 3.0, 9.5],
      ['chambre 2', 10.0, 9.8],
      ['salle de bain', 10.4, 4.8],
      ['débarras', 11.2, 2.3],
      ['couloir entrée', 9.3, 0],
      ['couloir sud', 8.05, -3.0],
      ['bureau', 10.3, -2.7],
      ['patio', 3.5, -8.1],
      ['garage', 12.2, -6.9],
    ]
    for (const [name, x, z] of spots) {
      expect(inObstacle(x, z, ALL), `${name} (${x},${z}) is inside an obstacle`).toBe(false)
      expect(x).toBeGreaterThan(NAV_BOUNDS.minX)
      expect(x).toBeLessThan(NAV_BOUNDS.maxX)
      expect(z).toBeGreaterThan(NAV_BOUNDS.minZ)
      expect(z).toBeLessThan(NAV_BOUNDS.maxZ)
    }
  })
})
