# Cel-Shading Chapitre 3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Appliquer un rendu cel-shading (MeshToonMaterial + contours noirs) à la scène Chapitre 3 sans toucher à la logique de jeu ni au miroir.

**Architecture:** Texture GradientMap partagée (3 bandes) exportée depuis un module singleton. Corridor et Adult passent en `MeshToonMaterial`. Chapter3 orchestre un `EffectComposer` + `Outline` qui sélectionne le group Corridor et le group Adult via refs.

**Tech Stack:** `@react-three/postprocessing`, `postprocessing`, Three.js `DataTexture`, `MeshToonMaterial`, `forwardRef`

---

## File Map

| Action | Fichier | Rôle |
|--------|---------|------|
| Create | `src/scene/chapter3/toonGradient.ts` | DataTexture singleton — 3 bandes de luminosité |
| Modify | `src/scene/chapter3/Corridor.tsx` | MeshToonMaterial + DirectionalLight + forwardRef group |
| Modify | `src/scene/chapter3/Adult.tsx` | MeshToonMaterial |
| Modify | `src/scene/chapter3/Chapter3.tsx` | EffectComposer + Outline, collecte refs |
| — | `src/scene/chapter3/Mirror.tsx` | **Inchangé** |
| — | `src/App.tsx` | **Inchangé** |
| — | `src/game/` | **Inchangé** — aucun test à modifier |

---

## Task 1 : Installer les dépendances

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Installer les packages**

```bash
npm install @react-three/postprocessing postprocessing
```

Sortie attendue : packages ajoutés sans erreur de peer deps.

- [ ] **Vérifier les types disponibles**

```bash
npx tsc --noEmit
```

Sortie attendue : 0 erreur (les packages incluent leurs types).

- [ ] **Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @react-three/postprocessing for cel-shading"
```

---

## Task 2 : Créer le GradientMap partagé

**Files:**
- Create: `src/scene/chapter3/toonGradient.ts`

- [ ] **Créer le fichier**

```ts
// src/scene/chapter3/toonGradient.ts
import * as THREE from 'three'

const colors = new Uint8Array([40, 128, 255])
export const toonGradient = new THREE.DataTexture(colors, 3, 1, THREE.RedFormat)
toonGradient.magFilter = THREE.NearestFilter
toonGradient.needsUpdate = true
```

> `RedFormat` = canal unique (luminance). `NearestFilter` = bandes nettes sans interpolation. Module ES = singleton : texture créée une seule fois.

- [ ] **Vérifier les types**

```bash
npx tsc --noEmit
```

Sortie attendue : 0 erreur.

- [ ] **Commit**

```bash
git add src/scene/chapter3/toonGradient.ts
git commit -m "feat: toon gradient map — 3-band DataTexture singleton"
```

---

## Task 3 : Mettre à jour Corridor.tsx

**Files:**
- Modify: `src/scene/chapter3/Corridor.tsx`

- [ ] **Remplacer le contenu complet du fichier**

```tsx
// src/scene/chapter3/Corridor.tsx
import { forwardRef } from 'react'
import * as THREE from 'three'
import { toonGradient } from './toonGradient'

export const Corridor = forwardRef<THREE.Group>(function Corridor(_, ref) {
  return (
    <group ref={ref}>
      <ambientLight intensity={0.15} color="#f5c87a" />
      <pointLight position={[0, 2.2, 0]} intensity={1.5} color="#f0d89a" distance={6} decay={2} />
      <directionalLight intensity={0.8} color="#f5c87a" position={[0, 3, 2]} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[2, 8]} />
        <meshToonMaterial color="#5c3d2e" gradientMap={toonGradient} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.5, 0]}>
        <planeGeometry args={[2, 8]} />
        <meshToonMaterial color="#2a1f1a" gradientMap={toonGradient} />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-1, 1.25, 0]}>
        <planeGeometry args={[8, 2.5]} />
        <meshToonMaterial color="#3d2b1f" gradientMap={toonGradient} />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[1, 1.25, 0]}>
        <planeGeometry args={[8, 2.5]} />
        <meshToonMaterial color="#3d2b1f" gradientMap={toonGradient} />
      </mesh>

      {/* End wall */}
      <mesh position={[0, 1.25, -4]}>
        <planeGeometry args={[2, 2.5]} />
        <meshToonMaterial color="#2e1e15" gradientMap={toonGradient} />
      </mesh>

      {/* Start wall */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 1.25, 4]}>
        <planeGeometry args={[2, 2.5]} />
        <meshToonMaterial color="#2e1e15" gradientMap={toonGradient} />
      </mesh>
    </group>
  )
})
```

> `forwardRef<THREE.Group>` expose le group racine pour que Chapter3 puisse le passer à `Outline`. `directionalLight` est requis : `MeshToonMaterial` calcule les bandes uniquement sur la lumière directionnelle.

- [ ] **Vérifier les types**

```bash
npx tsc --noEmit
```

Sortie attendue : 0 erreur.

- [ ] **Commit**

```bash
git add src/scene/chapter3/Corridor.tsx
git commit -m "feat: corridor — MeshToonMaterial + directional light + forwardRef"
```

---

## Task 4 : Mettre à jour Adult.tsx

**Files:**
- Modify: `src/scene/chapter3/Adult.tsx`

- [ ] **Ajouter l'import et remplacer les matériaux**

Remplacer les deux `meshStandardMaterial` par `meshToonMaterial`. Seules les lignes de matériaux changent — le reste du fichier (logique de marche, refs, props) reste identique.

```tsx
// src/scene/chapter3/Adult.tsx
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { toonGradient } from './toonGradient'

interface AdultProps {
  onNearPlayer: (near: boolean) => void
  meshRef: React.RefObject<THREE.Group | null>
}

const WALK_SPEED = 0.8
const PATH_Z = [3, 0, -3]

export function Adult({ onNearPlayer, meshRef }: AdultProps) {
  const phase = useRef<'waiting' | 'walking' | 'done'>('waiting')
  const phaseIndex = useRef(0)

  useEffect(() => {
    const t = setTimeout(() => {
      phase.current = 'walking'
    }, 2000)
    return () => clearTimeout(t)
  }, [])

  useFrame((_, delta) => {
    const group = meshRef.current
    if (!group || phase.current !== 'walking') return

    const target = PATH_Z[phaseIndex.current + 1]
    if (target === undefined) {
      phase.current = 'done'
      group.visible = false
      return
    }

    const direction = target - group.position.z
    const step = Math.sign(direction) * WALK_SPEED * delta
    group.position.z += step

    if (Math.abs(group.position.z - target) < 0.05) {
      group.position.z = target
      phaseIndex.current += 1
    }

    onNearPlayer(Math.abs(group.position.z) < 2)
  })

  return (
    <group ref={meshRef} position={[0.3, 0, 3]}>
      {/* Body */}
      <mesh position={[0, 0.875, 0]}>
        <capsuleGeometry args={[0.25, 1.25, 4, 8]} />
        <meshToonMaterial color="#2a1a0e" gradientMap={toonGradient} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshToonMaterial color="#c8956c" gradientMap={toonGradient} />
      </mesh>
    </group>
  )
}
```

- [ ] **Vérifier les types**

```bash
npx tsc --noEmit
```

Sortie attendue : 0 erreur.

- [ ] **Commit**

```bash
git add src/scene/chapter3/Adult.tsx
git commit -m "feat: adult — MeshToonMaterial"
```

---

## Task 5 : Mettre à jour Chapter3.tsx — EffectComposer + Outline

**Files:**
- Modify: `src/scene/chapter3/Chapter3.tsx`

- [ ] **Remplacer le contenu complet du fichier**

```tsx
// src/scene/chapter3/Chapter3.tsx
import { useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { EffectComposer, Outline } from '@react-three/postprocessing'
import { Corridor } from './Corridor'
import { Mirror } from './Mirror'
import { Adult } from './Adult'
import { useAudioLayers } from '../../hooks/useAudioLayers'

export function Chapter3() {
  const adultRef = useRef<THREE.Group>(null)
  const corridorRef = useRef<THREE.Group>(null)
  const [adultIsNear, setAdultIsNear] = useState(false)

  useAudioLayers({ adultIsNear })

  const handleNearPlayer = useCallback((near: boolean) => {
    setAdultIsNear(near)
  }, [])

  return (
    <>
      <group>
        <Corridor ref={corridorRef} />
        <Mirror adultRef={adultRef} />
        <Adult onNearPlayer={handleNearPlayer} meshRef={adultRef} />
      </group>
      <EffectComposer>
        <Outline
          selection={[corridorRef, adultRef]}
          edgeStrength={3}
          pulseSpeed={0}
          visibleEdgeColor={0x000000}
          hiddenEdgeColor={0x000000}
          blur={false}
        />
      </EffectComposer>
    </>
  )
}
```

> `EffectComposer` est dans Canvas via App.tsx → position correcte. `Mirror` exclu de la selection → réflexion intacte. `selection` accepte `RefObject<Object3D>[]` et traverse les enfants.

- [ ] **Vérifier les types**

```bash
npx tsc --noEmit
```

Sortie attendue : 0 erreur.

- [ ] **Lancer le dev server**

```bash
npm run dev
```

- [ ] **Validation manuelle** (voir critères ci-dessous)

- [ ] **Commit final**

```bash
git add src/scene/chapter3/Chapter3.tsx
git commit -m "feat: cel-shading chapter 3 — EffectComposer + Outline on corridor + adult"
```

---

## Critères de validation manuelle

Ouvrir `http://localhost:5173` et vérifier :

- [ ] Bandes d'ombre visibles sur les murs du corridor (3 tons distincts)
- [ ] Contours noirs sur murs du corridor
- [ ] Contours noirs sur l'adulte (body + head)
- [ ] Miroir affiche toujours la réflexion (adulte absent dans le reflet)
- [ ] Adulte marche (attend 2s puis traverse)
- [ ] Touche E / Space : scène se fige (mécanique stillness OK)
- [ ] Pas d'erreur console

---

## Troubleshooting connu

**Outline ne s'affiche pas :** Vérifier que `corridorRef.current` n'est pas `null` au moment du render. Si nécessaire, wrapper dans `useMemo` ou attendre mount.

**Bandes de toon plates (pas de graduation) :** `directionalLight` absent ou intensité trop faible. Augmenter `intensity` à 1.2.

**Conflit MeshReflectorMaterial + EffectComposer :** Si artefact visuel sur le miroir, ajouter `multisampling={0}` à `<EffectComposer>`.
