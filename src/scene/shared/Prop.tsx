// src/scene/shared/Prop.tsx
// Prop 3D issu du pipeline image-to-3D (shape-only → couleur toon unie).
// Auto-échelle sur targetHeight, pied posé à y=position[1].
import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { toonGradient } from './toonGradient'

interface PropProps {
  url: string
  color: string
  position: [number, number, number]
  rotationY?: number
  targetHeight: number
}

export function Prop({ url, color, position, rotationY = 0, targetHeight }: PropProps) {
  const { scene } = useGLTF(url)
  const object = useMemo(() => scene.clone(true), [scene])

  const { scale, yOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(object)
    const size = new THREE.Vector3()
    box.getSize(size)
    const s = targetHeight / size.y
    return { scale: s, yOffset: -box.min.y * s }
  }, [object, targetHeight])

  useEffect(() => {
    object.traverse(o => {
      if ((o as THREE.Mesh).isMesh) {
        const mesh = o as THREE.Mesh
        mesh.material = new THREE.MeshToonMaterial({ color, gradientMap: toonGradient })
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
