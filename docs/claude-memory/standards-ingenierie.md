---
name: standards-ingenierie
description: "Standards de code fixés 2026-07-14 — anglais partout, SOLID/YAGNI/DRY, TDD sur la logique, filet tsc+tests"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: f17c65de-1822-44a0-8209-0922fcbe04ad
---

Sylvain a fixé les standards du projet le 2026-07-14, maintenant que la base est bonne : **anglais partout** (le code mélange FR/EN), **SOLID, YAGNI, DRY, craft, bons patterns** (y compris patterns 3D/R3F), **TDD sur la couche logique**, commits atomiques.

**Why:** la maison est complète et fonctionnelle → moment de monter en qualité sans casser le proto qui marche.

**How to apply:**
- Filet de sécurité = `tsc --noEmit` strict + `npm test` (11 suites) verts avant/après chaque changement. TypeScript est le filet du rename anglais (ZoneId est un type union).
- Couche logique `src/game` = déjà TDD, saine. Couche scène `src/scene` = la dette (god-components SalonRoom 1465L / Cuisine 665L, bloc ZoneReflectorMaterial dupliqué ×9, tokens FR dans 61/77 fichiers).
- Scène R3F non testable en unitaire (pas de WebGL en jsdom) → extraire la logique pure vers modules testés, le JSX restant = validation manuelle. Smoke-tests headless DIFFÉRÉS (fragiles, YAGNI).
- Ordre validé (spec `docs/superpowers/specs/2026-07-14-code-standards-design.md`) : **1) filet de test, 2) migration anglaise, 3) craft/SOLID/DRY**. Une phase à la fois, jamais tout d'un coup ([[lecon-multi-pieces]]).
- **Phase 1 FAITE (2026-07-14, mergée)** : logique pure scène = mince (2 extractions : `resolvePlayerNpcCollision` dans npcSystem, `advanceFace` dans src/scene/shared/faceState.ts). Plan : `docs/superpowers/plans/2026-07-14-code-standards-phase1.md`.
- **Phase 2 FAITE (2026-07-14, mergée+pushée)** : convention anglaise = commentaires + identifiants + noms fichiers/composants/répertoires. **Le contenu du jeu reste** (dialogues ES, valeurs `ZoneId` comme `'salon'`/`'couloir'`, assets, overlays UI joueur FR). Renames clés à connaître : **`src/scene/salon/` → `src/scene/living-room/`**, `SalonRoom`→**`LivingRoomShell`**, `Salon`→`LivingRoom`, `Couloir`→`Corridor`, `Chambre1/2`→`Bedroom1/2`, `SalleDeBain`→`Bathroom`, `Cuisine`→`Kitchen`, `Cellier`→`Pantry`, `Debarras`→`StorageRoom`, `Bureau`→`Office`, `Porte`→`Door`, `salonCollision`→`livingRoomCollision`, `SALON_BOUNDS`→`LIVING_ROOM_BOUNDS`, `salonArcPhase`→`livingRoomArcPhase`. Plan : `docs/superpowers/plans/2026-07-14-code-standards-phase2-english.md`.
- **Phase 3A FAITE (mergée)** : preset `GlassReflector({ zone, resolution?, salonScope? })` dans `src/scene/shared/` remplace le bloc reflector verre dupliqué (6 pièces + fenêtre salon). Corridor (miroir) et sol salon restent inline (distincts).
- **Phase 3B FAITE (mergée)** : `LivingRoomShell.tsx` cassé 1465→54 L = assemblage mince. 13 sous-composants dans `src/scene/living-room/shell/` (livingRoomConstants + TVScreen, LeafyPlant, PapelGarland, Curtains, LivingRoomLighting, LivingRoomStructure, LivingRoomWindow, DiningArea, SofaCorner, Furniture, Decorations, SatelliteRooms). Corps traduit. `Decorations.tsx`=410 L (a absorbé le décor épars — à re-scinder un jour).
- **RÉPARÉ le filet tsc** (voir [[typecheck-reel]]) : `npm run typecheck` (tsc -b), plus jamais `tsc --noEmit`. A révélé + corrigé 2 vrais bugs runtime (crash Corridor, NaN GrandUncle) passés en Phase 1/2 avec le faux filet.
- **Phase 3C FAITE (mergée)** : `Kitchen.tsx` 665→33 L, 10 sous-composants dans `src/scene/rooms/kitchen/` (kitchenConstants + BulbFlicker + KitchenStructure/Stove/KitchenLighting/KitchenShelf/KitchenTable/KitchenAppliances/KitchenAltar/KitchenDecor).
- **Dup murs CONFIRMÉE réelle** (2026-07-15) : pattern `<mesh><planeGeometry><meshToonMaterial map={murAdobe*} gradientMap={toonGradient}/></mesh>` répété 130+ fois. Candidat helper `<Wall position rotation size map side? outline?>` → Phase 3D (DRY réel, pas YAGNI). Touche ~15 fichiers, risque visuel → une pièce à la fois.
- **Phase 3D FAITE (mergée)** : helper `<Wall position size rotation? map? side? outline?>` dans `src/scene/shared/` remplace ~113 murs adobe/azulejos dupliqués (net −301 lignes). Sols/plafonds/boxGeometry/arches restent inline (matériau/géométrie ≠). 
- **PHASE 3 (craft/SOLID/DRY) COMPLÈTE.** Standards Phase 1-2-3 tous livrés. Bilan : filet tsc réparé, 2 extractions testées, anglais partout, 2 god-components découpés (LivingRoomShell 1465→54, Kitchen 665→33), presets GlassReflector + Wall.
- **Reste (non-standards)** : optionnel re-scinder `Decorations.tsx` (410 L). Backlog bugs : Emilio miroir couloir, barre de chargement en boucle, idle NPC synchronisé, assise pas au fond.
- Reflector zone-gated commité (2f970f0) : perf salon reste perfectible (fpsAvg 20-32) mais accepté ; chantier perf séparé si besoin.

Voir [[reco-modele]] pour escalade modèle si besoin.
