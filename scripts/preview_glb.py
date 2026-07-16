# Rendu preview d'un GLB (vérif texture) : 2 vues face/dos sur fond neutre.
# Usage : blender --background --python scripts/preview_glb.py -- input.glb out_prefix [map_override.png]
#
# Strategy : the GLB skeleton is a Mixamo rig exported without a true Armature
# modifier — Blender renders the un-deformed bind mesh (collapsed near origin).
# We instead render the atlas texture on a subdivided plane for a fast colour
# check, then attempt a 3-D framing using armature bone world-positions.
import math
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :]
input_glb, out_prefix = argv[0], argv[1]
map_override = argv[2] if len(argv) > 2 else None

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=input_glb)

if map_override:
    override_img = bpy.data.images.load(map_override)
    for obj in bpy.data.objects:
        if obj.type != "MESH" or not obj.data.materials:
            continue
        for mat in obj.data.materials:
            if mat and mat.use_nodes:
                for node in mat.node_tree.nodes:
                    if node.type == "TEX_IMAGE":
                        node.image = override_img

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 768
scene.render.resolution_y = 1024

world = bpy.data.worlds.new("W")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.25, 0.25, 0.28, 1)
scene.world = world

import mathutils

# ── Framing using bone empty world positions ──────────────────────────────────
# glTF importer (Blender 5.x) exports Mixamo joints as EMPTY objects.
# Their world matrix translation gives the true character silhouette in
# Blender space (Z-up after Y-up → Z-up conversion).
bone_empties = [
    o for o in scene.objects
    if o.type == "EMPTY" and o.name not in ("Armature",)
    and "mixamo" in o.name.lower()
]
mesh_objs = [o for o in scene.objects if o.type == "MESH"]

mins = mathutils.Vector((1e9,) * 3)
maxs = mathutils.Vector((-1e9,) * 3)

if bone_empties:
    for obj in bone_empties:
        w = obj.matrix_world.translation
        mins = mathutils.Vector(map(min, mins, w))
        maxs = mathutils.Vector(map(max, maxs, w))
else:
    for obj in mesh_objs:
        for c in obj.bound_box:
            w = obj.matrix_world @ mathutils.Vector(c)
            mins = mathutils.Vector(map(min, mins, w))
            maxs = mathutils.Vector(map(max, maxs, w))

center = (mins + maxs) / 2
extents = maxs - mins
size = max(extents)  # largest dimension (arm span or height)

print(f"[preview] center={center[:]}, extents={extents[:]}, size={size:.4f}")

# Sun light
sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN"))
sun.data.energy = 3
sun.rotation_euler = (math.radians(50), 0, math.radians(30))
scene.collection.objects.link(sun)

cam_data = bpy.data.cameras.new("Cam")
cam_data.clip_start = size * 0.001
cam_data.clip_end = size * 200.0
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

# In Blender (after glTF Y→Z conversion):
#   X = lateral (arm span), Z = up/down (height), Y = depth (front = -Y)
# The character height (Z) is typically smaller than arm span (X) for T-pose,
# so `size` = arm span. We offset camera up by half the Z extent to center on torso.
z_center = center.z  # already correct midpoint
z_half = extents.z / 2

for label, angle in (("face", 0.0), ("dos", math.pi)):
    d = size * 1.6
    cam.location = (
        center.x + d * math.sin(angle),
        center.y - d * math.cos(angle),
        z_center + z_half * 0.2,  # slight upward offset to center torso in frame
    )
    target = mathutils.Vector((center.x, center.y, z_center))
    direction = target - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = f"{out_prefix}-{label}.png"
    bpy.ops.render.render(write_still=True)
    print(f"rendered {scene.render.filepath}")
