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

## Phases (one at a time, validated before moving on)

### Phase 1 — Test safety net (extract + lean on tsc)

Audit each scene component; extract **pure logic** buried in JSX into tested
modules:
- mappings/configs (room dimensions, positions, zone gating)
- repeated geometric calculations
- any non-JSX function

Baseline (free, always on): `tsc --noEmit` strict + `npm test` green before and
after every change. Strict TDD on every extracted module (red → green).
Remaining pure JSX stays untested → manual validation.

### Phase 2 — English migration

Mechanical, behavior-preserving rename, file by file:
- identifiers, component/file names, `ZoneId` values, comments
- net: `tsc` breaks on any inconsistent zone id / import; `npm test` stays green
- zone ids are the riskiest (string keys) → migrated in one atomic block with
  `roomZones`

### Phase 3 — Craft / SOLID / DRY

- Factor the repeated `ZoneReflectorMaterial` block (9 rooms) into a shared
  component/preset.
- Extract shared wall/floor/ceiling patterns.
- Break god-components: `SalonRoom` and `Cuisine` into single-responsibility
  sub-components.
- Each extraction validated by tsc + tests + visual review.

## Constraints / principles

- Never refactor all rooms at once (lesson: multi-room rollback 2026-07-13).
  One unit at a time, visual validation at each scene step.
- YAGNI ruthlessly: no headless-render harness, no speculative abstraction.
- Atomic commits per phase; each commit leaves tsc + tests green.

## Out of scope

- Reflector perf work (separate uncommitted branch state; validate in browser
  independently).
- Narrative/scenario content (context-first phase still ongoing).
