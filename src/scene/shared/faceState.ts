// Pure blink + micro-saccade state machine, extracted from Player.tsx.
// Randomness is injected via FaceConfig so transitions are deterministic
// in tests. The scene component owns the wall-clock, the rng and the
// texture swap; this module owns only the timing decisions.

export type FaceState = {
  clock: number
  blinkAt: number
  saccadeAt: number
  gazeIdx: number
}

export type FaceConfig = {
  blinkDuration: number
  nextBlinkDelay: () => number
  nextSaccadeDelay: () => number
  pickGaze: () => number
}

export type FaceOutput = { closed: boolean; gazeIdx: number }

export function advanceFace(
  prev: FaceState,
  delta: number,
  cfg: FaceConfig,
): { state: FaceState; output: FaceOutput } {
  const clock = prev.clock + delta
  let { blinkAt, saccadeAt, gazeIdx } = prev

  let closed = clock > blinkAt
  if (closed && clock > blinkAt + cfg.blinkDuration) {
    blinkAt = clock + cfg.nextBlinkDelay()
    closed = false
  }
  if (clock > saccadeAt) {
    saccadeAt = clock + cfg.nextSaccadeDelay()
    gazeIdx = cfg.pickGaze()
  }

  return { state: { clock, blinkAt, saccadeAt, gazeIdx }, output: { closed, gazeIdx } }
}
