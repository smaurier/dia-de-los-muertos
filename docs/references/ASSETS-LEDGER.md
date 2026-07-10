# Registre des assets — licences et provenance

Règle (spec pipeline) : **aucun asset dans `public/` sans ligne ici.**
Une ligne = source exacte, licence, date. Les sorties d'outils non-commerciaux
(free tiers Suno/Tripo/Meshy/ElevenLabs) n'entrent jamais dans ce registre ni dans la build.

| Asset | Type | Chaîne de production | Licence | Date |
|---|---|---|---|---|
| `public/models/characters/grand-oncle.glb` | Modèle 3D riggé + anim sitting idle | Image ChatGPT (GPT-4o, sortie propriété utilisateur) → Hunyuan3D-2 HF Space (open source, commercial OK) → gltf-transform simplify → Blender headless → Mixamo auto-rig + Sitting Idle (licence Adobe : usage in-product OK) → Blender headless → GLB | Commercial OK (chaîne complète) | 2026-07-10 |
| `public/models/props/fauteuil.glb` | Prop 3D statique | Image ChatGPT → Hunyuan3D-2 HF Space → gltf-transform weld+simplify | Commercial OK | 2026-07-10 |
| `public/models/props/tv.glb` | Prop 3D statique (CRT + meuble) | Image ChatGPT → Hunyuan3D-2 HF Space → gltf-transform weld+simplify | Commercial OK | 2026-07-10 |
| `public/models/props/buffet.glb` | Prop 3D statique (tirage 2) | Image ChatGPT → Hunyuan3D-2 HF Space → gltf-transform weld+simplify | Commercial OK | 2026-07-10 |
| `public/models/props/chaise.glb` | Prop 3D statique (ladder-back, réutilisée ×20) | Image ChatGPT → Hunyuan3D-2 HF Space → gltf-transform weld+simplify (ratio 0.3) | Commercial OK | 2026-07-10 |
| `public/models/props/table.glb` | Prop 3D statique (non intégrée — banquet 8.5 m impossible en scale uniforme, nappe masque le placeholder) | Image ChatGPT → Hunyuan3D-2 HF Space → gltf-transform weld+simplify (ratio 0.3) | Commercial OK | 2026-07-10 |
| `public/textures/*.png` (mur-adobe, sol-tomettes, nappe-brodee, bois-sombre) | Textures peintes | Image ChatGPT (GPT-4o, sortie propriété utilisateur), tiling MirroredRepeat côté moteur | Commercial OK | 2026-07-10 |

Notes :
- FBX Mixamo bruts et intermédiaires : conservés en local (`docs/references/characters/*/mixamo|work/`), gitignorés — la licence Mixamo couvre l'usage dans le produit, pas la redistribution de fichiers standalone sur un repo public.
- Images de référence (`docs/references/**/*.png`) : générées ChatGPT/Nano Banana, propriété utilisateur, usage documentation.
