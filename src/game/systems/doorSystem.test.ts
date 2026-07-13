import { describe, it, expect } from 'vitest'
import { nearestDoorId, closedDoorObstacles, type DoorDef } from './doorSystem'

const DOORS: DoorDef[] = [
  { id: 'cellier', x: -5.8, z: 12.0, aabb: [-6.3, -5.3, 11.8, 12.2] },
  { id: 'couloir', x: -0.6, z: 6.9, aabb: null },
]

describe('nearestDoorId', () => {
  it('retourne la porte à portée', () => {
    expect(nearestDoorId(-5.8, 11.0, DOORS, 1.3)).toBe('cellier')
  })

  it('retourne null si aucune porte à portée', () => {
    expect(nearestDoorId(0, 0, DOORS, 1.3)).toBeNull()
  })

  it('retourne la plus proche quand plusieurs sont à portée', () => {
    const doors: DoorDef[] = [
      { id: 'a', x: 0, z: 1, aabb: null },
      { id: 'b', x: 0, z: 0.4, aabb: null },
    ]
    expect(nearestDoorId(0, 0, doors, 2)).toBe('b')
  })

  it('à portée limite (juste sous maxDist)', () => {
    expect(nearestDoorId(-5.8, 13.25, DOORS, 1.3)).toBe('cellier')
  })
})

describe('closedDoorObstacles', () => {
  it('bloque les portes fermées qui ont une AABB', () => {
    const obstacles = closedDoorObstacles(DOORS, () => false)
    expect(obstacles).toEqual([[-6.3, -5.3, 11.8, 12.2]])
  })

  it('ne bloque pas une porte ouverte', () => {
    const obstacles = closedDoorObstacles(DOORS, id => id === 'cellier')
    expect(obstacles).toEqual([])
  })

  it('ignore les portes purement visuelles (aabb null)', () => {
    const obstacles = closedDoorObstacles(DOORS, () => false)
    expect(obstacles.find(a => a[0] === -0.85)).toBeUndefined()
  })
})
