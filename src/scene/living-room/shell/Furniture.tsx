// src/scene/living-room/shell/Furniture.tsx
// Wall furniture: the buffet/dresser (north wall) with its standing photos and
// cempasúchil vase, the zaguán entry corridor behind the east arch (with the
// front door), and the china cabinet (vaisselier, north-east corner).
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import { solTomettes } from '../../shared/paintedTextures'
import { Wall } from '../../shared/Wall'
import { Prop } from '../../shared/Prop'
import { FrontDoor } from '../FrontDoor'
import { BUFFET_URL } from '../../assets/manifest'
import {
  C_WOOD_DARK, C_WOOD_MED, C_CEIL, C_FRAME, C_PHOTO, C_CERAMIC,
} from './livingRoomConstants'

export function Furniture() {
  return (
    <>
      {/* ─── Buffet/dresser (north wall, on the left as you enter — ref entrance-view) ─── */}
      <Prop
        url={BUFFET_URL}
        color={C_WOOD_MED}
        position={[2.0, 0, 5.35]}
        rotationY={Math.PI}
        targetHeight={1.05}
      />
      {/* Family photos standing on the buffet */}
      {([[1.7, -0.06], [2.05, 0.04], [2.45, -0.04], [2.8, 0.06]] as [number, number][]).map(([px, rot], i) => (
        <group key={i} position={[px, 1.05, 5.35]} rotation={[0, Math.PI + rot, 0]}>
          <mesh>
            <boxGeometry args={[0.16, 0.22, 0.02]} />
            <meshToonMaterial color={C_FRAME} gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
          <mesh position={[0, 0, 0.011]}>
            <planeGeometry args={[0.12, 0.17]} />
            <meshToonMaterial color={C_PHOTO} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}
      {/* Cempasúchil vase (orange flowers) */}
      <group position={[1.25, 1.05, 5.35]}>
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.055, 0.075, 0.22, 9]} />
          <meshToonMaterial color={C_CERAMIC} gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        {([[0, 0.28, 0], [-0.07, 0.25, 0.04], [0.07, 0.26, -0.03], [0.03, 0.24, 0.06], [-0.05, 0.23, -0.06]] as [number, number, number][]).map(([fx, fy, fz], i) => (
          <mesh key={i} position={[fx, fy, fz]}>
            <sphereGeometry args={[0.045, 7, 7]} />
            <meshToonMaterial color="#E8821E" gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        ))}
      </group>

      {/* ─── Buffet candles ─────────────────────────────────────────────────── */}

      {/* ─── Zaguán: entry corridor behind the east arch ──────────────────────
          x∈[7.35,10], z∈[-0.9,0.9] — THE WIDTH OF THE ARCH. Behind the arch,
          a crossroads: straight ahead the front door, to the left (north) the
          east branch toward the bedrooms, to the right (south) the office corridor. */}
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.675, 0.001, 0]}>
          <planeGeometry args={[2.65, 1.8]} />
          <meshPhongMaterial map={solTomettes} shininess={40} specular="#4a3420" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[8.675, 2.9, 0]}>
          <planeGeometry args={[2.65, 1.8]} />
          <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
        </mesh>
        {/* East wall x=10 (behind the front door) */}
        <Wall position={[10, 1.45, 0]} rotation={[0, -Math.PI / 2, 0]} size={[1.8, 2.9]} />
        {/* North wall z=0.9 and south wall z=-0.9 (x∈[8.75,9.94] — to the west, the
            crossroads is open). DoubleSide: visible from both sides. */}
        <Wall position={[9.345, 1.45, 0.9]} rotation={[0, Math.PI, 0]} size={[1.19, 2.9]} side={THREE.DoubleSide} />
        <Wall position={[9.345, 1.45, -0.9]} size={[1.19, 2.9]} side={THREE.DoubleSide} />
        {/* Front door: studded leaves, cantera, transom, farol —
            see PorteEntree.tsx */}
        <FrontDoor />
      </group>

      {/* ─── China cabinet (north-east corner, ref window-view) ────────────────────── */}
      <group position={[6.15, 0, 5.45]} rotation={[0, Math.PI, 0]}>
        {/* Lower cabinet */}
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.5, 0.9, 0.48]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          <Outlines thickness={0.020} color="black" />
        </mesh>
        {/* Upper glass case */}
        <mesh position={[0, 1.62, 0.04]}>
          <boxGeometry args={[1.42, 1.44, 0.38]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.018} color="black" />
        </mesh>
        {/* Case back + 2 plate shelves */}
        <mesh position={[0, 1.62, -0.10]}>
          <planeGeometry args={[1.34, 1.34]} />
          <meshToonMaterial color="#2A1608" gradientMap={toonGradient} />
        </mesh>
        {([1.28, 1.92] as number[]).flatMap(sy =>
          ([-0.45, 0, 0.45] as number[]).map(sxx => (
            <mesh key={`${sy}-${sxx}`} position={[sxx, sy, -0.02]} rotation={[0.12, 0, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.018, 12]} />
              <meshToonMaterial color={C_CERAMIC} gradientMap={toonGradient} />
              <Outlines thickness={0.008} color="black" />
            </mesh>
          ))
        )}
        {/* Cornice */}
        <mesh position={[0, 2.38, 0.05]}>
          <boxGeometry args={[1.56, 0.09, 0.46]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
      </group>
    </>
  )
}
