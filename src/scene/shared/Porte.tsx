// src/scene/shared/Porte.tsx
// Porte en bois à gonds, réutilisable. Le group est posé sur le GOND :
// le panneau s'étend en local +z sur `width`. `angle` (radians) tourne le
// panneau autour du gond — 0 = fermée, négatif = ouvre vers -x, positif vers +x
// (pour une porte posée dans un mur d'axe z). Prête pour l'ouverture gameplay.
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'

const C_HANDLE = '#1A1512'

type PorteProps = {
  position: [number, number, number]
  rotationY?: number
  angle?: number
  width?: number
  height?: number
  color?: string
  panelColor?: string
}

export function Porte({
  position,
  rotationY = 0,
  angle = 0,
  width = 0.96,
  height = 2.06,
  color = '#5C3010',
  panelColor = '#4A2808',
}: PorteProps) {
  return (
    <group position={position} rotation={[0, rotationY + angle, 0]}>
      {/* Panneau */}
      <mesh position={[0, height / 2, width / 2]}>
        <boxGeometry args={[0.06, height, width]} />
        <meshToonMaterial color={color} gradientMap={toonGradient} />
        <Outlines thickness={0.016} color="black" />
      </mesh>
      {/* Planches verticales (rainures) */}
      {[0.25, 0.5, 0.75].map(f => (
        <mesh key={f} position={[0.032, height / 2, width * f]}>
          <boxGeometry args={[0.008, height - 0.1, 0.02]} />
          <meshToonMaterial color={panelColor} gradientMap={toonGradient} />
        </mesh>
      ))}
      {/* Traverses haute et basse */}
      {[0.22, height - 0.22].map(ty => (
        <mesh key={ty} position={[0.036, ty, width / 2]}>
          <boxGeometry args={[0.012, 0.14, width - 0.12]} />
          <meshToonMaterial color={panelColor} gradientMap={toonGradient} />
        </mesh>
      ))}
      {/* Poignée (côté opposé au gond) */}
      <mesh position={[0.05, height * 0.48, width - 0.12]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.09, 6]} />
        <meshToonMaterial color={C_HANDLE} gradientMap={toonGradient} />
        <Outlines thickness={0.008} color="black" />
      </mesh>
      <mesh position={[-0.05, height * 0.48, width - 0.12]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.09, 6]} />
        <meshToonMaterial color={C_HANDLE} gradientMap={toonGradient} />
      </mesh>
      {/* Gonds visibles */}
      {[0.3, height - 0.3].map(gy => (
        <mesh key={gy} position={[0, gy, 0.02]}>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 6]} />
          <meshToonMaterial color={C_HANDLE} gradientMap={toonGradient} />
        </mesh>
      ))}
    </group>
  )
}
