# Rendu preview d'un GLB (vérif texture) : 2 vues face/dos sur fond neutre.
# Usage : blender --background --python scripts/preview_glb.py -- input.glb out_prefix [map_override.png]
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
scene.world = bpy.data.worlds.new("W")
scene.world.use_nodes = True
scene.world.node_tree.nodes["Background"].inputs[0].default_value = (0.25, 0.25, 0.28, 1)

# Cadrage sur la bbox de l'objet importé
import mathutils
mins = mathutils.Vector((1e9,) * 3)
maxs = mathutils.Vector((-1e9,) * 3)
for obj in scene.objects:
    if obj.type == "MESH":
        for c in obj.bound_box:
            w = obj.matrix_world @ mathutils.Vector(c)
            mins = mathutils.Vector(map(min, mins, w))
            maxs = mathutils.Vector(map(max, maxs, w))
center = (mins + maxs) / 2
size = max(maxs - mins)

sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN"))
sun.data.energy = 3
sun.rotation_euler = (math.radians(50), 0, math.radians(30))
scene.collection.objects.link(sun)

cam = bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam"))
scene.collection.objects.link(cam)
scene.camera = cam

for label, angle in (("face", 0.0), ("dos", math.pi)):
    d = size * 1.9
    cam.location = (center.x + d * math.sin(angle), center.y - d * math.cos(angle), center.z + size * 0.15)
    direction = center - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = f"{out_prefix}-{label}.png"
    bpy.ops.render.render(write_still=True)
    print(f"rendered {scene.render.filepath}")
