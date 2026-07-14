import { describe, it, expect } from 'vitest'
import { cameraBackDistance, canMove, clampCameraToRoom, LIVING_ROOM_BOUNDS } from './livingRoomCollision'

// The camera follows the boy 1.2 m behind him: with its back to a wall it
// was leaving the room (walls = single-face planes → fully black screen). It must
// stay strictly inside the walls, with a margin larger than the near plane (0.1).

describe('clampCameraToRoom', () => {
  it('does not touch a position already inside the room', () => {
    expect(clampCameraToRoom(0, 0)).toEqual([0, 0])
    expect(clampCameraToRoom(3.2, -2.1)).toEqual([3.2, -2.1])
  })

  it('brings the camera back inside when it exits through an east/west wall', () => {
    const [x] = clampCameraToRoom(7.9, 0)
    expect(x).toBeLessThan(7)
    const [x2] = clampCameraToRoom(-8.4, 0)
    expect(x2).toBeGreaterThan(-7)
  })

  it('brings the camera back inside when it exits through a north/south wall', () => {
    const [, z] = clampCameraToRoom(0, 6.9)
    expect(z).toBeLessThan(5.8)
    const [, z2] = clampCameraToRoom(0, -6.7)
    expect(z2).toBeGreaterThan(-5.8)
  })

  it('keeps a margin > near plane (0.1) relative to walls', () => {
    const [x] = clampCameraToRoom(7.9, 0)
    expect(7 - x).toBeGreaterThan(0.1)
    const [, z] = clampCameraToRoom(0, -9)
    expect(z - -5.8).toBeGreaterThan(0.1)
  })

  it('handles corners (both axes out of bounds at the same time)', () => {
    const [x, z] = clampCameraToRoom(8, -6.9)
    expect(x).toBeLessThan(7)
    expect(z).toBeGreaterThan(-5.8)
  })

  it('camera margin remains wider than the boy bounds', () => {
    // The boy goes up to ±6.7/±4.8: the camera must be able to stay behind
    // him without being clamped harder than him (otherwise visible jitter).
    const [x] = clampCameraToRoom(LIVING_ROOM_BOUNDS.maxX, 0)
    expect(x).toBeGreaterThanOrEqual(LIVING_ROOM_BOUNDS.maxX)
  })
})

// The camera 1.2 m behind the boy was clipping through furniture and walls:
// each mesh has an <Outlines> shell (BackSide, black) visible from inside →
// black screen whenever the camera enters an obstacle. cameraBackDistance
// shortens the camera pullback to the first obstruction (walls + AABB SALON_OBSTACLES).
// (backX, backZ) = normalised direction from the boy TOWARD the camera.

describe('cameraBackDistance', () => {
  const MAX_BACK = 1.2

  it('returns full pullback in open space', () => {
    // Spawn (0, 3) camera toward south: nothing between z=3 and z=4.2.
    expect(cameraBackDistance(0, 3, 0, 1, MAX_BACK)).toBe(MAX_BACK)
  })

  it('shortens pullback against a wall', () => {
    // Boy against north wall (z=5.5), camera pushed toward z=6.7:
    // wall limit = 5.65 → max pullback 0.15.
    expect(cameraBackDistance(0, 5.5, 0, 1, MAX_BACK)).toBeCloseTo(0.15, 5)
    // East wall: boy x=6.6, camera toward +x, limit 6.85 → 0.25.
    expect(cameraBackDistance(6.6, 0, 1, 0, MAX_BACK)).toBeCloseTo(0.25, 5)
  })

  it('shortens pullback in front of furniture (AABB expanded by camera margin)', () => {
    // Boy at z=3.1, camera toward south, table edge z=2.55+margin 0.15=2.70 → pullback 0.4.
    expect(cameraBackDistance(0, 3.1, 0, -1, MAX_BACK)).toBeCloseTo(0.4, 5)
  })

  it('returns 0 when the start point already touches the expanded zone', () => {
    // Boy flush against the table edge (z=1.5 < 1.6 expanded) pulling back into it.
    expect(cameraBackDistance(0, 1.5, 0, -1, MAX_BACK)).toBe(0)
  })

  it('ignores obstacles outside the ray', () => {
    // Near west wall heading north: no obstacle on x=-4, z∈[3, 4.2].
    expect(cameraBackDistance(-4, 3, 0, 1, MAX_BACK)).toBe(MAX_BACK)
  })

  it('detects a lateral entry into an AABB (slab test, not frontal only)', () => {
    // Pullback along east wall (x=6.3, z increasing): the ray enters the
    // potted plant [6.1, 6.7, 2.50, 3.10] expanded (z > 2.35) → from z=1.5 pullback 0.85.
    expect(cameraBackDistance(6.3, 1.5, 0, 1, MAX_BACK)).toBeCloseTo(0.85, 5)
  })

  it('never returns a negative pullback', () => {
    // Boy (impossible but defensive) beyond the wall limit.
    expect(cameraBackDistance(0, 5.75, 0, 1, MAX_BACK)).toBe(0)
  })
})

// A character already INSIDE an obstacle (seated NPC, boundary spawn) must be able to
// leave: canMove only blocks ENTERING an AABB from the outside.
describe('canMove', () => {
  it('allows movement in open space', () => {
    expect(canMove(0, 3, 0.1, 3)).toBe(true)
  })

  it('blocks entry into an obstacle from outside', () => {
    // Table AABB z max 2.55: entering from z=2.6 (outside) toward z=2.4 (inside) → denied.
    expect(canMove(0, 2.6, 0, 2.4)).toBe(false)
  })

  it('allows exit from an obstacle from inside', () => {
    // Starting inside the table zone (z=1.0), exiting toward z=1.5 → accepted.
    expect(canMove(0, 1.0, 0, 1.5)).toBe(true)
  })

  it('allows movement within the same obstacle (exit traversal)', () => {
    expect(canMove(0, 1.0, 0.2, 1.1)).toBe(true)
  })

  it('always blocks leaving the room (except through arches)', () => {
    // Solid north wall between the arches (kitchen arch x≈-2.5, arch 2 x∈[3.6,5.4])
    expect(canMove(1, 5.5, 1, 5.7)).toBe(false)
    // Arch 2 (x=4.5) open toward the corridor → passage allowed
    expect(canMove(4.5, 5.5, 4.5, 5.7)).toBe(true)
    // Zaguán arch (z=0) is open → passage allowed
    expect(canMove(6.6, 0, 6.8, 0)).toBe(true)
    // Solid east wall north of the arch (z=3 outside opening z∈[-0.9,0.9])
    expect(canMove(6.6, 3, 6.8, 3)).toBe(false)
  })
})
