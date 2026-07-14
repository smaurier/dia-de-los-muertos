// src/scene/rooms/Bedroom2.tsx
// Parents' bedroom — Papá Carlos + Mamá Elena. The LARGE bedroom.
// x∈[7.35,13.4], z∈[7.6,12] (~6 × 4.4 m), adjoining bedroom 1
// (double partition x∈[7,7.35]). Door on the hallway x∈[10.2,11.14].
// Room empty during the party: dim light, bedside lamps, moonlight.
import { Outlines } from '@react-three/drei'
import { GlassReflector } from '../shared/GlassReflector'
import { toonGradient } from '../shared/toonGradient'
import { murAdobeSide, solTomettes, boisSombre } from '../shared/paintedTextures'
import { AnimatedDoor } from '../shared/AnimatedDoor'
import { PhotoFrame } from '../shared/PhotoFrame'

const C_CEIL      = '#E4D6BC'
const C_WOOD_DARK = '#3A2008'
const C_WOOD_MED  = '#5C3010'
const C_IRON      = '#1A1512'
const C_NIGHT     = '#16223E'

export function Bedroom2() {
  return (
    <group>
      {/* ── Tile floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10.375, 0.001, 9.8]}>
        <planeGeometry args={[6.05, 4.4]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>
      {/* ── Ceiling ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[10.375, 2.9, 9.8]}>
        <planeGeometry args={[6.05, 4.4]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>

      {/* ── South wall z=7.75 (hallway-facing side), pierced door
          x∈[10.2,11.14] ── */}
      <mesh position={[8.775, 1.45, 7.75]}>
        <planeGeometry args={[2.85, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[12.27, 1.45, 7.75]}>
        <planeGeometry args={[2.26, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[10.67, 2.5, 7.75]}>
        <planeGeometry args={[0.94, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Openable door (key F) — hinge on the west side, opens into the bedroom */}
      <AnimatedDoor id="chambre-2" position={[10.2, 0, 7.67]} rotationY={Math.PI / 2} openAngle={-1.9} width={0.94} />
      {/* Wood casing */}
      {[10.17, 11.17].map(px => (
        <mesh key={px} position={[px, 1.05, 7.67]}>
          <boxGeometry args={[0.08, 2.1, 0.22]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      ))}
      <mesh position={[10.67, 2.12, 7.67]}>
        <boxGeometry args={[1.08, 0.08, 0.22]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>

      {/* ── West wall x=7.35 (shared with bedroom 1, east face) ── */}
      <mesh position={[7.35, 1.45, 9.8]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.4, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── East wall x=13.4 — LARGE window z∈[8.9,10.9] y∈[0.9,2.3] (faces
          the outside; not a French door — sill at 0.9 m) ── */}
      <mesh position={[13.4, 1.45, 8.25]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.3, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[13.4, 1.45, 11.45]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[13.4, 2.6, 9.9]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.0, 0.6]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[13.4, 0.45, 9.9]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.0, 0.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Night + wood casing + sill + rejas */}
      <mesh position={[13.52, 1.6, 9.9]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.1, 1.5]} />
        <meshToonMaterial color={C_NIGHT} emissive="#24365E" emissiveIntensity={0.35} gradientMap={toonGradient} />
      </mesh>
      {[8.9, 10.9].map(pz => (
        <mesh key={pz} position={[13.38, 1.6, pz]}>
          <boxGeometry args={[0.08, 1.56, 0.07]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
      ))}
      {[0.9, 2.3].map(py => (
        <mesh key={py} position={[13.38, py, 9.9]}>
          <boxGeometry args={[0.08, 0.07, 2.08]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
      ))}
      {/* Central mullion + overhanging sill */}
      <mesh position={[13.38, 1.6, 9.9]}>
        <boxGeometry args={[0.06, 1.44, 0.06]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[13.35, 0.86, 9.9]}>
        <boxGeometry args={[0.14, 0.06, 2.2]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>
      {[9.2, 9.55, 10.25, 10.6].map(pz => (
        <mesh key={pz} position={[13.46, 1.6, pz]}>
          <boxGeometry args={[0.022, 1.4, 0.022]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.006} color="black" />
        </mesh>
      ))}
      {/* Glass (two panes on either side of the mullion) — same as salon window */}
      <mesh position={[13.43, 1.6, 9.9]} rotation={[0, -Math.PI / 2, 0]} userData={{ reflectorZone: 'chambre2' }}>
        <planeGeometry args={[1.96, 1.36]} />
        <GlassReflector zone="chambre2" />
      </mesh>
      {/* Moonlight entering through the large window */}
      <pointLight position={[12.9, 1.8, 9.9]} intensity={0.7} color="#8aa4d8" distance={4.5} decay={2} />

      {/* ── North wall z=12, pierced window x∈[8.3,9.9] y∈[1.0,2.2] ── */}
      <mesh position={[7.825, 1.45, 12]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.95, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[11.65, 1.45, 12]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[3.5, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[9.1, 2.55, 12]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.6, 0.7]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[9.1, 0.5, 12]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.6, 1.0]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Window: blue night + casing + rejas */}
      <mesh position={[9.1, 1.6, 12.12]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.7, 1.3]} />
        <meshToonMaterial color={C_NIGHT} emissive="#24365E" emissiveIntensity={0.35} gradientMap={toonGradient} />
      </mesh>
      {[8.3, 9.9].map(px => (
        <mesh key={px} position={[px, 1.6, 11.97]}>
          <boxGeometry args={[0.08, 1.36, 0.1]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
      ))}
      {[1.0, 2.2].map(py => (
        <mesh key={py} position={[9.1, py, 11.97]}>
          <boxGeometry args={[1.68, 0.08, 0.1]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
      ))}
      {[8.6, 8.95, 9.25, 9.6].map(px => (
        <mesh key={px} position={[px, 1.6, 12.06]}>
          <boxGeometry args={[0.022, 1.2, 0.022]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.006} color="black" />
        </mesh>
      ))}
      {/* Glass — same properties as the salon's large window */}
      <mesh position={[9.1, 1.6, 12.03]} rotation={[0, Math.PI, 0]} userData={{ reflectorZone: 'chambre2' }}>
        <planeGeometry args={[1.56, 1.16]} />
        <GlassReflector zone="chambre2" />
      </mesh>

      {/* ── Double bed — head against the north wall, east of the window ── */}
      <group position={[11.6, 0, 10.9]}>
        {/* Frame */}
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[1.7, 0.18, 2.1]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.018} color="black" />
        </mesh>
        {/* Tall headboard (against the north wall) */}
        <mesh position={[0, 0.78, 1.02]}>
          <boxGeometry args={[1.7, 0.96, 0.07]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0, 1.28, 1.02]}>
          <boxGeometry args={[1.8, 0.09, 0.1]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
        {/* 4 legs */}
        {([-0.78, 0.78] as number[]).flatMap(px =>
          ([-0.98, 0.98] as number[]).map((pz, j) => (
            <mesh key={`${px}-${j}`} position={[px, 0.12, pz]}>
              <cylinderGeometry args={[0.04, 0.046, 0.24, 6]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            </mesh>
          ))
        )}
        {/* Mattress */}
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[1.6, 0.16, 2.0]} />
          <meshToonMaterial color="#E8E0D0" gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        {/* Two pillows */}
        {[-0.4, 0.4].map(px => (
          <mesh key={px} position={[px, 0.6, 0.75]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.62, 0.11, 0.36]} />
            <meshToonMaterial color="#F2ECDC" gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
        ))}
        {/* Woven blanket (terracotta red, cream trim) + drops */}
        <mesh position={[0, 0.565, -0.35]}>
          <boxGeometry args={[1.66, 0.05, 1.26]} />
          <meshToonMaterial color="#8A3A2A" gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {[-0.2, 0.25].map((dz, i) => (
          <mesh key={i} position={[0, 0.592, -0.35 + dz]}>
            <boxGeometry args={[1.66, 0.008, 0.14]} />
            <meshToonMaterial color={i ? '#D9C78A' : '#C8893A'} gradientMap={toonGradient} />
          </mesh>
        ))}
        {[-0.84, 0.84].map((dx, i) => (
          <mesh key={i} position={[dx, 0.42, -0.35]}>
            <boxGeometry args={[0.03, 0.26, 1.26]} />
            <meshToonMaterial color="#8A3A2A" gradientMap={toonGradient} />
          </mesh>
        ))}
      </group>

      {/* ── Two bedside tables + lamps ── */}
      {[10.4, 12.85].map((px, i) => (
        <group key={i} position={[px, 0, 11.7]}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.46, 0.6, 0.38]} />
            <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
            <Outlines thickness={0.014} color="black" />
          </mesh>
          {/* Lamp: base + warm shade */}
          <mesh position={[0, 0.66, 0]}>
            <cylinderGeometry args={[0.016, 0.02, 0.12, 8]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 0.76, 0]}>
            <cylinderGeometry args={[0.06, 0.09, 0.12, 10, 1, true]} />
            <meshToonMaterial color="#E8C87A" emissive="#F0C060" emissiveIntensity={0.55} gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
        </group>
      ))}

      {/* ── Blanket chest at the foot of the bed ── */}
      <group position={[11.6, 0, 9.55]}>
        <mesh position={[0, 0.24, 0]}>
          <boxGeometry args={[1.3, 0.42, 0.42]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        {/* Folded throw on top */}
        <mesh position={[0.3, 0.49, 0]}>
          <boxGeometry args={[0.5, 0.08, 0.34]} />
          <meshToonMaterial color="#27547A" gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
      </group>

      {/* ── Large wardrobe against the west wall ── */}
      <group position={[7.68, 0, 9.4]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[1.6, 2.1, 0.6]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.020} color="black" />
        </mesh>
        <mesh position={[0, 1.05, 0.305]}>
          <boxGeometry args={[0.015, 1.96, 0.012]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
        {[-0.08, 0.08].map(dx => (
          <mesh key={dx} position={[dx, 1.05, 0.315]}>
            <sphereGeometry args={[0.024, 6, 6]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        ))}
        <mesh position={[0, 2.14, 0]}>
          <boxGeometry args={[1.72, 0.09, 0.68]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
        {([-0.7, 0.7] as number[]).flatMap(px =>
          ([-0.24, 0.24] as number[]).map((pz, j) => (
            <mesh key={`${px}-${j}`} position={[px, 0.05, pz]}>
              <boxGeometry args={[0.09, 0.1, 0.09]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            </mesh>
          ))
        )}
      </group>

      {/* ── Chest of drawers against the east wall ── */}
      <group position={[13.05, 0, 8.7]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.1, 0.9, 0.5]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        {[0.24, 0.5, 0.76].map((ty, i) => (
          <group key={i}>
            <mesh position={[0, ty, 0.255]}>
              <boxGeometry args={[0.96, 0.17, 0.012]} />
              <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
            </mesh>
            {[-0.2, 0.2].map(dx => (
              <mesh key={dx} position={[dx, ty, 0.27]}>
                <sphereGeometry args={[0.02, 6, 6]} />
                <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Doily + framed wedding photo on top */}
        <mesh position={[0, 0.905, 0]}>
          <boxGeometry args={[0.5, 0.01, 0.3]} />
          <meshToonMaterial color="#F2EDDF" gradientMap={toonGradient} />
        </mesh>
        <group position={[0.15, 0.91, 0]} rotation={[-0.08, -0.3, 0]}>
          <mesh position={[0, 0.14, 0]}>
            <boxGeometry args={[0.2, 0.26, 0.02]} />
            <meshToonMaterial color="#2A1A08" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[0, 0.14, 0.012]}>
            <boxGeometry args={[0.15, 0.21, 0.006]} />
            <meshToonMaterial color="#4A4858" gradientMap={toonGradient} />
          </mesh>
        </group>
      </group>

      {/* ── Woven rug at the foot of the bed ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10.7, 0.012, 9.3]}>
        <planeGeometry args={[2.4, 1.6]} />
        <meshToonMaterial color="#5A3A5A" gradientMap={toonGradient} />
      </mesh>
      {[-0.6, -0.35, 0.35, 0.6].map((dz, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[10.7, 0.014, 9.3 + dz]}>
          <planeGeometry args={[2.4, 0.09]} />
          <meshToonMaterial color={i % 2 ? '#C8893A' : '#8A3A5A'} gradientMap={toonGradient} />
        </mesh>
      ))}

      {/* ── Cross above the bed (crossbar along x — wall runs along x) ── */}
      <mesh position={[11.6, 2.5, 11.96]}>
        <boxGeometry args={[0.05, 0.38, 0.04]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>
      <mesh position={[11.6, 2.58, 11.96]}>
        <boxGeometry args={[0.22, 0.06, 0.04]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
      </mesh>

      {/* ── Photo frames (family) — on the south wall, FACING the bed ── */}
      <PhotoFrame position={[11.6, 1.95, 7.78]} rotY={0} />
      <PhotoFrame position={[8.6, 1.9, 7.78]} rotY={0} />

      {/* ── Slippers at the foot of the bed + book on a bedside table ── */}
      {([[10.75, 10.6], [10.98, 10.55]] as [number, number][]).map(([px, pz], i) => (
        <mesh key={i} position={[px, 0.035, pz]} rotation={[0, i * 0.5 - 0.2, 0]}>
          <boxGeometry args={[0.1, 0.06, 0.24]} />
          <meshToonMaterial color="#6E2A3A" gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      ))}
      <mesh position={[12.85, 0.63, 11.62]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.16, 0.035, 0.22]} />
        <meshToonMaterial color="#27547A" gradientMap={toonGradient} />
        <Outlines thickness={0.008} color="black" />
      </mesh>

      {/* ── Lights: dim — bedside lamps, moonlight ── */}
      <pointLight position={[10.4, 0.95, 11.5]} intensity={0.85} color="#f5c87a" distance={4} decay={2} />
      <pointLight position={[12.85, 0.95, 11.5]} intensity={0.85} color="#f5c87a" distance={4} decay={2} />
      <pointLight position={[9.1, 1.9, 11.3]} intensity={0.7} color="#8aa4d8" distance={5} decay={2} />
    </group>
  )
}
