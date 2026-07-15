# Phase 3D — `<Wall>` helper (DRY) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the wall-mesh boilerplate repeated ~130 times across the house by extracting a `<Wall>` component, then converting every adobe-wall call site to use it.

**Architecture:** The pattern `<mesh position rotation><planeGeometry args={[w,h]} /><meshToonMaterial map={murAdobe…} gradientMap={toonGradient} [side] /></mesh>` (optionally followed by `<Outlines>`) appears ~130× (99 `murAdobeSide`, 18 lintel, 7 north, a few stone/south, 6 azulejos). `<Wall>` collapses each to one line. Behavior-preserving. No unit test for scene JSX — net is `npm run typecheck` (REAL, `tsc -b`; NOT `tsc --noEmit`) + `npm test` (119) + visual check per file.

**Tech Stack:** React Three Fiber, TypeScript strict, drei.

**Not a TDD plan.** Verification gates (typecheck + visual) replace new tests.

---

## Critical process notes

- **Real typecheck: `npm run typecheck`** (never `tsc --noEmit`).
- **One file at a time**, `npm run typecheck` + visual per file, commit per file. `tsc` does NOT catch a wrong position/size — convert meticulously, copying the exact `position`/`rotation`/`args`/`map` values.
- **Behavior-preserving:** `<Wall position={P} rotation={R} size={[w,h]} map={M} />` must render byte-identical to the mesh it replaces. Keep the same map, same side, same outline.
- Only convert meshes that match the pattern exactly (toon + `map` + `gradientMap`). Leave anything with `color=`, `transparent`, `meshPhongMaterial`, `emissive`, or extra material props inline.

---

## Task 1: Create the `<Wall>` component

**Files:** Create `src/scene/shared/Wall.tsx`

- [ ] **Step 1:** Write it:

```tsx
// src/scene/shared/Wall.tsx
// A flat toon-shaded textured plane — the house's wall primitive.
// Replaces the repeated <mesh><planeGeometry/><meshToonMaterial map gradientMap/></mesh>.
// Default map is the adobe side texture (the dominant wall); override for
// lintels, north face, stone, azulejos, etc.
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from './toonGradient'
import { murAdobeSide } from './paintedTextures'

type WallProps = {
  position: [number, number, number]
  size: [number, number]
  rotation?: [number, number, number]
  map?: THREE.Texture
  side?: THREE.Side
  outline?: number  // outline thickness; omit = no outline
}

export function Wall({ position, size, rotation, map = murAdobeSide, side, outline }: WallProps) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshToonMaterial map={map} gradientMap={toonGradient} side={side} />
      {outline !== undefined && <Outlines thickness={outline} color="black" />}
    </mesh>
  )
}
```

- [ ] **Step 2:** `npm run typecheck` → zero.
- [ ] **Step 3:** Commit: `git add src/scene/shared/Wall.tsx && git commit -m "feat: Wall component (toon textured-plane primitive)"`

---

## Tasks 2-N: Convert each file's walls (one file per task/commit)

For each file below: for every `<mesh …><planeGeometry args={[w,h]} /><meshToonMaterial map={<M>} gradientMap={toonGradient} [side={S}] /></mesh>` (and a trailing `<Outlines thickness={t} …/>` if present), replace with `<Wall position={…} rotation={…} size={[w,h]} [map={<M>}] [side={S}] [outline={t}] />`. Omit `map` when it is `murAdobeSide` (the default). Omit `rotation` when there is none. Import `Wall` from the shared path; remove now-unused texture imports IF `npm run typecheck`'s noUnusedLocals flags them (a file may still use a texture elsewhere — check). After each file: `npm run typecheck` (zero) + `npm test` (119) + **visual check that room** + commit `refactor(walls): use <Wall> in <File>`.

**Conversion rules:**
- Copy `position`, `rotation`, `args` (→ `size`), `map`, `side` values EXACTLY.
- If a mesh has ANYTHING beyond `<planeGeometry>` + `<meshToonMaterial map gradientMap [side]>` [+ `<Outlines>`], leave it inline (do not force it into `<Wall>`).
- Do NOT change any numeric value.

Convert in this order (each its own commit):

- [ ] **Task 2** — `src/scene/rooms/Corridor.tsx` (~23 walls; import path `../shared/Wall`)
- [ ] **Task 3** — `src/scene/living-room/shell/LivingRoomStructure.tsx` (~32 walls; import path `../../shared/Wall`)
- [ ] **Task 4** — `src/scene/rooms/Bedroom2.tsx`
- [ ] **Task 5** — `src/scene/rooms/Bedroom1.tsx`
- [ ] **Task 6** — `src/scene/rooms/Office.tsx`
- [ ] **Task 7** — `src/scene/rooms/Garage.tsx`
- [ ] **Task 8** — `src/scene/rooms/Bathroom.tsx`
- [ ] **Task 9** — `src/scene/rooms/Patio.tsx`
- [ ] **Task 10** — `src/scene/rooms/Pantry.tsx`
- [ ] **Task 11** — `src/scene/rooms/StorageRoom.tsx`
- [ ] **Task 12** — `src/scene/rooms/kitchen/KitchenStructure.tsx` (adobe walls; the azulejos `map={azulejosTalavera}` panels can also use `<Wall map={azulejosTalavera}>`; the STONE east wall uses `stoneWallGeometry` (not planeGeometry) → leave it inline)

(If a listed file turns out to have no convertible wall meshes, skip it and note so — no empty commit.)

---

## Task 13: Sweep for stragglers

- [ ] **Step 1:** Confirm remaining raw wall meshes are intentional (color/phong/transparent ones). Run:
```bash
grep -rn "meshToonMaterial map={murAdobe" src/scene
```
Expect zero (or only ones with extra props that were intentionally left). Any plain leftover → convert it in the owning file.
- [ ] **Step 2:** `npm run typecheck` → zero. `npm test` → 119.
- [ ] **Step 3:** Final visual review: walk the whole house — every wall present, same textures/positions, arches/openings intact, no missing or doubled walls. Commit any straggler conversions.

---

## Self-review notes

- **Spec coverage:** Phase 3 "verify wall/floor duplication before extracting; factor if real (YAGNI otherwise)." Verified REAL (~130 adobe-wall sites). Floors/ceilings are NOT included: they often use `meshPhongMaterial` or `color=` (different material) — leaving them out is the YAGNI boundary. Only the toon-map wall pattern is factored.
- **No placeholders:** the `<Wall>` code is complete; each task names an exact file + the mechanical conversion rule + verify/commit protocol. Per-site values are copied from existing code (not reproducible generically — that's the executor's careful copy).
- **Type consistency:** `Wall({ position, size, rotation?, map?, side?, outline? })` used identically everywhere; `map` defaults to `murAdobeSide`.
- **Risk control:** one file per commit + `npm run typecheck` + visual per room, so a bad conversion is isolated to one small diff and one room.
