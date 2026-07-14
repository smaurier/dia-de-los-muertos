import { describe, it, expect } from 'vitest'
import {
  pickScenario,
  getNextStep,
  shouldUpdatePosition,
  getGrandUnclePosition,
  shouldTurnTowardPlayer,
  resolvePlayerNpcCollision,
} from './npcSystem'
import type { Scenario } from './npcSystem'

const scenarioA: Scenario = {
  id: 'a', weight: 3, duration: [5, 10],
  steps: [{ type: 'idle', duration: 5 }],
}
const scenarioB: Scenario = {
  id: 'b', weight: 1, duration: [3, 6],
  steps: [{ type: 'dialogue', text: '¿Qué tal?', speakerName: 'Oncle 1' }],
}

describe('pickScenario', () => {
  it('always returns a scenario from the array', () => {
    const result = pickScenario([scenarioA, scenarioB], 42)
    expect(['a', 'b']).toContain(result.id)
  })

  it('is deterministic with same seed', () => {
    const r1 = pickScenario([scenarioA, scenarioB], 7)
    const r2 = pickScenario([scenarioA, scenarioB], 7)
    expect(r1.id).toBe(r2.id)
  })

  it('produces different results with different seeds', () => {
    const results = new Set(
      Array.from({ length: 20 }, (_, i) =>
        pickScenario([scenarioA, scenarioB], i).id
      )
    )
    expect(results.size).toBeGreaterThan(1)
  })

  it('respects weights — higher weight picked more often', () => {
    const picks = Array.from({ length: 100 }, (_, i) =>
      pickScenario([scenarioA, scenarioB], i * 7 + 3).id
    )
    const aCount = picks.filter(id => id === 'a').length
    expect(aCount).toBeGreaterThan(50)
  })
})

describe('getNextStep', () => {
  const s: Scenario = {
    id: 'x', weight: 1, duration: [5, 10],
    steps: [
      { type: 'idle', duration: 3 },
      { type: 'dialogue', text: 'Hola', speakerName: 'Test' },
    ],
  }

  it('returns first step at index 0', () => {
    expect(getNextStep(s, 0)?.type).toBe('idle')
  })

  it('returns second step at index 1', () => {
    expect(getNextStep(s, 1)?.type).toBe('dialogue')
  })

  it('returns null when index out of bounds', () => {
    expect(getNextStep(s, 2)).toBeNull()
  })
})

describe('shouldUpdatePosition', () => {
  it('returns true for walking', () => {
    expect(shouldUpdatePosition('walking')).toBe(true)
  })

  it('returns false for idle', () => {
    expect(shouldUpdatePosition('idle')).toBe(false)
  })

  it('returns false for sitting', () => {
    expect(shouldUpdatePosition('sitting')).toBe(false)
  })

  it('returns false for reacting', () => {
    expect(shouldUpdatePosition('reacting')).toBe(false)
  })
})

describe('getGrandUnclePosition', () => {
  it('returns a valid position', () => {
    const valid = ['couch', 'buffet', 'window']
    for (let i = 0; i < 20; i++) {
      expect(valid).toContain(getGrandUnclePosition(i))
    }
  })

  it('is deterministic', () => {
    expect(getGrandUnclePosition(42)).toBe(getGrandUnclePosition(42))
  })

  it('returns couch most often (~60%)', () => {
    const results = Array.from({ length: 100 }, (_, i) => getGrandUnclePosition(i))
    const couches = results.filter(r => r === 'couch').length
    expect(couches).toBeGreaterThan(45)
    expect(couches).toBeLessThan(80)
  })
})

describe('shouldTurnTowardPlayer', () => {
  it('returns true when player within threshold', () => {
    expect(shouldTurnTowardPlayer([0, 0, 0], [1, 0, 0], 2)).toBe(true)
  })

  it('returns false when player beyond threshold', () => {
    expect(shouldTurnTowardPlayer([0, 0, 0], [5, 0, 0], 2)).toBe(false)
  })

  it('returns true on threshold boundary', () => {
    expect(shouldTurnTowardPlayer([0, 0, 0], [2, 0, 0], 2)).toBe(true)
  })
})

describe('resolvePlayerNpcCollision', () => {
  const R = 0.45

  it('leaves the player untouched when no NPC is within radius', () => {
    const [x, z] = resolvePlayerNpcCollision(0, 0, [[5, 5]], R)
    expect(x).toBe(0)
    expect(z).toBe(0)
  })

  it('pushes the player out to exactly the radius along the NPC axis', () => {
    const [x, z] = resolvePlayerNpcCollision(0.2, 0, [[0, 0]], R)
    expect(x).toBeCloseTo(0.45, 5)
    expect(z).toBeCloseTo(0, 5)
  })

  it('ignores a near-exact overlap to avoid division by zero', () => {
    const [x, z] = resolvePlayerNpcCollision(0.0005, 0, [[0, 0]], R)
    expect(x).toBe(0.0005)
    expect(z).toBe(0)
  })

  it('resolves against multiple NPCs in sequence', () => {
    const [x, z] = resolvePlayerNpcCollision(0.2, 0, [[0, 0], [0.9, 0]], R)
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })
})
