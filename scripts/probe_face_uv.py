# Sonde les UV du visage d'un GLB normalisé (1,15 m, pieds au sol) :
# yeux et bouche localisés par leurs positions 3D -> coordonnées atlas.
# Usage : blender --background --python scripts/probe_face_uv.py -- heros.glb
import sys

import bpy
import mathutils

argv = sys.argv[sys.argv.index("--") + 1 :]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=argv[0])

# Le vrai perso = le mesh le plus dense (Hunyuan laisse trainer une Icosphere)
mesh_obj = max(
    (o for o in bpy.data.objects if o.type == "MESH"),
    key=lambda o: len(o.data.vertices),
)
mesh = mesh_obj.data
uv_layer = mesh.uv_layers.active.data

# Positions bind-space des vertices (espace glTF brut : Y vertical, Z avant —
# la conversion Z-up vit sur l'armature, pas dans les coordonnées du mesh)
world = [v.co.copy() for v in mesh.vertices]
ylo = min(w.y for w in world)
yhi = max(w.y for w in world)
H = yhi - ylo
print(f"[probe] y [{ylo:.3f}, {yhi:.3f}] (H={H:.3f})")


def frac(f):
    return ylo + f * H


# Zones anatomiques (fractions de la hauteur totale, proportions enfant :
# yeux ~91-94%, bouche ~85.5-88%)
def zone(name, f0, f1, front_pred, x_split=None):
    buckets = {}
    for loop in mesh.loops:
        w = world[loop.vertex_index]
        if not (frac(f0) <= w.y <= frac(f1)):
            continue
        if not front_pred(w.z):
            continue
        key = "all"
        if x_split is not None:
            key = "gauche" if w.x < x_split else "droite"
        buckets.setdefault(key, []).append(uv_layer[loop.index].uv.copy())
    for key, uvs in sorted(buckets.items()):
        cu = sum(u.x for u in uvs) / len(uvs)
        cv = sum(u.y for u in uvs) / len(uvs)
        print(f"[probe] {name}/{key}: n={len(uvs)} uv=({cu:.4f}, {cv:.4f}) px2048=({cu*2048:.0f}, {(1-cv)*2048:.0f})")
    if not buckets:
        print(f"[probe] {name}: VIDE")


# Détermine le côté avant (signe de z dans la zone tête) : le nez/visage a
# plus de détail que l'arrière du crâne -> côté au max |z| moyen
head = [w for w in world if w.y > frac(0.85)]
front_neg = sum(1 for w in head if w.z < 0)
front_pos = sum(1 for w in head if w.z > 0)
print(f"[probe] tête z<0: {front_neg}, z>0: {front_pos}")
FRONT = (lambda z: z > 0.01) if front_pos >= front_neg else (lambda z: z < -0.01)

zone("yeux", 0.905, 0.945, FRONT, x_split=0.0)
zone("bouche", 0.850, 0.882, FRONT)

# Export CSV des UV par bande (précision finale par filtre couleur, cf.
# scripts/make_face_variants.py)
import os
out_csv = os.path.join(os.path.dirname(argv[0]), "face-uv-bands.csv")
with open(out_csv, "w") as fh:
    fh.write("band,u,v\n")
    for band, f0, f1 in (("eyes", 0.88, 0.955), ("mouth", 0.845, 0.885)):
        for loop in mesh.loops:
            w = world[loop.vertex_index]
            if frac(f0) <= w.y <= frac(f1) and FRONT(w.z):
                uv = uv_layer[loop.index].uv
                fh.write(f"{band},{uv.x:.5f},{uv.y:.5f}\n")
print(f"[probe] CSV: {out_csv}")
