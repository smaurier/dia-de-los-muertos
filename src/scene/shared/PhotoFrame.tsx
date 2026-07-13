import { Outlines } from '@react-three/drei'
import { toonGradient } from './toonGradient'

const C_FRAME = '#2A1A08'
const C_PHOTO = '#4A4858'

export function PhotoFrame({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh>
        <boxGeometry args={[0.60, 0.78, 0.05]} />
        <meshToonMaterial color={C_FRAME} gradientMap={toonGradient} />
        <Outlines thickness={0.018} color="black" />
      </mesh>
      <mesh position={[0, 0, 0.028]}>
        <boxGeometry args={[0.50, 0.68, 0.01]} />
        <meshToonMaterial color="#E8E0D0" gradientMap={toonGradient} />
      </mesh>
      <mesh position={[0, 0, 0.034]}>
        <boxGeometry args={[0.40, 0.56, 0.01]} />
        <meshToonMaterial color={C_PHOTO} gradientMap={toonGradient} />
      </mesh>
    </group>
  )
}
