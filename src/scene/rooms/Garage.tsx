// src/scene/rooms/Garage.tsx
// Le garage — devant le patio, allongé vers l'EST, côté rue (même côté que
// la porte d'entrée de la maison) : x∈[9.0,15.0], z∈[-10.6,-5.6].
// Le portail basculant est à l'est : le vocho est entré tout droit depuis
// la rue, nez vers l'arche du patio (mur mitoyen ouest, porte en bois
// ouvrable id 'garage', définie dans Patio.tsx).
import * as THREE from 'three'
import { MeshReflectorMaterial, Outlines } from '@react-three/drei'
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12.0, 0.001, -8.1]}>
        <planeGeometry args={[6.0, 5.0]} />
        <meshToonMaterial color={C_BETON} gradientMap={toonGradient} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.4]} position={[12.4, 0.005, -8.0]}>
        <circleGeometry args={[0.35, 9]} />
        <meshToonMaterial color="#4A463E" gradientMap={toonGradient} />
      </mesh>
      {/* ── Toit (le garage est couvert, lui) ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[12.0, 2.7, -8.1]}>
        <planeGeometry args={[6.0, 5.0]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>
      {/* Couverture de tuiles vue de dehors (depuis le patio, par-dessus le
          mur mitoyen — sinon on voit le ciel à travers le plafond une face) */}
      <mesh position={[12.0, 2.76, -8.1]}>
        <boxGeometry args={[6.2, 0.1, 5.2]} />
        <meshToonMaterial color="#8A4A2A" gradientMap={toonGradient} />
        <Outlines thickness={0.016} color="black" />
      </mesh>

      {/* ── Mur nord (dos de la façade et de la rue) ── */}
      <mesh position={[12.0, 1.35, -5.62]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[6.0, 2.7]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── Mur sud z=-10.6 — percé de deux fenêtres hautes d'atelier
          x∈[10.3,11.3] et x∈[12.7,13.7], y∈[1.5,2.2] ── */}
      <mesh position={[9.65, 1.35, -10.58]}>
        <planeGeometry args={[1.3, 2.7]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[12.0, 1.35, -10.58]}>
        <planeGeometry args={[1.4, 2.7]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[14.35, 1.35, -10.58]}>
        <planeGeometry args={[1.3, 2.7]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {[10.8, 13.2].map(px => (
        <group key={px}>
          <mesh position={[px, 2.45, -10.58]}>
            <planeGeometry args={[1.0, 0.5]} />
            <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[px, 0.75, -10.58]}>
            <planeGeometry args={[1.0, 1.5]} />
            <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
          </mesh>
          {/* Nuit + encadrement + 2 barreaux + vitre (verre du salon) */}
          <mesh position={[px, 1.85, -10.72]}>
            <planeGeometry args={[1.04, 0.74]} />
            <meshToonMaterial color="#16223E" emissive="#24365E" emissiveIntensity={0.35} gradientMap={toonGradient} />
          </mesh>
          {[-0.5, 0.5].map(dx => (
            <mesh key={dx} position={[px + dx, 1.85, -10.56]}>
              <boxGeometry args={[0.07, 0.76, 0.08]} />
              <meshToonMaterial color="#3A2008" gradientMap={toonGradient} />
              <Outlines thickness={0.010} color="black" />
            </mesh>
          ))}
          {[1.5, 2.2].map(py => (
            <mesh key={py} position={[px, py, -10.56]}>
              <boxGeometry args={[1.06, 0.07, 0.08]} />
              <meshToonMaterial color="#3A2008" gradientMap={toonGradient} />
            </mesh>
          ))}
          {[-0.18, 0.18].map(dx => (
            <mesh key={dx} position={[px + dx, 1.85, -10.62]}>
              <boxGeometry args={[0.018, 0.64, 0.018]} />
              <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            </mesh>
          ))}
          <mesh position={[px, 1.85, -10.65]}>
            <planeGeometry args={[0.96, 0.66]} />
            <MeshReflectorMaterial
              transparent
              opacity={0.68}
              color="#e8f0f4"
              resolution={256}
              mirror={1}
              mixStrength={1.4}
              mixBlur={0}
              blur={[0, 0]}
              roughness={0.06}
              metalness={0}
              depthScale={0}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
      {/* (mur ouest = mur mitoyen du patio avec l'arche — voir Patio.tsx) */}

      {/* ── PORTAIL BASCULANT à l'est x=15.0 (côté rue) — la voiture entre
          par là, dans l'axe ── */}
      <mesh position={[14.98, 1.2, -8.1]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.4, 2.4]} />
        <meshToonMaterial color={C_WOOD_M} gradientMap={toonGradient} />
      </mesh>
      {[-1.2, -0.6, 0, 0.6, 1.2].map(dz => (
        <mesh key={dz} position={[14.96, 1.2, -8.1 + dz]}>
          <boxGeometry args={[0.02, 2.36, 0.03]} />
          <meshToonMaterial color="#4A2808" gradientMap={toonGradient} />
        </mesh>
      ))}
      <mesh position={[14.94, 1.1, -8.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.24, 6]} />
        <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        <Outlines thickness={0.008} color="black" />
      </mesh>
      {/* Bandeau + piliers latéraux autour du portail */}
      <mesh position={[14.98, 2.55, -8.1]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.4, 0.3]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[14.98, 1.35, -6.0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.8, 2.7]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[14.98, 1.35, -10.2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.8, 2.7]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>

      {/* ── Le vocho (placeholder — modèle 3D pipeline à venir) — dans l'axe
          est-ouest, nez vers l'arche du patio (entré depuis la rue) ── */}
      <group position={[12.2, 0, -8.3]} rotation={[0, Math.PI, 0]}>
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

      {/* ── Pneus empilés (coin sud-ouest) + bidons (coin nord-est) ── */}
      {[0.13, 0.39, 0.65].map((py, i) => (
        <mesh key={py} position={[9.5 - i * 0.03, py, -10.15 + (i % 2) * 0.05]} rotation={[0, i, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.24, 12]} />
          <meshToonMaterial color={C_TIRE} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
      ))}
      {([[14.35, -5.95, '#8A2A2A'], [14.7, -6.0, '#27547A']] as [number, number, string][]).map(([px, pz, c], i) => (
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
      {[10.8, 13.8].map(px => (
        <group key={px}>
          <pointLight position={[px, 2.2, -8.1]} intensity={0.8} color="#e8d0a0" distance={4.5} decay={2} />
          <mesh position={[px, 2.5, -8.1]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshToonMaterial color="#E8D8B0" emissive="#D8C080" emissiveIntensity={1.0} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[px, 2.62, -8.1]}>
            <cylinderGeometry args={[0.007, 0.007, 0.2, 4]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
