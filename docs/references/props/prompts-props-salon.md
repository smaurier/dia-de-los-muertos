# Prompts props 3D — salon chantier 4 (table + chaise)

Pipeline (identique fauteuil/tv/buffet, voir ASSETS-LEDGER) :
image ChatGPT → Hunyuan3D-2 HF Space → gltf-transform weld+simplify →
déposer le GLB dans `public/models/props/` + l'image dans `docs/references/props/`.
Je m'occupe de l'intégration `<Prop>` (couleur toon unie appliquée côté moteur —
seule la **forme** compte, pas la couleur de l'image).

## Specs communes (contraintes Hunyuan3D)

- **Un seul objet**, entier, centré, **fond uni clair** (blanc/gris pâle)
- **Vue 3/4** (montre face + côté), aucun recadrage, aucune ombre portée forte
- Silhouette lisible : éviter les détails fins qui fondent au mesh (< 2 cm réels)
- Style dessin animé cohérent avec le concept gelé (`cel-shading-ref-01.png`)

---

## 1. `chaise-salon-01.png` — chaise (réutilisée ×20)

> Une seule chaise mexicaine rustique en bois, style dessin animé cel-shading :
> dossier droit à deux barreaux horizontaux, assise carrée légèrement creusée,
> quatre pieds droits robustes avec entretoises. Bois brun chaud. Proportions
> simples et trapues, silhouette épaisse lisible de loin. Vue de trois quarts,
> objet entier centré sur fond blanc uni, éclairage doux uniforme, aucune ombre
> portée, aucun autre objet.

Intégration prévue : `targetHeight={0.88}`, remplace `Chair` (placeholder)
aux 20 positions de `CHAIRS` dans `SalonRoom.tsx`.

## 2. `table-banquet-01.png` — table de banquet

> Une longue table de banquet mexicaine rustique en bois massif, style dessin
> animé cel-shading : plateau épais très allongé (proportions ~4 fois plus long
> que large), six pieds droits massifs reliés par des traverses. Bois brun
> foncé. Silhouette simple et robuste. Vue de trois quarts légèrement
> surélevée, objet entier centré sur fond blanc uni, éclairage doux uniforme,
> aucune ombre portée, aucun objet posé dessus.

Intégration prévue : `targetHeight={0.75}`, remplace le plateau + les 6 pieds
placeholder. La nappe (plane texturé `nappe-brodee-01`) reste par-dessus —
si le résultat 3D est décevant, la table placeholder est presque entièrement
masquée par la nappe : chantier abandonnable sans perte visuelle, la **chaise
est la priorité**.
