# Canapé du salon — prompt de génération (image → Hunyuan)

Référence source : `canape-crop-ref.png` (crop de `salon-vue-fenetre-01.png`).
Cible : image « product shot » propre pour Hunyuan3D (objet seul, fond uni,
vue 3/4 légèrement surélevée — ce qui marche le mieux pour les props).

## Prompt (EN) — canapé d'ANGLE (vue-entree-01 : L à retour gauche)

A traditional Mexican L-shaped sectional sofa, painted animation style
(Ghibli-like gouache rendering). Main three-seat section with a shorter
two-seat return attached at a right angle on its left end, forming an L —
both wings clearly visible. Rounded rolled arms at the two open ends only
(the inner corner is continuous, no arm). Plump seat cushions and back
cushions in warm olive-brown upholstery fabric, slightly worn and cozy.
Three colorful throw pillows: one deep red with embroidered pattern, one
cream with woven motifs, one purple. Short dark wooden feet. Exact
proportions: main section 2.9m long, return 1.6m, both 0.95m deep, 0.90m
high backrest — long and low. Soft warm lighting. Single object, centered,
three-quarter view slightly from above showing BOTH wings of the L and the
inner corner seat, plain light grey background, no floor shadow, full
object visible including feet.

## Négatif / contraintes

- Pas de personnage, pas de décor, pas de sol
- L'objet entier dans le cadre (pieds inclus, accoudoirs non coupés)
- Style peint cohérent avec les refs du salon (pas de photo-réalisme)

## Après génération de l'image

1. Déposer ici : `canape-ref-01.png`
2. Génération 3D : `drive_texgen.py <image> work/canape-textured-01.glb 50 7.0 384`
3. Intégration : remplace les RoundedBox du coin salon (segment principal
   ET retour d'angle — vue-entree-01 confirme le L), AABB à recalculer,
   grande-tante assise sur le retour, déformation d'assise à re-juger.
   ⚠️ Formes concaves = point faible d'image-to-3D : si le coin interne
   sort en blob, plan B = générer le canapé droit (image déjà faite) +
   composer le L dans Blender (2 imports, un accoudoir retiré).

## Dimensions cibles (insertion sans recalibrage)

- Longueur **2,90 m** (assise 3 places), profondeur 0,95 m, hauteur dossier 0,90 m
- Orientation : assise face à l'ouest (TV dans l'angle), dossier à l'est
- NB : Hunyuan sort un mesh normalisé sans unité — l'échelle métrique exacte
  est BAKÉE dans le GLB à l'intégration (normalisation par la longueur,
  `--length 2.9`, même principe que `--height` du merge personnages). Les
  cotes du prompt servent aux PROPORTIONS de l'image, le bake à l'échelle.
