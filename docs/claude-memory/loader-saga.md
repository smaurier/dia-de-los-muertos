---
name: loader-saga
description: Saga du loader/chargement — root cause = compile shaders 12s ; preload + compile progressif en cours (bloque à 30%)
metadata: 
  node_type: memory
  type: project
  originSessionId: f17c65de-1822-44a0-8209-0922fcbe04ad
---

Chantier "loader qui a l'air cassé" (barre qui boucle + phrase figée). **Debug méthodique long (2026-07-15/16).**

**Root cause final (mesuré) :** le gel n'est PAS le chargement d'assets mais la **compilation des shaders (~12s), synchrone sur le thread principal** car Firefox (cible stricte de Sylvain) n'a pas `KHR_parallel_shader_compile` → `gl.compileAsync` bloque. Maison entière = 12098ms, salon seul = 2170ms. Un thread bloqué ne peut ni repeindre la barre ni faire tourner le timer des phrases → tout gèle. Aucune logique de loader n'anime à travers un thread gelé.

**Solution retenue (universelle) :** compile progressif — scène **cachée** au montage, compiler par paquets (~6 objets/frame) via `gl.compile(obj, camera, scene)` en rendant la main entre frames → thread respire → barre monte, phrases tournent. Révéler à 100%. Spec `docs/superpowers/specs/2026-07-16-progressive-shader-compile-design.md`, plan `docs/superpowers/plans/2026-07-16-progressive-shader-compile.md`.

**Fait (branche `feat-asset-preload`, PAS mergée) :**
- Preload assets 1 lot (manifeste propriétaire des URLs, `preloadAll`) → **boucle de barre corrigée**. `loaderState` réducteur testé (hasStarted + débounce, 404-safe).
- `compileQueue` (testé), `compileProgressStore` (zustand), `ProgressiveWarmup`, câblage App (FadeIn = assets 0→30% puis compile 30→100%).

**BUG en cours :** ça **s'arrête à 30%** — la phase compile n'avance pas (voir backlog `docs/project_v2_backlog.md`). À finir : instrumenter `ProgressiveWarmup` (queue/total/compiled/finished), vérifier que son `useFrame` tourne avec scène cachée + StrictMode.

**Gotcha lié :** [[typecheck-reel]] — `npm run typecheck`, jamais `tsc --noEmit`. Le vrai test = navigateur (Firefox Dev de Sylvain), `?perflog` pour la console.
