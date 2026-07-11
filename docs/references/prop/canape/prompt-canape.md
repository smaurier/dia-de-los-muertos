# Canapé du salon — prompt de génération (image → Hunyuan)

Référence source : `canape-crop-ref.png` (crop de `salon-vue-fenetre-01.png`).
Cible : image « product shot » propre pour Hunyuan3D (objet seul, fond uni,
vue 3/4 légèrement surélevée — ce qui marche le mieux pour les props).

## Prompt (EN)

A traditional Mexican living room sofa, three-seater, painted animation
style (Ghibli-like gouache rendering). Rounded rolled arms, plump seat
cushions and back cushions in warm olive-brown upholstery fabric, slightly
worn and cozy. Two colorful throw pillows resting on it: one deep red with
embroidered pattern, one cream with woven motifs. Short dark wooden feet.
Soft warm lighting. Single object, centered, three-quarter front view
slightly from above, plain light grey background, no floor shadow, full
object visible including feet.

## Négatif / contraintes

- Pas de personnage, pas de décor, pas de sol
- L'objet entier dans le cadre (pieds inclus, accoudoirs non coupés)
- Style peint cohérent avec les refs du salon (pas de photo-réalisme)

## Après génération de l'image

1. Déposer ici : `canape-ref-01.png`
2. Génération 3D : `drive_texgen.py <image> work/canape-textured-01.glb 50 7.0 384`
3. Intégration : remplace les RoundedBox du coin salon (garder AABB
   [-3.75,-2.65,-5.70,-2.70] ± ajustement), retour d'angle à SUPPRIMER
   (la ref n'en a pas), grande-tante à réasseoir sur le canapé à côté
   du grand-oncle (3 places), re-baker la déformation d'assise si utile.

## Dimensions cibles (insertion sans recalibrage)

- Longueur ~2,9 m (assise 3 places), profondeur ~0,95 m, hauteur dossier ~0,90 m
- Orientation : assise face à l'ouest (TV dans l'angle), dossier à l'est
