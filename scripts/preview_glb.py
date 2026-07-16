# Rendu preview d'un GLB (vérif texture) : 2 vues face/dos sur fond neutre.
# Usage : blender --background --python scripts/preview_glb.py -- input.glb out_prefix [map_override.png]
#
# Skinned Mixamo GLBs in Blender 5.x:
#   The glTF importer places the mesh under a root EMPTY chain (scale 0.01 +
#   90° X rotation).  We detect this and compute the bbox directly from vertex
#   world-positions (bypassing the possibly-stale bound_box cache) using the
#   pre-bake matrix_world — this gives the true character silhouette extents.
#   We then render the mesh as-is (no baking needed for the visual), and place
#   the camera using those extents with the correct axis mapping.
#
#   For unskinned props the mesh is at scene root with identity matrix; the same
#   vertex-world-position path works transparently.
import math
import os
import sys

import bpy
import mathutils

argv = sys.argv[sys.argv.index("--") + 1 :]
input_glb, out_prefix = argv[0], argv[1]
map_override = argv[2] if len(argv) > 2 else None

out_prefix = os.path.abspath(out_prefix)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=input_glb)

if map_override:
    override_img = bpy.data.images.load(map_override)
    for obj in bpy.data.objects:
        if obj.type != "MESH" or not obj.data.materials:
            continue
        for mat in obj.data.materials:
            if mat and mat.use_nodes:
                for node in mat.node_tree.nodes:
                    if node.type == "TEX_IMAGE":
                        node.image = override_img

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 768
scene.render.resolution_y = 1024

world = bpy.data.worlds.new("W")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.25, 0.25, 0.28, 1)
scene.world = world

bpy.context.view_layer.update()

# ── Compute world-space bbox from actual vertex positions ─────────────────────
# We iterate mesh vertices and transform with matrix_world.  For skinned GLBs
# the matrix_world encodes the 0.01 scale + 90° X rotation from the glTF import
# so the resulting world coordinates are the physically correct positions of each
# vertex (sub-mm for a 0.01-scaled rig, but consistent with what EEVEE renders).
#
# We separately track the three principal extents so we can map them to the
# correct camera axis even when the character's height is in world Y (not Z).

mesh_objs = [o for o in scene.objects if o.type == "MESH"]

mins = mathutils.Vector(( 1e9,  1e9,  1e9))
maxs = mathutils.Vector((-1e9, -1e9, -1e9))

for obj in mesh_objs:
    mw = obj.matrix_world
    # Sample every vertex — accurate but O(n); fine for a preview script.
    for v in obj.data.vertices:
        w = mw @ v.co
        mins.x = min(mins.x, w.x); maxs.x = max(maxs.x, w.x)
        mins.y = min(mins.y, w.y); maxs.y = max(maxs.y, w.y)
        mins.z = min(mins.z, w.z); maxs.z = max(maxs.z, w.z)

if maxs.x < mins.x:
    mins = mathutils.Vector((-0.5, -0.5, 0.0))
    maxs = mathutils.Vector(( 0.5,  0.5, 1.8))

center  = (mins + maxs) / 2
extents = maxs - mins   # (X_width, Y_depth_or_height, Z_up_or_other)

print(f"[preview] vertex bbox: center={tuple(round(c,6) for c in center)}, "
      f"extents=({extents.x:.6f}, {extents.y:.6f}, {extents.z:.6f})")

# ── Identify the character's height axis and front axis ───────────────────────
# For Mixamo GLBs imported by Blender 5.x:
#   - Blender world X  = arm span (lateral)
#   - Blender world Y  = character height (glTF Y-up baked into world Y after
#                        the 90° X rotation in the parent EMPTY chain)
#   - Blender world Z  = character depth (front-to-back, very thin in T-pose)
#
# For unskinned props in standard Blender orientation:
#   - world Z = up/height
#
# We detect which world axis carries the most extent and call it "height".
# The camera orbits around that axis, framing the full extent.

ex, ey, ez = extents.x, extents.y, extents.z

if ey > ez * 2 and ey > ex * 0.8:
    # Height is in Y (Mixamo GLBs: glTF Y-up lands in world Y after the
    # 90° X rotation in the Blender 5.x EMPTY parent chain).
    # Camera orbits in the XZ plane (offsets along ±Z for face/dos),
    # looks horizontally toward the character.
    # The character's feet are at +Y (max) and head at -Y (min) in this
    # import, so bias toward -Y to favour the face/torso.
    height_axis = "Y"
    height_ext  = ey
    # head_y: the minimum Y value is where the head is
    head_bias = -height_ext * 0.15   # shift look_at toward the head end

    def cam_pos(angle, d, cx, cy, cz, bias):
        # orbit in XZ, camera stays at the same Y as look_at
        return mathutils.Vector((cx + d * math.sin(angle), cy + bias, cz - d * math.cos(angle)))

    def look_at_pt(cx, cy, cz, bias):
        return mathutils.Vector((cx, cy + bias, cz))

    # Camera up vector: head is at -Y (min_y), so -Y should map to "screen top".
    # We pass the up vector directly as a mathutils.Vector to a manual look-at.
    cam_up_vec = mathutils.Vector((0, -1, 0))  # -Y = head direction = screen up
else:
    # Height is in Z (standard Blender, unskinned props)
    height_axis = "Z"
    height_ext  = ez
    head_bias   = height_ext * 0.15   # bias toward top (+Z = up)

    def cam_pos(angle, d, cx, cy, cz, bias):
        return mathutils.Vector((cx + d * math.sin(angle), cy - d * math.cos(angle), cz + bias))

    def look_at_pt(cx, cy, cz, bias):
        return mathutils.Vector((cx, cy, cz + bias))

    cam_up_vec = mathutils.Vector((0, 0, 1))  # Z = up (standard Blender)

print(f"[preview] height_axis={height_axis}, height_ext={height_ext:.6f}")

# ── Lighting ──────────────────────────────────────────────────────────────────
sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN"))
sun.data.energy = 3
sun.rotation_euler = (math.radians(50), 0, math.radians(30))
scene.collection.objects.link(sun)

# ── Camera setup ──────────────────────────────────────────────────────────────
size = max(extents)

cam_data = bpy.data.cameras.new("Cam")
cam_data.clip_start = size * 0.001
cam_data.clip_end   = size * 200.0
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

# Frame the full character height in the portrait (768×1024) render.
# 50 mm lens, 36×24 mm sensor → VFOV_half = atan(12/50).
vfov_half = math.atan(12.0 / 50.0)
h_half = height_ext / 2.0
d = max(h_half / math.tan(vfov_half) * 1.15, size * 1.2)

cx, cy, cz = center.x, center.y, center.z

for label, angle in (("face", 0.0), ("dos", math.pi)):
    cp     = cam_pos(angle, d, cx, cy, cz, head_bias)
    lookat = look_at_pt(cx, cy, cz, head_bias)
    cam.location = cp
    direction = lookat - cp
    if direction.length < 1e-8:
        direction = mathutils.Vector((0, 1, 0))
    # Build look-at rotation manually so we can use any up vector (including -Y).
    # Camera -Z axis tracks the forward direction; camera Y axis tracks up.
    fwd = direction.normalized()          # camera -Z in world
    up  = cam_up_vec.copy()
    # Re-orthogonalise up against fwd to avoid singularity
    right = fwd.cross(up)
    if right.length < 1e-6:
        # fwd and up are (anti)parallel — perturb up slightly
        up = mathutils.Vector((up.x + 1e-4, up.y, up.z)).normalized()
        right = fwd.cross(up)
    right.normalize()
    true_up = right.cross(fwd)
    true_up.normalize()
    # Assemble rotation matrix: columns are right (+X), true_up (+Y), -fwd (+Z)
    # (Blender camera: +X = right, +Y = up, -Z = forward)
    rot = mathutils.Matrix((
        (right.x,   right.y,   right.z),
        (true_up.x, true_up.y, true_up.z),
        (-fwd.x,    -fwd.y,    -fwd.z),
    )).transposed()   # matrix_world rows are world-X expressed in each local axis
    cam.rotation_euler = rot.to_euler()
    filepath = f"{out_prefix}-{label}.png"
    scene.render.filepath = filepath
    bpy.ops.render.render(write_still=True)
    print(f"[preview] rendered → {filepath}")
