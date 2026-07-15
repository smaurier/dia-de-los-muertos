import { dedupePriority, progressOf } from './compileQueue'

describe('dedupePriority', () => {
  it('keeps priority items first, then the rest, preserving order', () => {
    const out = dedupePriority([
      { key: 'a', priority: false, value: 'a' },
      { key: 'b', priority: true, value: 'b' },
      { key: 'c', priority: false, value: 'c' },
      { key: 'd', priority: true, value: 'd' },
    ])
    expect(out).toEqual(['b', 'd', 'a', 'c'])
  })

  it('dedupes by key (first occurrence wins)', () => {
    const out = dedupePriority([
      { key: 'x', priority: true, value: 'x1' },
      { key: 'x', priority: false, value: 'x2' },
      { key: 'y', priority: false, value: 'y1' },
    ])
    expect(out).toEqual(['x1', 'y1'])
  })
})

describe('progressOf', () => {
  it('is 0 when total is 0', () => expect(progressOf(0, 0)).toBe(0))
  it('is compiled/total', () => expect(progressOf(3, 12)).toBeCloseTo(0.25, 5))
  it('clamps to 1', () => expect(progressOf(15, 12)).toBe(1))
})
