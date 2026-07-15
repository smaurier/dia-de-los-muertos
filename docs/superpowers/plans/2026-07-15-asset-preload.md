# Asset Preload + real progress — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preload all assets in one pass so the loading bar shows a real monotonic 0→100, the scene mounts only when data is cached, and shaders are compiled before the loader dismisses — fixing the looping/frozen loader.

**Architecture:** A manifest owns every asset URL; components import from it. `preloadAll()` fires all loads in one loading-manager batch. A pure, tested reducer (`loaderState`) decides `ready` via "has started + debounced idle". At `ready` the scene + composer mount; `gl.compileAsync` gives the deterministic warmup signal; the loader dismisses on `warmed`.

**Tech Stack:** React Three Fiber, drei (`useGLTF`, `useProgress`), three 0.184 (`compileAsync`), TypeScript strict, Vitest.

**Spec:** `docs/superpowers/specs/2026-07-15-asset-preload-design.md`. Real typecheck: `npm run typecheck` (`tsc -b`), NEVER `tsc --noEmit`.

**Pre-audit (done):** no inline `new TextureLoader` in components — all textures live in shared modules or Sofa's `TEXTURE_URLS`. Manifest can own them cleanly.

---

## File structure

- Create `src/scene/assets/manifest.ts` — owns all asset URLs (`MODEL_URLS`, `TEXTURE_URLS`, plus named consts consumers import).
- Create `src/scene/assets/loaderState.ts` (+ `.test.ts`) — pure ready reducer.
- Create `src/scene/assets/preloadAssets.ts` — `preloadAll()`.
- Create `src/scene/assets/SceneWarmup.tsx` — `compileAsync` warmup signal.
- Modify consumers to import URLs from the manifest: `Player.tsx`, `living-room/Dog.tsx`, `Mama.tsx`, `GrandUncle.tsx`, `Sofa.tsx`, `familyConfig.ts`, and the `<Prop url=…>` sites (`shell/DiningArea.tsx`, `shell/Furniture.tsx`, `shell/SofaCorner.tsx`, `rooms/kitchen/KitchenTable.tsx`), and texture modules (`shared/paintedTextures.ts`, `shared/fabricTexture.ts`, `living-room/Sofa.tsx` textures).
- Modify `src/App.tsx` — preload gate (ready/warmed), mount scene+composer on ready, dismiss FadeIn on warmed.

---

## Task 1: `loaderState` reducer (TDD — the crux)

**Files:** Create `src/scene/assets/loaderState.ts`, `src/scene/assets/loaderState.test.ts`

- [ ] **Step 1: Write the failing test** — `src/scene/assets/loaderState.test.ts`:

```ts
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
    let s = advanceLoader(initialLoaderState, true, 16) // started
    s = advanceLoader(s, false, 200)                    // idle 200
    expect(s.ready).toBe(false)
    s = advanceLoader(s, false, 150)                    // idle 350
    expect(s.ready).toBe(true)
  })

  it('a mid-load active blip resets the debounce', () => {
    let s = advanceLoader(initialLoaderState, true, 16)
    s = advanceLoader(s, false, 250)   // idle 250
    s = advanceLoader(s, true, 16)     // blip → reset
    expect(s.ready).toBe(false)
    s = advanceLoader(s, false, 250)   // idle 250 again, not yet
    expect(s.ready).toBe(false)
  })

  it('is 404-safe: readies on settle with no dependence on loaded/error counts', () => {
    // no counts in state at all — settle alone readies
    let s = advanceLoader(initialLoaderState, true, 16)
    s = advanceLoader(s, false, 300)
    expect(s.ready).toBe(true)
  })

  it('stays ready once ready (idempotent)', () => {
    let s = advanceLoader(initialLoaderState, true, 16)
    s = advanceLoader(s, false, 300)
    s = advanceLoader(s, true, 16) // new activity after ready
    expect(s.ready).toBe(true)
  })
})
```

- [ ] **Step 2: Run — expect FAIL** (`npm test -- loaderState` → cannot find module).

- [ ] **Step 3: Implement** — `src/scene/assets/loaderState.ts`:

```ts
// Pure ready-detection for the preload gate. "ready" = loading has started
// (active went true once) AND has then been idle (active false) for a debounce.
// No dependence on loaded/error counts → 404-safe. See asset-preload spec.

export type LoaderState = { hasStarted: boolean; idleMs: number; ready: boolean }

export const initialLoaderState: LoaderState = { hasStarted: false, idleMs: 0, ready: false }

const IDLE_DEBOUNCE_MS = 300

export function advanceLoader(prev: LoaderState, active: boolean, dtMs: number): LoaderState {
  if (prev.ready) return prev
  const hasStarted = prev.hasStarted || active
  if (!hasStarted) return { hasStarted: false, idleMs: 0, ready: false }
  if (active) return { hasStarted: true, idleMs: 0, ready: false }
  const idleMs = prev.idleMs + dtMs
  return { hasStarted: true, idleMs, ready: idleMs >= IDLE_DEBOUNCE_MS }
}
```

- [ ] **Step 4: Run — expect PASS** (`npm test -- loaderState`).
- [ ] **Step 5: Commit** — `git add src/scene/assets/loaderState.ts src/scene/assets/loaderState.test.ts && git commit -m "feat: loaderState ready reducer (hasStarted + debounced idle, tested)"`

---

## Task 2: `manifest.ts` (owns all URLs)

**Files:** Create `src/scene/assets/manifest.ts`

- [ ] **Step 1: Write it** (exact URLs from the audit):

```ts
// src/scene/assets/manifest.ts
// Single source of truth for asset URLs. Components import from here; the
// preloader loads MODEL_URLS + TEXTURE_URLS as one batch.

// ── Character GLBs ──
export const HERO_URL = '/models/characters/heros.glb?v=3'
export const MAMA_URL = '/models/characters/mama.glb?v=3'
export const GRAND_UNCLE_URL = '/models/characters/grand-oncle.glb?v=3'
export const DOG_URL = '/models/characters/chien-puppy2.glb?v=3'
export const BASE_URLS = [
  '/models/characters/base-01.glb?v=3',
  '/models/characters/base-02.glb?v=3',
  '/models/characters/base-03.glb?v=3',
  '/models/characters/base-04.glb?v=3',
] as const

// ── Prop GLBs ──
export const SOFA_BODY_URL = '/models/props/canape-body.glb?v=3'
export const CUSHION_URLS = [
  '/models/props/coussin-rouge.glb?v=3',
  '/models/props/coussin-creme.glb?v=3',
  '/models/props/coussin-violet.glb?v=3',
] as const
export const CHAIR_URL = '/models/props/chaise.glb?v=3'
export const BUFFET_URL = '/models/props/buffet.glb?v=3'
export const ARMCHAIR_URL = '/models/props/fauteuil.glb?v=3'
export const TV_URL = '/models/props/tv.glb?v=3'

// ── Texture files ──
export const TEX_ADOBE = '/textures/mur-adobe-01.png'
export const TEX_TOMETTES = '/textures/sol-tomettes-01.png'
export const TEX_STONE = '/textures/mur-pierre.png'
export const TEX_WOOD_DARK = '/textures/bois-sombre-01.png'
export const TEX_AZULEJOS = '/textures/azulejos-talavera.png'
export const TEX_TABLECLOTH = '/textures/nappe-brodee-01.png'
export const CUSHION_TEX_URLS = [
  '/textures/coussin-rouge-01.png',
  '/textures/coussin-creme-01.png',
  '/textures/coussin-violet-01.png',
] as const

// ── Aggregates for the preloader ──
export const MODEL_URLS: string[] = [
  HERO_URL, MAMA_URL, GRAND_UNCLE_URL, DOG_URL, ...BASE_URLS,
  SOFA_BODY_URL, ...CUSHION_URLS, CHAIR_URL, BUFFET_URL, ARMCHAIR_URL, TV_URL,
]
export const TEXTURE_URLS: string[] = [
  TEX_ADOBE, TEX_TOMETTES, TEX_STONE, TEX_WOOD_DARK, TEX_AZULEJOS, TEX_TABLECLOTH,
  ...CUSHION_TEX_URLS,
]
```

- [ ] **Step 2:** `npm run typecheck` → zero.
- [ ] **Step 3: Commit** — `git commit -m "feat: asset manifest (owns all URLs)"`

---

## Task 3: Point consumers at the manifest

**Files (modify):** `Player.tsx`, `Dog.tsx`, `Mama.tsx`, `GrandUncle.tsx`, `Sofa.tsx`, `familyConfig.ts`, `shell/DiningArea.tsx`, `shell/Furniture.tsx`, `shell/SofaCorner.tsx`, `rooms/kitchen/KitchenTable.tsx`, `shared/paintedTextures.ts`, `shared/fabricTexture.ts`

- [ ] **Step 1:** In each, replace the literal URL with an import from the manifest. Examples:
  - `Player.tsx`: delete `const HERO_URL = '…'`, add `import { HERO_URL } from './assets/manifest'` (path: `Player.tsx` is in `src/scene/` → `'./assets/manifest'`). Keep `HERO_URL` usages.
  - `Dog.tsx`: `import { DOG_URL } from '../assets/manifest'`, replace `MODEL_URL` refs with `DOG_URL` (or `const MODEL_URL = DOG_URL`). Same for `Mama.tsx` (`MAMA_URL`), `GrandUncle.tsx` (`GRAND_UNCLE_URL`).
  - `Sofa.tsx`: import `SOFA_BODY_URL`, `CUSHION_URLS`, `CUSHION_TEX_URLS`; replace the local `BODY_URL`/`CUSHION_URLS`/`TEXTURE_URLS` consts.
  - `familyConfig.ts`: replace the four `modelUrl: '/models/characters/base-0X.glb?v=3'` with `BASE_URLS[0..3]` imported from the manifest.
  - `<Prop url=…>` sites: `DiningArea`/`KitchenTable` → `url={CHAIR_URL}`; `Furniture` → `url={BUFFET_URL}`; `SofaCorner` → `url={ARMCHAIR_URL}` and `url={TV_URL}`. Import the consts.
  - Texture modules `paintedTextures.ts`/`fabricTexture.ts`: where they build from a filename, import the matching `TEX_*` const (or the filename) from the manifest so the URL is defined once. (If a module derives many textures from one file with different repeats, import that one `TEX_*` const and reuse.)
- [ ] **Step 2:** `npm run typecheck` → zero (catches every missed reference). `npm test` → 119 green.
- [ ] **Step 3:** Visual: `npm run dev`, confirm the scene still loads (URLs unchanged in value, only their definition moved). Commit — `git commit -m "refactor: consumers import asset URLs from the manifest"`

---

## Task 4: `preloadAssets.ts`

**Files:** Create `src/scene/assets/preloadAssets.ts`

- [ ] **Step 1: Implement:**

```ts
// src/scene/assets/preloadAssets.ts
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { MODEL_URLS, TEXTURE_URLS } from './manifest'

let started = false

// Fire every asset load in one loading-manager batch. Idempotent.
export function preloadAll(): void {
  if (started) return
  started = true
  MODEL_URLS.forEach(url => useGLTF.preload(url))   // loads+parses into useGLTF cache
  const texLoader = new THREE.TextureLoader()       // DefaultLoadingManager
  TEXTURE_URLS.forEach(url => texLoader.load(url))
}
```

- [ ] **Step 2:** `npm run typecheck` → zero. Commit — `git commit -m "feat: preloadAll (one-batch asset preload)"`

Note: the shared texture modules already build their singletons from the same
URLs, so the scene reuses the cached textures (three caches by URL in the loader's
cache? no — but the browser HTTP cache serves the second request from memory; the
module singletons remain the render-used objects). The point of preloading the
textures here is to put their fetch+decode into the visible loading batch. Do NOT
change the texture modules to consume preloaded texture objects (out of scope) —
just ensure the URLs match (Task 3) so the browser cache is warm.

---

## Task 5: `SceneWarmup.tsx`

**Files:** Create `src/scene/assets/SceneWarmup.tsx`

- [ ] **Step 1: Implement:**

```tsx
// src/scene/assets/SceneWarmup.tsx
// Compiles all scene shader programs, then signals done. Deterministic warmup:
// the loader dismisses exactly when compileAsync resolves. Render this as the
// LAST child of the Canvas so its effect runs after the scene has mounted.
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

export function SceneWarmup({ onWarmed }: { onWarmed: () => void }) {
  const gl = useThree(s => s.gl)
  const scene = useThree(s => s.scene)
  const camera = useThree(s => s.camera)
  useEffect(() => {
    let cancelled = false
    // compileAsync (three r152+) resolves once programs for the current scene
    // graph are compiled. Objects with visible===false may be skipped (minor
    // first-appearance hitch, accepted per spec).
    gl.compileAsync(scene, camera).then(() => { if (!cancelled) onWarmed() })
    return () => { cancelled = true }
  }, [gl, scene, camera, onWarmed])
  return null
}
```

- [ ] **Step 2:** `npm run typecheck` → zero. (If `compileAsync` is missing on the type, confirm three 0.184 in `node_modules/three/package.json`; it exists — if TS lacks it, cast `gl as unknown as { compileAsync: (...args: unknown[]) => Promise<unknown> }` and note it.) Commit — `git commit -m "feat: SceneWarmup (compileAsync deterministic warmup signal)"`

---

## Task 6: Wire the gate into `App.tsx`

**Files:** Modify `src/App.tsx`

- [ ] **Step 1: Add a `useLoaderReady` hook** (top of App.tsx, near FadeIn). It drives `advanceLoader` from `useProgress().active` on a rAF loop and returns `ready`:

```tsx
import { advanceLoader, initialLoaderState, type LoaderState } from './scene/assets/loaderState'

function useLoaderReady(): boolean {
  const active = useProgress(s => s.active)
  const activeRef = useRef(active)
  activeRef.current = active
  const [ready, setReady] = useState(false)
  const stateRef = useRef<LoaderState>(initialLoaderState)
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = now - last; last = now
      stateRef.current = advanceLoader(stateRef.current, activeRef.current, dt)
      if (stateRef.current.ready) { setReady(true); return }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return ready
}
```

- [ ] **Step 2: In `App`**, call `preloadAll()` on mount, compute `ready` + `warmed`, and gate:

```tsx
// inside App(), before return:
useEffect(() => { preloadAll() }, [])
const ready = useLoaderReady()
const [warmed, setWarmed] = useState(false)
// fallback relative to mount: never hang forever
useEffect(() => {
  const t = setTimeout(() => setWarmed(true), 20000)
  return () => clearTimeout(t)
}, [])
```
Add imports: `import { preloadAll } from './scene/assets/preloadAssets'` and `import { SceneWarmup } from './scene/assets/SceneWarmup'`.

- [ ] **Step 3: Gate scene+composer on `ready`, warmup, and pass `warmed` to FadeIn.** Inside the `<Suspense>`, render the scene + composer only when `ready`, and add `<SceneWarmup onWarmed={() => setWarmed(true)} />` as the LAST child:

```tsx
<Suspense fallback={null}>
  {ready && (
    <>
      {PHOTO ? <PhotoCamera conf={PHOTO} /> : <Player />}
      <LivingRoom />
      {TOON_RICHE.enabled && !NOFX && (
        <EffectComposer multisampling={2}>
          {/* …existing Bloom/Noise/Vignette… */}
        </EffectComposer>
      )}
      <SceneWarmup onWarmed={() => setWarmed(true)} />
    </>
  )}
</Suspense>
```
`ReflectionsSansFog` / `ManualRender` may stay mounted (they don't capture framebuffers). Keep `<fog>` as-is.

- [ ] **Step 4: `FadeIn` dismisses on `warmed`, not on its own `!active` logic.** Change `<FadeIn />` to `<FadeIn done={warmed} />` and inside FadeIn: keep the progress bar (driven by `useProgress().progress`, with a `Math.max` monotonic guard) and the phrase rotation (interval, deps `[]`); replace the dismissal effect with: when `done` becomes true, `setFading(true)` then `setGone(true)` after the fade. Remove the old `!active` dismissal.

```tsx
function FadeIn({ done }: { done: boolean }) {
  const progress = useProgress(s => s.progress)
  const shown = useRef(0); if (progress > shown.current) shown.current = progress
  const [gone, setGone] = useState(false)
  const [fading, setFading] = useState(false)
  const [lineIdx, setLineIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setLineIdx(i => (i + 1) % LOADING_LINES.length), 1800)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (!done) return
    setFading(true)
    const t = setTimeout(() => setGone(true), 900)
    return () => clearTimeout(t)
  }, [done])
  if (gone) return null
  const pct = fading ? 100 : Math.min(99, Math.round(shown.current))
  /* …existing JSX using pct + LOADING_LINES[lineIdx]… */
}
```

- [ ] **Step 5: Verify** — `npm run typecheck` → zero. `npm test` → 119 green.
- [ ] **Step 6: Commit** — `git commit -m "feat: preload gate in App — ready/warmed, scene mounts on ready, FadeIn dismisses on warmed"`

---

## Task 7: Manual validation

- [ ] **Step 1:** `npm run dev`, hard-reload (Ctrl+Shift+R). Confirm:
  - The bar climbs 0→~99 **once**, no loop/reset back to 0.
  - The phrase **advances** through `LOADING_LINES` (may stutter during heavy parse — expected, see spec limits).
  - The loader dismisses shortly after the scene is ready (compileAsync), snapping to 100% then fading — **no post-reveal freeze**, **no black screen**.
  - The game is fully interactive after dismissal; every room/NPC/prop renders.
- [ ] **Step 2:** Test a failure path is non-fatal: rename one texture file temporarily (or note): the 20 s fallback dismisses the loader anyway. (Optional; restore the file.)
- [ ] **Step 3:** Journal note in `docs/journal/project-log.md` (preload landed, root cause was blocking multi-batch load).

---

## Self-review notes

- **Spec coverage:** manifest owns URLs (Task 2) + consumers import (Task 3); preloadAll one batch (Task 4); loaderState hasStarted+debounce, tested (Task 1); SceneWarmup compileAsync (Task 5); App gate ready/warmed + composer gated together + FadeIn on warmed + fallback (Task 6); limits/manual validation (Task 7). Audit (no inline textures) done pre-plan.
- **No placeholders:** reducer + manifest + preload + warmup + hook shown in full; App wiring shown as concrete diffs.
- **Type consistency:** `advanceLoader(prev, active, dtMs) → LoaderState{hasStarted,idleMs,ready}`, `initialLoaderState`, `preloadAll()`, `SceneWarmup({onWarmed})`, manifest `MODEL_URLS`/`TEXTURE_URLS` — names consistent across tasks.
- **Risk:** `compileAsync` TS typing (Task 5 fallback cast) and the rAF ticker cadence (dt from performance.now, debounce 300 ms comfortably above a frame) are the only soft spots; both handled.
