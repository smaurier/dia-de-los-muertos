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

### États `FamilyMember` (Tier 1)

```
idle → walking → sitting → reacting → idle
```

**Transitions :**
- `idle → walking` : timer aléatoire (3–8s) ou stimulus NPC voisin
- `walking → sitting` : arrivée au waypoint avec chaise/canapé disponible
- `any → reacting` : joueur à moins de 2m OU action NPC remarquable
- `reacting → idle` : après 1–2s

**Aléatoire :** `getNextWaypoint()` utilise un seed par NPC — reproductible mais varié entre sessions.

### États `GrandUncle`

```
watching_tv ↔ laughing ↔ adjusting ↔ observing
```

| État | Déclencheur | Description |
|------|-------------|-------------|
| `watching_tv` | défaut | Pieds sur repose-pied, regard télé |
| `laughing` | bruit/activité proche | Corps légèrement secoué |
| `adjusting` | NPC s'assoit sur canapé | Retire pieds du repose-pied, se range |
| `observing` | mouvement dans la zone | Tête tourne vers l'activité, pas vers le joueur |

**Règle absolue :** pas d'état `walking`. Il ne quitte pas le canapé. Toutes ses transitions sont des réponses à stimuli — jamais des décisions autonomes. **Personne ne lui parle. Il ne parle à personne.**

### Grand-oncle entre visites

Quand le joueur quitte la zone salon (distance > 8m du centre), le grand-oncle choisit aléatoirement parmi :
- Canapé (défaut, 60% probabilité)
- Debout près du buffet (20%)
- Debout côté fenêtre (20%)

Son état persiste dans `gameStore` (`grandUnclePosition`). Le joueur revient — il est ailleurs. Aucune explication.

### `npcSystem.ts` — API pure

```ts
type Tier = 1 | 2 | 3
type NPCState = 'idle' | 'walking' | 'sitting' | 'reacting'
type GrandUncleState = 'watching_tv' | 'laughing' | 'adjusting' | 'observing'
type Stimulus =
  | { type: 'player_proximity'; distance: number }
  | { type: 'npc_nearby'; action: NPCState }
  | { type: 'timer'; elapsed: number }

getNextWaypoint(npcId: string, waypoints: Vector3[], seed: number): Vector3
getReactionState(current: NPCState, stimulus: Stimulus, tier: Tier): NPCState
getGrandUncleState(current: GrandUncleState, stimulus: Stimulus): GrandUncleState
shouldReactToProximity(pos: Vector3, playerPos: Vector3, threshold: number): boolean
getGrandUnclePosition(seed: number): 'couch' | 'buffet' | 'window'
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
- Grand-oncle : aucune réaction directe au joueur — continue ce qu'il fait

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
