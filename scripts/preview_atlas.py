# Extrait la texture atlas d'un GLB et la sauvegarde comme PNG pour inspection.
# Usage : python scripts/preview_atlas.py <in.glb> <out.png>
import sys
import trimesh
from PIL import Image

in_glb, out_png = sys.argv[1], sys.argv[2]

scene = trimesh.load(in_glb, process=False)
mesh = max(
    (g for g in scene.geometry.values() if hasattr(g, "visual")),
    key=lambda g: len(g.vertices),
)
tex = mesh.visual.material.baseColorTexture.convert("RGB")
tex.save(out_png)
print(f"[atlas] saved {tex.size[0]}x{tex.size[1]} -> {out_png}")
