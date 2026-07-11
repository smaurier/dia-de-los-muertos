# Peint les motifs HD de Sylvain directement dans l'atlas du canapé, sur les
# zones UV des coussins BAKÉS (le relief existe déjà dans la géométrie) —
# adieu les props de coussins et leurs problèmes de placement.
# Masque : détection couleur sur la texture ORIGINALE (avant nettoyage).
# Assignation motif : par teinte d'origine de chaque zone (rouge/crème/violet).
# Usage : python paint_baked_pillows.py <orig.png> <cible.png> <rouge.png> <creme.png> <violet.png>
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

orig_p, target_p, rouge_p, creme_p, violet_p = sys.argv[1:6]

orig = np.asarray(Image.open(orig_p).convert("RGB")).astype(np.float32)
target = np.asarray(Image.open(target_p).convert("RGB")).astype(np.float32)
H, W = orig.shape[:2]

motifs = {
    "rouge": np.asarray(Image.open(rouge_p).convert("RGB")),
    "creme": np.asarray(Image.open(creme_p).convert("RGB")),
    "violet": np.asarray(Image.open(violet_p).convert("RGB")),
}

# ── Masque coussins sur l'ORIGINALE (même critères que clean_pillow_bake) ────
r, g, b = orig[..., 0], orig[..., 1], orig[..., 2]
mx = orig.max(axis=2)
mn = orig.min(axis=2)
sat = (mx - mn) / (mx + 1e-6)
hue = np.zeros((H, W), dtype=np.float32)
d = mx - mn + 1e-6
m = mx == r
hue[m] = (60 * ((g - b) / d) % 360)[m]
m = mx == g
hue[m] = (60 * ((b - r) / d) + 120)[m]
m = mx == b
hue[m] = (60 * ((r - g) / d) + 240)[m]

# STRICT : coussins = zones VIVES et CLAIRES (les ombres chaudes du tissu ont
# hue<32 aussi mais sombres/désaturées → exclues par mx>110 & sat>0.45)
mask = (
    ((hue < 28) | (hue > 325) | ((hue > 235) & (hue < 320))) & (sat > 0.45) & (mx > 110)
) | ((mx > 205) & (sat < 0.30) & (mn > 165))
mask_img = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))
mask = np.asarray(mask_img) > 0

# ── Composantes connexes (BFS sur grille /4 pour la vitesse) ─────────────────
step = 4
small = mask[::step, ::step]
lab = np.zeros(small.shape, dtype=np.int32)
cur = 0
for sy in range(small.shape[0]):
    for sx in range(small.shape[1]):
        if small[sy, sx] and lab[sy, sx] == 0:
            cur += 1
            q = deque([(sy, sx)])
            lab[sy, sx] = cur
            while q:
                y0, x0 = q.popleft()
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    yy, xx = y0 + dy, x0 + dx
                    if 0 <= yy < small.shape[0] and 0 <= xx < small.shape[1] and small[yy, xx] and lab[yy, xx] == 0:
                        lab[yy, xx] = cur
                        q.append((yy, xx))

out = target.copy()
painted = 0
# Ne garder que les 6 plus grosses zones (3 coussins ≈ 2 patchs UV chacun max)
sizes = sorted(((int((lab == c).sum()), c) for c in range(1, cur + 1)), reverse=True)[:6]
keep = {c for n, c in sizes if n >= 500}
# Assignation par RANG de taille (les teintes d'origine sont toutes chaudes,
# inutilisables) : variété rouge / crème / violet comme la ref.
order = ["rouge", "creme", "violet", "rouge", "creme", "violet"]
for rank, (_, c) in enumerate(sizes):
    if c not in keep:
        continue
    ys, xs = np.where(lab == c)
    y0, y1 = ys.min() * step, (ys.max() + 1) * step
    x0, x1 = xs.min() * step, (xs.max() + 1) * step
    zone_mask = mask[y0:y1, x0:x1]
    key = order[rank]
    motif = np.asarray(
        Image.fromarray(motifs[key]).resize((x1 - x0, y1 - y0), Image.LANCZOS)
    ).astype(np.float32)
    region = out[y0:y1, x0:x1]
    region[zone_mask] = motif[zone_mask]
    out[y0:y1, x0:x1] = region
    painted += 1
    print(f"[paint] zone {c}: {len(ys) * step * step}px -> motif {key}")

print(f"[paint] {painted} zones peintes")
Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(target_p)
print(f"[paint] écrit: {target_p}")
