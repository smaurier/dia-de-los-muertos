// src/game/store/playerStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { usePlayerStore } from './playerStore'

describe('playerStore', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      position: [0, 0, 0],
      lastMoveTime: 1000,
      isHidden: false,
    })
  })

  it('starts at origin', () => {
    expect(usePlayerStore.getState().position).toEqual([0, 0, 0])
  })

  it('updates position', () => {
    usePlayerStore.getState().setPosition([1, 0, 3])
    expect(usePlayerStore.getState().position).toEqual([1, 0, 3])
  })

  it('updates lastMoveTime', () => {
    usePlayerStore.getState().setLastMoveTime(9999)
    expect(usePlayerStore.getState().lastMoveTime).toBe(9999)
  })

  it('toggles hidden state', () => {
    usePlayerStore.getState().setHidden(true)
    expect(usePlayerStore.getState().isHidden).toBe(true)

    usePlayerStore.getState().setHidden(false)
    expect(usePlayerStore.getState().isHidden).toBe(false)
  })
})
