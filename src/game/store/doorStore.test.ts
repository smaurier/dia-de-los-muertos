import { describe, it, expect, beforeEach } from 'vitest'
import { useDoorStore } from './doorStore'

describe('doorStore', () => {
  beforeEach(() => {
    useDoorStore.setState({ open: {} })
  })

  it('toutes les portes sont fermées par défaut', () => {
    expect(useDoorStore.getState().isOpen('cellier')).toBe(false)
  })

  it('toggle ouvre puis referme', () => {
    useDoorStore.getState().toggleDoor('cellier')
    expect(useDoorStore.getState().isOpen('cellier')).toBe(true)
    useDoorStore.getState().toggleDoor('cellier')
    expect(useDoorStore.getState().isOpen('cellier')).toBe(false)
  })

  it('les portes sont indépendantes', () => {
    useDoorStore.getState().toggleDoor('cellier')
    expect(useDoorStore.getState().isOpen('couloir')).toBe(false)
  })
})
