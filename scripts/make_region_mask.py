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
