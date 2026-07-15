// src/scene/rooms/kitchen/Stove.tsx
// Fogón: old white wood stove against the back wall (ref cuisine-entree-02).
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import { C_IRON, C_WOOD_MED } from './kitchenConstants'

export function Stove() {
  return (
    <>
      {/* ── Fogón (old white stove, back wall on the right, ref cuisine-entree-02)
          rotation π: oven door facing south (toward the room) ── */}
      <group position={[-2.2, 0, 11.62]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.58, 0.90, 0.62]} />
          <meshToonMaterial color="#E8E4DC" gradientMap={toonGradient} />
          <Outlines thickness={0.018} color="black" />
        </mesh>
        <mesh position={[0, 0.92, 0]}>
          <boxGeometry args={[0.60, 0.04, 0.64]} />
          <meshToonMaterial color="#D0CCC4" gradientMap={toonGradient} />
        </mesh>
        {/* 4 burners */}
        {([-0.13, 0.13] as number[]).flatMap(bx =>
          ([-0.14, 0.14] as number[]).map((bz, j) => (
            <mesh key={`b${bx}${j}`} position={[bx, 0.945, bz]}>
              <cylinderGeometry args={[0.068, 0.068, 0.012, 8]} />
              <meshToonMaterial color="#888880" gradientMap={toonGradient} />
            </mesh>
          ))
        )}
        {/* Oven door */}
        <mesh position={[0, 0.28, 0.32]}>
          <boxGeometry args={[0.46, 0.38, 0.022]} />
          <meshToonMaterial color="#D0CCC4" gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        <mesh position={[0, 0.20, 0.336]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.011, 0.011, 0.30, 6]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
        {/* Dented VAPORERA (tamales — ref entree-02: big aluminium pot),
            steam escaping from the lid */}
        <group position={[0.13, 0.95, -0.13]}>
          <mesh position={[0, 0.19, 0]}>
            <cylinderGeometry args={[0.16, 0.145, 0.38, 12]} />
            <meshToonMaterial color="#B8C0C8" gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
          {/* Domed lid + knob */}
          <mesh position={[0, 0.40, 0]} scale={[1, 0.45, 1]}>
            <sphereGeometry args={[0.165, 12, 8]} />
            <meshToonMaterial color="#A8B0B8" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[0, 0.485, 0]}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <meshToonMaterial color="#1A1512" gradientMap={toonGradient} />
          </mesh>
          {/* Handles */}
          {[-0.17, 0.17].map(dx => (
            <mesh key={dx} position={[dx, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.035, 0.009, 6, 10, Math.PI]} />
              <meshToonMaterial color="#1A1512" gradientMap={toonGradient} />
            </mesh>
          ))}
          {/* Steam */}
          <mesh position={[0.06, 0.52, 0]}>
            <sphereGeometry args={[0.048, 6, 6]} />
            <meshToonMaterial color="#E8E0D0" gradientMap={toonGradient} transparent opacity={0.5} />
          </mesh>
          <mesh position={[0.1, 0.6, 0.02]}>
            <sphereGeometry args={[0.036, 6, 6]} />
            <meshToonMaterial color="#F0E8D8" gradientMap={toonGradient} transparent opacity={0.32} />
          </mesh>
        </group>
        {/* Small saucepan on the side */}
        <group position={[-0.13, 0.95, -0.14]}>
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.09, 0.08, 0.18, 8]} />
            <meshToonMaterial color="#606870" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[0.20, 0.06, 0]} rotation={[0, 0, -0.25]}>
            <cylinderGeometry args={[0.010, 0.010, 0.38, 6]} />
            <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          </mesh>
        </group>
      </group>
    </>
  )
}
