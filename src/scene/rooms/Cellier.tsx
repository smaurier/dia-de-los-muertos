// src/scene/rooms/Cellier.tsx
// Cellier / garde-manger (x∈[-10,-7], z∈[8.4,12]) — accolé à l'ouest de la
// cuisine (plan-maison-v1 : coin NW). Porte dans le mur ouest de la cuisine
// (x=-7, z∈[9.5,10.5]). Pénombre, conserves, grains, chiles séchés.
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { murAdobeSide, solTomettes, boisSombre } from '../shared/paintedTextures'
import { Porte } from '../shared/Porte'

const C_CEIL      = '#D8CCB4'
const C_WOOD_DARK = '#3A2008'
const C_WOOD_MED  = '#5C3010'
const C_JUTE      = '#C4A468'
const C_CHILE     = '#B22015'
const C_TERRE     = '#B87040'

// Centre et dimensions
const CX = -8.5
const CZ = 10.2
const CW = 3.0   // x∈[-10,-7]
const CD = 3.6   // z∈[8.4,12]

// Bocaux de conserves : [dx sur l'étagère, rayon, hauteur, couleur]
const JARS_ROWS: [number, number, number, string][][] = [
  // niveau bas — grosses ollas et bocaux
  [[-1.2, 0.11, 0.30, '#8A4A20'], [-0.8, 0.09, 0.24, '#A03818'], [-0.35, 0.10, 0.28, '#6A7A30'], [0.15, 0.08, 0.22, '#B08828'], [0.6, 0.11, 0.26, '#8A4A20'], [1.1, 0.09, 0.20, '#903020']],
  // niveau milieu — bocaux moyens
  [[-1.25, 0.07, 0.18, '#C29018'], [-0.9, 0.06, 0.16, '#A03818'], [-0.55, 0.07, 0.20, '#5A7A28'], [-0.1, 0.06, 0.15, '#B06020'], [0.35, 0.07, 0.18, '#C29018'], [0.75, 0.06, 0.16, '#7A3018'], [1.15, 0.07, 0.19, '#5A7A28']],
  // niveau haut — petits pots
  [[-1.1, 0.055, 0.13, '#B06020'], [-0.7, 0.05, 0.12, '#8A6A18'], [-0.25, 0.055, 0.14, '#A03818'], [0.25, 0.05, 0.12, '#5A7A28'], [0.7, 0.055, 0.13, '#C29018'], [1.15, 0.05, 0.11, '#903020']],
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
      {/* ── Plafond bas ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[CX, 2.9, CZ]}>
        <planeGeometry args={[CW, CD]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>
      {/* ── Murs (faces intérieures) ── */}
      <mesh position={[-10.0, 1.45, CZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[CD, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[CX, 1.45, 12.0]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[CW, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[CX, 1.45, 8.4]}>
        <planeGeometry args={[CW, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Mur est x=-7 côté cellier : 2 segments + linteau (porte z∈[9.5,10.5]) */}
      <mesh position={[-7.0, 1.45, 8.95]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-7.0, 1.45, 11.25]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.5, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-7.0, 2.5, 10.0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.0, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Encadrement bois de la porte */}
      {[9.5, 10.5].map(dz => (
        <mesh key={dz} position={[-7.0, 1.05, dz]}>
          <boxGeometry args={[0.14, 2.1, 0.08]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      ))}
      <mesh position={[-7.0, 2.12, 10.0]}>
        <boxGeometry args={[0.14, 0.09, 1.08]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      {/* Porte du cellier — gond au montant sud (z=9.5), grande ouverte vers
          l'intérieur du cellier. Pourra s'ouvrir/fermer en gameplay (angle). */}
      <Porte position={[-7.05, 0, 9.53]} angle={-2.3} width={0.94} />

      {/* ── Étagères murales (mur ouest) : 3 niveaux de conserves ── */}
      <group position={[-9.72, 0, 10.2]} rotation={[0, Math.PI / 2, 0]}>
        {SHELF_Y.map((sy, si) => (
          <group key={si}>
            <mesh position={[0, sy, 0]}>
              <boxGeometry args={[2.9, 0.045, 0.36]} />
              <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
              <Outlines thickness={0.012} color="black" />
            </mesh>
            {/* Équerres */}
            {[-1.2, 0, 1.2].map(sx => (
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

      {/* ── Sacs de grain (jute, coin sud-ouest) ── */}
      {([[-9.5, 8.85, 0.34, 0], [-9.0, 8.75, 0.30, 0.5], [-9.32, 9.35, 0.28, -0.4]] as [number, number, number, number][]).map(([sx, sz, sr, rot], i) => (
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

      {/* ── Tonneau + caisse de fruits (coin nord) ── */}
      <group position={[-9.3, 0, 11.5]}>
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
      <group position={[-8.45, 0, 11.55]}>
        <mesh position={[0, 0.17, 0]}>
          <boxGeometry args={[0.62, 0.34, 0.44]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {/* Oranges empilées */}
        {([[-0.15, 0.38, -0.06], [0.02, 0.38, 0.09], [0.17, 0.38, -0.08], [0.05, 0.46, -0.02], [-0.12, 0.45, 0.08]] as [number, number, number][]).map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.075, 8, 8]} />
            <meshToonMaterial color={i % 2 ? '#E8820A' : '#D97008'} gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        ))}
      </group>

      {/* ── Ollas en terre cuite empilées (le long du mur sud) ── */}
      {([[-8.3, 8.75, 0.17], [-7.85, 8.7, 0.13], [-8.1, 8.72, 0.15]] as [number, number, number][]).map(([ox, oz, or_], i) => (
        <mesh key={i} position={[ox, or_ * 1.1, oz]}>
          <cylinderGeometry args={[or_, or_ * 0.72, or_ * 2.2, 10]} />
          <meshToonMaterial color={C_TERRE} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      ))}

      {/* ── Ristras de chiles suspendues au plafond ── */}
      {([[-7.7, 9.0], [-8.1, 11.4]] as [number, number][]).map(([rx, rz], ri) => (
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
      <group position={[-7.35, 0, 10.85]}>
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

      {/* ── Herbes séchées (bouquets tête en bas, mur nord) ── */}
      {[-8.9, -8.5].map((hx, hi) => (
        <group key={hi} position={[hx, 0, 11.9]}>
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
      <pointLight position={[-8.5, 2.3, 10.2]} intensity={0.9} color="#e8c890" distance={5} decay={2} />
    </group>
  )
}
