// src/scene/rooms/Garage.tsx
// Le garage — devant le patio (côté rue), ALLONGÉ dans le sens de la
// voiture : x∈[9.0,13.4], z∈[-12.4,-5.6] (6,8 m de long). La porte
// basculante est au bout sud (côté rue) : le vocho est entré tout droit,
// nez vers l'arche du patio. Communique avec le patio par l'arche du mur
// mitoyen (porte en bois ouvrable, id 'garage', définie dans Patio.tsx).
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { murAdobeSide } from '../shared/paintedTextures'

const C_CEIL   = '#C8BCA4'
const C_IRON   = '#1A1512'
const C_WOOD_M = '#5C3010'
const C_BETON  = '#7A7568'
const C_VOCHO  = '#4A7A5E'   // vert vocho classique
const C_TIRE   = '#1E1E20'

export function Garage() {
  return (
    <group>
      {/* ── Sol béton + tache d'huile ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[11.2, 0.001, -9.0]}>
        <planeGeometry args={[4.4, 6.8]} />
        <meshToonMaterial color={C_BETON} gradientMap={toonGradient} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.4]} position={[11.5, 0.005, -7.2]}>
        <circleGeometry args={[0.35, 9]} />
        <meshToonMaterial color="#4A463E" gradientMap={toonGradient} />
      </mesh>
      {/* ── Toit (le garage est couvert, lui) ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[11.2, 2.7, -9.0]}>
        <planeGeometry args={[4.4, 6.8]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>

      {/* ── Mur nord (dos de la façade de la maison) ── */}
      <mesh position={[11.2, 1.35, -5.62]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4.4, 2.7]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── Mur est x=13.4 (plein sur toute la longueur) ── */}
      <mesh position={[13.4, 1.35, -9.0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[6.8, 2.7]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── Mur ouest x=9.0, segment sud (au-delà du mur mitoyen du patio,
          qui couvre z∈[-10.6,-5.6] avec l'arche) ── */}
      <mesh position={[9.0, 1.35, -11.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.8, 2.7]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>

      {/* ── Mur sud z=-12.4 : PORTE BASCULANTE (côté rue) — la voiture entre
          par là, dans l'axe ── */}
      <mesh position={[11.2, 1.2, -12.38]}>
        <planeGeometry args={[3.4, 2.4]} />
        <meshToonMaterial color={C_WOOD_M} gradientMap={toonGradient} />
      </mesh>
      {[-1.2, -0.6, 0, 0.6, 1.2].map(dx => (
        <mesh key={dx} position={[11.2 + dx, 1.2, -12.36]}>
          <boxGeometry args={[0.03, 2.36, 0.02]} />
          <meshToonMaterial color="#4A2808" gradientMap={toonGradient} />
        </mesh>
      ))}
      <mesh position={[11.2, 1.1, -12.34]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.24, 6]} />
        <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        <Outlines thickness={0.008} color="black" />
      </mesh>
      {/* Bandeau + piliers latéraux autour de la porte basculante */}
      <mesh position={[11.2, 2.55, -12.38]}>
        <planeGeometry args={[3.4, 0.3]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[9.25, 1.35, -12.38]}>
        <planeGeometry args={[0.5, 2.7]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[13.15, 1.35, -12.38]}>
        <planeGeometry args={[0.5, 2.7]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>

      {/* ── Le vocho (placeholder — modèle 3D pipeline à venir) — dans l'axe
          du garage, nez vers l'arche du patio (il est entré en marche avant) ── */}
      <group position={[11.3, 0, -9.4]} rotation={[0, Math.PI / 2, 0]}>
        {/* Caisse basse */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[3.1, 0.55, 1.45]} />
          <meshToonMaterial color={C_VOCHO} gradientMap={toonGradient} />
          <Outlines thickness={0.020} color="black" />
        </mesh>
        {/* Dôme cabine (silhouette coccinelle) */}
        <mesh position={[0.1, 0.78, 0]} scale={[1.9, 0.72, 1.28]}>
          <sphereGeometry args={[0.72, 14, 10]} />
          <meshToonMaterial color={C_VOCHO} gradientMap={toonGradient} />
          <Outlines thickness={0.020} color="black" />
        </mesh>
        {/* Vitres (bande sombre autour de la cabine) */}
        <mesh position={[0.1, 0.92, 0]} scale={[1.55, 0.42, 1.12]}>
          <sphereGeometry args={[0.72, 12, 8]} />
          <meshToonMaterial color="#1E2A34" gradientMap={toonGradient} />
        </mesh>
        {/* Roues + enjoliveurs */}
        {([[-1.05, 0.62], [1.05, 0.62], [-1.05, -0.62], [1.05, -0.62]] as [number, number][]).map(([dx, dzz], i) => (
          <group key={i} position={[dx, 0.3, dzz]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.2, 12]} />
              <meshToonMaterial color={C_TIRE} gradientMap={toonGradient} />
              <Outlines thickness={0.014} color="black" />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, dzz > 0 ? 0.11 : -0.11]}>
              <cylinderGeometry args={[0.12, 0.12, 0.02, 10]} />
              <meshToonMaterial color="#C8C4B8" gradientMap={toonGradient} />
            </mesh>
          </group>
        ))}
        {/* Ailes avant/arrière (bosses) */}
        {([[-1.05, 0.68], [1.05, 0.68], [-1.05, -0.68], [1.05, -0.68]] as [number, number][]).map(([dx, dzz], i) => (
          <mesh key={i} position={[dx, 0.52, dzz]} scale={[1.5, 0.8, 0.7]}>
            <sphereGeometry args={[0.28, 10, 8]} />
            <meshToonMaterial color={C_VOCHO} gradientMap={toonGradient} />
            <Outlines thickness={0.014} color="black" />
          </mesh>
        ))}
        {/* Phares + pare-chocs */}
        {[-0.45, 0.45].map(dzz => (
          <mesh key={dzz} position={[1.62, 0.68, dzz]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.07, 0.08, 10]} />
            <meshToonMaterial color="#E8E4D0" emissive="#8A8468" emissiveIntensity={0.15} gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
        ))}
        {[1.68, -1.68].map(dx => (
          <mesh key={dx} position={[dx, 0.32, 0]}>
            <boxGeometry args={[0.08, 0.09, 1.3]} />
            <meshToonMaterial color="#B8B4A8" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
        ))}
        {/* Plaque (à l'arrière, côté rue) */}
        <mesh position={[-1.73, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.3, 0.12]} />
          <meshToonMaterial color="#E8E4D0" gradientMap={toonGradient} />
        </mesh>
      </group>

      {/* ── Établi contre le mur nord + outils au mur ── */}
      <group position={[10.6, 0, -6.05]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.78, 0]}>
          <boxGeometry args={[1.7, 0.07, 0.55]} />
          <meshToonMaterial color={C_WOOD_M} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {([-0.75, 0.75] as number[]).flatMap(dx =>
          ([-0.2, 0.2] as number[]).map((dzz, j) => (
            <mesh key={`${dx}-${j}`} position={[dx, 0.38, dzz]}>
              <boxGeometry args={[0.07, 0.76, 0.07]} />
              <meshToonMaterial color="#3A2008" gradientMap={toonGradient} />
            </mesh>
          ))
        )}
        {/* Étau + caisse à outils + chiffon */}
        <mesh position={[-0.55, 0.88, 0]}>
          <boxGeometry args={[0.18, 0.14, 0.12]} />
          <meshToonMaterial color="#5A5E66" gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        <mesh position={[0.3, 0.9, 0.05]}>
          <boxGeometry args={[0.4, 0.16, 0.2]} />
          <meshToonMaterial color="#8A2A2A" gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        <mesh position={[0.75, 0.83, -0.1]} rotation={[0, 0.6, 0]}>
          <boxGeometry args={[0.22, 0.03, 0.16]} />
          <meshToonMaterial color="#A89078" gradientMap={toonGradient} />
        </mesh>
        {/* Panneau d'outils au mur (silhouettes) */}
        <mesh position={[0, 1.6, -0.32]}>
          <boxGeometry args={[1.3, 0.7, 0.03]} />
          <meshToonMaterial color="#6E5A44" gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {([[-0.4, 0.02, 0.28], [-0.1, 0, 0.34], [0.2, 0.03, 0.3], [0.45, -0.02, 0.22]] as [number, number, number][]).map(([dx, rot, h], i) => (
          <mesh key={i} position={[dx, 1.58, -0.29]} rotation={[0, 0, rot]}>
            <boxGeometry args={[0.04, h, 0.02]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        ))}
      </group>

      {/* ── Pneus empilés (coin nord-est) + bidons (coin sud-ouest) ── */}
      {[0.13, 0.39, 0.65].map((py, i) => (
        <mesh key={py} position={[13.0 - i * 0.03, py, -5.95 + (i % 2) * 0.05]} rotation={[0, i, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.24, 12]} />
          <meshToonMaterial color={C_TIRE} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
      ))}
      {([[9.45, -12.0, '#8A2A2A'], [9.8, -12.05, '#27547A']] as [number, number, string][]).map(([px, pz, c], i) => (
        <group key={i} position={[px, 0, pz]}>
          <mesh position={[0, 0.24, 0]}>
            <boxGeometry args={[0.26, 0.48, 0.26]} />
            <meshToonMaterial color={c} gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
          <mesh position={[0.06, 0.51, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.06, 6]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}

      {/* ── Deux ampoules nues (le garage est long) ── */}
      {[-7.2, -10.8].map(pz => (
        <group key={pz}>
          <pointLight position={[11.2, 2.2, pz]} intensity={0.8} color="#e8d0a0" distance={4.5} decay={2} />
          <mesh position={[11.2, 2.5, pz]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshToonMaterial color="#E8D8B0" emissive="#D8C080" emissiveIntensity={1.0} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[11.2, 2.62, pz]}>
            <cylinderGeometry args={[0.007, 0.007, 0.2, 4]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
