---
name: maison-complete-audit-2026-07-14
description: "Maison entière construite (2026-07-14), audit complet livré — corrections EN ATTENTE de validation Sylvain"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1d898911-6f52-44bb-982c-a89e2d2183bf
---

Le 2026-07-14, la maison complète a été construite en une session : chambre 1
(Emilio+Sofía), chambre 2 (parents), SDB, débarras, bureau, entrée-couloir +
porte coloniale, patio (ofrenda mur ouest, anti-spoiler), garage (vocho,
portail est), dôme étoilé. 9 portes interactives (F).

**Audit complet dans `docs/audits/2026-07-14-audit-maison.md` — Sylvain doit
valider les priorités avant TOUTE correction.** Points majeurs :
1. Bug caméra : `cameraBackDistance` applique les murs du salon partout →
   caméra collée hors salon (fix : flag inSalon)
2. 9 MeshReflectorMaterial (perf 1660 Ti) — vitres à passer en 256
3. Pas de toiture : le dôme étoilé se voit derrière les façades depuis le patio
4. Miroir du couloir ABSENT (indice n°1 de la V10, ch3)
5. Fiche cuisine non implémentée : frigo, vaporera, radio, Virgen, flicker,
   bol de pétales
6. Bébé manquant : 20 présents au lieu de 22 (V10)
7. Topologie divergée : retour court ch9 patio→cuisine impossible,
   débarras→patio supprimé — décisions design à prendre

Outils livrés : `?audit` (z-fighting, murs une face, budgets — sceneAudit.tsx),
`houseAudit.test.ts` (intégrité collisions/portes, 101 tests). `?aabb` existant.

**Corrections VALIDÉES et appliquées au matin** : caméra hors salon fixée,
vitres 256, toitures posées, miroir posé (couloir SDB), cuisine complétée,
bébé = couffin au pied du fauteuil de Rosa. Bug texture résolu (coin
patio/garage : façade manquante).

**Décisions topologie actées** (voir section D du rapport d'audit) :
- ch7 = débarras du nord (garage écarté : accès uniquement par le patio →
  spoil ch8). Les pétales naîtront au débarras et fileront jusqu'à la
  porte verte.
- ch9 = retour par le JARDIN (validé) : patio → ouverture enceinte ouest →
  jardin (À CONSTRUIRE, fiche à écrire) → porte bleue déverrouillée →
  cuisine → salon. Beat possible : la famille en ombres derrière la
  fenêtre du salon vue de dehors.
- Anecdote making-of : papa de Sylvain garagiste, 4 enfants, vélos
  transmis — le vélo trop petit du ch7 doit porter ça.

Voir [[lecon-multi-pieces]] et [[methode-contexte-d-abord]].
