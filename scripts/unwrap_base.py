# scripts/unwrap_base.py — add NORMAL + TEXCOORD_0 to a rigged base GLB.
# Loads the rigged GLB, recomputes normals, Smart-UV-Projects the densest
# mesh, keeps armature + skin weights + animations, exports GLB.
# Usage: blender --background --python scripts/unwrap_base.py -- in.glb out.glb
import sys
import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
in_glb, out_glb = argv[0], argv[1]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=in_glb)

meshes = [o for o in bpy.data.objects if o.type == "MESH"]
mesh = max(meshes, key=lambda o: len(o.data.vertices))
print(f"[unwrap] mesh {mesh.name}: {len(mesh.data.vertices)} verts")

bpy.ops.object.select_all(action="DESELECT")
mesh.select_set(True)
bpy.context.view_layer.objects.active = mesh

# Normals: shade smooth is enough — glTF exporter writes vertex normals.
bpy.ops.object.shade_smooth()

# UV unwrap (Smart UV Project — no seams to place manually)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.003)
bpy.ops.object.mode_set(mode="OBJECT")
print(f"[unwrap] UV layers: {[l.name for l in mesh.data.uv_layers]}")

# Material with a placeholder image so the exporter emits a texturable slot.
img = bpy.data.images.new("atlas", 2048, 2048)
img.generated_color = (0.8, 0.7, 0.6, 1.0)
mat = bpy.data.materials.new("base-mat")
mat.use_nodes = True
bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
tex = mat.node_tree.nodes.new("ShaderNodeTexImage")
tex.image = img
img.pack()
mat.node_tree.links.new(bsdf.inputs["Base Color"], tex.outputs["Color"])
bsdf.inputs["Metallic"].default_value = 0.0
bsdf.inputs["Roughness"].default_value = 0.9
mesh.data.materials.clear()
mesh.data.materials.append(mat)

bpy.ops.export_scene.gltf(
    filepath=out_glb,
    export_format="GLB",
    export_animations=True,
    export_skins=True,
    export_yup=True,
)
print(f"[unwrap] exported {out_glb}")
