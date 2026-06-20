# Spec : Cel-Shading Chapitre 3

**Date :** 2026-06-20  
**Scope :** Couche visuelle uniquement — logique de jeu et tests inchangés

---

## Objectif

Appliquer un rendu cel-shading (dessin animé) à la scène du Chapitre 3.  
Référence visuelle : `docs/references/assets/cel-shading-ref-01.png`  
Style cible : couleurs plates par bandes, contours noirs nets, palette chaude/sombre (ambiance Día de Muertos).

---

## Périmètre

| Composant | Traitement |
|-----------|------------|
| `Corridor.tsx` | MeshToonMaterial + GradientMap 3 bandes + outlines |
| `Adult.tsx` | MeshToonMaterial + outlines |
| `Mirror.tsx` | **Inchangé** — MeshReflectorMaterial conservé (miroirs sont des miroirs) |
| `Chapter3.tsx` | Ajout EffectComposer + Outline, orchestration des refs |
| `App.tsx` | Inchangé |

---

## Dépendance nouvelle

```
@react-three/postprocessing  # wraps postprocessing.js pour R3F
postprocessing               # peer dep
```

---

## Architecture

### 1. GradientMap partagé

Créer `src/scene/chapter3/toonGradient.ts` — exporte une `DataTexture` THREE.js à 3 niveaux de luminosité (0.2 / 0.5 / 1.0). Partagée par tous les matériaux toon de la scène.

### 2. Corridor.tsx

- Remplacer tous `meshStandardMaterial` → `MeshToonMaterial` avec `gradientMap`
- Palette : conserver les couleurs existantes (bruns chauds, noirs)
- Remplacer `ambientLight` seul → garder ambientLight + ajouter `DirectionalLight` (MeshToonMaterial exige une lumière directionnelle pour les bandes)
- Wrapper le `<group>` racine dans un `forwardRef` — Outline traverse les enfants automatiquement, pas besoin de ref par mesh

### 3. Adult.tsx

- Body + head : `meshStandardMaterial` → `MeshToonMaterial` avec `gradientMap`
- Le `meshRef` (group) existant suffit pour l'Outline — pas de changement d'interface

### 4. Chapter3.tsx

- Collecter refs : corridor meshes (via ref forwarded) + adult group
- Wrapper `EffectComposer` + `Outline` autour de la scène :

```tsx
<EffectComposer>
  <Outline
    selection={outlineTargets}
    edgeStrength={3}
    pulseSpeed={0}
    visibleEdgeColor={0x000000}
    hiddenEdgeColor={0x000000}
    blur={false}
  />
</EffectComposer>
```

---

## Éclairage ajusté

```
ambientLight  intensity=0.15  color="#f5c87a"   (inchangé)
pointLight    intensity=1.5   color="#f0d89a"   (inchangé)
DirectionalLight intensity=0.8 color="#f5c87a" position=[0,3,2]  ← nouveau
```

`MeshToonMaterial` calcule les bandes à partir de la lumière directionnelle. Sans elle, tout serait plat (couleur ambiante uniforme).

---

## Ce qui ne change pas

- Logique `useStillness`, `useSong`, stores Zustand : **inchangés**
- Tests Vitest : **inchangés** (couche logique pure, aucun WebGL)
- `Mirror.tsx` : **inchangé**
- `Player.tsx` : **inchangé** (hors scope)

---

## Critères de validation (manuel)

- [ ] Bandes d'ombre visibles sur les murs du corridor
- [ ] Contours noirs sur murs + adulte
- [ ] Miroir affiche toujours la réflexion (adulte absent)
- [ ] Adulte marche avec toon shading
- [ ] Pas de régression sur la mécanique de quiétude (E/Space)
- [ ] Pas d'erreur TypeScript (`npx tsc --noEmit`)
