# scripts/fix_hero_nose.py — remove the red projection artifact on the hero's
# nose: inside a given atlas bbox, texels that are "too red" are replaced by
# the median surrounding skin tone. Outputs a corrected atlas PNG (swap it
# into the rigged GLB with swap_texture.py — trimesh export drops the rig).
# Usage: python scripts/fix_hero_nose.py <in.glb> --dump atlas.png
#        python scripts/fix_hero_nose.py <in.glb> --box x0,y0,x1,y1 --out atlas_fixed.png
import sys

import numpy as np
import trimesh
from PIL import Image

in_glb = sys.argv[1]
scene = trimesh.load(in_glb, process=False)
mesh = max(
    (g for g in scene.geometry.values() if hasattr(g, "visual")),
    key=lambda g: len(g.vertices),
)
atlas = np.asarray(mesh.visual.material.baseColorTexture.convert("RGB")).copy()

if "--dump" in sys.argv:
    Image.fromarray(atlas).save(sys.argv[sys.argv.index("--dump") + 1])
    print("[nose] atlas dumped — locate the red spot bbox, re-run with --box")
    sys.exit(0)

x0, y0, x1, y1 = map(int, sys.argv[sys.argv.index("--box") + 1].split(","))
out_png = sys.argv[sys.argv.index("--out") + 1]
patch = atlas[y0:y1, x0:x1].astype(int)
r, g, b = patch[..., 0], patch[..., 1], patch[..., 2]
red = (r > g + 30) & (r > b + 30)  # markedly red vs skin
ring = atlas[max(0, y0 - 8):y1 + 8, max(0, x0 - 8):x1 + 8].reshape(-1, 3)
skin = np.median(ring, axis=0)
patch[red] = skin
atlas[y0:y1, x0:x1] = patch
print(f"[nose] {red.sum()} texels repeints avec skin={skin.astype(int)}")
Image.fromarray(atlas.astype(np.uint8)).save(out_png)
print(f"[nose] atlas corrigé: {out_png}")
