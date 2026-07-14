// src/scene/rooms/Couloir.tsx
// T-shaped hallway (floor plan logic: runs along both bedrooms and joins the entrance).
//   north branch  x∈[-0.6,13.4]  z∈[6.2,7.6] — from the stone-wall door
//     to the end of bedroom 2 (dead end: future bathroom)
//   east branch   x∈[7.35,8.75]  z∈[2.0,7.6] — descends toward the zaguán (entrance)
//     (offset: the salon's east wall is thick, x∈[7,7.35])
// Opens into the zaguán through a gap x∈[7.55,8.55] (north wall of the zaguán).
// North wall pierced x∈[4.03,4.97] (bedroom 1 door, facing arch 2) and
// x∈[10.2,11.14] (bedroom 2 door, the parents' room).
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { murAdobeSide, solTomettes, boisSombre } from '../shared/paintedTextures'
import { PorteAnimee } from '../shared/PorteAnimee'
import { ZoneReflectorMaterial } from '../shared/ZoneReflector'

const C_CEIL = '#E4D6BC'

export function Couloir() {
  return (
    <group>
      {/* ── Floor tiles (2 disjoint planes, junction at x=7.35) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.4, 0.001, 6.9]}>
        <planeGeometry args={[14.0, 1.4]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.05, 0.001, 1.15]}>
        <planeGeometry args={[1.4, 12.9]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>
      {/* ── Ceilings ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[6.4, 2.9, 6.9]}>
        <planeGeometry args={[14.0, 1.4]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[8.05, 2.9, 1.15]}>
        <planeGeometry args={[1.4, 12.9]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>

      {/* ── North branch ── */}
      {/* South wall z=6.2 (back of the salon's north wall) — open x∈[3.6,5.4]:
          salon arch 2 opens into the hallway */}
      <mesh position={[1.5, 1.45, 6.2]}>
        <planeGeometry args={[4.2, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[6.375, 1.45, 6.2]}>
        <planeGeometry args={[1.95, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* South wall of the extension (z=6.2, x∈[8.75,13.4]), pierced x∈[10.2,11.14]:
          bathroom door, FACING the bedroom 2 door.
          The gap x∈[7.35,8.75] is the start of the east branch. */}
      <mesh position={[9.475, 1.45, 6.2]}>
        <planeGeometry args={[1.45, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[12.27, 1.45, 6.2]}>
        <planeGeometry args={[2.26, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[10.67, 2.5, 6.2]}>
        <planeGeometry args={[0.94, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[4.5, 2.8, 6.2]}>
        <planeGeometry args={[1.8, 0.2]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Threshold floor in the wall thickness (z∈[5.8,6.2], under arch 2) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.5, 0.001, 6.0]}>
        <planeGeometry args={[1.8, 0.4]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>
      {/* North wall z=7.6 — all the way to x=13.4, pierced x∈[4.03,4.97] (bedroom 1
          door, facing arch 2) and x∈[10.2,11.14] (bedroom 2 door) */}
      <mesh position={[1.715, 1.45, 7.6]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4.63, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[7.585, 1.45, 7.6]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[5.23, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[12.27, 1.45, 7.6]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.26, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Lintels above doors (y∈[2.1,2.9]) */}
      <mesh position={[4.5, 2.5, 7.6]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.94, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[10.67, 2.5, 7.6]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.94, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Dead end at x=13.4 (future bathroom) */}
      <mesh position={[13.4, 1.45, 6.9]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.4, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>

      {/* ── East branch — crosses the entrance junction (z∈[-0.9,0.9]) and
          continues south between the office and the salon to the green door ── */}
      {/* East wall x=8.75 — pierced z∈[2.25,3.19] (storage door), open
          z∈[-0.9,0.9] (junction), pierced z∈[-2.5,-1.56] (office door) */}
      <mesh position={[8.75, 1.45, 1.575]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.35, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[8.75, 1.45, 4.695]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.01, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[8.75, 2.5, 2.72]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.94, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[8.75, 1.45, -1.23]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.66, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[8.75, 2.5, -2.03]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.94, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[8.75, 1.45, -3.9]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.8, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* West wall x=7.36 (1 cm in front of the salon's thick east wall face —
          avoids z-fighting; interrupted at the east arch z∈[-0.9,0.9]) */}
      <mesh position={[7.36, 1.45, 3.55]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5.3, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── THE MIRROR (clue #1, spec V10 ch3) — on the salon's exterior wall,
          in the hallway that runs along the bathroom. The child is reflected.
          The adult is not — layer mechanic coming later (backlog "Mirror robuste");
          for now it is a real mirror. ── */}
      {/* Full-length mirror (portrait): glass starts 12 cm from the floor —
          the hero sees themselves fully, easily */}
      <group position={[7.38, 0.97, 4.3]} rotation={[0, Math.PI / 2, 0]}>
        {/* Moulded wood frame */}
        <mesh position={[0, 0, -0.015]}>
          <boxGeometry args={[0.94, 1.86, 0.04]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {/* Moulded pediment at the top of the frame */}
        <mesh position={[0, 0.96, -0.005]}>
          <boxGeometry args={[0.66, 0.08, 0.05]} />
          <meshToonMaterial color="#5C3010" gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        {/* Glass: real planar reflection — active pass only if the
            player is in the hallway or an adjacent zone */}
        <mesh position={[0, 0, 0.008]} userData={{ reflectorZone: 'couloir' }}>
          <planeGeometry args={[0.8, 1.7]} />
          <ZoneReflectorMaterial zone="couloir" color="#dfe8ec" resolution={512} mirror={1} mixStrength={1.0} blur={[0, 0]} roughness={0.04} metalness={0} depthScale={0} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <mesh position={[7.36, 1.45, -3.1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.4, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* South end z=-5.3: GREEN DOOR (openable — leads to the patio) */}
      <mesh position={[7.465, 1.45, -5.3]}>
        <planeGeometry args={[0.23, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[8.635, 1.45, -5.3]}>
        <planeGeometry args={[0.23, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[8.05, 2.5, -5.3]}>
        <planeGeometry args={[0.94, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <PorteAnimee
        id="porte-verte"
        position={[7.58, 0, -5.3]}
        rotationY={Math.PI / 2}
        openAngle={-1.9}
        width={0.94}
        color="#2E6B4F"
        panelColor="#245640"
      />
      {/* Threshold floor in the wall thickness (z∈[-5.6,-5.3], under the door) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.05, 0.001, -5.45]}>
        <planeGeometry args={[0.94, 0.3]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>

      {/* ── Dim lights ── */}
      <pointLight position={[0.8, 2.3, 6.9]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
      <pointLight position={[5.0, 2.3, 6.9]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
      <pointLight position={[8.05, 2.3, 4.2]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
      <pointLight position={[11.5, 2.3, 6.9]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
    </group>
  )
}
