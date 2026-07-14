// src/scene/salon/Couffin.tsx
// Le bébé — 22e présent de la V10. Pas porté (aucune animation de portage
// possible via Mixamo) : il dort dans un couffin en osier posé au pied du
// fauteuil de la grande-tante Rosa, qui veille dessus en sommeillant.
// La couverture respire doucement — seul mouvement, et il suffit.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'

export function Couffin({ position }: { position: [number, number, number] }) {
  const blanketRef = useRef<THREE.Mesh>(null)
  const t = useRef(0)
  useFrame((_, delta) => {
    t.current += delta
    if (blanketRef.current) {
      // Respiration d'un nourrisson endormi : lente, ample de 2 % à peine
      const k = 1 + 0.02 * Math.sin(t.current * 1.8)
      blanketRef.current.scale.set(1, k, 1)
    }
  })

  return (
    <group position={position} rotation={[0, 0.4, 0]}>
      {/* Panier ovale en osier (paroi ouverte) + fond */}
      <mesh position={[0, 0.14, 0]} scale={[1.5, 1, 1]}>
        <cylinderGeometry args={[0.24, 0.19, 0.28, 12, 1, true]} />
        <meshToonMaterial color="#B08850" gradientMap={toonGradient} side={THREE.DoubleSide} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 1, 1]}>
        <circleGeometry args={[0.2, 12]} />
        <meshToonMaterial color="#98784A" gradientMap={toonGradient} />
      </mesh>
      {/* Cerclage d'osier (renfort tressé) */}
      <mesh position={[0, 0.27, 0]} scale={[1.5, 1, 1]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.014, 6, 16]} />
        <meshToonMaterial color="#8A6A42" gradientMap={toonGradient} />
        <Outlines thickness={0.008} color="black" />
      </mesh>
      {/* Capote relevée côté tête */}
      <mesh position={[-0.22, 0.3, 0]} rotation={[0, 0, 0.5]} scale={[1, 0.75, 1]}>
        <sphereGeometry args={[0.2, 10, 8, Math.PI / 2, Math.PI, 0, Math.PI / 2]} />
        <meshToonMaterial color="#A08050" gradientMap={toonGradient} side={THREE.DoubleSide} />
        <Outlines thickness={0.010} color="black" />
      </mesh>
      {/* Matelas + petite tête endormie + couverture qui respire */}
      <mesh position={[0, 0.12, 0]} scale={[1.5, 1, 1]}>
        <cylinderGeometry args={[0.19, 0.19, 0.05, 12]} />
        <meshToonMaterial color="#F2ECDC" gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-0.19, 0.19, 0]}>
        <sphereGeometry args={[0.062, 10, 10]} />
        <meshToonMaterial color="#C08A5A" gradientMap={toonGradient} />
        <Outlines thickness={0.008} color="black" />
      </mesh>
      {/* Mèche */}
      <mesh position={[-0.21, 0.245, 0]}>
        <sphereGeometry args={[0.028, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshToonMaterial color="#2A1A10" gradientMap={toonGradient} />
      </mesh>
      <mesh ref={blanketRef} position={[0.08, 0.17, 0]} scale={[1, 1, 1]}>
        <boxGeometry args={[0.34, 0.09, 0.3]} />
        <meshToonMaterial color="#E8B4C8" gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>
    </group>
  )
}
