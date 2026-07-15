# MEMORY

- [Reco modèle](reco-modele.md) — signaler à Sylvain quand escalader/désescalader de modèle Claude, aux transitions seulement

- [Sylvain contexte](sylvain-contexte.md) — solo dev, jeu familial (sa fille = voix du héros), aime l'itératif visuel, la fidélité aux refs et les solutions génériques

- [Blink personnages](blink-personnages.md) — clignement générique par swap de texture : recette nouveau perso + 3 pièges résolus (ImageBitmap flip, matériau orphelin StrictMode, useTexture)

- [Roadmap salon 2026-07](salon-roadmap-2026-07.md) — 5 chantiers vers l'image de ref (1 fait, 2-3 en cours, 4-5 à faire)
- [Debug écran noir 2026-07-10](debug-ecran-noir-2026-07-10.md) — RÉSOLU : GLB pipeline props sans normales + Bloom = frame noire ; fix computeVertexNormals dans Prop.tsx
- [Pipeline Hunyuan local 2026-07-10](pipeline-hunyuan-local-2026-07-10.md) — serveur OPÉRATIONNEL localhost:8080, recette relance + pièges résolus, prochaine étape = Sylvain génère le héros
- [Casting familial](casting-familial.md) — 20 persos nommés, Aurelio = le mort (grand-oncle), 4-5 rigs partagés Hunyuan
- [Making-of ritual](making-of-ritual.md) — mettre à jour docs/journal/making-of.md + poser 1 question par session pour alimenter LinkedIn
- [Leçon multi-pièces](lecon-multi-pieces.md) — rollback total 2026-07-13 : ne jamais construire toutes les pièces d'un coup, une pièce à la fois avec validation visuelle
- [Méthode contexte d'abord](methode-contexte-d-abord.md) — phase actuelle : construire toute la maison/le contexte, scénario seulement quand le décor sera nickel
- [Maison complète + audit 2026-07-14](maison-complete-audit-2026-07-14.md) — maison finie, audit livré (bug caméra, toiture, miroir couloir, cuisine, bébé), corrections EN ATTENTE validation Sylvain
- [Standards ingénierie 2026-07-14](standards-ingenierie.md) — anglais partout + SOLID/YAGNI/DRY + TDD logique ; ordre : filet de test → anglais → craft ; spec écrite
- [T-pose binding clone 2026-07-14](tpose-binding-clone.md) — RÉSOLU : useAnimations doit binder clonedScene (pas le group) sinon T-pose intermittente par race de PropertyBinding
- [Typecheck réel 2026-07-14](typecheck-reel.md) — CRITIQUE : `npm run typecheck` (tsc -b), JAMAIS `tsc --noEmit` (no-op sur ce repo, cachait 35 erreurs)
- [Loader saga 2026-07-16](loader-saga.md) — gel loader = compile shaders 12s (Firefox sans compile parallèle) ; fix = compile progressif (branche feat-asset-preload, bloque à 30%, à finir)
