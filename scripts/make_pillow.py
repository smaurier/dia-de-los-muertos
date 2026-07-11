# Coussin 3D depuis une texture de motif à plat (générée par Sylvain).
# Géométrie : cube aplati + bevel + subsurf = coussin dodu ; UV cube-project →
# le motif couvre les faces avant/arrière, sa BORDURE décorative habille les
# tranches. Bien plus net qu'un bake Hunyuan pour un petit objet plat.
# Usage : blender --background --python make_pillow.py -- motif.png out.glb
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :]
tex_png, out_glb = argv

bpy.ops.wm.read_factory_settings(use_empty=True)

bpy.ops.mesh.primitive_cube_add(size=1)
pillow = bpy.context.active_object
pillow.scale = (0.5, 0.5, 0.16)
bpy.ops.object.transform_apply(scale=True)

bevel = pillow.modifiers.new("bevel", "BEVEL")
bevel.width = 0.07
bevel.segments = 3
subsurf = pillow.modifiers.new("subsurf", "SUBSURF")
subsurf.levels = 2
subsurf.render_levels = 2
bpy.ops.object.modifier_apply(modifier="bevel")
bpy.ops.object.modifier_apply(modifier="subsurf")
bpy.ops.object.shade_smooth()

# UV : projection cubique — faces avant/arrière = motif entier
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.cube_project(cube_size=1.0)
bpy.ops.object.mode_set(mode="OBJECT")

mat = bpy.data.materials.new("Coussin")
mat.use_nodes = True
bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
tex_node = mat.node_tree.nodes.new("ShaderNodeTexImage")
tex_node.image = bpy.data.images.load(tex_png)
mat.node_tree.links.new(bsdf.inputs["Base Color"], tex_node.outputs["Color"])
bsdf.inputs["Roughness"].default_value = 0.95
bsdf.inputs["Metallic"].default_value = 0.0
pillow.data.materials.append(mat)

bpy.ops.export_scene.gltf(filepath=out_glb, export_format="GLB", export_yup=True)
print(f"[pillow] exporté: {out_glb}")
