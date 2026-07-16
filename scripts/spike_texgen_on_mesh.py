# scripts/spike_texgen_on_mesh.py
# Spike 0: does the local Hunyuan3D-2GP gradio server expose a stage that
# textures a PROVIDED mesh (as opposed to generating geometry from images)?
# Prints every named endpoint + its component inputs so we can decide.
# Usage: python scripts/spike_texgen_on_mesh.py
import json
import requests

SERVER = "http://localhost:8080"

def main():
    cfg = requests.get(f"{SERVER}/config", timeout=30).json()
    comps = {c["id"]: c for c in cfg.get("components", [])}
    print(f"gradio version: {cfg.get('version')}")
    print(f"{len(cfg.get('dependencies', []))} dependencies\n")
    for i, dep in enumerate(cfg.get("dependencies", [])):
        api_name = dep.get("api_name")
        if api_name in (None, False):
            continue
        inputs = []
        for cid in dep.get("inputs", []):
            c = comps.get(cid, {})
            label = (c.get("props") or {}).get("label") or c.get("type")
            inputs.append(f"{c.get('type')}({label})")
        print(f"fn_index={i}  api_name=/{api_name}")
        print(f"  inputs: {inputs}\n")

    print("Look for an endpoint with a Model3D or File INPUT (mesh upload).")
    print("If none exists, the server cannot texture a provided mesh -> PIVOT.")

if __name__ == "__main__":
    main()
