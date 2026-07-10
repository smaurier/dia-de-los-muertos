# Prompts personnages 3D — salon chantier 5

Pipeline (identique grand-oncle, voir ASSETS-LEDGER) :
image t-pose ChatGPT → Hunyuan3D-2 HF Space → gltf-transform simplify →
Blender headless → Mixamo auto-rig + animations → GLB dans
`public/models/characters/`. Images dans `docs/references/characters/<id>/`.

**9 archétypes pour 20 NPCs** (même logique que la chaise ×20) : la variation
vient des couleurs `meshColor` de familyConfig et des scénarios, pas du mesh.

## Specs communes (à inclure dans chaque prompt)

> Personnage en T-pose stricte (bras parfaitement horizontaux, jambes droites
> légèrement écartées), de face, corps entier centré sur fond gris clair uni.
> Style dessin animé cel-shading : aplats de couleur, traits nets, proportions
> légèrement stylisées. Éclairage doux uniforme, aucune ombre portée.

Référence de cadrage : `grand-oncle/grand-oncle-tpose-01.png`.

## Animations Mixamo par tier (déjà téléchargées pour le grand-oncle, réutiliser)

- Tier 1 (roaming) : Walking Happy + Standing Idle
- Tier 2 (scénarios) : + Sitting Idle, Sit To Stand
- Tier 3 (statiques assis) : Sitting Idle seule

---

## 1. `mama-tpose-01.png` — Mamá

> Femme mexicaine d'environ 40 ans, cheveux noirs attachés en chignon bas,
> robe simple bleu ardoise aux genoux avec tablier de cuisine beige noué à la
> taille, sandales plates. Visage doux et souriant. [+ specs communes]

## 2. `papa-tpose-01.png` — Papá

> Homme mexicain d'environ 45 ans, moustache noire fournie, chemise à
> carreaux rouge et brun manches retroussées, jean brun foncé, ceinture à
> boucle, bottes de travail. Carrure solide. [+ specs communes]

## 3. `oncle-tpose-01.png` — Tíos Carlos / Roberto / Miguel (×3)

> Homme mexicain d'environ 50 ans, léger embonpoint, chemise guayabera vert
> sauge, pantalon gris, moustache fine, cheveux noirs peignés en arrière.
> Expression joviale. [+ specs communes]

## 4. `tante-tpose-01.png` — Tías Rosa / Elena / Joven (×3)

> Femme mexicaine d'environ 45 ans, cheveux noirs mi-longs, robe fleurie
> terracotta et rose à motifs traditionnels, châle rebozo violet sur les
> épaules, boucles d'oreilles rondes. [+ specs communes]

## 5. `ado-garcon-tpose-01.png` — Primo Diego

> Adolescent mexicain d'environ 14 ans, cheveux noirs en bataille, t-shirt
> rayé orange et blanc, short kaki, baskets usées. Silhouette dégingandée.
> [+ specs communes]

## 6. `ado-fille-tpose-01.png` — Primas Sofía / Valentina (×2)

> Adolescente mexicaine d'environ 13 ans, cheveux noirs longs avec deux
> tresses et rubans colorés, blouse blanche brodée de fleurs, jupe ample
> rose, sandales. [+ specs communes]

## 7. `enfant-garcon-tpose-01.png` — Niños (×3 dont enfant4 sage)

> Petit garçon mexicain d'environ 6 ans, cheveux noirs courts, t-shirt uni
> jaune moutarde, short bleu marine, sandales. Grosse tête ronde de dessin
> animé, joues pleines. [+ specs communes]

## 8. `enfant-fille-tpose-01.png` — Niña + Hermanas (×3)

> Petite fille mexicaine d'environ 7 ans, deux couettes noires avec rubans
> rouges, robe traditionnelle blanche brodée de fleurs multicolores,
> chaussures noires. Grosse tête ronde de dessin animé. [+ specs communes]

## 9. `grande-tante-tpose-01.png` — Tía Abuela

> Femme mexicaine âgée d'environ 75 ans, cheveux gris en chignon serré,
> légèrement voûtée, robe sombre bordeaux sous un châle rebozo gris tissé,
> lunettes rondes. Même génération que le grand-oncle
> (grand-oncle-tpose-01.png). [+ specs communes]

---

## Mapping modèle → NPCs (familyConfig)

| Modèle | NPCs | Tier | Anims |
|---|---|---|---|
| mama | maman | 2 | walk/idle/sit/stand |
| papa | papa | 2 | walk/idle/sit/stand |
| oncle | oncle1, oncle2, oncle3, oncle-jeune | 2+1 | walk/idle/sit/stand |
| tante | tante1, tante2, tante-jeune | 2+1 | walk/idle/sit/stand |
| ado-garcon | cousin1 | 1 | walk/idle/sit |
| ado-fille | cousine1, cousine2 | 1 | walk/idle |
| enfant-garcon | enfant1, enfant3, enfant4 | 1+2 | walk/idle/sit |
| enfant-fille | enfant2, soeur1, soeur2 | 1+3 | walk/idle/sit |
| grande-tante | grande-tante | 3 | sitting idle |

Bébé : reste en placeholder (trop petit pour le rig Mixamo standard, porté à
terme par un adulte — à traiter avec la scène qui le concernera).
