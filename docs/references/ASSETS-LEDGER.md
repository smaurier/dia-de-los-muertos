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

| `public/models/characters/base-01.glb` | Modèle 3D riggé + anim retexturé (homme adulte — papa, oncle1, oncle-jeune ; pilote) | Géométrie Hunyuan3D-2GP existante → Smart-UV unwrap (Blender headless unwrap_base.py) → bake texture plate depuis base-01-front.png (bake_flat_texture.py) → projection visage (project_face.py) → gltf-transform resize 1024 + prune | Commercial OK (chaîne complète) — licence géométrie Hunyuan inchangée ; image-driven (pas de prompt) | 2026-07-16 |
| `public/models/characters/base-03.glb` | Modèle 3D riggé + anim retexturé (femme adulte — maman, tante1, tante2, tante-jeune) | Géométrie Hunyuan3D-2GP + rig Mixamo existant → Smart-UV unwrap (unwrap_base.py) → bake_flat_texture.py (body) → project_face.py --face-top 1.0 --face-bottom 0.80 (visage) → swap_texture.py (atlas → GLB riggé) → gltf-transform resize 1024 | Commercial OK (chaîne complète) — rig Mixamo : usage in-product OK | 2026-07-16 |
| `public/models/characters/base-04.glb` | Modèle 3D riggé + anim retexturé (femme âgée — grande-tante) | Géométrie Hunyuan3D-2GP + rig Mixamo existant → Smart-UV unwrap (unwrap_base.py) → bake_flat_texture.py (body) → project_face.py --face-top 1.0 --face-bottom 0.80 (visage) → swap_texture.py (atlas → GLB riggé) → gltf-transform resize 1024 | Commercial OK (chaîne complète) — rig Mixamo : usage in-product OK | 2026-07-16 |

| `public/models/characters/heros.glb` | Modèle 3D riggé + anim (héros enfant) — correctif texture | Atlas 2048×2048 extrait (trimesh) → artefact rouge sur le nez localisé (atlas y=261, x=1702, RGB 207,18,18) → 71 texels repeints au ton chair médian [211,174,150] (fix_hero_nose.py --box 1692,251,1714,273) → swap_texture.py (Blender) → rig + 5 clips préservés | Commercial OK (rig/anim Mixamo, usage in-product) | 2026-07-16 |

Notes :
- FBX Mixamo bruts et intermédiaires : conservés en local (`docs/references/characters/*/mixamo|work/`), gitignorés — la licence Mixamo couvre l'usage dans le produit, pas la redistribution de fichiers standalone sur un repo public.
- Images de référence (`docs/references/**/*.png`) : générées ChatGPT/Nano Banana, propriété utilisateur, usage documentation.
