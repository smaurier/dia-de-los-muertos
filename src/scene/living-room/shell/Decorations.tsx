// src/scene/living-room/shell/Decorations.tsx
// Wall/floor décor: framed photos (north tapestry + south/east walls via
// FRAMES_SOUTH/FRAMES_EAST), the potted cactus, and the wrought-iron
// chandelier with its six candles above the table.
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import { PhotoFrame } from '../../shared/PhotoFrame'
import {
  C_IRON, C_CACTUS, C_POT, C_CANDLE, C_FLAME,
  FRAMES_SOUTH, FRAMES_EAST,
} from './livingRoomConstants'

export function Decorations() {
  return (
    <>
      {/* ─── Photo frames ──────────────────────────────────────────────────── */}
      {/* North wall: large framed tapestry + frames (ref entrance-view, left) */}
      <group position={[-5.2, 2.0, 5.77]} rotation={[0, Math.PI, 0]} scale={[1.45, 1.45, 1]}>
        <PhotoFrame position={[0, 0, 0]} />
      </group>
      {/* FRAMES_NORTH removed — space for the bedroom 1 arch (middle wall x∈[-1.6,3.6]) */}
      {/* South wall: frames above the lounge corner (ref entrance-view, right) */}
      {FRAMES_SOUTH.map((pos, i) => <PhotoFrame key={i} position={pos} />)}
      {FRAMES_EAST.map((pos, i) => (
        <PhotoFrame key={i} position={pos} rotY={-Math.PI / 2} />
      ))}

      {/* ─── Cactus ─────────────────────────────────────────────────────────── */}
      <group position={[-6.1, 0, 4.7]}>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.21, 0.16, 0.44, 9]} />
          <meshToonMaterial color={C_POT} gradientMap={toonGradient} />
          <Outlines thickness={0.020} color="black" />
        </mesh>
        <mesh position={[0, 0.445, 0]}>
          <cylinderGeometry args={[0.24, 0.21, 0.05, 9]} />
          <meshToonMaterial color="#B06830" gradientMap={toonGradient} />
        </mesh>
        <mesh position={[0, 0.47, 0]}>
          <cylinderGeometry args={[0.20, 0.20, 0.04, 9]} />
          <meshToonMaterial color="#3A2010" gradientMap={toonGradient} />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[0.11, 0.14, 1.15, 9]} />
          <meshToonMaterial color={C_CACTUS} gradientMap={toonGradient} />
          <Outlines thickness={0.022} color="black" />
        </mesh>
        <mesh position={[-0.22, 0.82, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.09, 0.36, 8]} />
          <meshToonMaterial color={C_CACTUS} gradientMap={toonGradient} />
          <Outlines thickness={0.018} color="black" />
        </mesh>
        <mesh position={[-0.40, 0.99, 0]}>
          <cylinderGeometry args={[0.065, 0.075, 0.30, 8]} />
          <meshToonMaterial color={C_CACTUS} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0.21, 0.70, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.065, 0.08, 0.30, 8]} />
          <meshToonMaterial color={C_CACTUS} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0.36, 0.84, 0]}>
          <cylinderGeometry args={[0.055, 0.065, 0.26, 8]} />
          <meshToonMaterial color={C_CACTUS} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
      </group>

      {/* ─── Wrought-iron chandelier (above the table, ref salon-vue-entree-01) ── */}
      <group position={[-0.05, 0, 0]}>
        {/* Chain */}
        <mesh position={[0, 2.93, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.55, 6]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
        {/* Central hub */}
        <mesh position={[0, 2.60, 0]}>
          <cylinderGeometry args={[0.06, 0.09, 0.16, 8]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {/* Ring (refs: wide crown, 6 candles) */}
        <mesh position={[0, 2.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.032, 8, 28]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {/* 6 arms + candles on the ring */}
        {Array.from({ length: 6 }, (_, i) => (i * Math.PI) / 3).map((a, i) => (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.275, 2.52, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.014, 0.014, 0.55, 6]} />
              <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            </mesh>
            {/* Cup */}
            <mesh position={[0.55, 2.545, 0]}>
              <cylinderGeometry args={[0.05, 0.028, 0.03, 8]} />
              <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            </mesh>
            <mesh position={[0.55, 2.63, 0]}>
              <cylinderGeometry args={[0.038, 0.033, 0.15, 8]} />
              <meshToonMaterial color={C_CANDLE} gradientMap={toonGradient} />
              <Outlines thickness={0.012} color="black" />
            </mesh>
            <mesh position={[0.55, 2.745, 0]}>
              <sphereGeometry args={[0.032, 8, 8]} />
              <meshToonMaterial color={C_FLAME} emissive={C_FLAME} emissiveIntensity={2.2} gradientMap={toonGradient} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  )
}
