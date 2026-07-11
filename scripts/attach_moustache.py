# Moustache 3D procédurale attachée à l'os de la tête d'un GLB riggé.
# Le volume qu'Hunyuan n'a pas sculpté (octree écrase les petits détails) :
# deux lobes effilés inclinés vers le bas — moustache de morse, gris-blanc.
# Parentée à l'os (bone parenting) : suit toutes les animations.
# Usage : blender --background --python attach_moustache.py -- in.glb out.glb
#         [--forward 0.10] [--down 0.055] [--width 0.10] [--tilt 25]
import math
import sys

import bpy
import mathutils

argv = sys.argv[sys.argv.index("--") + 1 :]


def arg(name, default):
    return float(argv[argv.index(name) + 1]) if name in argv else default


in_glb, out_glb = argv[0], argv[1]
FORWARD = arg("--forward", 0.10)   # distance devant l'os tête (m)
DOWN = arg("--down", 0.055)        # descente sous l'os (m)
WIDTH = arg("--width", 0.10)       # envergure totale (m)
TILT = math.radians(arg("--tilt", 25))  # chute des pointes

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=in_glb)

armature = next(o for o in bpy.data.objects if o.type == "ARMATURE")
head = armature.data.bones.get("mixamorig:Head") or next(
    b for b in armature.data.bones if "Head" in b.name
)
head_world = armature.matrix_world @ head.head_local
print(f"[mous] os tête: {head.name} @ {tuple(round(v, 3) for v in head_world)}")

# Deux lobes : sphères écrasées, inclinées, pointes vers le bas-extérieur
mat = bpy.data.materials.new("Moustache")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.88, 0.86, 0.82, 1)  # gris-blanc
bsdf.inputs["Roughness"].default_value = 0.9

lobes = []
for side in (-1, 1):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=10)
    lobe = bpy.context.active_object
    lobe.name = f"moustache-{'g' if side < 0 else 'd'}"
    lobe.scale = (WIDTH * 0.30, 0.022, 0.030)
    lobe.rotation_euler = (0, side * TILT, 0)
    # Le glTF importé est Z-up Blender : avant = -Y
    lobe.location = (
        head_world.x + side * WIDTH * 0.24,
        head_world.y - FORWARD,
        head_world.z - DOWN,
    )
    lobe.data.materials.append(mat)
    lobes.append(lobe)

bpy.ops.object.select_all(action="DESELECT")
for lobe in lobes:
    lobe.select_set(True)
bpy.ops.object.transform_apply(scale=True, rotation=True)

# Bone parenting : la moustache suit l'os tête dans toutes les animations
for lobe in lobes:
    lobe.parent = armature
    lobe.parent_type = "BONE"
    lobe.parent_bone = head.name
    # compenser le décalage introduit par le bone parenting (origine = queue de l'os)
    lobe.matrix_world = mathutils.Matrix.Translation(lobe.location)

bpy.ops.export_scene.gltf(
    filepath=out_glb,
    export_format="GLB",
    export_animations=True,
    export_animation_mode="NLA_TRACKS",
    export_skins=True,
    export_yup=True,
)
print(f"[mous] exporté: {out_glb}")
