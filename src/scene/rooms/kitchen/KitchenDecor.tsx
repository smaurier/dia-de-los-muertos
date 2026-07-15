// src/scene/rooms/kitchen/KitchenDecor.tsx
// Wall and floor decor: a standalone photo frame, the Virgen de Guadalupe +
// butcher calendar, and the dog's (empty) basket.
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import { PhotoFrame } from '../../shared/PhotoFrame'

export function KitchenDecor() {
  return (
    <>
      {/* Photo frame on the back wall, near the stone corner */}
      <PhotoFrame position={[-0.95, 1.82, 11.96]} rotY={Math.PI} />

      {/* ── Virgen de Guadalupe + butcher's calendar (south wall, west of
          the archway) ── */}
      <group position={[-4.7, 1.9, 6.16]}>
        <mesh>
          <boxGeometry args={[0.22, 0.3, 0.02]} />
          <meshToonMaterial color="#C8A040" gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        {/* Silhouette: starry mantle + golden halo */}
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

      {/* ── Dog's basket, worn, EMPTY (bio note: he prefers under the
          table — and tonight he's in the living room) ── */}
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
        {/* Old blanket rolled up in a ball inside */}
        <mesh position={[0.04, 0.07, -0.03]} scale={[1.3, 0.5, 1]}>
          <sphereGeometry args={[0.13, 8, 8]} />
          <meshToonMaterial color="#6E5A5A" gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      </group>
    </>
  )
}
