import bpy, sys
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=r"C:\Users\sylva\Documents\projects\dia-de-los-muertos\public\models\characters\base-01.glb")
arm  = next((o for o in bpy.data.objects if o.type == 'ARMATURE'), None)
mesh = next((o for o in bpy.data.objects if o.type == 'MESH'), None)
if arm:
    print(f"ARMATURE scale={arm.scale[:]}, loc={arm.location[:]}")
if mesh:
    print(f"MESH scale={mesh.scale[:]}")
    ys = [v.co.y for v in mesh.data.vertices]
    print(f"Height Y range: {min(ys):.3f} → {max(ys):.3f}  (height={max(ys)-min(ys):.3f})")
