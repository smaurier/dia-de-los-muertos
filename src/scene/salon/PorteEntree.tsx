// src/scene/salon/PorteEntree.tsx
// La porte principale de la maison — pièce maîtresse du zaguán.
// Porte coloniale mexicaine : deux vantaux de bois massif à panneaux
// moulurés, clavos (clous forgés) en quinconce, pentures et heurtoirs à
// anneau, encadrement en cantera (pierre sculptée crème), imposte à
// barreaux forgés derrière laquelle passe la lumière de la rue, seuil de
// pierre usée, farol en fer forgé suspendu au plafond du couloir d'entrée.
// Coordonnées monde : mur est x=10, ouverture z∈[-0.9,0.9].
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { boisSombre } from '../shared/paintedTextures'

const C_IRON     = '#1A1512'
const C_WOOD     = '#5C3010'
const C_WOOD_DK  = '#3E2008'
const C_PANEL    = '#6E3A14'
const C_CANTERA  = '#C9B8A2'
const C_CANTERA2 = '#B8A288'
const C_GLOW     = '#F0C060'

// Un vantail : panneau bois + cadre mouluré + 2 caissons + clavos + penture.
// side=+1 : vantail nord (z>0), gonds côté jambage nord. side=-1 : miroir.
function Vantail({ side }: { side: 1 | -1 }) {
  const zc = side * 0.45 // centre du vantail (z de ±0.02 à ±0.88)
  return (
    <group position={[9.94, 0, zc]}>
      {/* Panneau principal */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.1, 2.1, 0.86]} />
        <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
        <Outlines thickness={0.016} color="black" />
      </mesh>
      {/* Cadre mouluré en relief (côté couloir, face -x) */}
      {[[0.32, 0.78], [1.13, 0.06], [2.05, 0.1]].map(([ty, th], i) => (
        <mesh key={i} position={[-0.06, ty === 0.32 ? 0.32 : ty, 0]}>
          <boxGeometry args={[0.03, th === 0.78 ? 0.12 : th + 0.04, 0.82]} />
          <meshToonMaterial color={C_WOOD_DK} gradientMap={toonGradient} />
        </mesh>
      ))}
      {[-0.39, 0.39].map(dz => (
        <mesh key={dz} position={[-0.06, 1.13, dz]}>
          <boxGeometry args={[0.03, 1.9, 0.08]} />
          <meshToonMaterial color={C_WOOD_DK} gradientMap={toonGradient} />
        </mesh>
      ))}
      {/* Deux caissons moulurés (haut et bas) en léger relief */}
      {[[1.62, 0.72], [0.68, 0.62]].map(([py, ph], i) => (
        <group key={i}>
          <mesh position={[-0.058, py, 0]}>
            <boxGeometry args={[0.025, ph, 0.62]} />
            <meshToonMaterial color={C_PANEL} gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[-0.075, py, 0]}>
            <boxGeometry args={[0.012, ph - 0.18, 0.44]} />
            <meshToonMaterial color={C_WOOD} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}
      {/* Clavos — têtes de clous forgés en quinconce sur les montants */}
      {[0.35, 0.78, 1.21, 1.64, 2.0].flatMap(py =>
        [-0.33, 0.33].map(dz => (
          <mesh key={`${py}-${dz}`} position={[-0.085, py, dz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.03, 0.025, 6]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            <Outlines thickness={0.006} color="black" />
          </mesh>
        ))
      )}
      {/* Penture forgée (bande horizontale côté gonds, bout en pointe) */}
      {[0.5, 1.75].map(py => (
        <group key={py}>
          <mesh position={[-0.065, py, side * 0.18]}>
            <boxGeometry args={[0.015, 0.07, 0.5]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            <Outlines thickness={0.006} color="black" />
          </mesh>
          <mesh position={[-0.065, py, side * -0.09]} rotation={[side * Math.PI / 4, 0, 0]}>
            <boxGeometry args={[0.015, 0.07, 0.07]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}
      {/* Heurtoir : platine ronde + anneau forgé (près du montant central) */}
      <group position={[-0.08, 1.35, side * -0.28]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.05, 0.02, 8]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
        <mesh position={[-0.03, -0.05, 0]} rotation={[0, 0.3, 0]}>
          <torusGeometry args={[0.05, 0.011, 6, 14]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.006} color="black" />
        </mesh>
      </group>
      {/* Gonds visibles côté jambage */}
      {[0.45, 1.8].map(py => (
        <mesh key={py} position={[-0.02, py, side * 0.42]}>
          <cylinderGeometry args={[0.022, 0.022, 0.12, 6]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
      ))}
    </group>
  )
}

// Flamme du farol : scintillement doux (bougie à l'abri du verre).
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

export function PorteEntree() {
  return (
    <group>
      {/* ── Seuil de pierre usée (déborde dans le couloir) ── */}
      <mesh position={[9.85, 0.025, 0]}>
        <boxGeometry args={[0.45, 0.05, 2.0]} />
        <meshToonMaterial color={C_CANTERA2} gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>

      {/* ── Encadrement en cantera : jambages sculptés + socles ── */}
      {[-0.99, 0.99].map(pz => (
        <group key={pz}>
          <mesh position={[9.9, 1.3, pz]}>
            <boxGeometry args={[0.26, 2.6, 0.22]} />
            <meshToonMaterial color={C_CANTERA} gradientMap={toonGradient} />
            <Outlines thickness={0.014} color="black" />
          </mesh>
          {/* Socle et chapiteau du jambage */}
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
          {/* Cannelure décorative */}
          <mesh position={[9.86, 1.3, pz]}>
            <boxGeometry args={[0.02, 2.1, 0.06]} />
            <meshToonMaterial color={C_CANTERA2} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}
      {/* Corniche moulurée au-dessus de l'imposte */}
      <mesh position={[9.88, 2.68, 0]}>
        <boxGeometry args={[0.3, 0.14, 2.42]} />
        <meshToonMaterial color={C_CANTERA} gradientMap={toonGradient} />
        <Outlines thickness={0.014} color="black" />
      </mesh>
      <mesh position={[9.86, 2.585, 0]}>
        <boxGeometry args={[0.28, 0.05, 2.3]} />
        <meshToonMaterial color={C_CANTERA2} gradientMap={toonGradient} />
      </mesh>
      {/* Clé sculptée au centre de la corniche */}
      <mesh position={[9.85, 2.68, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.18]} />
        <meshToonMaterial color={C_CANTERA2} gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>

      {/* ── Traverse bois entre vantaux et imposte ── */}
      <mesh position={[9.94, 2.18, 0]}>
        <boxGeometry args={[0.12, 0.12, 1.8]} />
        <meshToonMaterial color={C_WOOD_DK} gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>

      {/* ── Imposte à barreaux forgés — la lumière de la rue passe entre ── */}
      <mesh position={[10.02, 2.42, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.76, 0.36]} />
        <meshToonMaterial color="#2A2418" emissive={C_GLOW} emissiveIntensity={0.5} gradientMap={toonGradient} />
      </mesh>
      {[-0.66, -0.33, 0, 0.33, 0.66].map(pz => (
        <mesh key={pz} position={[9.95, 2.42, pz]}>
          <boxGeometry args={[0.03, 0.36, 0.03]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.006} color="black" />
        </mesh>
      ))}
      {/* Volute centrale de l'imposte */}
      <mesh position={[9.95, 2.42, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.09, 0.012, 6, 12]} />
        <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
      </mesh>
      {/* Lueur chaude qui tombe de l'imposte */}
      <pointLight position={[9.7, 2.4, 0]} intensity={0.6} color={C_GLOW} distance={2.5} decay={2} />

      {/* ── Les deux vantaux ── */}
      <Vantail side={1} />
      <Vantail side={-1} />

      {/* ── Verrou central : targette forgée entre les deux heurtoirs ── */}
      <mesh position={[9.87, 1.08, 0]}>
        <boxGeometry args={[0.03, 0.16, 0.1]} />
        <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        <Outlines thickness={0.008} color="black" />
      </mesh>

      {/* ── Farol : lanterne hexagonale en fer forgé suspendue au plafond ── */}
      <group position={[9.2, 0, 0]}>
        <mesh position={[0, 2.76, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.28, 6]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
        {/* Chapeau + corps vitré + socle */}
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
        {/* Montants du corps */}
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
