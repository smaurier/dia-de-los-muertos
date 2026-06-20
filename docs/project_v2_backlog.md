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

## Backlog — Prochaines étapes

- ✅ LIVRE **Cel-Shading (remaining)** — EffectComposer + Outline on Corridor + Adult, corridorRef forwarded, no TS cast needed, 42/42 tests pass, committed
- ✅ LIVRE **Spec V10 + Plan salon** — Spec narrative V10 consolidée, plan d'implémentation salon complet, CLAUDE.md mis à jour
- 🔄 **Salon Scene MVP** — Plan prêt : `docs/superpowers/plans/2026-06-20-salon-scene.md`. 8 tâches : cleanup ch3, gameStore, npcSystem (TDD), familyConfig, SalonRoom, GrandUncle, FamilyMember, Salon assembly
- [ ] **3D Models** — Intégrer modèles GLTF via pipeline messenger.abeto.co (remplacer placeholders géométriques). À définir : format export, rig adulte, rig enfant, maison.
- [ ] **Audio réel** — Enregistrer voix espagnoles, composer la chanson, SFX (chien, pétales, morsure pomme). Brancher sur les 6 couches AudioLayerManager.
- [ ] **Journalisation** — Système de journal de session (à définir selon modèle projet training).
- [ ] **Chapitres 1-9** — Étendre le système chapitres, ajouter pièces (cuisine, chambre, débarras, patio, salon).
- [ ] **Chien** — Comportement pathfinding vers joueur quand perdu, regarde l'adulte différemment.
- [ ] **Pétales** — Chemin procédural au sol (instanced mesh) guidant vers l'ofrenda.
- [ ] **Mirror robuste** — Migrer vers Three.js layers (layer 1 = adulte, caméra miroir voit layer 0 seulement).
- [ ] **Accessibilité** — Volume séparés par couche, sensibilité caméra, désactivation micro-mouvements.
