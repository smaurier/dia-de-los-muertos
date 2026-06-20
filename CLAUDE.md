# Día de Muertos

Jeu narratif browser-based. Un enfant se perd dans une maison familiale pendant le Día de Muertos. Réalisme magique comme régime de réalité par défaut.

## Stack

- **React Three Fiber 8** + **Drei** (scène 3D)
- **Zustand 4** (état du jeu)
- **Howler.js 2** (audio spatial, 6 couches)
- **GSAP 3** (animations)
- **Vite 5** + **TypeScript** strict
- **Vitest** (tests logique pure — pas de tests WebGL)

## Structure

```
src/
├── game/
│   ├── store/         # Zustand: gameStore, playerStore
│   └── systems/       # Logique pure testée: stillness, song
├── audio/             # AudioLayerManager (6 couches Howler)
├── scene/
│   └── chapter3/      # Corridor, Mirror, Adult
└── hooks/             # useStillness, useAudioLayers
docs/
├── journal/           # Journal de session (project-log.md)
└── superpowers/
    └── plans/         # Plans d'implémentation
```

## Commandes

```bash
npm run dev      # lancer le prototype
npm test         # 42 tests logique pure
npx tsc --noEmit # vérifier les types
```

## Références

- Spec complète : `docs/superpowers/plans/2026-06-20-vertical-slice-chapter3.md`
- Backlog : `docs/project_v2_backlog.md`
- Journal : `docs/journal/project-log.md`
- 3D model pipeline : https://messenger.abeto.co/

## Conventions

- Couche logique (stores + systems) : TDD strict, Vitest
- Couche scène (R3F) : pas de tests automatisés — validation manuelle
- Pas de `any` TypeScript
- Placeholder géométriques pour les assets 3D (prototype)

## État du prototype

Vertical slice Chapitre 3 uniquement. Placeholders géométriques (pas de modèles 3D réels, pas d'audio). Objectif : valider les 4 mécaniques core avant d'intégrer les assets.

## Philosophie

Le surnaturel n'est pas un autre monde — c'est le même monde avec plus de profondeur de champ.
L'attention du joueur construit l'expérience.
