// src/scene/rooms/kitchen/KitchenAltar.tsx
// Kitchen ofrenda against the west wall, plus the stone-corner dresser with its cempasúchil petal bowl.
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import { boisSombre } from '../../shared/paintedTextures'
import { PhotoFrame } from '../../shared/PhotoFrame'
import {
  C_WOOD_DARK,
  C_WOOD_MED,
  C_CERAMIC,
  C_CANDLE,
  C_FLAME,
} from './kitchenConstants'

export function KitchenAltar() {
  return (
    <>
      {/* ── Kitchen ofrenda — against the west wall (ref coin-pierres-02) ── */}
      <group position={[-6.72, 0, 7.6]}>
        <mesh position={[0, 0.44, 0]}>
          <boxGeometry args={[0.50, 0.88, 0.34]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        <mesh position={[0, 0.90, 0]}>
          <boxGeometry args={[0.54, 0.030, 0.38]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
        </mesh>
        {/* Cempasúchil bouquet */}
        <group position={[-0.08, 0.93, 0.05]}>
          <mesh position={[0, 0.095, 0]}>
            <cylinderGeometry args={[0.052, 0.062, 0.19, 9]} />
            <meshToonMaterial color={C_CERAMIC} gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          {([[0, 0.28, 0], [-0.07, 0.26, 0.04], [0.06, 0.25, -0.04], [0.03, 0.23, 0.07]] as [number, number, number][]).map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.042, 7, 7]} />
              <meshToonMaterial color="#E8821E" gradientMap={toonGradient} />
              <Outlines thickness={0.008} color="black" />
            </mesh>
          ))}
        </group>
        {/* Ofrenda candle */}
        <group position={[0.12, 0.93, -0.06]}>
          <mesh position={[0, 0.068, 0]}>
            <cylinderGeometry args={[0.023, 0.027, 0.136, 7]} />
            <meshToonMaterial color={C_CANDLE} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 0.155, 0]}>
            <coneGeometry args={[0.023, 0.062, 6]} />
            <meshToonMaterial color={C_FLAME} gradientMap={toonGradient} emissive="#FF4400" emissiveIntensity={1.5} />
          </mesh>
          <pointLight position={[0, 0.18, 0]} intensity={0.65} color="#FF8833" distance={1.4} decay={2} />
        </group>
        {/* Decorative calavera */}
        <mesh position={[0, 1.04, 0.10]}>
          <sphereGeometry args={[0.072, 10, 10]} />
          <meshToonMaterial color="#F5F0E8" gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {[-0.032, 0.032].map(dx => (
          <mesh key={dx} position={[dx, 1.074, 0.172]}>
            <circleGeometry args={[0.018, 8]} />
            <meshToonMaterial color="#1A1010" gradientMap={toonGradient} />
          </mesh>
        ))}
        <PhotoFrame position={[-0.22, 1.78, 0]} rotY={Math.PI / 2} />
      </group>

      {/* ── Stone-corner dresser: cempasúchil petal bowl (fiche:
          seeds the petal trail) + molcajete ── */}
      <group position={[-1.25, 0, 11.45]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.7, 0.06, 0.44]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {([-0.3, 0.3] as number[]).flatMap(dx =>
          ([-0.17, 0.17] as number[]).map((dz, j) => (
            <mesh key={`${dx}-${j}`} position={[dx, 0.19, dz]}>
              <cylinderGeometry args={[0.022, 0.026, 0.38, 6]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            </mesh>
          ))
        )}
        {/* Petal bowl */}
        <group position={[-0.15, 0.43, 0]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.13, 0.09, 0.1, 10]} />
            <meshToonMaterial color="#C07040" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.115, 0.115, 0.02, 10]} />
            <meshToonMaterial color="#E8940A" gradientMap={toonGradient} />
          </mesh>
          {([[0.16, 0.02], [0.2, -0.06], [-0.19, 0.05]] as [number, number][]).map(([dx, dz], i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, i * 1.1]} position={[dx, -0.415, dz]}>
              <circleGeometry args={[0.035, 6]} />
              <meshToonMaterial color="#E8940A" gradientMap={toonGradient} />
            </mesh>
          ))}
        </group>
        {/* Molcajete */}
        <group position={[0.18, 0.43, 0.02]}>
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.085, 9, 7, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshToonMaterial color="#4A4642" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[0.05, 0.11, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.02, 0.028, 0.09, 7]} />
            <meshToonMaterial color="#4A4642" gradientMap={toonGradient} />
          </mesh>
        </group>
      </group>
    </>
  )
}
