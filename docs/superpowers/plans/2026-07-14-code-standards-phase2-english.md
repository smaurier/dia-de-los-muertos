# Code Standards — Phase 2: English dev convention (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the codebase follow an English dev convention — translate French
**comments** and French **code identifiers** to English — without touching game
content/data.

**Architecture:** Mechanical, behavior-preserving refactor done in waves (one
directory group per wave). No new behavior, so no new tests: the safety net is
`tsc --noEmit` (catches broken identifier refs) + `npm test` (logic layer) +
manual visual review for scene waves. Each wave is a separate commit.

**Tech Stack:** TypeScript strict, React Three Fiber, Vitest.

**This is a refactor plan, not TDD.** The "test" steps are verification gates
(tsc + tests + visual), not new unit tests — translation adds no behavior.

---

## Scope — what to translate vs what to leave

**TRANSLATE (dev convention):**
- All French comments (`//` and `/* */`) → English.
- File-LOCAL French identifiers → English: local `const`/`let` variables,
  function names, parameters, `type`/`interface` names, and their in-file usages.
  Example: `const hauteurMur = 2.4` → `const wallHeight = 2.4`;
  `function poseAssise()` → `function seatedPose()`.

**DO NOT TRANSLATE (game content / data / external — not code convention):**
- String literal VALUES that are game data: dialogue text (`'¿Alguien quiere
  más?'`), character `name`/`speakerName` (`'Mamá Elena'`), scenario `id`
  values (`'maman_assis'`).
- `ZoneId` values (`'cuisine'`, `'couloir'`, `'sdb'`, `'zaguan'`, …) and any
  `userData` string values (`reflectorZone: 'bureau'`). These are data keys with
  no tsc net.
- Asset URL paths (`/models/characters/grand-oncle.glb`, `/textures/coussin-*`).
- External/library names: Mixamo bone names (`'mixamorig:Head'`), object graph
  names used by `getObjectByName` (`'satellite-rooms'` — already English anyway).

**ALSO IN SCOPE (user: rename directories and filenames too):**
- Rename French `.tsx`/`.ts` FILES and their exported component/symbol names to
  English, and any French directory names. Done in a dedicated final wave
  (Wave 5) so import ripple is handled in one tsc-guarded pass. See the rename
  mapping table in Wave 5.

**DEFERRED to Phase 3 (do NOT do here):**
- Translating the BODIES of the god-components `SalonRoom.tsx` and `Cuisine.tsx`
  (comments + internals) — Phase 3 splits and translates them together.
  EXCEPTION: their filenames ARE renamed in Wave 5 (cheap, tsc-guarded); only
  their French bodies stay until Phase 3. Import lines pointing at renamed files
  ARE updated inside them in Wave 5 (fixing an import ≠ translating the body).

---

## Per-wave procedure (identical for every wave)

For the files listed in the wave:

- [ ] **Step 1: Translate**

Go file by file. Translate every French comment to natural English. Rename
file-local French identifiers (vars, functions, params, types) to English and
update their in-file usages. Apply the scope rules above — leave data strings,
ZoneId values, asset paths, bone names, and exported component/file names alone.

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no output. (If a renamed identifier broke a reference, tsc names it —
fix before continuing.)

- [ ] **Step 3: Verify logic tests**

Run: `npm test`
Expected: all suites green (unchanged count).

- [ ] **Step 4 (scene waves only): Visual review**

Run `npm run dev`, reload, and walk the rooms touched by this wave. Confirm
nothing changed visually (geometry, materials, animations, reflections identical).
Waves touching only `src/game`/`src/audio` skip this step.

- [ ] **Step 5: French residue check**

Run (bash): grep the wave's files for leftover French. Example for a wave:
`grep -InE "é|è|à|ê|î|ô|û|ç" src/scene/shared/*.ts src/scene/shared/*.tsx`
Expected: only intentional data strings remain (dialogue, thematic names). Any
leftover comment/identifier French → translate it.

- [ ] **Step 6: Commit**

```bash
git add <the wave's files>
git commit -m "refactor(i18n): English dev convention — <wave name>"
```

---

## Waves (files listed explicitly; run in order)

### Wave 0 — logic + audio (comments only, no visual)

Identifiers here are already English; only comments need translating.
Files:
- `src/game/systems/roomZones.ts`
- `src/game/systems/doorSystem.ts`
- `src/game/store/doorStore.ts`
- `src/game/controlsConfig.ts`
- `src/audio/layers.ts`
- `src/audio/AudioLayerManager.ts`

Skip Step 4 (no scene). Residue grep target: the six files above.

### Wave 1 — scene/shared

Files:
- `src/scene/shared/blinkTexture.ts`
- `src/scene/shared/paintedTextures.ts`
- `src/scene/shared/vistaTextures.ts`
- `src/scene/shared/fabricTexture.ts`
- `src/scene/shared/papelTexture.ts`
- `src/scene/shared/toonGradient.ts`
- `src/scene/shared/ZoneReflector.tsx`
- `src/scene/shared/DomeCiel.tsx`
- `src/scene/shared/RoomGroup.tsx`
- `src/scene/shared/Prop.tsx`
- `src/scene/shared/Porte.tsx`, `PorteAnimee.tsx`, `PorteBleue.tsx`

Note: `Porte`/`PorteAnimee`/`PorteBleue` are exported component names → in this
wave translate only comments + local internals; the file/component RENAME happens
in Wave 5.

### Wave 2 — scene/rooms (excluding Cuisine.tsx)

Files:
- `src/scene/rooms/Couloir.tsx`
- `src/scene/rooms/Patio.tsx`
- `src/scene/rooms/Chambre1.tsx`
- `src/scene/rooms/Chambre2.tsx`
- `src/scene/rooms/SalleDeBain.tsx`
- `src/scene/rooms/Garage.tsx`
- `src/scene/rooms/Cellier.tsx`
- `src/scene/rooms/Bureau.tsx`
- `src/scene/rooms/Debarras.tsx`

In this wave translate comments + local internals only; the room file/component
RENAMES happen in Wave 5 (they ripple into `SalonRoom.tsx` imports, handled
there). `Cuisine.tsx` body is deferred to Phase 3, but its file is renamed in
Wave 5.

### Wave 3 — scene/salon (excluding SalonRoom.tsx)

Files:
- `src/scene/salon/salonCollision.ts` (+ check `salonCollision.test.ts` still
  green; do NOT rename exported symbols used by the test unless you also update
  the test in the same commit — prefer leaving exported names for Phase 3)
- `src/scene/salon/familyConfig.ts`
- `src/scene/salon/PorteEntree.tsx`
- `src/scene/salon/WindowVista.tsx`
- `src/scene/salon/GrandUncle.tsx`
- `src/scene/salon/doorConfig.ts`
- `src/scene/salon/Mama.tsx`
- `src/scene/salon/FamilyMember.tsx`, `FamilyMemberGLB.tsx`
- `src/scene/salon/Couffin.tsx`
- `src/scene/salon/chairConfig.ts`
- `src/scene/salon/NappeCloth.tsx`
- `src/scene/salon/Salon.tsx`
- `src/scene/salon/Chien.tsx`
- `src/scene/salon/Canape.tsx`

Reminder: `familyConfig.ts` scenario `id`/dialogue/`name`/`speakerName` are DATA
— leave them. Translate only comments and local code identifiers.

### Wave 4 — top-level, ui, debug

Files:
- `src/scene/Player.tsx`
- `src/App.tsx`
- `src/scene/ui/DoorHint.tsx`
- `src/scene/debug/sceneAudit.tsx`
- `src/scene/debug/PerfProbe.tsx`
- `src/scene/debug/perfFlags.ts`

`Player.tsx` was partly touched in Phase 1 (faceState/npc extraction) — its new
code is already English; translate the remaining French comments + local
identifiers.

### Wave 5 — file / directory / exported-component renames (tsc-guarded)

Rename French files, exported component/symbol names, and any French directory
names to English, fixing every import in one pass. Do this LAST so all bodies are
already translated. Rename ONE file at a time, run `tsc` after each, fix the
imports it names, then move to the next — small steps keep the ripple traceable.

**Directories:** the current dirs (`game`, `store`, `systems`, `audio`, `scene`,
`shared`, `rooms`, `salon`, `ui`, `debug`, `hooks`) are already English — likely
no directory renames needed. Rename only a dir that is actually French.

**Rename mapping (French file/component → English).** Proper names and thematic
Spanish stay. Keep `ZoneId` VALUES untouched (data) even when the matching
component is renamed — e.g. component `Chambre1`→`Bedroom1` but zone id stays
`'chambre1'`.

| Current file / component | Rename to |
|---|---|
| `Porte.tsx` / `Porte` | `Door.tsx` / `Door` |
| `PorteAnimee.tsx` / `PorteAnimee` | `AnimatedDoor.tsx` / `AnimatedDoor` |
| `PorteBleue.tsx` / `PorteBleue` | `BlueDoor.tsx` / `BlueDoor` |
| `PorteEntree.tsx` / `PorteEntree` | `FrontDoor.tsx` / `FrontDoor` |
| `Couloir.tsx` / `Couloir` | `Corridor.tsx` / `Corridor` |
| `Chambre1.tsx` / `Chambre1` | `Bedroom1.tsx` / `Bedroom1` |
| `Chambre2.tsx` / `Chambre2` | `Bedroom2.tsx` / `Bedroom2` |
| `SalleDeBain.tsx` / `SalleDeBain` | `Bathroom.tsx` / `Bathroom` |
| `Cellier.tsx` / `Cellier` | `Pantry.tsx` / `Pantry` |
| `Debarras.tsx` / `Debarras` | `StorageRoom.tsx` / `StorageRoom` |
| `Bureau.tsx` / `Bureau` | `Office.tsx` / `Office` |
| `Cuisine.tsx` / `Cuisine` | `Kitchen.tsx` / `Kitchen` (file+name only; body Phase 3) |
| `Canape.tsx` / `Canape` | `Sofa.tsx` / `Sofa` |
| `Chien.tsx` / `Chien` | `Dog.tsx` / `Dog` |
| `Couffin.tsx` / `Couffin` | `Bassinet.tsx` / `Bassinet` |
| `NappeCloth.tsx` / `NappeCloth` | `TableclothCloth.tsx` / `TableclothCloth` |
| `DomeCiel.tsx` / `DomeCiel` | `SkyDome.tsx` / `SkyDome` |
| `SalonRoom.tsx` / `SalonRoom` | `LivingRoom.tsx` / `LivingRoom` (file+name only; body Phase 3) |
| `salonCollision.ts` (+ `.test.ts`) | `livingRoomCollision.ts` (+ update test import + exported symbols) |
| `doorConfig.ts`, `chairConfig.ts` | already English — leave |

Keep (English, Spanish thematic, or proper names): `Salon.tsx` (thematic; if
renamed, use `Living.tsx` only if you also rename its exports consistently —
otherwise leave), `Patio.tsx`, `Garage.tsx`, `Mama.tsx`, `GrandUncle.tsx`,
`FamilyMember.tsx`, `FamilyMemberGLB.tsx`, `WindowVista.tsx`, `Prop.tsx`,
`RoomGroup.tsx`, `Couffin`→see table, texture/config `.ts` already English.

- [ ] **Step per rename:** rename the file (`git mv`), update the exported
  symbol name inside it, run `npx tsc --noEmit`, fix every import path/name tsc
  flags (including one-line import fixes inside `SalonRoom.tsx`/`Cuisine.tsx`),
  re-run `tsc` until clean.
- [ ] **After each rename:** `npm test` green.
- [ ] **After all renames:** visual review (reload, walk every room), then commit:
  `git commit -m "refactor(i18n): rename French files/components to English"`
  (or commit in small groups of related renames).

---

## Phase 2 closure

- [ ] **Final residue sweep**

Run: `grep -rInE "é|è|à|ê|î|ô|û|ç" src --include=*.ts --include=*.tsx | grep -v -E "\.test\.|SalonRoom|Cuisine"`
Expected: only intentional data strings (Spanish dialogue, thematic names).
Everything else translated. `SalonRoom.tsx`/`Cuisine.tsx` intentionally excluded.

- [ ] **Final verify**: `npx tsc --noEmit` (clean) + `npm test` (green).

- [ ] **Journal note**: append a dated "Phase 2 — English dev convention" entry
  to `docs/journal/project-log.md` recording waves done and what stays French by
  design (SalonRoom/Cuisine → Phase 3; data strings → permanent).

---

## Self-review notes

- **Spec coverage:** spec Phase 2 = English migration. Refined by user to
  "comments + code identifiers + file/dir/component renames; game content/data
  stays". Covered by scope rules + Waves 0-4 (comments/internals) + Wave 5
  (renames). Red-zone data strings (userData/ZoneId/asset paths) excluded per
  user intent. God-component BODIES folded into Phase 3; their filenames renamed
  in Wave 5.
- **Note:** after Wave 5, the closure residue-sweep exclusions `SalonRoom`/
  `Cuisine` become `LivingRoom`/`Kitchen` — grep for the renamed names.
- **No placeholders:** every wave lists exact files; the procedure gives exact
  commands. Translations are mechanical (can't pre-enumerate every word), so the
  concreteness lives in the file lists + rules + verification gates, which is the
  right altitude for a translation refactor.
- **Type consistency:** no new symbols introduced; tsc guards every rename.
