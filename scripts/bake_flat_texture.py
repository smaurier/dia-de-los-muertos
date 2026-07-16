# scripts/bake_flat_texture.py — fill a UV'd GLB's atlas from the frontal
# reference (orthographic projection, full body).
# Front-facing triangles (mean nz >= 0) sample the FRONT view.
# Back-facing triangles (mean nz < 0) sample the BACK view with x mirrored,
# so the back of the head shows hair/clothing from the back reference instead
# of a mirrored copy of the face.
#
# Usage:
#   python scripts/bake_flat_texture.py <in.glb> <front_ref.png> <out.glb>
#       [--back back_ref.png]
#       [--skip-top-rows N]  (rows at top of ref to ignore for label, default 80)
import sys

import numpy as np
import trimesh
from PIL import Image

in_glb, ref_png, out_glb = sys.argv[1:4]
SKIP_TOP = int(sys.argv[sys.argv.index("--skip-top-rows") + 1]) if "--skip-top-rows" in sys.argv else 80
BACK_PNG = sys.argv[sys.argv.index("--back") + 1] if "--back" in sys.argv else None

scene = trimesh.load(in_glb, process=False)
mesh = max(
    (g for g in scene.geometry.values() if hasattr(g, "visual")),
    key=lambda g: len(g.vertices),
)
uv = np.asarray(mesh.visual.uv)
verts = np.asarray(mesh.vertices)
faces = np.asarray(mesh.faces)
normals = np.asarray(mesh.vertex_normals)

material = mesh.visual.material
tex_img = material.baseColorTexture.convert("RGB")
W, H = tex_img.size
atlas = np.asarray(tex_img).copy().astype(np.float32)

mx0, my0, _ = verts.min(axis=0)
mx1, my1, _ = verts.max(axis=0)


# ── Reference preparation ─────────────────────────────────────────────────────
def prepare_ref(path):
    """Load a reference PNG and compute:
    - ref_arr: (Href, Wref, 3) uint8 array
    - fg: (Href, Wref) bool foreground mask (background removed, label rows
          filtered, largest row-cluster kept)
    - (ix0, ix1, iy0, iy1): silhouette bounding box in image pixels
    - nearest_fg_row: (Href,) int array — for each row, the nearest row with fg
    - row_median: (Href, 3) float32 — per-fg-row median silhouette color
    """
    ref = Image.open(path).convert("RGB")
    ra = np.asarray(ref).astype(int)
    bg = np.median(ra[2:8, 2:8].reshape(-1, 3), axis=0)
    fg = (np.abs(ra - bg).sum(axis=2) > 45)

    # Exclude label rows at the top (e.g. "FRONT" / "BACK" text)
    fg[:SKIP_TOP, :] = False

    # Keep only the largest contiguous row-cluster (silhouette), drop text blobs
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
    ix0, ix1, iy0, iy1 = int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())

    Href, Wref = fg.shape
    fg_row_indices = np.where(fg.any(axis=1))[0]

    # nearest_fg_row: for rows without fg, redirect to the nearest row with fg
    nearest_fg_row = np.empty(Href, dtype=np.int32)
    for r in range(Href):
        if fg[r].any():
            nearest_fg_row[r] = r
        else:
            dists = np.abs(fg_row_indices - r)
            nearest_fg_row[r] = fg_row_indices[dists.argmin()]

    ref_arr = np.asarray(ref)
    row_median = np.zeros((Href, 3), dtype=np.float32)
    for r in fg_row_indices:
        row_median[r] = np.median(ref_arr[r][fg[r]], axis=0)

    return ref_arr, fg, (ix0, ix1, iy0, iy1), nearest_fg_row, row_median


print(f"[bake] loading FRONT ref: {ref_png}")
front_arr, front_fg, (fix0, fix1, fiy0, fiy1), front_nfr, front_median = prepare_ref(ref_png)
print(f"[bake] front silhouette (skip_top={SKIP_TOP}): x[{fix0},{fix1}] y[{fiy0},{fiy1}]")

if BACK_PNG:
    print(f"[bake] loading BACK ref: {BACK_PNG}")
    back_arr, back_fg, (bix0, bix1, biy0, biy1), back_nfr, back_median = prepare_ref(BACK_PNG)
    print(f"[bake] back silhouette (skip_top={SKIP_TOP}): x[{bix0},{bix1}] y[{biy0},{biy1}]")
else:
    print("[bake] no --back ref; back-facing triangles will use front view (legacy mode)")
    back_arr = back_fg = back_nfr = back_median = None
    bix0 = bix1 = biy0 = biy1 = None


# ── Mapping: mesh world-space (x, y) -> reference image pixel ────────────────
def to_image_front(px, py):
    """Map mesh (x, y) to front reference pixel coords."""
    u = (px - mx0) / max(mx1 - mx0, 1e-9)
    v = (py - my0) / max(my1 - my0, 1e-9)
    return fix0 + u * (fix1 - fix0), fiy1 - v * (fiy1 - fiy0)


def to_image_back(px, py):
    """Map mesh (x, y) to back reference pixel coords, with x mirrored.
    The back photo shows the character from behind: character's left appears
    on the image's right. Mirroring x realigns them with the 3-D x axis.
    """
    u = (px - mx0) / max(mx1 - mx0, 1e-9)
    v = (py - my0) / max(my1 - my0, 1e-9)
    # Mirror x in the back image's silhouette bbox
    ix_back = bix1 - u * (bix1 - bix0)
    iy_back = biy1 - v * (biy1 - biy0)
    return ix_back, iy_back


# ── Per-triangle rasterisation ────────────────────────────────────────────────
painted = np.zeros((H, W), dtype=bool)
front_count = back_count = 0

for f in faces:
    # Mean normal z across the 3 vertices of this triangle
    mean_nz = normals[f, 2].mean()
    use_back = (BACK_PNG is not None) and (mean_nz < 0)

    tuv = uv[f].copy()
    tuv[:, 1] = 1.0 - tuv[:, 1]  # UV -> pixel space (origin top-left)
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

    # Interpolated 3-D position for each texel
    p = (w0[..., None] * verts[f[0]] + w1[..., None] * verts[f[1]]
         + w2[..., None] * verts[f[2]])

    if use_back:
        # Back-facing triangle: sample back reference with mirrored x
        sx, sy = to_image_back(p[..., 0], p[..., 1])
        Href_b = back_arr.shape[0]
        Wref_b = back_arr.shape[1]
        sx = np.clip(sx, bix0, bix1).astype(int)
        sy = np.clip(sy, biy0, biy1).astype(int)
        sy = back_nfr[sy]
        colors = back_arr[sy, sx].astype(np.float32)
        on_bg = ~back_fg[sy, sx]
        colors[on_bg] = back_median[sy][on_bg]
        back_count += 1
    else:
        # Front-facing triangle (or no back ref): sample front reference
        sx, sy = to_image_front(p[..., 0], p[..., 1])
        sx = np.clip(sx, fix0, fix1).astype(int)
        sy = np.clip(sy, fiy0, fiy1).astype(int)
        sy = front_nfr[sy]
        colors = front_arr[sy, sx].astype(np.float32)
        on_bg = ~front_fg[sy, sx]
        colors[on_bg] = front_median[sy][on_bg]
        front_count += 1

    ys_ = slice(max(0, y0), min(H, y1))
    xs_ = slice(max(0, x0), min(W, x1))
    hh, ww = ys_.stop - ys_.start, xs_.stop - xs_.start
    m = inside[:hh, :ww] & ~painted[ys_, xs_]
    region = atlas[ys_, xs_]
    region[m] = colors[:hh, :ww][m]
    atlas[ys_, xs_] = region
    painted[ys_, xs_] |= m

print(f"[bake] triangles — front: {front_count}, back: {back_count}")
print(f"[bake] texels painted: {painted.sum()} / {W*H}")
material.baseColorTexture = Image.fromarray(atlas.clip(0, 255).astype(np.uint8))
scene.export(out_glb)
print(f"[bake] exported {out_glb}")
