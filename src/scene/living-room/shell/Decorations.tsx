// src/scene/living-room/shell/Decorations.tsx
// Wall/floor decor: framed photos (north tapestry + south/east walls via
// FRAMES_SOUTH/FRAMES_EAST), the potted cactus, and the wrought-iron
// chandelier with its six candles above the table.
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import { boisSombre } from '../../shared/paintedTextures'
import { PhotoFrame } from '../../shared/PhotoFrame'
import { LeafyPlant } from './LeafyPlant'
import {
  C_IRON, C_CACTUS, C_POT, C_CANDLE, C_FLAME,
  C_WOOD_DARK, C_WOOD_MED, C_GOLD, C_FRAME, C_PHOTO, C_LEAF, C_CERAMIC,
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

      {/* ─── Serving plates (table center, between the candles) ─────────────── */}
      {/* Tamales plate */}
      <group position={[-2.75, 0.84, 0]}>
        <mesh scale={[1.4, 1, 1]}>
          <cylinderGeometry args={[0.24, 0.28, 0.05, 12]} />
          <meshToonMaterial color={C_CERAMIC} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {([-0.20, 0, 0.20] as number[]).map((dx, i) => (
          <mesh key={i} position={[dx, 0.055, 0]} rotation={[0, (i - 1) * 0.25, 0]}>
            <boxGeometry args={[0.11, 0.06, 0.26]} />
            <meshToonMaterial color="#D9B98A" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
        ))}
      </group>
      {/* Mole pot */}
      <group position={[-0.15, 0.82, 0]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.19, 0.14, 0.14, 12]} />
          <meshToonMaterial color="#B05038" gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        <mesh position={[0, 0.125, 0]}>
          <cylinderGeometry args={[0.155, 0.155, 0.015, 12]} />
          <meshToonMaterial color="#4A2210" gradientMap={toonGradient} />
        </mesh>
      </group>
      {/* Basket of oranges */}
      <group position={[2.45, 0.83, 0]}>
        <mesh>
          <cylinderGeometry args={[0.20, 0.15, 0.09, 10]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {([[-0.07, 0.07, 0.05], [0.08, 0.07, -0.04], [-0.02, 0.07, -0.08], [0.01, 0.13, 0.01]] as [number, number, number][]).map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.055, 9, 9]} />
            <meshToonMaterial color="#E67E22" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
        ))}
      </group>

      {/* ─── Completed feast (refs: the table is covered with dishes) ───────── */}
      {/* Stack of tortillas + cloth */}
      <group position={[1.55, 0.84, 0.35]}>
        <mesh>
          <cylinderGeometry args={[0.16, 0.16, 0.015, 10]} />
          <meshToonMaterial color={C_CERAMIC} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {[0.02, 0.045, 0.07].map((py, i) => (
          <mesh key={i} position={[(i % 2) * 0.012, py, -(i % 2) * 0.01]}>
            <cylinderGeometry args={[0.12 - i * 0.004, 0.12 - i * 0.004, 0.022, 10]} />
            <meshToonMaterial color="#E9D8A8" gradientMap={toonGradient} />
          </mesh>
        ))}
      </group>
      {/* Bowl of frijoles */}
      <group position={[-1.45, 0.84, -0.35]}>
        <mesh position={[0, 0.045, 0]}>
          <cylinderGeometry args={[0.13, 0.09, 0.10, 12]} />
          <meshToonMaterial color="#8A4A2A" gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.105, 0.105, 0.012, 12]} />
          <meshToonMaterial color="#3A1C10" gradientMap={toonGradient} />
        </mesh>
      </group>
      {/* Two jarras (agua de jamaica) */}
      {([[-3.55, 0.55], [3.35, -0.5]] as [number, number][]).map(([jx, jz], i) => (
        <group key={i} position={[jx, 0.84, jz]}>
          <mesh position={[0, 0.10, 0]}>
            <cylinderGeometry args={[0.075, 0.055, 0.20, 10]} />
            <meshToonMaterial color="#B05038" gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
          <mesh position={[0, 0.215, 0]}>
            <cylinderGeometry args={[0.05, 0.075, 0.035, 10]} />
            <meshToonMaterial color="#B05038" gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0.085, 0.12, 0]} rotation={[0, 0, -0.3]}>
            <torusGeometry args={[0.045, 0.011, 6, 10, Math.PI]} />
            <meshToonMaterial color="#B05038" gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}
      {/* Basket of pan de muerto */}
      <group position={[0.05, 0.84, 0.42]}>
        <mesh>
          <cylinderGeometry args={[0.17, 0.13, 0.07, 10]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {([[-0.05, 0.04], [0.06, -0.03], [0.0, 0.09]] as [number, number][]).map(([bx, bz], i) => (
          <group key={i} position={[bx, 0.065 + (i === 2 ? 0.05 : 0), bz]}>
            <mesh>
              <sphereGeometry args={[0.062, 9, 9]} />
              <meshToonMaterial color="#C8893A" gradientMap={toonGradient} />
              <Outlines thickness={0.010} color="black" />
            </mesh>
            <mesh position={[0, 0.045, 0]}>
              <sphereGeometry args={[0.02, 7, 7]} />
              <meshToonMaterial color="#B8792F" gradientMap={toonGradient} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ─── Vase of cempasúchil on the north buffet (ref window-view) ───────── */}
      <group position={[2.1, 1.02, 5.35]}>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.09, 0.06, 0.28, 10]} />
          <meshToonMaterial color="#7A9AB8" gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {([[0, 0.36, 0], [-0.09, 0.32, 0.04], [0.09, 0.33, -0.03], [-0.04, 0.30, -0.08], [0.05, 0.31, 0.08], [0, 0.42, -0.02]] as [number, number, number][]).map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshToonMaterial color={i % 2 ? '#E8940A' : '#D97E08'} gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
        ))}
      </group>

      {/* ─── North wall candles on consoles (ref window-view: glows on the
          right wall) ────────────────────────────────────────────────────────── */}
      {([[0.3, 5.62], [4.9, 5.62]] as [number, number][]).map(([sx2, sz2], i) => (
        <group key={i}>
          <mesh position={[sx2, 1.94, sz2 + 0.09]}>
            <boxGeometry args={[0.24, 0.03, 0.16]} />
            <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
        </group>
      ))}

      {/* ─── Woven wall hanging (north wall, west of the arch — ref) ─────────── */}
      <group position={[-4.9, 2.0, 5.77]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <planeGeometry args={[0.72, 1.0]} />
          <meshToonMaterial color="#8A3A2A" gradientMap={toonGradient} />
        </mesh>
        {[-0.30, -0.10, 0.10, 0.30].map((ty, i) => (
          <mesh key={i} position={[0, ty, 0.005]}>
            <planeGeometry args={[0.72, 0.07]} />
            <meshToonMaterial color={['#E8940A', '#27AE60', '#F1C40F', '#2980B9'][i]} gradientMap={toonGradient} />
          </mesh>
        ))}
        <mesh position={[0, 0.54, 0.01]}>
          <boxGeometry args={[0.82, 0.04, 0.03]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
      </group>

      {/* ─── Family photos placed on the buffet ─────────────────────────────── */}
      {([-1.95, -2.5, -3.05] as number[]).map((pz, i) => (
        <group key={i} position={[-6.28, 1.05, pz]} rotation={[-0.06, Math.PI / 2 + (i - 1) * 0.18, 0]}>
          <mesh position={[0, 0.14, 0]}>
            <boxGeometry args={[0.22, 0.28, 0.02]} />
            <meshToonMaterial color={C_FRAME} gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
          <mesh position={[0, 0.14, 0.012]}>
            <boxGeometry args={[0.17, 0.23, 0.008]} />
            <meshToonMaterial color={C_PHOTO} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}

      {/* ─── Leafy plants: east wall + on both sides of the window (ref) ─────── */}
      <LeafyPlant position={[6.5, 0, 2.8]} />
      <LeafyPlant position={[-6.35, 0, 2.35]} />
      <LeafyPlant position={[-6.4, 0, -1.6]} />

      {/* ─── Small dresser + bedside lamp + mini plant — BETWEEN the end of the
          sofa return and the TV, against the south wall (position B validated) ─ */}
      <group position={[-5.0, 0, -5.45]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Dresser: wooden carcass, 2 knobbed drawers, 4 short legs */}
        <mesh position={[0, 0.34, 0]}>
          <boxGeometry args={[0.44, 0.44, 0.55]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0, 0.575, 0]}>
          <boxGeometry args={[0.48, 0.035, 0.59]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {[0.24, 0.44].map((ty, i) => (
          <group key={i}>
            <mesh position={[0.225, ty, 0]}>
              <boxGeometry args={[0.015, 0.155, 0.46]} />
              <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
            </mesh>
            <mesh position={[0.235, ty, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.016, 0.016, 0.02, 8]} />
              <meshToonMaterial color={C_GOLD} gradientMap={toonGradient} />
            </mesh>
          </group>
        ))}
        {([-0.16, 0.16] as number[]).flatMap(lx =>
          ([-0.22, 0.22] as number[]).map((lz, j) => (
            <mesh key={`${lx}-${j}`} position={[lx, 0.06, lz]}>
              <cylinderGeometry args={[0.02, 0.024, 0.12, 6]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            </mesh>
          ))
        )}
        {/* Mini potted plant (a few centimeters, next to the lamp) */}
        <group position={[0.02, 0.59, 0.17]}>
          <mesh position={[0, 0.035, 0]}>
            <cylinderGeometry args={[0.035, 0.026, 0.07, 8]} />
            <meshToonMaterial color={C_POT} gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
          {([[0, 0.1, 0, 0.045], [-0.03, 0.085, 0.02, 0.03], [0.03, 0.09, -0.015, 0.032]] as [number, number, number, number][]).map(([px, py, pz, r], i) => (
            <mesh key={i} position={[px, py, pz]} scale={[1, 1.4, 1]}>
              <sphereGeometry args={[r, 7, 7]} />
              <meshToonMaterial color={C_LEAF} gradientMap={toonGradient} />
              <Outlines thickness={0.006} color="black" />
            </mesh>
          ))}
        </group>
        {/* Bedside lamp: base + short stem + small shade */}
        <group position={[0.02, 0.075, -0.14]}>
          <mesh position={[0, 0.535, 0]}>
            <cylinderGeometry args={[0.06, 0.075, 0.03, 10]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[0, 0.63, 0]}>
            <cylinderGeometry args={[0.014, 0.018, 0.16, 8]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 0.76, 0]}>
            <cylinderGeometry args={[0.075, 0.11, 0.15, 12, 1, true]} />
            <meshToonMaterial color="#E8C87A" emissive="#F0C060" emissiveIntensity={0.6} gradientMap={toonGradient} side={THREE.DoubleSide} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
        </group>
      </group>
      <pointLight position={[-4.86, 1.0, -5.43]} intensity={0.6} color="#F5C87A" distance={3} decay={2} />

      {/* ─── Segmented baseboards — avoid arches and doors ───────────────────
          North (z=5.772): arch1 x∈[-3.4,-1.6] arch2 x∈[3.6,5.4]
          South (z=-5.772): arch3 x∈[-4.4,-2.6]
          East (x=6.952): door z∈[-0.9,0.9]
          West (x=-6.952): solid (window at y>0.75, baseboard below) ──── */}
      {/* North — 3 segments */}
      <mesh position={[-5.2, 0.06, 5.772]}>
        <boxGeometry args={[3.6, 0.12, 0.055]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      <mesh position={[1.0, 0.06, 5.772]}>
        <boxGeometry args={[5.2, 0.12, 0.055]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      <mesh position={[6.2, 0.06, 5.772]}>
        <boxGeometry args={[1.6, 0.12, 0.055]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      {/* South — 2 segments */}
      <mesh position={[-5.7, 0.06, -5.772]}>
        <boxGeometry args={[2.6, 0.12, 0.055]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      <mesh position={[2.2, 0.06, -5.772]}>
        <boxGeometry args={[9.6, 0.12, 0.055]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      {/* East — 2 segments (door z∈[-0.9,0.9]) */}
      <mesh position={[6.952, 0.06, -3.35]}>
        <boxGeometry args={[0.055, 0.12, 4.9]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      <mesh position={[6.952, 0.06, 3.35]}>
        <boxGeometry args={[0.055, 0.12, 4.9]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      {/* West — solid */}
      <mesh position={[-6.952, 0.06, 0]}>
        <boxGeometry args={[0.055, 0.12, 11.6]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>

      {/* (cornice removed: as a light meshBasicMaterial it glowed like neon in
          the gloom — the refs have adobe and dark wood meet directly) */}
    </>
  )
}
