// src/scene/rooms/kitchen/KitchenAppliances.tsx
// 90s fridge (magnets + school photos) and the sink (basin + dirty dishes + towel).
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import { boisSombre } from '../../shared/paintedTextures'
import { C_IRON } from './kitchenConstants'

export function KitchenAppliances() {
  return (
    <>
      {/* ── 90s fridge (north-west corner): magnets + school photos ── */}
      <group position={[-6.62, 0, 11.3]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.82, 0]}>
          <boxGeometry args={[0.68, 1.64, 0.64]} />
          <meshToonMaterial color="#E4E0D2" gradientMap={toonGradient} />
          <Outlines thickness={0.018} color="black" />
        </mesh>
        {/* Freezer divider + chrome handles */}
        <mesh position={[0, 1.18, 0.325]}>
          <boxGeometry args={[0.66, 0.02, 0.012]} />
          <meshToonMaterial color="#B8B4A8" gradientMap={toonGradient} />
        </mesh>
        {[0.85, 1.32].map(py => (
          <mesh key={py} position={[-0.26, py, 0.335]}>
            <boxGeometry args={[0.035, py > 1 ? 0.18 : 0.3, 0.02]} />
            <meshToonMaterial color="#9A968A" gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        ))}
        {/* Colorful magnets + two school photos with curled corners */}
        {([[0.12, 1.42, '#C0392B'], [-0.05, 1.35, '#27AE60'], [0.2, 1.28, '#F1C40F'], [-0.14, 0.98, '#2980B9'], [0.05, 0.6, '#E67E22']] as [number, number, string][]).map(([dx, py, c], i) => (
          <mesh key={i} position={[dx, py, 0.335]}>
            <cylinderGeometry args={[0.022, 0.022, 0.012, 8]} />
            <meshToonMaterial color={c} gradientMap={toonGradient} />
          </mesh>
        ))}
        {([[0.1, 0.95, 0.12], [-0.08, 0.72, -0.2]] as [number, number, number][]).map(([dx, py, rot], i) => (
          <mesh key={i} position={[dx, py, 0.333]} rotation={[0, 0, rot]}>
            <planeGeometry args={[0.09, 0.12]} />
            <meshToonMaterial color="#D8D2C0" gradientMap={toonGradient} />
          </mesh>
        ))}
      </group>

      {/* ── Sink under the wall shelf: basin + dirty dishes + towel ── */}
      <group position={[-4.0, 0, 11.68]}>
        {/* Wood cabinet + countertop */}
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[1.1, 0.84, 0.56]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0, 0.865, 0]}>
          <boxGeometry args={[1.16, 0.05, 0.6]} />
          <meshToonMaterial color="#D8D2C2" gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {/* Recessed basin + gooseneck tap */}
        <mesh position={[-0.2, 0.895, 0]}>
          <boxGeometry args={[0.44, 0.02, 0.4]} />
          <meshToonMaterial color="#8A929A" gradientMap={toonGradient} />
        </mesh>
        <mesh position={[-0.2, 0.98, -0.2]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.26, 6]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
        {/* Unstable stack of dirty dishes */}
        {[0, 1, 2, 3].map(i => (
          <mesh key={i} position={[0.28 + (i % 2) * 0.025, 0.9 + i * 0.028, (i % 2) * 0.02]} rotation={[0.05 * (i % 2), i * 0.4, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.014, 10]} />
            <meshToonMaterial color={['#E8E0D0', '#D8CDB8', '#E0D8C4', '#CFC8B4'][i]} gradientMap={toonGradient} />
            <Outlines thickness={0.006} color="black" />
          </mesh>
        ))}
        <mesh position={[0.28, 1.02, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.08, 8]} />
          <meshToonMaterial color="#C07040" gradientMap={toonGradient} />
        </mesh>
        {/* Towel over the edge */}
        <mesh position={[0.54, 0.78, 0.1]} rotation={[0, 0, 0.06]}>
          <boxGeometry args={[0.04, 0.3, 0.22]} />
          <meshToonMaterial color="#B05038" gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      </group>
    </>
  )
}
