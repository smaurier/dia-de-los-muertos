"""Mirror left arm to fix missing/deformed right arm on Hunyuan mesh."""
import bpy, sys, bmesh

args = sys.argv[sys.argv.index("--") + 1:]
src = args[0]
dst = args[1]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)

# Trouver le mesh principal
mesh_obj = next((o for o in bpy.data.objects if o.type == 'MESH'), None)
if not mesh_obj:
    print("ERROR: no mesh found")
    sys.exit(1)

print(f"Mesh: {mesh_obj.name}, verts: {len(mesh_obj.data.vertices)}")

# Passer en edit mode pour voir les bounds
bpy.context.view_layer.objects.active = mesh_obj
mesh_obj.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')

bm = bmesh.from_edit_mesh(mesh_obj.data)
xs = [v.co.x for v in bm.verts]
print(f"X range: {min(xs):.2f} → {max(xs):.2f}")
bpy.ops.object.mode_set(mode='OBJECT')

# Ajouter un Mirror modifier sur X (copie le côté -X vers +X ou inverse)
# On supprime d'abord le côté défectueux (+X ou -X selon orientation)
# Hunyuan : personnage face caméra, bras droit = X positif côté viewer
# On garde X négatif (bras gauche du perso = bras droit du viewer) et on mirror

mirror = mesh_obj.modifiers.new(name="Mirror", type='MIRROR')
mirror.use_axis[0] = True          # axe X
mirror.use_bisect_axis[0] = True   # couper au milieu
mirror.merge_threshold = 0.001

# Appliquer
bpy.ops.object.modifier_apply(modifier="Mirror")
print(f"After mirror: {len(mesh_obj.data.vertices)} verts")

# Export OBJ pour Mixamo
bpy.ops.wm.obj_export(filepath=dst)
print(f"SAVED OBJ: {dst}")
