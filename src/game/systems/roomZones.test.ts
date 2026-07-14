// src/game/systems/roomZones.test.ts
import { describe, it, expect } from 'vitest'
import { zoneAt, ZONE_ADJACENCY, isZoneVisible, type ZoneId } from './roomZones'

describe('zoneAt', () => {
  it('identifies each room by a center point', () => {
    const spots: [ZoneId, number, number][] = [
      ['salon', 0, 3],
      ['salon', 0, 0],
      ['cuisine', -3.8, 10],
      ['cellier', -3.5, 13.5],
      ['couloir', 3.2, 6.9],       // north branch
      ['couloir', 12.0, 6.9],      // extension
      ['couloir', 8.05, 4.0],      // east branch
      ['couloir', 8.05, -3.0],     // south corridor
      ['chambre1', 3.0, 9.5],
      ['chambre2', 10.0, 9.8],
      ['sdb', 10.4, 4.8],
      ['debarras', 11.2, 2.3],
      ['zaguan', 9.3, 0],
      ['bureau', 10.3, -2.7],
      ['patio', 3.5, -8.1],
      ['garage', 12.2, -6.9],
    ]
    for (const [zone, x, z] of spots) {
      expect(zoneAt(x, z), `(${x}, ${z})`).toBe(zone)
    }
  })

  it('falls back to salon for a position outside any zone', () => {
    expect(zoneAt(-100, -100)).toBe('salon')
  })
})

describe('ZONE_ADJACENCY', () => {
  const zones = Object.keys(ZONE_ADJACENCY) as ZoneId[]

  it('is symmetric (if A sees B, B sees A)', () => {
    for (const a of zones) {
      for (const b of ZONE_ADJACENCY[a]) {
        expect(ZONE_ADJACENCY[b], `${b} should list ${a}`).toContain(a)
      }
    }
  })

  it('no zone lists itself', () => {
    for (const a of zones) {
      expect(ZONE_ADJACENCY[a]).not.toContain(a)
    }
  })

  it('all zones are reachable from salon (connected graph)', () => {
    const seen = new Set<ZoneId>(['salon'])
    const queue: ZoneId[] = ['salon']
    while (queue.length) {
      const z = queue.pop()!
      for (const n of ZONE_ADJACENCY[z]) {
        if (!seen.has(n)) {
          seen.add(n)
          queue.push(n)
        }
      }
    }
    expect(seen.size).toBe(zones.length)
  })
})

describe('isZoneVisible', () => {
  it('the current zone is always visible', () => {
    expect(isZoneVisible('patio', 3.5, -8.1)).toBe(true)
  })

  it('from salon: cuisine visible, garage hidden', () => {
    expect(isZoneVisible('cuisine', 0, 3)).toBe(true)
    expect(isZoneVisible('garage', 0, 3)).toBe(false)
    expect(isZoneVisible('sdb', 0, 3)).toBe(false)
    expect(isZoneVisible('patio', 0, 3)).toBe(false)
  })

  it('from patio: garage and couloir visible, salon hidden', () => {
    expect(isZoneVisible('garage', 3.5, -8.1)).toBe(true)
    expect(isZoneVisible('couloir', 3.5, -8.1)).toBe(true)
    expect(isZoneVisible('salon', 3.5, -8.1)).toBe(false)
  })

  it('from salon: chambre 1 visible (its door faces arch 2)', () => {
    expect(isZoneVisible('chambre1', 4.5, 5.0)).toBe(true)
  })
})
