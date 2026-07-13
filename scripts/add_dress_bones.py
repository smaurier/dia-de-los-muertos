# Usage après génération :
#   blender --background --python scripts/add_dress_bones.py -- \
#     public/models/characters/mama.glb public/models/characters/mama.glb
# Le GLB est écrasé in-place (sauvegarde l'original d'abord si besoin).

import sys
import bpy
import mathutils

def main():
    argv = sys.argv
    # Arguments après '--'
    try:
        sep_index = argv.index('--')
        args = argv[sep_index + 1:]
    except ValueError:
        print("[dress-bones] ERREUR: passer les arguments après '--'")
        print("[dress-bones] Usage: blender --background --python scripts/add_dress_bones.py -- <input.glb> <output.glb>")
        sys.exit(1)

    if len(args) < 2:
        print("[dress-bones] ERREUR: il faut <input.glb> <output.glb>")
        sys.exit(1)

    input_glb = args[0]
    output_glb = args[1]

    print(f"[dress-bones] Import {input_glb}")

    # Nettoyer la scène
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Import GLB
    bpy.ops.import_scene.gltf(filepath=input_glb)

    # Trouver l'armature
    armature_obj = None
    for obj in bpy.data.objects:
        if obj.type == 'ARMATURE':
            armature_obj = obj
            break

    if armature_obj is None:
        print("[dress-bones] ERREUR: aucune armature trouvée dans le GLB")
        sys.exit(1)

    print(f"[dress-bones] Armature trouvée : {armature_obj.name}")

    # Trouver le mesh principal (le plus de vertices)
    mesh_obj = None
    max_verts = 0
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            vert_count = len(obj.data.vertices)
            if vert_count > max_verts:
                max_verts = vert_count
                mesh_obj = obj

    if mesh_obj is None:
        print("[dress-bones] ERREUR: aucun mesh trouvé dans le GLB")
        sys.exit(1)

    print(f"[dress-bones] Mesh principal : {mesh_obj.name} ({max_verts} vertices)")

    # Passer en EDIT mode sur l'armature
    bpy.context.view_layer.objects.active = armature_obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.context.view_layer.update()

    edit_bones = armature_obj.data.edit_bones

    # Trouver le bone Hips
    hips_bone = None
    for bone in edit_bones:
        if bone.name in ('mixamorig:Hips', 'mixamorigHips', 'Hips'):
            hips_bone = bone
            break

    if hips_bone is None:
        print("[dress-bones] WARN: Hips introuvable")
        bpy.ops.object.mode_set(mode='OBJECT')
        sys.exit(1)

    print(f"[dress-bones] Hips trouvé : {hips_bone.name}")

    # Position de base = tail du bone Hips
    hips_tail = hips_bone.tail.copy()

    SKIRT_BONES = [
        ('SkirtFront', mathutils.Vector((0,  -0.45,  0.18))),
        ('SkirtBack',  mathutils.Vector((0,  -0.45, -0.18))),
        ('SkirtLeft',  mathutils.Vector(( 0.18, -0.45, 0))),
        ('SkirtRight', mathutils.Vector((-0.18, -0.45, 0))),
    ]

    created_bones = []
    for bone_name, offset in SKIRT_BONES:
        new_bone = edit_bones.new(bone_name)
        new_bone.head = hips_tail.copy()
        new_bone.tail = hips_tail + offset
        new_bone.use_connect = False
        new_bone.parent = hips_bone
        created_bones.append(bone_name)
        print(f"[dress-bones] Bone créé : {bone_name} head={new_bone.head} tail={new_bone.tail}")

    # Revenir en OBJECT mode
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.context.view_layer.update()

    # --- Vertex groups sur le mesh ---

    # Créer les vertex groups
    vg_front = mesh_obj.vertex_groups.new(name='SkirtFront')
    vg_back  = mesh_obj.vertex_groups.new(name='SkirtBack')
    vg_left  = mesh_obj.vertex_groups.new(name='SkirtLeft')
    vg_right = mesh_obj.vertex_groups.new(name='SkirtRight')

    vg_map = {
        'SkirtFront': vg_front,
        'SkirtBack':  vg_back,
        'SkirtLeft':  vg_left,
        'SkirtRight': vg_right,
    }

    # Chercher le vertex group Hips sur le mesh
    hips_vg = mesh_obj.vertex_groups.get('mixamorig:Hips') \
           or mesh_obj.vertex_groups.get('mixamorigHips') \
           or mesh_obj.vertex_groups.get('Hips')

    # Bones de jambe : les vertices avec poids sur ces bones = mesh jambe → à exclure
    LEG_BONE_NAMES = {
        'mixamorig:LeftUpLeg', 'mixamorig:RightUpLeg',
        'mixamorig:LeftLeg',   'mixamorig:RightLeg',
        'mixamorig:LeftFoot',  'mixamorig:RightFoot',
        'mixamorig:LeftToeBase', 'mixamorig:RightToeBase',
        # variantes sans ':'
        'mixamorigLeftUpLeg', 'mixamorigRightUpLeg',
        'mixamorigLeftLeg',   'mixamorigRightLeg',
    }
    leg_vg_indices = {
        vg.index for vg in mesh_obj.vertex_groups
        if vg.name in LEG_BONE_NAMES
    }
    print(f"[dress-bones] {len(leg_vg_indices)} vertex groups jambe trouvés")

    # Zone Z : 15% à 85% de la hauteur (exclure pieds et tête)
    world_zs = [
        (mesh_obj.matrix_world @ v.co).z
        for v in mesh_obj.data.vertices
    ]
    z_min = min(world_zs)
    z_max = max(world_zs)
    z_range = z_max - z_min
    z_lo = z_min + z_range * 0.15  # au-dessus des pieds
    z_hi = z_min + z_range * 0.80  # en-dessous de la poitrine

    print(f"[dress-bones] Z range : {z_min:.3f} → {z_max:.3f}, zone jupe : [{z_lo:.3f}, {z_hi:.3f}]")

    redirected = 0
    for vert in mesh_obj.data.vertices:
        world_co = mesh_obj.matrix_world @ vert.co
        wz = world_co.z
        wx = world_co.x
        wy = world_co.y

        # Zone Z : entre pieds et poitrine
        if not (z_lo <= wz <= z_hi):
            continue

        # FILTRE CLÉ : exclure les vertices avec poids significatif sur les jambes
        # (robe = poids nul sur jambes ; jambes = poids >5% sur bones jambes)
        leg_w = sum(
            ge.weight for ge in vert.groups
            if ge.group in leg_vg_indices
        )
        if leg_w >= 0.05:
            continue  # vertex de jambe → pas toucher

        # Déterminer le quadrant horizontal : comparer |wy| vs |wx| pour front/back vs left/right
        abs_wy = abs(wy)
        abs_wx = abs(wx)

        if abs_wy >= abs_wx:
            # Front ou Back (axe Y Blender = axe Z Three.js après export YUP)
            bone_name = 'SkirtFront' if wy > 0 else 'SkirtBack'
        else:
            # Left ou Right (axe X Blender = axe X Three.js)
            bone_name = 'SkirtLeft' if wx > 0 else 'SkirtRight'

        target_vg = vg_map[bone_name]

        # Poids primaire = 0.7 sur le bone jupe
        target_vg.add([vert.index], 0.7, 'REPLACE')

        # Réduire le poids Hips de 0.7 (pas en dessous de 0), garder 0.3
        if hips_vg is not None:
            # Lire le poids actuel de Hips sur ce vertex
            try:
                current_hips = hips_vg.weight(vert.index)
            except RuntimeError:
                current_hips = 0.0
            new_hips = max(0.0, current_hips - 0.7)
            if new_hips > 0.0:
                hips_vg.add([vert.index], new_hips, 'REPLACE')
            else:
                # Garder au moins 0.3 de Hips pour l'ancrage
                hips_vg.add([vert.index], 0.3, 'REPLACE')

        redirected += 1

    print(f"[dress-bones] {redirected} vertices redirigés vers bones jupe")

    if redirected == 0:
        print("[dress-bones] WARN: 0 vertices dans la zone jupe — vérifier le seuil Z")

    # Export GLB
    print(f"[dress-bones] Export → {output_glb}")
    bpy.ops.export_scene.gltf(
        filepath=output_glb,
        export_format='GLB',
        export_animations=True,
        export_animation_mode='NLA_TRACKS',
        export_skins=True,
        export_yup=True,
    )

    print(f"[dress-bones] Terminé. GLB exporté : {output_glb}")


main()
