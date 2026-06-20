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
│   └── systems/       # Logique pure testée: stillness, song, npcSystem
├── audio/             # AudioLayerManager (6 couches Howler)
├── scene/
│   ├── shared/        # toonGradient
│   └── salon/         # Salon, SalonRoom, FamilyMember, GrandUncle, familyConfig
└── hooks/             # useStillness, useAudioLayers
docs/
├── journal/           # Journal de session (project-log.md)
└── superpowers/
    ├── plans/         # Plans d'implémentation
    └── specs/         # Specs de scènes
```

## Commandes

```bash
npm run dev      # lancer le prototype
npm test         # 42 tests logique pure
npx tsc --noEmit # vérifier les types
```

## Références

- **Spec narrative V10 (source de vérité)** : `docs/specs-dia-de-muertos-v10.md`
- Spec salon : `docs/superpowers/specs/2026-06-20-salon-design.md`
- Plan salon : `docs/superpowers/plans/2026-06-20-salon-scene.md`
- Backlog : `docs/project_v2_backlog.md`
- Journal : `docs/journal/project-log.md`
- 3D model pipeline : https://messenger.abeto.co/
- **Bibliothèque visuelle** : `docs/references/visual-refs.md`

### Direction artistique cible

Style cel-shading / dessin animé (ref : `docs/references/assets/cel-shading-ref-01.png`) :
couleurs plates, contours noirs, ombres en bandes. Impl : `MeshToonMaterial` + `Outline` (postprocessing).

## Conventions

- Couche logique (stores + systems) : TDD strict, Vitest
- Couche scène (R3F) : pas de tests automatisés — validation manuelle
- Pas de `any` TypeScript
- Placeholder géométriques pour les assets 3D (prototype)

## État du prototype

Salon sandbox (ch1/ch4). Placeholders géométriques (pas de modèles 3D réels, pas d'audio — sous-titres espagnols). Objectif : valider les mécaniques core + grand-oncle avant d'intégrer les assets.

## Philosophie

Le surnaturel n'est pas un autre monde — c'est le même monde avec plus de profondeur de champ.
L'attention du joueur construit l'expérience.
