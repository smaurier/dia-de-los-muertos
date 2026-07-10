# Convert a Mixamo FBX (rigged + animated) back to GLB for the game.
# Usage (headless):
#   blender --background --python scripts/fbx_to_glb.py -- input.fbx output.glb
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :]
if len(argv) != 2:
    raise SystemExit("Usage: blender --background --python fbx_to_glb.py -- input.fbx output.glb")

input_fbx, output_glb = argv

bpy.ops.wm.read_factory_settings(use_empty=True)

bpy.ops.import_scene.fbx(filepath=input_fbx)

bpy.ops.export_scene.gltf(
    filepath=output_glb,
    export_format="GLB",
    export_animations=True,
    export_skins=True,
    export_yup=True,
)

print(f"Exported {output_glb}")
