// src/scene/living-room/shell/DiningArea.tsx
// Central dining area: table top + apron + legs, set table (plates via PLATE_X/PLATE_Z,
// tablecloth via <Tablecloth>), 20 chairs (chaise.glb via <Prop>), and table candles.
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import { boisSombre } from '../../shared/paintedTextures'
import { Tablecloth } from '../Tablecloth'
import { Prop } from '../../shared/Prop'
import {
  C_WOOD_DARK,
  CHAIRS,
  TABLE_LEG_X, TABLE_LEG_Z,
  PLATE_X, PLATE_Z,
} from './livingRoomConstants'

export function DiningArea() {
  return (
    <>
      {/* ─── Table centrale ─────────────────────────────────────────────────── */}
      {/* Narrowed top (2.3 → 2.1): more realistic banquet proportions without
          touching chairs/NPCs/AABB (all calibrated on z=±1.5/1.6). */}
      <mesh position={[-0.05, 0.76, 1.0]}>
        <boxGeometry args={[8.5, 0.08, 2.1]} />
        <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
        <Outlines thickness={0.025} color="black" />
      </mesh>
      {/* Long north apron rail */}
      <mesh position={[-0.05, 0.66, 1.88]}>
        <boxGeometry args={[8.1, 0.14, 0.06]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      {/* Long south apron rail */}
      <mesh position={[-0.05, 0.66, 0.12]}>
        <boxGeometry args={[8.1, 0.14, 0.06]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-3.75, 0.66, 1.0]}>
        <boxGeometry args={[0.06, 0.14, 1.8]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[3.65, 0.66, 1.0]}>
        <boxGeometry args={[0.06, 0.14, 1.8]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      {/* 6 legs */}
      {TABLE_LEG_X.flatMap(lx =>
        TABLE_LEG_Z.map((lz, j) => (
          <mesh key={`${lx}-${j}`} position={[lx, 0.30, lz]}>
            <cylinderGeometry args={[0.055, 0.065, 0.60, 8]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            <Outlines thickness={0.018} color="black" />
          </mesh>
        ))
      )}

      {/* ─── Table dressée ──────────────────────────────────────────────────── */}
      <Tablecloth />
      {/* Plates + glasses — one plate + one glass per guest */}
      {PLATE_X.flatMap((px, pi) => PLATE_Z.map((pz, zi) => (
        <group key={`p-${pi}-${zi}`} position={[px, 0.814, pz]}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.18, 0.014, 12]} />
            <meshToonMaterial color="#F8F4EE" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          {/* Raised plate foot */}
          <mesh position={[0, 0.008, 0]}>
            <cylinderGeometry args={[0.13, 0.16, 0.008, 12]} />
            <meshToonMaterial color="#EEEBE4" gradientMap={toonGradient} />
          </mesh>
          {/* Served plate (refs: dishes served) — mole / rice / frijoles alternating */}
          <mesh position={[0, 0.022, 0]} scale={[1, 1, 0.85 + ((pi + zi) % 3) * 0.1]}>
            <cylinderGeometry args={[0.095, 0.105, 0.025, 10]} />
            <meshToonMaterial
              color={['#5A2E14', '#D9C78A', '#3A1C10'][(pi + zi * 3) % 3]}
              gradientMap={toonGradient}
            />
            <Outlines thickness={0.008} color="black" />
          </mesh>
          {/* Glass: blue-tinted cylinder with emissive */}
          <mesh position={[0.28, 0.065, 0]}>
            <cylinderGeometry args={[0.044, 0.036, 0.13, 8]} />
            <meshToonMaterial color="#C8E0F0" gradientMap={toonGradient} emissive="#A0C0E0" emissiveIntensity={0.2} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        </group>
      )))}
      {/* End plates — west (x=-5.0) and east (x=4.2) end chairs */}
      {([ [-4.15, 1.4], [-4.15, 0.6], [4.25, 1.4], [4.25, 0.6] ] as [number, number][]).map(([px, pz], i) => (
        <group key={`end-plate-${i}`} position={[px, 0.814, pz]}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.18, 0.014, 12]} />
            <meshToonMaterial color="#F8F4EE" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[0, 0.008, 0]}>
            <cylinderGeometry args={[0.13, 0.16, 0.008, 12]} />
            <meshToonMaterial color="#EEEBE4" gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 0.065, 0.28]}>
            <cylinderGeometry args={[0.044, 0.036, 0.13, 8]} />
            <meshToonMaterial color="#C8E0F0" gradientMap={toonGradient} emissive="#A0C0E0" emissiveIntensity={0.2} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        </group>
      ))}

      {/* Central serving dishes */}
      <mesh position={[-0.05, 0.816, 1.0]}>
        <cylinderGeometry args={[0.30, 0.30, 0.020, 12]} />
        <meshToonMaterial color="#E8D4B4" gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      <mesh position={[-2.05, 0.816, 1.0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.018, 10]} />
        <meshToonMaterial color="#D4B890" gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>
      <mesh position={[1.95, 0.816, 1.0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.018, 10]} />
        <meshToonMaterial color="#D4B890" gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>

      {/* ─── 20 chairs (image-to-3D pipeline, ladder-back ref salon-vue-entree-01) ──
          Non-uniform Y stretch: tall backs from refs without widening floor footprint
          (collisions calibrated). */}
      {CHAIRS.map((c, i) => (
        <group key={i} scale={[1, 1.14, 1]}>
          <Prop
            url="/models/props/chaise.glb?v=3"
            color={C_WOOD_DARK}
            position={c.pos}
            rotationY={c.rot}
            targetHeight={1.05}
          />
        </group>
      ))}

      {/* ─── Table candles ──────────────────────────────────────────────────── */}
    </>
  )
}
