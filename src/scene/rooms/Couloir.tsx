// src/scene/rooms/Couloir.tsx
// Couloir en T (logique du plan : il longe les deux chambres et rejoint l'entrée).
//   branche nord  x∈[-0.6,13.4]  z∈[6.2,7.6] — de la porte du mur en pierre
//     jusqu'au bout de la chambre 2 (cul-de-sac : future salle de bain)
//   branche est   x∈[7.35,8.75]  z∈[2.0,7.6] — descend vers le zaguán (entrée)
//     (décalée : le mur est du salon est épais, x∈[7,7.35])
// Débouche dans le zaguán par une ouverture x∈[7.55,8.55] (mur nord du zaguán).
// Mur nord percé x∈[4.03,4.97] (porte chambre 1, face à l'arche 2) et
// x∈[10.2,11.14] (porte chambre 2, celle des parents).
import * as THREE from 'three'
import { MeshReflectorMaterial, Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { murAdobeSide, solTomettes, boisSombre } from '../shared/paintedTextures'
import { PorteAnimee } from '../shared/PorteAnimee'
import { NO_REFLECT } from '../debug/perfFlags'

const C_CEIL = '#E4D6BC'

export function Couloir() {
  return (
    <group>
      {/* ── Sols tomettes (2 plans disjoints, jonction à x=7.35) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.4, 0.001, 6.9]}>
        <planeGeometry args={[14.0, 1.4]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.05, 0.001, 1.15]}>
        <planeGeometry args={[1.4, 12.9]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>
      {/* ── Plafonds ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[6.4, 2.9, 6.9]}>
        <planeGeometry args={[14.0, 1.4]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[8.05, 2.9, 1.15]}>
        <planeGeometry args={[1.4, 12.9]} />
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

      {/* ── Branche est — traverse le carrefour de l'entrée (z∈[-0.9,0.9]) et
          continue au sud entre le bureau et le salon jusqu'à la porte verte ── */}
      {/* Mur est x=8.75 — percé z∈[2.25,3.19] (porte débarras), ouvert
          z∈[-0.9,0.9] (carrefour), percé z∈[-2.5,-1.56] (porte bureau) */}
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
      {/* Mur ouest x=7.36 (1 cm devant la face est du mur épais du salon —
          évite le z-fighting ; interrompu à l'arche est z∈[-0.9,0.9]) */}
      <mesh position={[7.36, 1.45, 3.55]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5.3, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── LE MIROIR (indice n°1, spec V10 ch3) — sur le mur extérieur du
          salon, dans le couloir qui longe la salle de bain. L'enfant s'y
          reflète. L'adulte, non — mécanique layers à venir (backlog
          « Mirror robuste ») ; pour l'instant c'est un vrai miroir. ── */}
      {/* Grand miroir en pied (portrait) : le verre descend à 12 cm du sol —
          le héros s'y voit en entier, facilement */}
      <group position={[7.38, 0.97, 4.3]} rotation={[0, Math.PI / 2, 0]}>
        {/* Cadre bois mouluré */}
        <mesh position={[0, 0, -0.015]}>
          <boxGeometry args={[0.94, 1.86, 0.04]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {/* Fronton mouluré en haut du cadre */}
        <mesh position={[0, 0.96, -0.005]}>
          <boxGeometry args={[0.66, 0.08, 0.05]} />
          <meshToonMaterial color="#5C3010" gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        {/* Verre : reflet planaire réel */}
        <mesh position={[0, 0, 0.008]}>
          <planeGeometry args={[0.8, 1.7]} />
          {NO_REFLECT ? (
            <meshToonMaterial color="#9FB4C4" gradientMap={toonGradient} />
          ) : (
            <MeshReflectorMaterial
              color="#dfe8ec"
              resolution={512}
              mirror={1}
              mixStrength={1.0}
              mixBlur={0}
              blur={[0, 0]}
              roughness={0.04}
              metalness={0}
              depthScale={0}
              side={THREE.DoubleSide}
            />
          )}
        </mesh>
      </group>
      <mesh position={[7.36, 1.45, -3.1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.4, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Bout sud z=-5.3 : PORTE VERTE (ouvrable — elle mène au patio) */}
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
      {/* Sol de seuil dans l'épaisseur du mur (z∈[-5.6,-5.3], sous la porte) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.05, 0.001, -5.45]}>
        <planeGeometry args={[0.94, 0.3]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>

      {/* ── Lumières tamisées ── */}
      <pointLight position={[0.8, 2.3, 6.9]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
      <pointLight position={[5.0, 2.3, 6.9]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
      <pointLight position={[8.05, 2.3, 4.2]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
      <pointLight position={[11.5, 2.3, 6.9]} intensity={0.8} color="#f0ddb0" distance={5} decay={2} />
    </group>
  )
}
