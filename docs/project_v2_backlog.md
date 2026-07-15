# Día de Muertos — Project Backlog

Source plan: `docs/superpowers/plans/2026-06-20-vertical-slice-chapter3.md`

## Tasks

- ✅ LIVRE Task 1: Project Bootstrap — Vite+React+TS+R3F+Vitest scaffolded, sanity test green, committed
- ✅ LIVRE Task 2: Game Store — `src/game/store/gameStore.ts` + tests, 5/5 tests pass, committed
- ✅ LIVRE Task 3: Player Store — `src/game/store/playerStore.ts` + tests, 4/4 pass, committed
- ✅ LIVRE Task 4: Stillness System — `src/game/systems/stillnessSystem.ts` + tests, 10/10 pass, committed
- ✅ LIVRE Task 5: Song System — `src/game/systems/songSystem.ts` + tests, 10/10 pass, committed
- ✅ LIVRE Task 6: Audio Layer Manager — `src/audio/AudioLayerManager.ts` + `layers.ts` + tests, 12/12 pass, committed
- ✅ LIVRE Task 7: Full Test Suite Green — 42/42 tests across 6 files pass
- ✅ LIVRE Task 8: Scene Foundation — `src/main.tsx`, `src/App.tsx`, `src/scene/Player.tsx`, TS clean, committed
- ✅ LIVRE Task 9: Chapter 3 Scene — Corridor, Mirror, Adult, Chapter3 assembly, TS clean, committed
- ✅ LIVRE Task 10: Audio + Stillness Hooks — `useStillness.ts`, `useAudioLayers.ts`, TS clean, 42/42 tests pass, committed

## Cel-Shading Phase

- ✅ LIVRE Task 1: Install Dependencies — @react-three/postprocessing + postprocessing, TS clean, committed
- ✅ LIVRE Task 2: Toon Gradient Map — `src/scene/chapter3/toonGradient.ts` singleton DataTexture, TS clean, committed
- ✅ LIVRE Task 3: toonGradient minFilter Fix — Added `minFilter = THREE.NearestFilter` for sharp band boundaries at all texture scales, committed
- ✅ LIVRE Task 4: Corridor MeshToonMaterial — `forwardRef<THREE.Group>`, `meshToonMaterial` on all 6 meshes, `directionalLight` added, TS clean, committed
- ✅ LIVRE Task 5: Adult MeshToonMaterial — Replaced 2x meshStandardMaterial with meshToonMaterial, gradientMap wired, TS clean, committed

## Bugs connus — NPC tablée (différés 2026-07-14)

- 🐛 **Idle synchronisé** — tous les NPC GLB jouent `Sitting Idle(4)` en phase (mixer démarre à t=0 pour tous). Fix : déphaser (offset aléatoire de `action.time` / `timeScale` léger par instance).
- 🐛 **Assise pas au fond de la chaise** — les persos assis ne sont pas calés au fond du siège. Fix : ajuster l'offset de position (startPosition ou reflectorOffset équivalent) par chaise.
- ✅ T-pose intermittente — RÉSOLU (fd00318, binding mixer sur clonedScene).

## Bugs / UX (différés 2026-07-15)

- 🐛 **Compile progressif s'arrête à 30%** (2026-07-16, branche `feat-asset-preload`) — le préchargement + compile progressif est implémenté (spec `docs/superpowers/specs/2026-07-16-progressive-shader-compile-design.md`, plan `docs/superpowers/plans/2026-07-16-progressive-shader-compile.md`). La barre monte 0→30% (phase assets) puis **bloque à 30%** : la phase compile (30→100%, `compileProgressStore.progress`) n'avance pas → `ProgressiveWarmup` n'écrit pas la progression ou `done` ne fire pas. Pistes : la file de meshes est peut-être vide (`total=0`) ou le `useFrame` de `ProgressiveWarmup` ne tourne pas (scène cachée `visible=false`), ou StrictMode double-montage reset les refs. Debug : instrumenter `ProgressiveWarmup` (queue length, compiled, total, finished) + vérifier que le `useFrame` s'exécute avec la scène cachée. La partie preload (boucle de barre fixée) et le réducteur `loaderState`/`compileQueue` (testés) sont bons ; c'est le câblage compile→store→FadeIn à finir.

- 🐛 **Emilio peu visible dans le miroir du couloir** — le couloir est trop serré, le héros se voit à peine dans le miroir (`Corridor.tsx`, reflector zone couloir). Trouver une parade : élargir le champ, décaler le miroir, ou rapprocher le point de vue.
- 🐛 **Barre de chargement figée/en boucle — ROOT CAUSE = chargement bloquant ~18-20s** (diagnostiqué 2026-07-15, debug méthodique). Symptômes : barre coincée à 99% "bien trop longtemps", phrase `LOADING_LINES` figée. **Ce n'est PAS un bug de logique du loader** : l'instrumentation a montré que le `setInterval` de rotation ticke bien MAIS avec ~19s entre deux ticks (censés être 1.8s) → le **thread principal est bloqué ~18-20s** par le chargement initial (parse GLB + compile shaders + géométrie). Pendant un thread gelé, le navigateur ne peut ni faire tourner les timers ni repeindre → barre + phrase gelées ; `useProgress` cycle 0→100 sur plusieurs lots (DefaultLoadingManager reset) → barre qui boucle/colle. 2 fixes logique tentés (progress monotone + rotation indépendante + dismissal débounce) : n'aident PAS car aucune animation ne passe à travers un thread bloqué → revertés. **Vrai fix = PERF : dé-bloquer/réduire le chargement initial** — différer les GLB non-critiques (props pièces satellites, NPC) après le 1er paint, chargement progressif, décimer/compresser les modèles, warmup shaders hors du chemin critique. C'est un chantier perf, pas un patch loader. (Un loader honnête pourrait ensuite juste afficher un spinner statique + snap 100% à la vraie fin.)

## Backlog — Prochaines étapes

- ✅ LIVRE **Cel-Shading (remaining)** — EffectComposer + Outline on Corridor + Adult, corridorRef forwarded, no TS cast needed, 42/42 tests pass, committed
- ✅ LIVRE **Spec V10 + Plan salon** — Spec narrative V10 consolidée, plan d'implémentation salon complet, CLAUDE.md mis à jour
- 🔄 **Salon Scene MVP** — Plan prêt : `docs/superpowers/plans/2026-06-20-salon-scene.md`. 8 tâches :
  - ✅ LIVRE Task 1: Cleanup — Supprimer chapter3, déplacer toonGradient vers shared, stub Salon, TS clean, 42/42 tests pass, committed
  - ✅ LIVRE Task 2: gameStore — grandUnclePosition + salonArcPhase (TDD), 48/48 tests pass, committed
  - ✅ LIVRE Task 3: npcSystem.ts — fonctions pures TDD, 65/65 tests pass, committed
  - ✅ LIVRE Task 4: familyConfig.ts — 20 NPCs + scénarios espagnols, 65/65 tests pass, committed
  - ✅ LIVRE Task 5: SalonRoom.tsx — géométrie 14×10m, 20 chaises, zone TV, éclairage toon, 65/65 tests pass, committed
  - ✅ LIVRE Task 6: GrandUncle.tsx — observer canapé, head turn joueur, sous-titres laugh_at_tv, 65/65 tests pass, committed
  - ✅ LIVRE Task 7: FamilyMember.tsx — NPC générique 3 tiers, state machine scénarios, sous-titres, 65/65 tests pass, committed
  - ✅ LIVRE Task 8: Code Review Fixes — Duration cache per scenario, bebe position offset, 65/65 tests pass, committed
  - ✅ LIVRE Task 9: Salon.tsx — assembly final, EffectComposer retiré (perf), Outlines back-face sur tous meubles/PNJ, committed
- ✅ LIVRE **Enrichissement salon** — Fenêtres rejas, papel picado, tapis, bougies, cadres photos, cactus, porte avec panneaux
- ✅ LIVRE **Mobilier détaillé** — Pieds cylindriques, RoundedBox coussins, dossiers à barreaux, canapé 3 coussins séparés, buffet avec portes
- ✅ LIVRE **Cartoon render** — Outlines (back-face extrusion, Drei) sur meubles+PNJ, toonGradient 4 bandes, meshBasicMaterial sur murs/sol/plafond (élimine pointillés)
- ✅ LIVRE **Gameplay socle** — Sous-titres film (createPortal), collision AABB, NPC registry, troisième personne WASD, overlay PointerLock
- ✅ LIVRE **Carrelage + animation + table + architecture + personnages** — CanvasTexture carrelage céramique, flicker bougies (AnimatedCandle + pointLight locale), papel picado animé (PapelStrand), table dressée (nappe + assiettes + verres + plats), plinthes + corniche, vêtements (pantalon + chemise par nameHash) + cheveux (calotte sphérique), guayabera grand-oncle.
- ✅ LIVRE **Chaises + collisions + assiettes** — Chaises nord/sud z=±1.25→±1.60 (élimine overlap 11cm avec bord table). End chairs sorties du range table (x=-5.0/+4.2), rotations corrigées (faisaient dos à la table). PLATE_Z ±0.70→±0.90. 4 assiettes supplémentaires bouts de table. AABB x élargie [-5.3, 4.5]. 18 assiettes au total.
- ✅ LIVRE **NPCs assis à table** — `chairConfig.ts` : map targetId→position (table-chair-1..5, fauteuil, under-table). SEATED_Y=-0.45 : lerp Y smooth (delta*5) assis↔debout. Tier 2 (maman/papa/oncle/tante) exécutent maintenant leurs scénarios. `sit` step → walk to chair, state 'sitting' à l'arrivée. Chaises vides quand NPCs se déplacent.
- ✅ LIVRE **startPositions NPCs → chaises** — Tier 2 démarrent à leur chaise de sit target (maman→chair-1, papa→chair-2, oncle1→chair-3, etc.). Tier 3 (soeur1/2, grande-tante) : startPosition y=-0.45 = assis dès le spawn (pas de lerp Tier 3). bebe à [1.5, 0, 1.60] debout (trop petit pour offset adulte).
- [ ] **3D Models** — Pipeline défini : spec `2026-07-10-ai-asset-pipeline-design.md` (HF Spaces + gltf-transform + Blender headless + Mixamo, 0 €). Pilote = grand-oncle (T-pose générée : `docs/references/characters/grand-oncle/`). 2026-07-10 : bascule sur Hunyuan3D-2GP local (Spaces texture morts). Ordre : héros texturé d'abord, puis retraiter grand-oncle avec texture (re-upload Mixamo requis — nouveau mesh = nouveau skinning ; les 6 animations à re-télécharger : sitting-idle, sit-to-stand, sitting-clap, sitting-disbelief, standing-idle, walking-happy).
- [ ] **Props texturés (pipeline Hunyuan, après persos)** — décidé 2026-07-11 :
  - Canapé (remplace RoundedBox, ref vue-entree : coussins colorés + plaid). Y intégrer la déformation d'assise : statique aux places connues (comme fait 2026-07-11 pour le grand-oncle), option dynamique par vertex shader (displacement par distance aux personnages) si des NPCs s'assoient librement
  - Plantes en pot (remplacent PlanteFeuillue)
  - Chaises v2 : **assise en osier tressé** + **2 barreaux bas** (ref vue-entree), haut dossier ladder-back — remplace chaise.glb + l'étirement Y×1.14
  - Table : model dédié aux BONNES dimensions pour insertion directe — plateau **8,5 × 2,1 m**, hauteur plateau **0,76-0,80 m** (assiettes posées à y=0.814), 6 pieds, ceintures basses à y≈0.66 ; les 20 chaises/NPCs/collisions sont calibrés sur z=±1.5/1.6
- [ ] **Audio réel** — Pipeline défini : spec `2026-07-10-ai-asset-pipeline-design.md` (freesound CC0, Kokoro/Chatterbox, ACE-Step, enregistrements maison). Première filière à exécuter. Décision 2026-07-11 : **la voix du héros sera enregistrée par la fille de Sylvain** (+ possiblement d'autres enfants pour les cousins) — prévoir le format des répliques (liste des lignes du héros par chapitre) et une session d'enregistrement simple (téléphone/micro, pièce calme).
- [ ] **Toon riche (expérience DA)** — Pousser le salon existant vers le mood des concepts peints (gradient 4-5 bandes, fog coloré, bloom doux, palette cuisine-entree-01) et juger in-engine avant d'amender la DA V10. Décision 2026-07-10 : style peint = cible de mood.
- [ ] **Fiches pièces** — Spec `2026-07-10-house-rooms-design.md`. Cuisine ✅ gelée. Suivantes : couloir → couloir intérieur → chambre → débarras → patio → addendum salon.
- [ ] **Journalisation** — Système de journal de session (à définir selon modèle projet training).
- [ ] **Chapitres 1-9** — Étendre le système chapitres, ajouter pièces (cuisine, chambre, débarras, patio, salon).
- [ ] **Chien** — Comportement pathfinding vers joueur quand perdu, regarde l'adulte différemment.
- [ ] **Pétales** — Chemin procédural au sol (instanced mesh) guidant vers l'ofrenda.
- [ ] **Mirror robuste** — Migrer vers Three.js layers (layer 1 = adulte, caméra miroir voit layer 0 seulement).
- [ ] **Accessibilité** — Volume séparés par couche, sensibilité caméra, désactivation micro-mouvements.
- [ ] **Bouche du héros (parole/chant)** — la bouche n'est pas localisable sûrement dans l'atlas UV fragmenté (le clignement, lui, est fait par swap de texture — `make_face_variants.py`). Plan : petit quad « bouche ouverte » parenté à l'os mixamorig:Head, visible quand `subtitleStore.speaker === 'Niño'` ou pendant le chant ; position à régler visuellement en jeu.
- [ ] **Vêtements réactifs (polish, après héros intégré)** — Mouvement secondaire des vêtements, 2 techniques combinables : (a) vertex shader wobble via `onBeforeCompile` sur MeshToonMaterial — ondulation sinusoïdale du bas des vêtements, pondérée par hauteur, déphasée par la vitesse du perso (~30 lignes) ; (b) spring bones — 2-3 os jupe/écharpe avec ressort + amortissement dans `useFrame` (~80 lignes, technique Zelda/Genshin). Pas de vraie simu cloth (soft body = overkill browser/1660 Ti). Validé par Sylvain 2026-07-10.
- [ ] **Multilingue dès l'entrée** — écran de choix de langue au lancement (fr/es/en a minima) : UI, sous-titres, loader. Demandé 2026-07-14. Les voix restent en espagnol (spec V10 — son spatial, pas dialogue narratif).
