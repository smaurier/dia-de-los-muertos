// src/scene/living-room/shell/LivingRoomStructure.tsx
// Floor, ceiling, vigas, and four walls (with their arches) of the living room.
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import {
  murAdobeNorth, murAdobeLintel, murAdobeSouth, murAdobeSide,
  solTomettes, solTomettesNormal,
} from '../../shared/paintedTextures'
import { plafondBoisTexture } from '../../shared/fabricTexture'
import { ZoneReflectorMaterial } from '../../shared/ZoneReflector'
import {
  SHOW_AABB,
  intradosGeometry,
  C_WOOD_DARK, C_WOOD_MED,
} from './livingRoomConstants'
import { SALON_OBSTACLES } from '../livingRoomCollision'

// ─── Structure ────────────────────────────────────────────────────────────────
export function LivingRoomStructure() {
  return (
    <>
      {/* ─── Tomette floor (painted texture, milestone 3) ──────────────────── */}
      {/* Blurred planar reflection: the ref shows chairs/tablecloth/chandelier
          mirrored in the waxed tomettes. Only concession to toon, deliberate. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} userData={{ reflectorScope: 'salon', reflectorZone: 'salon' }}>
        <planeGeometry args={[14, 11.6]} />
        <ZoneReflectorMaterial
          zone="salon"
          salonScope
          map={solTomettes}
          normalMap={solTomettesNormal}
          normalScale={new THREE.Vector2(0.7, 0.7)}
          resolution={256}
          mirror={0.45}
          mixStrength={0.8}
          mixBlur={1}
          blur={[250, 90]}
          roughness={0.5}
          metalness={0}
          distortion={0.12}
          distortionMap={solTomettesNormal}
          depthScale={0.6}
          minDepthThreshold={0.5}
          maxDepthThreshold={1.2}
        />
      </mesh>

      {/* ─── Ceiling + vigas (wood beams, ref salon-vue-entree-01) ─────────── */}
      {!SHOW_AABB && (
        <>
          {/* Wood ceiling: dark planks (refs — no plaster on the ceiling) */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, 0]}>
            <planeGeometry args={[14, 11.6]} />
            <meshToonMaterial map={plafondBoisTexture} gradientMap={toonGradient} />
          </mesh>
          {/* Vigas: more numerous and massive (refs — beams ~1.5 m on centre) */}
          {[-6.3, -4.9, -3.5, -2.1, -0.7, 0.7, 2.1, 3.5, 4.9, 6.3].map(bx => (
            <mesh key={bx} position={[bx, 3.08, 0]}>
              <boxGeometry args={[0.22, 0.24, 11.6]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            </mesh>
          ))}
        </>
      )}
      {SHOW_AABB && SALON_OBSTACLES.map(([mx, Mx, mz, Mz], i) => (
        <mesh key={i} position={[(mx + Mx) / 2, 0.8, (mz + Mz) / 2]}>
          <boxGeometry args={[Mx - mx, 1.6, Mz - mz]} />
          <meshBasicMaterial color="#ff2020" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      ))}

      {/* ─── South wall z=-5.8 — solid panel (south arch removed, floor-plan-v1) */}
      <mesh position={[-0.05, 1.6, -5.8]}>
        <boxGeometry args={[14, 3.2, 0.35]} />
        <meshToonMaterial map={murAdobeSouth} gradientMap={toonGradient} />
      </mesh>

      {/* ─── North wall z=5.8 with arch toward the kitchen (ref: warm opening) ── */}
      {/* THICK wall (0.35 m, ref: deep adobe reveal, no carpentry).
          Panels as boxes on either side of opening [-3.4, -1.6],
          textured reveal (flat jambs + cylindrical intrados). */}
      <mesh position={[-5.2, 1.6, 5.975]}>
        <boxGeometry args={[3.6, 3.2, 0.35]} />
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      {/* Right north panel — split for arch 2 (x=4.5, opening x∈[3.6,5.4]) */}
      <mesh position={[1.0, 1.6, 5.975]}>
        <boxGeometry args={[5.2, 3.2, 0.35]} />
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[6.2, 1.6, 5.975]}>
        <boxGeometry args={[1.6, 3.2, 0.35]} />
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      {/* Arch 2 — spandrel, rings, intrados, jambs */}
      <mesh position={[4.5, 2.95, 5.975]}>
        <boxGeometry args={[1.8, 0.5, 0.35]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[4.5, 1.8, 5.79]} rotation={[0, Math.PI, 0]}>
        <ringGeometry args={[0.9, 1.6, 24, 1, 0, Math.PI]} />
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[4.5, 1.8, 6.16]}>
        <ringGeometry args={[0.9, 1.6, 24, 1, 0, Math.PI]} />
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[4.5, 1.8, 5.975]} geometry={intradosGeometry}>
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[3.6, 0.9, 5.975]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.35, 1.8]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[5.4, 0.9, 5.975]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.35, 1.8]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      {/* Spandrel above arch 1 (from apex 2.7 to ceiling 3.2) */}
      <mesh position={[-2.5, 2.95, 5.975]}>
        <boxGeometry args={[1.8, 0.5, 0.35]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      {/* Ring: adobe rings on the living-room side and the kitchen side */}
      <mesh position={[-2.5, 1.8, 5.79]} rotation={[0, Math.PI, 0]}>
        <ringGeometry args={[0.9, 1.6, 24, 1, 0, Math.PI]} />
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-2.5, 1.8, 6.16]}>
        <ringGeometry args={[0.9, 1.6, 24, 1, 0, Math.PI]} />
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      {/* Intrados: curved soffit of the arch. Inverted normals (seen from below)
          — geometry prepared by intradosGeometry. */}
      <mesh position={[-2.5, 1.8, 5.975]} geometry={intradosGeometry}>
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      {/* Jambs: inner faces of the reveal, normals toward the opening */}
      <mesh position={[-3.4, 0.9, 5.975]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.35, 1.8]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-1.6, 0.9, 5.975]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.35, 1.8]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>

      {/* ─── East wall x=7 — entrance arch (zaguán, z=0, opening z∈[-0.9,0.9]).
          THICK wall (0.35 m, x∈[7,7.35]) like the north wall: deep reveal,
          faces visible from both sides (living room AND zaguán/corridor). ──── */}
      <mesh position={[7.175, 1.6, -3.35]}>
        <boxGeometry args={[0.35, 3.2, 4.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[7.175, 1.6, 3.35]}>
        <boxGeometry args={[0.35, 3.2, 4.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Spandrel above the east arch (from apex 2.7 to ceiling 3.2) */}
      <mesh position={[7.175, 2.95, 0]}>
        <boxGeometry args={[0.35, 0.5, 1.8]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      {/* Ring: adobe rings on the living-room side and the zaguán side */}
      <mesh position={[6.99, 1.8, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <ringGeometry args={[0.9, 1.6, 24, 1, 0, Math.PI]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[7.36, 1.8, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.9, 1.6, 24, 1, 0, Math.PI]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Intrados: curved soffit (axis rotated along x) */}
      <mesh position={[7.175, 1.8, 0]} rotation={[0, Math.PI / 2, 0]} geometry={intradosGeometry}>
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      {/* Jambs: inner faces of the reveal, normals toward the opening */}
      <mesh position={[7.175, 0.9, 0.9]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.35, 1.8]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[7.175, 0.9, -0.9]}>
        <planeGeometry args={[0.35, 1.8]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      {/* Cross above the east arch (living-room interior) */}
      <mesh position={[6.99, 2.82, 0]}>
        <boxGeometry args={[0.04, 0.42, 0.07]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>
      <mesh position={[6.99, 2.90, 0]}>
        <boxGeometry args={[0.04, 0.07, 0.26]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
      </mesh>

      {/* ─── West wall x=-7, pierced for the window (opening z∈[-1.2,2.2],
          y∈[0.75,2.85] — the ref gives it most of the wall): 4 segments +
          deep reveal 0.35 m ─────────────────────────────────────────────── */}
      <mesh position={[-7, 1.6, -3.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.6, 3.2]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-7, 1.6, 4.0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.6, 3.2]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-7, 3.025, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.4, 0.35]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-7, 0.375, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.4, 0.75]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      {/* Reveal: jambs, sub-lintel, sill (faces toward the opening) */}
      <mesh position={[-7.175, 1.8, 2.2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.35, 2.1]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-7.175, 1.8, -1.2]}>
        <planeGeometry args={[0.35, 2.1]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-7.175, 2.85, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.35, 3.4]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-7.175, 0.75, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.35, 3.4]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
    </>
  )
}
