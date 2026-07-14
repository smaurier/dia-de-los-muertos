// src/scene/rooms/Patio.tsx
// The patio (ch8 — the ofrenda). Open-air night courtyard behind the green door,
// south of the house. x∈[-2,9.0], z∈[-10.6,-5.6].
// North facade = the south walls of the salon and hallway, seen from outside.
// Low adobe enclosure (2.6 m) with coping. Oval basin at the center.
// The ofrenda is against the WEST WALL — far from the door: too far to read
// before ch8 (anti-spoiler, spec house-rooms). State ch1-2:
// prepared, not loaded, candles unlit.
// To the east (x=9.0): the shared wall with the garage, pierced by an arch with
// an openable wooden door.
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { murAdobeSide } from '../shared/paintedTextures'
import { AnimatedDoor } from '../shared/AnimatedDoor'

const C_IRON    = '#1A1512'
const C_WOOD    = '#3A2008'
const C_WOOD_M  = '#5C3010'
const C_SOL     = '#6E5A44'   // packed earth
const C_DALLE   = '#8A7A66'   // stone slabs
const C_POT     = '#B06830'
const C_CEMPA   = '#E8940A'   // cempasúchil
const C_CEMPA2  = '#D97E08'
const C_LEAF    = '#3E7C3A'
const C_AGAVE   = '#5A8A6E'
const C_BOUGAIN = '#C0356E'   // bougainvillea
const C_CANDLE  = '#F5E8D0'

// Cempasúchil bunch in a terracotta pot.
function CempasuchilPot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.16, 0.12, 0.32, 9]} />
        <meshToonMaterial color={C_POT} gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      {([[0, 0.42, 0], [-0.1, 0.38, 0.06], [0.1, 0.39, -0.05], [0.04, 0.36, 0.1], [-0.06, 0.35, -0.09]] as [number, number, number][]).map(([px, py, pz], i) => (
        <mesh key={i} position={[px, py, pz]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshToonMaterial color={i % 2 ? C_CEMPA : C_CEMPA2} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      ))}
    </group>
  )
}

// Agave: rosette of thick pointed leaves.
function Agave({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4).map((a, i) => (
        <mesh
          key={i}
          position={[Math.cos(a) * 0.14, 0.22, Math.sin(a) * 0.14]}
          rotation={[Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7]}
        >
          <coneGeometry args={[0.055, 0.55, 5]} />
          <meshToonMaterial color={C_AGAVE} gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
      ))}
      <mesh position={[0, 0.38, 0]}>
        <coneGeometry args={[0.05, 0.6, 5]} />
        <meshToonMaterial color={C_AGAVE} gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>
    </group>
  )
}

// Warm-bulb string lights in catenary, stretched from the facade to the south wall
// (patio lights — ordinary on a festival night; spec: the courtyard stays
// normal, it is the ofrenda that should remain discreet).
function StringLights({ x }: { x: number }) {
  const Z0 = -5.75
  const Z1 = -10.45
  const Y0 = 2.55
  const SAG = 0.5
  const yAt = (t: number) => Y0 - SAG * 4 * t * (1 - t)
  const points = Array.from({ length: 25 }, (_, i) => {
    const t = i / 24
    return new THREE.Vector3(x, yAt(t), Z0 + t * (Z1 - Z0))
  })
  const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, 0.006, 5, false)
  return (
    <group>
      <mesh geometry={tube}>
        <meshToonMaterial color="#2A2018" gradientMap={toonGradient} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (i + 1) / 10).map((t, i) => (
        <group key={i} position={[x, yAt(t) - 0.05, Z0 + t * (Z1 - Z0)]}>
          <mesh position={[0, 0.035, 0]}>
            <cylinderGeometry args={[0.01, 0.014, 0.03, 6]} />
            <meshToonMaterial color="#2A2018" gradientMap={toonGradient} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshToonMaterial color="#FFE0A0" emissive="#FFC860" emissiveIntensity={1.6} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}
      {/* One real light per strand (perf) */}
      <pointLight position={[x, 1.9, -8.1]} intensity={0.9} color="#ffd890" distance={6} decay={2} />
    </group>
  )
}

export function Patio() {
  return (
    <group>
      {/* ── Floor: packed earth + scattered stone slabs ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.5, 0.001, -8.1]}>
        <planeGeometry args={[11.0, 5.0]} />
        <meshToonMaterial color={C_SOL} gradientMap={toonGradient} />
      </mesh>
      {([[7.9, -6.3, 0.1], [7.3, -7.1, -0.2], [8.3, -7.9, 0.3], [6.4, -6.6, 0.15], [4.9, -7.0, -0.1], [3.4, -6.8, 0.25], [1.9, -6.9, 0], [0.6, -6.7, -0.3], [2.6, -8.9, 0.1], [0.9, -8.2, -0.15]] as [number, number, number][]).map(([px, pz, rot], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, rot]} position={[px, 0.006, pz]}>
          <circleGeometry args={[0.32 + (i % 3) * 0.05, 7]} />
          <meshToonMaterial color={C_DALLE} gradientMap={toonGradient} />
        </mesh>
      ))}

      {/* (the sky is the starred DomeCiel, mounted at the scene level) */}

      {/* ── Roof tiles above the facades (seen from the patio — otherwise the
          starred sky appears BEHIND the house, level with the walls) ── */}
      {/* Salon facade (walls at 3.2 m): slope toward the courtyard */}
      <group position={[2.475, 3.3, -6.0]} rotation={[-0.32, 0, 0]}>
        <mesh>
          <boxGeometry args={[8.95, 0.07, 1.05]} />
          <meshToonMaterial color="#8A4A2A" gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {[-0.32, 0.02, 0.36].map(dz => (
          <mesh key={dz} position={[0, 0.045, dz]}>
            <boxGeometry args={[8.95, 0.03, 0.06]} />
            <meshToonMaterial color="#6E3820" gradientMap={toonGradient} />
          </mesh>
        ))}
      </group>
      {/* South hallway facade and green door (walls at 2.9 m) */}
      <group position={[7.975, 3.0, -5.5] } rotation={[-0.32, 0, 0]}>
        <mesh>
          <boxGeometry args={[2.05, 0.07, 0.95]} />
          <meshToonMaterial color="#8A4A2A" gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {[-0.26, 0.1].map(dz => (
          <mesh key={dz} position={[0, 0.04, dz]}>
            <boxGeometry args={[2.05, 0.03, 0.06]} />
            <meshToonMaterial color="#6E3820" gradientMap={toonGradient} />
          </mesh>
        ))}
      </group>

      {/* ── Adobe enclosure (2.6 m): south, west + coping ── */}
      <mesh position={[3.5, 1.3, -10.6]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[11.0, 2.6]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-2, 1.3, -8.1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5.0, 2.6]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} side={THREE.DoubleSide} />
      </mesh>
      {/* Tile coping */}
      <mesh position={[3.5, 2.64, -10.6]}>
        <boxGeometry args={[11.2, 0.1, 0.3]} />
        <meshToonMaterial color="#8A4A2A" gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      <mesh position={[-2, 2.64, -8.1]}>
        <boxGeometry args={[0.3, 0.1, 5.2]} />
        <meshToonMaterial color="#8A4A2A" gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      {/* West pillar of the green door (fills the facade) */}
      <mesh position={[7.16, 1.45, -5.38]}>
        <boxGeometry args={[0.5, 2.9, 0.35]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* East pillar of the green door: closes the corner between the door,
          the facade and the shared wall with the garage (the gap exposed the dead
          zone behind — single-sided walls seen from the back) */}
      <mesh position={[8.875, 1.45, -5.45]}>
        <boxGeometry args={[0.3, 2.9, 0.4]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>

      {/* ── Shared wall with the garage x=9.0 — pierced by an ARCH z∈[-8.6,-7.6]
          with an openable wooden door ── */}
      <mesh position={[9.0, 1.3, -9.6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.0, 2.6]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[9.0, 1.3, -6.6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.0, 2.6]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} side={THREE.DoubleSide} />
      </mesh>
      {/* Arch header + curve (both sides) */}
      <mesh position={[9.0, 2.35, -8.1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.0, 0.5]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} side={THREE.DoubleSide} />
      </mesh>
      {[8.99, 9.01].map((px, i) => (
        <mesh key={px} position={[px, 2.1, -8.1]} rotation={[0, (i === 0 ? -1 : 1) * Math.PI / 2, 0]}>
          <ringGeometry args={[0.5, 0.85, 18, 1, 0, Math.PI]} />
          <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
        </mesh>
      ))}
      {/* Coping on the shared wall */}
      <mesh position={[9.0, 2.64, -9.6]}>
        <boxGeometry args={[0.3, 0.1, 2.0]} />
        <meshToonMaterial color="#8A4A2A" gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      <mesh position={[9.0, 2.64, -6.6]}>
        <boxGeometry args={[0.3, 0.1, 2.0]} />
        <meshToonMaterial color="#8A4A2A" gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      {/* Openable wooden door (key F) in the arch */}
      <AnimatedDoor id="garage" position={[9.0, 0, -8.57]} openAngle={-1.9} width={0.94} />

      {/* (basin removed: the center of the patio stays clear — that is where
          the petal path of ch9 will pass, toward the ofrenda) */}

      {/* ── The ofrenda — against the WEST WALL, far from the green door.
          State ch1-2: table set, cempasúchil arch, a few UNLIT candles,
          a small illegible photo from here. Discreet. ── */}
      <group position={[-1.6, 0, -8.1]} rotation={[0, Math.PI / 2, 0]}>
        {/* Two draped levels */}
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[1.6, 0.84, 0.6]} />
          <meshToonMaterial color="#E8E2D4" gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0, 1.0, -0.14]}>
          <boxGeometry args={[1.0, 0.32, 0.32]} />
          <meshToonMaterial color="#E8E2D4" gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {/* Cempasúchil arch (half-ring of flowers) */}
        {Array.from({ length: 9 }, (_, i) => (i / 8) * Math.PI).map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 0.85, 0.9 + Math.sin(a) * 0.85, -0.24]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshToonMaterial color={i % 2 ? C_CEMPA : C_CEMPA2} gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        ))}
        {/* Small framed photo (illegible from afar — intentional) */}
        <group position={[0, 1.28, -0.14]}>
          <mesh>
            <boxGeometry args={[0.16, 0.22, 0.02]} />
            <meshToonMaterial color="#2A1A08" gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <planeGeometry args={[0.12, 0.17]} />
            <meshToonMaterial color="#4A4858" gradientMap={toonGradient} />
          </mesh>
        </group>
        {/* Unlit candles + glass of water + pan de muerto */}
        {([[-0.55, 0.87, 0.12], [0.5, 0.87, 0.05], [-0.2, 1.19, -0.14]] as [number, number, number][]).map(([px, py, pz], i) => (
          <mesh key={i} position={[px, py, pz]}>
            <cylinderGeometry args={[0.03, 0.034, 0.1 + (i % 2) * 0.05, 8]} />
            <meshToonMaterial color={C_CANDLE} gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        ))}
        <mesh position={[0.25, 0.895, 0.14]}>
          <cylinderGeometry args={[0.035, 0.03, 0.09, 8]} />
          <meshToonMaterial color="#C8E0F0" gradientMap={toonGradient} />
        </mesh>
        <mesh position={[-0.1, 0.89, 0.16]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshToonMaterial color="#C8893A" gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
        {/* Petals at the base */}
        {([[-0.4, 0.25], [0.1, 0.4], [0.55, 0.28], [-0.15, 0.55]] as [number, number][]).map(([px, pz], i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, i]} position={[px, 0.004, pz]}>
            <circleGeometry args={[0.045, 6]} />
            <meshToonMaterial color={C_CEMPA} gradientMap={toonGradient} />
          </mesh>
        ))}
      </group>

      {/* ── Vegetation ── */}
      {/* Bougainvillea against the south wall */}
      <group position={[7.6, 0, -10.2]}>
        <mesh position={[0, 0.6, 0]} rotation={[0.1, 0, -0.25]}>
          <cylinderGeometry args={[0.05, 0.08, 1.2, 7]} />
          <meshToonMaterial color={C_WOOD_M} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {([[0.25, 1.55, 0, 0.5], [-0.15, 1.9, 0.2, 0.42], [0.35, 2.15, -0.25, 0.38], [-0.05, 2.35, -0.1, 0.3]] as [number, number, number, number][]).map(([px, py, pz, r], i) => (
          <mesh key={i} position={[px, py, pz]} scale={[1, 0.8, 1]}>
            <sphereGeometry args={[r, 8, 8]} />
            <meshToonMaterial color={i % 2 ? C_BOUGAIN : '#A82858'} gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
        ))}
      </group>
      {/* Agaves + cempasúchil pots + green clumps */}
      <Agave position={[-1.3, 0, -9.8]} scale={1.3} />
      <Agave position={[8.3, 0, -6.1]} scale={0.9} />
      <CempasuchilPot position={[1.4, 0, -6.4]} />
      <CempasuchilPot position={[-1.0, 0, -6.6]} />
      <CempasuchilPot position={[6.9, 0, -6.0]} />
      <CempasuchilPot position={[3.2, 0, -10.1]} />
      {([[2.2, -9.9, 0.2], [6.3, -10.1, 0.26], [0.5, -9.7, 0.18]] as [number, number, number][]).map(([px, pz, r], i) => (
        <mesh key={i} position={[px, r * 0.9, pz]} scale={[1, 1.2, 1]}>
          <sphereGeometry args={[r, 8, 8]} />
          <meshToonMaterial color={C_LEAF} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      ))}

      {/* ── Wooden bench against the salon facade — back to the wall, seat
          facing the patio ── */}
      <group position={[5.6, 0, -6.45]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.5, 0.06, 0.42]} />
          <meshToonMaterial color={C_WOOD_M} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {[-0.62, 0.62].map(dx => (
          <mesh key={dx} position={[dx, 0.19, 0]}>
            <boxGeometry args={[0.08, 0.38, 0.38]} />
            <meshToonMaterial color={C_WOOD} gradientMap={toonGradient} />
          </mesh>
        ))}
        <mesh position={[0, 0.72, -0.18]} rotation={[-0.15, 0, 0]}>
          <boxGeometry args={[1.5, 0.5, 0.05]} />
          <meshToonMaterial color={C_WOOD_M} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      </group>

      {/* ── Wall lantern near the green door (patio side) ── */}
      <group position={[8.8, 2.1, -5.5]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.05, 0.16, 0.05]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.085, 0.18, 6]} />
          <meshToonMaterial color="#F5D890" emissive="#F0C060" emissiveIntensity={1.0} gradientMap={toonGradient} transparent opacity={0.92} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <coneGeometry args={[0.1, 0.09, 6]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      </group>

      {/* ── String lights (patio lights) ── */}
      <StringLights x={3.5} />
      <StringLights x={8.2} />

      {/* ── Lights: moonlight blue + warm lantern ── */}
      <directionalLight position={[3, 8, -9]} intensity={0.35} color="#8aa4d8" />
      <pointLight position={[8.8, 2.0, -5.9]} intensity={1.1} color="#f8dfa0" distance={5} decay={2} />
      <pointLight position={[4.2, 2.5, -8.3]} intensity={0.5} color="#6a84b8" distance={8} decay={2} />
    </group>
  )
}
