// src/game/systems/stillnessSystem.test.ts
import { describe, it, expect } from 'vitest'
import {
  isPlayerStill,
  stillnessDuration,
  stillnessIntensity,
  STILLNESS_THRESHOLD_MS,
} from './stillnessSystem'

const BASE = 1_000_000

describe('isPlayerStill', () => {
  it('returns false just before threshold', () => {
    expect(isPlayerStill(BASE, BASE + STILLNESS_THRESHOLD_MS - 1)).toBe(false)
  })

  it('returns true at exact threshold', () => {
    expect(isPlayerStill(BASE, BASE + STILLNESS_THRESHOLD_MS)).toBe(true)
  })

  it('returns true above threshold', () => {
    expect(isPlayerStill(BASE, BASE + STILLNESS_THRESHOLD_MS + 5000)).toBe(true)
  })

  it('accepts custom threshold', () => {
    expect(isPlayerStill(BASE, BASE + 999, 1000)).toBe(false)
    expect(isPlayerStill(BASE, BASE + 1000, 1000)).toBe(true)
  })
})

describe('stillnessDuration', () => {
  it('returns 0 when just moved', () => {
    expect(stillnessDuration(BASE, BASE)).toBe(0)
  })

  it('returns elapsed ms', () => {
    expect(stillnessDuration(BASE, BASE + 2500)).toBe(2500)
  })

  it('clamps to 0 when now < lastMoveTime', () => {
    expect(stillnessDuration(BASE + 100, BASE)).toBe(0)
  })
})

describe('stillnessIntensity', () => {
  it('returns 0 at no stillness', () => {
    expect(stillnessIntensity(BASE, BASE, 10000)).toBe(0)
  })

  it('returns 0.5 at half maxMs', () => {
    expect(stillnessIntensity(BASE, BASE + 5000, 10000)).toBe(0.5)
  })

  it('caps at 1', () => {
    expect(stillnessIntensity(BASE, BASE + 20000, 10000)).toBe(1)
  })
})
