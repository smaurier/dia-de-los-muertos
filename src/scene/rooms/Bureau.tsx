// src/scene/rooms/Bureau.tsx
// Office — south of the entrance hallway, as per the floor plan (between the
// storage room and the future garage). x∈[8.9,12.4], z∈[-4.2,-1.2]. Door on
// the south hallway (west wall, z∈[-2.5,-1.56]). Adult room, tidy, slightly
// solemn: writing desk, banker's lamp, bookshelf, filing cabinet, typewriter.
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { ZoneReflectorMaterial } from '../shared/ZoneReflector'
import { toonGradient } from '../shared/toonGradient'
import { murAdobeSide, solTomettes, boisSombre } from '../shared/paintedTextures'
import { AnimatedDoor } from '../shared/AnimatedDoor'
import { PhotoFrame } from '../shared/PhotoFrame'

const C_CEIL      = '#E4D6BC'
const C_WOOD_DARK = '#3A2008'
const C_WOOD_MED  = '#5C3010'
const C_IRON      = '#1A1512'
const C_NIGHT     = '#16223E'
const C_PAPER     = '#EFE9D8'

export function Bureau() {
  return (
    <group>
      {/* ── Tile floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10.65, 0.001, -2.7]}>
        <planeGeometry args={[3.5, 3.0]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>
      {/* ── Ceiling ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[10.65, 2.9, -2.7]}>
        <planeGeometry args={[3.5, 3.0]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>

      {/* ── West wall x=8.9 (inner face), pierced door z∈[-2.5,-1.56] ── */}
      <mesh position={[8.9, 1.45, -1.38]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.36, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[8.9, 1.45, -3.35]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.7, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[8.9, 2.5, -2.03]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.94, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Openable door (key F) — opens into the office */}
      <AnimatedDoor id="bureau" position={[8.82, 0, -2.5]} openAngle={1.9} width={0.94} />
      {/* Wood casing */}
      {[-2.53, -1.53].map(pz => (
        <mesh key={pz} position={[8.82, 1.05, pz]}>
          <boxGeometry args={[0.22, 2.1, 0.08]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      ))}
      <mesh position={[8.82, 2.12, -2.03]}>
        <boxGeometry args={[0.22, 0.08, 1.08]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>

      {/* ── North wall z=-1.2 (back of the entrance hallway) ── */}
      <mesh position={[10.65, 1.45, -1.2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[3.5, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── South wall z=-4.2 ── */}
      <mesh position={[10.65, 1.45, -4.2]}>
        <planeGeometry args={[3.5, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── East wall x=12.4, pierced window z∈[-3.3,-2.1] y∈[1.0,2.2] ── */}
      <mesh position={[12.4, 1.45, -1.65]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[12.4, 1.45, -3.75]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[12.4, 2.55, -2.7]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.2, 0.7]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[12.4, 0.5, -2.7]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.2, 1.0]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Window: night + casing + rejas */}
      <mesh position={[12.52, 1.6, -2.7]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.3, 1.3]} />
        <meshToonMaterial color={C_NIGHT} emissive="#24365E" emissiveIntensity={0.35} gradientMap={toonGradient} />
      </mesh>
      {[-3.3, -2.1].map(pz => (
        <mesh key={pz} position={[12.38, 1.6, pz]}>
          <boxGeometry args={[0.08, 1.36, 0.06]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
      ))}
      {[1.0, 2.2].map(py => (
        <mesh key={py} position={[12.38, py, -2.7]}>
          <boxGeometry args={[0.08, 0.06, 1.28]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
      ))}
      {[-3.0, -2.7, -2.4].map(pz => (
        <mesh key={pz} position={[12.46, 1.6, pz]}>
          <boxGeometry args={[0.018, 1.2, 0.018]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.006} color="black" />
        </mesh>
      ))}
      {/* Glass — same properties as the salon's large window */}
      <mesh position={[12.49, 1.6, -2.7]} rotation={[0, -Math.PI / 2, 0]} userData={{ reflectorZone: 'bureau' }}>
        <planeGeometry args={[1.16, 1.16]} />
        <ZoneReflectorMaterial zone="bureau" transparent opacity={0.68} color="#e8f0f4" resolution={256} mirror={1} mixStrength={1.4} blur={[0, 0]} roughness={0.06} metalness={0} depthScale={0} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Writing desk against the east wall, under the window — chair facing it ── */}
      <group position={[11.85, 0, -2.7]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Top + drawer pedestals */}
        <mesh position={[0, 0.74, 0]}>
          <boxGeometry args={[1.4, 0.05, 0.65]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {[-0.5, 0.5].map(dx => (
          <group key={dx}>
            <mesh position={[dx, 0.38, 0]}>
              <boxGeometry args={[0.36, 0.72, 0.58]} />
              <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
              <Outlines thickness={0.012} color="black" />
            </mesh>
            {[0.18, 0.4, 0.62].map(py => (
              <group key={py}>
                <mesh position={[dx, py, 0.295]}>
                  <boxGeometry args={[0.3, 0.14, 0.012]} />
                  <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
                </mesh>
                <mesh position={[dx, py, 0.31]}>
                  <sphereGeometry args={[0.016, 6, 6]} />
                  <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
                </mesh>
              </group>
            ))}
          </group>
        ))}
        {/* Banker's lamp (green shade, lit) */}
        <group position={[-0.42, 0.765, -0.18]}>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.06, 0.075, 0.04, 8]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
          <mesh position={[0, 0.14, 0]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.22, 6]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 0.26, 0.06]} rotation={[Math.PI / 2 + 0.5, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.075, 0.095, 0.24, 10, 1, true]} />
            <meshToonMaterial color="#1E5C3A" emissive="#3A9A60" emissiveIntensity={0.5} gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
        </group>
        {/* Typewriter */}
        <group position={[0.25, 0.765, 0.02]} rotation={[0, -0.12, 0]}>
          <mesh position={[0, 0.07, 0]}>
            <boxGeometry args={[0.36, 0.14, 0.3]} />
            <meshToonMaterial color="#2A2E34" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[0, 0.17, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.4, 8]} />
            <meshToonMaterial color="#1A1E24" gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
          <mesh position={[0, 0.145, 0.06]} rotation={[-0.5, 0, 0]}>
            <planeGeometry args={[0.3, 0.12]} />
            <meshToonMaterial color="#3A3E44" gradientMap={toonGradient} />
          </mesh>
        </group>
        {/* Scattered papers + rubber stamp */}
        {([[-0.05, 0.2, 0.15], [0.06, 0.28, -0.2], [-0.15, 0.14, 0.32]] as [number, number, number][]).map(([dx, dz, rot], i) => (
          <mesh key={i} position={[dx, 0.768 + i * 0.002, dz]} rotation={[-Math.PI / 2, 0, rot]}>
            <planeGeometry args={[0.21, 0.28]} />
            <meshToonMaterial color={C_PAPER} gradientMap={toonGradient} />
          </mesh>
        ))}
        {/* Rotary-dial telephone */}
        <group position={[0.55, 0.765, -0.18]}>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.2, 0.1, 0.16]} />
            <meshToonMaterial color="#4A2E1A" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[0, 0.115, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.028, 0.028, 0.18, 8]} />
            <meshToonMaterial color="#3A2010" gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        </group>
      </group>
      {/* Banker's lamp glow */}
      <pointLight position={[11.7, 1.2, -2.4]} intensity={0.9} color="#8ADFA8" distance={2.8} decay={2} />

      {/* ── Office chair (back to the door, facing the desk) ── */}
      <group position={[11.15, 0, -2.7]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.46, 0]}>
          <boxGeometry args={[0.42, 0.05, 0.42]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {([-0.17, 0.17] as number[]).flatMap(dx =>
          ([-0.17, 0.17] as number[]).map((dz, j) => (
            <mesh key={`${dx}-${j}`} position={[dx, 0.22, dz]}>
              <cylinderGeometry args={[0.02, 0.024, 0.44, 6]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            </mesh>
          ))
        )}
        <mesh position={[0, 0.82, -0.19]}>
          <boxGeometry args={[0.42, 0.68, 0.05]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      </group>

      {/* ── Bookshelf against the south wall ── */}
      <group position={[10.5, 0, -3.93]}>
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[1.5, 2.0, 0.4]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.018} color="black" />
        </mesh>
        {/* Book shelves (coloured spines) */}
        {[0.5, 0.98, 1.46].map((py, r) => (
          <group key={py}>
            <mesh position={[0, py - 0.04, 0.14]}>
              <boxGeometry args={[1.38, 0.03, 0.3]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            </mesh>
            {Array.from({ length: 9 }, (_, i) => (
              <mesh
                key={i}
                position={[-0.6 + i * 0.15, py + 0.14, 0.14]}
                rotation={[0, 0, (i * 7 + r * 3) % 5 === 0 ? 0.08 : 0]}
              >
                <boxGeometry args={[0.1, 0.3 - ((i + r) % 3) * 0.04, 0.22]} />
                <meshToonMaterial
                  color={['#6E2A3A', '#27547A', '#4A5A2E', '#7A5A2A', '#3A3A5E'][(i + r * 2) % 5]}
                  gradientMap={toonGradient}
                />
                <Outlines thickness={0.006} color="black" />
              </mesh>
            ))}
          </group>
        ))}
        {/* Globe on top */}
        <group position={[-0.4, 2.14, 0]}>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 0.04, 8]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <sphereGeometry args={[0.1, 10, 10]} />
            <meshToonMaterial color="#2E6B8A" gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
          <mesh position={[0.02, 0.15, 0.04]}>
            <sphereGeometry args={[0.098, 8, 8, 0, 1.4, 0.8, 1.1]} />
            <meshToonMaterial color="#7A9A4A" gradientMap={toonGradient} />
          </mesh>
        </group>
      </group>

      {/* ── Metal filing cabinet (north-east corner) ── */}
      <group position={[12.1, 0, -1.5]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0.66, 0]}>
          <boxGeometry args={[0.45, 1.32, 0.5]} />
          <meshToonMaterial color="#6E7A72" gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {[0.3, 0.66, 1.02].map(py => (
          <group key={py}>
            <mesh position={[0, py, 0.255]}>
              <boxGeometry args={[0.38, 0.3, 0.012]} />
              <meshToonMaterial color="#5E6A62" gradientMap={toonGradient} />
            </mesh>
            <mesh position={[0, py + 0.08, 0.265]}>
              <boxGeometry args={[0.1, 0.024, 0.014]} />
              <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── Small rug + frames + plant ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10.9, 0.012, -2.7]}>
        <planeGeometry args={[1.5, 1.1]} />
        <meshToonMaterial color="#27406E" gradientMap={toonGradient} />
      </mesh>
      {[-0.42, 0.42].map((dz, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[10.9, 0.014, -2.7 + dz]}>
          <planeGeometry args={[1.5, 0.09]} />
          <meshToonMaterial color="#C8893A" gradientMap={toonGradient} />
        </mesh>
      ))}
      <PhotoFrame position={[10.2, 1.95, -1.23]} rotY={Math.PI} />
      <PhotoFrame position={[8.93, 1.85, -3.3]} rotY={Math.PI / 2} />
      {/* Potted plant (south-west corner) */}
      <group position={[9.25, 0, -3.85]}>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.16, 0.12, 0.36, 9]} />
          <meshToonMaterial color="#C47A3A" gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {([[0, 0.55, 0, 0.2], [-0.13, 0.46, 0.06, 0.13], [0.12, 0.44, -0.08, 0.13]] as [number, number, number, number][]).map(([px, py, pz, r], i) => (
          <mesh key={i} position={[px, py, pz]} scale={[1, 1.3, 1]}>
            <sphereGeometry args={[r, 8, 8]} />
            <meshToonMaterial color="#3E7C3A" gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
        ))}
      </group>

      {/* ── Lights: sober room — green lamp + weak warm fill ── */}
      <pointLight position={[10.65, 2.3, -2.7]} intensity={0.7} color="#e8d0a0" distance={4.5} decay={2} />
      <pointLight position={[12.0, 1.9, -2.7]} intensity={0.5} color="#8aa4d8" distance={3.5} decay={2} />
    </group>
  )
}
