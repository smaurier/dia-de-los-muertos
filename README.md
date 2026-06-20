# Día de Muertos — Vertical Slice Prototype

Prototype jouable du Chapitre 3 d'un jeu narratif en réalisme magique.

Un enfant se perd dans une maison familiale pendant le Día de Muertos. Pour retrouver le salon, il traverse quelque chose.

## Ce que valide ce prototype

1. La boucle cache-cache fonctionne-t-elle comme moteur ?
2. L'arrêt silencieux déclenche-t-il quelque chose de ressenti ?
3. L'adulte est-il crédible comme personne ordinaire ?
4. La chanson entre-t-elle naturellement depuis lui ?

## Stack

- React Three Fiber + Drei (scène 3D)
- Zustand (état du jeu)
- Howler.js (audio spatial 6 couches)
- Vitest (tests logique pure)

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:5173`, cliquer pour verrouiller la souris, naviguer avec WASD.

## Tests

```bash
npm test
```

42 tests — couche logique uniquement (stores + systèmes). La scène 3D se vérifie manuellement.

## Architecture

```
src/
├── game/
│   ├── store/        # Zustand: gameStore, playerStore
│   └── systems/      # Logique pure: stillness, song
├── audio/            # AudioLayerManager (6 couches Howler)
├── scene/
│   └── chapter3/     # Corridor, Mirror, Adult (placeholders géométriques)
└── hooks/            # useStillness, useAudioLayers
```

## État du prototype

Placeholders géométriques (pas de modèles 3D, pas d'audio). L'objectif est de valider les mécaniques, pas le rendu final.

Voir `docs/superpowers/plans/2026-06-20-vertical-slice-chapter3.md` pour le plan complet.
