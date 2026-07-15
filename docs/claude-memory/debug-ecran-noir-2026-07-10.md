---
name: debug-ecran-noir-2026-07-10
description: Bug écran noir RÉSOLU (2026-07-10) — GLB du pipeline props sans normales + Bloom = frame noire
metadata: 
  node_type: memory
  type: project
  originSessionId: 835b865f-6b00-43e4-8c6a-1e548a839a62
---

Bug « écran presque toujours noir avec languettes en tournant la caméra » (Chrome ET Firefox) : **RÉSOLU le 2026-07-10, deux causes superposées.**

1. **Cause système (matinée)** : Windows Update en pleine session cassait la présentation écran (rendu WebGL correct, affichage noir). Réglée par reboot. La réinstall driver était inutile ; au passage Firefox ouvert pendant la réinstall a perdu son contexte WebGL (`FEATURE_FAILURE_WEBGL_EXHAUSTED_DRIVERS`) → redémarrer le navigateur.

2. **Cause app (la vraie)** : les GLB du pipeline image-to-3D (messenger.abeto.co — fauteuil, tv, buffet, meshes `tmp*ply`) **n'ont pas d'attribut `normal`** → éclairage toon NaN (visible seulement avec la HemisphereLight dans le programme) → le Bloom `mipmapBlur` de l'EffectComposer étale les NaN sur TOUTE la frame → écran noir dès qu'un prop entre dans le frustum. Les « languettes » = frames où les props sortaient du champ. Fix : `computeVertexNormals()` dans `Prop.tsx` si l'attribut manque. **Tout futur GLB de ce pipeline aura le même problème — le fix dans Prop.tsx couvre, ne pas le retirer.**

Bonus fix pendant le debug : `cameraBackDistance()` dans `salonCollision.ts` (TDD, 13 tests) — la caméra 3e personne raccourcit son recul à la première obstruction (murs + AABB meubles) au lieu de traverser la géométrie ; garçon masqué si recul < 0.35 m (`Player.tsx`).

Outils : `scripts/debug-screenshot.mjs`, `scripts/debug-meubles.mjs` (régression écran noir), param URL `?nofx` (désactive le composer), `?photo=camX,camY,camZ,lookX,lookY,lookZ`.

Méthode qui a marché : bisection du scene-graph avec mesure de luminosité des screenshots + probes `window.__*` temporaires (whatAt/ray/override/nanNormals). Le scan NaN doit couvrir les NORMALES, pas que les positions.

Travail non commité validé techniquement (78 tests, tsc OK), validation visuelle Sylvain en attente. Voir [[salon-roadmap-2026-07]].
