# Progressive Shader Compile — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compile the scene's shaders in time-spread batches (with the scene hidden) so the loading bar rises 0→100 for real and the phrases rotate over time — no long main-thread freeze, on every browser.

**Architecture:** At `ready` (assets preloaded) the scene mounts but is held invisible. A `ProgressiveWarmup` component compiles renderable objects a few per animation frame via `gl.compile(obj, camera, scene)`, yielding between frames so the thread breathes. Progress goes into a small zustand store the `FadeIn` bar reads. At 100% the scene is revealed and the loader dismisses.

**Tech Stack:** React Three Fiber, three 0.184 (`renderer.compile`), zustand, TypeScript strict, Vitest.

**Spec:** `docs/superpowers/specs/2026-07-16-progressive-shader-compile-design.md`. Real typecheck: `npm run typecheck` (`tsc -b`), NEVER `tsc --noEmit`. Branch: `feat-asset-preload` (continues the preload work).

**Verified:** `renderer.compile(object, camera, targetScene)` gathers lights from `targetScene`, compiles only `object`'s materials via `object.traverse` (ignores visibility), returns the material `Set`. So `gl.compile(obj, camera, scene)` compiles a subtree correctly, even hidden.

---

## File structure

- Create `src/scene/assets/compileQueue.ts` (+ `.test.ts`) — pure helpers (order/dedup, progress).
- Create `src/scene/assets/compileProgressStore.ts` — zustand store `{ progress, done }`.
- Create `src/scene/assets/ProgressiveWarmup.tsx` — the compiler component.
- Modify `src/App.tsx` — replace `SceneWarmup` with `ProgressiveWarmup`; drive `FadeIn` bar from the compile store; dismiss on store `done`.
- Delete `src/scene/assets/SceneWarmup.tsx` (superseded).

---

## Task 0: Spike the hidden-scene risk (reflectors + composer)

**Goal:** Before building the full flow, confirm hiding the whole scene during warmup doesn't break the `ZoneReflector` FBO passes or the `EffectComposer`. Exploratory; validated by the user in the browser.

**Files:** temporary edit to `src/scene/assets/SceneWarmup.tsx` (revert after).

- [ ] **Step 1:** In `SceneWarmup`, set `scene.visible = false` before `gl.compileAsync(...)` and `scene.visible = true` in the `.then` (right before `onWarmed`). Keep the satellite-detach as-is.
- [ ] **Step 2:** `npm run typecheck` → zero. `npm run dev`, hard-reload. Observe: does the app still reach the game? Any console errors from ZoneReflector / postprocessing during the hidden window? Does the scene render correctly after reveal?
- [ ] **Step 3: Decide + record.**
  - If clean (no errors, renders fine): the full flow can hide the whole `scene`. Proceed.
  - If the reflector/composer misbehaves: the full flow must ALSO pause reflector passes during warmup (e.g. a global `warmupActive` flag the reflectors + `ReflectionsSansFog` check) and/or skip the composer until reveal. Note the exact failure so Task 3/4 handle it.
- [ ] **Step 4:** Revert the temporary `SceneWarmup` edit (`git checkout src/scene/assets/SceneWarmup.tsx`). Record the spike result in the commit message of Task 3 or a journal note. No commit for the spike itself.

---

## Task 1: `compileQueue` pure helpers (TDD)

**Files:** Create `src/scene/assets/compileQueue.ts`, `src/scene/assets/compileQueue.test.ts`

- [ ] **Step 1: Write the failing test:**

```ts
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
```

- [ ] **Step 2: Run — FAIL** (`npm test -- compileQueue`).
- [ ] **Step 3: Implement `src/scene/assets/compileQueue.ts`:**

```ts
// Pure helpers for the progressive compile queue.

// Priority items first, then the rest; dedupe by key (first occurrence wins),
// preserving order within each group.
export function dedupePriority<T>(items: { key: string; priority: boolean; value: T }[]): T[] {
  const seen = new Set<string>()
  const pri: T[] = []
  const rest: T[] = []
  for (const it of items) {
    if (seen.has(it.key)) continue
    seen.add(it.key)
    ;(it.priority ? pri : rest).push(it.value)
  }
  return [...pri, ...rest]
}

export function progressOf(compiled: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(1, compiled / total)
}
```

- [ ] **Step 4: Run — PASS.** `npm test` → all green (125 + 5 new).
- [ ] **Step 5: Commit** — `git commit -m "feat: compileQueue pure helpers (dedup/priority/progress, tested)"`

---

## Task 2: `compileProgressStore` (zustand)

**Files:** Create `src/scene/assets/compileProgressStore.ts`

- [ ] **Step 1: Implement:**

```ts
// src/scene/assets/compileProgressStore.ts
// Bridges compile progress from inside the Canvas (ProgressiveWarmup) to the
// FadeIn overlay outside it. Mirrors how drei's useProgress is a store.
import { create } from 'zustand'

type CompileProgress = {
  progress: number // 0..1
  done: boolean
  setProgress: (p: number) => void
  markDone: () => void
}

export const useCompileProgress = create<CompileProgress>(set => ({
  progress: 0,
  done: false,
  setProgress: progress => set({ progress }),
  markDone: () => set({ done: true }),
}))
```

- [ ] **Step 2:** `npm run typecheck` → zero. (zustand is already a dependency — used by the game stores.)
- [ ] **Step 3: Commit** — `git commit -m "feat: compileProgressStore (compile→FadeIn bridge)"`

---

## Task 3: `ProgressiveWarmup` component

**Files:** Create `src/scene/assets/ProgressiveWarmup.tsx`

- [ ] **Step 1: Implement** (adjust per the Task 0 spike result — if reflectors needed pausing, add that here):

```tsx
// src/scene/assets/ProgressiveWarmup.tsx
// Compiles the scene's shader programs a few objects per frame with the scene
// hidden, yielding between frames so the main thread breathes (bar rises, phrases
// rotate). Reveals the scene at 100%. Render as the LAST child of the Canvas.
import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { dedupePriority, progressOf } from './compileQueue'
import { useCompileProgress } from './compileProgressStore'

const OBJECTS_PER_FRAME = 6            // tune: more = faster load, longer per-frame hitch
const SATELLITE_GROUP = 'satellite-rooms'

function isDescendant(obj: THREE.Object3D, ancestor: THREE.Object3D): boolean {
  let p: THREE.Object3D | null = obj
  while (p) { if (p === ancestor) return true; p = p.parent }
  return false
}

export function ProgressiveWarmup() {
  const gl = useThree(s => s.gl)
  const scene = useThree(s => s.scene)
  const camera = useThree(s => s.camera)
  const setProgress = useCompileProgress(s => s.setProgress)
  const markDone = useCompileProgress(s => s.markDone)

  const queue = useRef<THREE.Object3D[]>([])
  const total = useRef(0)
  const compiled = useRef(0)
  const finished = useRef(false)

  useEffect(() => {
    const sat = scene.getObjectByName(SATELLITE_GROUP)
    const items: { key: string; priority: boolean; value: THREE.Object3D }[] = []
    scene.traverse(obj => {
      const o = obj as THREE.Mesh
      if (!(o.isMesh || (obj as THREE.Points).isPoints || (obj as THREE.Line).isLine || (obj as THREE.Sprite).isSprite)) return
      const priority = !(sat && isDescendant(obj, sat)) // living-room first
      items.push({ key: obj.uuid, priority, value: obj })
    })
    queue.current = dedupePriority(items)
    total.current = queue.current.length
    compiled.current = 0
    finished.current = false
    scene.visible = false // render nothing heavy while we compile hidden
    return () => { scene.visible = true }
  }, [scene])

  useFrame(() => {
    if (finished.current) return
    for (let i = 0; i < OBJECTS_PER_FRAME && queue.current.length > 0; i++) {
      const obj = queue.current.shift()!
      try { gl.compile(obj, camera, scene) } catch (e) { console.warn('[warmup] compile skipped', e) }
      compiled.current++
    }
    setProgress(progressOf(compiled.current, total.current))
    if (queue.current.length === 0) {
      scene.visible = true
      finished.current = true
      markDone()
    }
  })

  return null
}
```

- [ ] **Step 2:** `npm run typecheck` → zero. `npm test` → green.
- [ ] **Step 3: Commit** — `git commit -m "feat: ProgressiveWarmup (time-spread hidden compile)"` (include the Task 0 spike outcome in the message body).

---

## Task 4: Wire into `App.tsx`

**Files:** Modify `src/App.tsx`; delete `src/scene/assets/SceneWarmup.tsx`

- [ ] **Step 1:** Replace the `SceneWarmup` import/usage with `ProgressiveWarmup`. In the `{ready && (…)}` block, swap `<SceneWarmup onWarmed={() => setWarmed(true)} />` for `<ProgressiveWarmup />` (last child). Remove the `warmed`/`setWarmed` state and its usage — dismissal now comes from the compile store.
- [ ] **Step 2:** Add `import { useCompileProgress } from './scene/assets/compileProgressStore'`. In `App`, read `const compileDone = useCompileProgress(s => s.done)` and pass `<FadeIn done={compileDone} />`. Keep the mount-relative fallback timer, but bump it to ~25 s and have it also force the store done: `useEffect(() => { const t = setTimeout(() => useCompileProgress.getState().markDone(), 25000); return () => clearTimeout(t) }, [])`.
- [ ] **Step 3:** In `FadeIn`, drive the bar from BOTH progress sources: the quick asset phase then the compile phase. Replace `const progress = useProgress(s => s.progress)` bar logic with:

```tsx
const assetActive = useProgress(s => s.active)
const compileProgress = useCompileProgress(s => s.progress) // 0..1
// Asset phase fills 0→30 %, compile phase fills 30→100 %. Monotonic guard.
const shown = useRef(0)
const raw = assetActive ? (useProgress.getState().progress * 0.30) : (30 + compileProgress * 70)
if (raw > shown.current) shown.current = raw
```
(Keep the phrase `setInterval` deps `[]`, the `done`→fade effect, and `if (gone) return null`. `pct = fading ? 100 : Math.min(99, Math.round(shown.current))`.)
Note: `useProgress.getState()` reads the drei store imperatively to avoid an extra subscription; if simpler, keep `const progress = useProgress(s => s.progress)` and use it directly. Either is fine as long as the bar is monotonic.

- [ ] **Step 4:** Delete `src/scene/assets/SceneWarmup.tsx` (`git rm src/scene/assets/SceneWarmup.tsx`).
- [ ] **Step 5:** `npm run typecheck` → zero. `npm test` → green.
- [ ] **Step 6: Commit** — `git commit -m "feat: App uses ProgressiveWarmup; FadeIn bar = assets then compile; dismiss on compile done"`

---

## Task 5: Manual validation + tune

- [ ] **Step 1:** `npm run dev`, hard-reload (Ctrl+Shift+R). Confirm:
  - The bar rises 0→100 **once**, monotonically, in visible steps (choppy is expected — see spec limits), never a long freeze at 99.
  - The phrases **rotate** over the load (they advance because the thread breathes between batches).
  - At 100% the scene reveals fully rendered — no black screen, no big post-reveal freeze.
  - Walk every room: all render; entering a room has at most a tiny hitch.
- [ ] **Step 2: Tune `OBJECTS_PER_FRAME`** if needed: raise it (e.g. 10–16) for a faster load with slightly longer per-frame hitches, or lower it (3–4) for a smoother bar over a longer load. Commit the chosen value.
- [ ] **Step 3:** Journal note in `docs/journal/project-log.md` — progressive compile landed; root cause was ~12 s synchronous shader compile (no `KHR_parallel_shader_compile` on Firefox); fixed by hidden time-spread compilation driving a real bar.

---

## Self-review notes

- **Spec coverage:** real 0→100 bar (Task 4 FadeIn), phrases over time (setInterval + breathing thread), no long freeze (Task 3 per-frame yield), hidden-scene mechanism (Task 3), store bridge (Task 2), pure tested queue logic (Task 1), reflector/composer risk spiked FIRST (Task 0), fallback (Task 4). Limits (choppy ~200 ms steps) acknowledged in Task 5.
- **No placeholders:** helpers + store + component + wiring shown in full; Task 0 is an explicit spike with a decision gate.
- **Type consistency:** `dedupePriority`/`progressOf`, `useCompileProgress` `{progress,done,setProgress,markDone}`, `ProgressiveWarmup` used identically across tasks.
- **Risk:** Task 0 gates the hidden-scene assumption; if it fails, Task 3 gains a reflector-pause flag (called out in Task 3 Step 1). `OBJECTS_PER_FRAME` is the one tunable (Task 5).
