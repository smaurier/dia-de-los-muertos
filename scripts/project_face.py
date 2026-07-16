# Projection du visage de référence sur la texture d'un GLB Hunyuan.
# Le texgen multiview peint les visages en bouillie (50 px par vue pour toute
# la tête) : on remplace la zone visage de l'atlas par la projection frontale
# orthographique du character sheet — fidélité garantie à la référence.
#
# Méthode : pour chaque triangle du mesh dont les texels tombent dans la zone
# tête + orienté vers l'avant, rasterisation dans l'espace UV ; chaque texel
# interpole sa position 3D (barycentrique), projetée sur l'image de référence
# (mapping linéaire calibré sur les bounding boxes mesh <-> silhouette).
# Fondu doux aux bords de la zone pour se marier à la texture Hunyuan.
#
# Calibration tête-à-tête (v2) :
#   MESH head box : vertices dans la bande verticale [face_y0, face_y1] et
#     orientés vers l'avant (nz > 0) → extent (x, y) en espace mesh.
#   REF head box : dans la silhouette de la référence, lignes correspondant
#     à la MÊME fraction de hauteur de personnage → extent x des pixels
#     avant-plan dans ces lignes.
#   Mapping linéaire mesh_head → ref_head : immunisé contre l'envergure des bras.
#
# Usage : python project_face.py <in.glb> <ref.png> <out.glb>
#         [--face-top 1.0] [--face-bottom 0.80]
#         [--skip-top-rows N]  (rows at top of ref to ignore for label, default 80)
import struct
import sys

import numpy as np
import trimesh
from PIL import Image

in_glb, ref_png, out_glb = sys.argv[1:4]
FACE_TOP = float(sys.argv[sys.argv.index("--face-top") + 1]) if "--face-top" in sys.argv else 1.00
FACE_BOT = float(sys.argv[sys.argv.index("--face-bottom") + 1]) if "--face-bottom" in sys.argv else 0.80
SKIP_TOP = int(sys.argv[sys.argv.index("--skip-top-rows") + 1]) if "--skip-top-rows" in sys.argv else 80

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
atlas = np.asarray(tex_img).copy()

# ── Référence : silhouette (fond ~uniforme) -> bbox du personnage ────────────
ref = Image.open(ref_png).convert("RGB")
ra = np.asarray(ref).astype(int)
bg = np.median(ra[2:8, 2:8].reshape(-1, 3), axis=0)  # coin = fond
fg = (np.abs(ra - bg).sum(axis=2) > 45)

# Exclure les lignes de label en haut (ex. "FRONT") — paramétrable
fg[:SKIP_TOP, :] = False

# Le label peut se trouver sous SKIP_TOP (mise en page variable des planches) :
# ne garder que le plus grand cluster contigu de lignes (la silhouette).
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
print(f"[proj] silhouette ref (skip_top={SKIP_TOP}): x[{ix0},{ix1}] y[{iy0},{iy1}]")

# ── Mesh : bbox globale ───────────────────────────────────────────────────────
mx0, my0, mz0 = verts.min(axis=0)
mx1, my1, mz1 = verts.max(axis=0)
mh = my1 - my0
print(f"[proj] mesh: x[{mx0:.3f},{mx1:.3f}] y[{my0:.3f},{my1:.3f}] z[{mz0:.3f},{mz1:.3f}]")

# Zone visage dans l'espace mesh : bande verticale haute
face_y0 = my0 + FACE_BOT * mh
face_y1 = my0 + FACE_TOP * mh

# ── MESH head box : vertices dans la bande visage, orientés vers l'avant ─────
# On filtre par bande y ET nz forward-ish (nz > 0.3) pour exclure l'arrière de
# la tête et les côtés extrêmes qui fausseraient l'extent x.
fwd_mask = (verts[:, 1] >= face_y0) & (verts[:, 1] <= face_y1) & (normals[:, 2] > 0.3)
if fwd_mask.sum() < 3:
    # Fallback: all vertices in band (no normal filter)
    fwd_mask = (verts[:, 1] >= face_y0) & (verts[:, 1] <= face_y1)
head_verts = verts[fwd_mask]
hx0 = head_verts[:, 0].min()
hx1 = head_verts[:, 0].max()
hy0 = head_verts[:, 1].min()
hy1 = head_verts[:, 1].max()
print(f"[proj] mesh head box ({fwd_mask.sum()} verts): x[{hx0:.3f},{hx1:.3f}] y[{hy0:.3f},{hy1:.3f}]")

# ── REF head box : fraction équivalente dans la silhouette ref ───────────────
# La silhouette ref mappe linéairement [iy0..iy1] → [my0..my1].
# La bande [face_y0..face_y1] correspond aux lignes ref :
#   ry1 = iy1 - FACE_BOT * (iy1 - iy0)   (bas de la bande → haut dans l'image)
#   ry0 = iy1 - FACE_TOP * (iy1 - iy0)   (haut de la bande → encore plus haut)
# (les images ont l'axe y inversé : iy1 = bas personnage = my0, iy0 = haut personnage = my1)
ref_h_span = iy1 - iy0
ry0 = int(iy1 - FACE_TOP * ref_h_span)
ry1 = int(iy1 - FACE_BOT * ref_h_span)
ry0 = max(SKIP_TOP, ry0)
ry1 = max(ry0 + 1, ry1)
print(f"[proj] ref head band rows: y[{ry0},{ry1}]")

# x-extent des pixels avant-plan dans ces lignes
band_fg = fg[ry0:ry1, :]
if band_fg.any():
    _, band_xs = np.where(band_fg)
    rx0, rx1 = int(band_xs.min()), int(band_xs.max())
else:
    rx0, rx1 = ix0, ix1  # fallback
print(f"[proj] ref head box: x[{rx0},{rx1}] y[{ry0},{ry1}]")

# ── Mapping tête mesh → tête ref ─────────────────────────────────────────────
def to_image(px, py):
    """Position mesh (x, y) -> pixel image de référence.
    Mapping tête-à-tête : mesh head box -> ref head box.
    Les deux axes sont mappés linéairement et indépendamment.
    """
    # x : mesh hx0..hx1  →  ref rx0..rx1
    if hx1 > hx0:
        u = (px - hx0) / (hx1 - hx0)
    else:
        u = 0.5
    ix = rx0 + u * (rx1 - rx0)

    # y : mesh hy0..hy1  →  ref ry1..ry0  (y inversé image)
    if hy1 > hy0:
        v = (py - hy0) / (hy1 - hy0)
    else:
        v = 0.5
    iy = ry1 - v * (ry1 - ry0)

    return ix, iy

# ── Rasterisation UV des triangles de la zone visage ────────────────────────
painted = np.zeros((H, W), dtype=np.float32)  # poids de projection par texel
src = np.zeros((H, W, 3), dtype=np.float32)

tri_count = 0
for f in faces:
    vy = verts[f, 1]
    vz = verts[f, 2]
    nz = normals[f, 2]
    if vy.max() < face_y0 or vy.min() > face_y1:
        continue
    if nz.mean() <= 0.05:  # face arrière/profil extrême : garder Hunyuan
        continue
    tri_count += 1
    tuv = uv[f].copy()
    tuv[:, 1] = 1.0 - tuv[:, 1]  # UV -> pixels (origine haut-gauche)
    pix = tuv * [W, H]
    x0, y0 = np.floor(pix.min(axis=0)).astype(int)
    x1, y1 = np.ceil(pix.max(axis=0)).astype(int)
    if x1 <= x0 or y1 <= y0:
        continue
    gx, gy = np.meshgrid(np.arange(x0, x1) + 0.5, np.arange(y0, y1) + 0.5)
    # coordonnées barycentriques
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
    # position 3D interpolée
    p = (
        w0[..., None] * verts[f[0]]
        + w1[..., None] * verts[f[1]]
        + w2[..., None] * verts[f[2]]
    )
    # poids : fondu vertical aux bords de la bande + orientation avant
    n = (
        w0[..., None] * normals[f[0]]
        + w1[..., None] * normals[f[1]]
        + w2[..., None] * normals[f[2]]
    )
    band = np.clip((p[..., 1] - face_y0) / (0.06 * mh), 0, 1)
    frontness = np.clip(n[..., 2] / (np.linalg.norm(n, axis=-1) + 1e-9) * 2.2, 0, 1)
    weight = np.where(inside, band * frontness, 0.0)
    # échantillonnage de la référence
    sx, sy = to_image(p[..., 0], p[..., 1])
    sx = np.clip(sx, 0, ref.width - 1).astype(int)
    sy = np.clip(sy, 0, ref.height - 1).astype(int)
    colors = np.asarray(ref)[sy, sx].astype(np.float32)
    ys_ = slice(max(0, y0), min(H, y1))
    xs_ = slice(max(0, x0), min(W, x1))
    hh = ys_.stop - ys_.start
    ww = xs_.stop - xs_.start
    wpatch = weight[:hh, :ww]
    mask = wpatch > painted[ys_, xs_]
    region_src = src[ys_, xs_]
    region_src[mask] = colors[:hh, :ww][mask]
    src[ys_, xs_] = region_src
    painted[ys_, xs_] = np.maximum(painted[ys_, xs_], wpatch)

print(f"[proj] triangles projetés: {tri_count}, texels touchés: {(painted > 0).sum()}")

# ── Fusion : atlas Hunyuan <- projection pondérée ────────────────────────────
alpha = painted[..., None]
blended = atlas.astype(np.float32) * (1 - alpha) + src * alpha
atlas_out = blended.clip(0, 255).astype(np.uint8)

# ── Réécriture du GLB (texture remplacée dans le matériau trimesh) ──────────
material.baseColorTexture = Image.fromarray(atlas_out)
scene.export(out_glb)
print(f"[proj] exporté: {out_glb}")
