---
name: reco-modele
description: "Convention : signaler à Sylvain quand changer de modèle Claude (escalade/désescalade), aux transitions seulement"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 887e5fc1-bcb4-4bbd-af28-4ac3e926b125
---

Sylvain veut que l'assistant lui **signale quand changer de modèle** (`/model`), dans les deux sens, en fin de réponse et SEULEMENT aux transitions (pas de rappel à chaque message).

**Why :** maîtriser les coûts — les gros modèles (Opus/Fable) ne paient que sur les diagnostics multi-couches et la conception ; l'exécution de recettes rodées (pipeline personnages, placements, commits, surveillance de générations) se fait bien sur Sonnet.

**How to apply :**
- Travail qui devient mécanique/récursif avec recettes existantes → « ⚙️ reco : Sonnet suffit pour la suite »
- Bug qui résiste à 2-3 hypothèses, conception d'un nouveau système, débogage croisé (Blender/three/GPU) → « ⚙️ reco : remonte sur Opus/Fable pour ce problème »
- Si l'assistant EST un petit modèle et sent qu'il patine (mêmes erreurs répétées, diagnostic incertain) : le dire explicitement et recommander l'escalade plutôt que d'itérer à l'aveugle.
- Repères issus du projet : diagnostics durs passés = NaN fp16 GTX 16xx, matériau orphelin StrictMode, rotation_euler/quaternion Blender, chiralité mesh, ImageBitmap flip. Recettes rodées = pipeline Hunyuan→Mixamo→GLB (voir [[pipeline-hunyuan-local-2026-07-10]]), visage vivant ([[blink-personnages]]).
