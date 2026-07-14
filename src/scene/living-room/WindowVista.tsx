import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import {
  cielNuitTexture, nuagesTexture, montagnesTexture, collinesVillageTexture,
} from '../shared/vistaTextures'

// Exterior diorama behind the west window: layered planes at real depth
// (18 → 45 m) for genuine parallax as the player moves.
// All meshBasicMaterial fog={false}: the exterior is a self-lit night backdrop;
// the room's brown fog must not swallow it.
// The west wall naturally occludes anything that extends beyond the opening.

const AGAVES: { x: number; z: number; s: number; r: number }[] = [
  { x: -9.2, z: -1.3, s: 1.0, r: 0.4 },
  { x: -11.5, z: 1.8, s: 1.4, r: 2.1 },
  { x: -13.8, z: -0.4, s: 1.1, r: 4.0 },
]

function Agave({ x, z, s, r }: { x: number; z: number; s: number; r: number }) {
  // Rosette of tapered leaves: flattened cones tilted outward from the base.
  const leaves = 7
  return (
    <group position={[x, 0, z]} scale={s} rotation={[0, r, 0]}>
      {Array.from({ length: leaves }, (_, i) => {
        const a = (i / leaves) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.18, 0.28, Math.sin(a) * 0.18]}
            rotation={[Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9]}
          >
            <coneGeometry args={[0.07, 0.85, 5]} />
            <meshBasicMaterial color="#101c22" fog={false} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.55, 0]}>
        <coneGeometry args={[0.05, 0.9, 5]} />
        <meshBasicMaterial color="#131f26" fog={false} />
      </mesh>
    </group>
  )
}

export function WindowVista() {
  const clouds = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((_, delta) => {
    if (clouds.current) clouds.current.map!.offset.x += delta * 0.0025
  })

  return (
    <group>
      {/* Starry sky + moon (background, 45 m) */}
      <mesh position={[-45, 11, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[90, 34]} />
        <meshBasicMaterial map={cielNuitTexture} fog={false} />
      </mesh>

      {/* Thin drifting clouds (38 m) */}
      <mesh position={[-38, 9, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[76, 12]} />
        <meshBasicMaterial ref={clouds} map={nuagesTexture} transparent depthWrite={false} fog={false} />
      </mesh>

      {/* Mountains (32 m) */}
      <mesh position={[-32, 3.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[64, 13]} />
        <meshBasicMaterial map={montagnesTexture} transparent fog={false} />
      </mesh>

      {/* Hills + village with warm windows (18 m) */}
      <mesh position={[-18, 1.7, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[36, 7]} />
        <meshBasicMaterial map={collinesVillageTexture} transparent fog={false} />
      </mesh>

      {/* Exterior ground: dark earth under moonlight */}
      <mesh position={[-26, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 44]} />
        <meshBasicMaterial color="#0b1119" fog={false} />
      </mesh>

      {/* Close agaves: the strongest parallax layer */}
      {AGAVES.map((a, i) => <Agave key={i} {...a} />)}
    </group>
  )
}
