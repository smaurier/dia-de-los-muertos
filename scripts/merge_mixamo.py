# Merge Mixamo : FBX de base (With Skin) + FBX d'animations -> un GLB multi-clips,
# texture baseColor réappliquée (Mixamo la perd), metallic 0.
# Usage :
#   blender --background --python scripts/merge_mixamo.py -- base.fbx anim1.fbx [anim2.fbx ...] texture.png output.glb
#   [--height 1.15] [--fix-dress 0.05:0.75]  (0.05:0.75 = fractions de hauteur pour la zone jupe)
import os
import re
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :]
if len(argv) < 3:
    raise SystemExit("Usage: merge_mixamo.py -- base.fbx [anims...] texture.png output.glb [--height 1.15] [--fix-dress 0.05:0.75]")

HEIGHT = 1.15
if "--height" in argv:
    i = argv.index("--height")
    HEIGHT = float(argv[i + 1])
    argv = argv[:i] + argv[i + 2 :]

# --fix-dress lo:hi : fractions de la hauteur totale définissant la zone jupe
# ex: 0.05:0.75 = de 5% à 75% de la hauteur -> redirige poids jambes vers Hips
FIX_DRESS: tuple[float, float] | None = None
if "--fix-dress" in argv:
    i = argv.index("--fix-dress")
    lo, hi = argv[i + 1].split(":")
    FIX_DRESS = (float(lo), float(hi))
    argv = argv[:i] + argv[i + 2 :]

base_fbx = argv[0]
texture_png = argv[-2]
output_glb = argv[-1]
anim_fbxs = argv[1:-2]


def clip_name(path: str) -> str:
    stem = os.path.splitext(os.path.basename(path))[0]
    return re.sub(r"[^a-z0-9]+", "-", stem.lower()).strip("-")


bpy.ops.wm.read_factory_settings(use_empty=True)

# Base : mesh + armature + skin + son animation
bpy.ops.import_scene.fbx(filepath=base_fbx)
armature = next(o for o in bpy.data.objects if o.type == "ARMATURE")
# Le vrai perso = le mesh le plus dense ; Hunyuan laisse trainer une Icosphere
# parasite qui a survécu à tout le pipeline -> purge.
meshes = [o for o in bpy.data.objects if o.type == "MESH"]
mesh = max(meshes, key=lambda o: len(o.data.vertices))
for stray in meshes:
    if stray is not mesh:
        print(f"[merge] mesh parasite supprimé : {stray.name} ({len(stray.data.vertices)} verts)")
        bpy.data.objects.remove(stray, do_unlink=True)
if armature.animation_data and armature.animation_data.action:
    armature.animation_data.action.name = clip_name(base_fbx)

# Animations : importer, récupérer l'action, jeter les objets dupliqués
for fbx in anim_fbxs:
    known_actions = set(bpy.data.actions)
    known_objects = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=fbx)
    new_actions = set(bpy.data.actions) - known_actions
    print(f"[merge] {fbx} -> {len(new_actions)} action(s)")
    for action in new_actions:
        action.name = clip_name(fbx)
        action.use_fake_user = True
        print(f"[merge]   action: {action.name} range {action.frame_range[:]}")
    for obj in set(bpy.data.objects) - known_objects:
        bpy.data.objects.remove(obj, do_unlink=True)

# Clips de déplacement : Mixamo y met du root motion (les hanches avancent
# puis se téléportent au bouclage). Le jeu déplace déjà le perso par code ->
# on supprime la translation de voyage : sur les fcurves location des Hips,
# on retire l'axe au drift net maximal (l'axe d'avance), on garde le reste
# (rebond vertical, balancement).
IN_PLACE = {"walking", "start-walking", "happy-walk"}


def iter_fcurves(action):
    """Blender ≥5 : actions en couches (layers/strips/channelbags) ;
    l'ancien Action.fcurves n'existe plus. Rend (conteneur, fcurve)."""
    if hasattr(action, "fcurves"):
        for fc in action.fcurves:
            yield action.fcurves, fc
        return
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for fc in bag.fcurves:
                    yield bag.fcurves, fc


for action in bpy.data.actions:
    if action.name not in IN_PLACE:
        continue
    hips_loc = [
        (owner, fc) for owner, fc in iter_fcurves(action)
        if fc.data_path.endswith(".location") and "Hips" in fc.data_path
    ]
    if not hips_loc:
        continue
    start, end = action.frame_range
    drifts = [abs(fc.evaluate(end) - fc.evaluate(start)) for _, fc in hips_loc]
    owner, travel = hips_loc[drifts.index(max(drifts))]
    print(f"[merge] {action.name}: root motion retiré (axe {travel.array_index}, drift {max(drifts):.3f})")
    owner.remove(travel)

# Un track NLA par action sur l'armature de base -> l'export glTF écrit
# chaque track comme un clip nommé.
if armature.animation_data is None:
    armature.animation_data_create()
armature.animation_data.action = None
for action in bpy.data.actions:
    track = armature.animation_data.nla_tracks.new()
    track.name = action.name
    track.strips.new(action.name, int(action.frame_range[0]), action)
    track.mute = True

# Texture : Mixamo perd la baseColor -> on la rebranche + metallic 0
img = bpy.data.images.load(os.path.abspath(texture_png))
img.pack()
for mat in mesh.data.materials:
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    tex_node = mat.node_tree.nodes.new("ShaderNodeTexImage")
    tex_node.image = img
    mat.node_tree.links.new(bsdf.inputs["Base Color"], tex_node.outputs["Color"])
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = 0.9

# Normalisation bakée : hauteur cible + pieds au sol, portée par le node
# armature (transform NON appliqué : les translations d'animation des bones
# vivent dans l'espace local et suivent l'échelle du node — three.js applique
# le tout uniformément).
TARGET_HEIGHT = HEIGHT  # --height (défaut 1,15 enfant ; hauteur BIND pose = T-pose)

bpy.context.view_layer.update()
import mathutils
mins = mathutils.Vector((1e9,) * 3)
maxs = mathutils.Vector((-1e9,) * 3)
for c in mesh.bound_box:
    w = mesh.matrix_world @ mathutils.Vector(c)
    mins = mathutils.Vector(map(min, mins, w))
    maxs = mathutils.Vector(map(max, maxs, w))
height = maxs.z - mins.z if (maxs.z - mins.z) > (maxs.y - mins.y) else maxs.y - mins.y
s = TARGET_HEIGHT / height
root = armature if mesh.parent == armature else mesh.parent or armature
root.scale = (root.scale[0] * s, root.scale[1] * s, root.scale[2] * s)
bpy.context.view_layer.update()
# Pieds au sol : recalcul du min après échelle (axe Z monde Blender)
zmin = 1e9
for c in mesh.bound_box:
    w = mesh.matrix_world @ mathutils.Vector(c)
    zmin = min(zmin, w.z)
root.location.z -= zmin
print(f"[merge] height {height:.3f} -> scale {s:.4f}, ground offset {-zmin:.3f}")

# ── Fix robe/jupe : redistribue les poids des bones de jambe vers Hips ────────
# Évite le stretching de la jupe pendant walk / stand-to-sit.
# Principe : dans la zone jupe (fraction de hauteur configurable), tous les
# vertex dont les bones de jambe représentent > 1% du poids voient ce poids
# transféré vers mixamorig:Hips. Les jambes sous la robe se déforment alors
# "librement" mais sont masquées par le tissu.
if FIX_DRESS is not None:
    LEG_BONES = {
        "mixamorig:LeftUpLeg", "mixamorig:RightUpLeg",
        "mixamorig:LeftLeg",   "mixamorig:RightLeg",
        "mixamorig:LeftFoot",  "mixamorig:RightFoot",
        "mixamorig:LeftToeBase", "mixamorig:RightToeBase",
    }
    HIPS_NAME = "mixamorig:Hips"

    vgs = mesh.vertex_groups
    leg_idx  = {vg.index for vg in vgs if vg.name in LEG_BONES}
    hips_vg  = next((vg for vg in vgs if vg.name == HIPS_NAME), None)
    if hips_vg is None:
        print(f"[fix-dress] WARN: bone {HIPS_NAME!r} introuvable, skip")
    else:
        bpy.context.view_layer.update()
        # Hauteur effective après normalisation
        import mathutils as _mu
        mins2 = _mu.Vector((1e9,)*3); maxs2 = _mu.Vector((-1e9,)*3)
        for c in mesh.bound_box:
            w = mesh.matrix_world @ _mu.Vector(c)
            mins2 = _mu.Vector(map(min, mins2, w))
            maxs2 = _mu.Vector(map(max, maxs2, w))
        h_total = maxs2.z - mins2.z
        z_lo = mins2.z + FIX_DRESS[0] * h_total
        z_hi = mins2.z + FIX_DRESS[1] * h_total

        fixed = 0
        for vert in mesh.data.vertices:
            wco = mesh.matrix_world @ vert.co
            if not (z_lo <= wco.z <= z_hi):
                continue
            leg_w = sum(ge.weight for ge in vert.groups if ge.group in leg_idx)
            if leg_w < 0.01:
                continue
            for ge in vert.groups:
                if ge.group in leg_idx:
                    vgs[ge.group].remove([vert.index])
            hips_w = next((ge.weight for ge in vert.groups if ge.group == hips_vg.index), 0.0)
            hips_vg.add([vert.index], min(1.0, hips_w + leg_w), "REPLACE")
            fixed += 1
        print(f"[fix-dress] {fixed} vertex(s) redirigés vers Hips (zone z [{z_lo:.3f}, {z_hi:.3f}])")

bpy.ops.export_scene.gltf(
    filepath=output_glb,
    export_format="GLB",
    export_animations=True,
    export_animation_mode="NLA_TRACKS",
    export_skins=True,
    export_yup=True,
)
print(f"Exported {output_glb} with clips: {[a.name for a in bpy.data.actions]}")
