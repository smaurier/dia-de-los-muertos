// src/scene/living-room/FrontDoor.tsx
// Main house door — centrepiece of the zaguán.
// Mexican colonial door: two solid-wood panelled leaves with
// forged-nail (clavo) diamond pattern, strap hinges and ring knockers,
// cantera (cream carved stone) frame, fanlight with wrought-iron bars
// through which street light enters, worn stone threshold,
// farol (wrought-iron lantern) hanging from the entry-corridor ceiling.
// World coordinates: east wall x=10, opening z∈[-0.9,0.9].
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { boisSombre } from '../shared/paintedTextures'

const C_IRON     = '#1A1512'
const C_WOOD_DK  = '#3E2008'
const C_PANEL    = '#6E3A14'
const C_CANTERA  = '#C9B8A2'
const C_CANTERA2 = '#B8A288'
const C_GLOW     = '#F0C060'

// One door leaf — VIEWED FROM INSIDE the house: the visible face is the
// structure (vertical planks, rails, forged strap hinges, pintles). Clavos,
// knockers and moulded panels are the street-side decoration — on the east
// face (x+), invisible from here but consistent if the door ever opens.
// side=+1: north leaf (z>0), hinge side on north jamb. side=-1: mirror.
function DoorLeaf({ side }: { side: 1 | -1 }) {
  const zc = side * 0.45 // leaf center (z from ±0.02 to ±0.88)
  return (
    <group position={[9.94, 0, zc]}>
      {/* Main panel — 0.90: flush at center (z=0), meets jamb (±0.9). No gap between leaves. */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.1, 2.1, 0.9]} />
        <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
        <Outlines thickness={0.016} color="black" />
      </mesh>
      {/* ── Interior face (-x, the visible side): structure ── */}
      {/* Vertical plank grooves */}
      {[-0.28, -0.09, 0.09, 0.28].map(dz => (
        <mesh key={dz} position={[-0.052, 1.1, dz]}>
          <boxGeometry args={[0.008, 2.02, 0.018]} />
          <meshToonMaterial color={C_WOOD_DK} gradientMap={toonGradient} />
        </mesh>
      ))}
      {/* Bottom, mid, and top rails */}
      {[0.36, 1.13, 1.92].map(py => (
        <mesh key={py} position={[-0.065, py, 0]}>
          <boxGeometry args={[0.03, 0.16, 0.78]} />
          <meshToonMaterial color={C_PANEL} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      ))}
      {/* Forged strap hinges on bottom and top rails, anchored on hinge side */}
      {[0.36, 1.92].map(py => (
        <group key={py}>
          <mesh position={[-0.085, py, side * 0.16]}>
            <boxGeometry args={[0.012, 0.06, 0.54]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            <Outlines thickness={0.006} color="black" />
          </mesh>
          {/* Teardrop end */}
          <mesh position={[-0.085, py, side * -0.13]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 0.012, 6]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}
      {/* Interior iron handle (near center stile) */}
      <mesh position={[-0.08, 1.15, side * -0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.045, 0.011, 6, 12, Math.PI]} />
        <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        <Outlines thickness={0.006} color="black" />
      </mesh>
      {/* Visible pintles on hinge side */}
      {[0.45, 1.8].map(py => (
        <mesh key={py} position={[-0.02, py, side * 0.42]}>
          <cylinderGeometry args={[0.022, 0.022, 0.12, 6]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
      ))}
      {/* ── Street face (+x, invisible from here): raised panels + clavos + knocker ── */}
      {[[1.62, 0.72], [0.68, 0.62]].map(([py, ph], i) => (
        <mesh key={i} position={[0.058, py, 0]}>
          <boxGeometry args={[0.025, ph, 0.62]} />
          <meshToonMaterial color={C_PANEL} gradientMap={toonGradient} />
        </mesh>
      ))}
      {[0.35, 0.78, 1.21, 1.64, 2.0].flatMap(py =>
        [-0.33, 0.33].map(dz => (
          <mesh key={`${py}-${dz}`} position={[0.085, py, dz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.03, 0.025, 6]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        ))
      )}
      <group position={[0.08, 1.35, side * -0.28]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.05, 0.02, 8]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
        <mesh position={[0.03, -0.05, 0]} rotation={[0, 0.3, 0]}>
          <torusGeometry args={[0.05, 0.011, 6, 14]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
      </group>
    </group>
  )
}

// Farol flame: gentle flicker (candle sheltered behind glass).
function FarolFlame() {
  const lightRef = useRef<THREE.PointLight>(null)
  const t = useRef(0)
  useFrame((_, delta) => {
    t.current += delta
    if (lightRef.current) {
      lightRef.current.intensity =
        1.3 + 0.12 * Math.sin(t.current * 7.3) * Math.sin(t.current * 3.1)
    }
  })
  return <pointLight ref={lightRef} position={[9.2, 1.95, 0]} intensity={1.3} color="#f8dfa0" distance={5} decay={2} />
}

export function FrontDoor() {
  return (
    <group>
      {/* ── Worn stone threshold (extends into corridor) ── */}
      <mesh position={[9.85, 0.025, 0]}>
        <boxGeometry args={[0.45, 0.05, 2.0]} />
        <meshToonMaterial color={C_CANTERA2} gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>

      {/* ── Cantera frame: carved jambs + plinths ── */}
      {[-0.99, 0.99].map(pz => (
        <group key={pz}>
          <mesh position={[9.9, 1.3, pz]}>
            <boxGeometry args={[0.26, 2.6, 0.22]} />
            <meshToonMaterial color={C_CANTERA} gradientMap={toonGradient} />
            <Outlines thickness={0.014} color="black" />
          </mesh>
          {/* Jamb plinth and capital */}
          <mesh position={[9.88, 0.16, pz]}>
            <boxGeometry args={[0.32, 0.32, 0.28]} />
            <meshToonMaterial color={C_CANTERA2} gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
          <mesh position={[9.88, 2.52, pz]}>
            <boxGeometry args={[0.32, 0.16, 0.28]} />
            <meshToonMaterial color={C_CANTERA2} gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
          {/* Decorative flute */}
          <mesh position={[9.86, 1.3, pz]}>
            <boxGeometry args={[0.02, 2.1, 0.06]} />
            <meshToonMaterial color={C_CANTERA2} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}
      {/* Moulded cornice above fanlight */}
      <mesh position={[9.88, 2.68, 0]}>
        <boxGeometry args={[0.3, 0.14, 2.42]} />
        <meshToonMaterial color={C_CANTERA} gradientMap={toonGradient} />
        <Outlines thickness={0.014} color="black" />
      </mesh>
      <mesh position={[9.86, 2.585, 0]}>
        <boxGeometry args={[0.28, 0.05, 2.3]} />
        <meshToonMaterial color={C_CANTERA2} gradientMap={toonGradient} />
      </mesh>
      {/* Carved keystone at cornice center */}
      <mesh position={[9.85, 2.68, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.18]} />
        <meshToonMaterial color={C_CANTERA2} gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>

      {/* ── Wood rail between leaves and fanlight ── */}
      <mesh position={[9.94, 2.18, 0]}>
        <boxGeometry args={[0.12, 0.12, 1.8]} />
        <meshToonMaterial color={C_WOOD_DK} gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>

      {/* ── SOLID fanlight: moulded wood panel (glazing was too small to read — closed, no bars) ── */}
      <mesh position={[9.94, 2.42, 0]}>
        <boxGeometry args={[0.1, 0.4, 1.8]} />
        <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      {/* Three raised moulded panels */}
      {[-0.58, 0, 0.58].map(pz => (
        <mesh key={pz} position={[9.885, 2.42, pz]}>
          <boxGeometry args={[0.02, 0.26, 0.42]} />
          <meshToonMaterial color={C_PANEL} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      ))}

      {/* ── The two door leaves ── */}
      <DoorLeaf side={1} />
      <DoorLeaf side={-1} />

      {/* ── Astragal: wood bead covering center joint ── */}
      <mesh position={[9.94, 1.1, 0]}>
        <boxGeometry args={[0.13, 2.06, 0.09]} />
        <meshToonMaterial color={C_WOOD_DK} gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>

      {/* ── Center bolt: forged flush bolt between the two knockers ── */}
      <mesh position={[9.87, 1.08, 0]}>
        <boxGeometry args={[0.03, 0.16, 0.1]} />
        <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        <Outlines thickness={0.008} color="black" />
      </mesh>

      {/* ── Farol: hexagonal wrought-iron lantern suspended from ceiling ── */}
      <group position={[9.2, 0, 0]}>
        <mesh position={[0, 2.76, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.28, 6]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
        {/* Cap + glazed body + base */}
        <mesh position={[0, 2.58, 0]}>
          <coneGeometry args={[0.14, 0.12, 6]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        <mesh position={[0, 2.4, 0]}>
          <cylinderGeometry args={[0.1, 0.115, 0.26, 6]} />
          <meshToonMaterial
            color="#F5D890"
            emissive={C_GLOW}
            emissiveIntensity={1.1}
            gradientMap={toonGradient}
            transparent
            opacity={0.92}
          />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        {/* Body uprights */}
        {Array.from({ length: 6 }, (_, i) => (i * Math.PI) / 3).map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 0.105, 2.4, Math.sin(a) * 0.105]}>
            <boxGeometry args={[0.014, 0.26, 0.014]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        ))}
        <mesh position={[0, 2.26, 0]}>
          <cylinderGeometry args={[0.12, 0.08, 0.05, 6]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      </group>
      <FarolFlame />
    </group>
  )
}
