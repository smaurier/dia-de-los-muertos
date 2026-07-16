# scripts/swap_texture.py — replace the baseColor image of a GLB with a PNG,
# preserving rig, skin weights and animation clips (Blender round-trip; used
# because trimesh-based texture scripts drop skins/animations).
# Usage: blender --background --python scripts/swap_texture.py -- in.glb atlas.png out.glb
import os
import sys
import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
in_glb, atlas_png, out_glb = argv[0], argv[1], argv[2]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=in_glb)

img = bpy.data.images.load(os.path.abspath(atlas_png))
img.pack()

replaced = 0
for mat in bpy.data.materials:
    if not mat.use_nodes:
        continue
    for node in mat.node_tree.nodes:
        if node.type == "TEX_IMAGE":
            node.image = img
            replaced += 1
print(f"[swap] {replaced} texture node(s) replaced")

bpy.ops.export_scene.gltf(
    filepath=os.path.abspath(out_glb),
    export_format="GLB",
    export_animations=True,
    export_skins=True,
    export_yup=True,
)
print(f"[swap] exported {out_glb}")
