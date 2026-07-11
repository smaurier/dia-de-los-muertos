# Coussins canapé — texture nette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer la peinture d'atlas fragile des coussins par un override de matériau Three.js sur les nodes `coussin-*` de `canape-full.glb`, avec les motifs PNG de référence.

**Architecture:** `Canape.tsx` charge `canape-full.glb`, clone la scène, traverse les meshes par `Object3D.name`, applique un `MeshToonMaterial` différent par node (body = tissu uni, coussins = motif PNG). `SalonRoom.tsx` remplace `<Prop url="canape.glb">` par `<Canape>`.

**Tech Stack:** React Three Fiber, Three.js, `@react-three/drei` (`useGLTF`, `useTexture`, `Outlines`), TypeScript strict.

---

## Fichiers impactés

| Action  | Fichier                                        | Rôle                               |
|---------|------------------------------------------------|------------------------------------|
| Create  | `src/scene/salon/Canape.tsx`                   | Composant canapé avec coussins     |
| Modify  | `src/scene/salon/SalonRoom.tsx:949-954`        | Swap Prop → Canape                 |
| Copy    | `public/textures/coussin-rouge-01.png`         | Motif rouge (broderie)             |
| Copy    | `public/textures/coussin-creme-01.png`         | Motif crème (géométrique)          |
| Copy    | `public/textures/coussin-violet-01.png`        | Motif violet (broderie)            |

---

## Task 1 : Copier les textures motifs dans public/

**Files:**
- Copy: `docs/references/prop/coussins/coussin-rouge-01.png` → `public/textures/coussin-rouge-01.png`
- Copy: `docs/references/prop/coussins/coussin-creme-01.png` → `public/textures/coussin-creme-01.png`
- Copy: `docs/references/prop/coussins/coussin-violet-01.png` → `public/textures/coussin-violet-01.png`

- [ ] **Step 1: Copier les 3 PNGs**

```powershell
Copy-Item docs/references/prop/coussins/coussin-rouge-01.png  public/textures/coussin-rouge-01.png
Copy-Item docs/references/prop/coussins/coussin-creme-01.png  public/textures/coussin-creme-01.png
Copy-Item docs/references/prop/coussins/coussin-violet-01.png public/textures/coussin-violet-01.png
```

- [ ] **Step 2: Vérifier**

```powershell
Get-ChildItem public/textures/coussin-*.png | Select-Object Name, Length
```

Expected : 3 fichiers, taille > 0.

- [ ] **Step 3: Commit**

```bash
git add public/textures/coussin-rouge-01.png public/textures/coussin-creme-01.png public/textures/coussin-violet-01.png
git commit -m "feat: textures motifs coussins copiées dans public/"
```

---

## Task 2 : Créer `Canape.tsx`

**Files:**
- Create: `src/scene/salon/Canape.tsx`

Logique : identique à `Prop.tsx` pour le clone + auto-scale (`targetLength`), mais avec un `traverse` sélectif par `Object3D.name`.

- [ ] **Step 1: Créer le fichier**

```tsx
// src/scene/salon/Canape.tsx
import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF, useTexture } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'

const MODEL_URL = '/models/props/canape-full.glb'

const BODY_COLOR = '#4a3728'

export function Canape({
  position,
  rotationY = 0,
  targetLength,
}: {
  position: [number, number, number]
  rotationY?: number
  targetLength?: number
}) {
  const { scene } = useGLTF(MODEL_URL)
  const object = useMemo(() => scene.clone(true), [scene])

  const [texRouge, texCreme, texViolet] = useTexture([
    '/textures/coussin-rouge-01.png',
    '/textures/coussin-creme-01.png',
    '/textures/coussin-violet-01.png',
  ])

  // RepeatWrapping : motif tile sur toutes les faces (UV [0.27–0.73])
  useEffect(() => {
    for (const tex of [texRouge, texCreme, texViolet]) {
      tex.wrapS = THREE.RepeatWrapping
      tex.wrapT = THREE.RepeatWrapping
      tex.repeat.set(3, 3)
      tex.needsUpdate = true
    }
  }, [texRouge, texCreme, texViolet])

  const { scale, yOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(object)
    const size = new THREE.Vector3()
    box.getSize(size)
    const s = targetLength
      ? targetLength / Math.max(size.x, size.z)
      : 1
    return { scale: s, yOffset: -box.min.y * s }
  }, [object, targetLength])

  useEffect(() => {
    object.traverse(o => {
      if (!(o as THREE.Mesh).isMesh) return
      const mesh = o as THREE.Mesh
      if (!mesh.geometry.hasAttribute('normal')) {
        mesh.geometry.computeVertexNormals()
      }
      const name = o.name
      let mat: THREE.MeshToonMaterial
      if (name === 'coussin-rouge') {
        mat = new THREE.MeshToonMaterial({ map: texRouge, gradientMap: toonGradient })
      } else if (name === 'coussin-creme') {
        mat = new THREE.MeshToonMaterial({ map: texCreme, gradientMap: toonGradient })
      } else if (name === 'coussin-violet') {
        mat = new THREE.MeshToonMaterial({ map: texViolet, gradientMap: toonGradient })
      } else {
        // body canapé : conserve la texture Hunyuan si présente, sinon tissu uni
        const old = mesh.material as THREE.MeshStandardMaterial
        mat = new THREE.MeshToonMaterial(
          old?.map
            ? { map: old.map, gradientMap: toonGradient }
            : { color: BODY_COLOR, gradientMap: toonGradient },
        )
      }
      mesh.material = mat
    })
  }, [object, texRouge, texCreme, texViolet])

  return (
    <primitive
      object={object}
      position={[position[0], position[1] + yOffset, position[2]]}
      rotation={[0, rotationY, 0]}
      scale={scale}
    />
  )
}

useGLTF.preload(MODEL_URL)
```

- [ ] **Step 2: Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Expected : 0 erreur.

---

## Task 3 : Brancher `Canape` dans `SalonRoom.tsx`

**Files:**
- Modify: `src/scene/salon/SalonRoom.tsx`

- [ ] **Step 1: Ajouter l'import**

Ouvrir `src/scene/salon/SalonRoom.tsx`. Après la ligne `import { Prop } from '../shared/Prop'`, ajouter :

```tsx
import { Canape } from './Canape'
```

- [ ] **Step 2: Remplacer le `<Prop>` canapé**

Chercher le bloc (lignes ~942-954) :

```tsx
      {/* ─── Canapé d'angle — model texturé (pipeline Hunyuan, ref
          angle-canape-ref-01) : segment principal face à l'ouest, retour le
          long du mur sud, coussins brodés inclus. Longueur bakée au runtime
          par targetLength (cote exacte 2,9 m sur le grand axe). ────────────── */}
      {/* Coussins : motifs HD de Sylvain PEINTS dans l'atlas sur les zones UV
          des coussins bakés (paint_baked_pillows.py) — le relief existait
          déjà dans la géométrie Hunyuan, zéro prop à positionner. */}
      <Prop
        url="/models/props/canape.glb"
        position={[-3.15, 0, -3.9]}
        rotationY={-Math.PI / 2}
        targetLength={3.6}
      />
```

Remplacer par :

```tsx
      {/* ─── Canapé d'angle — canape-full.glb (body + coussins séparés).
          Coussins : MeshToonMaterial + motif PNG (RepeatWrapping), override
          par Object3D.name dans Canape.tsx. ────────────────────────────────── */}
      <Canape
        position={[-3.15, 0, -3.9]}
        rotationY={-Math.PI / 2}
        targetLength={3.6}
      />
```

- [ ] **Step 3: Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Expected : 0 erreur.

- [ ] **Step 4: Lancer le dev server et valider visuellement**

```bash
npm run dev
```

Ouvrir le navigateur. Vérifier :
1. Canapé visible à sa position habituelle
2. 3 coussins avec motifs distincts (rouge/crème/violet), texture nette et qui couvre tout le volume
3. Pas d'écran noir, pas d'erreur console

- [ ] **Step 5: Commit**

```bash
git add src/scene/salon/Canape.tsx src/scene/salon/SalonRoom.tsx
git commit -m "feat: coussins canapé — texture nette via MeshToonMaterial override (canape-full.glb)"
```

---

## Ajustement optionnel : repeat du motif

Si le motif apparaît trop petit ou trop grand, ajuster `tex.repeat.set(3, 3)` dans `Canape.tsx` :
- Valeur plus petite (ex. `1, 1`) = motif plus grand, moins répété
- Valeur plus grande (ex. `5, 5`) = motif plus petit, plus répété

Aucun rebuild requis — hot reload suffit.
