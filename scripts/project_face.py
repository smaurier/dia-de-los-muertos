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
# Usage : python project_face.py <in.glb> <ref.png> <out.glb>
#         [--face-top 1.0] [--face-bottom 0.80] (fractions de la hauteur)
import struct
import sys

import numpy as np
import trimesh
from PIL import Image

in_glb, ref_png, out_glb = sys.argv[1:4]
FACE_TOP = float(sys.argv[sys.argv.index("--face-top") + 1]) if "--face-top" in sys.argv else 1.00
FACE_BOT = float(sys.argv[sys.argv.index("--face-bottom") + 1]) if "--face-bottom" in sys.argv else 0.80

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
ys, xs = np.where(fg)
ix0, ix1, iy0_raw, iy1 = xs.min(), xs.max(), ys.min(), ys.max()
print(f"[proj] silhouette ref: x[{ix0},{ix1}] y[{iy0_raw},{iy1}]")

# ── Skip label text at top of reference (e.g. "FRONT" / "BACK") ─────────────
# Character sheets often have a text label above the figure. Detect it by
# finding the first row where fg pixels form a wide horizontal band (body)
# rather than a narrow cluster (text). We look for the first row where the
# fg cluster is wider than 60px after the initial narrow rows.
iy0 = iy0_raw
for _y in range(iy0_raw, iy0_raw + 80):
    row_fg = fg[_y, :]
    row_xs = np.where(row_fg)[0]
    if len(row_xs) >= 60:  # body pixel cluster starts here
        break
    if len(row_xs) == 0:  # gap row = text above, body below
        iy0 = _y + 1
if iy0 != iy0_raw:
    print(f"[proj] skipped label text, body starts at y={iy0}")

# ── Visage : X bbox restreinte à la zone tête ────────────────────────────────
# La silhouette totale est dominée par l'envergure des bras (arm span).
# Pour la zone visage, on utilise la bbox horizontale des pixels dans le
# quart supérieur du personnage (corps sans bras) — plus étroite, centrée tête.
head_y_frac = 0.20  # top 20% of figure height = head/neck region
head_ref_ymax = int(iy0 + head_y_frac * (iy1 - iy0))
head_fg = fg[iy0:head_ref_ymax, :]
if head_fg.any():
    _, hxs = np.where(head_fg)
    margin = int(0.08 * (hxs.max() - hxs.min()))
    face_ix0 = max(0, hxs.min() - margin)
    face_ix1 = min(ra.shape[1] - 1, hxs.max() + margin)
else:
    face_ix0, face_ix1 = ix0, ix1  # fallback: full width
print(f"[proj] face X bbox (head region y<{head_ref_ymax}): x[{face_ix0},{face_ix1}]")

# ── Mesh : bbox (espace bind Hunyuan : Y vertical, Z avant) ──────────────────
mx0, my0, mz0 = verts.min(axis=0)
mx1, my1, mz1 = verts.max(axis=0)
mh = my1 - my0
print(f"[proj] mesh: x[{mx0:.2f},{mx1:.2f}] y[{my0:.2f},{my1:.2f}] z[{mz0:.2f},{mz1:.2f}]")

# Zone visage : bande verticale haute, moitié avant
face_y0 = my0 + FACE_BOT * mh
face_y1 = my0 + FACE_TOP * mh

def to_image(px, py):
    """Position mesh (x, y) -> pixel image de référence (projection frontale).
    X uses face_ix0/face_ix1 (head-width bbox) so features are not distorted
    by the arm span. Y uses full silhouette iy0/iy1.
    """
    u = (px - mx0) / (mx1 - mx0)
    v = (py - my0) / (my1 - my0)
    return face_ix0 + u * (face_ix1 - face_ix0), iy1 - v * (iy1 - iy0)

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
