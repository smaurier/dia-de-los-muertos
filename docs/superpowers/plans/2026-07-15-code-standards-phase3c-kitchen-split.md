# Phase 3C — Split Kitchen + translate (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Break the 665-line god-component `Kitchen.tsx` into ~9 single-responsibility sub-components under `src/scene/rooms/kitchen/`, translating its French body (comments + local identifiers) to English in the same pass.

**Architecture:** Same method as Phase 3B (LivingRoomShell). One coherent region moves out per task into its own file; `Kitchen.tsx` shrinks to a thin assembly. Shared origin/colour constants move to `kitchen/kitchenConstants.ts`. Behavior-preserving. No unit test for scene JSX — net is `npm run typecheck` (the REAL one, `tsc -b`; NOT `tsc --noEmit`, a no-op here) + `npm test` (119) + a mandatory visual check per group.

**Tech Stack:** React Three Fiber, TypeScript strict, drei.

**Not a TDD plan.** Verification gates (typecheck + visual) replace new tests.

---

## Critical process notes (same as 3B)

- **Real typecheck: `npm run typecheck`** (= `tsc -b`). Zero errors after each task. Never `tsc --noEmit`.
- **One region at a time, visual check per group.** `npm run typecheck` does NOT catch a dropped/reordered mesh — move blocks VERBATIM (only translating comments), preserve sibling order.
- **Anchor by banner comment** (`{/* ── <Section> ── */}`), not line number.
- **Translate as you move** (comments + local identifiers). Game DATA stays: asset paths (`/models/...`, `/textures/...`), `ZoneId`/`userData` values, `getObjectByName` names, Spanish dialogue/labels if any.
- Kitchen origin: `CX=-3.8, CZ=8.9, CW=6.4, CD=6.2` — many meshes are positioned relative to these. Keep them exact.

---

## File structure (target) — new dir `src/scene/rooms/kitchen/`

| File | Responsibility | Source (banner / local fn) |
|---|---|---|
| `kitchenConstants.ts` | Colours (`C_*`) + kitchen origin/dims (`CX`,`CZ`,`CW`,`CD`) | consts at top of Kitchen.tsx |
| `BulbFlicker.tsx` | Flickering bare bulb material (was `AmpouleFlicker`) | local `AmpouleFlicker` |
| `KitchenStructure.tsx` | Floor, ceiling, north/west/east walls, azulejos backsplash, garden blue door | banners `Sol tomettes`, `Plafond`, `Mur fond nord`, `Mur ouest`, `Mur est`, `Azulejos crédence`, `Porte bleue du jardin` |
| `KitchenLighting.tsx` | Hanging bulb (uses BulbFlicker) + fill lights | banners `Ampoule nue suspendue`, `Lumières d'appoint` |
| `Stove.tsx` | Old white wood stove (was `Fogón`) | banner `Fogón` |
| `KitchenShelf.tsx` | Wall shelf + hanging utensils + old radio | banners `Étagère murale`, `Radio ancienne` |
| `KitchenTable.tsx` | Central table + chairs | banners `Table cuisine`, `Chaises cuisine` |
| `KitchenAppliances.tsx` | 90s fridge (magnets/photos) + sink (basin/dishes/towel) | banners `Frigo années 90`, `Évier` |
| `KitchenAltar.tsx` | Kitchen ofrenda + petal dresser (was `Ofrenda`/`Desserte`) | banners `Ofrenda de cuisine`, `Desserte du coin pierre` |
| `KitchenDecor.tsx` | Virgen de Guadalupe + butcher calendar + dog basket | banners `Virgen de Guadalupe`, `Panier du chien` |

`Kitchen.tsx` keeps nothing but the assembly (ordered `<Region/>` tags).

**English names for French locals:** `AmpouleFlicker`→`BulbFlicker`, `Fogón`→`Stove`. Translate French consts if any (colours are already `C_*`).

---

## Task 0: dir + constants

**Files:** Create `src/scene/rooms/kitchen/kitchenConstants.ts`.

- [ ] **Step 1:** Move the module-level colour consts and `CX/CZ/CW/CD` from the top of `Kitchen.tsx` into `kitchen/kitchenConstants.ts`, `export` each, translate their comments. Do NOT rename identifiers.
- [ ] **Step 2:** Import them back into `Kitchen.tsx` (what it still uses).
- [ ] **Step 3:** `npm run typecheck` → zero. `npm test` → 119.
- [ ] **Step 4:** Visual: pure move, nothing changes.
- [ ] **Step 5:** Commit: `refactor(kitchen): extract shared constants to kitchen/kitchenConstants`

## Task 1: leaf component `BulbFlicker`

- [ ] Move local `AmpouleFlicker`→`BulbFlicker` into `kitchen/BulbFlicker.tsx`; deps `useRef`, `useFrame`, `THREE`. Import back; update its usage (it's used in the lighting block — that block stays in Kitchen until Task 4, so Kitchen imports `BulbFlicker` and the JSX usage `<AmpouleFlicker/>`→`<BulbFlicker/>`). `npm run typecheck` + `npm test` + commit `refactor(kitchen): extract BulbFlicker (was AmpouleFlicker)`.

## Tasks 2-8: extract the JSX regions

Same method as 3B: create `kitchen/<Region>.tsx` exporting `function <Region>()`; CUT the JSX under the named banner(s) verbatim; paste as `<>…</>`; add imports; translate comments; replace with `<Region/>` at the same position; `npm run typecheck` + visual + commit. One region per commit.

- [ ] **Task 2 — `kitchen/KitchenStructure.tsx`** — banners `Sol tomettes`, `Plafond`, `Mur fond nord`, `Mur ouest`, `Mur est`, `Azulejos crédence`, `Porte bleue du jardin`. Note: `Mur fond nord` has an openable door to the pantry (`<AnimatedDoor>`); `Porte bleue du jardin` uses `<BlueDoor>`. Deps: textures, `toonGradient`, `Outlines`, `AnimatedDoor`, `BlueDoor`, colour consts + `CX/CZ/CW/CD`, THREE. Commit `refactor(kitchen): extract KitchenStructure`.
- [ ] **Task 3 — `kitchen/Stove.tsx`** — banner `Fogón` (the ~80-line white stove block). Deps: THREE, `Outlines`, `toonGradient`, colour consts. Commit `refactor(kitchen): extract Stove (was Fogón)`.
- [ ] **Task 4 — `kitchen/KitchenLighting.tsx`** — banners `Ampoule nue suspendue`, `Lumières d'appoint`. Uses `<BulbFlicker>`. Deps: `BulbFlicker`, THREE. Commit `refactor(kitchen): extract KitchenLighting`.
- [ ] **Task 5 — `kitchen/KitchenShelf.tsx`** — banners `Étagère murale`, `Radio ancienne`. Wall shelf + hanging utensils + off radio. Deps: THREE, `Outlines`, `toonGradient`, colour consts. Commit `refactor(kitchen): extract KitchenShelf`.
- [ ] **Task 6 — `kitchen/KitchenTable.tsx`** — banners `Table cuisine`, `Chaises cuisine`. Deps: `Prop` (chair GLB?), THREE, `Outlines`, `toonGradient`, colour consts. Commit `refactor(kitchen): extract KitchenTable`.
- [ ] **Task 7 — `kitchen/KitchenAppliances.tsx`** — banners `Frigo années 90`, `Évier`. Fridge (magnets + school photos via `PhotoFrame`?) + sink. Deps: `PhotoFrame`, THREE, `Outlines`, `toonGradient`, colour consts. Commit `refactor(kitchen): extract KitchenAppliances`.
- [ ] **Task 8 — `kitchen/KitchenAltar.tsx`** — banners `Ofrenda de cuisine`, `Desserte du coin pierre`. Kitchen ofrenda + cempasúchil petal dresser. Deps: THREE, `Outlines`, `toonGradient`, colour consts. Commit `refactor(kitchen): extract KitchenAltar`.

## Task 9: KitchenDecor + thin assembly + final translation

- [ ] **Step 1:** Extract `kitchen/KitchenDecor.tsx` — banners `Virgen de Guadalupe`, `Panier du chien` (Virgen + butcher calendar wall pieces + empty dog basket). Deps: `PhotoFrame`?, THREE, `Outlines`, `toonGradient`, colour consts.
- [ ] **Step 2:** `Kitchen.tsx` is now a thin ordered assembly of the region tags — Structure → Stove → Shelf → Table → Ofrenda/Altar → Lighting → Appliances → Decor (match the ORIGINAL sibling order exactly; re-read the pre-split order).
- [ ] **Step 3:** Translate any remaining French comments/identifiers in `Kitchen.tsx`.
- [ ] **Step 4:** Residue check:
```bash
grep -rInEi "é|è|à|ê|î|ô|û|ç|\b(mur|porte|fenêtre|pièce|piece|sol|plafond|toit|gauche|droite|hauteur|largeur|profond|derrière|devant|dessus|dessous|coin|évier|étagère|ampoule|frigo|poêle|chaise|torchon|panier)\b" src/scene/rooms/kitchen src/scene/rooms/Kitchen.tsx
```
Expect only exempt data (asset paths, Spanish labels). Translate leftover French comments/identifiers.
- [ ] **Step 5:** `npm run typecheck` → zero. `npm test` → 119. Report final `Kitchen.tsx` line count.
- [ ] **Step 6:** Full visual review: walk into the kitchen (through the salon north arch) — floor/ceiling/walls, azulejos, blue garden door, stove, shelf+utensils+radio, table+chairs, ofrenda+petals, hanging bulb flicker + fill lights, fridge+magnets+photos, sink+dishes, Virgen+calendar, dog basket. Everything byte-identical.
- [ ] **Step 7:** Commit `refactor(kitchen): Kitchen is now a thin assembly (+ body translated)`.

---

## Self-review notes

- **Spec coverage:** Phase 3 "break god-components + translate" — Kitchen covered (LivingRoomShell was 3B). After 3C both god-components are split + translated; the remaining Phase 3 item is the wall/floor duplication check (assess if a `<Wall>` helper is warranted across rooms — YAGNI unless real).
- **No placeholders:** exact files + stable banner anchors + dep lists + verify/commit protocol per task. Moved JSX is existing code (executor cuts/pastes; not reproduced here).
- **Risk control:** one region per commit, `npm run typecheck` + visual per group.
- **Location choice:** `rooms/kitchen/` subdir mirrors the approved `living-room/shell/` decision from 3B (fine-grained, subdir). If you'd rather a different dir name, say so before execution.
