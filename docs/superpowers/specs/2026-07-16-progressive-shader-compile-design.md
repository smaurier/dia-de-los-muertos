# Design — Progressive (time-budgeted) shader compile

Date: 2026-07-16
Status: approved (design), pending implementation plan
Builds on: `docs/superpowers/specs/2026-07-15-asset-preload-design.md` (asset preload)

## Problem

After the asset preload fixed the loading-bar loop, a freeze remains: compiling
the whole house's shaders (~60 programs) is a **~12 s block on the main thread**.
Measured: whole house `compileAsync` = 12098 ms; living-room-only = 2170 ms.
On GPUs without `KHR_parallel_shader_compile` (e.g. Firefox), `compileAsync`
degrades to a synchronous `compile()` that blocks — the browser cannot repaint the
bar or run the phrase timer, so both freeze. This is universal (Firefox is the
strict target: "if it works there, it works everywhere").

Hiding satellite rooms doesn't help: the open-plan arches make adjacent rooms
visible from the salon (why room-culling was removed), and a hidden room compiles
the moment it is revealed/rendered. The only universal fix is to **not compile
everything in one blocking call** — chunk the compile so the thread breathes.

## Goal (user requirements)

- A **real 0→100 bar** that reflects actual work and rises monotonically.
- **Loading phrases that rotate over TIME**, not tied to the percentage — evenly
  spread across the load duration.
- **No long freeze**, on every browser (universal; no reliance on a GPU
  extension).

## Key mechanism (verified against three 0.184)

`renderer.compile(object, camera, targetScene)`:
- gathers lights from `targetScene` (and `object` if different),
- initializes only the materials found under `object` (via `object.traverse`,
  NOT `traverseVisible` — so it compiles even invisible objects),
- returns the `Set` of materials it touched.

So `gl.compile(chunk, camera, fullScene)` compiles just `chunk`'s materials with
the full scene's lighting → we can compile **any subtree** correctly, and we can
compile **invisible** objects.

**Why hide the scene during warmup:** once the scene mounts, R3F's render loop
would render the first frame and compile every visible material at once (the 12 s
block) before our progressive compiler runs. So during warmup we keep the scene
**invisible** (render does no heavy compile), compile subtrees progressively (works
because `compile` ignores visibility for material init), then reveal at 100% (the
reveal render is fast — everything is already compiled). The full-screen loader
(opacity 1) covers the hidden scene the whole time.

## Architecture

At `ready` (assets preloaded — from the preload design), the scene mounts but is
held invisible. A progressive compiler compiles materials in **time-budgeted
batches** (≈ one batch per animation frame, ~70 ms budget), yielding between → the
main thread breathes → the bar rises and phrases rotate. At 100%: reveal the scene,
dismiss the loader.

### Components

1. **`src/scene/assets/compileProgressStore.ts`** — a tiny zustand store
   `{ progress: number /*0..1*/, done: boolean, set… }`, mirroring how drei's
   `useProgress` is a store. Written by the compiler (inside the Canvas), read by
   `FadeIn` (outside the Canvas). This is the clean cross-boundary channel.

2. **`src/scene/assets/compileQueue.ts`** — a **pure, tested** helper for the
   queue/budget logic: given the list of compile units and a per-frame time
   budget, decide how many units to process this frame and compute progress. Split
   the *decision* (falsifiable: units-consumed, progress, done) from the GL side
   effect (`gl.compile`). E.g. `nextBatch(state, elapsedMsPerUnit, budgetMs)` — or
   simpler, a function that reports progress from `{ compiled, total }`. Test it.

3. **`src/scene/assets/ProgressiveWarmup.tsx`** — a component rendered as the LAST
   child of the Canvas (so it mounts after the scene). On mount:
   - Traverse the scene, collect renderable objects (Mesh/Points/Line/Sprite) into
     an ordered queue: **living-room objects first** (spawn view), then satellite
     rooms. Dedupe by material (a `Set<Material>` of already-compiled) so the same
     shared material is not recompiled.
   - Set the scene (or a designated root group) **invisible** for the duration.
   - Each frame (`useFrame`): pull objects from the queue and `gl.compile(obj,
     camera, scene)`, then yield (return). Update `compileProgressStore.progress =
     compiledMaterials / totalMaterials`.
   - **The atomic unit is ONE program (~200 ms), not a 70 ms slice.** A single
     `gl.compile` of an uncompiled material blocks ~200 ms and cannot be preempted,
     so a per-frame time budget only controls *how many programs* per frame
     (minimum one). Compile **one program per frame** (or a small count) and yield,
     so the browser repaints the bar and the phrase timer fires between programs.
     Already-compiled (shared) materials are near-free — dedupe by material so only
     *new* programs count toward the ~200 ms cost.
   - When the queue is empty: restore visibility (reveal), set
     `compileProgressStore.done = true`.
   - Cleanup restores visibility if unmounted mid-warmup.

4. **`FadeIn` (App.tsx)** — the bar is driven by `compileProgressStore.progress`
   (the real long work), preceded by the quick asset-preload fill. Keep the
   monotonic guard. Phrase rotation stays a `setInterval` (deps `[]`); because the
   thread breathes between batches, it fires on schedule → phrases rotate over
   time. Dismiss on `compileProgressStore.done`.

5. **Replace `SceneWarmup.tsx`** (the current one-shot salon-only `compileAsync`)
   with `ProgressiveWarmup`. The salon-only foundation is superseded.

### Data flow

ready → scene mounts (held invisible) → each frame: compile ~70 ms of materials +
yield → store.progress rises, phrases tick → queue empty → reveal scene + store.done
→ FadeIn fades → game visible.

## Ordering & phrases

- Queue order: living-room objects first, then satellite rooms (any order).
  Spawn-visible shaders are ready earliest; the bar's early progress is the salon.
- Phrases divide by **time**: a fixed `setInterval` (≈ 1.8 s) spreads ~6–7 lines
  across the ~12 s compile, independent of the percentage. No coupling to progress.

## Error handling

- If `gl.compile` throws for one object, catch + log, skip it, continue the queue
  (one bad material must not stall warmup).
- Fallback timer (from the preload design, relative to mount, ~25 s): force
  `done` so the loader can never hang.

## Risks to prototype FIRST (before building the full flow)

1. **Reflectors + postprocessing during the hidden warmup.** `ZoneReflector` runs
   its FBO pass in a `useFrame` that is independent of mesh visibility, and the
   `EffectComposer` renders every frame. With the scene root `visible = false`,
   these passes render an empty scene (probably harmless) — but this is UNVERIFIED.
   The reflector pass could misbehave or compile its own material outside our queue.
   Prototype this interaction early: confirm reflectors/composer don't break or do
   heavy recompiling during the hidden warmup. If they do, also pause the reflector
   passes (and/or skip the composer) until the reveal.
2. **Reveal hitch.** The first VISIBLE render after reveal draws the full scene
   through the composer once; even fully compiled, confirm it doesn't hitch
   noticeably. If it does, reveal a frame or two before dropping the loader.

## Limits (honest)

- The bar advances in **~200 ms steps** (one program per frame) — it is **choppy
  (~5 fps during load), not silky**, but it genuinely rises and never freezes for
  long. The phrases tick between programs. Universal — no GPU extension required.
  This is the honest outcome: "progress in visible steps," not "smooth."
- React StrictMode double-invokes effects in dev → the compile runs ~twice in dev
  (slower); production (no StrictMode) runs once. Not a code bug.
- This does not reduce total compile WORK (that would be fewer programs — a
  separate perf effort, out of scope). It spreads the work so the UI stays alive.

## Testing

- **`compileQueue` — unit tested (Vitest, TDD).** The budget/progress decision is
  the falsifiable core: progress = compiled/total, done when queue empty, batch
  respects the budget. Cover empty queue, single unit, budget boundary.
- The GL compile + Canvas integration: manual validation — the bar rises 0→100
  smoothly (small stutters OK, no long freeze), phrases rotate on time, the scene
  reveals fully compiled with no post-reveal freeze, all rooms render.

## Open implementation choices (decide in the plan)

- **Compile granularity:** per-object (simplest, dedupe by material) vs per-region
  group. Start per-object with material dedupe; it naturally yields many small
  units for a smooth bar.
- **What to hide:** the whole scene root vs a dedicated wrapper group. Prefer
  hiding the top-level scene content group so postprocessing/reflection passes have
  nothing heavy to render during warmup.
