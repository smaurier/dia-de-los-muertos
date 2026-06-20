import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, Chapter, GamePhase } from './gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.setState({
      chapter: Chapter.THREE,
      phase: GamePhase.EXPLORING,
      salonAudibilityLevel: 0.8,
      houseScale: 1.0,
      adultHasLeft: false,
    })
  })

  it('starts at chapter 3 for vertical slice', () => {
    expect(useGameStore.getState().chapter).toBe(Chapter.THREE)
  })

  it('clamps salonAudibilityLevel to [0, 1]', () => {
    useGameStore.getState().setSalonAudibility(1.5)
    expect(useGameStore.getState().salonAudibilityLevel).toBe(1)

    useGameStore.getState().setSalonAudibility(-0.5)
    expect(useGameStore.getState().salonAudibilityLevel).toBe(0)
  })

  it('clamps houseScale to [1, 2]', () => {
    useGameStore.getState().setHouseScale(3)
    expect(useGameStore.getState().houseScale).toBe(2)

    useGameStore.getState().setHouseScale(0.5)
    expect(useGameStore.getState().houseScale).toBe(1)
  })

  it('transitions phase', () => {
    useGameStore.getState().setPhase(GamePhase.LOST)
    expect(useGameStore.getState().phase).toBe(GamePhase.LOST)
  })

  it('tracks adult departure', () => {
    useGameStore.getState().setAdultHasLeft(true)
    expect(useGameStore.getState().adultHasLeft).toBe(true)
  })
})
