# Journal de projet — Día de Muertos

Journal chronologique du projet. Chaque session : ce qui a été demandé, les décisions prises, les problèmes rencontrés, les choix retenus avec leur raison.

---

## S01 — 2026-06-20 — Bootstrap + Vertical Slice Chapitre 3

### Livré

- **Scaffold Vite + React + TypeScript + R3F + Vitest** : projet bootstrappé manuellement (CLI non-interactif sur Windows). Stack : R3F 9.6, Drei 10.7, Zustand 5, Howler 2.2, GSAP 3.15, Vitest 4.
- **Game Store** (`gameStore.ts`) : Chapter enum (1-9), GamePhase enum, salonAudibilityLevel [0,1], houseScale [1,2], adultHasLeft. 5 tests.
- **Player Store** (`playerStore.ts`) : position, lastMoveTime, isHidden. 4 tests.
- **Stillness System** (`stillnessSystem.ts`) : isPlayerStill, stillnessDuration, stillnessIntensity — fonctions pures. 10 tests.
- **Song System** (`songSystem.ts`) : getSongFragment — machine à états par chapitre × contexte. SongFragment enum (ABSENT → IN_CHILD). 10 tests.
- **Audio Layer Manager** (`AudioLayerManager.ts`) : 6 couches (SALON, HOUSE, MEMORY, ANIMAL, SONG, SILENCE), HowlPort interface, applyStillness. 12 tests.
- **Scène Chapitre 3** : couloir (géométrie primitive), miroir (MeshReflectorMaterial, adulte sans reflet via onBeforeRender), adulte (capsule placeholder, walk scripté z=3→-3), Player (WASD + PointerLockControls, hauteur enfant 1.1m).
- **Hooks** : useStillness (useFrame → intensité), useAudioLayers (AudioLayerManager + getSongFragment par frame).
- **42 tests, 6 fichiers, tous verts.**
- **Push** sur https://github.com/smaurier/dia-de-los-muertos

### Décisions

- **TDD strict sur la couche logique, pas sur la couche scène** : Three.js/WebGL non testable unitairement sans setup lourd. Les stores et systems sont 100% couverts. La scène se valide manuellement.
- **Miroir via onBeforeRender/onAfterRender** : approche simple pour le prototype. Migration vers Three.js layers (layer 1 = adulte, caméra miroir layer 0 uniquement) prévue pour la version assets.
- **HowlPort interface (port pattern)** : Howler.js non mocké — une factory injectée. Permet tests sans navigateur.
- **Chapter 3 comme vertical slice** : valide les 4 questions spec avant d'étendre aux 9 chapitres.
- **Placeholders géométriques** : priorité aux mécaniques, pas au rendu. Assets 3D via messenger.abeto.co à intégrer ensuite.

### Problèmes rencontrés

- **npm create vite non-interactif** : CLI attend TTY, échoue en piped. Résolu : scaffold manuel des fichiers (même output que le template react-ts).
- **Float IEEE 754 dans applyStillness** : `0.8 - 1 * 0.5 = 0.30000000000000004`. Résolu : `Math.round(... * 1000) / 1000`.
- **Constructor howl.volume() casse le test fade** : spy détecte l'appel constructor. Résolu : ne pas appeler `volume()` dans le constructor, uniquement `loop()`.

### Prochaine étape

Test manuel du prototype (voir procédure README). Valider les 4 questions mécaniques. Ensuite : intégration assets 3D (pipeline messenger.abeto.co), enregistrement audio réel, extension chapitres 1-9.

---

## Audit d'extraction — Phase 1 filet de test (2026-07-14)

Audit exhaustif de `src/scene/**` à la recherche de logique pure (non-JSX) extractible et testable. Critère YAGNI : qualifie uniquement si (a) répété ≥ 2 composants, (b) décision/calcul falsifiable (bonne/mauvaise réponse), ou (c) source de bug connue.

### Checklist d'extraction Phase 1

- [ ] **[Task 2] `resolvePlayerNpcCollision`** — `src/scene/Player.tsx:187-198` — Boucle de push-out du joueur hors des NPCs (`NPC_RADIUS`, distance euclidienne, projection). Cible : `src/game/systems/npcSystem.ts`. Gate **(b)** : calcul de contact 2D falsifiable. Déjà planifié.

- [ ] **[Task 3] `advanceFace`** — `src/scene/Player.tsx:236-256` — Machine à états clignement/saccade : horloge locale, `blinkAt`/`saccadeAt`/`gazeIdx`, sélection de variante (`pickGaze`). Inclut les helpers `blinkDelay`, `saccadeDelay`, `pickGaze` (lignes 40-44). Cible : `src/scene/shared/faceState.ts`. Gate **(b)** : chronologie états + distribution `pickGaze` testables. Déjà planifié.

### Candidats borderline — restent inline (YAGNI échoué)

Les items suivants ont été examinés et rejetés :

- **`strandY(x)`** (`SalonRoom.tsx:193-196`) — Parabole caténaire en 2 lignes, utilisée dans un seul composant (`PapelStrand`), aucun cas d'erreur silencieux possible. Borderline (b) mais trop triviale et à usage unique → reste inline.

- **`nameHash(s)`** (`FamilyMember.tsx:18-22`) — Hash déterministe sur l'id NPC pour les couleurs. Usage unique dans `FamilyMemberGeometry`, logique correcte non critique. → reste inline.

- **`intradosGeometry`** (`SalonRoom.tsx:43-59`) — Construction de géométrie CylinderGeometry avec inversion des normales et du winding. Complexe mais usage unique (une seule arche partagée via instance). Pas d'invariant à tester sans WebGL. → reste inline (commentaire existant suffit).

- **`PHOTO` parsing** (`App.tsx:42-47`) — Parsing d'une query-string en 6 nombres. Borderline (b) mais trivial (5 lignes, usage unique en debug). → reste inline.

- **`whiteScore` dans `makeFaceTextures`** (`blinkTexture.ts:68-77`) — Déjà dans un module `.ts` pur. Pas de déplacement nécessaire — la cible d'extraction (`faceState.ts`) concernera la machine à états dans `Player.tsx`, pas la génération de texture.

- **`Prop.scale/yOffset` calcul** (`Prop.tsx:26-33`) — Auto-scale d'un GLB sur `targetHeight`/`targetLength`. Usage unique dans `Prop`, calcul simple (`Box3` + division). → reste inline.

- **`ZoneReflectorMaterial.beforeRender`** (`ZoneReflector.tsx:100-147`) — Mathématiques de projection du plan réflecteur (16×16 matrix, clip oblique). Algorithme graphique standard, code vendorisé depuis drei, aucun test métier pertinent. → reste inline.

### Décision

**2 candidats extraits en Phase 1** (Tasks 2 et 3). La couverture est proportionnée : la logique de jeu pure dans les composants scène est mince — la maison a été construite pièce par pièce avec validation visuelle, et le code restant est soit du JSX de construction, soit des maths graphiques non testables sans GPU.

Précédent de référence : `src/scene/salon/salonCollision.ts` + `salonCollision.test.ts`.
