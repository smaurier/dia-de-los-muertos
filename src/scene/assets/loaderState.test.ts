import { advanceLoader, initialLoaderState } from './loaderState'

describe('advanceLoader', () => {
  it('does NOT ready before loading has started (idle at mount)', () => {
    const s = advanceLoader(initialLoaderState, false, 1000)
    expect(s.hasStarted).toBe(false)
    expect(s.ready).toBe(false)
  })

  it('marks hasStarted once active goes true', () => {
    const s = advanceLoader(initialLoaderState, true, 16)
    expect(s.hasStarted).toBe(true)
    expect(s.ready).toBe(false)
  })

  it('readies after active has been false ≥300ms post-start', () => {
    let s = advanceLoader(initialLoaderState, true, 16)
    s = advanceLoader(s, false, 200)
    expect(s.ready).toBe(false)
    s = advanceLoader(s, false, 150)
    expect(s.ready).toBe(true)
  })

  it('a mid-load active blip resets the debounce', () => {
    let s = advanceLoader(initialLoaderState, true, 16)
    s = advanceLoader(s, false, 250)
    s = advanceLoader(s, true, 16)
    expect(s.ready).toBe(false)
    s = advanceLoader(s, false, 250)
    expect(s.ready).toBe(false)
  })

  it('is 404-safe: readies on settle with no dependence on loaded/error counts', () => {
    let s = advanceLoader(initialLoaderState, true, 16)
    s = advanceLoader(s, false, 300)
    expect(s.ready).toBe(true)
  })

  it('stays ready once ready (idempotent)', () => {
    let s = advanceLoader(initialLoaderState, true, 16)
    s = advanceLoader(s, false, 300)
    s = advanceLoader(s, true, 16)
    expect(s.ready).toBe(true)
  })
})
