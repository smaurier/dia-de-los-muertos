---
name: blink-personnages
description: "Système de clignement générique des personnages (swap de texture) — comment l'appliquer à un nouveau perso et les 3 pièges déjà payés"
metadata: 
  node_type: memory
  type: project
  originSessionId: 887e5fc1-bcb4-4bbd-af28-4ac3e926b125
---

**Système** : pas de blendshapes sur les mesh Hunyuan → clignement par SWAP de texture. `src/scene/shared/blinkTexture.ts` : `makeBlinkTexture(textureDuGLB, eyes)` génère en mémoire la variante paupières fermées (canvas, teint échantillonné en anneau autour de l'œil + pli d'ombre). Usage dans Player.tsx (héros) — réutilisable NPCs.

**Nouveau personnage = 2 étapes** :
1. Relever les coordonnées atlas des 2 yeux (pixels, repère PNG) : crops visuels du baseColor ou `scripts/probe_face_uv.py`. ATTENTION : la détection auto par blobs blancs confond yeux et baskets/lacets — vérifier à l'œil.
2. Config `{x, y, r}` ×2 (cf. `HERO_EYES`), rayon ≈ œil + 15 %.

**3 pièges déjà payés (ne pas re-débugger)** :
- `GLTFLoader` livre des `ImageBitmap` parfois PRÉ-RETOURNÉES verticalement → `makeBlinkTexture` auto-détecte l'orientation (score de blanc de sclère à y vs H−y). Ne pas supposer le repère.
- **StrictMode double rendu = matériau orphelin** : garder une référence aux matériaux créés dans un useMemo peut pointer sur la copie NON rendue → le swap « marche » (logs OK) sans effet visuel. Toujours muter via `scene.traverse(...)` le matériau porté par le mesh à l'instant du swap.
- Texture externe via `useTexture` : uploadée au GPU AVANT tout réglage flipY/colorSpace (ignorés sans needsUpdate). Le système actuel n'utilise PLUS de fichier externe — ne pas y revenir.

**Debug** : `?blinktest` (clignement 1 s / 0,9 s + état dans le titre d'onglet), `?blinkred` (variante rouge uni → isole swap-ne-rend-pas vs variante-invisible).

**Micro-saccades (fait 2026-07-11)** : `makeFaceTextures(source, eyes)` → `{ blink, gaze[] }` — 6 variantes de regard (intérieur de l'œil décalé ±2-4 px par clip ellipse, saut instantané toutes les 0,7-2,4 s, biais 45 % regard centré). Décalages VOLONTAIREMENT petits : les charts UV des deux yeux sont orientés différemment, un grand décalage ferait diverger le regard.

**Extension prévue** : bouche ouverte quand `subtitleStore.speaker === 'Niño'` (même mécanique, backlog).
