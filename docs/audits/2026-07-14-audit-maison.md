# Audit maison complète — 2026-07-14 (nuit)

**Statut : RAPPORT SEUL — aucune correction appliquée. Corrections après validation de Sylvain.**

Outils mis en place pour cet audit (livrés, réutilisables) :
- **`?audit`** dans l'URL → 4 s après chargement, rapport console : candidats
  z-fighting (planes coplanaires < 4 mm), murs une face ≥ 2 m² (invisibles de
  dos), matériaux hors toon, budgets (lumières, réflecteurs, textures).
  `src/scene/debug/sceneAudit.tsx`.
- **`houseAudit.test.ts`** : 8 tests d'intégrité des données (AABB bien
  formées, dans les bounds, sans doublon ; portes atteignables, traversables
  ouvertes, gaps réels ; 14 positions de pièces navigables). **101/101 verts**
  — les données de collision sont saines.
- `?aabb` (existant) : visualisation des boîtes de collision.

---

## A. Problèmes techniques détectés (lecture de code)

### A1. MAJEUR — caméra collée hors salon
`cameraBackDistance()` (salonCollision.ts) applique les murs du salon
(LIMIT_X=±6.85, LIMIT_Z=±5.65) **partout**. Le clamp de position est
conditionné `inSalon` (Player.tsx:202) mais pas le recul. Conséquence : dans
le couloir, les chambres, le patio… dès que la caméra pointe vers l'extérieur
des bornes du salon, `backDist` devient négatif → 0 → caméra dans la tête du
héros (et il est masqué par BOY_HIDE_DIST). Reproduire : couloir nord, regarder
vers le sud. **Fix proposé : passer un flag `inSalon` à cameraBackDistance et
n'appliquer les limites murs que dedans (les AABB mobilier restent globales).**

### A2. Budget réflecteurs planaires — 9 passes de rendu
MeshReflectorMaterial : sol salon (1024) + vitre salon (512) + 5 vitres
pièces (512) + 2 vitres garage (256) = **9 réflecteurs**. Chacun re-rend la
scène. Sur la 1660 Ti, risque réel de chute de framerate maintenant que la
scène est 5× plus grande. **Fix proposé : 256 pour toutes les vitres de
pièces (à leur taille, invisible), garder 1024/512 pour le salon.**

### A3. Pas de toiture — le dôme étoilé « traverse » la maison
Depuis le patio, au-dessus des façades (2,9 m), on voit le ciel étoilé
DERRIÈRE la maison : aucune toiture extérieure (tuiles) n'existe. C'est
peut-être l'« aberration » la plus visible en jeu. **Fix proposé : bandeau de
toit de tuiles simple (boxes inclinées) sur les façades visibles du patio et
du garage.**

### A4. Mystère texture arche est (signalé par Sylvain, non reproduit)
Relecture complète du code : les `map={murAdobeSide}` sont en place, le mur
nord utilise la même technique (boxes) sans problème. **Lancer `?audit` demain
et regarder les sections z-fighting / murs une face autour de x=7 — l'outil
a été construit pour ça.** Préciser aussi : uni sombre (éclairage) ou uni
clair (texture) ?

### A5. Mineurs
- Portes chambre-2 / salle-de-bain face à face (1,4 m) : au milieu du
  couloir, le hint `[F]` peut alterner entre les deux. Acceptable ou
  prioriser la plus proche avec hystérésis.
- Fenêtre SDB : donne sur une courette enclavée (x∈[11.9,13.4], z∈[3.4,6.2])
  fermée de partout — réaliste (puits de jour) mais ses « murs » vus depuis
  la fenêtre sont des faces arrière invisibles. Le verre + plane nuit
  masquent. RAS tant qu'on ne colle pas la caméra à la vitre.
- Texture murAdobeSide (repeat 3.1 calibré 10 m) : sur les segments courts
  des murs percés, l'échelle du grain varie légèrement d'un segment à
  l'autre. Cosmétique.
- SalonRoom.tsx ≈ 1500 lignes : extraire le zaguán et la table dressée dans
  des fichiers dédiés (maintenance, pas un bug).
- DomeCiel : canvas 4096×2048 ≈ 32 Mo VRAM. Acceptable, à savoir.

---

## B. Audit specs — ce qui manque ou diverge

### B1. MAJEUR narratif — le miroir du couloir n'existe pas
Indice n°1 de la V10 : « l'enfant se voit dans le miroir du couloir ;
l'adulte n'a pas de reflet ». Le prototype chapter3 l'avait (composant
Mirror), supprimé avec la scène. Le couloir actuel n'a **ni miroir ni photo
au mur**. C'est l'axe de l'adulte (ch3). À réintroduire sur le mur du
couloir (technique : caméra miroir + layers, backlog « Mirror robuste »).

### B2. Topologie — le retour court ch9 (patio→cuisine) est impossible
Spec house-rooms : « Patio ↔ cuisine : le retour court. Le chemin de pétales
ramène par là au ch9 — le salon était à 15 m depuis le début. » Notre patio
est au SUD (porte verte), la cuisine au NORD-OUEST : non adjacents. Le
retour « court » actuel = porte verte → couloir sud → salon (déjà court,
~10 s). Options : (a) assumer la variante porte-verte comme retour court,
(b) redessiner. Décision de design à prendre — rien ne bloque le sandbox.

### B3. Topologie — débarras→patio n'existe plus
Spec ch7→ch8 : « on émerge du point le plus étouffé vers la nuit ouverte ».
La porte patio du débarras a été supprimée (demande Sylvain) et ils ne sont
plus adjacents (débarras au nord, patio au sud). L'arc ch7→ch8 passera par
le couloir sud + porte verte. À assumer dans la V11 ou re-concevoir.

### B4. Fiche cuisine — set dressing largement non implémenté
Présents : fogón ✓, crédence azulejos ✓, mur en pierre ✓, étagère +
ustensiles ✓, table ✓, ofrenda de cuisine ✓.
Manquants (fiche `specs/rooms/cuisine.md`) : **frigo années 90 + aimants**,
**évier + vaisselle sale**, **vaporera fumante sur le fogón**, radio
ancienne éteinte (dialogue avec la couche MEMORY), Virgen de Guadalupe +
calendrier de carnicería, **bol de pétales de cempasúchil** (plante le
chemin de pétales !), panier du chien vide, **ampoule nue qui CLIGNOTE**
(flicker — la fiche en fait un prop narratif), cazuelas/comal/molcajete,
placards + bocaux. Note : le coin-pierres de la fiche est « sud-est » ;
notre mur pierre est tout le mur est. Divergence acceptée ?

### B5. Casting — 20 présents au lieu de 22
familyConfig = 18 NPCs + grand-oncle (composant) + Emilio = 20. La V10 dit
« 22 personnes » et la règle des chaises « 20 chaises = 22 présents − bébé −
grand-oncle ». **Le bébé n'existe plus dans familyConfig** (retiré à un
moment du chantier ?). Compte à réconcilier : soit réintroduire le bébé +1
adulte, soit amender la V10. Les 20 chaises sont bien là ✓.

### B6. Fiches pièces manquantes (process house-rooms §4)
Écrites : cuisine (gelée). Jamais écrites : couloir (+ variante grandie
ch5 !), couloir intérieur, chambre, débarras, patio (avec états ofrenda par
chapitre), salon-addendum. Les pièces ont été construites sans fiche —
inverse du process prévu. Les fiches restent utiles pour : beats, sons par
couche, triggers, états par chapitre.

### B7. Systèmes house-rooms §3 non implémentés (normal — « contexte d'abord »)
chapterSystem, triggerSystem, roomConfig (depthZone audio), règle du
hors-regard, House.tsx/démontage des pièces éloignées (perf !), variantes de
géométrie ch5+. Avec la maison complète, le démontage par distance devient
pertinent (22 NPCs + 9 réflecteurs + ~60 lumières estimées).

### B8. Divers conformes ✓
20 chaises ✓ ; ofrenda discrète + anti-spoiler ch2 ✓ (photo illisible,
bougies éteintes, loin de l'entrée) ; portes jardin verrouillées → « Está
cerrado » ✓ ; guirlandes = cour banale de fête ✓ ; sœur unique Sofía ✓ ;
grand-oncle hors graphe social ✓ (à re-vérifier quand les scénarios
reviendront) ; enfants debout sur les chaises = choix assumé hors spec.

---

## C. Priorités proposées (pour validation demain)

| # | Quoi | Type | Effort |
|---|------|------|--------|
| 1 | Fix caméra hors salon (A1) | bug | S |
| 2 | Toiture visible depuis patio/garage (A3) | visuel | M |
| 3 | Vitres pièces en résolution 256 (A2) | perf | S |
| 4 | Lancer `?audit` + trancher le mystère arche est (A4) | diagnostic | S |
| 5 | Miroir du couloir (B1) | narratif | M-L |
| 6 | Compléter la cuisine selon sa fiche (B4) | set dressing | M |
| 7 | Bébé + compte 22 (B5) | casting | S |
| 8 | Décisions topologie ch7-ch9 (B2, B3) | design | discussion |
| 9 | Démontage pièces éloignées (B7) | perf | M |
