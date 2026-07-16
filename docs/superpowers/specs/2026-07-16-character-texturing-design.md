# Design — Character texturing (bases + differentiation)

Date: 2026-07-16
Status: approved (design), pending implementation plan

## Problem

The 4 family base models render as flat monochrome with weird mouths and no
individuality. Diagnosis (GLB inspection): `base-01..04.glb` carry only
`POSITION, JOINTS_0, WEIGHTS_0` — **no UVs, no normals, no material, no texture**.
They are raw rigged Hunyuan geometry that never went through the UV-unwrap +
texture step. By contrast `grand-oncle.glb` / `heros.glb` / `mama.glb` have
`TEXCOORD_0` + an embedded 2048 baseColorTexture (a projected face) and look
right. The runtime `applyToon` (in `FamilyMemberGLB`/`GrandUncle`) already handles
textured GLBs correctly — so this is an ASSET-PIPELINE gap, not a React bug.

Consequences of "no texture": missing colors (falls back to a flat `meshColor`),
weird mouths (untextured grey geometry), no differentiation. Additionally: 4 women
share `base-03`, 3 men share `base-01`, 2 men share `base-02` → without per-NPC
variation they are clones. Separately, `heros.glb` has a **red spot baked on the
nose** (a projection/paint artifact in its atlas).

## Goal

Give every seated adult a real textured face (grand-oncle quality: readable mouth,
skin, hair, clothing) and make NPCs that share a base look like distinct people.
Fix the hero's nose. Keep the runtime shading (`MeshToonMaterial` + gradientMap)
unchanged.

## Scope

**Phase 1 (this spec):** the 4 EXISTING adult bases (`base-01..04`) — the seated
tablée, the most-visible characters — + per-NPC variants + the hero nose fix.
**Phase 2 (later, separate):** create the child bases (`base-05` boy, `base-06`
girl) so the ~8 placeholder children get real models; add one extra adult-woman
base if base-03's four women still read as clones after recolor.

## Pilot-first (de-risk)

Do **base-01 end-to-end first** (mirrors how grand-oncle was the pilot), validate
in-engine, THEN industrialise base-02/03/04. The unknown is UV-unwrap quality on a
rigged Hunyuan mesh with no normals — prove it on one before batching four.

## Constraints (from the AI-asset pipeline spec, 2026-07-10)

- **Blender only headless/scripted** (Sylvain doesn't use Blender manually).
- Hunyuan server at `localhost:8080` (confirmed UP).
- **Ledger rule:** no asset in `public/` without a line in
  `docs/references/ASSETS-LEDGER.md` (source, tool+model, date, licence, prompt).
- Licence: outputs must stay commercial-OK (Hunyuan open-source is fine).
- References available: `docs/references/characters/bases/base-0X-multi.png`
  (per-base multiview sheets, already visually distinct).

## Architecture — two layers

### Layer A — base texture (per base)

For each base GLB (`public/models/characters/base-0X.glb`):
1. **UV-unwrap + normals** — Blender headless (new `scripts/unwrap_base.py`):
   load the rigged GLB, recompute vertex normals, Smart-UV-Project unwrap the body
   mesh, **preserve the armature + skin weights**, export a rigged+UV'd GLB. (If
   Smart UV Project gives poor seams on the face, the pilot will surface it — a
   fallback is a cylindrical/face-forward unwrap for the head region.)
2. **Texture** — two passes, reusing the existing scripts:
   - Hunyuan **texgen** driven by `base-0X-multi.png` (via `drive_bases_texgen.py`,
     adapted to texture an existing UV'd mesh rather than regenerate geometry) →
     full-body atlas.
   - **`project_face.py`** with the same `base-0X-multi.png` to overwrite the head
     region with a sharp orthographic face projection (fidelity; this is what
     makes the mouth/eyes readable), tuned via `--face-top`/`--face-bottom`.
3. **Optimise + install** — `npm run optimize-model` (gltf-transform: resize
   texture to 1k, prune) → overwrite `public/models/characters/base-0X.glb`.
4. **Ledger** — add/update the line in `ASSETS-LEDGER.md`.

Result: each base GLB gains `TEXCOORD_0`, `NORMAL`, a material, and a
baseColorTexture — `applyToon` then renders it textured (map → `#ffffff`).

### Layer B — per-NPC differentiation

The 4 bases are already distinct persons. For NPCs sharing a base, derive per-NPC
**texture variants** by recolouring hair/clothing/skin regions of the base atlas
(new `scripts/make_variant.py`): a hue/tone shift over region masks (or sampled
regions, like `make_face_variants.py` does for eyelids). Produce e.g. distinct
variants for the four base-03 women (different rebozo/dress/hair colours).

Assignment: extend `familyConfig` so each NPC points at its variant. Options
resolved in the plan: either (a) separate variant GLB files per NPC
(`base-03-a.glb`…) referenced by `modelUrl`, or (b) one base GLB + a per-NPC
texture URL that `FamilyMemberGLB` swaps onto the cloned material. Prefer (b) if
cheap (less GLB duplication) — the runtime already clones per instance
(SkeletonUtils.clone), so swapping the map per clone is natural.

### Hero nose fix

Re-run `project_face.py` on `heros.glb` with a corrected reference OR paint out the
red spot directly in its atlas (a small targeted `scripts/fix_hero_nose.py` that
recolours the nose texels to sampled skin, like the eyelid paint). Produce a fixed
`heros.glb` + ledger line.

## Mouths

The weird mouths are a direct consequence of no face texture. Layer A's
`project_face` pass projects the real face (including the mouth) from the multiview
sheet; tuning `--face-top`/`--face-bottom` frames the head region. If the mouth
still reads poorly after projection, the pilot surfaces it and we adjust the
projection band or the reference sheet — not a separate workstream.

## React-side changes

Minimal. `applyToon` already textures GLBs with a map. The only possible code
change is Layer B option (b): `FamilyMemberGLB` accepts an optional per-NPC texture
URL and swaps it onto the cloned material in `applyToon`. `familyConfig` gains a
per-NPC variant field. No change to `GrandUncle` (single instance, already
textured).

## Testing

- **No unit tests** for the asset pipeline (Blender/Hunyuan/GLB) — validated
  **in-engine** (visual): the pilot base-01 renders with a readable face/mouth,
  correct skin/clothing, no artifacts; then each subsequent base; then per-NPC
  variants look distinct; then the hero nose is clean.
- If Layer B option (b) adds a `variantTexture` field + a code path in
  `FamilyMemberGLB`, add a tiny pure test only if there is falsifiable logic (e.g.
  a variant→URL resolver); otherwise manual.
- Every regenerated GLB gets an `ASSETS-LEDGER.md` line (hard rule).

## Risks

- **UV-unwrap on a rigged, normal-less Hunyuan mesh** may produce ugly seams
  (esp. on the face). The pilot exists to catch this before batching. Fallback:
  face-forward projection unwrap for the head, Smart-UV for the body.
- **Texgen on an existing UV'd mesh** — confirm `drive_bases_texgen.py`/Hunyuan can
  texture a provided mesh (vs regenerate geometry); if not, texture via
  `project_face` alone (body stays a flat tint, face is projected) as a fallback.
- Mixamo rig round-trips strip UVs/textures — so texturing must happen AFTER rig,
  on the final rigged GLB (which is what this design does).
