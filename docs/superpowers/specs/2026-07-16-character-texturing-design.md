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

## Spike 0 — Hunyuan texgen-on-mesh feasibility (DO FIRST, before the pilot)

The chosen approach ("texgen") assumes the local Hunyuan3D-2GP server at
`:8080` can **texture a provided UV'd mesh from an image**, not only generate
geometry from an image. This is UNVERIFIED and it validates-or-kills the approach.
Spike it first: probe the server's endpoints (the gradio API of the running
Space) for a texture/paint stage; try to texture one small UV'd mesh. Outcome:
- **If texgen-on-mesh exists** → proceed with Layer A as written.
- **If it does NOT** → pivot: texture via `project_face` alone (projected head) +
  a flat/sampled body tint, OR use a different texturer. The plan branches here.
Do not batch four bases before this is answered.

### Verdict (2026-07-16)

**PIVOT.**

Probe script: `scripts/spike_texgen_on_mesh.py` (raw HTTP GET `/config`, gradio 4.44.1).

All 14 named endpoints found:

| fn_index | api_name | Input types (summary) |
|----------|----------|-----------------------|
| 0 | /load_example | dataset |
| 1 | /load_example_1 | dataset |
| 2 | /load_example_2 | dataset |
| 3 | /lambda | (none) |
| 4 | /shape_generation | textbox, image×5, slider, number, slider, slider, checkbox, slider, checkbox |
| 5 | /lambda_1 | (none) |
| 6 | /lambda_2 | (none) |
| 7 | /generation_all | textbox, image×5, slider, number, slider, slider, checkbox, slider, checkbox |
| 8 | /lambda_3 | (none) |
| 9 | /lambda_4 | (none) |
| 10 | /on_gen_mode_change | radio |
| 11 | /on_decode_mode_change | radio |
| 12 | /lambda_5 | (none) |
| 13 | /on_export_click | file, file, dropdown(File Type), checkbox(Simplify), checkbox(Include Texture), slider(Target Faces) |

No endpoint accepts a user-provided mesh for texturing. `/on_export_click` (fn_index=13) takes two hidden `file` inputs (comp ids 21, 22) that are server-internal state pipes from a previous generation step — not user-uploaded meshes. The "Include Texture" checkbox is `visible: False`. This endpoint is a format converter (GLB/OBJ/PLY/STL + optional decimation), not a texturing stage.

**Consequence:** Layer A cannot use Hunyuan texgen-on-mesh. Proceed with the PIVOT path: texture bases via `project_face` (orthographic face projection from a frontal crop) + a flat body tint from the reference image. The `project_face.py` script is already proven on `grand-oncle`. Adapt it for each base.

## Pilot-first (de-risk)

After Spike 0, do **base-01 end-to-end** (mirrors how grand-oncle was the pilot),
validate in-engine, THEN industrialise base-02/03/04. The remaining unknown is
UV-unwrap quality on a rigged Hunyuan mesh with no normals — prove it on one
before batching four.

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
   - **`project_face.py`** to overwrite the head region with a sharp orthographic
     face projection (fidelity; this is what makes the mouth/eyes readable). NOTE:
     `project_face` expects a **FRONTAL face reference**, not the multiview sheet.
     So first produce a `base-0X-face.png` — a frontal head crop of the base's
     reference (from `base-0X-multi.png`'s front view) — and pass THAT to
     `project_face`, tuned via `--face-top`/`--face-bottom`.
3. **Optimise + install** — `npm run optimize-model` (gltf-transform: resize
   texture to 1k, prune) → overwrite `public/models/characters/base-0X.glb`.
4. **Ledger** — add/update the line in `ASSETS-LEDGER.md`.

Result: each base GLB gains `TEXCOORD_0`, `NORMAL`, a material, and a
baseColorTexture — `applyToon` then renders it textured (map → `#ffffff`).

### Layer B — per-NPC differentiation

The 4 bases are already distinct persons. For NPCs sharing a base, derive per-NPC
**texture variants** by recolouring the base atlas. **The hard part is knowing
which texels are hair vs clothing vs skin** — no masks exist, and a global
hue-shift would wreck the skin. Resolve this explicitly (decide in the plan, in
this preference order):
1. **Bake region masks during Layer A** — when we UV-unwrap + texture, we know the
   UV zones (head/body/hair by mesh region or by the reference sheet's regions).
   Emit a per-base **region mask PNG** (e.g. R=skin, G=hair, B=clothing) alongside
   the atlas. `make_variant.py` then recolours only the masked clothing/hair
   channels per NPC. Cleanest; do this while the texturing context is open.
2. **Colour-threshold heuristic** — segment the atlas by colour (dark = hair,
   saturated = clothing, skin-tone = skin). Fragile on ambiguous colours; a
   fallback only.
3. **Weaker differentiation** — if masks prove too costly at the pilot, ship a
   simpler variation: per-NPC hair-only recolour (hair is a distinct dark region,
   easy to mask by luminance) + the existing per-NPC clothing already modelled in
   the geometry, and accept faces stay identical per base. YAGNI floor.

Produce distinct variants for the four base-03 women (different rebozo/dress/hair
colours). Decide masks-vs-fallback at the pilot, not upfront.

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

## Testing / validation

- **No unit tests** for the asset pipeline (Blender/Hunyuan/GLB).
- **PRIMARY validation is OFFLINE via `scripts/preview_glb.py`**, NOT the game.
  The game currently does not fully load (the compile-30% loader bug on `main`),
  and during warmup the scene is hidden — so in-engine visual checks of a
  re-textured base are blocked right now. Validate each textured GLB with
  `preview_glb.py` (readable face/mouth, correct skin/clothing, no seams/artifacts,
  face aligned — checks the project_face calibration). This also makes the pilot
  loop fast (no game reload).
- **Sequencing dependency:** full in-engine validation (and seeing the family at
  the table) needs the loader fixed. Either finish the loader first (also needed
  for the Netlify deploy), or rely on `preview_glb.py` until it is. The texturing
  work itself does not depend on the loader — only its in-engine confirmation does.
- After the loader is fixed: confirm in-engine — pilot base-01 face, then each
  base, then per-NPC variants look distinct, then the hero nose is clean.
- If Layer B option (b) adds a `variantTexture` field + a code path in
  `FamilyMemberGLB`, add a tiny pure test only if there is falsifiable logic (e.g.
  a variant→URL resolver); otherwise manual.
- Every regenerated GLB gets an `ASSETS-LEDGER.md` line (hard rule).

## Risks

- **Hunyuan texgen-on-mesh may not exist** — the single biggest risk; resolved by
  **Spike 0** before any base is processed (pivot to project_face-only if absent).
- **UV-unwrap on a rigged, normal-less Hunyuan mesh** may produce ugly seams
  (esp. on the face). The pilot catches this before batching. Fallback:
  face-forward projection unwrap for the head, Smart-UV for the body.
- **Region identification for recolor** (Layer B) is the hardest differentiation
  step — resolved by baking region masks during Layer A (preferred) or the fallback
  ladder above; decided at the pilot.
- **project_face needs a frontal crop**, not the multiview sheet — produce
  `base-0X-face.png` per base (Layer A step 2).
- Mixamo rig round-trips strip UVs/textures — so texturing must happen AFTER rig,
  on the final rigged GLB (which is what this design does).
