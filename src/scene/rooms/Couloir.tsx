// src/scene/rooms/Couloir.tsx
// Couloir en T (logique du plan : il longe les deux chambres et rejoint l'entrée).
//   branche nord  x∈[-0.6,13.4]  z∈[6.2,7.6] — de la porte du mur en pierre
//     jusqu'au bout de la chambre 2 (cul-de-sac : future salle de bain)
//   branche est   x∈[7.35,8.75]  z∈[2.0,7.6] — descend vers le zaguán (entrée)
//     (décalée : le mur est du salon est épais, x∈[7,7.35])
// Débouche dans le zaguán par une ouverture x∈[7.55,8.55] (mur nord du zaguán).
// Mur nord percé x∈[4.03,4.97] (porte chambre 1, face à l'arche 2) et
// x∈[10.2,11.14] (porte chambre 2, celle des parents).
import { toonGradient } from '../shared/toonGradient'
import { murAdobeSide, solTomettes } from '../shared/paintedTextures'

const C_CEIL = '#E4D6BC'

export function Couloir() {
  return (
    <group>
      {/* ── Sols tomettes (2 plans disjoints, jonction à x=7.35) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.4, 0.001, 6.9]}>
        <planeGeometry args={[14.0, 1.4]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.05, 0.001, 4.8]}>
        <planeGeometry args={[1.4, 5.6]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>
      {/* ── Plafonds ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[6.4, 2.9, 6.9]}>
        <planeGeometry args={[14.0, 1.4]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[8.05, 2.9, 4.8]}>
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
      <mesh position={[6.375, 1.45, 6.2]}>
        <planeGeometry args={[1.95, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Mur sud du prolongement (z=6.2, x∈[8.75,13.4]), percé x∈[10.2,11.14] :
          porte de la salle de bain, EN FACE de la porte de la chambre 2.
          L'ouverture x∈[7.35,8.75] est le départ de la branche est. */}
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
      {/* Sol de seuil dans l'épaisseur du mur (z∈[5.8,6.2], sous l'arche 2) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.5, 0.001, 6.0]}>
        <planeGeometry args={[1.8, 0.4]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>
      {/* Mur nord z=7.6 — jusqu'au bout x=13.4, percé x∈[4.03,4.97] (porte
          chambre 1, face à l'arche 2) et x∈[10.2,11.14] (porte chambre 2) */}
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
      {/* Linteaux au-dessus des portes (y∈[2.1,2.9]) */}
      <mesh position={[4.5, 2.5, 7.6]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.94, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[10.67, 2.5, 7.6]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.94, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Bout du couloir x=13.4 (cul-de-sac — future salle de bain) */}
      <mesh position={[13.4, 1.45, 6.9]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.4, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>

      {/* ── Branche est (vers le zaguán) ── */}
      {/* Mur est x=8.75 — s'arrête à z=6.2 : au-dessus, le couloir continue
          tout droit (jonction en T) */}
      <mesh position={[8.75, 1.45, 4.1]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[4.2, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Mur ouest x=7.36 (1 cm devant la face est du mur épais du salon —
          évite le z-fighting avec la box ; couvre aussi le coin z∈[5.8,6.2]) */}
      <mesh position={[7.36, 1.45, 4.1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.2, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>

      {/* ── Lumières tamisées ── */}
      <pointLight position={[0.8, 2.3, 6.9]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
      <pointLight position={[5.0, 2.3, 6.9]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
      <pointLight position={[8.05, 2.3, 4.2]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
      <pointLight position={[11.5, 2.3, 6.9]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
    </group>
  )
}
