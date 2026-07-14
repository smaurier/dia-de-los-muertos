import { describe, it, expect } from 'vitest'
import { nearestDoorId, closedDoorObstacles, type DoorDef } from './doorSystem'

const DOORS: DoorDef[] = [
  { id: 'cellier', x: -5.8, z: 12.0, aabb: [-6.3, -5.3, 11.8, 12.2] },
  { id: 'couloir', x: -0.6, z: 6.9, aabb: null },
]

describe('nearestDoorId', () => {
  it('returns the door within range', () => {
    expect(nearestDoorId(-5.8, 11.0, DOORS, 1.3)).toBe('cellier')
  })

  it('returns null when no door is in range', () => {
    expect(nearestDoorId(0, 0, DOORS, 1.3)).toBeNull()
  })

  it('returns the closest one when multiple doors are in range', () => {
    const doors: DoorDef[] = [
      { id: 'a', x: 0, z: 1, aabb: null },
      { id: 'b', x: 0, z: 0.4, aabb: null },
    ]
    expect(nearestDoorId(0, 0, doors, 2)).toBe('b')
  })

  it('at the exact range boundary (just under maxDist)', () => {
    expect(nearestDoorId(-5.8, 13.25, DOORS, 1.3)).toBe('cellier')
  })
})

describe('closedDoorObstacles', () => {
  it('blocks closed doors that have an AABB', () => {
    const obstacles = closedDoorObstacles(DOORS, () => false)
    expect(obstacles).toEqual([[-6.3, -5.3, 11.8, 12.2]])
  })

  it('does not block an open door', () => {
    const obstacles = closedDoorObstacles(DOORS, id => id === 'cellier')
    expect(obstacles).toEqual([])
  })

  it('ignores purely visual doors (aabb null)', () => {
    const obstacles = closedDoorObstacles(DOORS, () => false)
    expect(obstacles.find(a => a[0] === -0.85)).toBeUndefined()
  })
})
