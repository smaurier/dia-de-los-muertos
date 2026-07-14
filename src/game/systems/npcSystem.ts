// src/game/systems/npcSystem.ts
import type { GrandUnclePosition } from '../store/gameStore'

export type NPCState = 'idle' | 'walking' | 'sitting' | 'reacting'

export type ScenarioStep =
  | { type: 'walk'; target: [number, number, number] }
  | { type: 'sit'; targetId: string }
  | { type: 'idle'; duration: number }
  | { type: 'dialogue'; text: string; speakerName: string }
  | { type: 'react_to_player' }

export type Scenario = {
  id: string
  weight: number
  duration: [number, number]
  steps: ScenarioStep[]
}

export type NPCTier = 1 | 2 | 3

export type NPCConfig = {
  id: string
  name: string
  tier: NPCTier
  startPosition: [number, number, number]
  waypoints: [number, number, number][]
  scenarios: Scenario[]
  meshColor: string
  excludeFromSocialGraph?: boolean
  isChild?: boolean
  // GLB model (optional — falls back to placeholder geometry when absent)
  modelUrl?: string
  clipIdle?: string
  rotationY?: number
  headBoneName?: string
}

export function pickScenario(scenarios: Scenario[], seed: number): Scenario {
  const total = scenarios.reduce((sum, s) => sum + s.weight, 0)
  if (total === 0) return scenarios[0]
  let pick = ((seed * 2654435761) >>> 0) % total  // Knuth multiplicative hash
  for (const scenario of scenarios) {
    pick -= scenario.weight
    if (pick < 0) return scenario
  }
  return scenarios[scenarios.length - 1]
}

export function getNextStep(scenario: Scenario, stepIndex: number): ScenarioStep | null {
  return scenario.steps[stepIndex] ?? null
}

export function shouldUpdatePosition(npcState: NPCState): boolean {
  return npcState === 'walking'
}

export function getGrandUnclePosition(seed: number): GrandUnclePosition {
  const n = ((seed * 2654435761) >>> 0) % 100
  if (n < 60) return 'couch'
  if (n < 80) return 'buffet'
  return 'window'
}

export function shouldTurnTowardPlayer(
  pos: [number, number, number],
  playerPos: [number, number, number],
  threshold: number
): boolean {
  const dx = pos[0] - playerPos[0]
  const dz = pos[2] - playerPos[2]
  return Math.sqrt(dx * dx + dz * dz) <= threshold
}

/**
 * Push the player out of any NPC it overlaps. Pure: returns the resolved
 * [x, z]. Mirrors the loop previously inline in Player.tsx.
 */
export function resolvePlayerNpcCollision(
  px: number,
  pz: number,
  npcs: Iterable<[number, number]>,
  radius: number,
): [number, number] {
  let x = px
  let z = pz
  for (const [nx, nz] of npcs) {
    const dx = x - nx
    const dz = z - nz
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist < radius && dist > 0.001) {
      const inv = radius / dist
      x = nx + dx * inv
      z = nz + dz * inv
    }
  }
  return [x, z]
}
