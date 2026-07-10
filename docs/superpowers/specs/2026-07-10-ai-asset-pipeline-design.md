# Pipeline assets IA — Design

**Date :** 2026-07-10
**Statut :** validé en brainstorm (section par section)
**Objectif :** production finale — les assets générés sont des candidats à la version release, remplaçables individuellement (notamment par une passe humaine ultérieure sur voix et chanson).

## Décisions cadres

| Décision | Choix |
|---|---|
| Objectif qualité | Production finale (pas du jetable de prototype) |
| Budget | Phase 1 = 0 € STRICT, y compris licences : tout fichier de la build vient d'une source gratuite ET commercial-OK. Paiements ponctuels ciblés (~5-25 €/outil/mois) déclenchés par plafond constaté, jamais planifiés |
| Voix | Tout IA d'abord, passe humaine ensuite (fichiers remplaçables un par un) |
| Animation persos | Rig + clips (pas d'animation en bloc) |
| Blender | Jamais en manuel — uniquement headless scripté (l'utilisateur ne connaît pas Blender) |
| Décomposition | Cette spec = pipeline assets. Le design des pièces de la maison = spec séparée, menée en parallèle. 3D environnements attend cette 2e spec |
| Ordre d'exécution | 1. Audio 6 couches + SFX → 2. Voix → 3. Persos 3D → 4. Environnements (après spec pièces) |

## Contrainte matérielle

GPU local = GTX 1660 Ti 6 Go : génération 3D locale exclue. Tout passe par services web gratuits (Hugging Face Spaces) ou free tiers.

## Contrainte licence (garde-fou central)

Le repo est sous licence propriétaire (tous droits réservés). Tout asset entrant doit être commercialement exploitable et traçable :

- **OK build finale :** sorties TRELLIS 2 (MIT), Hunyuan3D (open source), Mixamo (gratuit commercial), freesound CC0, Pixabay audio (licence commerciale), Kokoro (Apache 2.0), Chatterbox (MIT), ACE-Step (Apache 2.0), enregistrements maison, sorties d'abonnements payants (Suno Pro, ElevenLabs payant, Tripo/Meshy payant)
- **JAMAIS build finale :** sorties free tier Suno/Tripo/Meshy **et ElevenLabs free** (licences non-commerciales, attribution) — matériel de validation/benchmark uniquement, hors repo
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
| SFX courts | freesound.org (CC0 strict) + Pixabay audio (commercial OK) | Recherche manuelle vs génération |
| Ambiances longues | freesound.org (CC0 strict) | Recherche manuelle |
| Voix (production) | Kokoro-82M (Apache 2.0, espagnol) + Chatterbox Multilingual (MIT, contrôle émotion) — HF Spaces ou local CPU | Expressivité < ElevenLabs, à valider au pilote |
| Voix (benchmark) | ElevenLabs free | Non-commercial : référence qualité only, hors repo |
| Fredonnements | Enregistrement maison (Sylvain — pas de mots, accent sans objet) + pitch-shift, ou piste hum ACE-Step | — |
| Chanson (production) | ACE-Step 1.5 (Apache 2.0) — HF Spaces / local | Qualité entre Suno v4.5 et v5 |
| Chanson (exploration) | Suno free | Non-commercial : validation mélodie/style only |

**Phase 2 — déclencheurs ponctuels**

| Déclencheur constaté | Achat | Coût |
|---|---|---|
| Voix Kokoro/Chatterbox trop plates au pilote (grand-oncle) | ElevenLabs Starter 1 mois (licence commerciale, 30 min) | ~5 € |
| SFX introuvables en CC0 et volume voix > Starter | ElevenLabs Creator 1 mois | ~22 € |
| ACE-Step insuffisant sur la chanson après itérations sérieuses | Suno Pro 1 mois — régénérer keeper + TOUTES les variantes le même mois | ~10 € |
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

Sources (0 € commercial-OK) :
- **freesound.org (CC0 strict)** : lits d'ambiance longs (rumeur repas familial, maison nocturne, grillons) + sons spécifiques (couverts, craquements, chien)
- **Pixabay audio (licence commerciale gratuite)** : complément SFX quand freesound ne couvre pas
- **Enregistrement maison** : sons impossibles à trouver (morsure de pomme précise, respiration) — un téléphone suffit, la moulinette ffmpeg nettoie
- ElevenLabs SFX free = benchmark qualité uniquement (non-commercial), jamais dans le repo

| Couche | Contenu | Source principale |
|---|---|---|
| SALON | Lit rumeur familiale + couverts + rires ponctuels | freesound CC0 |
| HOUSE | Craquements parquet, horloge, frigo lointain, vent | freesound/Pixabay + maison |
| MEMORY | Sons sans source : rire d'enfant lointain, radio ancienne étouffée | freesound CC0 retraité (reverb/filtre ffmpeg) |
| ANIMAL | Griffes carrelage, halètement, soupir | freesound/Pixabay + maison (chien accessible ?) |
| SONG | Chanson (filière 4) | ACE-Step |
| SILENCE | Respiration enfant, acouphène léger | Enregistrement maison + freesound |

Le caractère « sans source » de MEMORY vient surtout du traitement (étouffement, réverb lointaine, filtres passe-bas ffmpeg) plus que de la génération — compatible 0 €.

- Post-traitement : `npm run process-audio` (ffmpeg) — loudnorm par couche, conversion webm + mp3 fallback, vérification boucle
- Convention : `public/audio/layers/<layer>/<name>.webm`
- `src/audio/manifest.ts` : chaque couche déclare fichiers, volumes relatifs, flags loop. Consommé par `AudioLayerManager` (logique déjà testée). Test ajouté : validité du manifest
- **Pilote qualité : la couche MEMORY** (sons "sans source" crédibles = le plus dur). Critère spec : « quand la couche salon disparaît presque, l'enfant est vraiment perdu » — validation au casque, marche salon → couloir profond

## Filière 3 — Voix NPCs + grand-oncle

- Scripts = scénarios espagnols existants de `familyConfig.ts` (les sous-titres actuels)
- **~6 voix pour 22 NPCs** (2 hommes, 2 femmes, 1 enfant, 1 âgée — variées en pitch/vitesse + post-traitement ffmpeg). Les voix sont du son spatial, jamais du dialogue frontal (spec) → la réutilisation passe inaperçue
- **Production 0 € : Kokoro-82M** (Apache 2.0, espagnol natif du modèle, HF Spaces ou local CPU) pour le volume Tier 2/3 ; **Chatterbox Multilingual** (MIT, contrôle d'exagération émotionnelle) pour le grand-oncle et les répliques expressives
- ElevenLabs free = benchmark : générer 2-3 répliques de référence pour situer l'écart de qualité, hors repo
- Priorisation : 1. grand-oncle + ligne pivot « ¿Dónde aprendiste esa canción? » (pilote) → 2. Tier 2 → 3. Tier 3
- **Fredonnement grand-oncle** : son le plus important du jeu, et le plus simple à faire à 0 € — **enregistrement maison** (fredonner n'a pas d'accent) pitch-shifté/vieilli au ffmpeg, ou piste hum ACE-Step. Les TTS open source ne fredonnent pas de façon fiable. Pilote qualité de cette filière
- Déclencheur payant : si le pilote grand-oncle sonne plat en Kokoro/Chatterbox → ElevenLabs Starter 1 mois (5 €)
- Intégration : `public/audio/voices/<npc-id>/<scenario-id>.webm`, moulinette ffmpeg commune, champ `voiceId` dans `familyConfig`, Howler spatial (position NPC → volume/pan). Sous-titres conservés = accessibilité
- Passe humaine future : un fichier par réplique → remplacement fichier par fichier, zéro changement de code

## Filière 4 — La chanson

Trois formes, même mélodie :
1. Fredonnement distrait du grand-oncle (couloir) — couche SONG
2. Fredonnement de l'enfant (salon, fin)
3. Version chantée avec paroles (placement final à confirmer au design des chapitres)

- **Paroles écrites par nous** (berceuse mexicaine originale, espagnol simple, 2 couplets, validation authenticité possible par locutrice native)
- **Production 0 € : ACE-Step 1.5** (Apache 2.0, HF Spaces ou ComfyUI local) — custom lyrics supporté, qualité entre Suno v4.5 et v5. Itérer jusqu'à LA mélodie, générer toutes les variantes (chantée, instrumentale, hum)
- Suno free en parallèle = benchmark créatif (exploration style), jamais dans le repo
- Cohérence hum/voix parlée du grand-oncle : hum maison (enregistrement pitch-shifté) prioritaire, hum ACE-Step en plan B — les deux gratuits
- Déclencheur payant : ACE-Step insuffisant après itérations sérieuses → Suno Pro 1 mois (10 €), toutes les variantes générées le même mois (droits liés à la période d'abonnement)
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

Prérequis outillage (une fois) : Blender installé (headless only), ffmpeg, `@gltf-transform/cli` en devDependency, comptes gratuits HF / ElevenLabs (benchmark) / Suno (benchmark). Un micro correct (téléphone acceptable) pour les enregistrements maison.

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
