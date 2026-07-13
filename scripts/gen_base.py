#!/usr/bin/env python3
"""
Generate GLB from Hunyuan3D-2GP via raw HTTP — supports multi-view (front/back/left).
Usage: python scripts/gen_base.py <front.png> <output.glb> [--back b.png] [--left l.png]
       python scripts/gen_base.py --all   # run all 9 characters sequentially
"""
import sys, json, time, uuid, argparse
from pathlib import Path
import requests

SERVER  = "http://localhost:8080"
FN_INDEX = 7  # /generation_all

BASE_DIR  = Path(__file__).parent.parent
VIEWS_DIR = BASE_DIR / "docs/references/characters"
OUT_DIR   = BASE_DIR / "docs/references/characters"

QUEUE = [
    {
        "name":  "base-01",
        "front": VIEWS_DIR / "bases/views/base-01-front.png",
        "back":  VIEWS_DIR / "bases/views/base-01-back.png",
        "left":  VIEWS_DIR / "bases/views/base-01-left.png",
        "out":   OUT_DIR   / "bases/output/base-01.glb",
    },
    {
        "name":  "base-02",
        "front": VIEWS_DIR / "bases/views/base-02-front.png",
        "back":  VIEWS_DIR / "bases/views/base-02-back.png",
        "left":  VIEWS_DIR / "bases/views/base-02-left.png",
        "out":   OUT_DIR   / "bases/output/base-02.glb",
    },
    {
        "name":  "base-03",
        "front": VIEWS_DIR / "bases/views/base-03-front.png",
        "back":  VIEWS_DIR / "bases/views/base-03-back.png",
        "left":  VIEWS_DIR / "bases/views/base-03-left.png",
        "out":   OUT_DIR   / "bases/output/base-03.glb",
    },
    {
        "name":  "base-04",
        "front": VIEWS_DIR / "bases/views/base-04-front.png",
        "back":  VIEWS_DIR / "bases/views/base-04-back.png",
        "left":  VIEWS_DIR / "bases/views/base-04-left.png",
        "out":   OUT_DIR   / "bases/output/base-04.glb",
    },
    {
        "name":  "base-05",
        "front": VIEWS_DIR / "bases/views/base-05-front.png",
        "back":  VIEWS_DIR / "bases/views/base-05-back.png",
        "left":  VIEWS_DIR / "bases/views/base-05-left.png",
        "out":   OUT_DIR   / "bases/output/base-05.glb",
    },
    {
        "name":  "base-06",
        "front": VIEWS_DIR / "bases/views/base-06-front.png",
        "back":  VIEWS_DIR / "bases/views/base-06-back.png",
        "left":  VIEWS_DIR / "bases/views/base-06-left.png",
        "out":   OUT_DIR   / "bases/output/base-06.glb",
    },
    {
        "name":  "heros",
        "front": VIEWS_DIR / "heros/views/heros-front.png",
        "back":  VIEWS_DIR / "heros/views/heros-back.png",
        "left":  VIEWS_DIR / "heros/views/heros-left.png",
        "out":   OUT_DIR   / "heros/output/heros.glb",
    },
    {
        "name":  "mama",
        "front": VIEWS_DIR / "mama/views/mama-front.png",
        "back":  VIEWS_DIR / "mama/views/mama-back.png",
        "left":  VIEWS_DIR / "mama/views/mama-left.png",
        "out":   OUT_DIR   / "mama/output/mama.glb",
    },
    {
        "name":  "grand-oncle",
        "front": VIEWS_DIR / "grand-oncle/views/grand-oncle-front.png",
        "back":  VIEWS_DIR / "grand-oncle/views/grand-oncle-back.png",
        "left":  VIEWS_DIR / "grand-oncle/views/grand-oncle-left.png",
        "out":   OUT_DIR   / "grand-oncle/output/grand-oncle.glb",
    },
]


def upload(img_path: str) -> dict:
    with open(img_path, "rb") as f:
        r = requests.post(
            f"{SERVER}/upload",
            files={"files": (Path(img_path).name, f, "image/png")},
            timeout=30,
        )
    r.raise_for_status()
    tmp = r.json()[0]
    return {"path": tmp, "orig_name": Path(img_path).name, "meta": {"_type": "gradio.FileData"}}


def generate(name: str, front: str, out: str, back: str = None, left: str = None,
             steps: int = 50, seed: int = 1234):
    print(f"\n{'='*50}", flush=True)
    print(f"[{name}] Uploading...", flush=True)

    img_data   = upload(front)
    back_data  = upload(back)  if back  else None
    left_data  = upload(left)  if left  else None

    print(f"[{name}] Uploaded front={img_data['orig_name']}", flush=True)

    data = [
        None,       # caption
        img_data,   # image (front)
        None,       # mv_image_front (same as image)
        back_data,  # mv_image_back
        left_data,  # mv_image_left
        None,       # mv_image_right
        steps,      # steps (int)
        5.0,        # guidance_scale
        seed,       # seed (int)
        256,        # octree_resolution (int)
        True,       # check_box_rembg
        8000,       # num_chunks (int)
        False,      # randomize_seed
    ]

    session_hash = uuid.uuid4().hex[:10]
    print(f"[{name}] Submitting job (session={session_hash})...", flush=True)

    r = requests.post(
        f"{SERVER}/queue/join",
        json={"fn_index": FN_INDEX, "data": data, "session_hash": session_hash, "event_data": None},
        timeout=30,
    )
    r.raise_for_status()
    print(f"[{name}] Queued: {r.json()}", flush=True)

    print(f"[{name}] Waiting (shape ~13min + texture ~30min)...", flush=True)
    status_url = f"{SERVER}/queue/data?session_hash={session_hash}"

    with requests.get(status_url, stream=True, timeout=7200) as sse:
        for raw in sse.iter_lines():
            if not raw:
                continue
            line = raw.decode("utf-8") if isinstance(raw, bytes) else raw
            if not line.startswith("data:"):
                continue
            msg    = json.loads(line[5:].strip())
            status = msg.get("msg", "")
            if status not in ("heartbeat", "queue_full"):
                print(f"  [{name}] {status}", flush=True)

            if status == "process_completed":
                output = msg.get("output", {})
                if output.get("error"):
                    print(f"[{name}] ERROR: {output['error']}", flush=True)
                    return False
                data_list = output.get("data", [])
                # data[0]=white_mesh, data[1]=textured_mesh (cf. gradio_app.py generation_all outputs)
                raw = data_list[1] if len(data_list) > 1 else data_list[0] if data_list else None
                glb_info = raw
                # Unwrap Gradio {"value": {...}, "__type__": "update"} wrapper
                if isinstance(glb_info, dict) and glb_info.get("__type__") == "update":
                    glb_info = glb_info.get("value", glb_info)
                print(f"[{name}] glb_info keys={list(glb_info.keys()) if isinstance(glb_info, dict) else glb_info}", flush=True)
                if isinstance(glb_info, dict):
                    if glb_info.get("url"):
                        file_url = glb_info["url"]
                    elif glb_info.get("path"):
                        file_url = f"{SERVER}/file={glb_info['path']}"
                    elif glb_info.get("name"):
                        file_url = f"{SERVER}/file={glb_info['name']}"
                    else:
                        print(f"[{name}] ERROR: cannot find URL in {glb_info}", flush=True)
                        return False
                else:
                    file_url = f"{SERVER}/file={glb_info}"
                print(f"[{name}] Downloading {file_url}...", flush=True)
                time.sleep(5)  # évite race condition écriture fichier
                dl = requests.get(file_url, timeout=120)
                dl.raise_for_status()
                Path(out).parent.mkdir(parents=True, exist_ok=True)
                Path(out).write_bytes(dl.content)
                size_kb = len(dl.content) // 1024
                print(f"[{name}] SAVED: {out} ({size_kb} KB)", flush=True)
                return True

            elif status == "process_errored":
                print(f"[{name}] ERRORED: {msg}", flush=True)
                return False

    return False


def run_all():
    total   = len(QUEUE)
    success = 0
    for i, item in enumerate(QUEUE, 1):
        print(f"\n>>> [{i}/{total}] {item['name']}", flush=True)
        ok = generate(
            name  = item["name"],
            front = str(item["front"]),
            back  = str(item["back"]),
            left  = str(item["left"]),
            out   = str(item["out"]),
        )
        if ok:
            success += 1
        else:
            print(f"!!! {item['name']} FAILED — skipping", flush=True)

    print(f"\n{'='*50}", flush=True)
    print(f"DONE: {success}/{total} generated", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--all",   action="store_true", help="Run all 9 characters")
    parser.add_argument("--name",  default=None,        help="Run single character by name (e.g. base-02)")
    parser.add_argument("image",   nargs="?",           help="Front image path")
    parser.add_argument("output",  nargs="?",           help="Output GLB path")
    parser.add_argument("--back",  default=None)
    parser.add_argument("--left",  default=None)
    parser.add_argument("--steps", type=int, default=50)
    parser.add_argument("--seed",  type=int, default=1234)
    args = parser.parse_args()

    if args.all:
        run_all()
    elif args.name:
        item = next((q for q in QUEUE if q["name"] == args.name), None)
        if not item:
            print(f"Unknown name: {args.name}. Available: {[q['name'] for q in QUEUE]}")
        else:
            generate(item["name"], str(item["front"]), str(item["out"]),
                     str(item["back"]), str(item["left"]))
    elif args.image and args.output:
        generate(Path(args.image).stem, args.image, args.output, args.back, args.left, args.steps, args.seed)
    else:
        parser.print_help()
