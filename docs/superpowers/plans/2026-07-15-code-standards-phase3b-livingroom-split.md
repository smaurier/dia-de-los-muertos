# Phase 3B — Split LivingRoomShell + translate (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Break the 1465-line god-component `LivingRoomShell.tsx` into ~13 single-responsibility sub-components under `src/scene/living-room/shell/`, translating its French body (comments + local identifiers) to English in the same pass.

**Architecture:** One coherent region moves out per task into its own file; `LivingRoomShell` shrinks to a thin assembly. Shared layout/colour data moves to `shell/livingRoomConstants.ts`. Each extraction is behavior-preserving. There is NO unit test for scene JSX — the net is `npm run typecheck` (the REAL one, `tsc -b`; NOT `tsc --noEmit`, which is a no-op on this repo) + `npm test` (logic, stays 119) + a mandatory visual check per task (the scene must look byte-identical).

**Tech Stack:** React Three Fiber, TypeScript strict, drei.

**Not a TDD plan.** Verification gates (typecheck + visual) replace new tests.

---

## Critical process notes

- **Real typecheck: `npm run typecheck`** (= `tsc -b`). After each task run it and expect zero errors. `npx tsc --noEmit` checks nothing here — do not use it.
- **One region at a time, visual check each** (lesson: multi-room rollback). Never extract several regions in one commit.
- **Anchor by section comment, not line number.** LivingRoomShell uses `{/* ─── <Section> ──… */}` banner comments. Each extraction task names the banner(s) whose JSX block moves. Line numbers shift as you go — the banner text is the stable anchor.
- **Translate as you move.** When a region moves to its file, translate its French comments + local identifiers to English. Keep game DATA (none here beyond colours/positions, which are code) — colours/positions are code constants, translate their names if French.
- **Do NOT change geometry, positions, colours values, or render order.** Extraction preserves the exact JSX. Render order inside `<group>` matters only for transparency sorting — keep the same order in the assembly as the original.

---

## File structure (target)

New dir `src/scene/living-room/shell/`:

| File | Responsibility | Source (banner / local fn) |
|---|---|---|
| `livingRoomConstants.ts` | Shared colours, chair layout, papel/frame/plate arrays, `intradosGeometry` | consts at top of LivingRoomShell (C_*, PAPEL_*, FLAG_X, CHAIRS, TABLE_LEG_*, FRAMES_*, WINDOW_CZ, REJA_DZ, PLATE_*, intradosGeometry) |
| `TVScreen.tsx` | CRT screen flicker material | local `TVScreen` |
| `LeafyPlant.tsx` | Leafy plant prop (was `PlanteFeuillue`) | local `PlanteFeuillue` |
| `PapelGarland.tsx` | Papel picado flags + strands (was `PapelFlag`/`PapelStrand`/`strandY`) | local `PapelFlag`, `PapelStrand`, `strandY`, `STRAND_*`, `FLAG_W/H` |
| `Curtains.tsx` | Curtain panels + sash frame (was `RideauPanel`/`SashFrame`) | local `RideauPanel`, `SashFrame`, `RIDEAU_*` |
| `LivingRoomLighting.tsx` | All lights | banner `Éclairage` |
| `LivingRoomStructure.tsx` | Floor (+reflector), ceiling/vigas, walls S/N/E/W, arches, intrados | banners `Sol tomettes`, `Plafond + vigas`, `Mur Sud`, `Mur Nord`, `Mur Est`, `Mur Ouest` |
| `LivingRoomWindow.tsx` | Big west window: frame, sliding sash, curtains, WindowVista, glass | banners `Grande fenêtre à rideaux`, `Fenêtre coulissante` |
| `DiningArea.tsx` | Central table, set table, 20 chairs, plates, candles | banners `Table centrale`, `Table dressée`, `20 chaises`, `Bougies table` |
| `SofaCorner.tsx` | Footstool, corner sofa, rug, armchair, CRT TV + cabinet | banners `Coin salon SUD-OUEST`, `Repose-pied`, `Canapé d'angle`, `Tapis`, `Fauteuil`, `Télé CRT` |
| `Furniture.tsx` | Buffet (+candles), zaguán corridor, dresser, front door | banners `Buffet/commode`, `Bougies buffet`, `Zaguán`, `Vaisselier` |
| `Decorations.tsx` | Photo frames, cactus, leafy plants, chandelier, bassinet | banners `Cadres photos`, `Cactus`, `Lustre`, + `<Bassinet/>` |
| `SatelliteRooms.tsx` | The group rendering all other rooms + SkyDome | banners `Pièces satellites`, `Bulle de ciel` |

`LivingRoomShell.tsx` keeps: the `useFrame`/refs (if any), the `SceneAuditProbe`/`PerfProbe` (`Audit + perf` banner), and composes the sub-components in the original order.

**English names for the French locals:** `PlanteFeuillue`→`LeafyPlant`, `RideauPanel`→`CurtainPanel`, `strandY`→`strandSagY` (or `strandY` is fine — already terse English-ish), `intradosGeometry` stays. Translate French consts: `RIDEAU_W/H/PLEATS`→`CURTAIN_W/H/PLEATS`, `STRAND_*` already English.

---

## Task 0: Create the shell/ dir + constants module

**Files:** Create `src/scene/living-room/shell/livingRoomConstants.ts`

- [ ] **Step 1:** Move every module-level `const`/`type` from the top of `LivingRoomShell.tsx` that is shared by ≥2 future sub-components into `shell/livingRoomConstants.ts`, translating comments to English. This is: the colour consts (`C_WOOD_DARK`…`C_CERAMIC`), `PAPEL_COLORS`, `PAPEL_X`, `FLAG_X`, `ChairCfg` type + `CHAIRS`, `TABLE_LEG_X/Z`, `FRAMES_SOUTH/EAST`, `WINDOW_CZ`, `REJA_DZ`, `PLATE_X/Z`, and `intradosGeometry`. Export each. `SHOW_AABB` stays in LivingRoomShell (used by the structure/ceiling — pass as needed or re-declare where used; prefer exporting it from constants too).
- [ ] **Step 2:** In `LivingRoomShell.tsx`, import what it still uses from `./shell/livingRoomConstants`. Remove the moved declarations.
- [ ] **Step 3:** `npm run typecheck` → zero errors. `npm test` → 119 green.
- [ ] **Step 4:** Visual: `npm run dev`, reload, confirm the salon is unchanged (nothing should differ yet — pure move).
- [ ] **Step 5:** Commit: `git commit -m "refactor(living-room): extract shared constants to shell/livingRoomConstants"`

---

## Tasks 1-4: Extract the four leaf sub-components

Each: create `shell/<Name>.tsx`, move the local function(s) + their private consts into it (translated), export it, import it back into LivingRoomShell, delete the local definition. Then `npm run typecheck` + visual + commit. One component per task/commit.

- [ ] **Task 1 — `shell/TVScreen.tsx`**: move local `TVScreen`. Deps: `useRef`, `useFrame`, `THREE`. Commit `refactor(living-room): extract TVScreen`.
- [ ] **Task 2 — `shell/LeafyPlant.tsx`**: move local `PlanteFeuillue` renamed `LeafyPlant`; update its usages in the JSX. Deps: `THREE`, `Outlines`, `toonGradient`, `C_LEAF`/`C_POT` from constants. Commit `refactor(living-room): extract LeafyPlant (was PlanteFeuillue)`.
- [ ] **Task 3 — `shell/PapelGarland.tsx`**: move `strandY`, `PapelFlag`, `PapelStrand` + their consts (`STRAND_*`, `FLAG_W/H`). Export a `PapelGarland` component that renders the strands (the papel-picado JSX block from the `Papel picado` banner moves here too — see Task for structure/decor split; simplest: `PapelGarland` renders the full papel section driven by `PAPEL_X`/`FLAG_X`/`papelTextures`). Deps: `papelTextures`, `NO_PAPEL`, `PAPEL_COLORS`, `PAPEL_X`, `FLAG_X`. Commit `refactor(living-room): extract PapelGarland`.
- [ ] **Task 4 — `shell/Curtains.tsx`**: move `RideauPanel`→`CurtainPanel`, `SashFrame` + `RIDEAU_*`→`CURTAIN_*`. Deps: `THREE`, `Outlines`, `rideauTexture`, `toonGradient`. Commit `refactor(living-room): extract Curtains`.

After each, LivingRoomShell imports the new component and its JSX usage stays where it was.

---

## Tasks 5-12: Extract the JSX regions

Each task: create `shell/<Region>.tsx` exporting `function <Region>()`; CUT the JSX under the named banner(s) from LivingRoomShell's return; paste it as the component's returned fragment (`<>…</>`); add the imports the moved JSX needs (consts from `./livingRoomConstants`, textures from `../../shared/*`, drei, THREE, sub-components); translate the moved comments; in LivingRoomShell replace the cut block with `<Region />` at the SAME position. Then `npm run typecheck` + visual (walk the salon, check that region) + commit.

- [ ] **Task 5 — `shell/LivingRoomLighting.tsx`** — banner `Éclairage`. Deps: none beyond three primitives. Commit `refactor(living-room): extract LivingRoomLighting`.
- [ ] **Task 6 — `shell/LivingRoomStructure.tsx`** — banners `Sol tomettes`, `Plafond + vigas`, `Mur Sud`, `Mur Nord`, `Mur Est`, `Mur Ouest`. Deps: wall/floor textures, `toonGradient`, `intradosGeometry`, `SHOW_AABB`, colour consts, `SALON_OBSTACLES` (if the AABB debug boxes are here), the salon FLOOR `ZoneReflectorMaterial` (multiline block) — KEEP it inline here (it is the unique tomettes-floor reflector, not glass). Commit `refactor(living-room): extract LivingRoomStructure`.
- [ ] **Task 7 — `shell/LivingRoomWindow.tsx`** — banners `Grande fenêtre à rideaux`, `Fenêtre coulissante`. Uses `Curtains`, `WindowVista`, window frame, and the salon-window glass. **Adopt GlassReflector for the salon window** here: extend `src/scene/shared/GlassReflector.tsx` to accept optional `resolution` and `salonScope` props (add `resolution = 256`, `salonScope = false` to its signature and pass them through), then replace the inline `<ZoneReflectorMaterial zone="salon" salonScope … resolution={512} … />` with `<GlassReflector zone="salon" salonScope resolution={512} />`. Deps: `GlassReflector`, `Curtains`, `WindowVista`, `CURTAIN_*`, `REJA_DZ`, `WINDOW_CZ`, textures. Commit `refactor(living-room): extract LivingRoomWindow + salon window uses GlassReflector`.
- [ ] **Task 8 — `shell/DiningArea.tsx`** — banners `Table centrale`, `Table dressée`, `20 chaises`, `Bougies table`. Uses `CHAIRS`, `TABLE_LEG_*`, `PLATE_*`, `Tablecloth`, `Prop` (chair GLB), candle sub-render. Commit `refactor(living-room): extract DiningArea`.
- [ ] **Task 9 — `shell/SofaCorner.tsx`** — banners `Coin salon SUD-OUEST`, `Repose-pied`, `Canapé d'angle`, `Tapis`, `Fauteuil`, `Télé CRT`. Uses `Sofa`, `TVScreen`, `Prop`, colour consts. Commit `refactor(living-room): extract SofaCorner`.
- [ ] **Task 10 — `shell/Furniture.tsx`** — banners `Buffet/commode`, `Bougies buffet`, `Zaguán`, `Vaisselier`. Uses `Prop`, `FrontDoor`, colour consts. Commit `refactor(living-room): extract Furniture`.
- [ ] **Task 11 — `shell/Decorations.tsx`** — banners `Cadres photos`, `Cactus`, `Lustre`, plus the `<Bassinet/>` and any `LeafyPlant` placements. Uses `PhotoFrame`, `LeafyPlant`, `Bassinet`, `FRAMES_*`, `C_CACTUS`/`C_POT`/`C_GOLD`/`C_IRON`. Commit `refactor(living-room): extract Decorations`.
- [ ] **Task 12 — `shell/SatelliteRooms.tsx`** — banners `Pièces satellites`, `Bulle de ciel`. Renders the `<group name="satellite-rooms">` with Kitchen/Pantry/Corridor/Bedroom1/Bedroom2/Bathroom/StorageRoom/Office/Patio/Garage + `SkyDome`. Keep the `name="satellite-rooms"` string (data — `getObjectByName` depends on it). Commit `refactor(living-room): extract SatelliteRooms`.

---

## Task 13: Thin assembly + final translation

- [ ] **Step 1:** LivingRoomShell.tsx should now be a thin component: imports the 8 region components + keeps `SceneAuditProbe`/`PerfProbe` (the `Audit + perf` banner) and any residual `useFrame`/refs. Its return composes them in the ORIGINAL order:
  Lighting → Structure → SatelliteRooms → sky(in SatelliteRooms) → Window → PapelGarland → DiningArea → SofaCorner → Furniture → Decorations → probes. (Match the original interleaving exactly — re-read the pre-split order.)
- [ ] **Step 2:** Translate any remaining French comments/identifiers left in LivingRoomShell.tsx.
- [ ] **Step 3:** Residue check on the shell dir:
```bash
grep -rInEi "é|è|à|ê|î|ô|û|ç|\b(mur|porte|fenêtre|pièce|piece|sol|plafond|toit|gauche|droite|hauteur|largeur|profond|derrière|devant|dessus|dessous|coin|bougie|rideau|arche|meuble)\b" src/scene/living-room/shell src/scene/living-room/LivingRoomShell.tsx
```
Expect none (all translated).
- [ ] **Step 4:** `npm run typecheck` → zero. `npm test` → 119 green.
- [ ] **Step 5:** Full visual review: walk the whole salon — lighting, floor reflection, walls, arches, big window + curtains, papel picado, table + chairs + plates, sofa corner + TV, buffet + dresser + zaguán, photo frames, cactus, chandelier, bassinet. Everything byte-identical to before Phase 3B.
- [ ] **Step 6:** Commit: `git commit -m "refactor(living-room): LivingRoomShell is now a thin assembly (+ body translated)"`

---

## Self-review notes

- **Spec coverage:** Phase 3 "break god-components into single-responsibility sub-components, translating in the same pass" — LivingRoomShell covered by Tasks 0-13. Kitchen is Phase 3C (separate plan). Reflector factoring extended (salon window → GlassReflector, Task 7). Wall/floor duplication check: the walls live in one `LivingRoomStructure` now — assess during Task 6 whether any wall JSX is repeated enough to factor a `<Wall>` helper (only if genuinely duplicated; YAGNI otherwise).
- **No placeholders:** each task names exact files + the stable banner anchors + dep lists + the verify/commit protocol. The moved JSX is existing code (not reproduced here — the executor cuts/pastes it; reproducing 1465 lines would be noise).
- **Risk control:** one region per commit, `npm run typecheck` + visual after each, so any regression is isolated to one small diff.
- **Ordering:** constants → leaf components → regions → thin assembly. Later regions depend on earlier leaf components (SofaCorner needs TVScreen; Window needs Curtains; Decorations needs LeafyPlant) — hence leaves (Tasks 1-4) before regions (5-12).
