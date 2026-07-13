# drive_bases_texgen.py — génère les 6 bases persos via Hunyuan3D-2GP (localhost:8080)
# Usage : python scripts/drive_bases_texgen.py
# Durée estimée : ~14 min/base × 6 = ~1h30

import os
import shutil
import time
from pathlib import Path
from gradio_client import Client, handle_file

SERVER = "http://localhost:8080"
PROJECT_ROOT = Path(__file__).parent.parent
BASES_DIR = PROJECT_ROOT / "docs/references/characters/bases"
OUT_DIR    = PROJECT_ROOT / "docs/references/characters/bases"

BASES = [
    ("base-1.png", "base-1-homme-normal"),
    ("base-2.png", "base-2-homme-chauve"),
    ("base-3.png", "base-3-femme-adulte"),
    ("base-4.png", "base-4-femme-agee"),
    ("base-5.png", "base-5-garcon"),
    ("base-6.png", "base-6-fille"),
]

def main():
    client = Client(SERVER)
    print(f"[drive_bases] Connecté à {SERVER}")

    for img_name, label in BASES:
        img_path = BASES_DIR / img_name
        if not img_path.exists():
            print(f"[drive_bases] SKIP — fichier introuvable : {img_path}")
            continue

        out_glb = OUT_DIR / f"{label}-textured.glb"
        if out_glb.exists():
            print(f"[drive_bases] SKIP — déjà généré : {out_glb.name}")
            continue

        print(f"\n[drive_bases] ── Génération {label} ──")
        t0 = time.time()

        result = client.predict(
            caption=None,
            image=handle_file(str(img_path)),
            mv_image_front=None,
            mv_image_back=None,
            mv_image_left=None,
            mv_image_right=None,
            steps=50,
            guidance_scale=7.5,
            seed=1234,
            octree_resolution=256,
            check_box_rembg=False,
            num_chunks=200000,
            randomize_seed=False,
            api_name="/generation_all",
        )

        # result = (mesh_path, textured_path, html, stats, seed)
        textured_path = result[1]
        elapsed = time.time() - t0
        print(f"[drive_bases] Terminé en {elapsed/60:.1f} min → {textured_path}")

        if textured_path and os.path.exists(textured_path):
            shutil.copy(textured_path, str(out_glb))
            print(f"[drive_bases] Copié → {out_glb}")
        else:
            print(f"[drive_bases] ERREUR — fichier de sortie introuvable : {textured_path}")

    print("\n[drive_bases] ✓ Toutes les bases traitées.")
    print("Prochaine étape : upload FBX sur Mixamo pour chaque base (Standing Idle + Walk With Skin).")

if __name__ == "__main__":
    main()
