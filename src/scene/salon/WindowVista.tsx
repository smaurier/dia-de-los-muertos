import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import {
  cielNuitTexture, nuagesTexture, montagnesTexture, collinesVillageTexture,
} from '../shared/vistaTextures'

// Diorama extérieur derrière la fenêtre ouest : couches étagées en profondeur
// réelle (18 → 45 m) pour une vraie parallaxe quand le joueur se déplace.
// Tout est en meshBasicMaterial fog={false} : l'extérieur est un décor
// auto-lumineux nocturne, le fog brun de la pièce ne doit pas l'avaler.
// Le mur ouest occulte naturellement tout ce qui déborde de l'ouverture.

const AGAVES: { x: number; z: number; s: number; r: number }[] = [
  { x: -9.2, z: -1.3, s: 1.0, r: 0.4 },
  { x: -11.5, z: 1.8, s: 1.4, r: 2.1 },
  { x: -13.8, z: -0.4, s: 1.1, r: 4.0 },
]

function Agave({ x, z, s, r }: { x: number; z: number; s: number; r: number }) {
  // Rosette de feuilles effilées : cônes aplatis inclinés autour du pied.
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
      {/* Ciel étoilé + lune (fond, 45 m) */}
      <mesh position={[-45, 11, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[90, 34]} />
        <meshBasicMaterial map={cielNuitTexture} fog={false} />
      </mesh>

      {/* Nuages fins dérivants (38 m) */}
      <mesh position={[-38, 9, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[76, 12]} />
        <meshBasicMaterial ref={clouds} map={nuagesTexture} transparent depthWrite={false} fog={false} />
      </mesh>

      {/* Montagnes (32 m) */}
      <mesh position={[-32, 3.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[64, 13]} />
        <meshBasicMaterial map={montagnesTexture} transparent fog={false} />
      </mesh>

      {/* Collines + village aux fenêtres chaudes (18 m) */}
      <mesh position={[-18, 1.7, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[36, 7]} />
        <meshBasicMaterial map={collinesVillageTexture} transparent fog={false} />
      </mesh>

      {/* Sol extérieur : terre sombre sous clair de lune */}
      <mesh position={[-26, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 44]} />
        <meshBasicMaterial color="#0b1119" fog={false} />
      </mesh>

      {/* Agaves proches : la couche de parallaxe la plus forte */}
      {AGAVES.map((a, i) => <Agave key={i} {...a} />)}
    </group>
  )
}
