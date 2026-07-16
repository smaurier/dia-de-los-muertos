# Character Texturing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the 4 adult base GLBs real textured faces/bodies (grand-oncle quality), per-NPC color variants so shared bases read as distinct people, and fix the hero's nose artifact.

**Architecture:** Asset-pipeline work (Blender headless + Hunyuan3D-2GP at `localhost:8080` + Python/trimesh), validated offline via `scripts/preview_glb.py`, installed into `public/models/characters/` with a `?v=4` cache bust. Runtime change is minimal: `FamilyMemberGLB` gains an optional per-NPC texture override (Layer B option b from the spec).

**Tech Stack:** Blender ≥4 headless, Python (trimesh, numpy, PIL, requests), Hunyuan3D-2GP gradio server, gltf-transform CLI, React Three Fiber / drei.

**Spec:** `docs/superpowers/specs/2026-07-16-character-texturing-design.md`

---

## Ground truth (verified 2026-07-16, do not re-derive)

- `public/models/characters/base-01..04.glb`: rigged (Mixamo, `Sitting Idle(4)` clip), **no UVs, no normals, no material**. Built with `scripts/fbx_merge_to_glb.py` (no texture arg), then decimated.
- **`base-02.glb` is a byte-identical copy of `base-01.glb`** (MD5 `0BBC2A74F60A24B4DA298054EAC78277`). The real base-02 (Beto, bald man) never had a rigged model. Its Mixamo FBX sources are NOT in the repo.
- `grand-oncle.glb` / `heros.glb` / `mama.glb`: textured (UVs + embedded baseColor), built via `scripts/merge_mixamo.py` (re-applies `texture.png` after Mixamo).
- Frontal full-body references exist: `docs/references/characters/bases/views/base-0X-front.png` (used by `gen_base.py`). `project_face.py` maps the FULL-BODY silhouette bbox to the mesh bbox — it wants these front views, NOT a head crop. (The spec's "frontal head crop" step is unnecessary; use the existing front views.)
- `scripts/project_face.py` requires the GLB to already have UVs + a baseColorTexture (it edits the atlas). So unwrap + initial texture MUST happen before projection.
- No `npm run optimize-model` script exists (spec was wrong). Use `npx gltf-transform` commands directly.
- Hunyuan server: gradio at `http://localhost:8080`, known endpoint `/generation_all` (geometry+texture from images). Whether it can texture a PROVIDED mesh is unknown → Spike 0.
- Loader bug is fixed (commit `7da145d`): in-engine validation works again. Offline preview remains the fast iteration loop.
- NPC → base mapping (familyConfig): base-01 = papa, oncle1, oncle-jeune (3 men) · base-02 = oncle2, oncle3 (2 men) · base-03 = maman, tante1, tante2, tante-jeune (4 women) · base-04 = grande-tante (1).
- Conventions: logic layer TDD/Vitest; scene layer + asset pipeline = manual/offline validation, NO unit tests. No `any`. Typecheck = `npm run typecheck` (never `tsc --noEmit`).
- Hard rule: every regenerated asset in `public/` gets a line in `docs/references/ASSETS-LEDGER.md`.

## File map

| File | Role |
|---|---|
| `scripts/spike_texgen_on_mesh.py` (create) | Spike 0: probe server for texture-on-mesh capability |
| `scripts/unwrap_base.py` (create) | Blender headless: normals + Smart-UV unwrap, keep rig |
| `scripts/bake_flat_texture.py` (create) | Pivot path: bake a flat sampled-color atlas from the front view (used if texgen-on-mesh absent) |
| `scripts/make_region_mask.py` (create) | Emit R=skin / G=hair / B=clothing mask PNG per base |
| `scripts/make_variant.py` (create) | Recolor hair/clothing via mask → variant texture PNG |
| `scripts/fix_hero_nose.py` (create) | Paint out the red nose texels in heros.glb atlas |
| `src/game/systems/npcSystem.ts` (modify) | `NPCConfig` + `variantTexture?: string` |
| `src/scene/living-room/FamilyMemberGLB.tsx` (modify) | Apply per-NPC texture override |
| `src/scene/living-room/familyConfig.ts` (modify) | Assign variants |
| `src/scene/assets/manifest.ts` (modify) | Variant texture URLs + `?v=4` bump on changed GLBs |
| `docs/references/ASSETS-LEDGER.md` (modify) | One line per regenerated asset |

Work products (not committed to `public/` until validated): `docs/references/characters/bases/work/`.

---

### Task 0: Spike 0 — Hunyuan texgen-on-mesh feasibility (GATE)

**Files:**
- Create: `scripts/spike_texgen_on_mesh.py`

This decides the Layer A texture source. Do NOT start any base texturing before this is answered.

- [ ] **Step 1: Verify the server is up**

Run: `curl.exe -s -o NUL -w "%{http_code}" http://localhost:8080/`
Expected: `200`. If not, relaunch per memory `pipeline-hunyuan-local-2026-07-10.md` and wait for it.

- [ ] **Step 2: Write the probe script**

```python
# scripts/spike_texgen_on_mesh.py
# Spike 0: does the local Hunyuan3D-2GP gradio server expose a stage that
# textures a PROVIDED mesh (as opposed to generating geometry from images)?
# Prints every named endpoint + its component inputs so we can decide.
# Usage: python scripts/spike_texgen_on_mesh.py
import json
import requests

SERVER = "http://localhost:8080"

def main():
    cfg = requests.get(f"{SERVER}/config", timeout=30).json()
    comps = {c["id"]: c for c in cfg.get("components", [])}
    print(f"gradio version: {cfg.get('version')}")
    print(f"{len(cfg.get('dependencies', []))} dependencies\n")
    for i, dep in enumerate(cfg.get("dependencies", [])):
        api_name = dep.get("api_name")
        if api_name in (None, False):
            continue
        inputs = []
        for cid in dep.get("inputs", []):
            c = comps.get(cid, {})
            label = (c.get("props") or {}).get("label") or c.get("type")
            inputs.append(f"{c.get('type')}({label})")
        print(f"fn_index={i}  api_name=/{api_name}")
        print(f"  inputs: {inputs}\n")

    # Heuristic: any endpoint taking a Model3D/File input = candidate for
    # texture-on-mesh. /generation_all only takes images.
    print("Look for an endpoint with a Model3D or File INPUT (mesh upload).")
    print("If none exists, the server cannot texture a provided mesh -> PIVOT.")

if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Run the probe**

Run: `python scripts/spike_texgen_on_mesh.py`
Expected: a list of endpoints. Inspect: is there an endpoint whose INPUTS include a mesh (Model3D/File), e.g. a "texture generation" tab?

- [ ] **Step 4: If a mesh-input endpoint exists, prove it end-to-end**

Call it (via `gradio_client.Client(SERVER).predict(...)` mirroring the input list from Step 3) with a small UV'd mesh — use `docs/references/characters/grand-oncle/work/grand-oncle-simplified-01.glb` + `docs/references/characters/bases/views/base-01-front.png` as image. Save output to `docs/references/characters/bases/work/spike-texgen.glb` and render it: `blender --background --python scripts/preview_glb.py -- docs/references/characters/bases/work/spike-texgen.glb docs/references/characters/bases/work/spike-texgen`. A textured render (not grey/black) = **GO**.

- [ ] **Step 5: Record the verdict**

Append the verdict (GO / PIVOT + endpoint name + exact predict signature if GO) to the "Spike 0" section of the spec `docs/superpowers/specs/2026-07-16-character-texturing-design.md`.

- [ ] **Step 6: Commit**

```bash
git add scripts/spike_texgen_on_mesh.py docs/superpowers/specs/2026-07-16-character-texturing-design.md
git commit -m "spike: probe Hunyuan texgen-on-mesh capability (Layer A gate)"
```

**Branch:** GO → Task 2 uses the Hunyuan endpoint. PIVOT → Task 2 uses `bake_flat_texture.py` (Task 1b) + project_face carries the face. **Both branches produce the same artifact contract:** a UV'd GLB with an embedded baseColorTexture, ready for `project_face.py`.

---

### Task 1: `unwrap_base.py` — normals + UV unwrap, rig preserved

**Files:**
- Create: `scripts/unwrap_base.py`

- [ ] **Step 1: Write the script**

```python
# scripts/unwrap_base.py — add NORMAL + TEXCOORD_0 to a rigged base GLB.
# Loads the rigged GLB, recomputes normals, Smart-UV-Projects the densest
# mesh, keeps armature + skin weights + animations, exports GLB.
# Usage: blender --background --python scripts/unwrap_base.py -- in.glb out.glb
import sys
import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
in_glb, out_glb = argv[0], argv[1]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=in_glb)

meshes = [o for o in bpy.data.objects if o.type == "MESH"]
mesh = max(meshes, key=lambda o: len(o.data.vertices))
print(f"[unwrap] mesh {mesh.name}: {len(mesh.data.vertices)} verts")

bpy.ops.object.select_all(action="DESELECT")
mesh.select_set(True)
bpy.context.view_layer.objects.active = mesh

# Normals: shade smooth is enough — glTF exporter writes vertex normals.
bpy.ops.object.shade_smooth()

# UV unwrap (Smart UV Project — no seams to place manually)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.003)
bpy.ops.object.mode_set(mode="OBJECT")
print(f"[unwrap] UV layers: {[l.name for l in mesh.data.uv_layers]}")

# Material with a placeholder image so the exporter emits a texturable slot.
img = bpy.data.images.new("atlas", 2048, 2048)
img.generated_color = (0.8, 0.7, 0.6, 1.0)
mat = bpy.data.materials.new("base-mat")
mat.use_nodes = True
bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
tex = mat.node_tree.nodes.new("ShaderNodeTexImage")
tex.image = img
img.pack()
mat.node_tree.links.new(bsdf.inputs["Base Color"], tex.outputs["Color"])
bsdf.inputs["Metallic"].default_value = 0.0
bsdf.inputs["Roughness"].default_value = 0.9
mesh.data.materials.clear()
mesh.data.materials.append(mat)

bpy.ops.export_scene.gltf(
    filepath=out_glb,
    export_format="GLB",
    export_animations=True,
    export_skins=True,
    export_yup=True,
)
print(f"[unwrap] exported {out_glb}")
```

- [ ] **Step 2: Run on base-01**

```bash
mkdir docs/references/characters/bases/work 2>NUL
blender --background --python scripts/unwrap_base.py -- public/models/characters/base-01.glb docs/references/characters/bases/work/base-01-unwrapped.glb
```
Expected: `[unwrap] UV layers: ['UVMap']`, exported file.

- [ ] **Step 3: Verify attributes + rig survived**

Run: `npx @gltf-transform/cli inspect docs/references/characters/bases/work/base-01-unwrapped.glb`
Expected: primitives list `POSITION, NORMAL, TEXCOORD_0, JOINTS_0, WEIGHTS_0`; skins: 1; animations present (`Sitting Idle(4)` among clips).

- [ ] **Step 4: Visual check (geometry intact, no exploded mesh)**

Run: `blender --background --python scripts/preview_glb.py -- docs/references/characters/bases/work/base-01-unwrapped.glb docs/references/characters/bases/work/base-01-unwrapped`
Read both PNGs (`-face.png`, `-dos.png`). Expected: same silhouette as before, flat tan color.

- [ ] **Step 5: Commit**

```bash
git add scripts/unwrap_base.py
git commit -m "feat(pipeline): unwrap_base.py — UV + normals on rigged base GLBs"
```

---

### Task 1b: `bake_flat_texture.py` — pivot texture source (write it regardless; it's the fallback AND the body-color pass)

**Files:**
- Create: `scripts/bake_flat_texture.py`

Even on the GO branch this script is cheap insurance. It fills the atlas by projecting the FRONT reference over the whole body (same math as project_face but full-height band and no frontness cutoff for the back — back texels get the mirrored front sample). Result: correct clothing/skin/hair colors everywhere, soft detail. `project_face.py` then overwrites the head with the sharp face.

- [ ] **Step 1: Write the script**

```python
# scripts/bake_flat_texture.py — fill a UV'd GLB's atlas from the frontal
# reference (orthographic projection, full body). Back-facing triangles get
# the mirrored front sample (cheap but colors are right). Sharp face comes
# later from project_face.py.
# Usage: python scripts/bake_flat_texture.py <in.glb> <front_ref.png> <out.glb>
import sys

import numpy as np
import trimesh
from PIL import Image

in_glb, ref_png, out_glb = sys.argv[1:4]

scene = trimesh.load(in_glb, process=False)
mesh = max(
    (g for g in scene.geometry.values() if hasattr(g, "visual")),
    key=lambda g: len(g.vertices),
)
uv = np.asarray(mesh.visual.uv)
verts = np.asarray(mesh.vertices)
faces = np.asarray(mesh.faces)

material = mesh.visual.material
tex_img = material.baseColorTexture.convert("RGB")
W, H = tex_img.size
atlas = np.asarray(tex_img).copy().astype(np.float32)

ref = Image.open(ref_png).convert("RGB")
ra = np.asarray(ref).astype(int)
bg = np.median(ra[2:8, 2:8].reshape(-1, 3), axis=0)
fg = (np.abs(ra - bg).sum(axis=2) > 45)
ys, xs = np.where(fg)
ix0, ix1, iy0, iy1 = xs.min(), xs.max(), ys.min(), ys.max()

mx0, my0, _ = verts.min(axis=0)
mx1, my1, _ = verts.max(axis=0)

def to_image(px, py):
    u = (px - mx0) / (mx1 - mx0)
    v = (py - my0) / (my1 - my0)
    return ix0 + u * (ix1 - ix0), iy1 - v * (iy1 - iy0)

painted = np.zeros((H, W), dtype=bool)
for f in faces:
    tuv = uv[f].copy()
    tuv[:, 1] = 1.0 - tuv[:, 1]
    pix = tuv * [W, H]
    x0, y0 = np.floor(pix.min(axis=0)).astype(int)
    x1, y1 = np.ceil(pix.max(axis=0)).astype(int)
    if x1 <= x0 or y1 <= y0:
        continue
    gx, gy = np.meshgrid(np.arange(x0, x1) + 0.5, np.arange(y0, y1) + 0.5)
    a, b, c = pix
    det = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
    if abs(det) < 1e-9:
        continue
    w0 = ((b[1] - c[1]) * (gx - c[0]) + (c[0] - b[0]) * (gy - c[1])) / det
    w1 = ((c[1] - a[1]) * (gx - c[0]) + (a[0] - c[0]) * (gy - c[1])) / det
    w2 = 1.0 - w0 - w1
    inside = (w0 >= -0.001) & (w1 >= -0.001) & (w2 >= -0.001)
    if not inside.any():
        continue
    p = (w0[..., None] * verts[f[0]] + w1[..., None] * verts[f[1]]
         + w2[..., None] * verts[f[2]])
    sx, sy = to_image(p[..., 0], p[..., 1])
    sx = np.clip(sx, 0, ref.width - 1).astype(int)
    sy = np.clip(sy, 0, ref.height - 1).astype(int)
    colors = np.asarray(ref)[sy, sx].astype(np.float32)
    ys_ = slice(max(0, y0), min(H, y1))
    xs_ = slice(max(0, x0), min(W, x1))
    hh, ww = ys_.stop - ys_.start, xs_.stop - xs_.start
    m = inside[:hh, :ww] & ~painted[ys_, xs_]
    region = atlas[ys_, xs_]
    region[m] = colors[:hh, :ww][m]
    atlas[ys_, xs_] = region
    painted[ys_, xs_] |= m

print(f"[bake] texels painted: {painted.sum()} / {W*H}")
material.baseColorTexture = Image.fromarray(atlas.clip(0, 255).astype(np.uint8))
scene.export(out_glb)
print(f"[bake] exported {out_glb}")
```

- [ ] **Step 2: Run on unwrapped base-01**

```bash
python scripts/bake_flat_texture.py docs/references/characters/bases/work/base-01-unwrapped.glb docs/references/characters/bases/views/base-01-front.png docs/references/characters/bases/work/base-01-flat.glb
```
Expected: `texels painted` > 1M, export OK.

- [ ] **Step 3: Preview render**

Run: `blender --background --python scripts/preview_glb.py -- docs/references/characters/bases/work/base-01-flat.glb docs/references/characters/bases/work/base-01-flat`
Read PNGs. Expected: body has clothing/skin colors from the reference (face may still be mushy — normal at this stage).

- [ ] **Step 4: Commit**

```bash
git add scripts/bake_flat_texture.py
git commit -m "feat(pipeline): bake_flat_texture.py — full-body color pass from front ref"
```

---

### Task 2: Pilot base-01 end-to-end texture (GATE: Sylvain validates renders)

**Files:**
- Work products in `docs/references/characters/bases/work/`

- [ ] **Step 1: Produce the textured GLB**

GO branch: call the Hunyuan texture endpoint (signature recorded in Spike 0) on `base-01-unwrapped.glb` with `views/base-01-front.png` → `work/base-01-texgen.glb`. PIVOT branch: use `work/base-01-flat.glb` from Task 1b as-is.

- [ ] **Step 2: Sharp face projection**

```bash
python scripts/project_face.py docs/references/characters/bases/work/base-01-<texgen|flat>.glb docs/references/characters/bases/views/base-01-front.png docs/references/characters/bases/work/base-01-textured.glb --face-top 1.0 --face-bottom 0.80
```
Expected: `[proj] triangles projetés:` > 100, `texels touchés:` > 10000.

- [ ] **Step 3: Preview render + tune**

Run: `blender --background --python scripts/preview_glb.py -- docs/references/characters/bases/work/base-01-textured.glb docs/references/characters/bases/work/base-01-textured`
Read the renders. Check: readable mouth + eyes, face aligned (not on the neck/hair), skin/clothing colors right, no glaring seams. If the face band is off, retune `--face-top/--face-bottom` (grand-oncle used 1.0/0.80; heads differ) and re-run Step 2. Iterate max 4 times; if still bad, STOP and report (unwrap seams on face = known risk, fallback per spec is a face-forward unwrap of the head region — architecture discussion, not more retries).

- [ ] **Step 4: Show Sylvain (HUMAN GATE)**

Present `base-01-textured-face.png` / `-dos.png` to Sylvain for approval before industrialising. Blocking.

- [ ] **Step 5: Commit work scripts/tweaks**

```bash
git add -A scripts
git commit -m "feat(pipeline): pilot base-01 textured (unwrap + body pass + face projection)"
```

---

### Task 3: Region mask + install pilot base-01 in game

**Files:**
- Create: `scripts/make_region_mask.py`
- Modify: `src/scene/assets/manifest.ts` (bump base-01 to `?v=4`)
- Modify: `docs/references/ASSETS-LEDGER.md`

- [ ] **Step 1: Write the region-mask script**

```python
# scripts/make_region_mask.py — emit a region mask PNG for a textured base:
# R=skin, G=hair, B=clothing. Head band (y >= head_frac of height) splits
# skin vs hair by luminance; below the band = clothing.
# Rasterizes UV triangles by 3D height band (same approach as project_face).
# Usage: python scripts/make_region_mask.py <in.glb> <out_mask.png> [--head 0.80] [--hair-lum 90]
import sys

import numpy as np
import trimesh
from PIL import Image

in_glb, out_png = sys.argv[1], sys.argv[2]
HEAD = float(sys.argv[sys.argv.index("--head") + 1]) if "--head" in sys.argv else 0.80
HAIR_LUM = float(sys.argv[sys.argv.index("--hair-lum") + 1]) if "--hair-lum" in sys.argv else 90.0

scene = trimesh.load(in_glb, process=False)
mesh = max(
    (g for g in scene.geometry.values() if hasattr(g, "visual")),
    key=lambda g: len(g.vertices),
)
uv = np.asarray(mesh.visual.uv)
verts = np.asarray(mesh.vertices)
faces = np.asarray(mesh.faces)
atlas = np.asarray(mesh.visual.material.baseColorTexture.convert("RGB")).astype(np.float32)
H, W = atlas.shape[:2]

my0, my1 = verts[:, 1].min(), verts[:, 1].max()
head_y = my0 + HEAD * (my1 - my0)

# Per-texel mean height via UV rasterization
height_map = np.full((H, W), np.nan, dtype=np.float32)
for f in faces:
    tuv = uv[f].copy()
    tuv[:, 1] = 1.0 - tuv[:, 1]
    pix = tuv * [W, H]
    x0, y0 = np.floor(pix.min(axis=0)).astype(int)
    x1, y1 = np.ceil(pix.max(axis=0)).astype(int)
    if x1 <= x0 or y1 <= y0:
        continue
    gx, gy = np.meshgrid(np.arange(x0, x1) + 0.5, np.arange(y0, y1) + 0.5)
    a, b, c = pix
    det = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
    if abs(det) < 1e-9:
        continue
    w0 = ((b[1] - c[1]) * (gx - c[0]) + (c[0] - b[0]) * (gy - c[1])) / det
    w1 = ((c[1] - a[1]) * (gx - c[0]) + (a[0] - c[0]) * (gy - c[1])) / det
    w2 = 1.0 - w0 - w1
    inside = (w0 >= -0.001) & (w1 >= -0.001) & (w2 >= -0.001)
    if not inside.any():
        continue
    py = w0 * verts[f[0], 1] + w1 * verts[f[1], 1] + w2 * verts[f[2], 1]
    ys_ = slice(max(0, y0), min(H, y1))
    xs_ = slice(max(0, x0), min(W, x1))
    hh, ww = ys_.stop - ys_.start, xs_.stop - xs_.start
    m = inside[:hh, :ww]
    region = height_map[ys_, xs_]
    region[m] = py[:hh, :ww][m]
    height_map[ys_, xs_] = region

lum = atlas @ np.array([0.299, 0.587, 0.114])
mask = np.zeros((H, W, 3), dtype=np.uint8)
covered = ~np.isnan(height_map)
head = covered & (height_map >= head_y)
mask[head & (lum >= HAIR_LUM), 0] = 255            # skin
mask[head & (lum < HAIR_LUM), 1] = 255             # hair (dark head texels)
mask[covered & (height_map < head_y), 2] = 255     # clothing
Image.fromarray(mask).save(out_png)
skin = (mask[..., 0] > 0).sum()
hair = (mask[..., 1] > 0).sum()
cloth = (mask[..., 2] > 0).sum()
print(f"[mask] skin={skin} hair={hair} clothing={cloth}")
```

- [ ] **Step 2: Run on textured base-01**

```bash
python scripts/make_region_mask.py docs/references/characters/bases/work/base-01-textured.glb docs/references/characters/bases/work/base-01-mask.png --head 0.80
```
Expected: all three counts > 0. Open the mask PNG; regions should roughly match head/hair/body.

- [ ] **Step 3: Optimize + install**

```bash
npx @gltf-transform/cli resize --width 1024 --height 1024 docs/references/characters/bases/work/base-01-textured.glb docs/references/characters/bases/work/base-01-final.glb
npx @gltf-transform/cli prune docs/references/characters/bases/work/base-01-final.glb docs/references/characters/bases/work/base-01-final.glb
copy /Y docs\references\characters\bases\work\base-01-final.glb public\models\characters\base-01.glb
```
Check size: `base-01.glb` should stay under ~2 MB.

- [ ] **Step 4: Cache-bust base-01 in the manifest**

In `src/scene/assets/manifest.ts`, change only the base-01 entry:

```ts
export const BASE_URLS = [
  '/models/characters/base-01.glb?v=4',
  '/models/characters/base-02.glb?v=3',
  '/models/characters/base-03.glb?v=3',
  '/models/characters/base-04.glb?v=3',
] as const
```

- [ ] **Step 5: Typecheck + in-engine check**

Run: `npm run typecheck` → clean. Then dev server + photo mode at the table: `http://localhost:5173/?photo=0,1.4,4.5,0,1,2.6` — papa/oncle1/oncle-jeune (base-01) must show the textured body/face under MeshToonMaterial (applyToon: map present → color `#ffffff`).

- [ ] **Step 6: Ledger line**

Append to `docs/references/ASSETS-LEDGER.md` (follow the existing line format in that file): base-01.glb — retextured (unwrap Smart-UV + Hunyuan texgen OR flat bake + project_face from base-01-front.png), Hunyuan3D-2GP local, 2026-07-16, licence OK, no prompt (image-driven).

- [ ] **Step 7: Commit**

```bash
git add scripts/make_region_mask.py public/models/characters/base-01.glb src/scene/assets/manifest.ts docs/references/ASSETS-LEDGER.md
git commit -m "feat(assets): base-01 texturé (pilote) + masque de régions + install v4"
```

---

### Task 4: Batch base-03 and base-04

**Files:**
- Modify: `src/scene/assets/manifest.ts` (v4 for base-03/04)
- Modify: `docs/references/ASSETS-LEDGER.md`

- [ ] **Step 1: Run the validated pipeline on base-03 then base-04**

For X in {03, 04} — exact same commands as Tasks 1/1b/2/3 with substituted names:

```bash
blender --background --python scripts/unwrap_base.py -- public/models/characters/base-0X.glb docs/references/characters/bases/work/base-0X-unwrapped.glb
# GO branch: Hunyuan texture endpoint -> base-0X-texgen.glb ; PIVOT branch:
python scripts/bake_flat_texture.py docs/references/characters/bases/work/base-0X-unwrapped.glb docs/references/characters/bases/views/base-0X-front.png docs/references/characters/bases/work/base-0X-flat.glb
python scripts/project_face.py docs/references/characters/bases/work/base-0X-<texgen|flat>.glb docs/references/characters/bases/views/base-0X-front.png docs/references/characters/bases/work/base-0X-textured.glb --face-top 1.0 --face-bottom 0.80
blender --background --python scripts/preview_glb.py -- docs/references/characters/bases/work/base-0X-textured.glb docs/references/characters/bases/work/base-0X-textured
python scripts/make_region_mask.py docs/references/characters/bases/work/base-0X-textured.glb docs/references/characters/bases/work/base-0X-mask.png --head 0.80
npx @gltf-transform/cli resize --width 1024 --height 1024 docs/references/characters/bases/work/base-0X-textured.glb docs/references/characters/bases/work/base-0X-final.glb
npx @gltf-transform/cli prune docs/references/characters/bases/work/base-0X-final.glb docs/references/characters/bases/work/base-0X-final.glb
copy /Y docs\references\characters\bases\work\base-0X-final.glb public\models\characters\base-0X.glb
```

Read each preview render before installing. base-04 (femme âgée, grande-tante) may need `--face-bottom` retuned (posture).

- [ ] **Step 2: Manifest v4 for base-03/base-04, ledger lines**

Same edits as Task 3 Steps 4/6 for the two files.

- [ ] **Step 3: Typecheck + in-engine check**

`npm run typecheck` clean; photo mode: the 4 women (base-03) + grande-tante (base-04) textured.

- [ ] **Step 4: Commit**

```bash
git add public/models/characters/base-03.glb public/models/characters/base-04.glb src/scene/assets/manifest.ts docs/references/ASSETS-LEDGER.md
git commit -m "feat(assets): base-03 et base-04 texturées (pipeline pilote industrialisé)"
```

---

### Task 5: Real base-02 (Beto) — new rigged model

base-02.glb is a copy of base-01. Build the real one. **Contains a HUMAN step (Mixamo upload).**

**Files:**
- Modify: `src/scene/assets/manifest.ts`, `docs/references/ASSETS-LEDGER.md`

- [ ] **Step 1: Generate base-02 geometry via Hunyuan**

Run: `python scripts/gen_base.py --name base-02`
(~45 min; uses `views/base-02-front/back/left.png`, writes `docs/references/characters/bases/output/base-02.glb`.) Expected: `SAVED: ... (N KB)`.

- [ ] **Step 2: Convert to FBX for Mixamo**

Run: `blender --background --python scripts/glb_to_fbx.py -- docs/references/characters/bases/output/base-02.glb docs/references/characters/bases/work/base-02.fbx`

- [ ] **Step 3: HUMAN STEP — ask Sylvain**

Ask Sylvain to upload `base-02.fbx` to Mixamo, auto-rig, download **Sitting Idle** ("With Skin") into `docs/references/characters/bases/mixamo/base-02/`. Blocking; stop the task until the FBX lands.

- [ ] **Step 4: Merge to GLB**

Run: `blender --background --python scripts/fbx_merge_to_glb.py -- docs/references/characters/bases/mixamo/base-02 docs/references/characters/bases/work/base-02-rigged.glb`
Expected: `Final actions: ['Sitting Idle(4)']` (or similar — the clip name MUST match `clipIdle` in familyConfig; if the downloaded clip produces a different action name, rename the FBX file so `fbx_merge_to_glb` names it `Sitting Idle(4)`).

- [ ] **Step 5: Texture it (same pipeline)**

Same command sequence as Task 4 Step 1 with `base-02`, starting from `work/base-02-rigged.glb` instead of `public/…`. Preview render, then install `public/models/characters/base-02.glb`, manifest `?v=4`, ledger line.

- [ ] **Step 6: In-engine check**

Oncle Ramón + Tío Beto (base-02) must now be a bald distinct man, sitting correctly (clip plays, no T-pose).

- [ ] **Step 7: Commit**

```bash
git add public/models/characters/base-02.glb src/scene/assets/manifest.ts docs/references/ASSETS-LEDGER.md
git commit -m "feat(assets): vrai base-02 (Beto) — geo Hunyuan + rig Mixamo + texture"
```

---### Task 6: `make_variant.py` + variant textures

**Files:**
- Create: `scripts/make_variant.py`
- Create: `public/textures/characters/` variant PNGs

- [ ] **Step 1: Write the variant script**

```python
# scripts/make_variant.py — recolor hair and/or clothing of a base atlas via
# its region mask (R=skin untouched, G=hair, B=clothing). Hue/sat shift in
# HSV, luminance preserved (keeps folds/shading).
# Usage: python scripts/make_variant.py <base.glb> <mask.png> <out.png>
#        [--cloth-hue 0.6] [--cloth-sat 0.5] [--hair-value 0.8]
# hue: 0..1 target hue for clothing; sat: target saturation;
# hair-value: multiplier on hair brightness (e.g. 1.3 = greying).
import sys

import numpy as np
import trimesh
from PIL import Image

glb, mask_png, out_png = sys.argv[1:4]
def arg(name, default):
    return float(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else default
CLOTH_HUE = arg("--cloth-hue", None)  # None = don't recolor clothing
CLOTH_SAT = arg("--cloth-sat", 0.55)
HAIR_VAL = arg("--hair-value", 1.0)

scene = trimesh.load(glb, process=False)
mesh = max(
    (g for g in scene.geometry.values() if hasattr(g, "visual")),
    key=lambda g: len(g.vertices),
)
atlas = mesh.visual.material.baseColorTexture.convert("RGB")
rgb = np.asarray(atlas).astype(np.float32) / 255.0
mask = np.asarray(Image.open(mask_png).convert("RGB"))
hair = mask[..., 1] > 0
cloth = mask[..., 2] > 0

hsv = np.asarray(Image.fromarray((rgb * 255).astype(np.uint8), "RGB").convert("HSV")).astype(np.float32) / 255.0
if CLOTH_HUE is not None:
    hsv[..., 0] = np.where(cloth, CLOTH_HUE, hsv[..., 0])
    hsv[..., 1] = np.where(cloth, CLOTH_SAT, hsv[..., 1])
hsv[..., 2] = np.where(hair, np.clip(hsv[..., 2] * HAIR_VAL, 0, 1), hsv[..., 2])
out = Image.fromarray((hsv * 255).astype(np.uint8), "HSV").convert("RGB")
out.save(out_png)
print(f"[variant] saved {out_png} (cloth texels={cloth.sum()}, hair texels={hair.sum()})")
```

- [ ] **Step 2: Produce variants (final assignment below in Task 7)**

Variants needed (one PNG per NPC that shares a base, skipping one "canonical" NPC per base who keeps the embedded atlas):

```bash
mkdir public\textures\characters 2>NUL
# base-01 (papa = canonical) : oncle1, oncle-jeune
python scripts/make_variant.py public/models/characters/base-01.glb docs/references/characters/bases/work/base-01-mask.png public/textures/characters/base-01-oncle1.png --cloth-hue 0.33 --cloth-sat 0.45
python scripts/make_variant.py public/models/characters/base-01.glb docs/references/characters/bases/work/base-01-mask.png public/textures/characters/base-01-oncle-jeune.png --cloth-hue 0.08 --cloth-sat 0.6
# base-02 (oncle2 = canonical) : oncle3
python scripts/make_variant.py public/models/characters/base-02.glb docs/references/characters/bases/work/base-02-mask.png public/textures/characters/base-02-oncle3.png --cloth-hue 0.58 --cloth-sat 0.5
# base-03 (maman = canonical) : tante1, tante2, tante-jeune
python scripts/make_variant.py public/models/characters/base-03.glb docs/references/characters/bases/work/base-03-mask.png public/textures/characters/base-03-tante1.png --cloth-hue 0.83 --cloth-sat 0.55
python scripts/make_variant.py public/models/characters/base-03.glb docs/references/characters/bases/work/base-03-mask.png public/textures/characters/base-03-tante2.png --cloth-hue 0.12 --cloth-sat 0.6
python scripts/make_variant.py public/models/characters/base-03.glb docs/references/characters/bases/work/base-03-mask.png public/textures/characters/base-03-tante-jeune.png --cloth-hue 0.5 --cloth-sat 0.5 --hair-value 0.75
```

Hues are starting points — check each PNG (or preview with the map override: `blender --background --python scripts/preview_glb.py -- public/models/characters/base-03.glb work-prefix public/textures/characters/base-03-tante1.png`) and adjust for the Día-de-Muertos palette (warm reds/oranges/purples).

- [ ] **Step 3: Commit**

```bash
git add scripts/make_variant.py public/textures/characters
git commit -m "feat(assets): variantes par PNJ (recolor tissu/cheveux via masque de régions)"
```

---

### Task 7: Runtime variant support (Layer B option b)

**Files:**
- Modify: `src/game/systems/npcSystem.ts` (NPCConfig type — find the `modelUrl?` field and add below it)
- Modify: `src/scene/living-room/FamilyMemberGLB.tsx`
- Modify: `src/scene/living-room/familyConfig.ts`
- Modify: `src/scene/assets/manifest.ts`

Scene-layer change → no unit test (project convention); typecheck + visual validation.

- [ ] **Step 1: Add `variantTexture` to NPCConfig**

In `src/game/systems/npcSystem.ts`, in the `NPCConfig` interface next to `modelUrl`:

```ts
  /** Optional per-NPC baseColor override (variant PNG) applied on the cloned material. */
  variantTexture?: string
```

- [ ] **Step 2: Manifest — variant URLs + preload**

In `src/scene/assets/manifest.ts` after `CUSHION_TEX_URLS`:

```ts
export const NPC_VARIANT_TEX = {
  oncle1:        '/textures/characters/base-01-oncle1.png',
  'oncle-jeune': '/textures/characters/base-01-oncle-jeune.png',
  oncle3:        '/textures/characters/base-02-oncle3.png',
  tante1:        '/textures/characters/base-03-tante1.png',
  tante2:        '/textures/characters/base-03-tante2.png',
  'tante-jeune': '/textures/characters/base-03-tante-jeune.png',
} as const
```

And append to `TEXTURE_URLS`:

```ts
export const TEXTURE_URLS: string[] = [
  TEX_ADOBE, TEX_TOMETTES, TEX_STONE, TEX_WOOD_DARK, TEX_AZULEJOS, TEX_TABLECLOTH,
  ...CUSHION_TEX_URLS,
  ...Object.values(NPC_VARIANT_TEX),
]
```

- [ ] **Step 3: FamilyMemberGLB — apply the override**

In `src/scene/living-room/FamilyMemberGLB.tsx`. Hooks cannot be conditional, so load the variant with `useTexture` only when defined via a constant fallback: add a 1×1 white PNG `public/textures/characters/blanc-1px.png` (create it: `python -c "from PIL import Image; Image.new('RGB',(1,1),(255,255,255)).save('public/textures/characters/blanc-1px.png')"`).

```ts
import { useGLTF, useAnimations, useTexture } from '@react-three/drei'

const NO_VARIANT = '/textures/characters/blanc-1px.png'
```

Change `applyToon` to accept an override map:

```ts
function applyToon(scene: THREE.Object3D, meshColor: string, overrideMap: THREE.Texture | null) {
  scene.traverse(obj => {
    if (!(obj as THREE.Mesh).isMesh) return
    const mesh = obj as THREE.Mesh
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mesh.material = mats.map(m => {
      const std = m as THREE.MeshStandardMaterial
      const map = overrideMap ?? std.map ?? null
      return new THREE.MeshToonMaterial({
        map,
        color:       map ? '#ffffff' : meshColor,
        gradientMap: toonGradient,
      })
    })
    if ((mesh.material as THREE.Material[]).length === 1) {
      mesh.material = (mesh.material as THREE.Material[])[0]
    }
    mesh.frustumCulled = false // skinned: bounding spheres cull incorrectly
    mesh.geometry.computeVertexNormals()
  })
}
```

In the component body:

```ts
  const variantTex = useTexture(config.variantTexture ?? NO_VARIANT)
  // GLTF-embedded textures use flipY=false + sRGB; a drei-loaded PNG must match
  // or the variant maps upside down and washed out.
  variantTex.flipY = false
  variantTex.colorSpace = THREE.SRGBColorSpace
  variantTex.needsUpdate = true
```

And in the existing `useEffect`:

```ts
  useEffect(() => {
    applyToon(clonedScene, config.meshColor, config.variantTexture ? variantTex : null)
    ...
  }, [clonedScene, config.meshColor, config.headBoneName, config.variantTexture, variantTex])
```

- [ ] **Step 4: familyConfig assignments**

Add to each sharing NPC (import `NPC_VARIANT_TEX` from `../assets/manifest`):

```ts
  // oncle1  : variantTexture: NPC_VARIANT_TEX.oncle1,
  // oncle-jeune : variantTexture: NPC_VARIANT_TEX['oncle-jeune'],
  // oncle3  : variantTexture: NPC_VARIANT_TEX.oncle3,
  // tante1  : variantTexture: NPC_VARIANT_TEX.tante1,
  // tante2  : variantTexture: NPC_VARIANT_TEX.tante2,
  // tante-jeune : variantTexture: NPC_VARIANT_TEX['tante-jeune'],
```

(One line per NPC object, e.g. `variantTexture: NPC_VARIANT_TEX.oncle1,` after `modelUrl`.)

- [ ] **Step 5: Typecheck + tests**

Run: `npm run typecheck` → clean. Run: `npm test` → all pass (no logic touched; guard against accidental type breakage in npcSystem).

- [ ] **Step 6: In-engine validation**

Dev server, photo mode on the table. Check: the 4 base-03 women wear 4 different dress colors, faces identical per base but individualized by clothing/hair; skin NOT recolored (mask R untouched); no upside-down texture (flipY trap).

- [ ] **Step 7: Commit**

```bash
git add src/game/systems/npcSystem.ts src/scene/living-room/FamilyMemberGLB.tsx src/scene/living-room/familyConfig.ts src/scene/assets/manifest.ts public/textures/characters/blanc-1px.png
git commit -m "feat(npc): variantes de texture par PNJ (option b — swap de map sur clone)"
```

---

### Task 8: Hero nose fix

**Files:**
- Create: `scripts/fix_hero_nose.py`
- Modify: `src/scene/assets/manifest.ts` (heros `?v=4`), `docs/references/ASSETS-LEDGER.md`

- [ ] **Step 1: Locate the red spot in UV space**

Run existing helper: `python scripts/probe_face_uv.py public/models/characters/heros.glb` (inspect its usage header first — it maps face UVs). Alternatively dump the atlas: a small snippet inside `fix_hero_nose.py` (Step 2) saves the atlas PNG first; open it and note the red blotch pixel bbox.

- [ ] **Step 2: Write the fix script**

```python
# scripts/fix_hero_nose.py — remove the red projection artifact on the hero's
# nose: inside a given atlas bbox, texels that are "too red" are replaced by
# the median surrounding skin tone.
# Usage: python scripts/fix_hero_nose.py <in.glb> <out.glb> --box x0,y0,x1,y1 [--dump atlas.png]
import sys

import numpy as np
import trimesh
from PIL import Image

in_glb, out_glb = sys.argv[1], sys.argv[2]
scene = trimesh.load(in_glb, process=False)
mesh = max(
    (g for g in scene.geometry.values() if hasattr(g, "visual")),
    key=lambda g: len(g.vertices),
)
material = mesh.visual.material
atlas = np.asarray(material.baseColorTexture.convert("RGB")).copy()

if "--dump" in sys.argv:
    Image.fromarray(atlas).save(sys.argv[sys.argv.index("--dump") + 1])
    print("[nose] atlas dumped — locate the red spot bbox, re-run with --box")
    sys.exit(0)

x0, y0, x1, y1 = map(int, sys.argv[sys.argv.index("--box") + 1].split(","))
patch = atlas[y0:y1, x0:x1].astype(int)
r, g, b = patch[..., 0], patch[..., 1], patch[..., 2]
red = (r > g + 30) & (r > b + 30)  # markedly red vs skin
ring = atlas[max(0, y0 - 8):y1 + 8, max(0, x0 - 8):x1 + 8].reshape(-1, 3)
skin = np.median(ring, axis=0)
patch[red] = skin
atlas[y0:y1, x0:x1] = patch
print(f"[nose] {red.sum()} texels repeints avec skin={skin.astype(int)}")
material.baseColorTexture = Image.fromarray(atlas.astype(np.uint8))
scene.export(out_glb)
print(f"[nose] exporté {out_glb}")
```

- [ ] **Step 3: Run (dump → box → fix) + preview**

```bash
python scripts/fix_hero_nose.py public/models/characters/heros.glb _ --dump docs/references/characters/heros/work/heros-atlas.png
# read the PNG, find the red blotch bbox, then:
python scripts/fix_hero_nose.py public/models/characters/heros.glb docs/references/characters/heros/work/heros-nose-fixed.glb --box <x0,y0,x1,y1>
blender --background --python scripts/preview_glb.py -- docs/references/characters/heros/work/heros-nose-fixed.glb docs/references/characters/heros/work/heros-nose-fixed
```
Read the face render: nose clean, rest of the face untouched.

- [ ] **Step 4: Install + manifest v4 + ledger**

```bash
copy /Y docs\references\characters\heros\work\heros-nose-fixed.glb public\models\characters\heros.glb
```
`HERO_URL = '/models/characters/heros.glb?v=4'` in manifest; ledger line (heros.glb — nose artifact painted out, 2026-07-16).

- [ ] **Step 5: Commit**

```bash
git add scripts/fix_hero_nose.py public/models/characters/heros.glb src/scene/assets/manifest.ts docs/references/ASSETS-LEDGER.md
git commit -m "fix(assets): tache rouge sur le nez du héros repeinte (skin médian)"
```

---

### Task 9: Final validation

- [ ] **Step 1: Full checks**

Run: `npm run typecheck` clean, `npm test` all green, `npm run build` passes.

- [ ] **Step 2: In-engine tour**

Dev server; loader completes to 100%; walk to the table. Checklist: every seated adult textured (no flat monochrome), mouths readable, 4 women distinct, Beto bald and distinct, hero nose clean, grande-tante textured in her armchair, no T-pose after 3 reloads.

- [ ] **Step 3: Ledger audit**

Every modified file under `public/models/` and `public/textures/characters/` has a ledger line. No orphan assets.

- [ ] **Step 4: Show Sylvain (HUMAN GATE) + commit residuals**

Screenshots of the tablée for approval. Commit any leftover tweaks:

```bash
git add -A
git commit -m "chore(assets): validation finale texturing personnages"
```

---

## Self-review notes

- Spec coverage: Spike 0 → Task 0; Layer A unwrap/texture/optimise/ledger → Tasks 1–4; pilot-first → Tasks 2–3 gate before Task 4; base-02 (spec "use Beto") → Task 5 (upgraded: file was a duplicate); Layer B masks (preference 1) → Task 3 Step 1 + Task 6; option (b) runtime → Task 7; hero nose → Task 8; mouths → project_face band tuning (Task 2 Step 3); validation offline + in-engine → every task + Task 9.
- Deviation from spec (documented): no `base-0X-face.png` head crops — `project_face.py` calibrates on the FULL-BODY silhouette, and full-body frontal views already exist (`views/base-0X-front.png`). Also `npm run optimize-model` does not exist; replaced with explicit `npx @gltf-transform/cli` commands.
- Known risks routed: unwrap seams on face (Task 2 Step 3 max-4-iterations stop rule), texgen absent (Task 1b pivot, same artifact contract), Mixamo human step (Task 5 Step 3 explicit block).
