// src/scene/rooms/Cellier.tsx
// Cellier / garde-manger (x∈[-7,-0.6], z∈[12,15.2]) — toute la largeur de la
// cuisine, derrière son mur du fond (plan-maison-v1). Porte OUVRABLE dans le
// mur commun z=12 (x∈[-6.3,-5.3]) + porte bleue vers le jardin au mur ouest.
// Pénombre, conserves, grains, chiles séchés.
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { murAdobeSide, solTomettes, boisSombre } from '../shared/paintedTextures'
import { PorteAnimee } from '../shared/PorteAnimee'
import { PorteBleue } from '../shared/PorteBleue'

const C_CEIL      = '#D8CCB4'
const C_WOOD_DARK = '#3A2008'
const C_WOOD_MED  = '#5C3010'
const C_JUTE      = '#C4A468'
const C_CHILE     = '#B22015'
const C_TERRE     = '#B87040'

// Centre et dimensions
const CX = -3.8
const CZ = 13.6
const CW = 6.4   // x∈[-7,-0.6]
const CD = 3.2   // z∈[12,15.2]

// Bocaux de conserves : [dx sur l'étagère, rayon, hauteur, couleur]
const JARS_ROWS: [number, number, number, string][][] = [
  // niveau bas — grosses ollas et bocaux
  [[-1.05, 0.11, 0.30, '#8A4A20'], [-0.65, 0.09, 0.24, '#A03818'], [-0.2, 0.10, 0.28, '#6A7A30'], [0.25, 0.08, 0.22, '#B08828'], [0.7, 0.11, 0.26, '#8A4A20'], [1.1, 0.09, 0.20, '#903020']],
  // niveau milieu — bocaux moyens
  [[-1.1, 0.07, 0.18, '#C29018'], [-0.75, 0.06, 0.16, '#A03818'], [-0.4, 0.07, 0.20, '#5A7A28'], [0.0, 0.06, 0.15, '#B06020'], [0.4, 0.07, 0.18, '#C29018'], [0.78, 0.06, 0.16, '#7A3018'], [1.12, 0.07, 0.19, '#5A7A28']],
  // niveau haut — petits pots
  [[-1.0, 0.055, 0.13, '#B06020'], [-0.6, 0.05, 0.12, '#8A6A18'], [-0.15, 0.055, 0.14, '#A03818'], [0.3, 0.05, 0.12, '#5A7A28'], [0.72, 0.055, 0.13, '#C29018'], [1.1, 0.05, 0.11, '#903020']],
]
const SHELF_Y = [0.55, 1.15, 1.7]

export function Cellier() {
  return (
    <group>
      {/* ── Sol tomettes ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CX, 0.001, CZ]}>
        <planeGeometry args={[CW, CD]} />
        <meshPhongMaterial map={solTomettes} shininess={15} />
      </mesh>
      {/* ── Plafond ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[CX, 2.9, CZ]}>
        <planeGeometry args={[CW, CD]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>
      {/* ── Murs (faces intérieures) ── */}
      {/* Ouest x=-7 */}
      <mesh position={[-7.0, 1.45, CZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[CD, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Fond z=15.2 */}
      <mesh position={[CX, 1.45, 15.2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[CW, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Est x=-0.6 */}
      <mesh position={[-0.6, 1.45, CZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[CD, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Mur sud z=12 côté cellier : 2 segments + linteau (porte x∈[-6.3,-5.3]) */}
      <mesh position={[-6.65, 1.45, 12.0]}>
        <planeGeometry args={[0.7, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-2.95, 1.45, 12.0]}>
        <planeGeometry args={[4.7, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-5.8, 2.5, 12.0]}>
        <planeGeometry args={[1.0, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Encadrement bois de la porte */}
      {[-6.3, -5.3].map(dx => (
        <mesh key={dx} position={[dx, 1.05, 12.0]}>
          <boxGeometry args={[0.08, 2.1, 0.14]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      ))}
      <mesh position={[-5.8, 2.12, 12.0]}>
        <boxGeometry args={[1.08, 0.09, 0.14]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      {/* Porte du cellier — gond au montant ouest (x=-6.3). FERMÉE par défaut,
          touche F pour ouvrir (s'ouvre vers l'intérieur du cellier). */}
      <PorteAnimee id="cellier" position={[-6.27, 0, 12.05]} rotationY={Math.PI / 2} openAngle={-2.3} width={0.94} />

      {/* ── Porte bleue vers le jardin (mur ouest, non ouvrable) ── */}
      <PorteBleue position={[-6.96, 0, 13.6]} rotationY={Math.PI / 2} />

      {/* ── Étagères murales (mur est — le mur ouest porte la porte du jardin) ── */}
      <group position={[-0.88, 0, 13.6]} rotation={[0, -Math.PI / 2, 0]}>
        {SHELF_Y.map((sy, si) => (
          <group key={si}>
            <mesh position={[0, sy, 0]}>
              <boxGeometry args={[2.6, 0.045, 0.36]} />
              <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
              <Outlines thickness={0.012} color="black" />
            </mesh>
            {/* Équerres */}
            {[-1.05, 0, 1.05].map(sx => (
              <mesh key={sx} position={[sx, sy - 0.14, 0.14]}>
                <boxGeometry args={[0.045, 0.28, 0.045]} />
                <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
              </mesh>
            ))}
            {/* Bocaux du niveau */}
            {JARS_ROWS[si].map(([jx, jr, jh, jc], ji) => (
              <group key={ji} position={[jx, sy + 0.023, 0]}>
                <mesh position={[0, jh / 2, 0]}>
                  <cylinderGeometry args={[jr, jr * 0.92, jh, 9]} />
                  <meshToonMaterial color={jc} gradientMap={toonGradient} />
                  <Outlines thickness={0.008} color="black" />
                </mesh>
                {/* Couvercle / lien tissu */}
                <mesh position={[0, jh + 0.012, 0]}>
                  <cylinderGeometry args={[jr * 0.85, jr * 0.95, 0.028, 9]} />
                  <meshToonMaterial color={ji % 2 ? '#E8DCC0' : '#8A2015'} gradientMap={toonGradient} />
                </mesh>
              </group>
            ))}
          </group>
        ))}
      </group>

      {/* ── Sacs de grain (jute, coin nord-ouest) ── */}
      {([[-6.5, 14.7, 0.34, 0], [-6.0, 14.8, 0.30, 0.5], [-6.35, 14.2, 0.28, -0.4]] as [number, number, number, number][]).map(([sx, sz, sr, rot], i) => (
        <group key={i} position={[sx, 0, sz]} rotation={[0, rot, 0]}>
          <mesh position={[0, sr * 0.62, 0]} scale={[1, 0.78, 1]}>
            <sphereGeometry args={[sr, 10, 8]} />
            <meshToonMaterial color={C_JUTE} gradientMap={toonGradient} />
            <Outlines thickness={0.014} color="black" />
          </mesh>
          {/* Col du sac roulé */}
          <mesh position={[0, sr * 1.18, 0]}>
            <cylinderGeometry args={[sr * 0.42, sr * 0.5, sr * 0.3, 8]} />
            <meshToonMaterial color="#B09058" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          {/* Grains visibles (maïs / haricots) */}
          <mesh position={[0, sr * 1.32, 0]}>
            <cylinderGeometry args={[sr * 0.38, sr * 0.38, 0.03, 8]} />
            <meshToonMaterial color={i === 1 ? '#5A3418' : '#E8B830'} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}

      {/* ── Tonneau + caisse de fruits (coin nord-est) ── */}
      <group position={[-4.0, 0, 14.7]}>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.30, 0.26, 0.84, 12]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        {[0.18, 0.66].map(hy => (
          <mesh key={hy} position={[0, hy, 0]}>
            <cylinderGeometry args={[0.305, 0.30, 0.035, 12]} />
            <meshToonMaterial color="#1A1512" gradientMap={toonGradient} />
          </mesh>
        ))}
      </group>
      <group position={[-3.3, 0, 14.8]}>
        <mesh position={[0, 0.17, 0]}>
          <boxGeometry args={[0.44, 0.34, 0.62]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {/* Oranges empilées */}
        {([[-0.06, 0.38, -0.15], [0.09, 0.38, 0.02], [-0.08, 0.38, 0.17], [-0.02, 0.46, 0.05], [0.08, 0.45, -0.12]] as [number, number, number][]).map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.075, 8, 8]} />
            <meshToonMaterial color={i % 2 ? '#E8820A' : '#D97008'} gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        ))}
      </group>

      {/* ── Ollas en terre cuite empilées (le long du mur du fond) ── */}
      {([[-2.5, 14.9, 0.17], [-2.05, 14.85, 0.13], [-2.28, 14.88, 0.15]] as [number, number, number][]).map(([ox, oz, or_], i) => (
        <mesh key={i} position={[ox, or_ * 1.1, oz]}>
          <cylinderGeometry args={[or_, or_ * 0.72, or_ * 2.2, 10]} />
          <meshToonMaterial color={C_TERRE} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      ))}

      {/* ── Ristras de chiles suspendues au plafond ── */}
      {([[-6.4, 12.55], [-4.4, 14.9], [-1.5, 12.6]] as [number, number][]).map(([rx, rz], ri) => (
        <group key={ri} position={[rx, 0, rz]}>
          <mesh position={[0, 2.55, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.7, 5]} />
            <meshToonMaterial color="#6A5230" gradientMap={toonGradient} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map(ci => (
            <mesh
              key={ci}
              position={[Math.sin(ci * 2.1) * 0.05, 2.18 - ci * 0.13, Math.cos(ci * 1.7) * 0.05]}
              rotation={[Math.PI + Math.sin(ci) * 0.35, 0, Math.cos(ci * 2) * 0.3]}
            >
              <coneGeometry args={[0.035, 0.13, 6]} />
              <meshToonMaterial color={ci % 3 === 2 ? '#8A1810' : C_CHILE} gradientMap={toonGradient} />
              <Outlines thickness={0.007} color="black" />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Tresse d'ail suspendue (près de la porte) ── */}
      <group position={[-5.0, 0, 12.35]}>
        <mesh position={[0, 2.45, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.5, 5]} />
          <meshToonMaterial color="#6A5230" gradientMap={toonGradient} />
        </mesh>
        {[0, 1, 2, 3].map(gi => (
          <mesh key={gi} position={[Math.sin(gi * 2.5) * 0.03, 2.16 - gi * 0.11, Math.cos(gi * 2) * 0.03]}>
            <sphereGeometry args={[0.048, 8, 7]} />
            <meshToonMaterial color="#EDE4D4" gradientMap={toonGradient} />
            <Outlines thickness={0.007} color="black" />
          </mesh>
        ))}
      </group>

      {/* ── Herbes séchées (bouquets tête en bas, mur du fond) ── */}
      {[-5.8, -5.4].map((hx, hi) => (
        <group key={hi} position={[hx, 0, 15.1]}>
          <mesh position={[0, 2.4, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.3, 4]} />
            <meshToonMaterial color="#6A5230" gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 2.12, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.07, 0.26, 7]} />
            <meshToonMaterial color={hi ? '#5A6A28' : '#48582A'} gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        </group>
      ))}

      {/* ── Lumière : pénombre chaude, une seule ampoule faible ── */}
      <pointLight position={[CX, 2.3, CZ]} intensity={1.1} color="#e8c890" distance={7} decay={2} />
    </group>
  )
}
