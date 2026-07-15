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

1. **`src/scene/assets/manifest.ts`** — the single source of truth for what to
   preload. To avoid drift (see Risks), it **imports the existing URL constants**
   rather than re-typing strings:
   - Re-export/aggregate the GLB URL constants already defined in components
     (`HERO_URL`, the `MODEL_URL`s in Dog/Mama/GrandUncle, `BODY_URL`/`CUSHION_URLS`
     in Sofa, chair/prop GLBs, etc.). Those local consts must be **exported** so the
     manifest imports them (one definition, no duplication).
   - Aggregate the texture URL strings from the shared texture modules
     (`paintedTextures`, `fabricTexture`, `papelTexture`, `vistaTextures`, …). Where
     a module builds textures from filenames, export the filename list.
   - Result: `export const MODEL_URLS: string[]` and `export const TEXTURE_URLS:
     string[]`, both derived from real definitions.

2. **`src/scene/assets/preloadAssets.ts`** — `preloadAll()` fires every load in
   one batch: `MODEL_URLS.forEach(u => useGLTF.preload(u))` (loads + parses GLBs
   into the useGLTF cache) and loads every texture in `TEXTURE_URLS` through the
   DefaultLoadingManager (or ensures the shared texture-singleton modules are
   imported so their `TextureLoader.load()` fires). All go through the same manager
   → `useProgress` sees one batch.

3. **Preload gate in `App`** — a `ready` state (data preloaded) and a `warmed`
   state (shaders compiled):
   - On mount: call `preloadAll()`.
   - `<FadeIn>` overlay reads `useProgress` → the real monotonic bar. It stays up
     until `warmed`.
   - The scene (`<Player/>`, `<LivingRoom/>`) **and the `EffectComposer`** mount
     together only when `ready` (so the composer never captures an empty
     framebuffer — see Risks). Gate them as one unit.
   - `ready` is set when the preload batch completes: `useProgress` `active` goes
     false after having loaded (guard against the initial idle-before-start with a
     "has started" flag, or key off `loaded === total && total > 0`).

4. **Shader warmup — `src/scene/assets/SceneWarmup.tsx`** — a component rendered
   inside the Canvas once the scene is mounted. In an effect it calls
   `gl.compileAsync(scene, camera)` (three r152+, available in three 0.184) and,
   when the returned Promise resolves, calls `onWarmed()`. This is the
   **deterministic warmup-done signal** — the loader dismisses exactly when all
   scene programs are compiled, not after an arbitrary frame count.

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
- **Fallback timeout** (e.g. 15 s): force `ready`/`warmed` even if the batch never
  reports complete, so the loader can never hang forever on a missing asset.

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
