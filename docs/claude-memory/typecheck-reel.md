---
name: typecheck-reel
description: "Le vrai typecheck est `npm run typecheck` (tsc -b) — `tsc --noEmit` est un no-op sur ce repo"
metadata: 
  node_type: memory
  type: reference
  originSessionId: f17c65de-1822-44a0-8209-0922fcbe04ad
---

**`npx tsc --noEmit` NE VÉRIFIE RIEN sur ce repo.** Le `tsconfig.json` racine est en mode solution (`"files": []` + `references` vers tsconfig.app.json / tsconfig.node.json). `tsc --noEmit` sur ce fichier ne compile aucun fichier et sort toujours 0.

**Vrai typecheck = `npm run typecheck` (= `tsc -b`).** Utiliser `tsc -b --force` pour ignorer le cache incrémental.

Découvert le 2026-07-14 : toute la couche scène (`src/scene`) n'avait jamais été typée. `tsc --noEmit` (dans l'ancien CLAUDE.md) validait un no-op → 35 erreurs latentes cachées, dont 2 vrais bugs runtime : `<PorteAnimee>` non renommé dans Corridor (crash canvas) et `MODEL_TUNING.rotationY` inexistant dans GrandUncle (rotation tête NaN). Réparé 2026-07-14 (script `typecheck` + `src/vitest-globals.d.ts` pour les globals vitest + les 35 erreurs vidées).

**Toujours valider un refactor avec `npm run typecheck` + `npm test`, jamais `tsc --noEmit`.** Le dev vite/esbuild ne type-check pas non plus (strippe les types) → une erreur de type ne se voit qu'au `tsc -b` ou, si c'est une valeur JS indéfinie, au runtime.

Lié : [[standards-ingenierie]] (le filet est le socle des phases refactor), [[tpose-binding-clone]].
