# Références Visuelles

Bibliothèque de références pour le direction artistique de *Día de Muertos*.

---

## Style : Cel-Shading / Dessin Animé

### `cel-shading-ref-01.png`
![Cel-shading ref](assets/cel-shading-ref-01.png)

**Source :** Screenshot partagé en session (2026-06-20)  
**Ce qu'on retient :**
- Couleurs plates par zones, palette limitée (3-4 tons par objet)
- Contours noirs nets autour des silhouettes et arêtes
- Ombres en "bandes" (stepped), pas de gradient lisse
- Ciel : aplat bleu-turquoise, pas de texture
- Style général : jeu narratif coréen (tonalité proche de *Florence*, *A Short Hike*)

**Implémentation R3F :**
- `MeshToonMaterial` pour les matériaux
- `@react-three/postprocessing` + `Outline` pour contours noirs
- `GradientMap` custom (2-3 niveaux) pour contrôler les bandes d'ombre

**Lien vers notes implémentation :** voir conversation 2026-06-20 — "Ce serait compliqué ?"

---

## À venir

Ajouter ici les références pour :
- [ ] Palette couleurs Día de Muertos (orange/violet/noir/dorés)
- [ ] Références lumière de bougie / marigold
- [ ] Style UI / typographie
- [ ] Références audio (ambient, spatial)
