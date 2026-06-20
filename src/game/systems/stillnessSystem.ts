// src/game/systems/stillnessSystem.ts
export const STILLNESS_THRESHOLD_MS = 3000

export function isPlayerStill(
  lastMoveTime: number,
  now: number,
  thresholdMs = STILLNESS_THRESHOLD_MS
): boolean {
  return now - lastMoveTime >= thresholdMs
}

export function stillnessDuration(lastMoveTime: number, now: number): number {
  return Math.max(0, now - lastMoveTime)
}

export function stillnessIntensity(
  lastMoveTime: number,
  now: number,
  maxMs = 10000
): number {
  return Math.min(1, stillnessDuration(lastMoveTime, now) / maxMs)
}
