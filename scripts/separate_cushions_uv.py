# Sépare les coussins du canapé Hunyuan en deux objets par coussin :
#   coussin-X-front : faces visibles → UV planar [0,1]² + motif PNG dans Three.js
#   coussin-X-sides : autres faces  → solid bg-color dans Three.js
# Usage :
#   blender --background --python separate_cushions_uv.py -- <src.glb> <out.glb> [clean_tex.png]
import sys, os, bpy, bmesh
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
src_glb, out_glb = argv[:2]
clean_tex_path = argv[2] if len(argv) > 2 else ""

FRONT_THR = 0.45
PUSH_OUT  = 0.004
NAMES     = ["rouge", "creme", "violet"]

# ─── Chargement ──────────────────────────────────────────────────────────────
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src_glb)

body = max(
    (o for o in bpy.data.objects if o.type == "MESH"),
    key=lambda o: len(o.data.vertices),
)

# ─── Texture du canapé (détection couleur coussins) ──────────────────────────
img = None
for mat in body.data.materials:
    if mat and mat.use_nodes:
        for node in mat.node_tree.nodes:
            if node.type == "TEX_IMAGE" and node.image:
                img = node.image
                break
    if img: break
if img is None:
    raise RuntimeError("Aucune texture trouvée")

W, H = img.size
px_flat = list(img.pixels)
pixels  = [px_flat[i:i+4] for i in range(0, len(px_flat), 4)]

def sample_rgb(u, v):
    x = int(max(0, min(W-1, u*W)))
    y = int(max(0, min(H-1, v*H)))
    return pixels[y*W + x][:3]

def is_cushion(r, g, b):
    mx = max(r, g, b); mn = min(r, g, b)
    if mx < 0.05: return False
    sat = (mx - mn) / (mx + 1e-6)
    d   = mx - mn + 1e-6
    if   mx == r: hue = (60 * ((g-b)/d)) % 360
    elif mx == g: hue = 60 * ((b-r)/d) + 120
    else:         hue = 60 * ((r-g)/d) + 240
    colored = (hue < 32 or hue > 320 or 230 < hue < 320) and sat > 0.28 and mx > 0.35
    cream   = mx > 0.72 and sat < 0.38 and mn > 0.52
    return colored or cream

# ─── Phase 1 : sélectionner faces coussins, séparer du body ──────────────────
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
    if face.select: found += 1

print(f"[sep] {found} faces coussins détectées")
bmesh.update_edit_mesh(body.data)
bpy.ops.mesh.separate(type="SELECTED")
bpy.ops.object.mode_set(mode="OBJECT")

# L'objet coussins est le nouveau (pas le body)
all_mesh = lambda: [o for o in bpy.data.objects if o.type == "MESH"]
cushions_merged = next(o for o in all_mesh() if o != body)

# ─── Phase 2 : séparer en îles connexes, garder top 3 ───────────────────────
for o in bpy.data.objects: o.select_set(False)
cushions_merged.select_set(True)
bpy.context.view_layer.objects.active = cushions_merged
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.separate(type="LOOSE")
bpy.ops.object.mode_set(mode="OBJECT")

parts = [o for o in all_mesh() if o != body]
print(f"[sep] {len(parts)} îles connexes")
parts.sort(key=lambda o: len(o.data.polygons), reverse=True)
for o in parts[3:]:
    bpy.data.objects.remove(o, do_unlink=True)
cushion_parts = list(parts[:3])
print(f"[sep] top 3 : {[len(o.data.polygons) for o in cushion_parts]} faces")

# ─── Phase 3 : par coussin, séparer front / sides ────────────────────────────
# D'abord collecter toutes les infos (dom_normal + front_indices) AVANT de modifier
cushion_info = []
for co in cushion_parts:
    bm_c = bmesh.new()
    bm_c.from_mesh(co.data)
    bm_c.faces.ensure_lookup_table()
    dom = Vector((0,0,0))
    for f in bm_c.faces: dom += Vector(f.normal)
    dom = dom.normalized()
    # Utiliser f.index (stable entre instances bmesh)
    front_idx = {f.index for f in bm_c.faces if f.normal.dot(dom) > FRONT_THR}
    bm_c.free()
    cushion_info.append((co, dom, front_idx))
    print(f"[sep] {co.name}: dom={dom} front={len(front_idx)}/{len(co.data.polygons)}")

# Maintenant séparer
for i, (co, dom, front_idx) in enumerate(cushion_info):
    label = NAMES[i]
    for o in bpy.data.objects: o.select_set(False)
    co.select_set(True)
    bpy.context.view_layer.objects.active = co

    # Snapshot des objets avant separate
    before_objs = set(bpy.data.objects)

    bpy.ops.object.mode_set(mode="EDIT")
    bm_e = bmesh.from_edit_mesh(co.data)
    bm_e.faces.ensure_lookup_table()
    for f in bm_e.faces:
        f.select = (f.index in front_idx)
    n_sel = sum(1 for f in bm_e.faces if f.select)
    print(f"[sep] coussin-{label}: {n_sel} faces front sélectionnées")
    bmesh.update_edit_mesh(co.data)
    bpy.ops.mesh.separate(type="SELECTED")
    bpy.ops.object.mode_set(mode="OBJECT")

    # Le nouvel objet = front (les faces sélectionnées)
    after_objs = set(bpy.data.objects)
    new_objs   = after_objs - before_objs
    if not new_objs:
        print(f"[sep] WARN: aucun front séparé pour coussin-{label}")
        co.name = f"coussin-{label}-sides"
        continue

    front_obj = new_objs.pop()
    front_obj.name = f"coussin-{label}-front"
    co.name        = f"coussin-{label}-sides"

    # --- UV planar [0,1]² sur le front ---
    for o in bpy.data.objects: o.select_set(False)
    front_obj.select_set(True)
    bpy.context.view_layer.objects.active = front_obj

    bm_f = bmesh.new()
    bm_f.from_mesh(front_obj.data)
    bm_f.faces.ensure_lookup_table()

    up = Vector((0,0,1))
    if abs(dom.dot(up)) > 0.9: up = Vector((1,0,0))
    u_axis = dom.cross(up).normalized()
    v_axis = dom.cross(u_axis).normalized()

    all_u = [l.vert.co.dot(u_axis) for f in bm_f.faces for l in f.loops]
    all_v = [l.vert.co.dot(v_axis) for f in bm_f.faces for l in f.loops]
    u0, u1 = min(all_u), max(all_u)
    v0, v1 = min(all_v), max(all_v)
    ur = u1 - u0 + 1e-9
    vr = v1 - v0 + 1e-9

    uv_lyr_f = bm_f.loops.layers.uv.active or bm_f.loops.layers.uv.new("UVMap")
    for f in bm_f.faces:
        for loop in f.loops:
            u = (loop.vert.co.dot(u_axis) - u0) / ur
            v = (loop.vert.co.dot(v_axis) - v0) / vr
            loop[uv_lyr_f].uv = (u, v)

    # Pousser vers l'extérieur (anti z-fight)
    for vert in bm_f.verts:
        vert.co += dom * PUSH_OUT

    bm_f.to_mesh(front_obj.data)
    bm_f.free()
    front_obj.data.update()
    print(f"[sep] coussin-{label}-front: UV [0,1]² ok ({len(front_obj.data.polygons)} faces)")

# ─── Texture nettoyée sur le body ────────────────────────────────────────────
if clean_tex_path and os.path.exists(clean_tex_path):
    clean_img = bpy.data.images.load(clean_tex_path)
    for mat in body.data.materials:
        if mat and mat.use_nodes:
            for node in mat.node_tree.nodes:
                if node.type == "TEX_IMAGE":
                    node.image = clean_img
                    break
    print("[sep] body texture nettoyée injectée")
else:
    print(f"[sep] WARN: texture nettoyée non trouvée ({clean_tex_path})")

# ─── Export ──────────────────────────────────────────────────────────────────
bpy.ops.export_scene.gltf(filepath=out_glb, export_format="GLB", export_yup=True)
final = [o.name for o in bpy.data.objects if o.type == "MESH"]
print(f"[sep] exporté: {out_glb}")
print(f"[sep] objets finaux: {final}")
