# Spec : Scène Salon — MVP Sandbox

**Date :** 2026-06-20  
**Référence narrative :** `docs/specs-dia-de-muertos-v9.md`  
**Remplace :** `src/scene/chapter3/` (supprimé entièrement)

---

## Objectif

Construire une scène sandbox du salon familial mexicain. L'enfant (joueur) se trouve dans un grand salon vivant, entouré de 22 membres de la famille qui bougent, interagissent, et réagissent. Le grand-oncle est présent — visible, ordinaire, légèrement décalé pour qui regarde attentivement.

Cette scène constitue la base de Chapitre 1 (et potentiellement Chapitre 4) dans la narration complète.

---

## Ce qu'on supprime

- `src/scene/chapter3/Corridor.tsx`
- `src/scene/chapter3/Mirror.tsx`
- `src/scene/chapter3/Adult.tsx`
- `src/scene/chapter3/Chapter3.tsx`
- `src/scene/chapter3/toonGradient.ts` → **déplacé** vers `src/scene/shared/toonGradient.ts`

`App.tsx` : `<Chapter3 />` → `<Salon />`

---

## Ce qu'on conserve intact

- `src/scene/Player.tsx` — WASD + caméra hauteur enfant (1.1m)
- `src/hooks/useStillness.ts`
- `src/hooks/useAudioLayers.ts`
- `src/game/store/` — tous les stores
- `src/game/systems/stillnessSystem.ts`, `songSystem.ts`
- `src/audio/` — AudioLayerManager
- `src/scene/shared/toonGradient.ts` (déplacé depuis chapter3)

---

## Architecture fichiers

```
src/scene/shared/
└── toonGradient.ts        # DataTexture singleton déplacé ici

src/scene/salon/
├── Salon.tsx              # Assembly : room + NPCs + EffectComposer + Outline
├── SalonRoom.tsx          # Géométrie statique : murs, sol, plafond, meubles
├── FamilyMember.tsx       # NPC générique — config-driven, 3 tiers
├── GrandUncle.tsx         # NPC spécial — observer, canapé, réactif seulement
└── familyConfig.ts        # Données : 20 membres (grand-oncle exclu — composant dédié)

src/game/systems/
└── npcSystem.ts           # Fonctions pures TDD : transitions états, waypoints, réactivité
```

---

## Géométrie du salon

**Dimensions :** 14m × 10m, plafond 3.2m  
**Style :** cel-shading (MeshToonMaterial + toonGradient), contours noirs (Outline postprocessing)

### Zones

| Zone | Position | Contenu |
|------|----------|---------|
| Repas | Centre-fond | Table 3.5m × 1.4m, 20 chaises |
| TV/canapé | Droite entrée | Canapé 3 places, fauteuil, repose-pied, télé murale |
| Circulation | Milieu | Espace ouvert — NPCs traversent |
| Fond de salle | Gauche-fond | Buffet/crédence, chaises murales |

### Règle chaises (indice passif)
**20 chaises à table = 20 personnes attendues.** Le grand-oncle est dans la pièce (22e personne avec le bébé). Il n'a pas de place à table. Personne n'a prévu qu'il serait là. Le jeu ne le signale pas.

### Placement grand-oncle
Zone TV/canapé, **visible immédiatement depuis l'entrée** (côté droit en entrant). Canapé positionné face à la télé, pieds sur repose-pied. Premier regard du joueur = grand-oncle identifiable.

### Mobilier (placeholders BoxGeometry)
Table, 20 chaises, canapé 3 places, fauteuil, repose-pied, télé (PlaneGeometry, émissive), buffet, crédence.

### Éclairage
- `pointLight` lustre central — `#f0d890`, intensity 2.0, position [0, 3.0, 0]
- `directionalLight` fenêtre latérale — `#f5c87a`, intensity 0.6, position [-6, 2, 0]
- `pointLight` lueur TV — `#8ab4f8`, intensity 0.4, distance 2.5, position TV
- `ambientLight` — `#f5c87a`, intensity 0.1

---

## La famille — 22 personnes

### Grand-oncle (composant spécial)
Voir section dédiée.

### Tier 1 — Actifs avec state machine (8)
Bougent dans la pièce, réagissent au joueur et aux autres NPCs.

| ID | Personnage |
|----|------------|
| cousin-1 | Cousin (abandonne le cache-cache) |
| cousine-1 | Cousine 1 |
| cousine-2 | Cousine 2 |
| oncle-jeune | Oncle jeune |
| tante-jeune | Tante jeune |
| enfant-1 | Enfant (4 enfants du couple jeune) |
| enfant-2 | Enfant |
| enfant-3 | Enfant |

### Tier 2 — Semi-actifs (8)
Assis ou debout, animations idle, tête tourne vers stimuli proches.

Papa, Maman, Oncle 1, Oncle 2, Oncle 3, Tante 1, Tante 2, Enfant 4 (assis sagement)

### Tier 3 — Statiques (4)
Mesh fixe, aucune logique.

Sœur 1, Sœur 2, Bébé (dans les bras de Maman ou dans couffin), Grande tante (assoupie dans fauteuil du buffet)

---

## Système NPC

### Modèle : scénarios par type de personnage

Chaque NPC a un tableau de **scénarios pondérés**. Un scheduler central (`npcSystem.ts`) sélectionne un nouveau scénario par NPC toutes les 4–12s (variable par type). Le scénario s'exécute indépendamment — pas de check de proximité globale.

**La prise de parole n'est pas conditionnée à la proximité.** Elle fait partie du scénario : un personnage peut appeler quelqu'un de l'autre côté de la pièce. Deux scénarios peuvent se coordonner via événements (ex : maman part en cuisine → déclenchement scénario "proposer aide" chez un oncle).

**Performance :** seuls les NPCs en état `walking` reçoivent un update de position chaque frame. Les statiques et assis ne calculent rien. Check inter-NPCs toutes les secondes (pas chaque frame).

### Scénarios par type

```ts
type Scenario = {
  id: string
  weight: number          // probabilité relative
  duration: [number, number]  // [min, max] en secondes
  states: ScenarioStep[]
}

type ScenarioStep =
  | { type: 'walk'; target: Vector3 }
  | { type: 'sit'; target: string }   // id du meuble
  | { type: 'idle'; duration: number }
  | { type: 'dialogue'; text: string; direction?: Vector3 }  // spatial, pas proximity
  | { type: 'react_to_player' }       // head turn si joueur proche
```

**Exemples par type :**

| Type | Scénarios typiques |
|------|--------------------|
| `maman` | aller cuisine, s'asseoir table, servir, parler à tante |
| `enfant` | courir traverser pièce, se cacher sous table, revenir |
| `oncle` | rester assis, rire, appeler quelqu'un de loin, se lever chercher à boire |
| `cousin` | courir, chercher cachette, s'asseoir console, interpeller cousin |
| `tante` | assis table, discuter, se lever câliner enfant qui passe |
| `grand_oncle` | `watch_tv`, `laugh_at_tv`, `adjust_on_couch`, `look_around` |

### Grand-oncle — scénarios couch-bound

Même modèle que les autres. **Aucun scénario avec `walk`.** Il ne quitte pas le canapé. Il réagit au joueur qui s'approche (head turn) comme n'importe quel adulte.

**Ce qui le distingue : aucun scénario ne cible le grand-oncle comme destinataire d'un dialogue. Personne ne l'appelle. Il ne répond à personne.**

`excludeFromSocialGraph: true` dans sa config — les scénarios des autres NPCs ne peuvent pas le cibler comme destinataire.

### Grand-oncle entre visites

Quand le joueur quitte la zone salon (distance > 8m du centre), le grand-oncle choisit aléatoirement parmi :
- Canapé (60%)
- Debout près du buffet (20%)
- Debout côté fenêtre (20%)

Persiste dans `gameStore` (`grandUnclePosition`). Le joueur revient — il est ailleurs. Aucune explication.

### `npcSystem.ts` — API pure (TDD)

```ts
type ScenarioStep = { type: string; [key: string]: unknown }
type Scenario = { id: string; weight: number; duration: [number,number]; steps: ScenarioStep[] }

pickScenario(scenarios: Scenario[], seed: number): Scenario
getNextStep(scenario: Scenario, stepIndex: number): ScenarioStep | null
shouldUpdatePosition(npcState: string): boolean   // true only if 'walking'
getGrandUnclePosition(seed: number): 'couch' | 'buffet' | 'window'
shouldTurnTowardPlayer(pos: Vector3, playerPos: Vector3, threshold: number): boolean
```

---

## Joueur dans le salon

**Contrôles** (spec V9) :
- WASD / stick gauche : déplacement
- Souris / stick droit : regard
- E / Croix : se cacher (sous table, derrière canapé)
- RT maintenu : marcher doucement

**Réactions par proximité (<2m) :**
- Tier 1 : change d'état, peut regarder l'enfant
- Tier 2 : tourne la tête
- Grand-oncle : tourne la tête vers le joueur, léger ajustement sur le canapé — réagit comme les autres

**Stillness** : `useStillness` hook actif — immobilité → couche audio mémoire monte légèrement.

**Aucun fail state. Aucun objectif affiché.** Scène de vie.

---

## Indices passifs — récapitulatif

| Indice | Mécanisme | Moment |
|--------|-----------|--------|
| Pas de chaise pour le grand-oncle | Count des chaises = 20, personnes = 22 (bébé + grand-oncle hors table) | Dès le début |
| Personne ne lui parle | Comportement NPC — aucune interaction initiée vers lui | Observation prolongée |
| Il a bougé | Position différente si joueur revient dans le salon | Après avoir quitté la pièce |
| Chien regarde différemment | (ch2, pas dans cette scène) | — |
| Miroir sans reflet | (ch3, pas dans cette scène) | — |

---

## Prototype : sous-titres à la place de l'audio

Pour le prototype, les voix espagnoles sont remplacées par des **sous-titres flottants** au-dessus de chaque NPC.

**Format :** `[Oncle 1] ¿Y cómo va el trabajo?` — apparaît 2.5s, fade out.  
**Implémentation :** `<Html>` de Drei (DOM au-dessus du mesh NPC, billboard).

**Avantages :**
- Le contenu espagnol est écrit maintenant → travail d'auteur fait en proto
- Valide la variété, le timing, la dynamique sociale sans audio
- Quand les voix sont enregistrées : textes → sous-titres sous l'audio (spec V9, accessibilité)
- Beau-frère enregistre en lisant la liste des répliques — aucun travail en double

**Nommage proto :** `Oncle 1`, `Tante 2`, `Cousin 1`, etc.  
**Nommage final :** prénoms mexicains réels (`Tío Carlos`, `Mamá`, `Abuela`…) avec les assets audio.

**Architecture couches temporelles (anti-répétition sur 15 min) :**

| Couche | Durée | Description |
|--------|-------|-------------|
| Micro | 2–5s | Gestes idle par NPC (nod, regarder assiette, prendre verre) |
| Individuel | 15–45s | Scénario + sous-titre par NPC — 20–30 scénarios par type |
| Social | 60–180s | Événement cross-NPC rare et scripté (appel cuisine, cousins qui courent) |
| Arc soirée | 3 phases / 15 min | 0-4min repas actif → 4-9min transition → 9-15min fin repas |

---

## Tests

- `src/game/systems/npcSystem.ts` → TDD strict, Vitest
- `src/game/store/gameStore.ts` → ajouter `grandUnclePosition` state + tests
- Scène R3F → validation manuelle uniquement
- Les 42 tests existants doivent rester verts

---

## Critères de validation manuelle

- [ ] Salon rendu en cel-shading, contours noirs
- [ ] Grand-oncle visible dès l'entrée, sur le canapé côté droit
- [ ] 3+ NPCs Tier 1 bougent de façon autonome et variée
- [ ] NPCs Tier 2 ont animations idle (tête, légères)
- [ ] Approcher un NPC déclenche une réaction
- [ ] Grand-oncle réagit si quelqu'un s'assoit à côté (retire pieds)
- [ ] Grand-oncle ne parle à personne, personne ne lui parle
- [ ] Quitter et revenir → grand-oncle potentiellement en position différente
- [ ] 20 chaises visibles à table
- [ ] Stillness déclenche changement audio
- [ ] 42 tests verts (`npm test`)
- [ ] 0 erreur TypeScript (`npx tsc --noEmit`)
