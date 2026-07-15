---
name: tpose-binding-clone
description: "T-pose intermittente des NPC GLB — useAnimations doit binder le clone, pas le group wrapper"
metadata: 
  node_type: memory
  type: reference
  originSessionId: f17c65de-1822-44a0-8209-0922fcbe04ad
---

Bug résolu 2026-07-14 (commit fd00318, `FamilyMemberGLB.tsx`). Symptôme : NPC de la tablée **intermittents** — parfois assis correctement, parfois tous en T-pose + "descendus de leur chaise" (l'assise vient du clip `Sitting Idle(4)`, pas d'un offset ; anim non liée = bind pose = debout au sol).

**Cause racine :** `useAnimations(animations, groupRef)` liait le mixer au group externe, alors que les os vivent dans `<primitive object={clonedScene}>` (SkeletonUtils.clone). three résout les PropertyBindings **paresseusement au premier `play()`** en cherchant les os par nom dans le sous-arbre du root — et **met en cache un bind échoué** si le primitive n'est pas encore monté (race StrictMode/timing). D'où l'intermittence au reload.

**Fix :** binder le mixer à `clonedScene` (stable dès le `useMemo`, contient déjà tous les os) → `useAnimations(animations, clonedScene)`. Root recommandé par la doc drei (`useAnimations(animations, scene)` + `<primitive object={scene}/>`). Binding déterministe, validé 5/5 reloads.

**Red herring évité :** `getObjectByName('mixamorig:Hips')` échouait car les os du clone sont sanitizés SANS deux-points (`mixamorigHips`) — three sanitise noms d'os ET tracks pareil, donc le binding lui-même n'était pas un problème de nom. Ne pas se fier à getObjectByName avec les noms Mixamo à colon.

Concerne le pipeline rigs partagés Hunyuan ([[casting-familial]], [[blink-personnages]]).
