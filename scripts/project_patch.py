# Projette un motif à plat sur une ZONE 3D d'un mesh texturé (ex : coussin
# baké dans la géométrie du canapé) — généralisation de project_face.py.
# Pour chaque texel de la zone (sphère autour d'un centre 3D) : position 3D
# interpolée -> coordonnées dans le plan du coussin (normale moyenne) ->
# échantillon du motif. Motif droit, sans distorsion de patch UV.
# Usage : python project_patch.py <in.glb> <out.glb> motif.png cx cy cz rayon [motif2.png cx cy cz r ...]
import sys

import numpy as np
import trimesh
from PIL import Image

in_glb, out_glb = sys.argv[1], sys.argv[2]
rest = sys.argv[3:]
patches = []
while rest:
    patches.append((rest[0], float(rest[1]), float(rest[2]), float(rest[3]), float(rest[4])))
    rest = rest[5:]

scene = trimesh.load(in_glb, process=False)
mesh = max((g for g in scene.geometry.values() if hasattr(g, "visual")), key=lambda g: len(g.vertices))
uv = np.asarray(mesh.visual.uv)
verts = np.asarray(mesh.vertices)
faces = np.asarray(mesh.faces)
fnormals = np.asarray(mesh.face_normals)

material = mesh.visual.material
tex_img = material.baseColorTexture.convert("RGB")
W, H = tex_img.size
atlas = np.asarray(tex_img).astype(np.float32)

for motif_path, cx, cy, cz, radius in patches:
    motif = np.asarray(Image.open(motif_path).convert("RGB")).astype(np.float32)
    MH, MW = motif.shape[:2]
    center = np.array([cx, cy, cz])

    # Triangles dont le centre est dans la sphère
    tri_centers = verts[faces].mean(axis=1)
    inside = np.linalg.norm(tri_centers - center, axis=1) < radius
    sel = np.where(inside)[0]
    if not len(sel):
        print(f"[patch] {motif_path}: AUCUN triangle dans la sphère ({cx},{cy},{cz}) r={radius}")
        continue

    # Plan du coussin : normale moyenne + axes u/v orthogonaux
    n = fnormals[sel].mean(axis=0)
    n /= np.linalg.norm(n)
    up = np.array([0.0, 1.0, 0.0])
    u_ax = np.cross(up, n)
    if np.linalg.norm(u_ax) < 0.1:
        u_ax = np.cross(np.array([1.0, 0.0, 0.0]), n)
    u_ax /= np.linalg.norm(u_ax)
    v_ax = np.cross(n, u_ax)

    painted = 0
    for fi in sel:
        f = faces[fi]
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
        ins = (w0 >= -0.001) & (w1 >= -0.001) & (w2 >= -0.001)
        if not ins.any():
            continue
        p = w0[..., None] * verts[f[0]] + w1[..., None] * verts[f[1]] + w2[..., None] * verts[f[2]]
        rel = p - center
        dist = np.linalg.norm(rel, axis=-1)
        # coordonnées plan -> motif (le motif couvre [-r*0.95, +r*0.95])
        mu = (rel @ u_ax) / (radius * 0.95) * 0.5 + 0.5
        mv = (rel @ v_ax) / (radius * 0.95) * 0.5 + 0.5
        okm = ins & (dist < radius) & (mu >= 0) & (mu <= 1) & (mv >= 0) & (mv <= 1)
        if not okm.any():
            continue
        sx = np.clip((mu * (MW - 1)).astype(int), 0, MW - 1)
        sy = np.clip(((1 - mv) * (MH - 1)).astype(int), 0, MH - 1)
        colors = motif[sy, sx]
        ys_ = slice(max(0, y0), min(H, y1))
        xs_ = slice(max(0, x0), min(W, x1))
        hh = ys_.stop - ys_.start
        ww = xs_.stop - xs_.start
        m2 = okm[:hh, :ww]
        region = atlas[ys_, xs_]
        region[m2] = colors[:hh, :ww][m2]
        atlas[ys_, xs_] = region
        painted += int(m2.sum())
    print(f"[patch] {motif_path}: {len(sel)} tris, {painted} texels peints")

material.baseColorTexture = Image.fromarray(atlas.clip(0, 255).astype(np.uint8))
scene.export(out_glb)
print(f"[patch] exporté: {out_glb}")
