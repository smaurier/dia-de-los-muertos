# Peinture vertex colors par projection frontale du character sheet t-pose.
# Chaque vertex échantillonne le pixel (x, hauteur) de l'image — vraies
# couleurs et frontières dessinées. Le dos réutilise la projection avant
# (cartoon : dos de t-shirt = t-shirt) ; l'arrière du crâne est forcé à la
# couleur cheveux (la projection y plaquerait le visage).
# Usage :
#   blender --background --python scripts/vertex_paint_projection.py -- in.glb tpose.png out.glb
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
if len(argv) != 3:
    raise SystemExit("Usage: blender --background --python vertex_paint_projection.py -- in.glb tpose.png out.glb")

input_glb, tpose_png, output_glb = argv

bpy.ops.wm.read_factory_settings(use_empty=True)

# ── Image : pixels + bounding box du personnage (tout ce qui n'est pas fond) ──
img = bpy.data.images.load(tpose_png)
W, H = img.size
px = list(img.pixels)  # RGBA float, ligne 0 = bas de l'image


def pixel(ix, iy):
    o = (iy * W + ix) * 4
    return px[o], px[o + 1], px[o + 2]


bg = pixel(2, H - 3)  # coin haut-gauche = fond


def is_bg(c, tol=0.06):
    if abs(c[0] - bg[0]) < tol and abs(c[1] - bg[1]) < tol and abs(c[2] - bg[2]) < tol:
        return True
    # Gris neutre de luminance moyenne = fond/ombre portée du sheet (le perso
    # n'a pas de gris moyen : baskets = blanc cassé clair, cheveux = très sombres)
    lum = (c[0] + c[1] + c[2]) / 3
    sat = max(c) - min(c)
    return sat < 0.06 and 0.22 < lum < 0.80


xs, ys = [], []
for iy in range(0, H, 2):
    for ix in range(0, W, 2):
        if not is_bg(pixel(ix, iy)):
            xs.append(ix)
            ys.append(iy)
if not xs:
    raise SystemExit("Personnage introuvable dans l'image (tout est fond ?)")
cx0, cx1, cy0, cy1 = min(xs), max(xs), min(ys), max(ys)

# Couleur cheveux : moyenne d'une bande sous le sommet du crâne, au centre
top_samples = []
for iy in range(max(cy1 - 14, 0), cy1):
    for ix in range((cx0 + cx1) // 2 - 10, (cx0 + cx1) // 2 + 10):
        c = pixel(ix, iy)
        if not is_bg(c):
            top_samples.append(c)
hair = tuple(sum(c[i] for c in top_samples) / len(top_samples) for i in range(3))


def sample(u, v):
    """u,v ∈ [0,1] dans la bbox personnage ; si on tombe sur le fond ou le
    bord de silhouette, on resserre vers l'axe central (et légèrement vers
    le centre vertical) jusqu'à trouver un pixel franc du personnage."""
    for shrink in (0.0, 0.04, 0.09, 0.16, 0.26, 0.40, 0.6):
        uu = u + (0.5 - u) * shrink
        vv = v + (0.55 - v) * shrink * 0.25
        ix = min(max(cx0 + int(uu * (cx1 - cx0)), 0), W - 1)
        iy = min(max(cy0 + int(vv * (cy1 - cy0)), 0), H - 1)
        c = pixel(ix, iy)
        if not is_bg(c, tol=0.10):
            return c
    return hair


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


# ── Mesh (import glTF Blender = Z-up, face du perso vers -Y) ──────────────────
bpy.ops.import_scene.gltf(filepath=input_glb)
meshes = [o for o in bpy.data.objects if o.type == "MESH"]
pts = [obj.matrix_world @ Vector(c) for obj in meshes for c in obj.bound_box]
min_h, max_h = min(p.z for p in pts), max(p.z for p in pts)
min_x, max_x = min(p.x for p in pts), max(p.x for p in pts)

# Teint de peau de référence (joue) pour rattraper les oreilles : elles
# débordent de la silhouette et attrapent l'ombre grise du sheet.
skin = sample(0.46, 0.74)


def grayish(c):
    return max(c) - min(c) < 0.09 and 0.18 < (c[0] + c[1] + c[2]) / 3 < 0.85

for obj in meshes:
    mesh = obj.data
    attr = mesh.color_attributes.new(name="Col", type="FLOAT_COLOR", domain="POINT")
    for i, v in enumerate(mesh.vertices):
        w = obj.matrix_world @ v.co
        u = (w.x - min_x) / (max_x - min_x)
        yf = (w.z - min_h) / (max_h - min_h)
        if yf > 0.62 and w.y > 0.02:  # arrière du crâne
            c = hair
        else:
            c = sample(u, yf)
            if 0.62 < yf < 0.88 and grayish(c):  # oreilles/tempes
                c = skin
        attr.data[i].color = tuple(srgb_to_linear(ch) for ch in c) + (1.0,)
    mesh.color_attributes.active_color = attr

bpy.ops.export_scene.gltf(filepath=output_glb, export_format="GLB", export_vertex_color="ACTIVE")
print(f"Projected -> {output_glb}")
