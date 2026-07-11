# Transfert colorimétrique : aligne la texture du canapé sur le tissu de
# l'image de référence (moyenne + écart-type par canal, sur les zones tissu
# des deux côtés — la fidélité couleur demandée par Sylvain).
# Usage : python match_fabric_color.py <texture.png> <reference.png>
import sys

import numpy as np
from PIL import Image

tex_path, ref_path = sys.argv[1:3]

tex = np.asarray(Image.open(tex_path).convert("RGB")).astype(np.float32)
ref = np.asarray(Image.open(ref_path).convert("RGB")).astype(np.float32)


def fabric_mask(a):
    """Tissu olive-brun : teinte chaude-verte, saturation modérée, ni fond gris
    ni coussins vifs."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a.max(axis=2)
    mn = a.min(axis=2)
    sat = (mx - mn) / (mx + 1e-6)
    warm = (r > b) & (g > b * 0.9)
    return warm & (sat > 0.15) & (sat < 0.75) & (mx > 40) & (mx < 220)


tmask = fabric_mask(tex)
rmask = fabric_mask(ref)
print(f"[match] tissu texture: {100 * tmask.mean():.0f}%, tissu ref: {100 * rmask.mean():.0f}%")

t_px = tex[tmask]
r_px = ref[rmask]

out = tex.copy()
for c in range(3):
    tm, ts = t_px[:, c].mean(), t_px[:, c].std() + 1e-6
    rm, rs = r_px[:, c].mean(), r_px[:, c].std() + 1e-6
    print(f"[match] canal {c}: {tm:.0f}±{ts:.0f} -> {rm:.0f}±{rs:.0f}")
    # Affine sur TOUTE la texture (les coussins bakés ont déjà été nettoyés,
    # le reste est du tissu/bois cohérent)
    out[..., c] = (tex[..., c] - tm) * (rs / ts) + rm

Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(tex_path)
print(f"[match] écrit: {tex_path}")
