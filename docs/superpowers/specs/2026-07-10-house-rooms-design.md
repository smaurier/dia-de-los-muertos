# Design des pièces de la maison — Format, topologie, système

**Date :** 2026-07-10
**Statut :** validé en brainstorm (section par section + critique intégrée)
**Périmètre :** template de fiche pièce, topologie de la maison, système technique chapitres/variantes, process de production. Les fiches elles-mêmes (sauf pilote cuisine) sont produites ensuite, une par session.
**Spec sœur :** `2026-07-10-ai-asset-pipeline-design.md` — le pipeline qui produira les assets que les fiches commandent.

## Principes hérités de la spec V10 (rappels contraignants)

- Le son = 70% de l'expérience : la topologie est d'abord un gradient sonore
- Réalisme magique = régime par défaut : jamais de verrou-mystère, jamais d'étrange frontal
- L'attention du joueur construit l'expérience : **chapitre = état de la maison, jamais un rail**
- Caméra enfant 1.1m : chaque pièce se conçoit vue d'en bas

## 1. Template de fiche pièce

Un fichier par pièce : `docs/superpowers/specs/rooms/<pièce>.md`. Six volets obligatoires :

1. **Identité** — chapitre(s), rôle narratif en une phrase, place dans la boucle émotionnelle (trivial / étrange / refuge)
2. **Layout spatial** — dimensions, plan ASCII coté (portes, fenêtres, circulation), connexions par chapitre, lecture à hauteur d'enfant (ce qui domine, ce qui abrite)
3. **Props + set dressing** — hiérarchie 3 niveaux :
   - *Narratifs* (portent un beat) — modélisation soignée, Outline
   - *Triviaux* (racontent la vie) — modélisation standard
   - *Remplissage* — génération rapide, pas d'Outline
   → carnet de commandes direct du pipeline 3D
4. **Lumière + palette** — position sur l'axe froid→chaud, sources (type, hex, intensité — format des configs salon), zones d'ombre voulues
5. **Beats + triggers + sons** — zones de trigger au plan, sons par couche (mapping manifest audio spec 1), états par chapitre (voir règle du hors-regard)
6. **Concept art** — 1-2 images Nano Banana (angle joueur, lumière du chapitre), archivées `docs/references/rooms/<pièce>/`, prompts conservés dans la fiche

**Prompt de base maison (cohérence inter-fiches) :** défini une seule fois ci-dessous, chaque fiche l'étend sans le modifier. Sans lui, 6 fiches générées à des semaines d'écart dérivent en style.

> *Base prompt : Mexican family home interior, 1990s, painted anime style (Ghibli-like), soft painterly textures, visible brushwork feel, warm terracotta and cream walls, ceramic tile floors, seen from a child's eye level (1.1m), Día de Muertos evening, candle-lit warmth against cool blue night shadows. The home is completely ordinary — NO altar, NO sugar skulls, NO votive candle shrines, NO framed portraits with candles; festival traces stay subtle.*

**Statut DA (décision 2026-07-10) :** le style *peint/animé* des concepts est adopté comme **cible de mood** (test cuisine-entree-01 concluant, préféré au cel-shading strict initial). L'interdit « maison ordinaire, pas de décor Día de Muertos hors patio » est intégré au prompt de base — première génération avait dérivé (mini-ofrendas partout). Rendu in-engine : **expérience « toon riche » à mener** (gradient 4-5 bandes, fog coloré, bloom doux, palette calée sur les concepts) avant d'amender la DA de la V10 — la matière picturale vraie (textures peintes) reste hors budget pipeline. Concepts = référence de lumière et composition, pas de promesse de rendu.

## 2. Topologie de la maison

**Principe directeur : la profondeur sonore.** Pièces organisées par distance audio au salon. Maison de plain-pied, en anneau autour du patio arrière.

```
                    NORD
   ┌──────────┬──────────────┬───────────┐
   │ DÉBARRAS │   CHAMBRE    │           │
   │  (ch7)   │    (ch6)     │   PATIO   │
   ├──────────┴──┬───────────┤  ofrenda  │
   │  COULOIR INTÉRIEUR (ch5)│  à l'EST →│
   ├─────────────┬───────────┤   (ch8)   │
   │  TOILETTES  │  COULOIR  │           │
   │             │ + miroir  ├───porte───┤
   ├─────────────┴─(ch3/ch9)─┤           │
   │                         │  CUISINE  │
   │     SALON  14×10        │   (ch2)   │
   │     (ch1/ch4/ch9)       │           │
   └─────────────────────────┴───────────┘
                    SUD (entrée)
```

**Connexions :**
- Salon ↔ cuisine : passage large, direct (odeurs, « ¡Ven a comer! », circulation du chien)
- Salon ↔ couloir : l'axe de l'adulte (toilettes = sa raison ordinaire ch3), miroir mur ouest
- Couloir → couloir intérieur : la frontière. Avant ch5 : porte fermée, triviale (pas verrouillée-mystère). « Por allá no vayas »
- Couloir intérieur → chambre, débarras
- Débarras → patio : on émerge du point le plus étouffé vers la nuit ouverte — contraste maximal, voulu
- **Patio ↔ cuisine : le retour court.** Porte visible dès ch2, banale, **ouvrable**. Le chemin de pétales ramène par là au ch9 : le salon était à 15 mètres depuis le début

**Anti-spoiler ch8 — l'ofrenda a des états, pas la porte un verrou :** un joueur qui sort au patio dès ch2 trouve une cour de nuit banale. La photo est trop loin / mal éclairée pour être lue, la morsure n'existe que scriptée au beat ch8, la chanson n'y joue pas encore. Le lieu existe toujours ; c'est le *moment* qui le charge. Les états de l'ofrenda par chapitre sont documentés dans la fiche patio.

**Ambiguïté structurelle (voulue) :** aller = salon→cuisine→couloir→intérieur→chambre→débarras→patio, long, la maison grandit. Retour = patio→cuisine→salon, 20 secondes. Les deux lectures (la maison a grandi / l'enfant s'est perdu tout seul) restent vraies. C'est le critère de réussite niveau 3 de la V10.

**Croissance par variantes :**

| Élément | Maison normale (ch1-4) | Maison grandie (ch5+) |
|---|---|---|
| Couloir | 8m, 3 portes | 14m, 5 portes (2 nouvelles, entrouvertes) |
| Couloir intérieur | n'existe pas (porte fermée) | ouvert, 12m |
| Chambre / débarras | inaccessibles | accessibles |
| Sons salon | pleins | -6dB par zone de profondeur |

**Les ancres (salon, cuisine, patio) ne changent JAMAIS de géométrie.** Leur set dressing et leur arc NPC évoluent (fin de soirée ch9, grand-oncle déplacé ch4, états ofrenda) — le mensonge géométrique est réservé à l'entre-deux (couloirs, chambre, débarras).

## 3. Système technique

**Chapitres = état, pas écrans, pas rails.** Soirée continue, zéro chargement. `gameStore` étendu : `currentChapter` (1-9). Transitions = jalons franchis par le joueur (première entrée, beat vécu), jamais des minuteries ni un ordre forcé. Certains beats s'attachent à la position du joueur, pas au chapitre (l'adulte va aux toilettes quand l'enfant est dans le couloir). Le `chapterSystem` doit tolérer les ordres non prévus.

**Une pièce = un composant, une variante = une prop.**
```
src/scene/
├── house/House.tsx              # assemblage : monte les pièces selon chapitre + position
├── rooms/
│   ├── salon/                   # existant, déplacé
│   ├── kitchen/Kitchen.tsx
│   ├── corridor/Corridor.tsx    # <Corridor variant="normal" | "grown" />
│   └── ...
└── shared/                      # toonGradient, AnimatedCandle, PapelStrand
```
Variante = géométrie conditionnelle dans le composant, pas de fichier dupliqué. Configs par pièce dans `roomConfig.ts` (dimensions, connexions, zones, depthZone) — testables sans WebGL.

**Règle du hors-regard (généralisée) : TOUT changement d'état d'une pièce — variante de géométrie, porte qui s'ouvre, état d'ofrenda, prop déplacé — ne s'applique que si la pièce est ni occupée ni visible par le joueur.** C'est « la maison change pendant qu'on ne regarde pas » transformé en contrainte technique. Jamais de morphing à l'écran. Conséquence : les transitions de chapitre ne s'appliquent aux pièces qu'à la prochaine occasion hors-regard, pas instantanément.

**Triggers : `triggerSystem.ts`** (logique pure, TDD) — zones AABB nommées par pièce : transitions de chapitre, révélations stillness (réutilise `stillnessSystem`), apparitions (chien, adulte), départ chanson. Les fiches (volet 5) déclarent leurs zones dans `roomConfig` — la fiche EST la donnée.

**Audio par profondeur :** chaque pièce déclare sa `depthZone` (0 = salon … 4 = débarras) ; mapping zone → volumes des 6 couches branché sur `AudioLayerManager`. Jonction avec le manifest audio de la spec 1.

**Perf :** pièces non adjacentes au joueur démontées (l'anneau garantit max 3 pièces montées). Les 22 NPCs restent au salon — le reste de la maison est vide de personnages, par design narratif autant que perf.

**Tests :** `chapterSystem` (y compris ordres non linéaires), `triggerSystem`, validité `roomConfig` (connexions symétriques, zones dans les bounds, depthZones cohérentes) = Vitest. Rendu = manuel, convention projet.

## 4. Process de production des fiches

Ordre (une fiche par session, commit séparé) :

1. **Cuisine** — pilote, valide le template
2. **Couloir** — ch3/ch9 + variante grandie ch5 (miroir, adulte, photo au mur)
3. **Couloir intérieur** — n'existe qu'en variante grandie
4. **Chambre** — ch6
5. **Débarras** — ch7
6. **Patio/ofrenda** — ch8, la plus riche en beats (+ états ofrenda par chapitre, anti-spoiler)
7. **Salon — addendum variantes** — ch4 (grand-oncle déplacé), ch9 (fin de soirée) : set dressing et arc NPC seulement, géométrie intouchée

Process par fiche : draft complet par Claude (volets 1-5 + prompts) → relecture Sylvain → génération concept art (Gemini, prompts fournis) → ajustement si l'image révèle un problème → gel → les props entrent au carnet de commandes du pipeline 3D.

**Garde-fou temps :** une fiche = une session bornée (~1h), jamais sur les créneaux autoformation mardi/mercredi. RGAA (22 oct) et refonte curriculum restent prioritaires.

## Hors scope

- Implémentation code (House, chapterSystem, triggerSystem) → plan d'implémentation séparé, après la fiche cuisine
- Les assets eux-mêmes → spec pipeline (spec sœur)
- Comportement du chien, pathing détaillé de l'adulte entre pièces → design dédié ultérieur (dépend des pièces fichées)
- Menu, save/load, options accessibilité → backlog
