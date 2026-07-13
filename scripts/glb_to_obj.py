"""Convert GLB to OBJ for Mixamo upload (strips skeleton)."""
import bpy, sys

args = sys.argv[sys.argv.index("--") + 1:]
src = args[0]
dst = args[1]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)

# Remove armatures
for obj in list(bpy.data.objects):
    if obj.type == 'ARMATURE':
        bpy.data.objects.remove(obj, do_unlink=True)

# Clear parent but keep transform for mesh objects
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)

bpy.ops.wm.obj_export(filepath=dst)
print(f"Exported OBJ: {dst}")
