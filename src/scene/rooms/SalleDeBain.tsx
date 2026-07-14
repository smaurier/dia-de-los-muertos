// src/scene/rooms/SalleDeBain.tsx
// Salle de bain + WC — au sud du prolongement du couloir, porte EN FACE de
// celle de la chambre 2 (x∈[10.2,11.14]). Mitoyenne de la branche est du
// couloir (mur ouest x∈[8.75,8.9]). Intérieur x∈[8.9,11.9], z∈[3.4,6.2].
// Années 90 : soubassement d'azulejos talavera, baignoire, lavabo colonne,
// petit miroir banal (LE miroir narratif reste celui du couloir, ch3).
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { murAdobeSide, azulejosTalavera } from '../shared/paintedTextures'
import { PorteAnimee } from '../shared/PorteAnimee'

const C_CEIL    = '#E4D6BC'
const C_WOOD    = '#3A2008'
const C_CERAM   = '#EDE8DC'   // céramique sanitaire
const C_TILE    = '#D8D2C2'   // sol carrelé clair
const C_IRON    = '#1A1512'
const C_NIGHT   = '#16223E'

export function SalleDeBain() {
  return (
    <group>
      {/* ── Sol carrelé clair ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10.4, 0.001, 4.8]}>
        <planeGeometry args={[3.0, 2.8]} />
        <meshToonMaterial color={C_TILE} gradientMap={toonGradient} />
      </mesh>
      {/* ── Plafond ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[10.4, 2.9, 4.8]}>
        <planeGeometry args={[3.0, 2.8]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>

      {/* ── Mur nord z=6.05 (face intérieure du mur du couloir), percé porte ── */}
      <mesh position={[9.475, 1.45, 6.05]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.45, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[11.52, 1.45, 6.05]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.76, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[10.67, 2.5, 6.05]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.94, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Porte OUVRABLE (touche F) — ouvre vers l'intérieur (sud) */}
      <PorteAnimee id="salle-de-bain" position={[10.2, 0, 6.13]} rotationY={Math.PI / 2} openAngle={1.9} width={0.94} />
      {/* Encadrement bois */}
      {[10.17, 11.17].map(px => (
        <mesh key={px} position={[px, 1.05, 6.13]}>
          <boxGeometry args={[0.08, 2.1, 0.22]} />
          <meshToonMaterial color={C_WOOD} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      ))}
      <mesh position={[10.67, 2.12, 6.13]}>
        <boxGeometry args={[1.08, 0.08, 0.22]} />
        <meshToonMaterial color={C_WOOD} gradientMap={toonGradient} />
      </mesh>

      {/* ── Mur ouest x=8.9 (face intérieure, mitoyen branche est du couloir) ── */}
      <mesh position={[8.9, 1.45, 4.8]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.8, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── Mur est x=11.9 ── */}
      <mesh position={[11.9, 1.45, 4.8]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.8, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── Mur sud z=3.4, petite fenêtre haute x∈[9.9,10.7] y∈[2.0,2.5] ── */}
      <mesh position={[9.4, 1.45, 3.4]}>
        <planeGeometry args={[1.0, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[11.3, 1.45, 3.4]}>
        <planeGeometry args={[1.2, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[10.3, 2.7, 3.4]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[10.3, 1.0, 3.4]}>
        <planeGeometry args={[0.8, 2.0]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Fenêtre haute : nuit + petit encadrement + 2 barreaux */}
      <mesh position={[10.3, 2.25, 3.3]}>
        <planeGeometry args={[0.84, 0.54]} />
        <meshToonMaterial color={C_NIGHT} emissive="#24365E" emissiveIntensity={0.35} gradientMap={toonGradient} />
      </mesh>
      {[9.9, 10.7].map(px => (
        <mesh key={px} position={[px, 2.25, 3.42]}>
          <boxGeometry args={[0.06, 0.56, 0.08]} />
          <meshToonMaterial color={C_WOOD} gradientMap={toonGradient} />
        </mesh>
      ))}
      {[2.0, 2.5].map(py => (
        <mesh key={py} position={[10.3, py, 3.42]}>
          <boxGeometry args={[0.86, 0.06, 0.08]} />
          <meshToonMaterial color={C_WOOD} gradientMap={toonGradient} />
        </mesh>
      ))}
      {[10.15, 10.45].map(px => (
        <mesh key={px} position={[px, 2.25, 3.36]}>
          <boxGeometry args={[0.018, 0.46, 0.018]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
      ))}

      {/* ── Soubassement d'azulejos talavera (h=1.15, plaqué sur les 4 murs) ── */}
      <mesh position={[10.4, 0.575, 6.04]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[3.0, 1.15]} />
        <meshToonMaterial map={azulejosTalavera} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[10.4, 0.575, 3.41]}>
        <planeGeometry args={[3.0, 1.15]} />
        <meshToonMaterial map={azulejosTalavera} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[8.91, 0.575, 4.8]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.8, 1.15]} />
        <meshToonMaterial map={azulejosTalavera} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[11.89, 0.575, 4.8]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.8, 1.15]} />
        <meshToonMaterial map={azulejosTalavera} gradientMap={toonGradient} />
      </mesh>
      {/* Liseré bois en haut du soubassement */}
      {([[10.4, 6.02, 3.0, 0], [10.4, 3.43, 3.0, 0], [8.93, 4.8, 2.8, 1], [11.87, 4.8, 2.8, 1]] as [number, number, number, number][]).map(([px, pz, w, vert], i) => (
        <mesh key={i} position={[px, 1.16, pz]}>
          <boxGeometry args={vert ? [0.03, 0.05, w] : [w, 0.05, 0.03]} />
          <meshToonMaterial color={C_WOOD} gradientMap={toonGradient} />
        </mesh>
      ))}

      {/* ── Baignoire contre le mur sud ── */}
      <group position={[10.3, 0, 3.95]}>
        {/* Cuve : coque extérieure + rebord + intérieur creusé (simplifié) */}
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[1.5, 0.56, 0.7]} />
          <meshToonMaterial color={C_CERAM} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0, 0.565, 0]}>
          <boxGeometry args={[1.56, 0.05, 0.76]} />
          <meshToonMaterial color={C_CERAM} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        <mesh position={[0, 0.575, 0]}>
          <boxGeometry args={[1.34, 0.03, 0.54]} />
          <meshToonMaterial color="#C9C2B2" gradientMap={toonGradient} />
        </mesh>
        {/* Robinetterie côté est */}
        <mesh position={[0.62, 0.66, 0]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.02, 0.02, 0.18, 6]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
        {[-0.1, 0.1].map(dz => (
          <mesh key={dz} position={[0.66, 0.62, dz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.02, 8]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        ))}
      </group>

      {/* ── WC contre le mur ouest ── */}
      <group position={[9.28, 0, 5.35]} rotation={[0, Math.PI / 2, 0]}>
        {/* Cuvette + abattant + réservoir */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.19, 0.14, 0.4, 10]} />
          <meshToonMaterial color={C_CERAM} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.04, 10]} />
          <meshToonMaterial color={C_CERAM} gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        <mesh position={[0, 0.62, -0.26]}>
          <boxGeometry args={[0.42, 0.5, 0.16]} />
          <meshToonMaterial color={C_CERAM} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        <mesh position={[0.12, 0.89, -0.26]}>
          <boxGeometry args={[0.07, 0.03, 0.07]} />
          <meshToonMaterial color={C_CERAM} gradientMap={toonGradient} />
        </mesh>
      </group>

      {/* ── Lavabo colonne + petit miroir (banal) contre le mur est ── */}
      <group position={[11.62, 0, 5.0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.09, 0.12, 0.84, 8]} />
          <meshToonMaterial color={C_CERAM} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        <mesh position={[0, 0.86, 0]}>
          <cylinderGeometry args={[0.26, 0.20, 0.12, 10]} />
          <meshToonMaterial color={C_CERAM} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {/* Robinet */}
        <mesh position={[0, 0.96, -0.18]} rotation={[0.6, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.14, 6]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
        {/* Verre à dents */}
        <mesh position={[0.2, 0.945, -0.1]}>
          <cylinderGeometry args={[0.032, 0.026, 0.09, 8]} />
          <meshToonMaterial color="#C8E0F0" gradientMap={toonGradient} />
        </mesh>
      </group>
      {/* Petit miroir rectangulaire au-dessus du lavabo (objet banal — aucun
          rôle narratif : le miroir du jeu est celui du couloir) */}
      <group position={[11.88, 1.62, 5.0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[0.5, 0.64, 0.03]} />
          <meshToonMaterial color={C_WOOD} gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        <mesh position={[0, 0, 0.018]}>
          <planeGeometry args={[0.42, 0.56]} />
          <meshToonMaterial color="#9FB4C4" emissive="#5A7080" emissiveIntensity={0.25} gradientMap={toonGradient} />
        </mesh>
      </group>

      {/* ── Porte-serviettes (mur ouest, près de la baignoire) + serviettes ── */}
      <mesh position={[8.95, 1.35, 4.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.7, 6]} />
        <meshToonMaterial color={C_WOOD} gradientMap={toonGradient} />
        <Outlines thickness={0.008} color="black" />
      </mesh>
      {[[4.55, '#B05038'], [4.2, '#27547A']].map(([dz, c], i) => (
        <mesh key={i} position={[8.99, 1.08, dz as number]}>
          <boxGeometry args={[0.035, 0.52, 0.26]} />
          <meshToonMaterial color={c as string} gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
      ))}

      {/* ── Tapis de bain + panier à linge ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10.3, 0.012, 4.65]}>
        <planeGeometry args={[1.0, 0.5]} />
        <meshToonMaterial color="#C8893A" gradientMap={toonGradient} />
      </mesh>
      <group position={[11.55, 0, 3.8]}>
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.2, 0.16, 0.52, 9]} />
          <meshToonMaterial color="#B08850" gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        <mesh position={[0.03, 0.53, 0.02]}>
          <sphereGeometry args={[0.13, 8, 8]} />
          <meshToonMaterial color="#E8E0D0" gradientMap={toonGradient} />
        </mesh>
      </group>

      {/* ── Lumière : ampoule nue faible, chaude ── */}
      <pointLight position={[10.4, 2.4, 4.8]} intensity={1.1} color="#f5e3b0" distance={4.5} decay={2} />
      <mesh position={[10.4, 2.62, 4.8]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshToonMaterial color="#F5E8C0" emissive="#F0D890" emissiveIntensity={1.4} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[10.4, 2.78, 4.8]}>
        <cylinderGeometry args={[0.008, 0.008, 0.26, 4]} />
        <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
      </mesh>
    </group>
  )
}
