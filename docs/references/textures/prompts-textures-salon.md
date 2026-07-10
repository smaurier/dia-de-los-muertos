# Prompts textures peintes — salon (palier 3)

Pipeline : ChatGPT (GPT-4o image), même outil que les concepts cuisine.
Déposer les résultats dans `docs/references/textures/` sous les noms indiqués,
je m'occupe du tiling (RepeatWrapping miroir) et de l'intégration.

## Specs communes (à respecter dans chaque prompt)

- **Format carré**, la plus haute résolution possible
- **Vue strictement frontale / à plat** — aucune perspective, aucun objet, aucune ombre portée
- **Éclairage neutre et uniforme** — la lumière de la scène vient du moteur, pas de la texture
- **Style** : gouache peinte à la main, touches de pinceau visibles, style Ghibli — cohérent avec `cuisine-entree-02.png`
- Le motif doit pouvoir se répéter sans raccord évident (demander « seamless / répétable »)

---

## 1. `mur-adobe-01.png` — murs

> Texture carrée sans couture (seamless tileable) d'un mur intérieur mexicain en
> plâtre à la chaux, couleur sable chaud (#D4B896), peinte à la gouache dans un
> style Ghibli : touches de pinceau visibles, légères variations de teinte ocre
> et beige rosé, fine granulosité picturale. Vue parfaitement frontale, à plat,
> éclairage totalement uniforme et neutre, aucune ombre, aucun objet, aucun
> gradient directionnel. Le motif doit se répéter sans raccord visible.

## 2. `sol-tomettes-01.png` — sol

> Texture carrée sans couture (seamless tileable) d'un sol en tomettes de
> terre cuite mexicaines (carreaux carrés terracotta), peinte à la gouache dans
> un style Ghibli : chaque carreau légèrement différent (nuances brique, ocre
> rouge, orange brûlé), joints fins beige clair, touches de pinceau visibles,
> patine douce d'usure. Grille de 4×4 carreaux exactement, alignée aux bords de
> l'image pour permettre la répétition. Vue du dessus parfaitement frontale,
> éclairage uniforme et neutre, aucune ombre, aucun reflet.

## 3. `nappe-brodee-01.png` — nappe de la table

> Texture carrée d'une nappe mexicaine en coton blanc cassé (#F5F0E8) avec
> bordure brodée traditionnelle Otomi aux fils colorés (orange, violet, vert,
> rose) : fleurs et oiseaux stylisés brodés le long des bords, centre
> majoritairement uni avec un tissage discret. Peinte à la gouache, style
> Ghibli, touches de pinceau visibles. Vue du dessus parfaitement à plat,
> éclairage uniforme, aucun pli, aucune ombre, aucun objet posé.

## 4. `bois-sombre-01.png` — plateaux de table / meubles (optionnel)

> Texture carrée sans couture (seamless tileable) de planches de bois sombre
> (noyer/mesquite #5C3010) peintes à la gouache style Ghibli : veines du bois
> suggérées par touches de pinceau, variations chaudes acajou et brun profond,
> planches horizontales. Vue frontale à plat, éclairage uniforme et neutre,
> aucune ombre, aucun reflet brillant. Répétable sans raccord visible.
