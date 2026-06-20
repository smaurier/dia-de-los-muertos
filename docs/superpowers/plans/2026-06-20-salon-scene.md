# Salon Scene MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer la scène du couloir (Chapter 3) par un grand salon familial mexicain avec 22 personnages, système de scénarios par type, sous-titres espagnols en prototype, et le grand-oncle comme personnage observer central.

**Architecture:** Couche logique pure (npcSystem.ts, gameStore étendu) testée TDD. Couche scène (SalonRoom, FamilyMember, GrandUncle, Salon) en R3F avec MeshToonMaterial existant. Scénarios définis en data (familyConfig.ts), exécutés par composants. Sous-titres via `<Html>` Drei.

**Tech Stack:** React Three Fiber, MeshToonMaterial, @react-three/postprocessing (Outline), Drei Html, Zustand, Vitest (logique pure uniquement)

---

## File Map

| Action | Fichier | Rôle |
|--------|---------|------|
| Delete | `src/scene/chapter3/` | Supprimé entièrement |
| Move | `src/scene/chapter3/toonGradient.ts` → `src/scene/shared/toonGradient.ts` | Partagé entre scènes |
| Modify | `src/App.tsx` | `<Chapter3 />` → `<Salon />` |
| Modify | `src/game/store/gameStore.ts` | Ajouter `grandUnclePosition`, `salonArcPhase` |
| Modify | `src/game/store/gameStore.test.ts` | Tests nouveaux états |
| Create | `src/game/systems/npcSystem.ts` | Fonctions pures : scénarios, positions, proximité |
| Create | `src/game/systems/npcSystem.test.ts` | TDD complet |
| Create | `src/scene/salon/familyConfig.ts` | 20 configs NPC + scénarios + dialogue espagnol |
| Create | `src/scene/salon/SalonRoom.tsx` | Géométrie + éclairage |
| Create | `src/scene/salon/GrandUncle.tsx` | Observer, canapé, sous-titres |
| Create | `src/scene/salon/FamilyMember.tsx` | NPC générique 3 tiers + sous-titres |
| Create | `src/scene/salon/Salon.tsx` | Assembly + EffectComposer + arc scheduler |

---

## Task 1 : Cleanup — supprimer chapter3, déplacer toonGradient, stub Salon

**Files:**
- Delete: `src/scene/chapter3/` (5 fichiers)
- Create: `src/scene/shared/toonGradient.ts`
- Create: `src/scene/salon/Salon.tsx` (stub)
- Modify: `src/App.tsx`

- [ ] **Créer le dossier shared et déplacer toonGradient**

```bash
mkdir src/scene/shared
```

Créer `src/scene/shared/toonGradient.ts` :

```ts
// src/scene/shared/toonGradient.ts
import * as THREE from 'three'

const colors = new Uint8Array([40, 128, 255])
export const toonGradient = new THREE.DataTexture(colors, 3, 1, THREE.RedFormat)
toonGradient.magFilter = THREE.NearestFilter
toonGradient.minFilter = THREE.NearestFilter
toonGradient.needsUpdate = true
```

- [ ] **Créer stub Salon.tsx**

```tsx
// src/scene/salon/Salon.tsx
export function Salon() {
  return (
    <group>
      <ambientLight intensity={0.1} color="#f5c87a" />
    </group>
  )
}
```

- [ ] **Mettre à jour App.tsx**

```tsx
// src/App.tsx
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { Suspense } from 'react'
import { Player } from './scene/Player'
import { Salon } from './scene/salon/Salon'

const CONTROLS_MAP = [
  { name: 'forward',  keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left',     keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right',    keys: ['ArrowRight', 'KeyD'] },
  { name: 'hide',     keys: ['KeyE', 'Space'] },
]

export default function App() {
  return (
    <KeyboardControls map={CONTROLS_MAP}>
      <Canvas
        camera={{ fov: 65, near: 0.1, far: 100, position: [0, 1.1, 0] }}
        style={{ width: '100vw', height: '100vh', background: '#1a0e07' }}
      >
        <Suspense fallback={null}>
          <Player />
          <Salon />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  )
}
```

- [ ] **Supprimer chapter3**

```bash
rm -rf src/scene/chapter3
```

- [ ] **Vérifier les types**

```bash
npx tsc --noEmit
```

Sortie attendue : 0 erreur.

- [ ] **Lancer npm test — 42 tests doivent rester verts**

```bash
npm test
```

Sortie attendue : `42 passed`

- [ ] **Commit**

```bash
git add src/scene/shared/toonGradient.ts src/scene/salon/Salon.tsx src/App.tsx
git rm -r src/scene/chapter3/
git commit -m "refactor: supprimer chapter3, déplacer toonGradient vers shared, stub Salon"
```

---

## Task 2 : Étendre gameStore — grandUnclePosition + salonArcPhase (TDD)

**Files:**
- Modify: `src/game/store/gameStore.ts`
- Modify: `src/game/store/gameStore.test.ts`

- [ ] **Écrire les tests qui échouent**

Ajouter dans `src/game/store/gameStore.test.ts` :

```ts
describe('grandUnclePosition', () => {
  beforeEach(() => {
    useGameStore.setState({ grandUnclePosition: 'couch' })
  })

  it('starts at couch', () => {
    expect(useGameStore.getState().grandUnclePosition).toBe('couch')
  })

  it('can move to buffet', () => {
    useGameStore.getState().setGrandUnclePosition('buffet')
    expect(useGameStore.getState().grandUnclePosition).toBe('buffet')
  })

  it('can move to window', () => {
    useGameStore.getState().setGrandUnclePosition('window')
    expect(useGameStore.getState().grandUnclePosition).toBe('window')
  })
})

describe('salonArcPhase', () => {
  beforeEach(() => {
    useGameStore.setState({ salonArcPhase: 0 })
  })

  it('starts at phase 0', () => {
    expect(useGameStore.getState().salonArcPhase).toBe(0)
  })

  it('advances to phase 1', () => {
    useGameStore.getState().setSalonArcPhase(1)
    expect(useGameStore.getState().salonArcPhase).toBe(1)
  })

  it('advances to phase 2', () => {
    useGameStore.getState().setSalonArcPhase(2)
    expect(useGameStore.getState().salonArcPhase).toBe(2)
  })
})
```

- [ ] **Vérifier que les tests échouent**

```bash
npx vitest run src/game/store/gameStore.test.ts
```

Sortie attendue : FAIL — `grandUnclePosition` not found

- [ ] **Mettre à jour gameStore.ts**

Ajouter les types et état dans `src/game/store/gameStore.ts` :

```ts
// src/game/store/gameStore.ts
import { create } from 'zustand'

export enum Chapter {
  ONE = 1, TWO = 2, THREE = 3, FOUR = 4, FIVE = 5,
  SIX = 6, SEVEN = 7, EIGHT = 8, NINE = 9,
}

export enum GamePhase {
  HIDING = 'HIDING', EXPLORING = 'EXPLORING', LOST = 'LOST',
  RETURNING = 'RETURNING', END = 'END',
}

export type GrandUnclePosition = 'couch' | 'buffet' | 'window'
export type SalonArcPhase = 0 | 1 | 2

interface GameState {
  chapter: Chapter
  phase: GamePhase
  salonAudibilityLevel: number
  houseScale: number
  adultHasLeft: boolean
  grandUnclePosition: GrandUnclePosition
  salonArcPhase: SalonArcPhase
  setChapter: (chapter: Chapter) => void
  setPhase: (phase: GamePhase) => void
  setSalonAudibility: (level: number) => void
  setHouseScale: (scale: number) => void
  setAdultHasLeft: (value: boolean) => void
  setGrandUnclePosition: (pos: GrandUnclePosition) => void
  setSalonArcPhase: (phase: SalonArcPhase) => void
}

export const useGameStore = create<GameState>((set) => ({
  chapter: Chapter.THREE,
  phase: GamePhase.EXPLORING,
  salonAudibilityLevel: 0.8,
  houseScale: 1.0,
  adultHasLeft: false,
  grandUnclePosition: 'couch',
  salonArcPhase: 0,
  setChapter: (chapter) => set({ chapter }),
  setPhase: (phase) => set({ phase }),
  setSalonAudibility: (level) =>
    set({ salonAudibilityLevel: Math.max(0, Math.min(1, level)) }),
  setHouseScale: (scale) =>
    set({ houseScale: Math.max(1, Math.min(2, scale)) }),
  setAdultHasLeft: (adultHasLeft) => set({ adultHasLeft }),
  setGrandUnclePosition: (grandUnclePosition) => set({ grandUnclePosition }),
  setSalonArcPhase: (salonArcPhase) => set({ salonArcPhase }),
}))
```

- [ ] **Vérifier que tous les tests passent**

```bash
npm test
```

Sortie attendue : `48 passed` (42 existants + 6 nouveaux)

- [ ] **Commit**

```bash
git add src/game/store/gameStore.ts src/game/store/gameStore.test.ts
git commit -m "feat: gameStore — grandUnclePosition + salonArcPhase"
```

---

## Task 3 : npcSystem.ts (TDD — fonctions pures)

**Files:**
- Create: `src/game/systems/npcSystem.ts`
- Create: `src/game/systems/npcSystem.test.ts`

- [ ] **Écrire les tests**

Créer `src/game/systems/npcSystem.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import {
  pickScenario,
  getNextStep,
  shouldUpdatePosition,
  getGrandUnclePosition,
  shouldTurnTowardPlayer,
} from './npcSystem'
import type { Scenario } from './npcSystem'

const scenarioA: Scenario = {
  id: 'a', weight: 3, duration: [5, 10],
  steps: [{ type: 'idle', duration: 5 }],
}
const scenarioB: Scenario = {
  id: 'b', weight: 1, duration: [3, 6],
  steps: [{ type: 'dialogue', text: '¿Qué tal?', speakerName: 'Oncle 1' }],
}

describe('pickScenario', () => {
  it('always returns a scenario from the array', () => {
    const result = pickScenario([scenarioA, scenarioB], 42)
    expect(['a', 'b']).toContain(result.id)
  })

  it('is deterministic with same seed', () => {
    const r1 = pickScenario([scenarioA, scenarioB], 7)
    const r2 = pickScenario([scenarioA, scenarioB], 7)
    expect(r1.id).toBe(r2.id)
  })

  it('produces different results with different seeds', () => {
    const results = new Set(
      Array.from({ length: 20 }, (_, i) =>
        pickScenario([scenarioA, scenarioB], i).id
      )
    )
    expect(results.size).toBeGreaterThan(1)
  })

  it('respects weights — higher weight picked more often', () => {
    const picks = Array.from({ length: 100 }, (_, i) =>
      pickScenario([scenarioA, scenarioB], i * 7 + 3).id
    )
    const aCount = picks.filter(id => id === 'a').length
    expect(aCount).toBeGreaterThan(50)
  })
})

describe('getNextStep', () => {
  const s: Scenario = {
    id: 'x', weight: 1, duration: [5, 10],
    steps: [
      { type: 'idle', duration: 3 },
      { type: 'dialogue', text: 'Hola', speakerName: 'Test' },
    ],
  }

  it('returns first step at index 0', () => {
    expect(getNextStep(s, 0)?.type).toBe('idle')
  })

  it('returns second step at index 1', () => {
    expect(getNextStep(s, 1)?.type).toBe('dialogue')
  })

  it('returns null when index out of bounds', () => {
    expect(getNextStep(s, 2)).toBeNull()
  })
})

describe('shouldUpdatePosition', () => {
  it('returns true for walking', () => {
    expect(shouldUpdatePosition('walking')).toBe(true)
  })

  it('returns false for idle', () => {
    expect(shouldUpdatePosition('idle')).toBe(false)
  })

  it('returns false for sitting', () => {
    expect(shouldUpdatePosition('sitting')).toBe(false)
  })

  it('returns false for reacting', () => {
    expect(shouldUpdatePosition('reacting')).toBe(false)
  })
})

describe('getGrandUnclePosition', () => {
  it('returns a valid position', () => {
    const valid = ['couch', 'buffet', 'window']
    for (let i = 0; i < 20; i++) {
      expect(valid).toContain(getGrandUnclePosition(i))
    }
  })

  it('is deterministic', () => {
    expect(getGrandUnclePosition(42)).toBe(getGrandUnclePosition(42))
  })

  it('returns couch most often (~60%)', () => {
    const results = Array.from({ length: 100 }, (_, i) => getGrandUnclePosition(i))
    const couches = results.filter(r => r === 'couch').length
    expect(couches).toBeGreaterThan(45)
    expect(couches).toBeLessThan(80)
  })
})

describe('shouldTurnTowardPlayer', () => {
  it('returns true when player within threshold', () => {
    expect(shouldTurnTowardPlayer([0, 0, 0], [1, 0, 0], 2)).toBe(true)
  })

  it('returns false when player beyond threshold', () => {
    expect(shouldTurnTowardPlayer([0, 0, 0], [5, 0, 0], 2)).toBe(false)
  })

  it('returns true on threshold boundary', () => {
    expect(shouldTurnTowardPlayer([0, 0, 0], [2, 0, 0], 2)).toBe(true)
  })
})
```

- [ ] **Vérifier que les tests échouent**

```bash
npx vitest run src/game/systems/npcSystem.test.ts
```

Sortie attendue : FAIL — module not found

- [ ] **Implémenter npcSystem.ts**

```ts
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
}

export function pickScenario(scenarios: Scenario[], seed: number): Scenario {
  const total = scenarios.reduce((sum, s) => sum + s.weight, 0)
  let pick = ((seed * 2654435761) >>> 0) % total
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
```

- [ ] **Vérifier que tous les tests passent**

```bash
npm test
```

Sortie attendue : `~62 passed` (48 existants + nouveaux npcSystem tests)

- [ ] **Commit**

```bash
git add src/game/systems/npcSystem.ts src/game/systems/npcSystem.test.ts
git commit -m "feat: npcSystem — pickScenario, getNextStep, shouldUpdatePosition, grandUncle helpers"
```

---

## Task 4 : familyConfig.ts — 20 NPCs + scénarios + dialogue espagnol

**Files:**
- Create: `src/scene/salon/familyConfig.ts`

Note : pas de tests — data pure. Le grand-oncle n'est PAS dans ce fichier (composant dédié).

- [ ] **Créer familyConfig.ts**

```ts
// src/scene/salon/familyConfig.ts
import type { NPCConfig, Scenario } from '../../game/systems/npcSystem'

// ─── Scénarios par type ────────────────────────────────────────────────

const mamanScenarios: Scenario[] = [
  {
    id: 'maman_sert', weight: 3, duration: [8, 15],
    steps: [
      { type: 'walk', target: [-1, 0, -3] },
      { type: 'dialogue', text: '¿Alguien quiere más?', speakerName: 'Mamá' },
      { type: 'idle', duration: 4 },
      { type: 'walk', target: [-1, 0, 1] },
    ],
  },
  {
    id: 'maman_cuisine', weight: 2, duration: [10, 18],
    steps: [
      { type: 'dialogue', text: 'Voy a la cocina un momento.', speakerName: 'Mamá' },
      { type: 'walk', target: [1, 0, -4.5] },
      { type: 'idle', duration: 6 },
      { type: 'walk', target: [-1, 0, 0] },
    ],
  },
  {
    id: 'maman_assise', weight: 4, duration: [12, 20],
    steps: [
      { type: 'sit', targetId: 'table-chair-1' },
      { type: 'idle', duration: 10 },
      { type: 'dialogue', text: '¡Ven a comer, mijo!', speakerName: 'Mamá' },
    ],
  },
  {
    id: 'maman_embrasse', weight: 1, duration: [5, 8],
    steps: [
      { type: 'walk', target: [0, 0, 2] },
      { type: 'dialogue', text: '¿Estás bien, mi amor?', speakerName: 'Mamá' },
      { type: 'idle', duration: 3 },
    ],
  },
]

const papaScenarios: Scenario[] = [
  {
    id: 'papa_assis', weight: 5, duration: [15, 25],
    steps: [
      { type: 'sit', targetId: 'table-chair-2' },
      { type: 'idle', duration: 12 },
      { type: 'dialogue', text: '¡Qué buena está la comida!', speakerName: 'Papá' },
    ],
  },
  {
    id: 'papa_debout', weight: 2, duration: [8, 12],
    steps: [
      { type: 'walk', target: [-3, 0, -1] },
      { type: 'dialogue', text: '¿Otro tequila, cuñado?', speakerName: 'Papá' },
      { type: 'idle', duration: 4 },
      { type: 'walk', target: [-1.5, 0, 0.5] },
    ],
  },
  {
    id: 'papa_tv', weight: 1, duration: [10, 15],
    steps: [
      { type: 'walk', target: [2, 0, 3.5] },
      { type: 'idle', duration: 8 },
      { type: 'dialogue', text: '¡Gol! ¡Gol!', speakerName: 'Papá' },
      { type: 'walk', target: [-1, 0, 0] },
    ],
  },
]

const oncleScenarios: Scenario[] = [
  {
    id: 'oncle_rit', weight: 4, duration: [8, 14],
    steps: [
      { type: 'sit', targetId: 'table-chair-3' },
      { type: 'idle', duration: 5 },
      { type: 'dialogue', text: '¡Ja, ja, ja! ¡Eso sí que es bueno!', speakerName: 'Tío' },
    ],
  },
  {
    id: 'oncle_appelle', weight: 2, duration: [6, 10],
    steps: [
      { type: 'dialogue', text: '¡Oye, pásame el pan!', speakerName: 'Tío' },
      { type: 'idle', duration: 3 },
    ],
  },
  {
    id: 'oncle_marche', weight: 2, duration: [10, 16],
    steps: [
      { type: 'walk', target: [-4, 0, -2] },
      { type: 'idle', duration: 4 },
      { type: 'dialogue', text: '¿Y cómo va el trabajo?', speakerName: 'Tío' },
      { type: 'walk', target: [-1, 0, 0] },
    ],
  },
  {
    id: 'oncle_boit', weight: 3, duration: [6, 10],
    steps: [
      { type: 'idle', duration: 4 },
      { type: 'dialogue', text: '¡Salud!', speakerName: 'Tío' },
      { type: 'idle', duration: 3 },
    ],
  },
]

const tanteScenarios: Scenario[] = [
  {
    id: 'tante_parle', weight: 4, duration: [10, 16],
    steps: [
      { type: 'sit', targetId: 'table-chair-4' },
      { type: 'dialogue', text: '¿Ya viste lo que pasó con los vecinos?', speakerName: 'Tía' },
      { type: 'idle', duration: 8 },
    ],
  },
  {
    id: 'tante_aide', weight: 2, duration: [8, 14],
    steps: [
      { type: 'dialogue', text: '¿Te ayudo, cuñada?', speakerName: 'Tía' },
      { type: 'walk', target: [0, 0, -4] },
      { type: 'idle', duration: 5 },
      { type: 'walk', target: [-0.5, 0, 0.5] },
    ],
  },
  {
    id: 'tante_enfant', weight: 2, duration: [6, 10],
    steps: [
      { type: 'walk', target: [0, 0, 1] },
      { type: 'dialogue', text: '¡Ven aquí, chiquito!', speakerName: 'Tía' },
      { type: 'idle', duration: 3 },
    ],
  },
]

const cousinScenarios: Scenario[] = [
  {
    id: 'cousin_court', weight: 3, duration: [5, 8],
    steps: [
      { type: 'walk', target: [3, 0, -2] },
      { type: 'walk', target: [-3, 0, 2] },
    ],
  },
  {
    id: 'cousin_cache', weight: 2, duration: [8, 14],
    steps: [
      { type: 'walk', target: [-1, 0, 0.8] },
      { type: 'sit', targetId: 'under-table' },
      { type: 'idle', duration: 6 },
      { type: 'walk', target: [1, 0, 3] },
    ],
  },
  {
    id: 'cousin_console', weight: 2, duration: [15, 25],
    steps: [
      { type: 'walk', target: [3, 0, 4] },
      { type: 'sit', targetId: 'fauteuil' },
      { type: 'idle', duration: 18 },
    ],
  },
  {
    id: 'cousin_interpelle', weight: 2, duration: [4, 7],
    steps: [
      { type: 'dialogue', text: '¡Oye, ven! ¡Te toca!', speakerName: 'Primo' },
      { type: 'walk', target: [2, 0, 2] },
    ],
  },
]

const enfantScenarios: Scenario[] = [
  {
    id: 'enfant_court', weight: 4, duration: [4, 7],
    steps: [
      { type: 'walk', target: [2, 0, -1] },
      { type: 'walk', target: [-2, 0, 2] },
      { type: 'walk', target: [0, 0, 0] },
    ],
  },
  {
    id: 'enfant_cache_table', weight: 3, duration: [8, 14],
    steps: [
      { type: 'walk', target: [-0.5, 0, 0.5] },
      { type: 'sit', targetId: 'under-table' },
      { type: 'idle', duration: 6 },
      { type: 'walk', target: [1, 0, 2] },
    ],
  },
  {
    id: 'enfant_pleure', weight: 1, duration: [5, 8],
    steps: [
      { type: 'idle', duration: 2 },
      { type: 'dialogue', text: '¡Mamáaaa!', speakerName: 'Niño' },
      { type: 'walk', target: [-1, 0, 0] },
    ],
  },
  {
    id: 'enfant_joue', weight: 3, duration: [6, 10],
    steps: [
      { type: 'walk', target: [1, 0, 3] },
      { type: 'idle', duration: 5 },
      { type: 'walk', target: [-1, 0, 1] },
    ],
  },
]

const oncleJeuneScenarios: Scenario[] = [
  ...oncleScenarios,
  {
    id: 'oncle_jeune_enfant', weight: 3, duration: [6, 10],
    steps: [
      { type: 'walk', target: [1, 0, 2] },
      { type: 'dialogue', text: '¡Oye! ¿A dónde vas tan rápido?', speakerName: 'Tío Joven' },
      { type: 'idle', duration: 3 },
    ],
  },
]

// ─── Config des 20 NPCs ────────────────────────────────────────────────

export const familyConfig: NPCConfig[] = [
  // Tier 2 — semi-actifs
  {
    id: 'maman', name: 'Mamá', tier: 2,
    startPosition: [-1, 0, 0.5],
    waypoints: [[-1, 0, 1], [-1, 0, -2], [1, 0, -4.5]],
    scenarios: mamanScenarios,
    meshColor: '#c8956c',
  },
  {
    id: 'papa', name: 'Papá', tier: 2,
    startPosition: [-1.5, 0, 0],
    waypoints: [[-1.5, 0, 0], [-3, 0, -1], [2, 0, 3.5]],
    scenarios: papaScenarios,
    meshColor: '#8B6543',
  },
  {
    id: 'oncle1', name: 'Tío Carlos', tier: 2,
    startPosition: [-3, 0, -1],
    waypoints: [[-3, 0, -1], [-4, 0, -2], [-1, 0, 0]],
    scenarios: oncleScenarios,
    meshColor: '#7A5533',
  },
  {
    id: 'oncle2', name: 'Tío Roberto', tier: 2,
    startPosition: [1, 0, -1],
    waypoints: [[1, 0, -1], [-1, 0, -2], [0, 0, 0]],
    scenarios: oncleScenarios,
    meshColor: '#6B4423',
  },
  {
    id: 'oncle3', name: 'Tío Miguel', tier: 2,
    startPosition: [-2, 0, 1],
    waypoints: [[-2, 0, 1], [-3, 0, 0], [-1, 0, -1]],
    scenarios: oncleScenarios,
    meshColor: '#8B6040',
  },
  {
    id: 'tante1', name: 'Tía Rosa', tier: 2,
    startPosition: [0, 0, -1.5],
    waypoints: [[0, 0, -1.5], [0, 0, -4], [-1, 0, 0]],
    scenarios: tanteScenarios,
    meshColor: '#C27B5A',
  },
  {
    id: 'tante2', name: 'Tía Elena', tier: 2,
    startPosition: [-2, 0, -0.5],
    waypoints: [[-2, 0, -0.5], [-1, 0, 1], [0, 0, -2]],
    scenarios: tanteScenarios,
    meshColor: '#B8705A',
  },
  {
    id: 'enfant4', name: 'Niño', tier: 2,
    startPosition: [0, 0, 1],
    waypoints: [[0, 0, 1]],
    scenarios: [{ id: 'enfant4_sage', weight: 1, duration: [20, 30], steps: [{ type: 'sit', targetId: 'table-chair-5' }, { type: 'idle', duration: 20 }] }],
    meshColor: '#D4956A',
  },

  // Tier 1 — actifs
  {
    id: 'cousin1', name: 'Primo Diego', tier: 1,
    startPosition: [1, 0, 3],
    waypoints: [[1, 0, 3], [-2, 0, -1], [3, 0, -2], [0, 0, 1]],
    scenarios: cousinScenarios,
    meshColor: '#A87050',
  },
  {
    id: 'cousine1', name: 'Prima Sofía', tier: 1,
    startPosition: [-1, 0, 2],
    waypoints: [[-1, 0, 2], [2, 0, -1], [-3, 0, 1]],
    scenarios: cousinScenarios,
    meshColor: '#D4906A',
  },
  {
    id: 'cousine2', name: 'Prima Valentina', tier: 1,
    startPosition: [2, 0, 1],
    waypoints: [[2, 0, 1], [-1, 0, -2], [1, 0, 3]],
    scenarios: cousinScenarios,
    meshColor: '#C88060',
  },
  {
    id: 'oncle-jeune', name: 'Tío Joven', tier: 1,
    startPosition: [0, 0, -2],
    waypoints: [[0, 0, -2], [1, 0, 2], [-2, 0, 1], [-1, 0, -3]],
    scenarios: oncleJeuneScenarios,
    meshColor: '#7B5535',
  },
  {
    id: 'tante-jeune', name: 'Tía Joven', tier: 1,
    startPosition: [1, 0, -1],
    waypoints: [[1, 0, -1], [0, 0, 2], [-1, 0, -3]],
    scenarios: tanteScenarios,
    meshColor: '#C07060',
  },
  {
    id: 'enfant1', name: 'Niño', tier: 1,
    startPosition: [2, 0, 2],
    waypoints: [[2, 0, 2], [-2, 0, -1], [1, 0, -2], [3, 0, 1]],
    scenarios: enfantScenarios,
    meshColor: '#D4906A',
  },
  {
    id: 'enfant2', name: 'Niña', tier: 1,
    startPosition: [-1, 0, 3],
    waypoints: [[-1, 0, 3], [2, 0, -2], [0, 0, 1]],
    scenarios: enfantScenarios,
    meshColor: '#E0A080',
  },
  {
    id: 'enfant3', name: 'Niño', tier: 1,
    startPosition: [3, 0, -1],
    waypoints: [[3, 0, -1], [-1, 0, 2], [1, 0, -3]],
    scenarios: enfantScenarios,
    meshColor: '#C88050',
  },

  // Tier 3 — statiques
  {
    id: 'soeur1', name: 'Hermana', tier: 3,
    startPosition: [-0.5, 0, 0.8],
    waypoints: [],
    scenarios: [],
    meshColor: '#E0A888',
  },
  {
    id: 'soeur2', name: 'Hermana', tier: 3,
    startPosition: [0.5, 0, 0.3],
    waypoints: [],
    scenarios: [],
    meshColor: '#E8B090',
  },
  {
    id: 'grande-tante', name: 'Tía Abuela', tier: 3,
    startPosition: [-5.5, 0, -3],
    waypoints: [],
    scenarios: [],
    meshColor: '#A88068',
  },
  {
    id: 'bebe', name: 'Bebé', tier: 3,
    startPosition: [-1, 0, 0.5],
    waypoints: [],
    scenarios: [],
    meshColor: '#F0C0A0',
  },
]
```

- [ ] **Vérifier les types**

```bash
npx tsc --noEmit
```

Sortie attendue : 0 erreur.

- [ ] **Commit**

```bash
git add src/scene/salon/familyConfig.ts
git commit -m "feat: familyConfig — 20 NPCs, scénarios par type, dialogue espagnol"
```

---

## Task 5 : SalonRoom.tsx — géométrie 14×10m + éclairage

**Files:**
- Create: `src/scene/salon/SalonRoom.tsx`

- [ ] **Créer SalonRoom.tsx**

```tsx
// src/scene/salon/SalonRoom.tsx
import { toonGradient } from '../shared/toonGradient'

const CHAIR_POSITIONS: [number, number, number][] = [
  // Front of table (z=1.1)
  [-3.5, 0, 1.1], [-2.5, 0, 1.1], [-1.5, 0, 1.1], [-0.5, 0, 1.1],
  [0.5, 0, 1.1], [1.5, 0, 1.1], [2.5, 0, 1.1],
  // Back of table (z=-1.1)
  [-3.5, 0, -1.1], [-2.5, 0, -1.1], [-1.5, 0, -1.1], [-0.5, 0, -1.1],
  [0.5, 0, -1.1], [1.5, 0, -1.1], [2.5, 0, -1.1],
  // Left end (x=-4.3)
  [-4.3, 0, -0.35], [-4.3, 0, 0.35],
  // Right end (x=3.3)
  [3.3, 0, -0.35], [3.3, 0, 0.35],
  // 2 extra against wall
  [-6, 0, -3], [-6, 0, -3.8],
]

export function SalonRoom() {
  return (
    <group>
      {/* Éclairage */}
      <ambientLight intensity={0.1} color="#f5c87a" />
      <pointLight position={[0, 3.0, 0]} intensity={2.0} color="#f0d890" distance={14} decay={2} />
      <directionalLight intensity={0.6} color="#f5c87a" position={[-6, 2, 0]} />
      <pointLight position={[6.3, 1.8, 3]} intensity={0.4} color="#8ab4f8" distance={3} decay={2} />

      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshToonMaterial color="#7A5533" gradientMap={toonGradient} />
      </mesh>

      {/* Plafond */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshToonMaterial color="#F0E0C8" gradientMap={toonGradient} />
      </mesh>

      {/* Mur Nord (entrée) — z=5 */}
      <mesh position={[0, 1.6, 5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[14, 3.2]} />
        <meshToonMaterial color="#D4B896" gradientMap={toonGradient} />
      </mesh>

      {/* Mur Sud (cuisine) — z=-5 */}
      <mesh position={[0, 1.6, -5]}>
        <planeGeometry args={[14, 3.2]} />
        <meshToonMaterial color="#D4B896" gradientMap={toonGradient} />
      </mesh>

      {/* Mur Est — x=7 */}
      <mesh position={[7, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 3.2]} />
        <meshToonMaterial color="#C9A87C" gradientMap={toonGradient} />
      </mesh>

      {/* Mur Ouest (fenêtre) — x=-7 */}
      <mesh position={[-7, 1.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 3.2]} />
        <meshToonMaterial color="#C9A87C" gradientMap={toonGradient} />
      </mesh>

      {/* Table centrale */}
      <mesh position={[-0.5, 0.375, 0]}>
        <boxGeometry args={[8, 0.75, 2.2]} />
        <meshToonMaterial color="#5C3010" gradientMap={toonGradient} />
      </mesh>

      {/* 20 chaises */}
      {CHAIR_POSITIONS.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Assise */}
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[0.45, 0.05, 0.45]} />
            <meshToonMaterial color="#3D2010" gradientMap={toonGradient} />
          </mesh>
          {/* Dossier */}
          <mesh position={[0, 0.55, -0.2]}>
            <boxGeometry args={[0.45, 0.6, 0.06]} />
            <meshToonMaterial color="#3D2010" gradientMap={toonGradient} />
          </mesh>
          {/* Pieds */}
          {([[0.18, -0.18], [0.18, 0.18], [-0.18, -0.18], [-0.18, 0.18]] as [number,number][]).map(([px, pz], j) => (
            <mesh key={j} position={[px, 0.1, pz]}>
              <boxGeometry args={[0.04, 0.2, 0.04]} />
              <meshToonMaterial color="#2A1008" gradientMap={toonGradient} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Canapé 3 places — zone TV, droite entrée */}
      {/* Corps */}
      <mesh position={[5, 0.45, 2.5]}>
        <boxGeometry args={[2.8, 0.9, 0.9]} />
        <meshToonMaterial color="#4A3020" gradientMap={toonGradient} />
      </mesh>
      {/* Dossier canapé */}
      <mesh position={[5, 0.95, 2.1]}>
        <boxGeometry args={[2.8, 0.8, 0.15]} />
        <meshToonMaterial color="#3A2010" gradientMap={toonGradient} />
      </mesh>
      {/* Accoudoir gauche */}
      <mesh position={[3.7, 0.65, 2.5]}>
        <boxGeometry args={[0.15, 0.5, 0.9]} />
        <meshToonMaterial color="#3A2010" gradientMap={toonGradient} />
      </mesh>
      {/* Accoudoir droit */}
      <mesh position={[6.3, 0.65, 2.5]}>
        <boxGeometry args={[0.15, 0.5, 0.9]} />
        <meshToonMaterial color="#3A2010" gradientMap={toonGradient} />
      </mesh>

      {/* Repose-pied */}
      <mesh position={[5, 0.2, 3.5]}>
        <boxGeometry args={[1.6, 0.4, 0.5]} />
        <meshToonMaterial color="#3A2010" gradientMap={toonGradient} />
      </mesh>

      {/* Fauteuil */}
      <mesh position={[3, 0.35, 4]}>
        <boxGeometry args={[0.9, 0.7, 0.9]} />
        <meshToonMaterial color="#4A3020" gradientMap={toonGradient} />
      </mesh>
      <mesh position={[3, 0.75, 3.6]}>
        <boxGeometry args={[0.9, 0.7, 0.12]} />
        <meshToonMaterial color="#3A2010" gradientMap={toonGradient} />
      </mesh>

      {/* Télé (mur Est) */}
      <mesh position={[6.85, 1.8, 2.5]}>
        <boxGeometry args={[0.08, 1.0, 1.8]} />
        <meshToonMaterial color="#1a1a1a" gradientMap={toonGradient} emissive="#3a4a6a" emissiveIntensity={0.6} />
      </mesh>

      {/* Buffet / crédence — mur Ouest */}
      <mesh position={[-6.3, 0.5, -2.5]}>
        <boxGeometry args={[0.6, 1.0, 2.0]} />
        <meshToonMaterial color="#4A3010" gradientMap={toonGradient} />
      </mesh>
    </group>
  )
}
```

- [ ] **Ajouter SalonRoom à Salon.tsx (temporaire pour valider)**

```tsx
// src/scene/salon/Salon.tsx
import { SalonRoom } from './SalonRoom'

export function Salon() {
  return (
    <group>
      <SalonRoom />
    </group>
  )
}
```

- [ ] **Vérifier les types**

```bash
npx tsc --noEmit
```

- [ ] **Lancer le dev server et valider visuellement**

```bash
npm run dev
```

Vérifier : salon visible, 20 chaises autour de la table, zone TV côté droit de l'entrée, éclairage chaud.

- [ ] **Commit**

```bash
git add src/scene/salon/SalonRoom.tsx src/scene/salon/Salon.tsx
git commit -m "feat: SalonRoom — géométrie 14x10m, 20 chaises, zone TV, éclairage toon"
```

---

## Task 6 : GrandUncle.tsx — observer sur canapé

**Files:**
- Create: `src/scene/salon/GrandUncle.tsx`

- [ ] **Créer GrandUncle.tsx**

```tsx
// src/scene/salon/GrandUncle.tsx
import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { toonGradient } from '../shared/toonGradient'
import { useGameStore } from '../../game/store/gameStore'
import { shouldTurnTowardPlayer, pickScenario } from '../../game/systems/npcSystem'
import type { Scenario } from '../../game/systems/npcSystem'

const GRAND_UNCLE_POSITIONS: Record<string, [number, number, number]> = {
  couch:  [5, 0, 2.5],
  buffet: [-6, 0, -2.5],
  window: [-6, 0, 2],
}

const GRAND_UNCLE_SCENARIOS: Scenario[] = [
  {
    id: 'watch_tv', weight: 5, duration: [10, 20],
    steps: [{ type: 'idle', duration: 12 }],
  },
  {
    id: 'laugh_at_tv', weight: 2, duration: [3, 5],
    steps: [
      { type: 'idle', duration: 1 },
      { type: 'dialogue', text: '¡Ja ja ja!', speakerName: 'Tío Abuelo' },
      { type: 'idle', duration: 2 },
    ],
  },
  {
    id: 'adjust_on_couch', weight: 2, duration: [4, 6],
    steps: [{ type: 'idle', duration: 4 }],
  },
  {
    id: 'look_around', weight: 1, duration: [3, 5],
    steps: [{ type: 'react_to_player' }, { type: 'idle', duration: 3 }],
  },
]

interface GrandUncleProps {
  meshRef?: React.RefObject<THREE.Group | null>
}

export function GrandUncle({ meshRef }: GrandUncleProps) {
  const internalRef = useRef<THREE.Group>(null)
  const ref = meshRef ?? internalRef
  const headRef = useRef<THREE.Mesh>(null)
  const grandUnclePosition = useGameStore(s => s.grandUnclePosition)
  const { camera } = useThree()

  const [subtitle, setSubtitle] = useState<string | null>(null)
  const scenarioTimer = useRef(0)
  const currentScenario = useRef<Scenario>(GRAND_UNCLE_SCENARIOS[0])
  const seedRef = useRef(Math.floor(Math.random() * 1000))

  useEffect(() => {
    currentScenario.current = pickScenario(GRAND_UNCLE_SCENARIOS, seedRef.current)
  }, [])

  useFrame((_, delta) => {
    const group = ref.current
    if (!group) return

    // Head turn toward player when nearby
    const playerPos: [number, number, number] = [camera.position.x, camera.position.y, camera.position.z]
    const pos = group.position
    const npcPos: [number, number, number] = [pos.x, pos.y, pos.z]

    if (headRef.current && shouldTurnTowardPlayer(npcPos, playerPos, 3)) {
      const dir = new THREE.Vector3(
        playerPos[0] - pos.x, 0, playerPos[2] - pos.z
      ).normalize()
      headRef.current.rotation.y = Math.atan2(dir.x, dir.z)
    } else if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y, 0, delta * 2
      )
    }

    // Scenario timer
    scenarioTimer.current += delta
    const [min, max] = currentScenario.current.duration
    const duration = min + Math.random() * (max - min)

    if (scenarioTimer.current > duration) {
      scenarioTimer.current = 0
      seedRef.current = (seedRef.current + 1337) % 10000
      currentScenario.current = pickScenario(GRAND_UNCLE_SCENARIOS, seedRef.current)

      if (currentScenario.current.id === 'laugh_at_tv') {
        setSubtitle('¡Ja ja ja!')
        setTimeout(() => setSubtitle(null), 2500)
      }
    }
  })

  const worldPos = GRAND_UNCLE_POSITIONS[grandUnclePosition]

  return (
    <group ref={ref} position={worldPos}>
      {/* Corps */}
      <mesh position={[0, 0.875, 0]}>
        <capsuleGeometry args={[0.25, 1.25, 4, 8]} />
        <meshToonMaterial color="#2a1a0e" gradientMap={toonGradient} />
      </mesh>
      {/* Tête */}
      <mesh ref={headRef} position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshToonMaterial color="#c8956c" gradientMap={toonGradient} />
      </mesh>
      {/* Sous-titre */}
      {subtitle && (
        <Html position={[0, 2.2, 0]} center distanceFactor={6}>
          <div style={{
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '13px',
            whiteSpace: 'nowrap',
            fontFamily: 'sans-serif',
          }}>
            <span style={{ color: '#f5c87a', fontWeight: 'bold' }}>Tío Abuelo</span>
            {' '}{subtitle}
          </div>
        </Html>
      )}
    </group>
  )
}
```

- [ ] **Ajouter GrandUncle à Salon.tsx**

```tsx
// src/scene/salon/Salon.tsx
import { useRef } from 'react'
import * as THREE from 'three'
import { SalonRoom } from './SalonRoom'
import { GrandUncle } from './GrandUncle'

export function Salon() {
  const grandUncleRef = useRef<THREE.Group>(null)

  return (
    <group>
      <SalonRoom />
      <GrandUncle meshRef={grandUncleRef} />
    </group>
  )
}
```

- [ ] **Vérifier les types + valider visuellement**

```bash
npx tsc --noEmit
npm run dev
```

Vérifier : grand-oncle visible immédiatement à droite en entrant, sous-titre "¡Ja ja ja!" apparaît parfois, tête tourne si on s'approche.

- [ ] **Commit**

```bash
git add src/scene/salon/GrandUncle.tsx src/scene/salon/Salon.tsx
git commit -m "feat: GrandUncle — observer canapé, sous-titres, head turn joueur"
```

---

## Task 7 : FamilyMember.tsx — NPC générique 3 tiers + sous-titres

**Files:**
- Create: `src/scene/salon/FamilyMember.tsx`

- [ ] **Créer FamilyMember.tsx**

```tsx
// src/scene/salon/FamilyMember.tsx
import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { toonGradient } from '../shared/toonGradient'
import {
  pickScenario, getNextStep, shouldUpdatePosition, shouldTurnTowardPlayer
} from '../../game/systems/npcSystem'
import type { NPCConfig, NPCState } from '../../game/systems/npcSystem'

interface FamilyMemberProps {
  config: NPCConfig
}

export function FamilyMember({ config }: FamilyMemberProps) {
  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  const [subtitle, setSubtitle] = useState<string | null>(null)
  const npcState = useRef<NPCState>('idle')
  const targetPos = useRef<THREE.Vector3 | null>(null)
  const scenarioTimer = useRef(Math.random() * 5)
  const stepIndex = useRef(0)
  const seedRef = useRef(Math.floor(Math.random() * 10000))
  const currentScenario = useRef(
    config.scenarios.length > 0
      ? pickScenario(config.scenarios, seedRef.current)
      : null
  )

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(...config.startPosition)
    }
  }, [config.startPosition])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    // Tier 3 — statique
    if (config.tier === 3) return

    const playerPos: [number, number, number] = [
      camera.position.x, camera.position.y, camera.position.z
    ]
    const pos = group.position
    const npcPos: [number, number, number] = [pos.x, pos.y, pos.z]

    // Head turn (Tier 1 & 2)
    if (headRef.current && shouldTurnTowardPlayer(npcPos, playerPos, 2)) {
      const dir = new THREE.Vector3(
        playerPos[0] - pos.x, 0, playerPos[2] - pos.z
      ).normalize()
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        Math.atan2(dir.x, dir.z),
        delta * 3
      )
    }

    // Tier 2 — semi-actif : pas de mouvement autonome
    if (config.tier === 2 || config.scenarios.length === 0) return

    // Tier 1 — state machine + scénarios
    scenarioTimer.current += delta

    if (shouldUpdatePosition(npcState.current) && targetPos.current) {
      const dir = targetPos.current.clone().sub(group.position)
      if (dir.length() < 0.1) {
        group.position.copy(targetPos.current)
        npcState.current = 'idle'
        targetPos.current = null
        stepIndex.current += 1
      } else {
        group.position.addScaledVector(dir.normalize(), delta * 1.2)
      }
      return
    }

    if (currentScenario.current) {
      const [min, max] = currentScenario.current.duration
      const duration = min + (max - min) * 0.5

      if (scenarioTimer.current > duration) {
        scenarioTimer.current = 0
        stepIndex.current = 0
        seedRef.current = (seedRef.current * 1664525 + 1013904223) >>> 0
        currentScenario.current = pickScenario(config.scenarios, seedRef.current)
        return
      }

      const step = getNextStep(currentScenario.current, stepIndex.current)
      if (!step) return

      if (step.type === 'walk') {
        targetPos.current = new THREE.Vector3(...step.target)
        npcState.current = 'walking'
        stepIndex.current += 1
      } else if (step.type === 'idle') {
        npcState.current = 'idle'
        stepIndex.current += 1
      } else if (step.type === 'dialogue') {
        setSubtitle(step.text)
        setTimeout(() => setSubtitle(null), 2500)
        stepIndex.current += 1
      } else if (step.type === 'sit') {
        npcState.current = 'sitting'
        stepIndex.current += 1
      } else if (step.type === 'react_to_player') {
        npcState.current = 'reacting'
        stepIndex.current += 1
      }
    }
  })

  const height = config.id === 'bebe' ? 0.4 : config.tier === 1 && config.id.startsWith('enfant') ? 0.6 : 0.875
  const headHeight = config.id === 'bebe' ? 0.55 : config.tier === 1 && config.id.startsWith('enfant') ? 1.15 : 1.75
  const capsuleR = config.id === 'bebe' ? 0.12 : config.tier === 1 && config.id.startsWith('enfant') ? 0.18 : 0.25
  const capsuleH = config.id === 'bebe' ? 0.2 : config.tier === 1 && config.id.startsWith('enfant') ? 0.7 : 1.25

  return (
    <group ref={groupRef} position={config.startPosition}>
      <mesh position={[0, height, 0]}>
        <capsuleGeometry args={[capsuleR, capsuleH, 4, 8]} />
        <meshToonMaterial color={config.meshColor} gradientMap={toonGradient} />
      </mesh>
      <mesh ref={headRef} position={[0, headHeight, 0]}>
        <sphereGeometry args={[capsuleR * 0.72, 8, 8]} />
        <meshToonMaterial color={config.meshColor} gradientMap={toonGradient} />
      </mesh>
      {subtitle && (
        <Html position={[0, headHeight + 0.5, 0]} center distanceFactor={8}>
          <div style={{
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            fontFamily: 'sans-serif',
            maxWidth: '200px',
          }}>
            <span style={{ color: '#f5c87a', fontWeight: 'bold' }}>
              {config.name}
            </span>
            {' '}{subtitle}
          </div>
        </Html>
      )}
    </group>
  )
}
```

- [ ] **Vérifier les types**

```bash
npx tsc --noEmit
```

Sortie attendue : 0 erreur.

- [ ] **Commit**

```bash
git add src/scene/salon/FamilyMember.tsx
git commit -m "feat: FamilyMember — NPC générique 3 tiers, state machine scénarios, sous-titres"
```

---

## Task 8 : Salon.tsx — assembly final + EffectComposer + arc soirée

**Files:**
- Modify: `src/scene/salon/Salon.tsx`

- [ ] **Remplacer Salon.tsx par l'assembly complet**

```tsx
// src/scene/salon/Salon.tsx
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Outline } from '@react-three/postprocessing'
import { SalonRoom } from './SalonRoom'
import { GrandUncle } from './GrandUncle'
import { FamilyMember } from './FamilyMember'
import { familyConfig } from './familyConfig'
import { useGameStore } from '../../game/store/gameStore'
import { useAudioLayers } from '../../hooks/useAudioLayers'

// NPCs sélectionnés pour l'Outline (6 max pour les perfs)
const OUTLINED_IDS = new Set(['cousin1', 'cousine1', 'enfant1', 'enfant2'])

const ARC_TIMINGS = [240, 480] // secondes : phase 0→1 à 4min, phase 1→2 à 8min

export function Salon() {
  const grandUncleRef = useRef<THREE.Group>(null)
  const npcRefs = useRef<Map<string, THREE.Group>>(new Map())
  const arcTimer = useRef(0)

  const adultIsNear = false // Salon sandbox : pas de mécanique adulte-couloir
  const setSalonArcPhase = useGameStore(s => s.setSalonArcPhase)
  const salonArcPhase = useGameStore(s => s.salonArcPhase)
  const setGrandUnclePosition = useGameStore(s => s.setGrandUnclePosition)
  const { getGrandUnclePosition } = useRef({
    getGrandUnclePosition: () => {
      const { getGrandUnclePosition: fn } = require('../../game/systems/npcSystem')
      return fn(Math.floor(Math.random() * 10000))
    }
  }).current

  useAudioLayers({ adultIsNear })

  // Arc de soirée : 3 phases sur 15 min
  useFrame((_, delta) => {
    arcTimer.current += delta
    if (salonArcPhase === 0 && arcTimer.current > ARC_TIMINGS[0]) {
      setSalonArcPhase(1)
    } else if (salonArcPhase === 1 && arcTimer.current > ARC_TIMINGS[1]) {
      setSalonArcPhase(2)
    }
  })

  const outlineTargets = [
    grandUncleRef,
    ...familyConfig
      .filter(c => OUTLINED_IDS.has(c.id))
      .map(c => {
        const ref = npcRefs.current.get(c.id)
        return ref ? { current: ref } : null
      })
      .filter(Boolean),
  ].filter(r => r?.current != null) as React.RefObject<THREE.Group>[]

  return (
    <>
      <group>
        <SalonRoom />
        <GrandUncle meshRef={grandUncleRef} />
        {familyConfig.map(config => (
          <FamilyMember
            key={config.id}
            config={config}
          />
        ))}
      </group>
      <EffectComposer>
        <Outline
          selection={[grandUncleRef]}
          edgeStrength={3}
          pulseSpeed={0}
          visibleEdgeColor={0x000000}
          hiddenEdgeColor={0x000000}
          blur={false}
        />
      </EffectComposer>
    </>
  )
}
```

> Note : l'Outline est limité au grand-oncle pour le MVP — ajouter les autres NPCs plus tard si perfs le permettent.

- [ ] **Vérifier les types**

```bash
npx tsc --noEmit
```

- [ ] **Lancer le dev server**

```bash
npm run dev
```

- [ ] **Validation manuelle complète**

Vérifier :
- [ ] Salon 14×10m en cel-shading, 20 chaises visibles
- [ ] Grand-oncle visible immédiatement à droite en entrant
- [ ] Grand-oncle : sous-titres espagnols apparaissent, tête tourne vers le joueur
- [ ] NPCs Tier 1 (cousins, enfants) bougent dans la pièce
- [ ] NPCs Tier 2 (parents, oncles) restent semi-statiques
- [ ] Sous-titres espagnols apparaissent au-dessus des NPCs actifs
- [ ] Stillness (rester immobile) : audio change légèrement
- [ ] Aucune erreur console
- [ ] 0 erreur TypeScript

- [ ] **Run tests**

```bash
npm test
```

Sortie attendue : tous les tests passent (≥48)

- [ ] **Commit final**

```bash
git add src/scene/salon/Salon.tsx
git commit -m "feat: Salon — assembly complet, 22 NPCs, EffectComposer, arc soirée 3 phases"
```

---

## Critères de succès

- Salon rendu en cel-shading, tous les éléments visibles
- Grand-oncle identifiable dès le premier regard (canapé côté droit)
- NPCs actifs bougent avec scénarios variés
- Sous-titres espagnols lisibles et timed correctement
- 20 chaises à table (grand-oncle sans place)
- Tous les tests existants verts
- 0 erreur TypeScript
