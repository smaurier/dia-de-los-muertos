// src/scene/rooms/kitchen/KitchenTable.tsx
// Kitchen table at the room center, with its two chairs.
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import { boisSombre } from '../../shared/paintedTextures'
import { Prop } from '../../shared/Prop'
import {
  C_WOOD_DARK,
  C_CERAMIC,
  C_CANDLE,
  C_FLAME,
} from './kitchenConstants'

export function KitchenTable() {
  return (
    <>
      {/* ── Kitchen table at the room center (ref entree-01/02) ── */}
      <group position={[-3.8, 0, 8.9]}>
        <mesh position={[0, 0.76, 0]}>
          <boxGeometry args={[1.20, 0.055, 0.80]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0, 0.79, 0]}>
          <boxGeometry args={[1.08, 0.010, 0.70]} />
          <meshToonMaterial color="#F0E8D8" gradientMap={toonGradient} />
        </mesh>
        {([-0.50, 0.50] as number[]).flatMap(lx =>
          ([-0.30, 0.30] as number[]).map((lz, j) => (
            <mesh key={`${lx}${j}`} position={[lx, 0.37, lz]}>
              <cylinderGeometry args={[0.036, 0.042, 0.74, 7]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
              <Outlines thickness={0.012} color="black" />
            </mesh>
          ))
        )}
        {/* Terracotta olla + cempasúchil */}
        <group position={[-0.20, 0.79, 0.05]}>
          <mesh position={[0, 0.095, 0]}>
            <cylinderGeometry args={[0.088, 0.068, 0.19, 10]} />
            <meshToonMaterial color="#C07040" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          {([[0, 0.24, 0], [-0.06, 0.22, 0.04], [0.07, 0.21, -0.03]] as [number, number, number][]).map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.036, 7, 7]} />
              <meshToonMaterial color="#E8821E" gradientMap={toonGradient} />
              <Outlines thickness={0.007} color="black" />
            </mesh>
          ))}
        </group>
        {/* Table candle */}
        <group position={[0.28, 0.79, -0.12]}>
          <mesh position={[0, 0.062, 0]}>
            <cylinderGeometry args={[0.022, 0.025, 0.124, 7]} />
            <meshToonMaterial color={C_CANDLE} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 0.148, 0]}>
            <coneGeometry args={[0.022, 0.058, 6]} />
            <meshToonMaterial color={C_FLAME} gradientMap={toonGradient} emissive="#FF4400" emissiveIntensity={1.5} />
          </mesh>
          <pointLight position={[0, 0.18, 0]} intensity={0.55} color="#FF8833" distance={1.6} decay={2} />
        </group>
        {/* Ceramic cup */}
        <mesh position={[0.22, 0.80, 0.18]}>
          <cylinderGeometry args={[0.055, 0.045, 0.068, 9]} />
          <meshToonMaterial color={C_CERAMIC} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
        {/* Bread / tortillas */}
        <mesh position={[0.05, 0.80, -0.22]} scale={[1.6, 0.7, 1.0]}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshToonMaterial color="#D9B98A" gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      </group>

      {/* ── Kitchen chairs: one to the south facing the table, one to the west (ref) ── */}
      <Prop
        url="/models/props/chaise.glb?v=3"
        color={C_WOOD_DARK}
        position={[-3.6, 0, 8.05]}
        rotationY={0}
        targetHeight={0.95}
      />
      <Prop
        url="/models/props/chaise.glb?v=3"
        color={C_WOOD_DARK}
        position={[-4.85, 0, 8.9]}
        rotationY={Math.PI / 2}
        targetHeight={0.95}
      />
    </>
  )
}
