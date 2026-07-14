# Design — Code standards uplift

Date: 2026-07-14
Status: approved (design), pending implementation plan

## Goal

Establish and enforce engineering standards on an already-working codebase,
without breaking the working prototype. Standards: **English everywhere,
SOLID, YAGNI, DRY, TDD on the logic layer, atomic commits per phase.**

## Context (audit findings, 2026-07-14)

- **Logic layer (`src/game`)** is healthy: every system/store has a paired
  Vitest suite (roomZones, npcSystem, doorSystem, stillness, song, gameStore,
  playerStore, doorStore). TDD already in place here — little to do.
- **Scene layer (`src/scene`)** holds the debt:
  - God-components: `SalonRoom.tsx` (1465 lines), `Cuisine.tsx` (665 lines) —
    lights + geometry + materials + reflectors + collision + family in one file.
  - DRY violations: 9 rooms repeat a near-identical `ZoneReflectorMaterial`
    block; wall/floor/ceiling patterns duplicated.
  - French tokens in 61 of 77 source files (identifiers + comments + zone ids
    such as `zone="couloir"`).
  - No scene tests by design (CLAUDE.md → manual validation). The safety net
    exists **only** on the logic layer.

## Tooling reality

- R3F is v9; `@react-three/test-renderer` is absent and fragile to add
  (jsdom has no WebGL; drei materials may crash on mount). Headless smoke tests
  are **deferred** (YAGNI) unless phase 1 extraction leaves real mount risk.
- Existing net: `tsc --noEmit` strict + `npm test` (11 suites) + jsdom/vitest/
  testing-library already configured.

## Safety net — what actually catches what

Be honest about the net; do not claim false security:
- **`npm test` (11 suites) = logic-layer net only.** Green tests prove nothing
  about the scene render. A scene refactor can break visuals with all tests green.
- **`tsc --noEmit` strict = typed-ref net.** Catches broken imports, exports,
  typed identifiers, `ZoneId` union mismatches.
- **Manual visual review = the ONLY net for the scene.** Mandatory after any
  change touching JSX/render.
- **No net at all for stringly-typed refs** (see Phase 2 red zone). These need
  exhaustive grep + care, and ideally typing to promote them into the tsc net.

## Phases (one at a time, validated before moving on)

### Phase 0 — Resolve reflector working-tree state (prerequisite)

10 files are modified-uncommitted (reflector rework). Every later phase touches
those same room files, so we cannot start clean until it is resolved: either
validate the reflector in the browser and commit it, or stash it. Not optional,
not out of scope.

### Phase 1 — Test safety net (extract + lean on tsc)

Audit each scene component; extract pure logic buried in JSX into tested modules.
**Extraction criterion (YAGNI gate) — extract only if the logic is:**
- (a) **repeated** across ≥2 components, or
- (b) a **falsifiable decision/calculation** (has a right/wrong answer worth a
  test — gating, mapping, geometry math), or
- (c) a **known bug source**.

Everything else stays inline in the JSX. Do not create a module for 2 trivial
lines. Strict TDD on every extracted module (red → green).

### Phase 2 — English migration (god-components excluded)

Mechanical, behavior-preserving rename. Identifiers are **refs**, not cosmetics —
renaming can break consumers. Classify every token:
- **Comments** → zero risk, translate freely.
- **Typed identifiers / imports / exports / file names** → tsc-caught, safe.
- **RED ZONE — stringly-typed refs with NO net**: `getObjectByName('...')` names
  (e.g. `'satellite-rooms'`), `userData` keys (`reflectorZone`, `reflectorScope`),
  Howler layer ids, texture/asset paths, `ZoneId` string literals in untyped
  positions (`userData={{ reflectorZone: 'salon' }}`). Approach: exhaustive grep
  of every literal before renaming, migrate in one atomic block, and where cheap,
  **type these accesses** so tsc guards them afterward. Manual visual review after.
- **God-components (`SalonRoom`, `Cuisine`) are excluded** from this phase — they
  are split *and* translated together in Phase 3 to avoid paying twice.

### Phase 3 — Craft / SOLID / DRY

- Factor the repeated `ZoneReflectorMaterial` block (9 rooms) into a shared
  component/preset. (Confirmed duplication.)
- **Verify before promising**: check whether wall/floor/ceiling patterns are
  genuinely duplicated before extracting them — do not abstract a surface-level
  similarity (YAGNI). Drop this item if the duplication is not real.
- Break god-components `SalonRoom` (1465 L) and `Cuisine` (665 L) into
  single-responsibility sub-components, translating to English in the same pass.
- Each extraction validated by tsc + tests + **visual review**.

## Constraints / principles

- Never refactor all rooms at once (lesson: multi-room rollback 2026-07-13).
  One unit at a time, visual validation at each scene step.
- YAGNI ruthlessly: no headless-render harness, no speculative abstraction.
- Atomic commits per phase; each commit leaves tsc + tests green.

## Out of scope

- Narrative/scenario content (context-first phase still ongoing).
