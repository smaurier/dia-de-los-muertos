# Pipeline assets IA — Design

**Date :** 2026-07-10
**Statut :** validé en brainstorm (section par section)
**Objectif :** production finale — les assets générés sont des candidats à la version release, remplaçables individuellement (notamment par une passe humaine ultérieure sur voix et chanson).

## Décisions cadres

| Décision | Choix |
|---|---|
| Objectif qualité | Production finale (pas du jetable de prototype) |
| Budget | Phase 1 = 0 €. Paiements ponctuels ciblés (~10-25 €/outil/mois) déclenchés par plafond constaté, jamais planifiés |
| Voix | Tout IA d'abord, passe humaine ensuite (fichiers remplaçables un par un) |
| Animation persos | Rig + clips (pas d'animation en bloc) |
| Blender | Jamais en manuel — uniquement headless scripté (l'utilisateur ne connaît pas Blender) |
| Décomposition | Cette spec = pipeline assets. Le design des pièces de la maison = spec séparée, menée en parallèle. 3D environnements attend cette 2e spec |
| Ordre d'exécution | 1. Audio 6 couches + SFX → 2. Voix → 3. Persos 3D → 4. Environnements (après spec pièces) |

## Contrainte matérielle

GPU local = GTX 1660 Ti 6 Go : génération 3D locale exclue. Tout passe par services web gratuits (Hugging Face Spaces) ou free tiers.

## Contrainte licence (garde-fou central)

Le repo est sous licence propriétaire (tous droits réservés). Tout asset entrant doit être commercialement exploitable et traçable :

- **OK build finale :** sorties TRELLIS 2 (MIT), Hunyuan3D (open source), Mixamo (gratuit commercial), freesound CC0, sorties d'abonnements payants (Suno Pro, ElevenLabs payant, Tripo/Meshy payant)
- **JAMAIS build finale :** sorties free tier Suno/Tripo/Meshy (licences non-commerciales) — matériel de validation uniquement, hors repo
- **Registre :** `docs/references/ASSETS-LEDGER.md` — une ligne par asset (source, outil+modèle, date, licence, prompt). Règle dure : pas d'asset dans `public/` sans ligne dans le ledger

## Phasage

**Phase 1 — 0 €**

| Filière | Outil gratuit | Limite acceptée |
|---|---|---|
| Concept art | Nano Banana (free tier Gemini) | Quota journalier |
| 3D persos/props | Hunyuan3D 2.1 / TRELLIS 2 via HF Spaces | Queues, itérations lentes |
| Rig + clips | Mixamo | Humanoïdes uniquement |
| Optimisation mesh | gltf-transform (CLI npm) | — |
| Conversion GLB↔FBX | Blender headless (scripts fournis) | — |
| SFX courts | ElevenLabs SFX v2 free (~10 min/mois) | Volume limité |
| Ambiances longues | freesound.org (CC0 strict) | Recherche manuelle |
| Voix | ElevenLabs free (Voice Library d'abord) | ~6 voix, priorisées |
| Chanson (exploration) | Suno free | Non-commercial : validation mélodie only |

**Phase 2 — déclencheurs ponctuels**

| Déclencheur constaté | Achat | Coût |
|---|---|---|
| Mélodie validée en free | Suno Pro 1 mois — régénérer keeper + TOUTES les variantes le même mois | ~10 € |
| Free tier étrangle la génération des 22 NPCs voix | ElevenLabs Creator 1 mois | ~22 € |
| Rig/mesh raté après 2-3 itérations gratuites sur un perso clé | Tripo ou Meshy 1 mois | ~15-20 € |

## Filière 1 — 3D personnages

Chaîne :

```
Nano Banana (feuille de perso : T-pose, fond neutre, 3/4, style cel-shading)
  → Hunyuan3D 2.1 (HF Spaces, 1er choix) / TRELLIS 2 (secours qualité) → GLB
  → npm run optimize-model   (gltf-transform : simplify ~5-15k tris, prune, resize textures 1k)
  → npm run to-fbx           (Blender --background, script glb_to_fbx.py)
  → Mixamo (web) : auto-rig + clips idle / walk / sit / talk gestures
  → npm run from-fbx         (Blender --background → GLB final)
  → useGLTF + useAnimations (Drei), MeshToonMaterial + gradientMap existant par-dessus
```

- Prompt template Nano Banana partagé (palette, proportions cartoon, contours) pour verrouiller la cohérence DA sur les 22 NPCs. Feuilles dédiées plus soignées : grand-oncle (guayabera), enfant, chien
- Feuilles archivées dans `docs/references/characters/<npc-id>/`
- Le cel-shading vient du shader R3F, pas du modèle → cohérence visuelle garantie même si les meshes varient
- Mesh défectueux (trous, membres fusionnés) : on régénère avec une meilleure image de référence, on ne répare pas à la main
- **Chien** : Mixamo ne rigge pas les quadrupèdes. Options : pack CC0 (Quaternius) ou animation procédurale. Tranché quand le chien arrive au backlog
- **Pilote qualité : le grand-oncle** (perso le plus regardé). Validé in-engine → industrialisation des 21 autres. Raté après 2-3 itérations → déclencheur phase 2

## Filière 2 — Audio 6 couches + SFX

Sources :
- **ElevenLabs SFX v2 free** : sons spécifiques courts (morsure pomme, craquement précis, respiration chien, crépitement bougie). Boucles seamless natives, 48 kHz
- **freesound.org CC0** : lits d'ambiance longs (rumeur repas familial, maison nocturne, grillons)

| Couche | Contenu | Source principale |
|---|---|---|
| SALON | Lit rumeur familiale + couverts + rires ponctuels | freesound (lit) + ElevenLabs (ponctuels) |
| HOUSE | Craquements parquet, horloge, frigo lointain, vent | ElevenLabs (boucles courtes) |
| MEMORY | Sons sans source : rire d'enfant lointain, radio ancienne étouffée | ElevenLabs |
| ANIMAL | Griffes carrelage, halètement, soupir | ElevenLabs |
| SONG | Chanson (filière 4) | Suno |
| SILENCE | Respiration enfant, acouphène léger | ElevenLabs |

- Post-traitement : `npm run process-audio` (ffmpeg) — loudnorm par couche, conversion webm + mp3 fallback, vérification boucle
- Convention : `public/audio/layers/<layer>/<name>.webm`
- `src/audio/manifest.ts` : chaque couche déclare fichiers, volumes relatifs, flags loop. Consommé par `AudioLayerManager` (logique déjà testée). Test ajouté : validité du manifest
- **Pilote qualité : la couche MEMORY** (sons "sans source" crédibles = le plus dur). Critère spec : « quand la couche salon disparaît presque, l'enfant est vraiment perdu » — validation au casque, marche salon → couloir profond

## Filière 3 — Voix NPCs + grand-oncle

- Scripts = scénarios espagnols existants de `familyConfig.ts` (les sous-titres actuels)
- **~6 voix pour 22 NPCs** (2 hommes, 2 femmes, 1 enfant, 1 âgée — variées en pitch/vitesse). Les voix sont du son spatial, jamais du dialogue frontal (spec) → la réutilisation passe inaperçue
- Voice Library (gratuite) filtrée espagnol mexicain d'abord ; Voice Design v3 seulement si manque
- Priorisation free tier : 1. grand-oncle + ligne pivot « ¿Dónde aprendiste esa canción? » → 2. Tier 2 → 3. Tier 3 (étalé ou déclencheur Creator)
- **Fredonnement grand-oncle** : ElevenLabs v3 audio tags (`[hums softly]`) à tester tôt — son le plus important du jeu. Plan B : hum extrait d'une variante Suno. Pilote qualité de cette filière
- Intégration : `public/audio/voices/<npc-id>/<scenario-id>.webm`, moulinette ffmpeg commune, champ `voiceId` dans `familyConfig`, Howler spatial (position NPC → volume/pan). Sous-titres conservés = accessibilité
- Passe humaine future : un fichier par réplique → remplacement fichier par fichier, zéro changement de code

## Filière 4 — La chanson

Trois formes, même mélodie :
1. Fredonnement distrait du grand-oncle (couloir) — couche SONG
2. Fredonnement de l'enfant (salon, fin)
3. Version chantée avec paroles (placement final à confirmer au design des chapitres)

- **Paroles écrites par nous** (berceuse mexicaine originale, espagnol simple, 2 couplets, validation authenticité possible par locutrice native). Suno en custom lyrics
- Phase 1 (Suno free) : 10-20 variantes pour choisir LA mélodie — validation uniquement, hors repo
- Phase 2 (Suno Pro 1 mois) : régénérer la keeper + toutes les variantes le même mois (chantée, hum homme âgé via cover, hum enfant, instrumentale) — les droits couvrent ce qui est généré pendant l'abonnement
- Cohérence hum/voix parlée du grand-oncle : tester les deux options (Suno cover vs ElevenLabs `[hums]`) en phase 1
- Intégration : couche SONG + `songSystem` existants — on branche des fichiers, pas de nouveau code
- Si le résultat sonne « IA » après le mois Pro : premier candidat à la passe humaine (guitare + voix humaine)

## Organisation & code

```
public/
├── audio/
│   ├── layers/<layer>/<name>.webm|.mp3
│   └── voices/<npc-id>/<scenario-id>.webm
└── models/
    ├── characters/<npc-id>.glb
    └── props/<name>.glb                    # après spec pièces
scripts/
├── glb_to_fbx.py / fbx_to_glb.py           # Blender headless
├── optimize-model.mjs                      # gltf-transform
└── process-audio.mjs                       # ffmpeg
docs/references/
├── characters/<npc-id>/                    # feuilles Nano Banana
└── ASSETS-LEDGER.md                        # registre licences
```

Code touché (minimal) :
- `src/audio/manifest.ts` (nouveau) + test
- `familyConfig.ts` : champs `voiceId`, `modelPath` + test de complétude
- `FamilyMember.tsx` / `GrandUncle.tsx` : `useGLTF` + `useAnimations`, mapping state machine → clips, `MeshToonMaterial` appliqué par-dessus
- Howler spatial pan/volume par position NPC

Prérequis outillage (une fois) : Blender installé (headless only), ffmpeg, `@gltf-transform/cli` en devDependency, comptes gratuits HF / ElevenLabs / Suno.

## Performance

Budget : 22 persos × ~10k tris, textures 1k. Premier import = mesure réelle (draw calls, FPS) contre la baseline du salon actuel avant d'industrialiser.

## Tests & validation

- Logique pure : suite existante inchangée (65+ tests). Ajouts : manifest audio, complétude familyConfig
- Scène 3D / audio : validation manuelle (convention projet)
- Pilotes qualité par filière : grand-oncle (3D), couche MEMORY (audio), fredonnement (voix), mélodie keeper (chanson) — chacun valide sa filière avant industrialisation

## Hors scope de cette spec

- Design des pièces de la maison (spec séparée, en parallèle)
- 3D environnements (dépend de la spec pièces)
- Cinématiques vidéo IA (Kling/Veo) — réservées à un éventuel trailer, pas d'usage in-game (casserait le régime de réalité)
- Comportement du chien (backlog)
