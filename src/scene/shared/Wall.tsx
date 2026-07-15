// src/scene/shared/Wall.tsx
// A flat toon-shaded textured plane — the house's wall primitive.
// Replaces the repeated <mesh><planeGeometry/><meshToonMaterial map gradientMap/></mesh>.
// Default map is the adobe side texture (the dominant wall); override for
// lintels, north face, stone, azulejos, etc.
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from './toonGradient'
import { murAdobeSide } from './paintedTextures'

type WallProps = {
  position: [number, number, number]
  size: [number, number]
  rotation?: [number, number, number]
  map?: THREE.Texture
  side?: THREE.Side
  outline?: number
}

export function Wall({ position, size, rotation, map = murAdobeSide, side, outline }: WallProps) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshToonMaterial map={map} gradientMap={toonGradient} side={side} />
      {outline !== undefined && <Outlines thickness={outline} color="black" />}
    </mesh>
  )
}
