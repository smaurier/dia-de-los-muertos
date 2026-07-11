# Coussins canapé — texture nette via GLB sub-mesh override

Date : 2026-07-11

## Problème

`paint_pillows_planar.py` peint dans l'atlas Hunyuan : UV irrégulières + masque
couleur fragile → texture mal appliquée, volume coussin mal couvert.

## Solution

Charger `canape-full.glb` (canapé + 3 coussins fusionnés via `place_pillows.py`)
et overrider les matériaux des nodes coussins en Three.js — zéro peinture d'atlas.

### Géométrie confirmée (trimesh inspection)

- `canape-full.glb` contient 4 nodes : `tmpbv5l_ov_.ply` (body, 23 970 verts),
  `coussin-rouge`, `coussin-creme`, `coussin-violet` (1 705 verts chacun, géo Cube Blender).
- UV des coussins : [0.27, 0.27] → [0.73, 0.73] — toutes faces sur la même zone centrale.
  Avec `RepeatWrapping`, un motif tileant couvre tout le volume proprement.

### Sources des motifs

Déjà dans le repo :
- `docs/references/prop/coussins/coussin-rouge-01.png`
- `docs/references/prop/coussins/coussin-creme-01.png`
- `docs/references/prop/coussins/coussin-violet-01.png`

→ Copier dans `public/textures/` et charger via `useTexture`.

## Architecture

### Nouveau composant `src/scene/salon/Canape.tsx`

```tsx
function Canape({ position, rotationY }: { position: [number,number,number], rotationY: number }) {
  const { nodes } = useGLTF('/models/props/canape-full.glb')
  const [rouge, creme, violet] = useTexture([...])
  // RepeatWrapping + repeat(3, 3) sur chaque texture
  // MeshToonMaterial pour body (couleur tissu) + 3 coussins (map=motif)
  // Outlines back-face sur tous les meshes
}
```

### Remplacement dans `SalonRoom.tsx`

- Supprimer `<Prop url="/models/props/canape.glb" ...>`
- Ajouter `<Canape position={...} rotationY={...} />`
- Import `Canape` depuis `./Canape`

### Textures

- Copier les 3 PNG de refs dans `public/textures/`
- `texture.wrapS = texture.wrapT = RepeatWrapping`
- `texture.repeat.set(3, 3)` — motif répété 3× sur le cube UV 0.27-0.73

### Matériaux

| Node             | Matériau                                          |
|------------------|---------------------------------------------------|
| tmpbv5l_ov_.ply  | `MeshToonMaterial` couleur tissu `#4a3728`        |
| coussin-rouge    | `MeshToonMaterial` map=rouge, gradientMap=toon    |
| coussin-creme    | `MeshToonMaterial` map=creme, gradientMap=toon    |
| coussin-violet   | `MeshToonMaterial` map=violet, gradientMap=toon   |

Tous : `Outlines thickness={0.018} color="black"`.

## Ce qui ne change pas

- Position / rotation du canapé dans SalonRoom.tsx : identique
- `GrandUncle.tsx` : position assise non affectée (geometry identique)
- `Prop.tsx` : non modifié
- `paint_baked_pillows.py`, `paint_pillows_planar.py` : conservés mais hors pipeline actif

## Hors scope

- Motifs animés (broderie interactive)
- LOD coussins
- Variation dynamique des motifs selon état du jeu
