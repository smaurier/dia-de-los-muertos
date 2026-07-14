// src/scene/rooms/Kitchen.tsx
// Cuisine familiale (x∈[-7,-0.6], z∈[5.8,12.0]) — accès depuis l'arche nord du salon.
// Refs : cuisine-entree-01/02.png, cuisine-coin-pierres-01/02.png
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import {
  boisSombre,
} from '../shared/paintedTextures'
import { Prop } from '../shared/Prop'
import { PhotoFrame } from '../shared/PhotoFrame'
import {
  C_IRON,
  C_WOOD_DARK,
  C_WOOD_MED,
  C_CERAMIC,
  C_CANDLE,
  C_FLAME,
} from './kitchen/kitchenConstants'
import { KitchenStructure } from './kitchen/KitchenStructure'
import { Stove } from './kitchen/Stove'
import { KitchenLighting } from './kitchen/KitchenLighting'

export function Kitchen() {
  return (
    <group>
      <KitchenStructure />

      <Stove />

      {/* ── Étagère murale + ustensiles suspendus (mur du fond, à l'ouest du fogón) ── */}
      <group position={[-4.0, 0, 11.94]}>
        {/* Planche */}
        <mesh position={[0, 1.68, 0]}>
          <boxGeometry args={[1.55, 0.042, 0.22]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        {/* 2 supports */}
        {[-0.62, 0.62].map(sx => (
          <mesh key={sx} position={[sx, 1.52, 0.04]}>
            <boxGeometry args={[0.040, 0.32, 0.22]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
        ))}
        {/* Ollas sur l'étagère */}
        <group position={[-0.50, 1.72, 0.04]}>
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.08, 0.065, 0.18, 10]} />
            <meshToonMaterial color="#B87040" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[0, 0.186, 0]}>
            <cylinderGeometry args={[0.048, 0.075, 0.048, 10]} />
            <meshToonMaterial color="#A06030" gradientMap={toonGradient} />
          </mesh>
        </group>
        <group position={[0.08, 1.72, 0.04]}>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.072, 0.065, 0.16, 8]} />
            <meshToonMaterial color="#707880" gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        </group>
        <group position={[0.52, 1.72, 0.04]}>
          <mesh position={[0, 0.065, 0]}>
            <cylinderGeometry args={[0.062, 0.055, 0.13, 8]} />
            <meshToonMaterial color="#606870" gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        </group>
        {/* Tringle à ustensiles */}
        <mesh position={[0, 1.54, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.009, 0.009, 1.45, 5]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
        {([-0.52, -0.22, 0.12, 0.46] as number[]).map((ux, ui) => (
          <group key={ui} position={[ux, 1.54, 0.06]}>
            <mesh position={[0, -0.042, 0]}>
              <boxGeometry args={[0.013, 0.082, 0.013]} />
              <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            </mesh>
            <mesh position={[0, ui % 2 === 0 ? -0.225 : -0.185, 0]}>
              <cylinderGeometry args={ui % 2 === 0 ? [0.040, 0.010, 0.28, 8] : [0.012, 0.012, 0.24, 6]} />
              <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
              <Outlines thickness={0.006} color="black" />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── Table cuisine au centre de la pièce (ref entree-01/02) ── */}
      <group position={[-3.8, 0, 8.9]}>
        <mesh position={[0, 0.76, 0]}>
          <boxGeometry args={[1.20, 0.055, 0.80]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0, 0.79, 0]}>
          <boxGeometry args={[1.08, 0.010, 0.70]} />
          <meshToonMaterial color="#F0E8D8" gradientMap={toonGradient} />
        </mesh>
        {([-0.50, 0.50] as number[]).flatMap(lx =>
          ([-0.30, 0.30] as number[]).map((lz, j) => (
            <mesh key={`${lx}${j}`} position={[lx, 0.37, lz]}>
              <cylinderGeometry args={[0.036, 0.042, 0.74, 7]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
              <Outlines thickness={0.012} color="black" />
            </mesh>
          ))
        )}
        {/* Olla en terre cuite + cempasúchil */}
        <group position={[-0.20, 0.79, 0.05]}>
          <mesh position={[0, 0.095, 0]}>
            <cylinderGeometry args={[0.088, 0.068, 0.19, 10]} />
            <meshToonMaterial color="#C07040" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          {([[0, 0.24, 0], [-0.06, 0.22, 0.04], [0.07, 0.21, -0.03]] as [number, number, number][]).map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.036, 7, 7]} />
              <meshToonMaterial color="#E8821E" gradientMap={toonGradient} />
              <Outlines thickness={0.007} color="black" />
            </mesh>
          ))}
        </group>
        {/* Bougie table */}
        <group position={[0.28, 0.79, -0.12]}>
          <mesh position={[0, 0.062, 0]}>
            <cylinderGeometry args={[0.022, 0.025, 0.124, 7]} />
            <meshToonMaterial color={C_CANDLE} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 0.148, 0]}>
            <coneGeometry args={[0.022, 0.058, 6]} />
            <meshToonMaterial color={C_FLAME} gradientMap={toonGradient} emissive="#FF4400" emissiveIntensity={1.5} />
          </mesh>
          <pointLight position={[0, 0.18, 0]} intensity={0.55} color="#FF8833" distance={1.6} decay={2} />
        </group>
        {/* Tasse céramique */}
        <mesh position={[0.22, 0.80, 0.18]}>
          <cylinderGeometry args={[0.055, 0.045, 0.068, 9]} />
          <meshToonMaterial color={C_CERAMIC} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
        {/* Pain / tortillas */}
        <mesh position={[0.05, 0.80, -0.22]} scale={[1.6, 0.7, 1.0]}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshToonMaterial color="#D9B98A" gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      </group>

      {/* ── Chaises cuisine : une au sud face à la table, une à l'ouest (ref) ── */}
      <Prop
        url="/models/props/chaise.glb?v=3"
        color={C_WOOD_DARK}
        position={[-3.6, 0, 8.05]}
        rotationY={0}
        targetHeight={0.95}
      />
      <Prop
        url="/models/props/chaise.glb?v=3"
        color={C_WOOD_DARK}
        position={[-4.85, 0, 8.9]}
        rotationY={Math.PI / 2}
        targetHeight={0.95}
      />

      {/* ── Ofrenda de cuisine — contre le mur ouest (ref coin-pierres-02) ── */}
      <group position={[-6.72, 0, 7.6]}>
        <mesh position={[0, 0.44, 0]}>
          <boxGeometry args={[0.50, 0.88, 0.34]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        <mesh position={[0, 0.90, 0]}>
          <boxGeometry args={[0.54, 0.030, 0.38]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
        </mesh>
        {/* Bouquet cempasúchil */}
        <group position={[-0.08, 0.93, 0.05]}>
          <mesh position={[0, 0.095, 0]}>
            <cylinderGeometry args={[0.052, 0.062, 0.19, 9]} />
            <meshToonMaterial color={C_CERAMIC} gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          {([[0, 0.28, 0], [-0.07, 0.26, 0.04], [0.06, 0.25, -0.04], [0.03, 0.23, 0.07]] as [number, number, number][]).map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.042, 7, 7]} />
              <meshToonMaterial color="#E8821E" gradientMap={toonGradient} />
              <Outlines thickness={0.008} color="black" />
            </mesh>
          ))}
        </group>
        {/* Bougie ofrenda */}
        <group position={[0.12, 0.93, -0.06]}>
          <mesh position={[0, 0.068, 0]}>
            <cylinderGeometry args={[0.023, 0.027, 0.136, 7]} />
            <meshToonMaterial color={C_CANDLE} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 0.155, 0]}>
            <coneGeometry args={[0.023, 0.062, 6]} />
            <meshToonMaterial color={C_FLAME} gradientMap={toonGradient} emissive="#FF4400" emissiveIntensity={1.5} />
          </mesh>
          <pointLight position={[0, 0.18, 0]} intensity={0.65} color="#FF8833" distance={1.4} decay={2} />
        </group>
        {/* Calavera déco */}
        <mesh position={[0, 1.04, 0.10]}>
          <sphereGeometry args={[0.072, 10, 10]} />
          <meshToonMaterial color="#F5F0E8" gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {[-0.032, 0.032].map(dx => (
          <mesh key={dx} position={[dx, 1.074, 0.172]}>
            <circleGeometry args={[0.018, 8]} />
            <meshToonMaterial color="#1A1010" gradientMap={toonGradient} />
          </mesh>
        ))}
        <PhotoFrame position={[-0.22, 1.78, 0]} rotY={Math.PI / 2} />
      </group>

      <KitchenLighting />

      {/* Cadre photo mur fond, près du coin en pierres */}
      <PhotoFrame position={[-0.95, 1.82, 11.96]} rotY={Math.PI} />

      {/* ── Frigo années 90 (coin nord-ouest) : aimants + photos d'école ── */}
      <group position={[-6.62, 0, 11.3]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.82, 0]}>
          <boxGeometry args={[0.68, 1.64, 0.64]} />
          <meshToonMaterial color="#E4E0D2" gradientMap={toonGradient} />
          <Outlines thickness={0.018} color="black" />
        </mesh>
        {/* Séparation congélateur + poignées chromées */}
        <mesh position={[0, 1.18, 0.325]}>
          <boxGeometry args={[0.66, 0.02, 0.012]} />
          <meshToonMaterial color="#B8B4A8" gradientMap={toonGradient} />
        </mesh>
        {[0.85, 1.32].map(py => (
          <mesh key={py} position={[-0.26, py, 0.335]}>
            <boxGeometry args={[0.035, py > 1 ? 0.18 : 0.3, 0.02]} />
            <meshToonMaterial color="#9A968A" gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        ))}
        {/* Aimants colorés + deux photos d'école aux coins racornis */}
        {([[0.12, 1.42, '#C0392B'], [-0.05, 1.35, '#27AE60'], [0.2, 1.28, '#F1C40F'], [-0.14, 0.98, '#2980B9'], [0.05, 0.6, '#E67E22']] as [number, number, string][]).map(([dx, py, c], i) => (
          <mesh key={i} position={[dx, py, 0.335]}>
            <cylinderGeometry args={[0.022, 0.022, 0.012, 8]} />
            <meshToonMaterial color={c} gradientMap={toonGradient} />
          </mesh>
        ))}
        {([[0.1, 0.95, 0.12], [-0.08, 0.72, -0.2]] as [number, number, number][]).map(([dx, py, rot], i) => (
          <mesh key={i} position={[dx, py, 0.333]} rotation={[0, 0, rot]}>
            <planeGeometry args={[0.09, 0.12]} />
            <meshToonMaterial color="#D8D2C0" gradientMap={toonGradient} />
          </mesh>
        ))}
      </group>

      {/* ── Évier sous l'étagère murale : cuve + vaisselle sale + torchon ── */}
      <group position={[-4.0, 0, 11.68]}>
        {/* Caisson bois + plan */}
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[1.1, 0.84, 0.56]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0, 0.865, 0]}>
          <boxGeometry args={[1.16, 0.05, 0.6]} />
          <meshToonMaterial color="#D8D2C2" gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {/* Cuve encastrée + robinet col de cygne */}
        <mesh position={[-0.2, 0.895, 0]}>
          <boxGeometry args={[0.44, 0.02, 0.4]} />
          <meshToonMaterial color="#8A929A" gradientMap={toonGradient} />
        </mesh>
        <mesh position={[-0.2, 0.98, -0.2]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.26, 6]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
        {/* Pile de vaisselle sale instable */}
        {[0, 1, 2, 3].map(i => (
          <mesh key={i} position={[0.28 + (i % 2) * 0.025, 0.9 + i * 0.028, (i % 2) * 0.02]} rotation={[0.05 * (i % 2), i * 0.4, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.014, 10]} />
            <meshToonMaterial color={['#E8E0D0', '#D8CDB8', '#E0D8C4', '#CFC8B4'][i]} gradientMap={toonGradient} />
            <Outlines thickness={0.006} color="black" />
          </mesh>
        ))}
        <mesh position={[0.28, 1.02, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.08, 8]} />
          <meshToonMaterial color="#C07040" gradientMap={toonGradient} />
        </mesh>
        {/* Torchon sur le bord */}
        <mesh position={[0.54, 0.78, 0.1]} rotation={[0, 0, 0.06]}>
          <boxGeometry args={[0.04, 0.3, 0.22]} />
          <meshToonMaterial color="#B05038" gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      </group>

      {/* ── Radio ancienne sur l'étagère murale, ÉTEINTE (fiche : dialogue
          silencieux avec la couche MEMORY) ── */}
      <group position={[-4.2, 1.72, 11.98]}>
        <mesh position={[0, 0.075, 0]}>
          <boxGeometry args={[0.24, 0.15, 0.1]} />
          <meshToonMaterial color="#6E4A2A" gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        <mesh position={[-0.045, 0.075, 0.052]}>
          <planeGeometry args={[0.1, 0.09]} />
          <meshToonMaterial color="#3A2E1E" gradientMap={toonGradient} />
        </mesh>
        {[0.05, 0.09].map(dx => (
          <mesh key={dx} position={[dx, 0.06, 0.052]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.014, 8]} />
            <meshToonMaterial color="#C8B888" gradientMap={toonGradient} />
          </mesh>
        ))}
        <mesh position={[0.1, 0.19, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.004, 0.004, 0.14, 4]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
      </group>

      {/* ── Virgen de Guadalupe + calendrier de carnicería (mur sud, à
          l'ouest de l'arche) ── */}
      <group position={[-4.7, 1.9, 6.16]}>
        <mesh>
          <boxGeometry args={[0.22, 0.3, 0.02]} />
          <meshToonMaterial color="#C8A040" gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        {/* Silhouette : manteau étoilé + auréole dorée */}
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[0.17, 0.25]} />
          <meshToonMaterial color="#1E3A5E" gradientMap={toonGradient} />
        </mesh>
        <mesh position={[0, 0.02, 0.014]} scale={[1, 1.6, 1]}>
          <circleGeometry args={[0.05, 10]} />
          <meshToonMaterial color="#2E6B4F" gradientMap={toonGradient} />
        </mesh>
        <mesh position={[0, 0.055, 0.013]} scale={[1, 1.3, 1]}>
          <ringGeometry args={[0.055, 0.075, 12]} />
          <meshToonMaterial color="#E8C060" emissive="#C8A040" emissiveIntensity={0.3} gradientMap={toonGradient} />
        </mesh>
      </group>
      <group position={[-5.45, 1.78, 6.16]}>
        <mesh>
          <planeGeometry args={[0.24, 0.34]} />
          <meshToonMaterial color="#E8E2D0" gradientMap={toonGradient} />
        </mesh>
        <mesh position={[0, 0.09, 0.002]}>
          <planeGeometry args={[0.2, 0.12]} />
          <meshToonMaterial color="#B05038" gradientMap={toonGradient} />
        </mesh>
        {[0, 1, 2].map(r => (
          <mesh key={r} position={[0, -0.04 - r * 0.05, 0.002]}>
            <planeGeometry args={[0.19, 0.02]} />
            <meshToonMaterial color="#8A8272" gradientMap={toonGradient} />
          </mesh>
        ))}
      </group>

      {/* ── Desserte du coin pierre : bol de pétales de cempasúchil (fiche :
          plante le chemin de pétales) + molcajete ── */}
      <group position={[-1.25, 0, 11.45]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.7, 0.06, 0.44]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {([-0.3, 0.3] as number[]).flatMap(dx =>
          ([-0.17, 0.17] as number[]).map((dz, j) => (
            <mesh key={`${dx}-${j}`} position={[dx, 0.19, dz]}>
              <cylinderGeometry args={[0.022, 0.026, 0.38, 6]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            </mesh>
          ))
        )}
        {/* Bol de pétales */}
        <group position={[-0.15, 0.43, 0]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.13, 0.09, 0.1, 10]} />
            <meshToonMaterial color="#C07040" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.115, 0.115, 0.02, 10]} />
            <meshToonMaterial color="#E8940A" gradientMap={toonGradient} />
          </mesh>
          {([[0.16, 0.02], [0.2, -0.06], [-0.19, 0.05]] as [number, number][]).map(([dx, dz], i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, i * 1.1]} position={[dx, -0.415, dz]}>
              <circleGeometry args={[0.035, 6]} />
              <meshToonMaterial color="#E8940A" gradientMap={toonGradient} />
            </mesh>
          ))}
        </group>
        {/* Molcajete */}
        <group position={[0.18, 0.43, 0.02]}>
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.085, 9, 7, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshToonMaterial color="#4A4642" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[0.05, 0.11, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.02, 0.028, 0.09, 7]} />
            <meshToonMaterial color="#4A4642" gradientMap={toonGradient} />
          </mesh>
        </group>
      </group>

      {/* ── Panier du chien, usé, VIDE (fiche : il préfère le dessous de
          table — et ce soir il est au salon) ── */}
      <group position={[-1.35, 0, 8.3]}>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.3, 0.26, 0.14, 12, 1, true]} />
          <meshToonMaterial color="#A08050" gradientMap={toonGradient} side={THREE.DoubleSide} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.28, 12]} />
          <meshToonMaterial color="#8A6A42" gradientMap={toonGradient} />
        </mesh>
        {/* Vieille couverture roulée en boule dedans */}
        <mesh position={[0.04, 0.07, -0.03]} scale={[1.3, 0.5, 1]}>
          <sphereGeometry args={[0.13, 8, 8]} />
          <meshToonMaterial color="#6E5A5A" gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      </group>
    </group>
  )
}
