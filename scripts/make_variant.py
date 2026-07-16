# scripts/make_variant.py — recolor hair and/or clothing of a base atlas via
# its region mask (R=skin untouched, G=hair, B=clothing). Hue/sat shift in
# HSV, luminance preserved (keeps folds/shading).
# Usage: python scripts/make_variant.py <base.glb> <mask.png> <out.png>
#        [--cloth-hue 0.6] [--cloth-sat 0.5] [--hair-value 0.8]
# cloth-hue: 0..1 target hue for clothing; cloth-sat: target saturation;
# hair-value: multiplier on hair brightness (e.g. 1.3 = greying).
import sys

import numpy as np
import trimesh
from PIL import Image

glb, mask_png, out_png = sys.argv[1:4]

def arg(name, default):
    return float(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else default

CLOTH_HUE = arg("--cloth-hue", None)  # None = don't recolor clothing
CLOTH_SAT = arg("--cloth-sat", 0.55)
HAIR_VAL = arg("--hair-value", 1.0)

scene = trimesh.load(glb, process=False)
mesh = max(
    (g for g in scene.geometry.values() if hasattr(g, "visual")),
    key=lambda g: len(g.vertices),
)
atlas = mesh.visual.material.baseColorTexture.convert("RGB")
rgb = np.asarray(atlas)
mask = np.asarray(Image.open(mask_png).convert("RGB").resize(atlas.size))
hair = mask[..., 1] > 0
cloth = mask[..., 2] > 0

hsv = np.asarray(Image.fromarray(rgb, "RGB").convert("HSV")).astype(np.float32) / 255.0
if CLOTH_HUE is not None:
    hsv[..., 0] = np.where(cloth, CLOTH_HUE, hsv[..., 0])
    hsv[..., 1] = np.where(cloth, CLOTH_SAT, hsv[..., 1])
hsv[..., 2] = np.where(hair, np.clip(hsv[..., 2] * HAIR_VAL, 0, 1), hsv[..., 2])
out = Image.fromarray((hsv * 255).astype(np.uint8), "HSV").convert("RGB")
out.save(out_png)
print(f"[variant] saved {out_png} (cloth texels={cloth.sum()}, hair texels={hair.sum()})")
