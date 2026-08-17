# Día de Muertos

![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/-Three.js-000000?style=flat-square&logo=three.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vitest](https://img.shields.io/badge/-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![License](https://img.shields.io/badge/license-All_Rights_Reserved-lightgrey?style=flat-square)

A narrative browser game about a child who gets lost in the family house during the Día de Muertos celebration. Magical realism is the default regime of reality: the supernatural is not another world — it is the same world, with more depth of field.

**One evening. Continuous. 9 chapters. One song. One dog. One adult.**

## The game

A child plays hide-and-seek during a family dinner. His cousin abandons the game to go eat. The child waits, hidden, too long. When he comes out, he can no longer find the living room. The house has quietly become larger than it should be.

As he searches, he crosses paths with an adult nobody talks to. An ordinary man who hums a song in the corridor. The player who pays attention will notice things — a mirror without a reflection, a photo on the ofrenda, 20 chairs for 22 people. The game never points at any of it.

Two players can walk through the same evening and come back with two completely different levels of understanding. Both are right.

## Design pillars

- **Sound is 70% of the experience.** Six spatial audio layers (the living room, the living house, the memory of rooms, the animal presence, the song, the inhabited silence). The family speaks real Mexican Spanish — never narrative dialogue, always spatial sound. Spanish-speaking players get an extra layer of understanding; both experiences are complete.
- **Attention builds the experience.** No quest markers, no highlighted objects. Stillness is a mechanic: stop moving, and the world reveals a little more.
- **The house breathes.** Distances stretch gently. Doors open onto rooms you don't remember. Never abrupt — like the tide.

## Tech stack

| Layer | Tech |
|---|---|
| 3D scene | React Three Fiber 8 + Drei, cel-shading (`MeshToonMaterial` + back-face outlines) |
| Game state | Zustand 4 |
| Spatial audio | Howler.js 2 — 6-layer `AudioLayerManager` |
| Animation | GSAP 3 |
| Build & language | Vite 5, TypeScript strict |
| Tests | Vitest — pure logic layer only (stores + systems), 65+ tests |

## Current state

Playable sandbox of the family living room: 22 NPCs with three behavior tiers, Spanish ambient scenarios, anti-repetition scheduling, seated/walking state machine, third-person child-height camera, stillness system, subtitle system. Assets are geometric placeholders; an AI-assisted asset pipeline (3D characters, ambient audio, voices, song) is in design.

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, click to lock the mouse, move with WASD.

```bash
npm test         # pure logic tests
npx tsc --noEmit # type check
```

## Project documentation

Internal design docs (French/Spanish) live in `docs/`:

- Narrative spec (source of truth): `docs/specs-dia-de-muertos-v10.md`
- Backlog: `docs/project_v2_backlog.md`
- Visual references: `docs/references/visual-refs.md`

## License

All rights reserved — see [LICENSE](LICENSE). The code is public for reading and portfolio purposes; the game, its story, and its content may not be reused or redistributed.
