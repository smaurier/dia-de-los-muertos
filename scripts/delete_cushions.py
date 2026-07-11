# Supprime les faces coussins du GLB Hunyuan et calcule les positions Three.js.
# Usage:
#   blender --background --python delete_cushions.py -- <src.glb> <out.glb>
# Sortie console: ligne "POSITIONS_JSON={...}" avec les coords locales Three.js
import sys, json, math
import bpy, bmesh
from mathutils import Vector, bvhtree as BVH

argv = sys.argv[sys.argv.index("--") + 1:]
src_glb, out_glb = argv[:2]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src_glb)

body = max(
    (o for o in bpy.data.objects if o.type == "MESH"),
    key=lambda o: len(o.data.vertices),
)

img = None
for mat in body.data.materials:
    if mat and mat.use_nodes:
        for node in mat.node_tree.nodes:
            if node.type == "TEX_IMAGE" and node.image:
                img = node.image
                break
    if img:
        break
if img is None:
    raise RuntimeError("Aucune texture trouvée")

W, H = img.size
px_flat = list(img.pixels)
pixels = [px_flat[i : i + 4] for i in range(0, len(px_flat), 4)]


def sample_rgb(u, v):
    x = int(max(0, min(W - 1, u * W)))
    y = int(max(0, min(H - 1, v * H)))
    return pixels[y * W + x][:3]


def is_cushion(r, g, b):
    mx = max(r, g, b)
    mn = min(r, g, b)
    if mx < 0.05:
        return False
    sat = (mx - mn) / (mx + 1e-6)
    d = mx - mn + 1e-6
    if mx == r:
        hue = (60 * ((g - b) / d)) % 360
    elif mx == g:
        hue = 60 * ((b - r) / d) + 120
    else:
        hue = 60 * ((r - g) / d) + 240
    colored = (hue < 32 or hue > 320 or 230 < hue < 320) and sat > 0.28 and mx > 0.35
    cream = mx > 0.72 and sat < 0.38 and mn > 0.52
    return colored or cream


# ─── Raycasts AVANT suppression (bosses coussins encore présentes) ────────────
import mathutils

bm_bvh = bmesh.new()
bm_bvh.from_mesh(body.data)
bvh = mathutils.bvhtree.BVHTree.FromBMesh(bm_bvh)


def seat_top(x, y):
    hit = bvh.ray_cast(Vector((x, y, 2.0)), Vector((0, 0, -1)))
    return hit[0].z if hit[0] else None


def backrest_y(x, z, from_y, direction):
    hit = bvh.ray_cast(Vector((x, from_y, z)), Vector((0, direction, 0)))
    return hit[0].y if hit[0] else None


def wall_x(z_ray, zh, from_x, direction):
    hit = bvh.ray_cast(Vector((from_x, z_ray, zh)), Vector((direction, 0, 0)))
    return hit[0].x if hit[0] else None


probe = {round(y, 2): seat_top(0.5, y) for y in [i / 10 for i in range(-7, 8)]}
valid = {y: z for y, z in probe.items() if z is not None}
crest_y = max(valid, key=lambda y: valid[y])
plateau = [y for y, z in valid.items() if z < 0.08]
seat_y = sum(plateau) / len(plateau)
back_dir = 1 if crest_y > seat_y else -1
UP = math.radians(78)
lean = UP * (1 if back_dir > 0 else -1)

sx = 0.66
st = seat_top(sx, seat_y) or 0.0
by_v = backrest_y(sx, st + 0.12, seat_y, back_dir) or 0.0
violet_pos = [sx, by_v - back_dir * 0.085, st + 0.15]
violet_rot = [lean, 0.0, 0.0]

sx = -0.36
st = seat_top(sx, seat_y) or 0.0
by_c = backrest_y(sx, st + 0.12, seat_y, back_dir) or 0.0
creme_pos = [sx, by_c - back_dir * 0.085, st + 0.15]
creme_rot = [lean, 0.0, math.radians(18)]

vprobe = {round(y, 2): seat_top(-0.65, y) for y in [i / 10 for i in range(-7, 8)]}
vvalid = {y: z for y, z in vprobe.items() if z is not None and z < 0.12}
vy = min(vvalid, key=lambda y: abs(y + back_dir * 0.35)) if vvalid else -back_dir * 0.35
st_v = seat_top(-0.65, vy) or 0.0
bx = wall_x(vy, st_v + 0.12, -0.2, -1)
if bx is None:
    bx = -0.95
rouge_pos = [bx + 0.07, vy, st_v + 0.15]
rouge_rot = [0.0, -UP, 0.0]

bm_bvh.free()

positions = {
    "rouge":  {"pos": rouge_pos,  "rot": rouge_rot},
    "creme":  {"pos": creme_pos,  "rot": creme_rot},
    "violet": {"pos": violet_pos, "rot": violet_rot},
}
print("POSITIONS_JSON=" + json.dumps(positions, indent=2))

# ─── Suppression des faces coussins ──────────────────────────────────────────
bpy.context.view_layer.objects.active = body
body.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
bm = bmesh.from_edit_mesh(body.data)
bm.faces.ensure_lookup_table()
uv_lyr = bm.loops.layers.uv.active

found = 0
for face in bm.faces:
    u = sum(l[uv_lyr].uv.x for l in face.loops) / len(face.loops)
    v = sum(l[uv_lyr].uv.y for l in face.loops) / len(face.loops)
    face.select = is_cushion(*sample_rgb(u, v))
    if face.select:
        found += 1

print(f"[del] {found} faces coussins sélectionnées")
bmesh.update_edit_mesh(body.data)
bpy.ops.mesh.delete(type="FACE")
bpy.ops.object.mode_set(mode="OBJECT")

# Recalcul des normales (trous ouverts → normales des bords maintenant correctes)
body.data.calc_normals_split()

bpy.ops.export_scene.gltf(filepath=out_glb, export_format="GLB", export_yup=True)
print(f"[del] exporté: {out_glb}")
