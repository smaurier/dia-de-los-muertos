// src/scene/rooms/kitchen/KitchenShelf.tsx
// Wall shelf with hanging utensils, plus the old off radio sitting on it.
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import { C_IRON, C_WOOD_DARK } from './kitchenConstants'

export function KitchenShelf() {
  return (
    <>
      {/* ── Wall shelf + hanging utensils (back wall, west of the fogón) ── */}
      <group position={[-4.0, 0, 11.94]}>
        {/* Plank */}
        <mesh position={[0, 1.68, 0]}>
          <boxGeometry args={[1.55, 0.042, 0.22]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        {/* 2 brackets */}
        {[-0.62, 0.62].map(sx => (
          <mesh key={sx} position={[sx, 1.52, 0.04]}>
            <boxGeometry args={[0.040, 0.32, 0.22]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
        ))}
        {/* Ollas on the shelf */}
        <group position={[-0.50, 1.72, 0.04]}>
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.08, 0.065, 0.18, 10]} />
            <meshToonMaterial color="#B87040" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[0, 0.186, 0]}>
            <cylinderGeometry args={[0.048, 0.075, 0.048, 10]} />
            <meshToonMaterial color="#A06030" gradientMap={toonGradient} />
          </mesh>
        </group>
        <group position={[0.08, 1.72, 0.04]}>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.072, 0.065, 0.16, 8]} />
            <meshToonMaterial color="#707880" gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        </group>
        <group position={[0.52, 1.72, 0.04]}>
          <mesh position={[0, 0.065, 0]}>
            <cylinderGeometry args={[0.062, 0.055, 0.13, 8]} />
            <meshToonMaterial color="#606870" gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        </group>
        {/* Utensil rail */}
        <mesh position={[0, 1.54, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.009, 0.009, 1.45, 5]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
        {([-0.52, -0.22, 0.12, 0.46] as number[]).map((ux, ui) => (
          <group key={ui} position={[ux, 1.54, 0.06]}>
            <mesh position={[0, -0.042, 0]}>
              <boxGeometry args={[0.013, 0.082, 0.013]} />
              <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            </mesh>
            <mesh position={[0, ui % 2 === 0 ? -0.225 : -0.185, 0]}>
              <cylinderGeometry args={ui % 2 === 0 ? [0.040, 0.010, 0.28, 8] : [0.012, 0.012, 0.24, 6]} />
              <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
              <Outlines thickness={0.006} color="black" />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── Old radio on the wall shelf, OFF (fiche: silent dialogue
          with the MEMORY layer) ── */}
      <group position={[-4.2, 1.72, 11.98]}>
        <mesh position={[0, 0.075, 0]}>
          <boxGeometry args={[0.24, 0.15, 0.1]} />
          <meshToonMaterial color="#6E4A2A" gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        <mesh position={[-0.045, 0.075, 0.052]}>
          <planeGeometry args={[0.1, 0.09]} />
          <meshToonMaterial color="#3A2E1E" gradientMap={toonGradient} />
        </mesh>
        {[0.05, 0.09].map(dx => (
          <mesh key={dx} position={[dx, 0.06, 0.052]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.014, 8]} />
            <meshToonMaterial color="#C8B888" gradientMap={toonGradient} />
          </mesh>
        ))}
        <mesh position={[0.1, 0.19, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.004, 0.004, 0.14, 4]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
      </group>
    </>
  )
}
