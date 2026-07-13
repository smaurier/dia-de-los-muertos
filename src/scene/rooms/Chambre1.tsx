// src/scene/rooms/Chambre1.tsx
// Chambre des enfants — Emilio + Sofía (sa sœur, spec V10 : « une sœur »).
// x∈[-0.6,7], z∈[7.6,12] (4.4 m de profondeur, alignée sur le fond de la
// cuisine). Porte sur le couloir x∈[4.03,4.97], EN FACE de l'arche 2 du salon.
// Mur ouest = le mur en pierre de la cuisine (DoubleSide, vestige de la
// construction d'origine — visible des deux côtés, aucun mesh à ajouter).
// Pièce vide pendant la fête : pénombre, veilleuse, clair de lune.
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { murAdobeSide, solTomettes, boisSombre } from '../shared/paintedTextures'
import { PorteAnimee } from '../shared/PorteAnimee'
import { PhotoFrame } from '../shared/PhotoFrame'

const C_CEIL       = '#E4D6BC'
const C_WOOD_DARK  = '#3A2008'
const C_WOOD_MED   = '#5C3010'
const C_IRON       = '#1A1512'
const C_NIGHT      = '#16223E'

// Lit d'enfant : cadre bois, matelas, oreiller, couverture sarape rayée.
// Tête au nord (z+), empreinte 0.9 × 1.8.
function LitEnfant({ x, colors }: { x: number; colors: [string, string, string] }) {
  return (
    <group position={[x, 0, 11.0]}>
      {/* Cadre */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.9, 0.16, 1.8]} />
        <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
        <Outlines thickness={0.016} color="black" />
      </mesh>
      {/* Tête de lit (contre le mur nord) */}
      <mesh position={[0, 0.62, 0.87]}>
        <boxGeometry args={[0.9, 0.64, 0.06]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
        <Outlines thickness={0.014} color="black" />
      </mesh>
      {/* 4 pieds */}
      {([-0.4, 0.4] as number[]).flatMap(px =>
        ([-0.84, 0.84] as number[]).map((pz, j) => (
          <mesh key={`${px}-${j}`} position={[px, 0.11, pz]}>
            <cylinderGeometry args={[0.032, 0.038, 0.22, 6]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
        ))
      )}
      {/* Matelas */}
      <mesh position={[0, 0.43, 0]}>
        <boxGeometry args={[0.82, 0.14, 1.7]} />
        <meshToonMaterial color="#E8E0D0" gradientMap={toonGradient} />
        <Outlines thickness={0.014} color="black" />
      </mesh>
      {/* Oreiller */}
      <mesh position={[0, 0.53, 0.62]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.56, 0.1, 0.34]} />
        <meshToonMaterial color="#F2ECDC" gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      {/* Couverture sarape : drap principal + 2 rayures */}
      <mesh position={[0, 0.505, -0.32]}>
        <boxGeometry args={[0.86, 0.05, 1.06]} />
        <meshToonMaterial color={colors[0]} gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      {[-0.12, 0.22].map((dz, i) => (
        <mesh key={i} position={[0, 0.532, -0.32 + dz]}>
          <boxGeometry args={[0.86, 0.008, 0.12]} />
          <meshToonMaterial color={colors[1 + i]} gradientMap={toonGradient} />
        </mesh>
      ))}
      {/* Retombée de la couverture (côtés) */}
      {[-0.44, 0.44].map((dx, i) => (
        <mesh key={i} position={[dx, 0.38, -0.32]}>
          <boxGeometry args={[0.03, 0.22, 1.06]} />
          <meshToonMaterial color={colors[0]} gradientMap={toonGradient} />
        </mesh>
      ))}
    </group>
  )
}

export function Chambre1() {
  return (
    <group>
      {/* ── Sol tomettes ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.2, 0.001, 9.8]}>
        <planeGeometry args={[7.6, 4.4]} />
        <meshPhongMaterial map={solTomettes} shininess={20} />
      </mesh>
      {/* ── Plafond ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[3.2, 2.9, 9.8]}>
        <planeGeometry args={[7.6, 4.4]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>

      {/* ── Mur sud z=7.75 (face chambre du mur du couloir), percé porte
          x∈[4.03,4.97] ── */}
      <mesh position={[1.715, 1.45, 7.75]}>
        <planeGeometry args={[4.63, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[5.985, 1.45, 7.75]}>
        <planeGeometry args={[2.03, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[4.5, 2.5, 7.75]}>
        <planeGeometry args={[0.94, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Porte OUVRABLE (touche F) — gond à l'ouest, ouvre vers la chambre */}
      <PorteAnimee id="chambre-1" position={[4.03, 0, 7.67]} rotationY={Math.PI / 2} openAngle={-1.9} width={0.94} />
      {/* Encadrement bois (plaqué des deux côtés du mur) */}
      {[4.0, 5.0].map(px => (
        <mesh key={px} position={[px, 1.05, 7.67]}>
          <boxGeometry args={[0.08, 2.1, 0.22]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      ))}
      <mesh position={[4.5, 2.12, 7.67]}>
        <boxGeometry args={[1.08, 0.08, 0.22]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>

      {/* ── Mur nord z=12, percé fenêtre x∈[2.2,3.8] y∈[1.0,2.2] ── */}
      <mesh position={[0.8, 1.45, 12]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.8, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[5.4, 1.45, 12]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[3.2, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[3.0, 2.55, 12]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.6, 0.7]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[3.0, 0.5, 12]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.6, 1.0]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Fenêtre : nuit bleue + encadrement + rejas (comme le salon, simple) */}
      <mesh position={[3.0, 1.6, 12.12]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.7, 1.3]} />
        <meshToonMaterial color={C_NIGHT} emissive="#24365E" emissiveIntensity={0.35} gradientMap={toonGradient} />
      </mesh>
      {[2.2, 3.8].map(px => (
        <mesh key={px} position={[px, 1.6, 11.97]}>
          <boxGeometry args={[0.08, 1.36, 0.1]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
      ))}
      {[1.0, 2.2].map(py => (
        <mesh key={py} position={[3.0, py, 11.97]}>
          <boxGeometry args={[1.68, 0.08, 0.1]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
      ))}
      {[2.5, 2.85, 3.15, 3.5].map(px => (
        <mesh key={px} position={[px, 1.6, 12.06]}>
          <boxGeometry args={[0.022, 1.2, 0.022]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.006} color="black" />
        </mesh>
      ))}

      {/* ── Mur est x=7 ── */}
      <mesh position={[7, 1.45, 9.8]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[4.4, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>

      {/* ── Les deux lits — Emilio (ouest) et Sofía (est), fenêtre entre les deux ── */}
      <LitEnfant x={1.3} colors={['#B05038', '#E8940A', '#27AE60']} />
      <LitEnfant x={5.0} colors={['#7A4C9E', '#E45B8F', '#F1C40F']} />

      {/* ── Tapis tissé entre les lits ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.15, 0.012, 10.3]}>
        <planeGeometry args={[1.6, 2.2]} />
        <meshToonMaterial color="#7A4226" gradientMap={toonGradient} />
      </mesh>
      {[-0.85, -0.5, 0.5, 0.85].map((dz, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[3.15, 0.014, 10.3 + dz]}>
          <planeGeometry args={[1.6, 0.1]} />
          <meshToonMaterial color={i % 2 ? '#B05038' : '#C8893A'} gradientMap={toonGradient} />
        </mesh>
      ))}

      {/* ── Table de chevet partagée sous la fenêtre + veilleuse ── */}
      <group position={[3.15, 0, 11.7]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.36]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {/* Veilleuse : petit dôme chaud */}
        <mesh position={[0, 0.63, 0]}>
          <sphereGeometry args={[0.07, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshToonMaterial color="#F5D8A0" emissive="#F0B860" emissiveIntensity={0.9} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      </group>

      {/* ── Armoire contre le mur est ── */}
      <group position={[6.68, 0, 9.1]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[1.2, 2.0, 0.55]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.020} color="black" />
        </mesh>
        {/* Trait central des deux portes + boutons */}
        <mesh position={[0, 1.0, 0.28]}>
          <boxGeometry args={[0.015, 1.86, 0.012]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
        {[-0.07, 0.07].map(dx => (
          <mesh key={dx} position={[dx, 1.0, 0.29]}>
            <sphereGeometry args={[0.022, 6, 6]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        ))}
        {/* Corniche + pieds */}
        <mesh position={[0, 2.04, 0]}>
          <boxGeometry args={[1.3, 0.08, 0.62]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
        {([-0.52, 0.52] as number[]).flatMap(px =>
          ([-0.22, 0.22] as number[]).map((pz, j) => (
            <mesh key={`${px}-${j}`} position={[px, 0.05, pz]}>
              <boxGeometry args={[0.08, 0.1, 0.08]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            </mesh>
          ))
        )}
      </group>

      {/* ── Coffre à jouets contre le mur sud, juste à l'est de la porte
          (hors de l'arc du battant, qui balaye jusqu'à x≈4.97) ── */}
      <group position={[5.55, 0, 8.12]}>
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[0.9, 0.52, 0.48]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0, 0.54, -0.02]} rotation={[0.12, 0, 0]}>
          <boxGeometry args={[0.94, 0.06, 0.52]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      </group>

      {/* ── Jouets au sol (près du coffre : une balle, des cubes) ── */}
      <mesh position={[5.35, 0.09, 8.7]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshToonMaterial color="#C0392B" gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>
      <mesh position={[5.35, 0.135, 8.7]} rotation={[0.4, 0.3, 0]}>
        <sphereGeometry args={[0.091, 10, 10, 0, Math.PI * 2, 0, Math.PI / 3]} />
        <meshToonMaterial color="#F1C40F" gradientMap={toonGradient} />
      </mesh>
      {([[5.8, 8.9, 0.2], [5.95, 8.78, -0.5], [5.72, 8.66, 0.9]] as [number, number, number][]).map(([px, pz, rot], i) => (
        <mesh key={i} position={[px, 0.055, pz]} rotation={[0, rot, 0]}>
          <boxGeometry args={[0.11, 0.11, 0.11]} />
          <meshToonMaterial color={['#2980B9', '#27AE60', '#E67E22'][i]} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      ))}

      {/* ── Chaussures au pied des lits ── */}
      {([[0.95, 9.95], [1.2, 9.9], [4.75, 9.92], [5.0, 9.96]] as [number, number][]).map(([px, pz], i) => (
        <mesh key={i} position={[px, 0.04, pz]} rotation={[0, (i * 1.3) % 1 - 0.5, 0]}>
          <boxGeometry args={[0.09, 0.07, 0.2]} />
          <meshToonMaterial color={i < 2 ? '#2A3550' : '#6E2A3A'} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      ))}

      {/* ── Murs : croix au-dessus de la fenêtre, cadres (dessins d'enfants) ── */}
      {/* (mur le long de x → la traverse s'étend en x, pas en z) */}
      <mesh position={[3.0, 2.55, 11.96]}>
        <boxGeometry args={[0.05, 0.34, 0.04]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>
      <mesh position={[3.0, 2.62, 11.96]}>
        <boxGeometry args={[0.2, 0.06, 0.04]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
      </mesh>
      <PhotoFrame position={[6.97, 1.9, 10.9]} rotY={-Math.PI / 2} />
      {/* Dessins d'enfants punaisés (papier + gribouillis de couleur) */}
      {([[1.5, 1.85, '#E8940A'], [2.1, 1.7, '#27AE60'], [5.6, 1.8, '#2980B9']] as [number, number, string][]).map(([px, py, c], i) => (
        <group key={i} position={[px, py, 7.77]} rotation={[0, 0, (i - 1) * 0.06]}>
          <mesh>
            <planeGeometry args={[0.24, 0.3]} />
            <meshToonMaterial color="#F2EDDF" gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, -0.02, 0.002]}>
            <circleGeometry args={[0.07, 8]} />
            <meshToonMaterial color={c} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 0.09, 0.002]}>
            <planeGeometry args={[0.16, 0.03]} />
            <meshToonMaterial color="#C0392B" gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}

      {/* ── Lumières : pénombre — veilleuse chaude, clair de lune, rattrapage
          du mur en pierre (leçon cuisine : sans appoint il tombe dans la bande
          toon la plus sombre) ── */}
      <pointLight position={[3.15, 0.9, 11.4]} intensity={1.0} color="#f5c87a" distance={4.5} decay={2} />
      <pointLight position={[3.0, 1.9, 11.3]} intensity={0.7} color="#8aa4d8" distance={5} decay={2} />
      <pointLight position={[0.4, 1.6, 9.4]} intensity={0.6} color="#e8bd80" distance={4} decay={2} />
    </group>
  )
}
