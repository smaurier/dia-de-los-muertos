# Design — Clean asset preload + real progress

Date: 2026-07-15
Status: approved (design), pending implementation plan

## Problem

The loading screen looks broken: the progress bar loops 0→100→0 and the phrase
never changes. Root cause (diagnosed 2026-07-15, systematic debugging): assets
load in **successive batches** — each scene component mounts, triggers its
`useGLTF`/`useTexture`, the single Suspense boundary re-suspends, resolves, more
components mount. `useProgress`/DefaultLoadingManager resets 0→100 per batch → the
bar loops. And the ~18–20 s of GLB parse + shader compile **block the main
thread**, starving the phrase-rotation timer and freezing repaints.

No loader-logic tweak can animate through a frozen main thread (two such fixes
were tried and reverted). The fix is architectural: **preload everything in one
pass with a real monotonic progress, then mount the scene, then warm up shaders
before revealing.**

## Goal

One clean 0→100 progress bar over the whole asset set; the scene mounts only when
data is cached; no post-reveal freeze. Keep the existing cempasúchil bar + Spanish
loading phrases (now driven by a real, monotonic percentage).

## Scope decision (user)

Preload **ALL** assets up front (salon + every satellite room + NPCs), not just
the critical path. One honest bar covering the full asset set.

## Architecture

A **preload gate** loads all assets through the loading manager as a single batch
(→ `useProgress` is monotonic 0→100). The scene mounts only after data is cached,
then shaders are compiled deterministically before the loader dismisses.

### Components

1. **`src/scene/assets/manifest.ts`** — the single source of truth. The manifest
   **owns** the URLs; components **import from it** (inverted dependency — the
   manifest does NOT import component internals). Concretely:
   - Define and export every asset URL here: `export const HERO_URL = '…'`, the
     NPC model URLs, sofa body/cushion URLs, chair/prop GLB URLs, and the texture
     filenames.
   - Also export the aggregate arrays: `export const MODEL_URLS: string[]` and
     `export const TEXTURE_URLS: string[]`.
   - **Refactor consumers** (Dog, Mama, GrandUncle, Sofa, Player, chair/prop
     configs, and the shared texture modules `paintedTextures`/`fabricTexture`/…)
     to import their URL from the manifest instead of defining a local literal.
     One definition, consumed everywhere → no drift possible.

2. **`src/scene/assets/preloadAssets.ts`** — `preloadAll()` fires every load in
   one batch, explicitly (no side-effect module imports):
   - GLBs: `MODEL_URLS.forEach(u => useGLTF.preload(u))` (loads + parses into the
     useGLTF cache the scene later reads).
   - Textures: load each `TEXTURE_URLS` entry explicitly via a `THREE.TextureLoader`
     (default manager). The shared texture modules build their singletons from the
     SAME manifest URLs, so the scene reuses the already-loaded textures — no double
     load, no reliance on import order.
   - All go through the DefaultLoadingManager → `useProgress` sees one batch.

3. **Preload gate in `App`** — a `ready` state (data preloaded) and a `warmed`
   state (shaders compiled):
   - On mount: call `preloadAll()`.
   - `<FadeIn>` overlay reads `useProgress` → the bar. It stays up until `warmed`.
   - The scene (`<Player/>`, `<LivingRoom/>`) **and the `EffectComposer`** mount
     together only when `ready`, gated as ONE unit (so the composer never captures
     an empty framebuffer — the known black-screen bug, App.tsx:207).
   - **`ready` = debounced idle (CRITICAL — do not use naive `!active`).** The
     original bug is exactly that `active`/`loaded`/`total` batch and reset. Because
     `useGLTF.preload` is async and loads may register across ticks, a naive
     `!active` fires on an intermediate batch gap → scene mounts → new loads →
     re-batch (bug reproduced). Instead: set `ready` only when `active` has been
     **continuously false for ≥ 300 ms** (any new load flips `active` true and
     resets the timer). Floor it with an expected-count sanity check: don't `ready`
     before `loaded` has reached at least `MODEL_URLS.length + TEXTURE_URLS.length`
     at some point. This debounce is the same fix shape as the loader dismissal —
     get it right here, it is the crux of the design.

4. **Shader warmup — `src/scene/assets/SceneWarmup.tsx`** — a component rendered
   inside the Canvas once the scene is mounted. In an effect it calls
   `gl.compileAsync(scene, camera)` (three r152+, available in three 0.184) and,
   when the returned Promise resolves, calls `onWarmed()`. This is the
   **deterministic warmup-done signal** — the loader dismisses exactly when the
   compiled programs are ready, not after an arbitrary frame count.
   - **Caveat:** `compile()` only compiles materials of objects it walks as
     currently relevant; objects with `visible === false` (gated reflectors,
     satellite rooms masked by culling) may be skipped, so a small hitch is still
     possible the first time such an object appears. Acceptable — the bulk of the
     first-frame program set is compiled. Note it; do not try to force-compile
     everything (diminishing returns).

### Data flow

App mounts → `preloadAll()` fires GLB + texture loads (one manager batch) →
`useProgress` climbs 0→100 (monotonic, one batch) → `ready` → scene + composer
mount (cache hits, fast) → `SceneWarmup` runs `gl.compileAsync(scene, camera)` →
Promise resolves → `warmed` → `<FadeIn>` fades out → game visible.

### FadeIn changes

Keep the cempasúchil bar + rotating Spanish `LOADING_LINES`. Progress is now a
real single-batch value (no ratchet hack needed, though a `Math.max` guard is
cheap insurance). The phrase rotation runs while the loader is up; it will still
stutter during heavy parse chunks (main-thread), but it will advance — no longer
frozen on index 0 for the whole load. Dismiss on `warmed`.

## Error handling

- If an asset 404s or errors, `useProgress.errors` is populated; log it.
- **Fallback timeout, relative to mount:** arm a single timer at App mount (e.g.
  20 s — comfortably above the observed ~18 s load). If it fires before the normal
  path, force `ready` then `warmed`, so the loader can never hang forever on a
  missing/failed asset. (Relative to mount, not a long stare at 100 % after the
  bar fills.)

## Limits (honest expectations — not over-promising)

- Preloading everything up front does **not reduce total load time** (same 19
  assets). GLB parse + shader compile remain main-thread, so the bar **advances in
  jumps with brief freezes between big parses** — it is monotonic and real, but not
  buttery smooth.
- **True smoothing = off-thread asset processing** (Draco/meshopt decoders in
  workers, KTX2 compressed textures) — deliberately **out of scope, Phase 2.** This
  design fixes the loop/stuck/frozen-phrase bug and gives an honest %; it does not
  make loading fast.

## Testing

- No unit test for the loading-manager/Canvas integration — validated manually:
  the bar climbs 0→100 **once** (no loop, no reset), the phrase advances, the
  loader dismisses at true completion, no black-screen and no post-reveal freeze.
- A `manifest` test is **not** included: with the manifest derived from real
  constants it cannot meaningfully duplicate, and "covers every asset the scene
  uses" is not statically checkable — a weak test would give false confidence.

## Pre-implementation audit (must do first)

- **Verify every texture is in an importable shared singleton module.** The
  import-based preload only covers textures created in the shared modules. If any
  component builds a texture inline (`new TextureLoader().load(...)` in a component
  body), it escapes the batch and loads late → the loop returns for it. Audit and,
  if found, move such textures into a shared module or add their URL to the
  manifest explicitly.
