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

## Backlog — Prochaines étapes

- [ ] **3D Models** — Intégrer modèles GLTF via pipeline messenger.abeto.co (remplacer placeholders géométriques). À définir : format export, rig adulte, rig enfant, maison.
- [ ] **Audio réel** — Enregistrer voix espagnoles, composer la chanson, SFX (chien, pétales, morsure pomme). Brancher sur les 6 couches AudioLayerManager.
- [ ] **Journalisation** — Système de journal de session (à définir selon modèle projet training).
- [ ] **Chapitres 1-9** — Étendre le système chapitres, ajouter pièces (cuisine, chambre, débarras, patio, salon).
- [ ] **Chien** — Comportement pathfinding vers joueur quand perdu, regarde l'adulte différemment.
- [ ] **Pétales** — Chemin procédural au sol (instanced mesh) guidant vers l'ofrenda.
- [ ] **Mirror robuste** — Migrer vers Three.js layers (layer 1 = adulte, caméra miroir voit layer 0 seulement).
- [ ] **Accessibilité** — Volume séparés par couche, sensibilité caméra, désactivation micro-mouvements.
