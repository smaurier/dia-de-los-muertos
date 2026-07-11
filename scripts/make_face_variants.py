# Variante de texture "clignement" pour le héros : paupières peintes sur les
# deux yeux de l'atlas. Coordonnées vérifiées VISUELLEMENT (crops zoomés) —
# la détection automatique confondait yeux et baskets blanches à lacets.
# Usage : python make_face_variants.py <basecolor.png> <out_dir>
import sys

from PIL import Image, ImageDraw

base_png, out_dir = sys.argv[1:3]
img = Image.open(base_png).convert("RGB")
W, H = img.size
px = img.load()

# (centre x, centre y, rayon de recouvrement) — atlas 2048², crops du 2026-07-11
EYES = [(385, 410, 42), (1500, 1628, 42)]


def sample_skin(cx, cy, r):
    """Couleur de peau moyenne sur un anneau autour de l'œil."""
    vals = []
    for dx in range(-2 * r, 2 * r + 1, 4):
        for dy in range(-2 * r, 2 * r + 1, 4):
            d2 = dx * dx + dy * dy
            if (1.3 * r) ** 2 < d2 < (1.9 * r) ** 2:
                c = px[(cx + dx) % W, (cy + dy) % H]
                # peau : chaude, ni cheveux noirs ni sclère blanche
                if 120 < c[0] < 245 and c[2] < c[0] and c[0] - c[2] > 20:
                    vals.append(c)
    if not vals:
        return (198, 140, 108)
    return tuple(sum(v[i] for v in vals) // len(vals) for i in range(3))


blink = img.copy()
d = ImageDraw.Draw(blink)
for cx, cy, r in EYES:
    skin = sample_skin(cx, cy, r)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=skin)
    # paupière fermée : ombre douce horizontale au centre (lisible quelle que
    # soit l'orientation du chart, les charts sont tournés arbitrairement)
    shade = tuple(max(0, int(c * 0.70)) for c in skin)
    d.ellipse([cx - r * 0.85, cy - 5, cx + r * 0.85, cy + 5], fill=shade)
blink.save(f"{out_dir}/heros-basecolor-blink.png")
print(f"[variants] blink -> {out_dir}/heros-basecolor-blink.png")
