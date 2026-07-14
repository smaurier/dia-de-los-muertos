// src/scene/rooms/Debarras.tsx
// Storage room (ch7 — the most oppressive point in the house, spec house-rooms).
// Between the bathroom and the entrance, as per the floor plan: door on the
// east branch of the hallway (z∈[2.25,3.19]), the one that descends to the zaguán.
// Rectangle x∈[8.9,13.4], z∈[1.2,3.25]. East of the bathroom:
// the outside (its window faces it).
// No window here. Weak bare bulb. Things go here when nobody wants to see them.
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { murAdobeSide, boisSombre } from '../shared/paintedTextures'
import { AnimatedDoor } from '../shared/AnimatedDoor'

const C_CEIL  = '#D8CBB2'
const C_WOOD  = '#3A2008'
const C_WOODM = '#5C3010'
const C_IRON  = '#1A1512'
const C_FLOOR = '#8A7460'   // raw concrete, no tiles here

export function Debarras() {
  return (
    <group>
      {/* ── Floor (raw concrete) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[11.15, 0.001, 2.225]}>
        <planeGeometry args={[4.5, 2.05]} />
        <meshToonMaterial color={C_FLOOR} gradientMap={toonGradient} />
      </mesh>
      {/* ── Ceiling ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[11.15, 2.9, 2.225]}>
        <planeGeometry args={[4.5, 2.05]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>

      {/* ── West wall x=8.9 (inner face of the east branch wall),
          pierced door z∈[2.25,3.19] ── */}
      <mesh position={[8.9, 1.45, 1.725]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.05, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[8.9, 2.5, 2.72]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.94, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Openable door (key F) — opens into the storage room */}
      <AnimatedDoor id="debarras" position={[8.82, 0, 2.25]} openAngle={1.9} width={0.94} />
      {/* Wood casing (fills the band slivers) */}
      {[2.23, 3.21].map(pz => (
        <mesh key={pz} position={[8.82, 1.05, pz]}>
          <boxGeometry args={[0.22, 2.1, 0.08]} />
          <meshToonMaterial color={C_WOOD} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      ))}
      <mesh position={[8.82, 2.12, 2.72]}>
        <boxGeometry args={[0.22, 0.08, 1.08]} />
        <meshToonMaterial color={C_WOOD} gradientMap={toonGradient} />
      </mesh>

      {/* ── South wall z=1.2 (back of the entrance hallway) ── */}
      <mesh position={[11.15, 1.45, 1.2]}>
        <planeGeometry args={[4.5, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── North wall z=3.25 (back of the bathroom on the west, outside on the east) ── */}
      <mesh position={[11.15, 1.45, 3.25]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4.5, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── East wall x=13.4 ── */}
      <mesh position={[13.4, 1.45, 2.225]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.05, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>

      {/* ── Rough shelves along the south wall (jars, boxes, newspapers) ── */}
      <group position={[10.4, 0, 1.5]}>
        {[0.5, 1.05, 1.6].map(py => (
          <mesh key={py} position={[0, py, 0]}>
            <boxGeometry args={[2.4, 0.045, 0.42]} />
            <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
        ))}
        {[-1.14, 0, 1.14].map(px => (
          <mesh key={px} position={[px, 0.85, 0]}>
            <boxGeometry args={[0.06, 1.7, 0.42]} />
            <meshToonMaterial color={C_WOODM} gradientMap={toonGradient} />
          </mesh>
        ))}
        {/* Cardboard boxes + jars + newspaper pile */}
        {([[-0.7, 0.64, '#A08050', 0.34], [0.15, 0.63, '#8A6A42', 0.28], [0.85, 0.62, '#A08050', 0.3]] as [number, number, string, number][]).map(([px, py, c, s], i) => (
          <mesh key={`b${i}`} position={[px, py, 0]} rotation={[0, (i - 1) * 0.15, 0]}>
            <boxGeometry args={[s, 0.22, 0.3]} />
            <meshToonMaterial color={c} gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
        ))}
        {[-0.9, -0.6, -0.32].map((px, i) => (
          <mesh key={`j${i}`} position={[px, 1.16, 0.02]}>
            <cylinderGeometry args={[0.06, 0.05, 0.16, 8]} />
            <meshToonMaterial color={['#B8A878', '#C8B888', '#A89868'][i]} gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        ))}
        <mesh position={[0.5, 1.13, 0]}>
          <boxGeometry args={[0.5, 0.12, 0.34]} />
          <meshToonMaterial color="#D8CDB0" gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
        <mesh position={[-0.2, 1.73, 0]}>
          <boxGeometry args={[0.4, 0.2, 0.3]} />
          <meshToonMaterial color="#8A6A42" gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
      </group>

      {/* ── Stack of boxes + rolled rug (south-centre) + paint can ── */}
      {([[10.6, 1.55, 0.5, 0.2], [10.55, 1.6, 0.42, 0.72]] as [number, number, number, number][]).map(([px, pz, s, py], i) => (
        <mesh key={`c${i}`} position={[px, py + 0.05, pz]} rotation={[0, i * 0.3 - 0.1, 0]}>
          <boxGeometry args={[s, i === 0 ? 0.5 : 0.42, s * 0.85]} />
          <meshToonMaterial color={i === 0 ? '#98784A' : '#8A6A42'} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      ))}
      <mesh position={[11.85, 0.65, 1.5]} rotation={[0.12, 0, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 1.3, 9]} />
        <meshToonMaterial color="#7A4226" gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      <group position={[9.6, 0, 1.55]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.11, 0.10, 0.24, 10]} />
          <meshToonMaterial color="#8A9298" gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        <mesh position={[0.02, 0.255, 0]} rotation={[0, 0.5, 0.12]}>
          <boxGeometry args={[0.2, 0.02, 0.04]} />
          <meshToonMaterial color={C_WOODM} gradientMap={toonGradient} />
        </mesh>
      </group>

      {/* ── Armchair covered in a sheet (south-east corner — a shape waiting) ── */}
      <group position={[12.75, 0, 1.95] } rotation={[0, -0.4, 0]}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.8, 0.84, 0.75]} />
          <meshToonMaterial color="#D8D2C4" gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0, 0.92, -0.22]}>
          <boxGeometry args={[0.76, 0.36, 0.3]} />
          <meshToonMaterial color="#D8D2C4" gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {([[-0.42, 0, 0.06, 0.7], [0.42, 0, 0.06, 0.7], [0, 0.39, 0.86, 0.06]] as [number, number, number, number][]).map(([dx, dz, w, d], i) => (
          <mesh key={i} position={[dx, 0.3, dz]}>
            <boxGeometry args={[w, 0.6, d]} />
            <meshToonMaterial color="#CCC6B8" gradientMap={toonGradient} />
          </mesh>
        ))}
      </group>

      {/* ── Stacked boxes against the east wall (north-east corner) ── */}
      {([[13.05, 2.75, 0.3, 0.55, 0.1], [13.1, 3.0, 0.26, 0.45, -0.15], [13.05, 2.85, 0.86, 0.5, 0.05]] as [number, number, number, number, number][]).map(([px, pz, py, s, rot], i) => (
        <mesh key={i} position={[px, py, pz]} rotation={[0, rot, 0]}>
          <boxGeometry args={[s, i === 2 ? 0.5 : 0.55, s * 0.9]} />
          <meshToonMaterial color={['#A08050', '#8A6A42', '#98784A'][i]} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      ))}

      {/* ── Old trunk + stack of blankets (against the north wall) ── */}
      <group position={[10.35, 0, 2.95]}>
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[0.85, 0.52, 0.45]} />
          <meshToonMaterial color="#5A3A20" gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {[-0.25, 0.25].map(dx => (
          <mesh key={dx} position={[dx, 0.26, -0.23]}>
            <boxGeometry args={[0.05, 0.5, 0.015]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        ))}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.5, 0.16, 0.36]} />
          <meshToonMaterial color="#6E4A5A" gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        <mesh position={[0.02, 0.72, 0.01]}>
          <boxGeometry args={[0.44, 0.1, 0.32]} />
          <meshToonMaterial color="#4A5A6E" gradientMap={toonGradient} />
        </mesh>
      </group>

      {/* ── Wooden ladder leaning against the north wall ── */}
      <group position={[11.4, 0, 3.05]} rotation={[-0.22, 0, 0]}>
        {[-0.16, 0.16].map(dx => (
          <mesh key={dx} position={[dx, 0.85, 0]}>
            <boxGeometry args={[0.045, 1.7, 0.045]} />
            <meshToonMaterial color={C_WOODM} gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
        ))}
        {[0.35, 0.75, 1.15, 1.55].map(py => (
          <mesh key={py} position={[0, py, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.32, 6]} />
            <meshToonMaterial color={C_WOODM} gradientMap={toonGradient} />
          </mesh>
        ))}
      </group>

      {/* ── Broom + bucket near the door (against the north wall) ── */}
      <group position={[9.3, 0, 3.0]}>
        <mesh position={[0, 0.75, 0]} rotation={[0.06, 0, 0.14]}>
          <cylinderGeometry args={[0.014, 0.014, 1.5, 6]} />
          <meshToonMaterial color={C_WOODM} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
        <mesh position={[0.11, 0.09, 0]} rotation={[0, 0, 0.14]}>
          <cylinderGeometry args={[0.05, 0.11, 0.2, 8]} />
          <meshToonMaterial color="#C8A868" gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
        <mesh position={[0.35, 0.13, 0.05]}>
          <cylinderGeometry args={[0.13, 0.10, 0.26, 9]} />
          <meshToonMaterial color="#6E7A8A" gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
      </group>

      {/* ── Old frame turned face-down, leaning against the east wall ── */}
      <mesh position={[13.3, 0.42, 1.7]} rotation={[0, Math.PI / 2, -0.1]}>
        <boxGeometry args={[0.56, 0.72, 0.035]} />
        <meshToonMaterial color="#7A6248" gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>

      {/* ── Bare weak bulb — the room stays in shadow ── */}
      <pointLight position={[11.15, 2.3, 2.2]} intensity={0.7} color="#e8d0a0" distance={4.5} decay={2} />
      <mesh position={[11.15, 2.56, 2.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshToonMaterial color="#E8D8B0" emissive="#D8C080" emissiveIntensity={1.0} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[11.15, 2.74, 2.2]}>
        <cylinderGeometry args={[0.007, 0.007, 0.32, 4]} />
        <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
      </mesh>
    </group>
  )
}
