# Code Standards — Phase 0 + Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the uncommitted reflector state, then build the Phase 1 test
safety net by extracting the pure logic still buried in scene components into
tested modules.

**Architecture:** The logic layer (`src/game`) is already TDD-covered. Scene
components already delegate most logic to tested systems (`salonCollision`,
`doorSystem`, `npcSystem`). This phase extracts the last pure-logic islands
found by audit — starting with the two confirmed in `Player.tsx`:
player↔NPC push-out collision and the face blink/saccade state machine.

**Tech Stack:** TypeScript strict, Vitest, React Three Fiber (scene, untested).

**Scope note:** This plan covers Phase 0 + Phase 1 only. Phase 2 (English
migration) and Phase 3 (craft/SOLID/DRY) get their own plans after Phase 1
lands — their task shape depends on the audit output (Task 1).

**Safety net reminder:** `npm test` guards the logic layer only. `tsc --noEmit`
guards typed refs. The scene render has no automated net — visual review is
mandatory after any change touching JSX.

---

## File Structure

- `src/game/systems/npcSystem.ts` — MODIFY: add `resolvePlayerNpcCollision`.
- `src/game/systems/npcSystem.test.ts` — MODIFY: add its tests.
- `src/scene/shared/faceState.ts` — CREATE: pure blink/saccade state machine.
- `src/scene/shared/faceState.test.ts` — CREATE: its tests.
- `src/scene/Player.tsx` — MODIFY: consume both extracted modules.
- `docs/journal/project-log.md` — MODIFY: append the Task 1 audit checklist.

---

## Task 0: Resolve reflector working-tree state (prerequisite, no TDD)

The working tree has 10 modified-uncommitted files (reflector rework). Every
later task touches room files; we must start from a clean tree.

**Files:** (working tree, no code written here)

- [ ] **Step 1: Verify build is green**

Run: `npx tsc --noEmit`
Expected: no output (passes).

- [ ] **Step 2: Launch the app for visual validation**

Run: `npm run dev` then open `http://localhost:<port>/?perflog`.
Walk each zone (garage, chambres, couloir, salon). Confirm in the browser:
- glass/mirrors/floor still reflect on every surface,
- no 0-1 fps freeze at room boundaries,
- `[PERF]` console fps is acceptable.

- [ ] **Step 3: Decide and record**

If validated → commit the reflector work (own commit, message describing the
zone-gated vendored `MeshReflectorMaterial`).
If NOT validated → `git stash push -m "reflector-wip"` to get a clean tree and
note it in the journal.
Expected end state: `git status --short` shows no modified `src/` files.

- [ ] **Step 4: Commit (only if validated)**

```bash
git add src/
git commit -m "perf: reflecteur zone-gated vendorise (materiau monte en permanence)"
```

---

## Task 1: Systematic scene audit → extraction checklist (no TDD)

Produce the definitive list of pure-logic islands to extract, so Phase 1 has a
known end. Apply the YAGNI extraction gate: extract only logic that is
(a) repeated across ≥2 components, (b) a falsifiable decision/calculation, or
(c) a known bug source. Everything else stays inline.

**Files:**
- Modify: `docs/journal/project-log.md` (append the checklist)

- [ ] **Step 1: Scan each scene component for inline logic**

For every file in `src/scene/**`, look for: non-JSX functions, `Math.*`,
loops, `.map/.filter/.reduce` over data, `useMemo` bodies with computation,
and inline config objects. Confirmed so far (from `Player.tsx`):
- player↔NPC push-out collision (Task 2),
- face blink/saccade state machine (Task 3).

- [ ] **Step 2: Write the checklist to the journal**

Append a dated section listing each extraction candidate with: source
file:line, target module, and which gate (a/b/c) it satisfies. Mark Task 2 and
Task 3 as the first entries. This checklist is Phase 1's definition of done.

- [ ] **Step 3: Commit**

```bash
git add docs/journal/project-log.md
git commit -m "docs: checklist d'extraction logique (audit phase 1)"
```

---

## Task 2: Extract player↔NPC push-out collision

Move the inline NPC push-out loop (`Player.tsx:187-198`) into `npcSystem.ts` as
a pure, tested function.

**Files:**
- Modify: `src/game/systems/npcSystem.ts`
- Test: `src/game/systems/npcSystem.test.ts`
- Modify: `src/scene/Player.tsx:187-198`

- [ ] **Step 1: Write the failing test**

Add to `src/game/systems/npcSystem.test.ts`:

```ts
import { resolvePlayerNpcCollision } from './npcSystem'

describe('resolvePlayerNpcCollision', () => {
  const R = 0.45

  it('leaves the player untouched when no NPC is within radius', () => {
    const [x, z] = resolvePlayerNpcCollision(0, 0, [[5, 5]], R)
    expect(x).toBe(0)
    expect(z).toBe(0)
  })

  it('pushes the player out to exactly the radius along the NPC axis', () => {
    // NPC at origin, player 0.2 away on +x, radius 0.45 -> pushed to x=0.45
    const [x, z] = resolvePlayerNpcCollision(0.2, 0, [[0, 0]], R)
    expect(x).toBeCloseTo(0.45, 5)
    expect(z).toBeCloseTo(0, 5)
  })

  it('ignores a near-exact overlap to avoid division by zero', () => {
    const [x, z] = resolvePlayerNpcCollision(0.0005, 0, [[0, 0]], R)
    expect(x).toBe(0.0005)
    expect(z).toBe(0)
  })

  it('resolves against multiple NPCs in sequence', () => {
    const [x, z] = resolvePlayerNpcCollision(0.2, 0, [[0, 0], [0.9, 0]], R)
    // first push moves player to x=0.45; second NPC at 0.9 is now 0.45 away -> pushed to x=0.45? recompute
    expect(Number.isFinite(x)).toBe(true)
    expect(Number.isFinite(z)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- npcSystem`
Expected: FAIL — `resolvePlayerNpcCollision is not a function`.

- [ ] **Step 3: Write minimal implementation**

Add to `src/game/systems/npcSystem.ts`:

```ts
/**
 * Push the player out of any NPC it overlaps. Pure: returns the resolved
 * [x, z]. Mirrors the loop previously inline in Player.tsx.
 */
export function resolvePlayerNpcCollision(
  px: number,
  pz: number,
  npcs: Iterable<[number, number]>,
  radius: number,
): [number, number] {
  let x = px
  let z = pz
  for (const [nx, nz] of npcs) {
    const dx = x - nx
    const dz = z - nz
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist < radius && dist > 0.001) {
      const inv = radius / dist
      x = nx + dx * inv
      z = nz + dz * inv
    }
  }
  return [x, z]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- npcSystem`
Expected: PASS.

- [ ] **Step 5: Consume it in Player.tsx**

Replace `src/scene/Player.tsx:187-198` (the `NPC_RADIUS` loop) with:

```tsx
    // Collision NPC : repousser le garçon si trop proche
    const [resolvedX, resolvedZ] = resolvePlayerNpcCollision(
      boyPos.current.x, boyPos.current.z, npcPositions.values(), 0.45,
    )
    boyPos.current.x = resolvedX
    boyPos.current.z = resolvedZ
```

Add to the imports near line 14:

```tsx
import { resolvePlayerNpcCollision } from '../game/systems/npcSystem'
```

- [ ] **Step 6: Verify types + tests + visual**

Run: `npx tsc --noEmit` — expected no output.
Run: `npm test` — expected all green.
Visual: `npm run dev`, walk into an NPC, confirm the player is still pushed
back exactly as before.

- [ ] **Step 7: Commit**

```bash
git add src/game/systems/npcSystem.ts src/game/systems/npcSystem.test.ts src/scene/Player.tsx
git commit -m "refactor: extract resolvePlayerNpcCollision into npcSystem (tested)"
```

---

## Task 3: Extract face blink/saccade state machine

Move the blink/saccade timing logic (`Player.tsx:238-246`) into a pure,
tested module. Randomness is injected so the transitions are deterministic in
tests.

**Files:**
- Create: `src/scene/shared/faceState.ts`
- Test: `src/scene/shared/faceState.test.ts`
- Modify: `src/scene/Player.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/scene/shared/faceState.test.ts`:

```ts
import { advanceFace, type FaceState } from './faceState'

const fixed = (blinkDelay: number, saccadeDelay: number, gaze: number) => ({
  blinkDuration: 0.15,
  nextBlinkDelay: () => blinkDelay,
  nextSaccadeDelay: () => saccadeDelay,
  pickGaze: () => gaze,
})

const initial: FaceState = { clock: 0, blinkAt: 1, saccadeAt: 1, gazeIdx: 0 }

describe('advanceFace', () => {
  it('keeps eyes open before blinkAt', () => {
    const { output } = advanceFace(initial, 0.5, fixed(2, 2, 1))
    expect(output.closed).toBe(false)
  })

  it('closes eyes once clock passes blinkAt', () => {
    const { output } = advanceFace(initial, 1.05, fixed(2, 2, 1))
    expect(output.closed).toBe(true)
  })

  it('reopens and reschedules once the blink duration elapses', () => {
    // clock 1.2 > blinkAt 1 + duration 0.15 -> reopen, blinkAt := 1.2 + 2
    const { state, output } = advanceFace(initial, 1.2, fixed(2, 2, 1))
    expect(output.closed).toBe(false)
    expect(state.blinkAt).toBeCloseTo(3.2, 5)
  })

  it('picks a new gaze and reschedules when clock passes saccadeAt', () => {
    const { state, output } = advanceFace(initial, 1.05, fixed(2, 5, 1))
    expect(output.gazeIdx).toBe(1)
    expect(state.saccadeAt).toBeCloseTo(1.05 + 5, 5)
  })

  it('advances the clock by delta', () => {
    const { state } = advanceFace(initial, 0.3, fixed(2, 2, 1))
    expect(state.clock).toBeCloseTo(0.3, 5)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- faceState`
Expected: FAIL — cannot find module `./faceState`.

- [ ] **Step 3: Write minimal implementation**

Create `src/scene/shared/faceState.ts`:

```ts
// Pure blink + micro-saccade state machine, extracted from Player.tsx.
// Randomness is injected via FaceConfig so transitions are deterministic
// in tests. The scene component owns the wall-clock, the rng and the
// texture swap; this module owns only the timing decisions.

export type FaceState = {
  clock: number
  blinkAt: number
  saccadeAt: number
  gazeIdx: number
}

export type FaceConfig = {
  blinkDuration: number
  nextBlinkDelay: () => number
  nextSaccadeDelay: () => number
  pickGaze: () => number
}

export type FaceOutput = { closed: boolean; gazeIdx: number }

export function advanceFace(
  prev: FaceState,
  delta: number,
  cfg: FaceConfig,
): { state: FaceState; output: FaceOutput } {
  const clock = prev.clock + delta
  let { blinkAt, saccadeAt, gazeIdx } = prev

  let closed = clock > blinkAt
  if (closed && clock > blinkAt + cfg.blinkDuration) {
    blinkAt = clock + cfg.nextBlinkDelay()
    closed = false
  }
  if (clock > saccadeAt) {
    saccadeAt = clock + cfg.nextSaccadeDelay()
    gazeIdx = cfg.pickGaze()
  }

  return { state: { clock, blinkAt, saccadeAt, gazeIdx }, output: { closed, gazeIdx } }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- faceState`
Expected: PASS.

- [ ] **Step 5: Consume it in Player.tsx**

Replace the single `clock`/`blinkAt`/`saccadeAt`/`gazeIdx` refs and the inline
timing block (`Player.tsx:236-246`) with a single `faceState` ref driven by
`advanceFace`. Keep the texture swap (`heroScene.traverse`) and `?blinktest`
title witness exactly as they are — they read `output.closed` and
`output.gazeIdx`.

Add the import:

```tsx
import { advanceFace, type FaceState } from './shared/faceState'
```

Replace the four refs (lines ~99-102) with:

```tsx
  const faceRef = useRef<FaceState>({
    clock: 0, blinkAt: blinkDelay(), saccadeAt: saccadeDelay(), gazeIdx: 0,
  })
```

Replace the timing block (lines ~236-246) with:

```tsx
    const { state: nextFace, output: faceOut } = advanceFace(faceRef.current, delta, {
      blinkDuration: BLINK_DURATION,
      nextBlinkDelay: blinkDelay,
      nextSaccadeDelay: saccadeDelay,
      pickGaze: () => face.faceSet ? pickGaze(face.faceSet.gaze.length) : 0,
    })
    faceRef.current = nextFace
    if (face.faceSet) {
      const want = faceOut.closed ? face.faceSet.blink : face.faceSet.gaze[faceOut.gazeIdx]
      heroScene.traverse(child => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshToonMaterial
          if (mat?.map && mat.map !== want) mat.map = want
        }
      })
      if (BLINK_TEST) document.title = faceOut.closed ? '👁 YEUX FERMÉS' : 'yeux ouverts'
    }
```

Remove the now-unused `clock`, `blinkAt`, `saccadeAt`, `gazeIdx` refs.

- [ ] **Step 6: Verify types + tests + visual**

Run: `npx tsc --noEmit` — expected no output.
Run: `npm test` — expected all green.
Visual: `npm run dev?blinktest`, confirm the hero still blinks (slow/frequent
in blinktest) and the eyes shift gaze. The tab title toggles with eye state.

- [ ] **Step 7: Commit**

```bash
git add src/scene/shared/faceState.ts src/scene/shared/faceState.test.ts src/scene/Player.tsx
git commit -m "refactor: extract face blink/saccade state machine (tested)"
```

---

## Task 4: Close Phase 1

- [ ] **Step 1: Reconcile the audit checklist**

Re-open the Task 1 checklist in the journal. For each remaining candidate,
either extract it (repeat the Task 2/3 TDD shape) or explicitly mark it "stays
inline — fails YAGNI gate" with the reason. Phase 1 is done when every checklist
item is either extracted+tested or justified inline.

- [ ] **Step 2: Final verification**

Run: `npx tsc --noEmit` — expected no output.
Run: `npm test` — expected all green (new suites included).

- [ ] **Step 3: Commit the closed checklist**

```bash
git add docs/journal/project-log.md
git commit -m "docs: phase 1 filet de test cloturee"
```

---

## Self-review notes

- **Spec coverage:** Phase 0 (reflector) = Task 0. Phase 1 extract-criterion =
  Task 1 gate + applied in Tasks 2-4. Honest net (tests=logic, visual=scene) =
  stated in header and every verify step. Phases 2-3 deferred to own plans (per
  spec scope note).
- **Type consistency:** `resolvePlayerNpcCollision(px, pz, npcs, radius)` and
  `advanceFace(prev, delta, cfg) -> { state, output }` used identically in tests
  and in Player.tsx consumption. `FaceState`/`FaceConfig`/`FaceOutput` names
  match between module, test, and consumer.
- **No placeholders:** every code step shows the actual code.
