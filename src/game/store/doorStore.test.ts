import { describe, it, expect, beforeEach } from 'vitest'
import { useDoorStore } from './doorStore'

describe('doorStore', () => {
  beforeEach(() => {
    useDoorStore.setState({ open: {} })
  })

  it('all doors are closed by default', () => {
    expect(useDoorStore.getState().isOpen('cellier')).toBe(false)
  })

  it('toggle opens then closes again', () => {
    useDoorStore.getState().toggleDoor('cellier')
    expect(useDoorStore.getState().isOpen('cellier')).toBe(true)
    useDoorStore.getState().toggleDoor('cellier')
    expect(useDoorStore.getState().isOpen('cellier')).toBe(false)
  })

  it('doors are independent', () => {
    useDoorStore.getState().toggleDoor('cellier')
    expect(useDoorStore.getState().isOpen('couloir')).toBe(false)
  })
})
