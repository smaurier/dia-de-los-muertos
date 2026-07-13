// src/scene/shared/PorteBleue.tsx
// Porte bleue mexicaine décorative (non ouvrable) — plaquée contre un mur.
// Local : panneau dans le plan XY, détails vers +z. rotationY π/2 → détails vers +x.
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'

const C_IRON = '#1A1512'

export function PorteBleue({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 1.10, 0]}>
        <boxGeometry args={[0.96, 2.20, 0.08]} />
        <meshToonMaterial color="#2A5A1A" gradientMap={toonGradient} />
        <Outlines thickness={0.020} color="black" />
      </mesh>
      <mesh position={[0, 1.10, 0.01]}>
        <boxGeometry args={[0.84, 2.06, 0.06]} />
        <meshToonMaterial color="#1E4080" gradientMap={toonGradient} />
        <Outlines thickness={0.018} color="black" />
      </mesh>
      <mesh position={[0, 1.54, 0.04]}>
        <boxGeometry args={[0.72, 0.62, 0.04]} />
        <meshToonMaterial color="#2050A0" gradientMap={toonGradient} />
      </mesh>
      <mesh position={[0, 0.64, 0.04]}>
        <boxGeometry args={[0.72, 0.88, 0.04]} />
        <meshToonMaterial color="#2050A0" gradientMap={toonGradient} />
      </mesh>
      <mesh position={[0.31, 1.10, 0.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.18, 8]} />
        <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        <Outlines thickness={0.008} color="black" />
      </mesh>
    </group>
  )
}
