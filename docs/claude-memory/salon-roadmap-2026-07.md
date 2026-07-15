---
name: salon-roadmap-2026-07
description: "Todo validée par Sylvain (2026-07-10) — 5 chantiers ordonnés vers l'image de ref du salon"
metadata: 
  node_type: memory
  type: project
  originSessionId: 6952dcae-7789-450e-928a-784c38cb6354
---

Roadmap salon validée par Sylvain le 2026-07-10, exécution dans l'ordre 1→5 :

1. ✅ **Palier 2 rendu** — gradient toon 5 bandes (plancher 60), hemisphereLight ambré/terracotta, fog resserré (7/24), bloom 0.45. FAIT.
2. ✅ **Papel picado refonte** — alphaMaps procédurales (`papelTexture.ts`), caténaire, ondulation par vertex. Validé par Sylvain + commité le 2026-07-10 (8c6e4c8).
3. ✅ **Palier 3 textures peintes** — 4 textures intégrées (`paintedTextures.ts`, `public/textures/`). Validé par Sylvain + commité le 2026-07-10 (8c6e4c8).
4. ✅ **Chaises GLB** — chaise ladder-back Hunyuan3D intégrée ×20 (commit 53975d1, 2026-07-10). Table GLB générée mais NON intégrée (banquet 8.5 m impossible en scale uniforme, nappe masque le placeholder) — asset au ledger.
5. ⬜ **Personnages** — un modèle par membre de familyConfig, pipeline grand-oncle (tpose → GLB → anims).

**Why:** Sylvain trouvait le rendu « trop Minecraft » — cible = `docs/references/rooms/salon/salon-vue-entree-01.png` (à moitié peint).
**How to apply:** reprendre à la tâche 4 (table + chaises GLB, pipeline props). Attention : les GLB du pipeline arrivent sans normales — fix déjà en place dans `Prop.tsx`, voir [[debug-ecran-noir-2026-07-10]].
