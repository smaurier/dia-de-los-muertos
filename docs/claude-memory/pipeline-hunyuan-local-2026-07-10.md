---
name: pipeline-hunyuan-local-2026-07-10
description: "Hunyuan3D-2GP local OPÉRATIONNEL (2026-07-11) — comment relancer le serveur, pièges résolus, prochaine étape = génération héros par Sylvain"
metadata: 
  node_type: memory
  type: project
  originSessionId: 835b865f-6b00-43e4-8c6a-1e548a839a62
---

**État : SERVEUR FONCTIONNEL (2026-07-11)** — `http://localhost:8080`, texture generator chargé, tous les poids en cache (~15 GB).

**Relancer le serveur** (détaché, survit à la session) :
```powershell
Start-Process -FilePath "C:\Users\sylva\tools\Hunyuan3D-2GP\venv\Scripts\python.exe" -ArgumentList "gradio_app.py","--profile","4" -WorkingDirectory "C:\Users\sylva\tools\Hunyuan3D-2GP" -RedirectStandardOutput "C:\Users\sylva\tools\Hunyuan3D-2GP\gradio-server.log" -RedirectStandardError "C:\Users\sylva\tools\Hunyuan3D-2GP\gradio-server.log.err" -WindowStyle Hidden
```
Démarrage ~3-5 min (chargement modèles). URL dans le .err : « Uvicorn running on http://0.0.0.0:8080 ».

**Pièges résolus (ne pas re-débugger)** :
- CUDA 12.4 installé ✓ (`nvcc` OK, CUDA_PATH système posé)
- diso/custom_rasterizer/differentiable_renderer compilés ✓ — recette : shell cmd avec vcvars64 + `DISTUTILS_USE_SDK=1` + `CUDA_HOME` posé, `--no-build-isolation`, et NE PAS toucher PATH dans la chaîne cmd (%PATH% expansé avant vcvars64 → cl.exe introuvable)
- `custom_rasterizer` : importer torch AVANT (DLL CUDA), et être dans le repo pour `hy3dgen`
- Symlinks HF : **Mode développeur Windows activé** (sinon WinError 1314)
- `trust_remote_code=True` patché dans `hy3dgen/texgen/utils/multiview_utils.py:33` (diffusers récent refuse le pipeline custom hunyuanpaint sinon)
- Downloads HF in-process se PENDENT systématiquement (socket mort sans timeout) → télécharger via CLI `hf download` séparé (avec `$env:PYTHONIOENCODING="utf-8"`, l'ancien `huggingface-cli` plante sur emoji cp1252) ; `hf_xet` installé
- « internal server error » sur / : `TypeError: unhashable type: 'dict'` = starlette/fastapi trop récents pour gradio 4.44.1 → **pin `fastapi==0.115.6` + `starlette==0.41.3`** (ne pas laisser un `pip install -r requirements.txt` les réupgrader)
- `MAX_SEED = 1e7` float → `int(1e7)` dans gradio_app.py (Python 3.12 strict)
- **TEXTURE NOIRE = NaN fp16 sur GTX 16xx** (Turing, bug connu SD) → texgen passé en **float32** dans `multiview_utils.py` + `dehighlight_utils.py`, ET `enable_attention_slicing("max")` + VAE slicing/tiling obligatoires (sinon OOM 22 GB : fp32 perd l'attention mémoire-efficiente). Résultat : texture 14 min, nickel.
- Barres de progression UI : `progress=gr.Progress(track_tqdm=True)` ajouté aux 3 fonctions de génération de gradio_app.py
- Génération pilotable sans UI : `drive_heros_texgen.py` (gradio_client, endpoint `/generation_all`, seed fixe 1234) — réutiliser pour grand-oncle/props

**FAIT (nuit 2026-07-11)** : `heros-textured-02.glb` (89 866 verts — face reduction Hunyuan) + `heros-textured-02.fbx` (4,2 MB, texture embarquée) dans `docs/references/characters/heros/work/`, previews `preview2-face/dos.png` validées (t-shirt rouge, short marron, baskets). **Prochaine étape = Sylvain : upload FBX sur Mixamo**, télécharger Standing Idle (With Skin) + Walking + Crouching Idle (Without Skin).

**Prochaine étape (Sylvain, dans l'UI Gradio)** : générer héros depuis `docs/references/characters/heros/heros-tpose-01.png` avec texture → export GLB → `docs/references/characters/heros/work/heros-textured-01.glb`. Si OOM VRAM (1660 Ti 6GB) : baisser octree resolution ou profil 5.

**Ensuite (pipeline)** : simplify (PRÉSERVER UV/texture !) → FBX → Sylvain Mixamo (Standing Idle With Skin, Walking, Crouching Idle) → merge → `public/models/characters/heros.glb` → Player.tsx (map + gradientMap toon). Puis retraiter grand-oncle pareil (re-upload Mixamo, 6 anims connues). Puis props : canapé, plantes, chaises v2 osier, table aux bonnes dimensions (specs dans backlog).

Voir [[salon-roadmap-2026-07]].
