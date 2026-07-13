"""Merge multiple Mixamo FBX (same rig) into one GLB with named actions."""
import bpy, sys, os

args = sys.argv[sys.argv.index("--") + 1:]
fbx_dir = args[0]
out_glb  = args[1]

bpy.ops.wm.read_factory_settings(use_empty=True)

fbx_files = sorted([f for f in os.listdir(fbx_dir) if f.lower().endswith(".fbx")])
print(f"Found {len(fbx_files)} FBX: {fbx_files}")

main_armature = None
main_mesh     = None

for i, fbx in enumerate(fbx_files):
    clip_name = os.path.splitext(fbx)[0]
    path = os.path.join(fbx_dir, fbx)

    # Actions avant import
    before = set(a.name for a in bpy.data.actions)
    bpy.ops.import_scene.fbx(filepath=path, use_anim=True)
    after  = set(a.name for a in bpy.data.actions)
    new_actions = after - before

    # Renommer la/les nouvelles actions
    for aname in new_actions:
        bpy.data.actions[aname].name = clip_name
        print(f"  Renamed action '{aname}' → '{clip_name}'")

    # Récupérer les objets importés
    imported_arms   = [o for o in bpy.context.selected_objects if o.type == 'ARMATURE']
    imported_meshes = [o for o in bpy.context.selected_objects if o.type == 'MESH']

    if i == 0:
        # Premier import : garder comme référence
        main_armature = imported_arms[0] if imported_arms else None
        main_mesh     = imported_meshes[0] if imported_meshes else None
    else:
        # Imports suivants : supprimer les doublons (action déjà dans bpy.data.actions)
        for obj in imported_arms + imported_meshes:
            bpy.data.objects.remove(obj, do_unlink=True)

    bpy.ops.object.select_all(action='DESELECT')

print(f"Final actions: {[a.name for a in bpy.data.actions]}")

# Export GLB
os.makedirs(os.path.dirname(out_glb), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=out_glb,
    export_format='GLB',
    export_animations=True,
    export_nla_strips=False,
    export_def_bones=True,
    export_morph=False,
)
print(f"SAVED: {out_glb}")
