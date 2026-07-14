import { advanceFace, type FaceState } from './faceState'

const fixed = (blinkDelay: number, saccadeDelay: number, gaze: number) => ({
  blinkDuration: 0.15,
  nextBlinkDelay: () => blinkDelay,
  nextSaccadeDelay: () => saccadeDelay,
  pickGaze: () => gaze,
})

const initial: FaceState = { clock: 0, blinkAt: 1, saccadeAt: 1, gazeIdx: 0 }

describe('advanceFace', () => {
  it('keeps eyes open before blinkAt', () => {
    const { output } = advanceFace(initial, 0.5, fixed(2, 2, 1))
    expect(output.closed).toBe(false)
  })

  it('closes eyes once clock passes blinkAt', () => {
    const { output } = advanceFace(initial, 1.05, fixed(2, 2, 1))
    expect(output.closed).toBe(true)
  })

  it('reopens and reschedules once the blink duration elapses', () => {
    const { state, output } = advanceFace(initial, 1.2, fixed(2, 2, 1))
    expect(output.closed).toBe(false)
    expect(state.blinkAt).toBeCloseTo(3.2, 5)
  })

  it('picks a new gaze and reschedules when clock passes saccadeAt', () => {
    const { state, output } = advanceFace(initial, 1.05, fixed(2, 5, 1))
    expect(output.gazeIdx).toBe(1)
    expect(state.saccadeAt).toBeCloseTo(1.05 + 5, 5)
  })

  it('advances the clock by delta', () => {
    const { state } = advanceFace(initial, 0.3, fixed(2, 2, 1))
    expect(state.clock).toBeCloseTo(0.3, 5)
  })
})
