// src/scene/rooms/Couloir.tsx
// Couloir en L (logique du plan : il dessert les pièces et rejoint l'entrée).
//   branche nord  x∈[-0.6,7]  z∈[6.2,7.6] — part de la porte du mur en pierre
//   branche est   x∈[7,8.4]   z∈[2.0,7.6] — descend vers le zaguán (entrée)
// Débouche dans le zaguán par une ouverture x∈[7.2,8.2] (mur nord du zaguán).
import { toonGradient } from '../shared/toonGradient'
import { murAdobeSide, solTomettes } from '../shared/paintedTextures'

const C_CEIL = '#E4D6BC'

export function Couloir() {
  return (
    <group>
      {/* ── Sols tomettes (2 plans disjoints, jonction à x=7) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.2, 0.001, 6.9]}>
        <planeGeometry args={[7.6, 1.4]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7.7, 0.001, 4.8]}>
        <planeGeometry args={[1.4, 5.6]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>
      {/* ── Plafonds ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[3.2, 2.9, 6.9]}>
        <planeGeometry args={[7.6, 1.4]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[7.7, 2.9, 4.8]}>
        <planeGeometry args={[1.4, 5.6]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>

      {/* ── Branche nord ── */}
      {/* Mur sud z=6.2 (dos du mur nord du salon) — ouvert x∈[3.6,5.4] :
          l'arche 2 du salon débouche dans le couloir */}
      <mesh position={[1.5, 1.45, 6.2]}>
        <planeGeometry args={[4.2, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[6.2, 1.45, 6.2]}>
        <planeGeometry args={[1.6, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[4.5, 2.8, 6.2]}>
        <planeGeometry args={[1.8, 0.2]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Sol de seuil dans l'épaisseur du mur (z∈[5.8,6.2], sous l'arche 2) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.5, 0.001, 6.0]}>
        <planeGeometry args={[1.8, 0.4]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>
      {/* Mur nord z=7.6 — prolongé jusqu'à x=8.4 (coude) */}
      <mesh position={[3.9, 1.45, 7.6]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[9.0, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>

      {/* ── Branche est (vers le zaguán) ── */}
      {/* Mur est x=8.4 */}
      <mesh position={[8.4, 1.45, 4.8]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[5.6, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Mur ouest x=7 (dos du mur est du salon, z∈[2.2,6.2]) */}
      <mesh position={[7.0, 1.45, 4.2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.0, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>

      {/* ── Lumières tamisées ── */}
      <pointLight position={[0.8, 2.3, 6.9]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
      <pointLight position={[5.0, 2.3, 6.9]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
      <pointLight position={[7.7, 2.3, 4.2]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
    </group>
  )
}
