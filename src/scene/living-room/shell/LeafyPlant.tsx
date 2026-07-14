// src/scene/living-room/shell/LeafyPlant.tsx
// Leafy potted plant: ceramic pot + foliage spheres (toon shading).
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import { C_LEAF, C_POT } from './livingRoomConstants'

export function LeafyPlant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.20, 0]}>
        <cylinderGeometry args={[0.20, 0.15, 0.40, 9]} />
        <meshToonMaterial color={C_POT} gradientMap={toonGradient} />
        <Outlines thickness={0.018} color="black" />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.22, 0.20, 0.04, 9]} />
        <meshToonMaterial color="#B06830" gradientMap={toonGradient} />
      </mesh>
      {([[0, 0.85, 0, 0.26], [-0.18, 0.72, 0.08, 0.18], [0.16, 0.70, -0.10, 0.17], [0.02, 0.68, 0.17, 0.15]] as [number, number, number, number][]).map(([px, py, pz, r], i) => (
        <mesh key={i} position={[px, py, pz]} scale={[1, 1.25, 1]}>
          <sphereGeometry args={[r, 9, 9]} />
          <meshToonMaterial color={C_LEAF} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
      ))}
    </group>
  )
}
