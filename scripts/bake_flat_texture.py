# scripts/bake_flat_texture.py — fill a UV'd GLB's atlas from the frontal
# reference (orthographic projection, full body). Back-facing triangles get
# the mirrored front sample (cheap but colors are right). Sharp face comes
# later from project_face.py.
# Usage: python scripts/bake_flat_texture.py <in.glb> <front_ref.png> <out.glb>
#        [--skip-top-rows N]  (rows at top of ref to ignore for label, default 80)
import sys

import numpy as np
import trimesh
from PIL import Image

in_glb, ref_png, out_glb = sys.argv[1:4]
SKIP_TOP = int(sys.argv[sys.argv.index("--skip-top-rows") + 1]) if "--skip-top-rows" in sys.argv else 80

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

# Exclude label rows at the top (e.g. "FRONT" text) — same mechanism as project_face.py
fg[:SKIP_TOP, :] = False

# Label text can sit below SKIP_TOP (sheet layouts vary): keep only the largest
# contiguous row-cluster of foreground (the silhouette), drop the rest.
fg_rows = np.where(fg.any(axis=1))[0]
if len(fg_rows):
    breaks = np.where(np.diff(fg_rows) > 1)[0]
    starts = np.concatenate(([0], breaks + 1))
    ends = np.concatenate((breaks, [len(fg_rows) - 1]))
    spans = [(fg_rows[s], fg_rows[e]) for s, e in zip(starts, ends)]
    lo, hi = max(spans, key=lambda se: se[1] - se[0])
    fg[:lo, :] = False
    fg[hi + 1:, :] = False

ys, xs = np.where(fg)
ix0, ix1, iy0, iy1 = xs.min(), xs.max(), ys.min(), ys.max()
print(f"[bake] silhouette ref (skip_top={SKIP_TOP}): x[{ix0},{ix1}] y[{iy0},{iy1}]")

mx0, my0, _ = verts.min(axis=0)
mx1, my1, _ = verts.max(axis=0)

def to_image(px, py):
    u = (px - mx0) / max(mx1 - mx0, 1e-9)
    v = (py - my0) / max(my1 - my0, 1e-9)
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
    # Clamp to silhouette bbox (not the full image) so vertices above the
    # character top (hair peak) cannot sample into the excluded label rows.
    sx = np.clip(sx, ix0, ix1).astype(int)
    sy = np.clip(sy, iy0, iy1).astype(int)
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
