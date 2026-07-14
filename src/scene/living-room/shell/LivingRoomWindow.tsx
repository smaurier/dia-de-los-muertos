// src/scene/living-room/shell/LivingRoomWindow.tsx
// West window: wood frame/sash, reja iron bars, exterior vista diorama,
// curtain panels, sliding sash frames, and the salon-window glass reflector.
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import { WindowVista } from '../WindowVista'
import { CurtainPanel, SashFrame } from './Curtains'
import { GlassReflector } from '../../shared/GlassReflector'
import { NO_PAPEL } from '../../debug/perfFlags'
import {
  C_WOOD_DARK, C_WOOD_MED, C_IRON,
  WINDOW_CZ, REJA_DZ,
} from './livingRoomConstants'

export function LivingRoomWindow() {
  return (
    <group position={[0, 0, WINDOW_CZ]}>
      {/* Exterior diorama in layers (real parallax) — see WindowVista */}
      <WindowVista />
      {/* Frame: stiles + lintel + sill (opening 3.4 × 2.1) */}
      <mesh position={[-6.92, 1.8, 1.75]}>
        <boxGeometry args={[0.1, 2.3, 0.11]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-6.92, 1.8, -1.75]}>
        <boxGeometry args={[0.1, 2.3, 0.11]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-6.92, 2.9, 0]}>
        <boxGeometry args={[0.1, 0.1, 3.6]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-6.90, 0.70, 0]}>
        <boxGeometry args={[0.16, 0.09, 3.66]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
      </mesh>
      {/* ── Sliding window 2 panels (real logic: wood frame, double top/bottom
          rail, inner panel on front groove, outer panel on rear groove,
          central overlap, handle on the meeting stile) ──────────────────────── */}
      {/* Top and bottom rails: base plate + 2 grooves offset in depth */}
      {[0.77, 2.83].map(ry => (
        <group key={ry}>
          <mesh position={[-7.085, ry, 0]}>
            <boxGeometry args={[0.11, 0.04, 3.42]} />
            <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          </mesh>
          {[-7.055, -7.115].map(rx => (
            <mesh key={rx} position={[rx, ry + (ry < 1 ? 0.028 : -0.028), 0]}>
              <boxGeometry args={[0.014, 0.022, 3.42]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            </mesh>
          ))}
        </group>
      ))}
      {/* INNER sliding sash (left, front groove x=-7.055) */}
      <SashFrame x={-7.055} zMin={-1.71} zMax={0.06} />
      {/* OUTER sliding sash (right, rear groove x=-7.115) */}
      <SashFrame x={-7.115} zMin={-0.06} zMax={1.71} />
      {/* Shell handle on the meeting stile of the inner sash */}
      <mesh position={[-7.025, 1.78, 0.01]}>
        <boxGeometry args={[0.022, 0.16, 0.045]} />
        <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        <Outlines thickness={0.006} color="black" />
      </mesh>
      {/* Shared glass pane (mid-depth of both grooves): planar reflection —
          at night the lit interior mirrors in the glass */}
      <mesh position={[-7.085, 1.8, 0]} rotation={[0, Math.PI / 2, 0]} userData={{ reflectorScope: 'salon', reflectorZone: 'salon' }}>
        <planeGeometry args={[3.36, 2.04]} />
        <GlassReflector zone="salon" salonScope resolution={512} />
      </mesh>
      {/* Rejas — wrought iron set into masonry, DEEP in the reveal
          (exterior side, as in reality: the joinery is interior, the
          grille protects from outside). Square bars plunging into sill and
          lintel; flat crossbars embedded in jambs. Forge variation:
          thick master bars alternating with thin bars. */}
      {REJA_DZ.map((dz, ri) => (
        <mesh key={ri} position={[-7.24, 1.8, dz]}>
          <boxGeometry args={ri % 2 === 0 ? [0.026, 2.16, 0.026] : [0.016, 2.16, 0.016]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.006} color="black" />
        </mesh>
      ))}
      {/* 3 flat crossbars (embedded in jambs, real anchoring) */}
      {[1.15, 1.8, 2.45].map(hy => (
        <mesh key={hy} position={[-7.225, hy, 0]}>
          <boxGeometry args={[0.012, 0.04, 3.44]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
      ))}
      {/* Forged collars at crossings of master bars */}
      {REJA_DZ.filter((_, ri) => ri % 2 === 0).flatMap(dz =>
        [1.15, 2.45].map(hy => (
          <mesh key={`${dz}-${hy}`} position={[-7.235, hy, dz]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.026, 0.007, 6, 10]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        ))
      )}
      {/* Lance tips on master bars (protruding past the sill on the exterior —
          signature of forged rejas) */}
      {REJA_DZ.filter((_, ri) => ri % 2 === 0).map(dz => (
        <mesh key={`spike-${dz}`} position={[-7.24, 0.72, dz]}>
          <coneGeometry args={[0.030, 0.09, 4]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
      ))}
      {/* Curtains: pleated animated panels, hung by rings (see CurtainPanel) */}
      {!NO_PAPEL && <CurtainPanel z={2.05} />}
      {!NO_PAPEL && <CurtainPanel z={-2.05} />}
      {/* Turned wood rod */}
      <mesh position={[-6.80, 2.98, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 4.75, 10]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>
      {/* Turned finials: collar + ball */}
      {[-2.42, 2.42].map(dz => (
        <group key={dz}>
          <mesh position={[-6.80, 2.98, dz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.03, 10]} />
            <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[-6.80, 2.98, dz + Math.sign(dz) * 0.055]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
        </group>
      ))}
      {/* Wall brackets: plate screwed to wall + arm + collar around the
          rod — you can see HOW it holds (ref) */}
      {[-2.15, 2.15].map(dz => (
        <group key={dz}>
          <mesh position={[-6.965, 2.90, dz]}>
            <boxGeometry args={[0.025, 0.16, 0.07]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
          <mesh position={[-6.88, 2.94, dz]} rotation={[0, 0, -0.45]}>
            <cylinderGeometry args={[0.014, 0.018, 0.20, 8]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[-6.80, 2.98, dz]}>
            <torusGeometry args={[0.045, 0.011, 8, 14]} />
            <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
