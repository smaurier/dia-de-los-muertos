# Prompts personnages 3D — salon chantier 5

Pipeline (identique grand-oncle, voir ASSETS-LEDGER) :
image t-pose ChatGPT → Hunyuan3D-2 HF Space → gltf-transform simplify →
Blender headless → Mixamo auto-rig + animations → GLB dans
`public/models/characters/`. Images dans `docs/references/characters/<id>/`.

**Le héros d'abord** (toujours à l'écran), puis **12 archétypes pour 20 NPCs** :
les rôles de masse (tantes, enfants, ados) partagent un mesh — la variation
vient des couleurs `meshColor` et des scénarios. Les oncles, eux, sont
distincts (4 modèles) : trop présents à table pour être des clones.

## Format des prompts (celui qui a produit le grand-oncle — en anglais)

Chaque prompt = `Character reference sheet, cel-shaded cartoon style, flat
colors with 3-tone banded shading, black outlines.` + description du
personnage + `Full body T-pose, arms straight out, standing straight, neutral
light gray background, front view, clean and readable silhouette for 3D
modeling.` + une note de présence/caractère.

Référence de cadrage : `grand-oncle/grand-oncle-tpose-01.png`.

## Animations Mixamo par tier (déjà téléchargées pour le grand-oncle, réutiliser)

- Tier 1 (roaming) : Walking Happy + Standing Idle
- Tier 2 (scénarios) : + Sitting Idle, Sit To Stand
- Tier 3 (statiques assis) : Sitting Idle seule

---

## 0. `heros-tpose-01.png` — LE GARÇON (joueur) — **PRIORITÉ 1**

Toujours à l'écran (caméra 3e personne, souvent de dos) : silhouette et dos
doivent être immédiatement lisibles.

> Character reference sheet, cel-shaded cartoon style, flat colors with 3-tone
> banded shading, black outlines. A 7-year-old Mexican boy, big round head,
> chubby cheeks, large curious eyes, short black hair with a stubborn cowlick,
> wearing a plain brick-red t-shirt, brown shorts, worn white sneakers. Full
> body T-pose, arms straight out, standing straight, neutral light gray
> background, front view, clean and readable silhouette for 3D modeling.
> Playful, wide-awake presence of a kid who is about to get lost in a very
> big house.

Animations : Standing Idle, Walking, **Crouching Idle** (mécanique « E pour
se cacher »). Intégration : remplace la capsule dans `Player.tsx`, garçon
masqué quand `backDist < 0.35` (déjà géré).

## 1. `mama-tpose-01.png` — Mamá

> Character reference sheet, cel-shaded cartoon style, flat colors with 3-tone
> banded shading, black outlines. A Mexican woman in her early 40s, black hair
> in a low bun, wearing a simple slate-blue knee-length dress with a beige
> kitchen apron tied at the waist, flat sandals. Full body T-pose, arms
> straight out, standing straight, neutral light gray background, front view,
> clean and readable silhouette for 3D modeling. Soft, warm, gently watchful
> presence.

## 2. `papa-tpose-01.png` — Papá

> Character reference sheet, cel-shaded cartoon style, flat colors with 3-tone
> banded shading, black outlines. A Mexican man in his mid-40s, thick black
> mustache, wearing a red and brown plaid shirt with rolled-up sleeves, dark
> brown jeans with a buckled belt, work boots. Solid build. Full body T-pose,
> arms straight out, standing straight, neutral light gray background, front
> view, clean and readable silhouette for 3D modeling. Hearty, good-natured
> presence.

## 3a. `oncle-carlos-tpose-01.png` — Tío Carlos

> Character reference sheet, cel-shaded cartoon style, flat colors with 3-tone
> banded shading, black outlines. A Mexican man around 50, slightly
> pot-bellied, thin mustache, black hair combed back, wearing a sage-green
> guayabera shirt and gray trousers. Full body T-pose, arms straight out,
> standing straight, neutral light gray background, front view, clean and
> readable silhouette for 3D modeling. Jovial, loud-laughing presence.

## 3b. `oncle-roberto-tpose-01.png` — Tío Roberto

> Character reference sheet, cel-shaded cartoon style, flat colors with 3-tone
> banded shading, black outlines. A tall thin Mexican man around 55, square
> glasses, hair graying at the temples, angular serious face, wearing a light
> blue and white striped shirt tucked into beige belted trousers. Full body
> T-pose, arms straight out, standing straight, neutral light gray background,
> front view, clean and readable silhouette for 3D modeling. Dry, precise,
> quietly ironic presence.

## 3c. `oncle-miguel-tpose-01.png` — Tío Miguel

> Character reference sheet, cel-shaded cartoon style, flat colors with 3-tone
> banded shading, black outlines. A broad-shouldered stocky Mexican man around
> 48, short black beard, backwards cap, wearing an open burgundy shirt over a
> white t-shirt, dark blue jeans. Full body T-pose, arms straight out,
> standing straight, neutral light gray background, front view, clean and
> readable silhouette for 3D modeling. Easygoing, unhurried presence.

## 3d. `oncle-jeune-tpose-01.png` — Tío Joven

> Character reference sheet, cel-shaded cartoon style, flat colors with 3-tone
> banded shading, black outlines. A young Mexican man around 28, medium-length
> black hair, wearing an ochre-yellow polo shirt, light jeans, sneakers, a
> braided bracelet on one wrist. Lean silhouette. Full body T-pose, arms
> straight out, standing straight, neutral light gray background, front view,
> clean and readable silhouette for 3D modeling. Charming half-smile presence.

## 4. `tante-tpose-01.png` — Tías Rosa / Elena / Joven (×3)

> Character reference sheet, cel-shaded cartoon style, flat colors with 3-tone
> banded shading, black outlines. A Mexican woman in her mid-40s, shoulder-
> length black hair, round earrings, wearing a terracotta and pink flowered
> dress with traditional patterns and a purple rebozo shawl over the
> shoulders. Full body T-pose, arms straight out, standing straight, neutral
> light gray background, front view, clean and readable silhouette for 3D
> modeling. Talkative, affectionate presence.

## 5. `ado-garcon-tpose-01.png` — Primo Diego

> Character reference sheet, cel-shaded cartoon style, flat colors with 3-tone
> banded shading, black outlines. A lanky Mexican teenage boy around 14,
> messy black hair, wearing an orange and white striped t-shirt, khaki
> shorts, worn sneakers. Full body T-pose, arms straight out, standing
> straight, neutral light gray background, front view, clean and readable
> silhouette for 3D modeling. Restless, teasing presence.

## 6. `ado-fille-tpose-01.png` — Primas Sofía / Valentina (×2)

> Character reference sheet, cel-shaded cartoon style, flat colors with 3-tone
> banded shading, black outlines. A Mexican teenage girl around 13, long
> black hair in two braids with colorful ribbons, wearing a white blouse
> embroidered with flowers and a wide pink skirt, sandals. Full body T-pose,
> arms straight out, standing straight, neutral light gray background, front
> view, clean and readable silhouette for 3D modeling. Lively, confident
> presence.

## 7. `enfant-garcon-tpose-01.png` — Niños (×3 dont enfant4 sage)

> Character reference sheet, cel-shaded cartoon style, flat colors with 3-tone
> banded shading, black outlines. A 6-year-old Mexican boy, big round cartoon
> head, chubby cheeks, short black hair, wearing a plain mustard-yellow
> t-shirt, navy shorts, sandals. Full body T-pose, arms straight out,
> standing straight, neutral light gray background, front view, clean and
> readable silhouette for 3D modeling. Giggly, hyperactive presence.

## 8. `enfant-fille-tpose-01.png` — Niña + Hermanas (×3)

> Character reference sheet, cel-shaded cartoon style, flat colors with 3-tone
> banded shading, black outlines. A 7-year-old Mexican girl, big round
> cartoon head, two black pigtails with red ribbons, wearing a traditional
> white dress embroidered with multicolored flowers, black shoes. Full body
> T-pose, arms straight out, standing straight, neutral light gray
> background, front view, clean and readable silhouette for 3D modeling.
> Bright, mischievous presence.

## 9. `grande-tante-tpose-01.png` — Tía Abuela

> Character reference sheet, cel-shaded cartoon style, flat colors with 3-tone
> banded shading, black outlines. An elderly Mexican woman in her mid-70s,
> gray hair in a tight bun, slightly stooped, round glasses, wearing a dark
> burgundy dress under a woven gray rebozo shawl. Same generation as the
> elderly grand-uncle. Full body T-pose, arms straight out, standing
> straight, neutral light gray background, front view, clean and readable
> silhouette for 3D modeling. Frail but sharp-eyed, quietly knowing presence.

---

## Mapping modèle → NPCs (familyConfig)

| Modèle | NPCs | Tier | Anims |
|---|---|---|---|
| **heros** | **le joueur (Player.tsx)** | — | idle/walk/crouch |
| mama | maman | 2 | walk/idle/sit/stand |
| papa | papa | 2 | walk/idle/sit/stand |
| oncle-carlos | oncle1 | 2 | walk/idle/sit/stand |
| oncle-roberto | oncle2 | 2 | walk/idle/sit/stand |
| oncle-miguel | oncle3 | 2 | walk/idle/sit/stand |
| oncle-jeune | oncle-jeune | 1 | walk/idle |
| tante | tante1, tante2, tante-jeune | 2+1 | walk/idle/sit/stand |
| ado-garcon | cousin1 | 1 | walk/idle/sit |
| ado-fille | cousine1, cousine2 | 1 | walk/idle |
| enfant-garcon | enfant1, enfant3, enfant4 | 1+2 | walk/idle/sit |
| enfant-fille | enfant2, soeur1, soeur2 | 1+3 | walk/idle/sit |
| grande-tante | grande-tante | 3 | sitting idle |

Bébé : reste en placeholder (trop petit pour le rig Mixamo standard, porté à
terme par un adulte — à traiter avec la scène qui le concernera).
