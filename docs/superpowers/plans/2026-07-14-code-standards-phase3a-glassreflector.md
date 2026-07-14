# Phase 3A — GlassReflector preset (DRY) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the duplicated `ZoneReflectorMaterial` "window glass" block repeated across the satellite rooms by extracting a single `GlassReflector` preset component.

**Architecture:** 6 room call sites use a byte-identical set of 11 props on `ZoneReflectorMaterial`, differing only by `zone`. Wrap those defaults in a `GlassReflector({ zone })` component in `src/scene/shared/`. This is a scene component (no unit test possible without WebGL) — the safety net is `tsc --noEmit`, `npm test` (logic unchanged), and a visual check that reflections look identical.

**Tech Stack:** React Three Fiber, TypeScript strict.

**Not a TDD plan** — a behavior-preserving DRY extraction. Verification gates replace new tests.

---

## Scope

**In scope — the 6 identical "glass" call sites** (all use exactly:
`transparent opacity={0.68} color="#e8f0f4" resolution={256} mirror={1} mixStrength={1.4} blur={[0, 0]} roughness={0.06} metalness={0} depthScale={0} side={THREE.DoubleSide}`, differing only by `zone`):
- `src/scene/rooms/Bathroom.tsx:112` (zone="sdb")
- `src/scene/rooms/Garage.tsx:100` (zone="garage")
- `src/scene/rooms/Bedroom1.tsx:171` (zone="chambre1")
- `src/scene/rooms/Bedroom2.tsx:124` and `:174` (zone="chambre2", two windows)
- `src/scene/rooms/Office.tsx:118` (zone="bureau")

**Out of scope (genuinely different — do NOT force into the preset, YAGNI):**
- `src/scene/rooms/Corridor.tsx:162` — an opaque MIRROR (`color="#dfe8ec"`, no `transparent`, `resolution={512}`, `mixStrength={1.0}`, `roughness={0.04}`). One-off; leave inline.
- `LivingRoomShell.tsx:386` — the tomettes FLOOR reflector (map/normalMap/distortion/blur[250,90]); unique. Leave inline.
- `LivingRoomShell.tsx:673` — the salon WINDOW (glass preset + `salonScope` + `resolution={512}`). Deferred to Phase 3B (when LivingRoomShell is split), to avoid editing the deferred god-component body here.

`ZoneId` values (`'sdb'`, `'garage'`, …) stay — they are data.

---

## File Structure

- Create: `src/scene/shared/GlassReflector.tsx` — the preset. One responsibility: the shared window-glass reflector material, parameterised only by `zone`.
- Modify: the 5 room files above (6 call sites) to use `<GlassReflector zone="…" />`.

---

## Task 1: Create the GlassReflector preset

**Files:**
- Create: `src/scene/shared/GlassReflector.tsx`

- [ ] **Step 1: Write the component**

Create `src/scene/shared/GlassReflector.tsx`:

```tsx
// src/scene/shared/GlassReflector.tsx
// Shared "window glass" reflector preset: the exact material used on every
// satellite-room window. Bakes the 11 props that were duplicated across rooms;
// only `zone` varies. Renders as a material (attaches to the parent mesh).
import * as THREE from 'three'
import { ZoneReflectorMaterial } from './ZoneReflector'
import type { ZoneId } from '../../game/systems/roomZones'

export function GlassReflector({ zone }: { zone: ZoneId }) {
  return (
    <ZoneReflectorMaterial
      zone={zone}
      transparent
      opacity={0.68}
      color="#e8f0f4"
      resolution={256}
      mirror={1}
      mixStrength={1.4}
      blur={[0, 0]}
      roughness={0.06}
      metalness={0}
      depthScale={0}
      side={THREE.DoubleSide}
    />
  )
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no output. (Confirms `ZoneId` import path and `ZoneReflectorMaterial` prop compatibility.)

- [ ] **Step 3: Commit**

```bash
git add src/scene/shared/GlassReflector.tsx
git commit -m "feat: GlassReflector preset (shared window-glass reflector)"
```

---

## Task 2: Replace the 6 room call sites

**Files:**
- Modify: `src/scene/rooms/Bathroom.tsx`, `Garage.tsx`, `Bedroom1.tsx`, `Bedroom2.tsx`, `Office.tsx`

For each file: replace the import and the call site(s). The mesh + `<planeGeometry>` around the material stay unchanged.

- [ ] **Step 1: Bathroom.tsx**

Replace the import line `import { ZoneReflectorMaterial } from '../shared/ZoneReflector'` with:
```tsx
import { GlassReflector } from '../shared/GlassReflector'
```
Replace line 112's `<ZoneReflectorMaterial zone="sdb" transparent opacity={0.68} color="#e8f0f4" resolution={256} mirror={1} mixStrength={1.4} blur={[0, 0]} roughness={0.06} metalness={0} depthScale={0} side={THREE.DoubleSide} />` with:
```tsx
        <GlassReflector zone="sdb" />
```
If `THREE` is no longer used elsewhere in the file after this change, tsc's `noUnusedLocals` (if on) will flag the now-unused `import * as THREE`. Check: only remove the THREE import if tsc complains AND THREE is truly unused in the file. (Most room files use THREE elsewhere — leave it.)

- [ ] **Step 2: Garage.tsx** — same edit, `zone="garage"`:
```tsx
import { GlassReflector } from '../shared/GlassReflector'
```
```tsx
            <GlassReflector zone="garage" />
```

- [ ] **Step 3: Bedroom1.tsx** — same, `zone="chambre1"`:
```tsx
import { GlassReflector } from '../shared/GlassReflector'
```
```tsx
        <GlassReflector zone="chambre1" />
```

- [ ] **Step 4: Bedroom2.tsx** — same, BOTH sites (line 124 and 174), `zone="chambre2"`:
```tsx
import { GlassReflector } from '../shared/GlassReflector'
```
Replace each of the two `<ZoneReflectorMaterial zone="chambre2" … />` with:
```tsx
        <GlassReflector zone="chambre2" />
```

- [ ] **Step 5: Office.tsx** — same, `zone="bureau"`:
```tsx
import { GlassReflector } from '../shared/GlassReflector'
```
```tsx
        <GlassReflector zone="bureau" />
```

- [ ] **Step 6: Verify types + tests**

Run: `npx tsc --noEmit` → expected no output.
Run: `npm test` → expected all green (119 tests, 13 files; logic unchanged).

- [ ] **Step 7: Confirm no stray ZoneReflectorMaterial in these files**

Run: `grep -rn "ZoneReflectorMaterial" src/scene/rooms/Bathroom.tsx src/scene/rooms/Garage.tsx src/scene/rooms/Bedroom1.tsx src/scene/rooms/Bedroom2.tsx src/scene/rooms/Office.tsx`
Expected: no matches (all replaced). Corridor.tsx intentionally still uses it (mirror) — not in this list.

- [ ] **Step 8: Visual review**

`npm run dev`, reload, walk Bathroom, Garage, Bedroom 1, Bedroom 2, Office. Confirm each window still reflects exactly as before (same opacity/tint/mirror). Compare against the unchanged Corridor mirror for sanity.

- [ ] **Step 9: Commit**

```bash
git add src/scene/rooms/Bathroom.tsx src/scene/rooms/Garage.tsx src/scene/rooms/Bedroom1.tsx src/scene/rooms/Bedroom2.tsx src/scene/rooms/Office.tsx
git commit -m "refactor: use GlassReflector preset in the 6 room windows (DRY)"
```

---

## Self-review notes

- **Spec coverage:** Phase 3 spec item "Factor the repeated ZoneReflectorMaterial block (9 rooms) into a shared component/preset." Covered. Note: the real count is 6 identical glass sites + Corridor(mirror, distinct) + salon window(deferred to 3B) + salon floor(unique) — not a blind "9". The preset covers the genuinely-duplicated set only (YAGNI: don't fold the mirror/floor in).
- **No placeholders:** exact files, exact before/after code, exact commands.
- **Type consistency:** `GlassReflector({ zone }: { zone: ZoneId })` used identically at all 6 call sites. `ZoneId` imported from `roomZones`.
- **YAGNI:** preset takes only `zone` (all 6 sites are byte-identical otherwise). `salonScope`/`resolution` overrides are NOT added now — they'll be added in 3B when the salon window (resolution 512 + salonScope) adopts the preset, if desired.
