// src/scene/living-room/houseAudit.test.ts
// Audit d'intégrité des données de la maison : collisions, portes, bounds.
// Garde-fou permanent contre les oublis techniques quand une pièce bouge.
import { describe, it, expect } from 'vitest'
import { SALON_OBSTACLES, ROOM_WALLS, NAV_BOUNDS, canMove } from './livingRoomCollision'
import { DOORS, DOOR_INTERACT_DIST } from './doorConfig'

const ALL = [...SALON_OBSTACLES, ...ROOM_WALLS]

function inObstacle(x: number, z: number, boxes: readonly (readonly [number, number, number, number])[]): boolean {
  return boxes.some(([mx, Mx, mz, Mz]) => x > mx && x < Mx && z > mz && z < Mz)
}

describe('intégrité des AABB', () => {
  it('toutes les boîtes sont bien formées (min < max)', () => {
    for (const [mx, Mx, mz, Mz] of ALL) {
      expect(mx, `minX<maxX pour [${mx},${Mx},${mz},${Mz}]`).toBeLessThan(Mx)
      expect(mz, `minZ<maxZ pour [${mx},${Mx},${mz},${Mz}]`).toBeLessThan(Mz)
    }
  })

  it('toutes les boîtes restent dans les NAV_BOUNDS (marge 0.5 m)', () => {
    for (const [mx, Mx, mz, Mz] of ALL) {
      expect(mx).toBeGreaterThanOrEqual(NAV_BOUNDS.minX - 0.5)
      expect(Mx).toBeLessThanOrEqual(NAV_BOUNDS.maxX + 0.5)
      expect(mz).toBeGreaterThanOrEqual(NAV_BOUNDS.minZ - 0.5)
      expect(Mz).toBeLessThanOrEqual(NAV_BOUNDS.maxZ + 0.5)
    }
  })

  it("pas de doublon exact d'AABB", () => {
    const seen = new Set<string>()
    for (const box of ALL) {
      const key = box.join(',')
      expect(seen.has(key), `AABB dupliquée : [${key}]`).toBe(false)
      seen.add(key)
    }
  })
})

describe('intégrité des portes', () => {
  it('pas de doublon d\'id', () => {
    const ids = DOORS.map(d => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('chaque porte à AABB laisse un passage dans les murs statiques (le battant fermé est le seul bloqueur du gap)', () => {
    for (const door of DOORS) {
      if (!door.aabb) continue
      const [mx, Mx, mz, Mz] = door.aabb
      const cx = (mx + Mx) / 2
      const cz = (mz + Mz) / 2
      expect(
        inObstacle(cx, cz, ALL),
        `porte ${door.id} : le centre de son AABB est déjà couvert par un mur statique`,
      ).toBe(false)
    }
  })

  it('chaque porte est atteignable (point d\'interaction hors obstacle, à portée)', () => {
    for (const door of DOORS) {
      // Le point (x,z) de la DoorDef sert au calcul de distance : il doit
      // être à moins de DOOR_INTERACT_DIST d'une position tenable par le
      // joueur. On sonde une petite grille autour du point.
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
      expect(reachable, `porte ${door.id} : aucun point d'interaction accessible`).toBe(true)
    }
  })

  it('chaque porte non verrouillée à AABB est traversable une fois ouverte', () => {
    for (const door of DOORS) {
      if (!door.aabb || door.locked) continue
      const [mx, Mx, mz, Mz] = door.aabb
      const cx = (mx + Mx) / 2
      const cz = (mz + Mz) / 2
      // Traversée perpendiculaire au gap : le côté le plus fin de l'AABB
      const alongX = Mx - mx < Mz - mz
      const from: [number, number] = alongX ? [mx - 0.25, cz] : [cx, mz - 0.25]
      const to: [number, number] = alongX ? [Mx + 0.25, cz] : [cx, Mz + 0.25]
      // Porte ouverte = pas d'extraObstacles : canMove sur les statiques seuls.
      const step1 = canMove(from[0], from[1], cx, cz)
      const step2 = canMove(cx, cz, to[0], to[1])
      expect(step1 && step2, `porte ${door.id} : passage bloqué même ouverte`).toBe(true)
    }
  })
})

describe('cohérence de navigation', () => {
  it('les positions clefs de chaque pièce sont hors obstacle', () => {
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
      expect(inObstacle(x, z, ALL), `${name} (${x},${z}) est dans un obstacle`).toBe(false)
      expect(x).toBeGreaterThan(NAV_BOUNDS.minX)
      expect(x).toBeLessThan(NAV_BOUNDS.maxX)
      expect(z).toBeGreaterThan(NAV_BOUNDS.minZ)
      expect(z).toBeLessThan(NAV_BOUNDS.maxZ)
    }
  })
})
