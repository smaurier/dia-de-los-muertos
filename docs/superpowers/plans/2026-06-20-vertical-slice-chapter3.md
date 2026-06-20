# Día de Muertos — Vertical Slice Chapitre 3

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build playable vertical slice of Chapter 3 (the corridor) validating 4 core mechanics: hide-and-seek loop, stillness as memory trigger, adult credibility as ordinary person, song entering naturally from the adult.

**Architecture:** Pure logic layer (stores + systems) fully TDD'd in isolation; 3D scene reads from stores reactively. Mirror uses Three.js `onBeforeRender`/`onAfterRender` hooks to hide adult mesh during reflection render. Audio system wraps Howler.js with 6 named layers and clean port interface for testing.

**Tech Stack:** Vite 5, React 18, TypeScript 5, React Three Fiber 8, Drei, Zustand 4, Howler.js 2, GSAP 3, Vitest 2

---

## File Map

### Logic layer — fully TDD'd

| File | Responsibility |
|------|---------------|
| `src/game/store/gameStore.ts` | Chapter, GamePhase, salonAudibility, houseScale |
| `src/game/store/playerStore.ts` | position, lastMoveTime, isHidden |
| `src/game/store/mirrorStore.ts` | Adult mesh ref registration for mirror exclusion |
| `src/game/systems/stillnessSystem.ts` | Pure functions: isStill, duration, intensity |
| `src/game/systems/songSystem.ts` | Fragment state machine per chapter + context |
| `src/audio/layers.ts` | Layer enum, configs, defaults |
| `src/audio/AudioLayerManager.ts` | Howler.js 6-layer wrapper with port interface |

### Scene layer — manual testing only (WebGL)

| File | Responsibility |
|------|---------------|
| `src/main.tsx` | Entry point |
| `src/App.tsx` | Canvas root + scene router |
| `src/hooks/useStillness.ts` | Bridge: useFrame → stillnessSystem → playerStore |
| `src/hooks/useAudioLayers.ts` | Bridge: stores → AudioLayerManager |
| `src/scene/Player.tsx` | Camera + WASD/gamepad movement controller |
| `src/scene/chapter3/Corridor.tsx` | Corridor geometry + lighting |
| `src/scene/chapter3/Mirror.tsx` | Reflector + adult exclusion hooks |
| `src/scene/chapter3/Adult.tsx` | Adult mesh + scripted walk + hum trigger |
| `src/scene/chapter3/Chapter3.tsx` | Scene assembly, wires everything |

### Tests

| File | Covers |
|------|--------|
| `src/game/store/gameStore.test.ts` | State transitions, clamps |
| `src/game/store/playerStore.test.ts` | Position updates, hide toggle |
| `src/game/systems/stillnessSystem.test.ts` | isStill, duration, intensity |
| `src/game/systems/songSystem.test.ts` | All chapters × context combinations |
| `src/audio/AudioLayerManager.test.ts` | Volume logic, fade calls, stillness effect |

---

## Task 1: Project Bootstrap

**Files:**
- Create: `package.json` (via Vite CLI)
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/sanity.test.ts`

- [ ] **Step 1: Scaffold Vite project**

```bash
cd C:\Users\sylva\projects
npm create vite@latest dia-de-los-muertos -- --template react-ts
cd dia-de-los-muertos
```

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install @react-three/fiber @react-three/drei zustand howler gsap three
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @types/three @types/howler
```

- [ ] **Step 4: Write vitest.config.ts**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

- [ ] **Step 5: Write test setup**

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Write sanity test**

```typescript
// src/test/sanity.test.ts
import { describe, it, expect } from 'vitest'

describe('sanity', () => {
  it('math works', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 7: Run tests**

```bash
npx vitest run
```

Expected: `1 passed`

- [ ] **Step 8: Add test script to package.json**

In `package.json`, ensure:
```json
{
  "scripts": {
    "dev": "vite",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "chore: bootstrap vite+react+ts+r3f+vitest"
```

---

## Task 2: Game Store

**Files:**
- Create: `src/game/store/gameStore.ts`
- Create: `src/game/store/gameStore.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/game/store/gameStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, Chapter, GamePhase } from './gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.setState({
      chapter: Chapter.THREE,
      phase: GamePhase.EXPLORING,
      salonAudibilityLevel: 0.8,
      houseScale: 1.0,
      adultHasLeft: false,
    })
  })

  it('starts at chapter 3 for vertical slice', () => {
    expect(useGameStore.getState().chapter).toBe(Chapter.THREE)
  })

  it('clamps salonAudibilityLevel to [0, 1]', () => {
    useGameStore.getState().setSalonAudibility(1.5)
    expect(useGameStore.getState().salonAudibilityLevel).toBe(1)

    useGameStore.getState().setSalonAudibility(-0.5)
    expect(useGameStore.getState().salonAudibilityLevel).toBe(0)
  })

  it('clamps houseScale to [1, 2]', () => {
    useGameStore.getState().setHouseScale(3)
    expect(useGameStore.getState().houseScale).toBe(2)

    useGameStore.getState().setHouseScale(0.5)
    expect(useGameStore.getState().houseScale).toBe(1)
  })

  it('transitions phase', () => {
    useGameStore.getState().setPhase(GamePhase.LOST)
    expect(useGameStore.getState().phase).toBe(GamePhase.LOST)
  })

  it('tracks adult departure', () => {
    useGameStore.getState().setAdultHasLeft(true)
    expect(useGameStore.getState().adultHasLeft).toBe(true)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run src/game/store/gameStore.test.ts
```

Expected: `Cannot find module './gameStore'`

- [ ] **Step 3: Implement gameStore**

```typescript
// src/game/store/gameStore.ts
import { create } from 'zustand'

export enum Chapter {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  NINE = 9,
}

export enum GamePhase {
  HIDING = 'HIDING',
  EXPLORING = 'EXPLORING',
  LOST = 'LOST',
  RETURNING = 'RETURNING',
  END = 'END',
}

interface GameState {
  chapter: Chapter
  phase: GamePhase
  salonAudibilityLevel: number
  houseScale: number
  adultHasLeft: boolean
  setChapter: (chapter: Chapter) => void
  setPhase: (phase: GamePhase) => void
  setSalonAudibility: (level: number) => void
  setHouseScale: (scale: number) => void
  setAdultHasLeft: (value: boolean) => void
}

export const useGameStore = create<GameState>((set) => ({
  chapter: Chapter.THREE,
  phase: GamePhase.EXPLORING,
  salonAudibilityLevel: 0.8,
  houseScale: 1.0,
  adultHasLeft: false,
  setChapter: (chapter) => set({ chapter }),
  setPhase: (phase) => set({ phase }),
  setSalonAudibility: (level) =>
    set({ salonAudibilityLevel: Math.max(0, Math.min(1, level)) }),
  setHouseScale: (scale) =>
    set({ houseScale: Math.max(1, Math.min(2, scale)) }),
  setAdultHasLeft: (adultHasLeft) => set({ adultHasLeft }),
}))
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run src/game/store/gameStore.test.ts
```

Expected: `5 passed`

- [ ] **Step 5: Commit**

```bash
git add src/game/store/
git commit -m "feat: game store with chapter, phase, world state"
```

---

## Task 3: Player Store

**Files:**
- Create: `src/game/store/playerStore.ts`
- Create: `src/game/store/playerStore.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/game/store/playerStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { usePlayerStore } from './playerStore'

describe('playerStore', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      position: [0, 0, 0],
      lastMoveTime: 1000,
      isHidden: false,
    })
  })

  it('starts at origin', () => {
    expect(usePlayerStore.getState().position).toEqual([0, 0, 0])
  })

  it('updates position', () => {
    usePlayerStore.getState().setPosition([1, 0, 3])
    expect(usePlayerStore.getState().position).toEqual([1, 0, 3])
  })

  it('updates lastMoveTime when position changes', () => {
    usePlayerStore.getState().setPosition([1, 0, 0])
    // lastMoveTime is updated externally by the hook; store just holds it
    usePlayerStore.getState().setLastMoveTime(9999)
    expect(usePlayerStore.getState().lastMoveTime).toBe(9999)
  })

  it('toggles hidden state', () => {
    usePlayerStore.getState().setHidden(true)
    expect(usePlayerStore.getState().isHidden).toBe(true)

    usePlayerStore.getState().setHidden(false)
    expect(usePlayerStore.getState().isHidden).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run src/game/store/playerStore.test.ts
```

Expected: `Cannot find module './playerStore'`

- [ ] **Step 3: Implement playerStore**

```typescript
// src/game/store/playerStore.ts
import { create } from 'zustand'

interface PlayerState {
  position: [number, number, number]
  lastMoveTime: number
  isHidden: boolean
  setPosition: (pos: [number, number, number]) => void
  setLastMoveTime: (time: number) => void
  setHidden: (hidden: boolean) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  position: [0, 0, 0],
  lastMoveTime: Date.now(),
  isHidden: false,
  setPosition: (position) => set({ position }),
  setLastMoveTime: (lastMoveTime) => set({ lastMoveTime }),
  setHidden: (isHidden) => set({ isHidden }),
}))
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run src/game/store/playerStore.test.ts
```

Expected: `4 passed`

- [ ] **Step 5: Commit**

```bash
git add src/game/store/playerStore.ts src/game/store/playerStore.test.ts
git commit -m "feat: player store with position and stillness time tracking"
```

---

## Task 4: Stillness System

**Files:**
- Create: `src/game/systems/stillnessSystem.ts`
- Create: `src/game/systems/stillnessSystem.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/game/systems/stillnessSystem.test.ts
import { describe, it, expect } from 'vitest'
import {
  isPlayerStill,
  stillnessDuration,
  stillnessIntensity,
  STILLNESS_THRESHOLD_MS,
} from './stillnessSystem'

const BASE = 1_000_000

describe('isPlayerStill', () => {
  it('returns false just before threshold', () => {
    expect(isPlayerStill(BASE, BASE + STILLNESS_THRESHOLD_MS - 1)).toBe(false)
  })

  it('returns true at exact threshold', () => {
    expect(isPlayerStill(BASE, BASE + STILLNESS_THRESHOLD_MS)).toBe(true)
  })

  it('returns true above threshold', () => {
    expect(isPlayerStill(BASE, BASE + STILLNESS_THRESHOLD_MS + 5000)).toBe(true)
  })

  it('accepts custom threshold', () => {
    expect(isPlayerStill(BASE, BASE + 999, 1000)).toBe(false)
    expect(isPlayerStill(BASE, BASE + 1000, 1000)).toBe(true)
  })
})

describe('stillnessDuration', () => {
  it('returns 0 when just moved', () => {
    expect(stillnessDuration(BASE, BASE)).toBe(0)
  })

  it('returns elapsed ms', () => {
    expect(stillnessDuration(BASE, BASE + 2500)).toBe(2500)
  })

  it('clamps to 0 when now < lastMoveTime', () => {
    expect(stillnessDuration(BASE + 100, BASE)).toBe(0)
  })
})

describe('stillnessIntensity', () => {
  it('returns 0 at no stillness', () => {
    expect(stillnessIntensity(BASE, BASE, 10000)).toBe(0)
  })

  it('returns 0.5 at half maxMs', () => {
    expect(stillnessIntensity(BASE, BASE + 5000, 10000)).toBe(0.5)
  })

  it('caps at 1', () => {
    expect(stillnessIntensity(BASE, BASE + 20000, 10000)).toBe(1)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run src/game/systems/stillnessSystem.test.ts
```

- [ ] **Step 3: Implement stillnessSystem**

```typescript
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
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run src/game/systems/stillnessSystem.test.ts
```

Expected: `7 passed`

- [ ] **Step 5: Commit**

```bash
git add src/game/systems/
git commit -m "feat: stillness system — pure functions for movement detection"
```

---

## Task 5: Song System

**Files:**
- Create: `src/game/systems/songSystem.ts`
- Create: `src/game/systems/songSystem.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/game/systems/songSystem.test.ts
import { describe, it, expect } from 'vitest'
import { getSongFragment, SongFragment } from './songSystem'
import { Chapter } from '../store/gameStore'

const base = {
  isStill: false,
  adultIsNear: false,
  isAtOfrenda: false,
  isInSalon: false,
}

describe('getSongFragment', () => {
  it('absent in chapters 1 and 2', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.ONE })).toBe(SongFragment.ABSENT)
    expect(getSongFragment({ ...base, chapter: Chapter.TWO })).toBe(SongFragment.ABSENT)
  })

  it('chapter 3: absent when adult not near', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.THREE })).toBe(SongFragment.ABSENT)
  })

  it('chapter 3: two notes when adult is near', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.THREE, adultIsNear: true }))
      .toBe(SongFragment.TWO_NOTES)
  })

  it('chapter 4: two notes when in salon', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.FOUR, isInSalon: true }))
      .toBe(SongFragment.TWO_NOTES)
  })

  it('chapter 4: absent outside salon', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.FOUR })).toBe(SongFragment.ABSENT)
  })

  it('chapter 5: fragment only when still', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.FIVE })).toBe(SongFragment.ABSENT)
    expect(getSongFragment({ ...base, chapter: Chapter.FIVE, isStill: true }))
      .toBe(SongFragment.FRAGMENT)
  })

  it('chapter 6: always fragment — room holds the song', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.SIX })).toBe(SongFragment.FRAGMENT)
    expect(getSongFragment({ ...base, chapter: Chapter.SIX, isStill: false }))
      .toBe(SongFragment.FRAGMENT)
  })

  it('chapter 7: absent — silence of storage room', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.SEVEN, isStill: true }))
      .toBe(SongFragment.ABSENT)
  })

  it('chapter 8: full song at ofrenda', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.EIGHT })).toBe(SongFragment.ABSENT)
    expect(getSongFragment({ ...base, chapter: Chapter.EIGHT, isAtOfrenda: true }))
      .toBe(SongFragment.FULL)
  })

  it('chapter 9: song is in the child, always', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.NINE })).toBe(SongFragment.IN_CHILD)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx vitest run src/game/systems/songSystem.test.ts
```

- [ ] **Step 3: Implement songSystem**

```typescript
// src/game/systems/songSystem.ts
import { Chapter } from '../store/gameStore'

export enum SongFragment {
  ABSENT = 'ABSENT',
  TWO_NOTES = 'TWO_NOTES',
  FRAGMENT = 'FRAGMENT',
  FULL = 'FULL',
  IN_CHILD = 'IN_CHILD',
}

export interface SongContext {
  chapter: Chapter
  isStill: boolean
  adultIsNear: boolean
  isAtOfrenda: boolean
  isInSalon: boolean
}

type FragmentResolver = (ctx: SongContext) => SongFragment

const resolvers: Record<Chapter, FragmentResolver> = {
  [Chapter.ONE]:   () => SongFragment.ABSENT,
  [Chapter.TWO]:   () => SongFragment.ABSENT,
  [Chapter.THREE]: (ctx) => ctx.adultIsNear ? SongFragment.TWO_NOTES : SongFragment.ABSENT,
  [Chapter.FOUR]:  (ctx) => ctx.isInSalon ? SongFragment.TWO_NOTES : SongFragment.ABSENT,
  [Chapter.FIVE]:  (ctx) => ctx.isStill ? SongFragment.FRAGMENT : SongFragment.ABSENT,
  [Chapter.SIX]:   () => SongFragment.FRAGMENT,
  [Chapter.SEVEN]: () => SongFragment.ABSENT,
  [Chapter.EIGHT]: (ctx) => ctx.isAtOfrenda ? SongFragment.FULL : SongFragment.ABSENT,
  [Chapter.NINE]:  () => SongFragment.IN_CHILD,
}

export function getSongFragment(ctx: SongContext): SongFragment {
  return resolvers[ctx.chapter](ctx)
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run src/game/systems/songSystem.test.ts
```

Expected: `10 passed`

- [ ] **Step 5: Commit**

```bash
git add src/game/systems/songSystem.ts src/game/systems/songSystem.test.ts
git commit -m "feat: song fragment system — state machine per chapter and context"
```

---

## Task 6: Audio Layer Manager

**Files:**
- Create: `src/audio/layers.ts`
- Create: `src/audio/AudioLayerManager.ts`
- Create: `src/audio/AudioLayerManager.test.ts`

- [ ] **Step 1: Write layers.ts**

```typescript
// src/audio/layers.ts
export enum AudioLayer {
  SALON = 'SALON',     // voix espagnol, couverts — ancre émotionnelle
  HOUSE = 'HOUSE',     // bois, vent, ampoule — toujours présente
  MEMORY = 'MEMORY',   // sons sans source — monte à l'immobilité
  ANIMAL = 'ANIMAL',   // respiration chien, griffes
  SONG = 'SONG',       // la chanson — traverse tout
  SILENCE = 'SILENCE', // débarras — réverbération longue
}

export interface LayerConfig {
  baseVolume: number
  fadeDurationMs: number
}

export const LAYER_DEFAULTS: Record<AudioLayer, LayerConfig> = {
  [AudioLayer.SALON]:   { baseVolume: 0.8, fadeDurationMs: 2000 },
  [AudioLayer.HOUSE]:   { baseVolume: 0.3, fadeDurationMs: 1000 },
  [AudioLayer.MEMORY]:  { baseVolume: 0.0, fadeDurationMs: 3000 },
  [AudioLayer.ANIMAL]:  { baseVolume: 0.2, fadeDurationMs: 500  },
  [AudioLayer.SONG]:    { baseVolume: 0.0, fadeDurationMs: 4000 },
  [AudioLayer.SILENCE]: { baseVolume: 0.0, fadeDurationMs: 500  },
}
```

- [ ] **Step 2: Write failing tests**

```typescript
// src/audio/AudioLayerManager.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AudioLayerManager, HowlPort } from './AudioLayerManager'
import { AudioLayer, LAYER_DEFAULTS } from './layers'

function makeMockHowl(): HowlPort {
  return {
    play: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn(),
    fade: vi.fn(),
    loop: vi.fn(),
  }
}

describe('AudioLayerManager', () => {
  let mockHowls: Map<string, HowlPort>
  let manager: AudioLayerManager

  beforeEach(() => {
    mockHowls = new Map()
    const factory = (src: string): HowlPort => {
      const howl = makeMockHowl()
      mockHowls.set(src, howl)
      return howl
    }
    manager = new AudioLayerManager(factory, {
      [AudioLayer.SALON]:  'salon.mp3',
      [AudioLayer.SONG]:   'song.mp3',
      [AudioLayer.MEMORY]: 'memory.mp3',
    })
  })

  it('initializes SALON at default baseVolume', () => {
    expect(manager.getVolume(AudioLayer.SALON))
      .toBe(LAYER_DEFAULTS[AudioLayer.SALON].baseVolume)
  })

  it('initializes SONG at 0', () => {
    expect(manager.getVolume(AudioLayer.SONG)).toBe(0)
  })

  it('clamps volume above 1', () => {
    manager.setVolume(AudioLayer.SALON, 1.5)
    expect(manager.getVolume(AudioLayer.SALON)).toBe(1)
  })

  it('clamps volume below 0', () => {
    manager.setVolume(AudioLayer.SALON, -0.5)
    expect(manager.getVolume(AudioLayer.SALON)).toBe(0)
  })

  it('calls howl.volume when no fade', () => {
    manager.setVolume(AudioLayer.SALON, 0.5)
    expect(mockHowls.get('salon.mp3')!.volume).toHaveBeenCalledWith(0.5)
    expect(mockHowls.get('salon.mp3')!.fade).not.toHaveBeenCalled()
  })

  it('calls howl.fade when fade=true', () => {
    manager.setVolume(AudioLayer.SALON, 0.5, true)
    expect(mockHowls.get('salon.mp3')!.fade).toHaveBeenCalled()
    expect(mockHowls.get('salon.mp3')!.volume).not.toHaveBeenCalled()
  })

  it('loops all initialized howls', () => {
    expect(mockHowls.get('salon.mp3')!.loop).toHaveBeenCalledWith(true)
  })

  it('applyStillness(1): memory rises to 0.6', () => {
    manager.applyStillness(1)
    expect(manager.getVolume(AudioLayer.MEMORY)).toBe(0.6)
  })

  it('applyStillness(1): salon fades to 0.3', () => {
    manager.applyStillness(1)
    expect(manager.getVolume(AudioLayer.SALON)).toBe(0.3)
  })

  it('applyStillness(0): salon stays at 0.8', () => {
    manager.applyStillness(0)
    expect(manager.getVolume(AudioLayer.SALON)).toBe(0.8)
  })

  it('applyStillness(0): memory stays at 0', () => {
    manager.applyStillness(0)
    expect(manager.getVolume(AudioLayer.MEMORY)).toBe(0)
  })

  it('no crash when layer has no source', () => {
    expect(() => manager.setVolume(AudioLayer.ANIMAL, 0.5)).not.toThrow()
  })
})
```

- [ ] **Step 3: Run test — expect FAIL**

```bash
npx vitest run src/audio/AudioLayerManager.test.ts
```

- [ ] **Step 4: Implement AudioLayerManager**

```typescript
// src/audio/AudioLayerManager.ts
import { AudioLayer, LayerConfig, LAYER_DEFAULTS } from './layers'

export interface HowlPort {
  play(): void
  stop(): void
  volume(vol: number): void
  fade(from: number, to: number, durationMs: number): void
  loop(loop: boolean): void
}

export type HowlFactory = (src: string) => HowlPort

export class AudioLayerManager {
  private volumes = new Map<AudioLayer, number>()
  private howls = new Map<AudioLayer, HowlPort>()

  constructor(
    private readonly factory: HowlFactory,
    private readonly sources: Partial<Record<AudioLayer, string>> = {},
    private readonly configs: Record<AudioLayer, LayerConfig> = LAYER_DEFAULTS
  ) {
    for (const layer of Object.values(AudioLayer)) {
      this.volumes.set(layer, configs[layer].baseVolume)
      const src = sources[layer]
      if (src) {
        const howl = factory(src)
        howl.loop(true)
        howl.volume(configs[layer].baseVolume)
        this.howls.set(layer, howl)
      }
    }
  }

  getVolume(layer: AudioLayer): number {
    return this.volumes.get(layer) ?? 0
  }

  setVolume(layer: AudioLayer, volume: number, fade = false): void {
    const clamped = Math.max(0, Math.min(1, volume))
    const current = this.volumes.get(layer) ?? 0
    this.volumes.set(layer, clamped)

    const howl = this.howls.get(layer)
    if (!howl) return

    if (fade) {
      howl.fade(current, clamped, this.configs[layer].fadeDurationMs)
    } else {
      howl.volume(clamped)
    }
  }

  play(layer: AudioLayer): void {
    this.howls.get(layer)?.play()
  }

  stop(layer: AudioLayer): void {
    this.howls.get(layer)?.stop()
  }

  applyStillness(intensity: number): void {
    this.setVolume(AudioLayer.MEMORY, intensity * 0.6, true)
    this.setVolume(AudioLayer.SALON, Math.max(0.3, 0.8 - intensity * 0.5), true)
  }
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npx vitest run src/audio/AudioLayerManager.test.ts
```

Expected: `12 passed`

- [ ] **Step 6: Commit**

```bash
git add src/audio/
git commit -m "feat: audio layer manager — 6-layer howler wrapper with port interface"
```

---

## Task 7: Run Full Test Suite

All logic tests together before touching the scene.

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: all tests pass (0 failures).

- [ ] **Step 2: Fix any issues**

If failures: fix before proceeding to scene layer. Scene code depends on stores being stable.

- [ ] **Step 3: Commit if any fixes**

```bash
git add -A
git commit -m "fix: test suite green before scene layer"
```

---

## Task 8: Scene Foundation

**Files:**
- Modify: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/scene/Player.tsx`

No automated tests — requires WebGL. Manual verification by running dev server.

- [ ] **Step 1: Write main.tsx**

```typescript
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 2: Write App.tsx**

```tsx
// src/App.tsx
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { Suspense } from 'react'
import { Player } from './scene/Player'
import { Chapter3 } from './scene/chapter3/Chapter3'

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
        style={{ width: '100vw', height: '100vh', background: '#0a0705' }}
      >
        <Suspense fallback={null}>
          <Player />
          <Chapter3 />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  )
}
```

- [ ] **Step 3: Write Player.tsx**

```tsx
// src/scene/Player.tsx
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls, PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import { usePlayerStore } from '../game/store/playerStore'
import { isPlayerStill } from '../game/systems/stillnessSystem'

const SPEED = 3
const CHILD_HEIGHT = 1.1  // camera height, metres

export function Player() {
  const { camera } = useThree()
  const [, getKeys] = useKeyboardControls()
  const setPosition = usePlayerStore((s) => s.setPosition)
  const setLastMoveTime = usePlayerStore((s) => s.setLastMoveTime)
  const setHidden = usePlayerStore((s) => s.setHidden)
  const direction = useRef(new THREE.Vector3())
  const frontVector = useRef(new THREE.Vector3())
  const sideVector = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const { forward, backward, left, right, hide } = getKeys()

    frontVector.current.set(0, 0, Number(backward) - Number(forward))
    sideVector.current.set(Number(right) - Number(left), 0, 0)
    direction.current
      .subVectors(frontVector.current, sideVector.current)
      .normalize()
      .multiplyScalar(SPEED * delta)
      .applyEuler(camera.rotation)

    direction.current.y = 0

    const moving = direction.current.lengthSq() > 0.00001

    if (moving) {
      camera.position.add(direction.current)
      setLastMoveTime(Date.now())
      setPosition([camera.position.x, camera.position.y, camera.position.z])
    }

    camera.position.y = CHILD_HEIGHT
    setHidden(hide)
  })

  return <PointerLockControls />
}
```

- [ ] **Step 4: Run dev server and verify player moves**

```bash
npm run dev
```

Open browser, click to lock pointer, WASD should move camera. Height stays at 1.1m.

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: scene foundation — canvas, player controller, pointer lock"
```

---

## Task 9: Chapter 3 Scene — Corridor + Mirror + Adult

**Files:**
- Create: `src/scene/chapter3/Corridor.tsx`
- Create: `src/scene/chapter3/Mirror.tsx`
- Create: `src/scene/chapter3/Adult.tsx`
- Create: `src/scene/chapter3/Chapter3.tsx`

Manual testing against 4 spec questions. No automated tests.

- [ ] **Step 1: Write Corridor.tsx**

```tsx
// src/scene/chapter3/Corridor.tsx
// Prototype: primitive geometry. Replace with GLTF model later.
// Corridor: 2m wide, 8m long, 2.5m high. Player enters from z=3, mirror at z=-3.

export function Corridor() {
  return (
    <group>
      {/* Ambient light — dim, warm */}
      <ambientLight intensity={0.15} color="#f5c87a" />
      {/* Corridor light — single bulb overhead */}
      <pointLight position={[0, 2.2, 0]} intensity={1.5} color="#f0d89a" distance={6} decay={2} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[2, 8]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.5, 0]}>
        <planeGeometry args={[2, 8]} />
        <meshStandardMaterial color="#2a1f1a" roughness={1} />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-1, 1.25, 0]}>
        <planeGeometry args={[8, 2.5]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.85} />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[1, 1.25, 0]}>
        <planeGeometry args={[8, 2.5]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.85} />
      </mesh>

      {/* End wall (salon direction) */}
      <mesh position={[0, 1.25, -4]}>
        <planeGeometry args={[2, 2.5]} />
        <meshStandardMaterial color="#2e1e15" roughness={1} />
      </mesh>

      {/* Start wall */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 1.25, 4]}>
        <planeGeometry args={[2, 2.5]} />
        <meshStandardMaterial color="#2e1e15" roughness={1} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 2: Write Adult.tsx**

```tsx
// src/scene/chapter3/Adult.tsx
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../game/store/gameStore'

interface AdultProps {
  onNearPlayer: (near: boolean) => void
  meshRef: React.RefObject<THREE.Group | null>
}

// Adult walks from z=3 to z=-3 (salon end), pausing in middle.
// Hums 2-3 notes at z=0 (mirror moment).
const PATH = [3, 0, -3]
const WALK_SPEED = 0.8  // m/s

export function Adult({ onNearPlayer, meshRef }: AdultProps) {
  const phase = useRef<'waiting' | 'walking' | 'done'>('waiting')
  const startTime = useRef(0)
  const targetZ = useRef(PATH[0])
  const phaseIndex = useRef(0)

  useEffect(() => {
    // Start walking after 2 seconds (player has settled)
    const t = setTimeout(() => {
      phase.current = 'walking'
      startTime.current = performance.now()
    }, 2000)
    return () => clearTimeout(t)
  }, [])

  useFrame(({ clock }) => {
    const group = meshRef.current
    if (!group || phase.current !== 'walking') return

    const target = PATH[phaseIndex.current + 1]
    if (target === undefined) {
      phase.current = 'done'
      group.visible = false
      return
    }

    const direction = target - group.position.z
    const step = Math.sign(direction) * WALK_SPEED * (1 / 60)
    group.position.z += step

    if (Math.abs(group.position.z - target) < 0.05) {
      group.position.z = target
      phaseIndex.current += 1
    }

    // Near player: within 2m on z axis (player at z≈0 start)
    onNearPlayer(Math.abs(group.position.z) < 2)
  })

  return (
    <group ref={meshRef} position={[0.3, 0, PATH[0]]}>
      {/* Placeholder: adult is a dark capsule, ~1.75m tall */}
      <mesh position={[0, 0.875, 0]}>
        <capsuleGeometry args={[0.25, 1.25, 4, 8]} />
        <meshStandardMaterial color="#2a1a0e" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#c8956c" roughness={0.7} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 3: Write Mirror.tsx**

```tsx
// src/scene/chapter3/Mirror.tsx
// Mirror at z=-1 (halfway down corridor).
// Uses onBeforeRender / onAfterRender to hide adult during reflection pass.
// This is the core mechanic: player sees self, adult has no reflection.

import { useRef, useEffect } from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface MirrorProps {
  adultRef: React.RefObject<THREE.Object3D | null>
}

export function Mirror({ adultRef }: MirrorProps) {
  const mirrorMeshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    const mesh = mirrorMeshRef.current
    if (!mesh) return

    mesh.onBeforeRender = () => {
      if (adultRef.current) adultRef.current.visible = false
    }

    mesh.onAfterRender = () => {
      if (adultRef.current) adultRef.current.visible = true
    }

    return () => {
      mesh.onBeforeRender = () => {}
      mesh.onAfterRender = () => {}
    }
  }, [adultRef])

  return (
    <mesh
      ref={mirrorMeshRef}
      position={[0, 1.25, -1]}
      rotation={[0, 0, 0]}
    >
      <planeGeometry args={[0.8, 1.4]} />
      <MeshReflectorMaterial
        blur={[0, 0]}
        resolution={512}
        mixBlur={0}
        mixStrength={1}
        roughness={0.05}
        depthScale={0}
        minDepthThreshold={0.9}
        maxDepthThreshold={1}
        color="#aaaaaa"
        metalness={0.9}
        mirror={1}
      />
    </mesh>
  )
}
```

- [ ] **Step 4: Write Chapter3.tsx**

```tsx
// src/scene/chapter3/Chapter3.tsx
import { useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { Corridor } from './Corridor'
import { Mirror } from './Mirror'
import { Adult } from './Adult'
import { useAudioLayers } from '../../hooks/useAudioLayers'

export function Chapter3() {
  const adultRef = useRef<THREE.Group>(null)
  const [adultIsNear, setAdultIsNear] = useState(false)

  useAudioLayers({ adultIsNear })

  const handleNearPlayer = useCallback((near: boolean) => {
    setAdultIsNear(near)
  }, [])

  return (
    <group>
      <Corridor />
      <Mirror adultRef={adultRef} />
      <Adult onNearPlayer={handleNearPlayer} meshRef={adultRef} />
    </group>
  )
}
```

- [ ] **Step 5: Run dev server — manual test**

```bash
npm run dev
```

**Manual checklist — 4 spec questions:**

1. **Cache-cache loop fonctionne ?** — Arrêt du mouvement → mémoire sonore change (visible via console.log dans useAudioLayers si pas encore audio réel).

2. **L'arrêt silencieux déclenche quelque chose de ressenti ?** — Rester immobile 3s → voir le changement (audio ou log).

3. **L'adulte est crédible comme personne ordinaire ?** — Capsule sombre qui traverse le couloir. Observe: ordinaire ? (prototype géométrique = oui si mouvement est naturel).

4. **La chanson entre-t-elle naturellement depuis lui ?** — Quand adult passe (adultIsNear=true) → layer SONG monte. Vérifier en log.

- [ ] **Step 6: Commit**

```bash
git add src/scene/
git commit -m "feat: chapter 3 scene — corridor, mirror (no adult reflection), adult walk"
```

---

## Task 10: Audio + Stillness Hooks (Wire Everything)

**Files:**
- Create: `src/hooks/useStillness.ts`
- Create: `src/hooks/useAudioLayers.ts`

- [ ] **Step 1: Write useStillness.ts**

```typescript
// src/hooks/useStillness.ts
import { useFrame } from '@react-three/fiber'
import { usePlayerStore } from '../game/store/playerStore'
import { isPlayerStill, stillnessIntensity } from '../game/systems/stillnessSystem'

export function useStillness(): { isStill: boolean; intensity: number } {
  const lastMoveTime = usePlayerStore((s) => s.lastMoveTime)
  const now = Date.now()

  useFrame(() => {
    // useFrame keeps component reactive — actual values computed on render
  })

  return {
    isStill: isPlayerStill(lastMoveTime, now),
    intensity: stillnessIntensity(lastMoveTime, now),
  }
}
```

- [ ] **Step 2: Write useAudioLayers.ts**

```typescript
// src/hooks/useAudioLayers.ts
import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Howl } from 'howler'
import { AudioLayerManager, HowlPort } from '../audio/AudioLayerManager'
import { AudioLayer } from '../audio/layers'
import { usePlayerStore } from '../game/store/playerStore'
import { stillnessIntensity } from '../game/systems/stillnessSystem'
import { getSongFragment, SongFragment } from '../game/systems/songSystem'
import { useGameStore, Chapter } from '../game/store/gameStore'

interface UseAudioLayersOptions {
  adultIsNear: boolean
}

function howlFactory(src: string): HowlPort {
  const h = new Howl({ src: [src], loop: true })
  return {
    play: () => h.play(),
    stop: () => h.stop(),
    volume: (v) => h.volume(v),
    fade: (from, to, dur) => h.fade(from, to, dur),
    loop: (l) => h.loop(l),
  }
}

export function useAudioLayers({ adultIsNear }: UseAudioLayersOptions) {
  const managerRef = useRef<AudioLayerManager | null>(null)

  useEffect(() => {
    // Sources are empty strings for prototype — swap for real files later
    managerRef.current = new AudioLayerManager(howlFactory, {
      // [AudioLayer.SALON]: '/audio/salon.mp3',
      // [AudioLayer.SONG]:  '/audio/song.mp3',
    })

    return () => {
      managerRef.current = null
    }
  }, [])

  useFrame(() => {
    const manager = managerRef.current
    if (!manager) return

    const lastMoveTime = usePlayerStore.getState().lastMoveTime
    const chapter = useGameStore.getState().chapter
    const now = Date.now()

    const intensity = stillnessIntensity(lastMoveTime, now)
    manager.applyStillness(intensity)

    const fragment = getSongFragment({
      chapter,
      isStill: intensity > 0.3,
      adultIsNear,
      isAtOfrenda: false,
      isInSalon: false,
    })

    const songVolume =
      fragment === SongFragment.TWO_NOTES ? 0.3 :
      fragment === SongFragment.FRAGMENT  ? 0.5 :
      fragment === SongFragment.FULL      ? 0.8 :
      fragment === SongFragment.IN_CHILD  ? 0.6 : 0

    manager.setVolume(AudioLayer.SONG, songVolume, true)
  })
}
```

- [ ] **Step 3: Run full test suite — no regressions**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 4: Run dev server — final manual verification**

```bash
npm run dev
```

Walk → stop 3s → salon volume fades in logic.
Adult walks past → song layer logic triggers TWO_NOTES.
Mirror: player has reflection, adult doesn't.

- [ ] **Step 5: Final commit**

```bash
git add src/hooks/
git commit -m "feat: stillness + audio hooks — wire logic layer to scene"
```

---

## Validation — 4 Questions Spec

| Question | Validated by |
|----------|-------------|
| Cache-cache fonctionne comme moteur ? | `stillnessSystem.test.ts` + manual: stop → memory layer rises |
| Arrêt silencieux déclenche quelque chose de ressenti ? | `stillnessSystem.test.ts` + `AudioLayerManager.test.ts` + manual: audio shift |
| L'adulte est crédible comme personne ordinaire ? | Manual: capsule placeholder walks naturally across corridor |
| La chanson entre naturellement depuis lui ? | `songSystem.test.ts` (ch3 + adultIsNear) + manual: SONG layer activates |

---

## Post-Prototype: What Comes Next

After vertical slice validates the 4 questions:

1. **Assets** — Replace primitive geometry with GLTF house model + adult character (Mixamo)
2. **Real audio files** — Record Spanish dialogue, compose la chanson
3. **Chapters 1-9** — Extend chapter system, add rooms
4. **Mirror via Three.js layers** — More robust than onBeforeRender for complex scenes
5. **Dog behavior** — Pathfinding toward player when lost
6. **Petal path** — Particle system or instanced mesh at floor level
7. **Accessibility options** — Separate volume sliders, camera sensitivity, motion reduction
