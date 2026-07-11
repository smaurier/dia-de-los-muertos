# Nettoie les coussins bakés de la texture du canapé : les taches saturées
# (rouge/orange/violet/crème à motifs) sont remplacées par du tissu olive
# reconstruit (couleur médiane locale + grain) — plus propre que de les
# recouvrir par les coussins-props.
# Usage : python clean_pillow_bake.py <basecolor.png> (modifie en place)
import sys

import numpy as np
from PIL import Image, ImageFilter

path = sys.argv[1]
img = Image.open(path).convert("RGB")
a = np.asarray(img).astype(np.float32)
H, W = a.shape[:2]

r, g, b = a[..., 0], a[..., 1], a[..., 2]
mx = a.max(axis=2)
mn = a.min(axis=2)
sat = (mx - mn) / (mx + 1e-6)

# Teinte approx (degrés)
hue = np.zeros((H, W), dtype=np.float32)
d = mx - mn + 1e-6
m = mx == r
hue[m] = (60 * ((g - b) / d) % 360)[m]
m = mx == g
hue[m] = (60 * ((b - r) / d) + 120)[m]
m = mx == b
hue[m] = (60 * ((r - g) / d) + 240)[m]

# Tissu olive : teinte ~35-80, saturation modérée. Coussins : rouge/orange
# (hue < 32 ou > 320) saturés, violets (230-320), et crème très clair.
mask = (
    ((hue < 32) | (hue > 320) | ((hue > 230) & (hue < 320))) & (sat > 0.30)
) | ((mx > 200) & (sat < 0.35) & (mn > 150))  # crème clair

# Dilatation du masque (bords des motifs)
mask_img = Image.fromarray((mask * 255).astype(np.uint8))
mask_img = mask_img.filter(ImageFilter.MaxFilter(15))
mask = np.asarray(mask_img) > 0
print(f"[clean] pixels à nettoyer: {mask.sum()} ({100 * mask.mean():.1f}%)")

# Couleur de remplacement : médiane du tissu (pixels NON masqués, teinte olive)
fabric = a[(~mask) & (hue > 35) & (hue < 85) & (sat > 0.15) & (mx > 40)]
med = np.median(fabric, axis=0)
print(f"[clean] tissu médian: {med.astype(int)}")

# Remplissage : médiane + grain doux (variance du tissu réel)
rng = np.random.default_rng(7)
noise = rng.normal(0, 6.5, (H, W, 1)).repeat(3, axis=2)
fill = med[None, None, :] + noise
out = np.where(mask[..., None], fill, a)

# Fondu léger aux bords du masque pour éviter les coutures
blend_img = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4))
alpha = (np.asarray(blend_img).astype(np.float32) / 255)[..., None]
out = a * (1 - alpha) + out * alpha

Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(path)
print(f"[clean] écrit: {path}")
