# Fiche pièce — La cuisine

**Statut :** draft (pilote du template)
**Spec parente :** `../2026-07-10-house-rooms-design.md`

## 1. Identité

- **Chapitre :** 2 (première exploration), traversée au ch9 (retour court patio→cuisine→salon)
- **Rôle narratif :** *Le chien. La mémoire des murs.* Première leçon du jeu : s'arrêter fait remonter quelque chose
- **Boucle émotionnelle :** trivial chaleureux en surface, premier frisson de mémoire en profondeur. C'est ici que le joueur apprend — sans tutoriel — que l'immobilité est une mécanique
- **Ancre :** géométrie invariable, tous chapitres. La cuisine ne ment jamais

## 2. Layout spatial

Dimensions : **6m (E-O) × 5m (N-S)**, plafond 2.6m. depthZone = 1.

```
                  NORD
   ┌────────porte patio─────────┐
   │  ╔══════════╗    [fenêtre] │
   │  ║ plan de  ║   ┌────────┐ │
   │  ║ travail  ║   │cuisin- │ │
   │  ║ (restes) ║   │ière +  │ │
   │  ╚══════════╝   │vaporera│ │
 O │                 └────────┘ │ E
 U │   ┌─────────┐              │
 E │   │  TABLE  │   ┌──────┐   │
 S │   │ + chien │   │frigo │   │
 T │   │ dessous │   └──────┘   │
   │   └─────────┘        ┌───┐ │
   │ ▓passage▓            │éta│ │
   │ ▓salon──▓  (coin sud-│gèr│ │
   │ ▓(large)▓   est: mur │es │ │
   └─┴────────┴──pierres)─┴───┴─┘
                  SUD
```

- **Passage salon (mur ouest, large, sans porte)** : le son du salon entre presque plein — on quitte la chaleur sans la perdre
- **Porte patio (mur nord)** : banale, ouvrable dès ch2. Donne sur la cour de nuit (états ofrenda gérés par la fiche patio)
- **Coin sud-est — mur en pierres apparentes** : vestige de la construction d'origine, plus vieux que le reste. C'est LE coin que le chien regarde. Rien ne le signale
- **Vue enfant (1.1m)** : le plan de travail domine (surface invisible d'en bas — les restes de préparation se devinent aux bords qui dépassent). Le dessous de table = refuge naturel, à hauteur exacte du regard. Le chien est le seul être au niveau de l'enfant

## 3. Props + set dressing

**Narratifs** (Outline, modélisation soignée) :
| Prop | Beat porté |
|---|---|
| Mur de pierres du coin sud-est (matériau distinct) | La chaleur dans les pierres — révélation stillness |
| Ampoule nue qui clignote (plafond, fil apparent) | Micro-tension permanente — « parce qu'elle est vieille » |
| Bol de pétales de cempasúchil sur le plan de travail | Préparation de l'ofrenda — plante le chemin de pétales avant qu'on le comprenne |
| Porte patio | Le retour court (ch9) |

**Triviaux** (modélisation standard) :
- Table en bois + 3 chaises dépareillées (une bancale)
- Vaporera cabossée sur la cuisinière (tamales — la vapeur porte l'odeur vers le salon)
- Cazuelas en terre cuite empilées, comal, molcajete
- Vaisselle sale en pile instable dans l'évier, torchons
- Frigo années 90, aimants, photos d'école aux coins racornis
- Image de la Virgen de Guadalupe au mur + calendrier de carnicería
- Radio ancienne sur une étagère, éteinte *(dialogue silencieux avec la couche MEMORY — c'est elle qu'on entendra « sans source » ailleurs dans la maison)*
- Panier du chien, usé, poils — vide (il préfère le dessous de table)

**Remplissage** (pas d'Outline) :
- Placards hauts et bas, étagères + bocaux (piloncillo, haricots, maïs)
- Cagettes de fruits au sol, balai dans l'angle, poubelle, casseroles suspendues

## 4. Lumière + palette

- **Position sur l'axe froid→chaud :** tiède — plus sombre que le salon, plus chaude que le couloir. L'antichambre du froid
- **Sources :**
  - Ampoule nue centrale — `#f5e3b0`, intensity 1.2, **flicker** (réutiliser la logique AnimatedCandle : baisse aléatoire brève toutes les 6-14s)
  - Veilleuse cuisinière + flamme pilote — `#f0a860`, intensity 0.3, portée courte
  - Porte patio (nuit) — `#7a8fc0`, intensity 0.25 — la lame froide qui annonce l'extérieur
  - Rebond salon par le passage ouest — `#f0d890`, intensity 0.2
- **Zones d'ombre voulues :** sous la table (refuge), coin sud-est des pierres (l'œil doit pouvoir y glisser sans s'y accrocher — jusqu'au beat)

## 5. Beats + triggers + sons

**Zones de trigger** (déclarées dans `roomConfig`) :
| Zone | Emplacement | Déclenche |
|---|---|---|
| `kitchen-entry` | passage salon | Jalon chapitre 2 (première entrée) |
| `kitchen-still-spot` | 1.5m autour du chien | Beat stillness (voir ci-dessous) |
| `under-table` | sous la table | Refuge cache-cache (réutilise stillnessSystem) |
| `patio-door` | seuil nord | Transition patio |

**Beat central — la mémoire des murs** (`kitchen-still-spot` + stillness ≥ seuil) :
1. Le chien ouvre un œil (pas la tête — juste l'œil)
2. Il regarde le coin sud-est, 2-3 secondes
3. Il referme l'œil
4. Le coin : les pierres gagnent une chaleur — shift de teinte très léger (`#8a7a6a` → `#9a7a5a`, lerp 4s), une vapeur à peine perceptible
5. Couche MEMORY monte : crépitement d'un feu qui n'existe pas, très bas
6. **L'enfant renifle, audiblement** — deux petites inspirations nasales (couche SILENCE/respiration, déjà canal du jeu quand il se cache). C'est le son qui dit « odeur » à tous les joueurs. Enregistrable maison (0 €)
7. Sous-titre contextuel (accessibilité, optionnel) : *[Un olor dulce. Antiguo.]* — le texte complète, il ne porte pas seul
8. Le joueur bouge → tout redescend en 2s. Aucune trace. Rejouable, mais la révélation ne s'amplifie pas

**Note playtest (risque assumé) :** la cuisine est le tutoriel silencieux de la mécanique stillness — rien ne garantit que le joueur s'accroupisse près du chien. Pari : le magnétisme naturel du chien + le dessous de table qui appelle l'enfant. Si les playtests montrent que le beat est raté trop souvent : activer l'aimant sonore — le chien gémit doucement en rêvant (couche ANIMAL). Option en réserve, pas activée.

**Sons par couche :**
| Couche | Contenu ici |
|---|---|
| SALON | Quasi plein (depthZone 1) : voix, couverts, « ¡Ven a comer! » à travers le passage |
| HOUSE | Frigo (bourdonnement), goutte de l'évier (irrégulière, 8-20s), buzz de l'ampoule au flicker, vaporera (bouillonnement léger) |
| MEMORY | Crépitement de feu ancien — uniquement pendant le beat stillness |
| ANIMAL | Respiration lente du chien, pattes qui bougent (il rêve), soupir |
| SONG | Absente (ch1-2) |
| SILENCE | Reniflement de l'enfant pendant le beat stillness (2 inspirations nasales) |

**États par chapitre** (règle du hors-regard) :
- ch2 : chien sous la table (dort). Vaporera fume
- ch5+ : chien absent (il est « ailleurs » — réapparaît ch7-8). Vaporera éteinte
- ch9 (retour) : lumière identique, vaisselle propre égouttée, bruits de fin de soirée depuis le salon — la cuisine a été rangée pendant qu'on était perdu. Personne ne le commente

## 6. Concept art (à générer — Gemini / Nano Banana)

Images attendues dans `docs/references/rooms/cuisine/` :

**Prompt 1 — vue d'entrée (angle joueur) :**
> *[BASE PROMPT maison] + A cozy small Mexican kitchen seen from the living-room doorway at a child's eye level: a wooden table in the foreground with a sleeping dog underneath, a bare flickering lightbulb hanging from the ceiling, a battered tamale steamer on the stove releasing gentle steam, an old stone wall corner in the back right shadow, a night-blue door to the patio in the back wall.*

**Prompt 2 — le coin des pierres (mood du beat) :**
> *[BASE PROMPT maison] + Close corner of an old exposed-stone wall in a dim kitchen, faint warm glow emanating from within the stones as if they remember a fire, barely visible wisp of steam, a dog's eye watching from under a table in the foreground shadow, quiet and tender, not scary.*

Prompts conservés ici (reproductibilité). Ajouter les images générées + retenir ce qui diverge de la fiche.
