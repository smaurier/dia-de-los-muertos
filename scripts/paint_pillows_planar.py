# Peint les motifs HD sur les coussins bakés d'un GLB :
# - SÉLECTION des texels = masque couleur sur la texture ORIGINALE (les zones
#   vives peintes par Hunyuan sont la vérité terrain des UV des coussins)
# - COORDONNÉES du motif = projection PLANAIRE 3D (normale moyenne de la zone)
#   → motif droit et net, sans distorsion de patch UV
# Usage : python paint_pillows_planar.py <base.glb> <orig_texture.png> <out.glb> <motif_rouge> <motif_creme> <motif_violet>
import sys
from collections import deque

import numpy as np
import trimesh
from PIL import Image, ImageFilter

base_glb, orig_png, out_glb, m_rouge, m_creme, m_violet = sys.argv[1:7]
# rang → motif (cartographie issue du rendu debug des zones)
motif_order = [m_rouge, m_creme, m_rouge, m_rouge, m_violet]

scene = trimesh.load(base_glb, process=False)
mesh = max((g for g in scene.geometry.values() if hasattr(g, "visual")), key=lambda g: len(g.vertices))
uv = np.asarray(mesh.visual.uv)
verts = np.asarray(mesh.vertices)
faces = np.asarray(mesh.faces)
fnormals = np.asarray(mesh.face_normals)

material = mesh.visual.material
tex_img = material.baseColorTexture.convert("RGB")
W, H = tex_img.size
atlas = np.asarray(tex_img).astype(np.float32)

# ── Masque strict des coussins sur la texture ORIGINALE ─────────────────────
orig = np.asarray(Image.open(orig_png).convert("RGB").resize((W, H))).astype(np.float32)
r, g, b = orig[..., 0], orig[..., 1], orig[..., 2]
mx = orig.max(axis=2)
mn = orig.min(axis=2)
sat = (mx - mn) / (mx + 1e-6)
hue = np.zeros((H, W), dtype=np.float32)
d = mx - mn + 1e-6
m = mx == r
hue[m] = (60 * ((g - b) / d) % 360)[m]
m = mx == g
hue[m] = (60 * ((b - r) / d) + 120)[m]
m = mx == b
hue[m] = (60 * ((r - g) / d) + 240)[m]
# Masque STRICT : graines fiables (cœurs vifs des coussins)
mask = (
    ((hue < 28) | (hue > 325) | ((hue > 235) & (hue < 320))) & (sat > 0.45) & (mx > 110)
) | ((mx > 205) & (sat < 0.30) & (mn > 165))
mask = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))) > 0

# Masque LARGE : le MÊME que clean_pillow_bake (couvre les coussins entiers,
# ombres comprises — c'est lui qui a laissé les zones brunes à peindre)
loose = (
    ((hue < 32) | (hue > 320) | ((hue > 230) & (hue < 320))) & (sat > 0.30)
) | ((mx > 200) & (sat < 0.35) & (mn > 150))
loose = np.asarray(Image.fromarray((loose * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(15))) > 0

# ── Composantes connexes, top 3 ──────────────────────────────────────────────
step = 4
small = mask[::step, ::step]
lab = np.zeros(small.shape, dtype=np.int32)
cur = 0
for sy in range(small.shape[0]):
    for sx in range(small.shape[1]):
        if small[sy, sx] and lab[sy, sx] == 0:
            cur += 1
            q = deque([(sy, sx)])
            lab[sy, sx] = cur
            while q:
                yy0, xx0 = q.popleft()
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    yy, xx = yy0 + dy, xx0 + dx
                    if 0 <= yy < small.shape[0] and 0 <= xx < small.shape[1] and small[yy, xx] and lab[yy, xx] == 0:
                        lab[yy, xx] = cur
                        q.append((yy, xx))
# Top 5 zones (vérifié au debug couleur) : rang 0 = coussin du retour,
# 1 = coussin du coin, 2 = bord du coussin du retour (même coussin),
# 3 = face cachée, 4 = coussin du bout droit.
sizes = sorted(((int((lab == c).sum()), c) for c in range(1, cur + 1)), reverse=True)[:5]
zones = [c for _, c in sizes]
zone_full = np.zeros((H, W), dtype=np.int32)
for c in zones:
    ys, xs = np.where(lab == c)
    for yy, xx in zip(ys, xs):
        zone_full[yy * step : (yy + 1) * step, xx * step : (xx + 1) * step] = c
zone_full[~mask] = 0
print(f"[planar] zones: {[(c, int((zone_full == c).sum())) for c in zones]}")

# ── Rasterisation : position 3D + normale par texel des zones ────────────────
pos_map = np.zeros((H, W, 3), dtype=np.float32)
nrm_map = np.zeros((H, W, 3), dtype=np.float32)
have = np.zeros((H, W), dtype=bool)
for fi, f in enumerate(faces):
    tuv = uv[f].copy()
    tuv[:, 1] = 1.0 - tuv[:, 1]
    pix = tuv * [W, H]
    x0, y0 = np.floor(pix.min(axis=0)).astype(int)
    x1, y1 = np.ceil(pix.max(axis=0)).astype(int)
    if x1 <= x0 or y1 <= y0 or x1 < 0 or y1 < 0 or x0 >= W or y0 >= H:
        continue
    xs_ = slice(max(0, x0), min(W, x1))
    ys_ = slice(max(0, y0), min(H, y1))
    gx, gy = np.meshgrid(np.arange(xs_.start, xs_.stop) + 0.5, np.arange(ys_.start, ys_.stop) + 0.5)
    a, b2, c2 = pix
    det = (b2[1] - c2[1]) * (a[0] - c2[0]) + (c2[0] - b2[0]) * (a[1] - c2[1])
    if abs(det) < 1e-9:
        continue
    w0 = ((b2[1] - c2[1]) * (gx - c2[0]) + (c2[0] - b2[0]) * (gy - c2[1])) / det
    w1 = ((c2[1] - a[1]) * (gx - c2[0]) + (a[0] - c2[0]) * (gy - c2[1])) / det
    w2 = 1.0 - w0 - w1
    ins = (w0 >= -0.001) & (w1 >= -0.001) & (w2 >= -0.001)
    if not ins.any():
        continue
    p = w0[..., None] * verts[f[0]] + w1[..., None] * verts[f[1]] + w2[..., None] * verts[f[2]]
    sel = ins
    pm = pos_map[ys_, xs_]
    pm[sel] = p[sel]
    pos_map[ys_, xs_] = pm
    nm = nrm_map[ys_, xs_]
    nm[sel] = fnormals[fi]
    nrm_map[ys_, xs_] = nm
    hv = have[ys_, xs_]
    hv[sel] = True
    have[ys_, xs_] = hv

# ── Par zone : plan (normale moyenne), étendue, échantillonnage du motif ─────
for rank, c in enumerate(zones):
    zsel = (zone_full == c) & have
    n_tex = int(zsel.sum())
    if n_tex < 200:
        print(f"[planar] zone {c}: trop peu de texels 3D ({n_tex}), sautée")
        continue
    # La région à peindre = la composante du masque LARGE (celui du nettoyage)
    # contenant cette graine : correspondance EXACTE avec les texels que
    # clean_pillow_bake a remplis de brun — plus un texel oublié.
    seed_ys, seed_xs = np.where(zsel)
    grow = np.zeros((H, W), dtype=bool)
    q = deque(zip(seed_ys[::7].tolist(), seed_xs[::7].tolist()))
    for yy, xx in q:
        grow[yy, xx] = True
    while q:
        yy0, xx0 = q.popleft()
        for dy in (-2, 0, 2):
            for dx in (-2, 0, 2):
                yy, xx = yy0 + dy, xx0 + dx
                if 0 <= yy < H and 0 <= xx < W and loose[yy, xx] and not grow[yy, xx]:
                    grow[yy, xx] = True
                    q.append((yy, xx))
    grow = np.asarray(Image.fromarray((grow * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    region = grow & have
    print(f"[planar] zone {c}: graine {n_tex} -> composante large {int(region.sum())} texels")
    n = nrm_map[region].mean(axis=0) if region.sum() > 100 else nrm_map[zsel].mean(axis=0)
    n /= np.linalg.norm(n) + 1e-9
    up = np.array([0.0, 1.0, 0.0])
    u_ax = np.cross(up, n)
    if np.linalg.norm(u_ax) < 0.1:
        u_ax = np.cross(np.array([1.0, 0.0, 0.0]), n)
    u_ax /= np.linalg.norm(u_ax)
    v_ax = np.cross(n, u_ax)
    ALLu = pos_map @ u_ax
    ALLv = pos_map @ v_ax
    # étendue du motif = étendue de la RÉGION (pleine face du coussin)
    u0, u1 = np.percentile(ALLu[region], [2, 98])
    v0, v1 = np.percentile(ALLv[region], [2, 98])
    motif = np.asarray(Image.open(motif_order[rank]).convert("RGB")).astype(np.float32)
    MH, MW = motif.shape[:2]
    su = np.clip((ALLu[region] - u0) / (u1 - u0 + 1e-9), 0, 1)
    sv = np.clip((ALLv[region] - v0) / (v1 - v0 + 1e-9), 0, 1)
    sx = np.clip((su * (MW - 1)).astype(int), 0, MW - 1)
    sy = np.clip(((1 - sv) * (MH - 1)).astype(int), 0, MH - 1)
    atlas[region] = motif[sy, sx]
    print(f"[planar] zone {c} (rang {rank}): masque {n_tex} -> region 3D {int(region.sum())} texels, motif {motif_order[rank].split('/')[-1]}")

material.baseColorTexture = Image.fromarray(atlas.clip(0, 255).astype(np.uint8))
scene.export(out_glb)
print(f"[planar] exporté: {out_glb}")
