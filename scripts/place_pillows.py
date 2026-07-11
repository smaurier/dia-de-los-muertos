# Fusionne les coussins-props DANS le GLB du canapé, posés par RAYCAST contre
# le mesh réel (assise + dossier) — fini les coordonnées devinées qui les
# enfonçaient dans les volumes.
# Usage : blender --background --python place_pillows.py -- canape.glb rouge.glb creme.glb violet.glb out.glb [--render prefix]
import math
import sys

import bpy
import mathutils

argv = sys.argv[sys.argv.index("--") + 1 :]
canape_glb, rouge_glb, creme_glb, violet_glb, out_glb = argv[:5]
render_prefix = argv[argv.index("--render") + 1] if "--render" in argv else None

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=canape_glb)
sofa = max((o for o in bpy.data.objects if o.type == "MESH"), key=lambda o: len(o.data.vertices))

# BVH pour raycasts (espace objet = espace monde ici, transform identité)
import bmesh
bm = bmesh.new()
bm.from_mesh(sofa.data)
bvh = mathutils.bvhtree.BVHTree.FromBMesh(bm)


def seat_top(x, y):
    """Descend un rayon : z du dessus de l'assise en (x, y)."""
    hit = bvh.ray_cast(mathutils.Vector((x, y, 2.0)), mathutils.Vector((0, 0, -1)))
    return hit[0].z if hit[0] else None


def backrest_y(x, z, from_y, direction):
    """Rayon horizontal : y de la face du dossier au niveau z."""
    hit = bvh.ray_cast(mathutils.Vector((x, from_y, z)), mathutils.Vector((0, direction, 0)))
    return hit[0].y if hit[0] else None


def wall_x(z_ray, zh, from_x, direction):
    hit = bvh.ray_cast(mathutils.Vector((from_x, z_ray, zh)), mathutils.Vector((direction, 0, 0)))
    return hit[0].x if hit[0] else None


def load_pillow(path, name):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    obj = next(o for o in set(bpy.data.objects) - before if o.type == "MESH")
    obj.name = name
    # glTF importe en mode quaternion : rotation_euler serait IGNORÉ silencieusement
    obj.rotation_mode = "XYZ"
    # normalise : ratio de la ref = coussin ~0.45-0.50 m pour un canapé de
    # 2,9 m → 0.29 unité modèle (~0.52 m en scène). Plus grand = oreiller.
    w = max(obj.dimensions)
    s = 0.29 / w
    obj.scale = (s, s, s)
    return obj


# Sonde fine du wing principal (x=0.5) : l'assise = plateau bas, le dossier =
# crête haute. back_dir pointe de l'assise vers le dossier.
probe = {round(y, 2): seat_top(0.5, y) for y in [i / 10 for i in range(-7, 8)]}
print(f"[place] sonde z(0.5, y): { {k: (round(v, 3) if v is not None else None) for k, v in probe.items()} }")
valid = {y: z for y, z in probe.items() if z is not None}
crest_y = max(valid, key=lambda y: valid[y])   # crête du dossier
plateau = [y for y, z in valid.items() if z < 0.08]  # plateau d'assise
seat_y = sum(plateau) / len(plateau)           # milieu du plateau (rayon sûr)
back_dir = 1 if crest_y > seat_y else -1
print(f"[place] assise y≈{seat_y:.2f} (plateau {min(plateau)}..{max(plateau)}), crête y={crest_y:.2f}, back_dir {back_dir}")
# Disposition de la ref angle-canape-ref-01 : rouge sur le RETOUR, crème au
# creux du L, violet au bout du segment principal — tous DROITS (78°) contre
# les dossiers, motif de face, sans vrille.
UP = math.radians(78)
lean = UP * (1 if back_dir > 0 else -1)

# Les positions ci-dessous SUPERPOSENT les bosses des anciens coussins bakés
# dans la géométrie (localisées au rendu rasant : x≈-0.35, x≈+0.65, retour
# y≈-0.30) — la texture est nettoyée mais le relief reste, on le recouvre.
# ── Coussin VIOLET : bosse du bout du wing principal ─────────────────────────
violet = load_pillow(violet_glb, "coussin-violet")
sx = 0.66
st = seat_top(sx, seat_y)
by = backrest_y(sx, st + 0.12, seat_y, back_dir)
violet.rotation_euler = (lean, 0, 0)
violet.location = (sx, by - back_dir * 0.085, st + 0.15)
print(f"[place] violet: seat z={st:.3f}, dossier y={by:.3f}")

# ── Coussin CRÈME : bosse côté creux du L ────────────────────────────────────
creme = load_pillow(creme_glb, "coussin-creme")
sx = -0.36
st = seat_top(sx, seat_y)
by = backrest_y(sx, st + 0.12, seat_y, back_dir)
creme.rotation_euler = (lean, 0, math.radians(18))
creme.location = (sx, by - back_dir * 0.085, st + 0.15)
print(f"[place] creme: seat z={st:.3f}, dossier y={by:.3f}")

# ── Coussin ROUGE : retour, droit contre son dossier extérieur ──────────────
rouge = load_pillow(rouge_glb, "coussin-rouge")
vprobe = {round(y, 2): seat_top(-0.65, y) for y in [i / 10 for i in range(-7, 8)]}
vvalid = {y: z for y, z in vprobe.items() if z is not None and z < 0.12}
vy = min(vvalid, key=lambda y: abs(y + back_dir * 0.35)) if vvalid else -back_dir * 0.35
st_v = seat_top(-0.65, vy)
bx = wall_x(vy, st_v + 0.12, -0.2, -1)
if bx is None:
    bx = -0.95
rouge.rotation_euler = (0, -UP, 0)
rouge.location = (bx + 0.07, vy, st_v + 0.15)
print(f"[place] rouge: seat z={st_v:.3f} (y={vy:.2f}), dossier x={bx:.3f}")

# ── Rendus de vérification ───────────────────────────────────────────────────
if render_prefix:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 900
    scene.render.resolution_y = 620
    w = bpy.data.worlds.new("W")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.35, 0.35, 0.38, 1)
    scene.world = w
    sun = bpy.data.objects.new("S", bpy.data.lights.new("S", "SUN"))
    sun.data.energy = 3.5
    sun.rotation_euler = (math.radians(50), math.radians(10), math.radians(30))
    scene.collection.objects.link(sun)
    cam = bpy.data.objects.new("C", bpy.data.cameras.new("C"))
    scene.collection.objects.link(cam)
    scene.camera = cam
    views = {
        "34": ((1.9, 2.2, 1.5), (math.radians(60), 0, math.radians(140))),
        "top": ((0, 0, 3.2), (0, 0, 0)),
    }
    for label, (loc, rot) in views.items():
        cam.location = loc
        cam.rotation_euler = rot
        scene.render.filepath = f"{render_prefix}-{label}.png"
        bpy.ops.render.render(write_still=True)
        print(f"[place] rendu {scene.render.filepath}")

bpy.ops.export_scene.gltf(filepath=out_glb, export_format="GLB", export_yup=True)
print(f"[place] exporté: {out_glb}")
