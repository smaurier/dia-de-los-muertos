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
