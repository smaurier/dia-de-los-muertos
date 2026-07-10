# Peinture vertex colors du héros par bandes de hauteur (pas d'UV dans les GLB
# Hunyuan → zones cartoon en couleur de sommet, lues par MeshToonMaterial
# vertexColors).
# Usage : blender --background --python scripts/vertex_paint_heros.py -- in.glb out.glb
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
if len(argv) != 2:
    raise SystemExit("Usage: blender --background --python vertex_paint_heros.py -- in.glb out.glb")

input_glb, output_glb = argv

PALETTE = {
    "peau":   (0xC8, 0x95, 0x6C),
    "shirt":  (0xA6, 0x3A, 0x2B),
    "shorts": (0x6B, 0x4A, 0x2F),
    "shoes":  (0xE8, 0xE2, 0xD4),
    "hair":   (0x24, 0x1A, 0x12),
}


def srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


LINEAR = {k: tuple(srgb_to_linear(v) for v in rgb) + (1.0,) for k, rgb in PALETTE.items()}


def zone(yf, xf, z):
    """yf: hauteur normalisée 0 (pieds) → 1 (sommet), xf: |x| normalisé sur
    l'envergure bras en T, z: profondeur locale (face supposée vers +z)."""
    # Proportions cartoon : la tête occupe ~1/3 de la hauteur (chin ≈ 0.66)
    if yf < 0.06:
        return "shoes"
    if yf < 0.26:
        return "peau"        # jambes
    if yf < 0.42:
        return "shorts"
    if yf < 0.66:
        # torse + bras en T : manches proches du torse, avant-bras/mains en peau
        if yf > 0.50 and xf > 0.36:
            return "peau"
        return "shirt"
    if yf > 0.90:
        return "hair"
    # tête : face avant = peau, arrière du crâne = cheveux
    return "hair" if z < -0.02 else "peau"


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=input_glb)

meshes = [o for o in bpy.data.objects if o.type == "MESH"]
if not meshes:
    raise SystemExit("Aucun mesh dans le GLB")

# Bornes globales (coordonnées monde Blender : Z-up après import glTF —
# la hauteur est en .z, la face du perso (glTF +Z) pointe vers -Y)
pts = [obj.matrix_world @ Vector(c) for obj in meshes for c in obj.bound_box]
min_h = min(p.z for p in pts)
max_h = max(p.z for p in pts)
max_ax = max(abs(p.x) for p in pts)

for obj in meshes:
    mesh = obj.data
    attr = mesh.color_attributes.new(name="Col", type="FLOAT_COLOR", domain="POINT")
    for i, v in enumerate(mesh.vertices):
        w = obj.matrix_world @ v.co
        yf = (w.z - min_h) / (max_h - min_h)
        xf = abs(w.x) / max_ax
        attr.data[i].color = LINEAR[zone(yf, xf, -w.y)]
    mesh.color_attributes.active_color = attr

bpy.ops.export_scene.gltf(filepath=output_glb, export_format="GLB", export_vertex_color="ACTIVE")
print(f"Painted -> {output_glb}")
