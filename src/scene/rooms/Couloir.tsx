// src/scene/rooms/Couloir.tsx
// Couloir nord-est (x∈[-0.6,7], z∈[6.2,7.6]) — part de la porte du mur en
// pierre de la cuisine et longe l'extérieur du mur nord du salon vers l'est.
// Cul-de-sac à l'est pour l'instant (futures pièces).
import { toonGradient } from '../shared/toonGradient'
import { murAdobeSide, solTomettes } from '../shared/paintedTextures'

const C_CEIL = '#E4D6BC'

// Centre et dimensions
const CX = 3.2
const CZ = 6.9
const CW = 7.6   // x∈[-0.6,7]
const CD = 1.4   // z∈[6.2,7.6]

export function Couloir() {
  return (
    <group>
      {/* ── Sol tomettes ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CX, 0.001, CZ]}>
        <planeGeometry args={[CW, CD]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>
      {/* ── Plafond ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[CX, 2.9, CZ]}>
        <planeGeometry args={[CW, CD]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>
      {/* ── Mur sud z=6.2 (dos du mur nord du salon) ── */}
      <mesh position={[CX, 1.45, 6.2]}>
        <planeGeometry args={[CW, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── Mur nord z=7.6 ── */}
      <mesh position={[CX, 1.45, 7.6]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[CW, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── Bout est x=7 (fermé — futures pièces) ── */}
      <mesh position={[7.0, 1.45, CZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[CD, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>

      {/* ── Lumières tamisées ── */}
      <pointLight position={[0.8, 2.3, CZ]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
      <pointLight position={[5.0, 2.3, CZ]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
    </group>
  )
}
