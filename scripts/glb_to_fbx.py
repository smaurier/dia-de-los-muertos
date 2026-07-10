# Convert a GLB mesh to FBX for Mixamo auto-rigging.
# Usage (headless):
#   blender --background --python scripts/glb_to_fbx.py -- input.glb output.fbx
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :]
if len(argv) != 2:
    raise SystemExit("Usage: blender --background --python glb_to_fbx.py -- input.glb output.fbx")

input_glb, output_fbx = argv

# Start from an empty scene (default scene ships with a cube, camera, light)
bpy.ops.wm.read_factory_settings(use_empty=True)

bpy.ops.import_scene.gltf(filepath=input_glb)

# Mixamo expects a Y-up, reasonably scaled mesh; glTF is already Y-up.
bpy.ops.export_scene.fbx(
    filepath=output_fbx,
    use_selection=False,
    apply_scale_options="FBX_SCALE_ALL",
    add_leaf_bones=False,
)

print(f"Exported {output_fbx}")
