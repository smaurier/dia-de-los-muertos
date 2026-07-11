// src/scene/shared/Prop.tsx
// Prop 3D issu du pipeline image-to-3D.
// - shape-only : couleur toon unie (color)
// - texturé : la baseColor du GLB est conservée (map + gradientMap)
// Auto-échelle sur targetHeight (hauteur) OU targetLength (plus grand axe
// horizontal — la cote critique des meubles longs), pied posé à y=position[1].
import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { toonGradient } from './toonGradient'

interface PropProps {
  url: string
  color?: string
  position: [number, number, number]
  rotationY?: number
  targetHeight?: number
  targetLength?: number
}

export function Prop({ url, color = '#888888', position, rotationY = 0, targetHeight, targetLength }: PropProps) {
  const { scene } = useGLTF(url)
  const object = useMemo(() => scene.clone(true), [scene])

  const { scale, yOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(object)
    const size = new THREE.Vector3()
    box.getSize(size)
    const s = targetLength
      ? targetLength / Math.max(size.x, size.z)
      : (targetHeight ?? 1) / size.y
    return { scale: s, yOffset: -box.min.y * s }
  }, [object, targetHeight, targetLength])

  useEffect(() => {
    object.traverse(o => {
      if ((o as THREE.Mesh).isMesh) {
        const mesh = o as THREE.Mesh
        // Les GLB du pipeline image-to-3D arrivent parfois sans attribut
        // normal : l'éclairage toon produit alors des NaN que le Bloom du
        // composer étale sur toute la frame (écran noir).
        if (!mesh.geometry.hasAttribute('normal')) {
          mesh.geometry.computeVertexNormals()
        }
        const old = mesh.material as THREE.MeshStandardMaterial
        mesh.material = new THREE.MeshToonMaterial(
          old?.map
            ? { map: old.map, gradientMap: toonGradient }
            : { color, gradientMap: toonGradient },
        )
      }
    })
  }, [object, color])

  return (
    <primitive
      object={object}
      position={[position[0], position[1] + yOffset, position[2]]}
      rotation={[0, rotationY, 0]}
      scale={scale}
    />
  )
}
