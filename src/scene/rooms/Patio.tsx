// src/scene/rooms/Patio.tsx
// Le patio (ch8 — l'ofrenda). Cour nocturne à ciel ouvert derrière la porte
// verte, au sud de la maison. x∈[-2,9.0], z∈[-10.6,-5.6].
// La façade nord = les murs sud du salon et du couloir, vus de dehors.
// Enceinte adobe basse (2,6 m) avec chaperon. Bassin ovale au centre.
// L'ofrenda est contre le MUR OUEST — loin de la porte : trop loin pour
// être lue avant le ch8 (anti-spoiler, spec house-rooms). État ch1-2 :
// préparée, pas chargée, bougies éteintes.
// À l'est (x=9.0) : le mur mitoyen du garage, percé d'une arche avec une
// porte en bois ouvrable.
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { murAdobeSide } from '../shared/paintedTextures'
import { PorteAnimee } from '../shared/PorteAnimee'

const C_IRON    = '#1A1512'
const C_WOOD    = '#3A2008'
const C_WOOD_M  = '#5C3010'
const C_SOL     = '#6E5A44'   // terre battue
const C_DALLE   = '#8A7A66'   // dalles de pierre
const C_POT     = '#B06830'
const C_CEMPA   = '#E8940A'   // cempasúchil
const C_CEMPA2  = '#D97E08'
const C_LEAF    = '#3E7C3A'
const C_AGAVE   = '#5A8A6E'
const C_BOUGAIN = '#C0356E'   // bougainvillier
const C_CANDLE  = '#F5E8D0'

// Touffe de cempasúchil dans un pot en terre cuite.
function PotCempasuchil({ position }: { position: [number, number, number] }) {
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

// Agave : rosette de feuilles charnues pointues.
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

// Guirlande d'ampoules chaudes en caténaire, tendue de la façade au mur sud
// (les luces de patio — banales un soir de fête, spec : la cour reste
// ordinaire, c'est l'ofrenda qui doit rester discrète).
function GuirlandeLumineuse({ x }: { x: number }) {
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
      {/* Une seule vraie lumière par brin (perf) */}
      <pointLight position={[x, 1.9, -8.1]} intensity={0.9} color="#ffd890" distance={6} decay={2} />
    </group>
  )
}

export function Patio() {
  return (
    <group>
      {/* ── Sol : terre battue + dalles de pierre éparses ── */}
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

      {/* (le ciel est le DomeCiel étoilé, monté au niveau de la scène) */}

      {/* ── Toits de tuiles au-dessus des façades (vus du patio — sinon le
          ciel étoilé apparaît DERRIÈRE la maison, au ras des murs) ── */}
      {/* Façade du salon (murs à 3,2 m) : pente vers la cour */}
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
      {/* Façade du couloir sud et de la porte verte (murs à 2,9 m) */}
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

      {/* ── Enceinte adobe (2,6 m) : sud, ouest + chaperons ── */}
      <mesh position={[3.5, 1.3, -10.6]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[11.0, 2.6]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-2, 1.3, -8.1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5.0, 2.6]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} side={THREE.DoubleSide} />
      </mesh>
      {/* Chaperons de tuiles */}
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
      {/* Pilier du coin ouest de la porte verte (colmate la façade) */}
      <mesh position={[7.16, 1.45, -5.38]}>
        <boxGeometry args={[0.5, 2.9, 0.35]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Pilier du coin EST de la porte verte : bouche l'angle entre la porte,
          la façade et le mur mitoyen du garage (le trou laissait voir la zone
          morte derrière — murs une face vus de dos) */}
      <mesh position={[8.875, 1.45, -5.45]}>
        <boxGeometry args={[0.3, 2.9, 0.4]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>

      {/* ── Mur mitoyen du garage x=9.0 — percé d'une ARCHE z∈[-8.6,-7.6]
          avec une porte en bois ouvrable ── */}
      <mesh position={[9.0, 1.3, -9.6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.0, 2.6]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[9.0, 1.3, -6.6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.0, 2.6]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} side={THREE.DoubleSide} />
      </mesh>
      {/* Bandeau + cintre de l'arche (des deux côtés) */}
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
      {/* Chaperon du mur mitoyen */}
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
      {/* Porte en bois OUVRABLE (touche F) dans l'arche */}
      <PorteAnimee id="garage" position={[9.0, 0, -8.57]} openAngle={-1.9} width={0.94} />

      {/* (bassin supprimé : le centre du patio reste libre — c'est par là que
          passera le chemin de pétales du ch9, vers l'ofrenda) */}

      {/* ── L'ofrenda — contre le MUR OUEST, loin de la porte verte.
          État ch1-2 : table dressée, arche de cempasúchil, quelques bougies
          ÉTEINTES, une petite photo illisible d'ici. Discrète. ── */}
      <group position={[-1.6, 0, -8.1]} rotation={[0, Math.PI / 2, 0]}>
        {/* Deux niveaux drapés */}
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
        {/* Arche de cempasúchil (demi-anneau de fleurs) */}
        {Array.from({ length: 9 }, (_, i) => (i / 8) * Math.PI).map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 0.85, 0.9 + Math.sin(a) * 0.85, -0.24]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshToonMaterial color={i % 2 ? C_CEMPA : C_CEMPA2} gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        ))}
        {/* Petite photo encadrée (illisible de loin — c'est voulu) */}
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
        {/* Bougies éteintes + verre d'eau + pan de muerto */}
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
        {/* Pétales au pied */}
        {([[-0.4, 0.25], [0.1, 0.4], [0.55, 0.28], [-0.15, 0.55]] as [number, number][]).map(([px, pz], i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, i]} position={[px, 0.004, pz]}>
            <circleGeometry args={[0.045, 6]} />
            <meshToonMaterial color={C_CEMPA} gradientMap={toonGradient} />
          </mesh>
        ))}
      </group>

      {/* ── Végétation ── */}
      {/* Bougainvillier contre le mur sud */}
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
      {/* Agaves + pots de cempasúchil + touffes vertes */}
      <Agave position={[-1.3, 0, -9.8]} scale={1.3} />
      <Agave position={[8.3, 0, -6.1]} scale={0.9} />
      <PotCempasuchil position={[1.4, 0, -6.4]} />
      <PotCempasuchil position={[-1.0, 0, -6.6]} />
      <PotCempasuchil position={[6.9, 0, -6.0]} />
      <PotCempasuchil position={[3.2, 0, -10.1]} />
      {([[2.2, -9.9, 0.2], [6.3, -10.1, 0.26], [0.5, -9.7, 0.18]] as [number, number, number][]).map(([px, pz, r], i) => (
        <mesh key={i} position={[px, r * 0.9, pz]} scale={[1, 1.2, 1]}>
          <sphereGeometry args={[r, 8, 8]} />
          <meshToonMaterial color={C_LEAF} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      ))}

      {/* ── Banc en bois contre la façade du salon — dossier au mur, assise
          face au patio ── */}
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

      {/* ── Lanterne murale près de la porte verte (côté patio) ── */}
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

      {/* ── Guirlandes d'ampoules (luces de patio) ── */}
      <GuirlandeLumineuse x={3.5} />
      <GuirlandeLumineuse x={8.2} />

      {/* ── Lumières : clair de lune bleu + lanterne chaude ── */}
      <directionalLight position={[3, 8, -9]} intensity={0.35} color="#8aa4d8" />
      <pointLight position={[8.8, 2.0, -5.9]} intensity={1.1} color="#f8dfa0" distance={5} decay={2} />
      <pointLight position={[4.2, 2.5, -8.3]} intensity={0.5} color="#6a84b8" distance={8} decay={2} />
    </group>
  )
}
