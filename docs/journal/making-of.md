# Making-of — Día de Muertos

*Carnet de bord personnel. Ce que je fais, pourquoi, ce que je ressens.*
*Reconstitué depuis les commits et les sessions. À compléter au fil du projet.*

---

## L'idée

Un enfant se perd dans une maison familiale le soir du Día de Muertos.

Ce n'est pas Coco. Coco parle des morts qui reviennent vers les vivants. Ici, c'est l'inverse : un enfant qui traverse la mémoire pour revenir à lui-même. Le mort est là, dans la pièce, comme n'importe quel adulte. Il rit. Il fredonne. Trois indices, pour qui regarde.

Le surnaturel n'est pas spectaculaire. C'est le régime de réalité par défaut.

---

## Pourquoi ce projet

Je veux me raconter.

Pas faire quelque chose *pour* ma fille — même si elle sera là, même si elle enregistrera la voix du héros, même si toute ma famille participera d'une façon ou d'une autre. Ce n't pas un cadeau. C'est une déclaration.

Le Día de Muertos est dans ma maison. Ma femme est mexicaine. Cette fête n'est pas quelque chose que j'ai lu ou vu dans un film — c'est quelque chose qui existe concrètement, avec des gens réels, des noms réels, une façon de parler aux morts qui n'est ni dramatique ni mystique. Elle est domestique.

Coco est un grand film. Mais il parle des morts qui reviennent vers les vivants — c'est le sens de la fête dans le regard occidental. Ce projet dit autre chose : les vivants qui traversent la mémoire. L'enfant qui se perd, ce n'est pas un enfant perdu dans une maison. C'est l'expérience de toute personne entre deux cultures, entre deux façons de comprendre la mort.

Je veux dire ça. Avec ma famille dedans.

---

## Chronologie du projet

### 2026-06-20 — Jour 1 : la fondation en une journée

Le projet démarre de zéro. Stack choisie : React Three Fiber + Zustand + Howler + GSAP + Vitest. Tout en TypeScript strict.

En une journée, la totalité de la couche logique est posée et testée : game store, player store, stillness system, song system, audio layer manager. 42 tests, tous verts.

**Choix clé : TDD strict sur la logique, aucun test sur la scène 3D.** Three.js n'est pas testable unitairement sans setup lourd. Les stores et systems sont des fonctions pures — eux, on peut les tester. La scène se valide à l'œil. Cette séparation nette s'avérera la bonne décision : on ne touche jamais aux 42 tests pendant que la scène évolue dans tous les sens.

Le premier prototype montre un couloir avec un adulte qui marche, un miroir sans reflet de l'adulte, un joueur à hauteur d'enfant (1.1m). L'adulte est une capsule. Le miroir est fonctionnel. La scène valide les 4 questions mécaniques avant d'aller plus loin.

**Cel-shading ajouté le même jour** : MeshToonMaterial + Outline via postprocessing. La direction artistique est décidée dès le premier jour — style dessin animé, couleurs plates, contours noirs.

La spec narrative V9 devient V10. Le salon est spécifié : 22 NPCs, grand-oncle observer, 3 phases d'arc soirée. Le casting est rédigé.

> *[Sensations ce jour-là ?]*

---

### 2026-06-21 — Jour 2 : le salon prend vie

Le salon s'enrichit : mobilier détaillé, cartoon render, collisions AABB, sous-titres en espagnol. Les NPCs s'assoient à leur chaise. Les assiettes apparaissent. La table a une collision propre.

**Décision : placer 20 chaises avec positionnement précis.** Pas une liste de coordonnées à la main — un système. Les chaises connaissent leur NPC, les NPCs connaissent leur chaise.

Fin de journée : le salon fonctionne. 22 silhouettes se déplacent, parlent, existent.

> *[Sensations ?]*

---

### 2026-06-21 → 2026-07-10 — Trois semaines de silence

Trois semaines sans commit. Pas un abandon — une parenthèse.

Je suis en intercontrat. Cette période aurait pu être passive. Elle ne l'est pas : préparation d'entretiens, formation RGAA (accessibilité web), construction d'un site d'audit pour après la certification. Le jeu attend son tour dans cet ensemble.

Ce qui est intéressant rétrospectivement : trois projets parallèles très différents — certification pro, outil d'audit, jeu narratif pour ma fille. Chacun dit quelque chose d'une façon différente.

---

### 2026-07-10 — Retour : le chantier des assets

Retour massif. En une journée, plusieurs pipelines simultanés s'ouvrent.

**Pipeline props** : Hunyuan3D génère les objets du salon (fauteuil, TV CRT, buffet). Blender headless convertit les GLB. Les props apparaissent dans la scène avec leur géométrie réelle. Premier bug sérieux : les GLB de Hunyuan n'ont pas de normales → écran noir avec le Bloom activé. Fix : `computeVertexNormals()` dans Prop.tsx.

**La caméra 3e personne** ne traverse plus les meubles. Collisions propres.

**Grand-oncle en 3D réelle** : premier personnage vrai du jeu. Assis sur le canapé. Hunyuan → Mixamo → GLB. Le pipeline est établi.

**Direction artistique réorientée** : les concepts art générés via ChatGPT révèlent une cible plus ambitieuse — rendu peint, style Ghibli, pas juste du cel-shading plat. Fog chaud + bloom + vignette posés. C'est un horizon, pas une promesse.

**Spécification des pièces** : template fiche-pièce écrit. Cuisine documentée. Pipeline 0 EUR établi — toutes les sources sont commercial-OK.

> *[Ce retour en force — qu'est-ce qui l'a déclenché ?]*

---

### 2026-07-11 — Le salon se densifie

**Héros jouable texturé** : animations, clignement des yeux, micro-saccades. Le pipeline Hunyuan→Mixamo→GLB fonctionne pour un personnage jouable.

**Grand-oncle v2** : visage projeté (texture character sheet), moustache 3D. Il ressemble à quelqu'un.

**Mama** : premier NPC féminin en 3D réelle, intégrée au salon.

**Le canapé d'angle** : texturé, coussins avec motifs. L'atlas de texture peint à la main dans le pipeline. C'est un travail minutieux pour un objet qui occupe le coin de la pièce — mais le salon doit ressembler à un vrai salon.

Petite commode entre canapé et TV. Lampe. Mini plante. La pièce s'installe.

> *[Le moment où le salon a commencé à ressembler à quelque chose — qu'est-ce que tu as ressenti ?]*

---

### 2026-07-12 — Le casting et le chien

**Casting définitif** : 19 NPCs nommés. Aurelio (le mort), Elena, Carlos, Héctor, Ramón, Beto, Lupita, Consuelo, Andrés, Verónica, Toño, Fernanda, Camila, Mateo, Valentina, Diego, Mariana, Sofía, Rosa. Nommer les personnages change quelque chose — ils cessent d'être des silhouettes et deviennent une famille.

**Le chien** : trois tentatives avant de trouver le bon. Premier modèle GLB (squats involontaires). Deuxième (un seul clip). Troisième : chiot stylisé FBX converti via Blender 5.1 headless — IdleLayDown, Walk, Run, IdleEnergetic, TPOSE. Le chien est couché près de la TV. Il regarde vers le joueur si on s'approche. Il respire doucement.

**FamilyMemberGLB** : le routeur est en place. Quand un NPC a un `modelUrl`, il charge le GLB. Sinon, il reste en géométrie de placeholder. Transition propre entre prototype et assets réels, NPC par NPC.

**Multi-view T-poses** : les character sheets sont refaits avec trois vues (face/dos/gauche) pour meilleures reconstructions 3D. 9 personnages × 3 vues = 27 images organisées dans le projet.

**Génération Hunyuan** lancée pour les 9 personnages simultanément. Script automatisé : upload → queue → SSE streaming → download. Tourne en arrière-plan.

> *[Le chien — pourquoi c'était important d'avoir le bon chien ?]*

---

### 2026-07-14 — La maison s'étend, méthode « contexte d'abord »

Grosse leçon en début de session : tentative de construire les 8 pièces du
plan d'un coup — trois itérations ratées, rollback total au dernier push.
Nouvelle méthode : **une pièce à la fois, validation visuelle à chaque pas.**

Et ça marche : cuisine agrandie et réorganisée selon les refs (fogón au fond,
crédence azulejos, table au centre), **cellier** derrière le mur du fond
(conserves, sacs de grain, ristras de chiles), **couloir en L** qui part de la
porte du mur en pierre, longe le salon et débouche dans le zaguán. Première
boucle jouable : salon → cuisine → couloir → entrée → salon. Les trois arches
du salon desservent maintenant la circulation, comme sur le plan.

**Portes interactives** : touche F, indice à l'écran, portes qui pivotent sur
leurs gonds. Les portes verrouillées font parler Emilio : « Está cerrado. »
Première réplique du héros déclenchée par une interaction.

**Les enfants debout sur les chaises** : les huit enfants ne courent plus —
chacun est figé debout sur sa chaise autour de la table. Sylvain : « c'est
pour la praticité et savoir où sont les enfants, ce n'est pas pour le
scénario. » Phase actuelle : construire tout le contexte (la maison, les
placements), le scénario viendra quand le décor sera nickel. Les enfants
perchés sont des marque-places — et accessoirement, l'image est étrange et
belle, très Día de Muertos.

> *[Huit enfants immobiles debout sur des chaises dans la pénombre — tu as vu
> l'image en le demandant, ou c'est le hasard de la praticité ?]*

**Suite de la même journée — la maison se termine.** Une pièce à la fois,
validation visuelle à chaque pas, et en une session marathon : chambre 1
(deux lits sarape — vérification faite dans la spec : Emilio a bien UNE
sœur, Sofía), la grande chambre des parents avec sa photo de mariage,
la salle de bain aux azulejos, le débarras et son fauteuil couvert d'un
drap, le bureau à la lampe de banquier verte, l'entrée rétrécie à la
largeur de l'arche, la porte principale coloniale (cantera, clavos côté
rue — corrigée après coup : on la voit de l'intérieur, donc planches et
pentures), le patio nocturne avec l'ofrenda discrète contre le mur ouest
— bougies éteintes, photo illisible de loin, exactement l'anti-spoiler de
la spec — les guirlandes d'ampoules, le bassin qui reflète la nuit, le
garage avec le vocho vert, et une bulle de ciel étoilé par-dessus tout.

**La maison entière est jouable.** Salon, cuisine, cellier, couloirs,
deux chambres, salle de bain, débarras, bureau, zaguán, patio, garage.
Neuf portes s'ouvrent avec F. Le décor attend le scénario.

> *[La maison a été finie en une seule journée de session continue. À quel
> moment tu as su qu'on irait jusqu'au bout — et ça fait quoi de se
> promener dans une maison complète qui n'existait pas ce matin ?]*

**Le lendemain matin — l'audit et le garage de papa.** Nuit d'audit :
outils de détection (z-fighting, murs fantômes, tests d'intégrité des
collisions), rapport complet, et au réveil les corrections validées une à
une. Le bébé a trouvé sa place : un couffin en osier au pied du fauteuil
de la grande-tante Rosa — pas de portage possible avec Mixamo, alors il
dort, et sa couverture respire doucement. C'est mieux comme ça.

En discutant du chapitre 7 (la pièce de la mémoire refoulée — cartons,
vélo trop petit, photos face contre le mur), l'idée du garage est passée
sur la table. Sylvain : « mon papa est garagiste, et comme beaucoup de
papas très bricoleurs, il ne jetait pas beaucoup de choses en disant que
ça servirait. Comme on était 4 enfants à la maison, les vélos restaient
longtemps aussi. On se les passait. » Le vélo trop petit de la spec
n'est pas un accessoire générique — c'est un vélo qui a eu quatre
propriétaires successifs et que personne n'a eu le cœur de jeter.
L'idée garage-chapitre est finalement tombée (on ne peut y accéder que
par le patio, ça aurait grillé le chapitre 8) — mais le vélo, lui,
restera. Et le jardin est né dans la même conversation : le chemin de
pétales du retour passera dehors, le long des murs de la maison, jusqu'à
la porte bleue de la cuisine.

> *[Un vélo à quatre enfants dans un débarras : c'est le genre de détail
> que ta fille reconnaîtra un jour ? Il y a d'autres objets de TON enfance
> que tu veux glisser dans la maison ?]*

---

## Ce qui reste

- 9 GLB à générer (en cours)
- Mixamo pour chaque personnage (anims : idle, walk, talk, réaction)
- Intégration NPC par NPC via `familyConfig`
- Audio : 6 couches Howler, voix de ma fille
- Chapitres 2-9
- La chanson

---

## Ce qui ne changera pas

L'adulte est dans la pièce. Tout le monde le connaît. Personne ne le signale.
Le joueur peut passer toute la soirée sans comprendre — et c'est juste.
L'attention construit l'expérience.

---

*Dernière mise à jour : 2026-07-14*
