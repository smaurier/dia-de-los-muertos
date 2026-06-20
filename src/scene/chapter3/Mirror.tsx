// src/scene/chapter3/Mirror.tsx
// Core mechanic: player has reflection, adult does not.
// Uses onBeforeRender/onAfterRender to hide adult during reflection pass.
import { useRef, useEffect } from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface MirrorProps {
  adultRef: React.RefObject<THREE.Object3D | null>
}

export function Mirror({ adultRef }: MirrorProps) {
  const mirrorMeshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    const mesh = mirrorMeshRef.current
    if (!mesh) return

    mesh.onBeforeRender = () => {
      if (adultRef.current) adultRef.current.visible = false
    }

    mesh.onAfterRender = () => {
      if (adultRef.current) adultRef.current.visible = true
    }

    return () => {
      mesh.onBeforeRender = () => {}
      mesh.onAfterRender = () => {}
    }
  }, [adultRef])

  return (
    <mesh ref={mirrorMeshRef} position={[0, 1.25, -1]}>
      <planeGeometry args={[0.8, 1.4]} />
      <MeshReflectorMaterial
        blur={[0, 0]}
        resolution={512}
        mixBlur={0}
        mixStrength={1}
        roughness={0.05}
        depthScale={0}
        minDepthThreshold={0.9}
        maxDepthThreshold={1}
        color="#aaaaaa"
        metalness={0.9}
        mirror={1}
      />
    </mesh>
  )
}
