// src/scene/chapter3/Corridor.tsx
// Prototype geometry: 2m wide, 8m long, 2.5m high
// Player enters from z=3, mirror at z=-1, adult walks from z=3 to z=-3

export function Corridor() {
  return (
    <group>
      <ambientLight intensity={0.15} color="#f5c87a" />
      <pointLight position={[0, 2.2, 0]} intensity={1.5} color="#f0d89a" distance={6} decay={2} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[2, 8]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.5, 0]}>
        <planeGeometry args={[2, 8]} />
        <meshStandardMaterial color="#2a1f1a" roughness={1} />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-1, 1.25, 0]}>
        <planeGeometry args={[8, 2.5]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.85} />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[1, 1.25, 0]}>
        <planeGeometry args={[8, 2.5]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.85} />
      </mesh>

      {/* End wall (salon direction) */}
      <mesh position={[0, 1.25, -4]}>
        <planeGeometry args={[2, 2.5]} />
        <meshStandardMaterial color="#2e1e15" roughness={1} />
      </mesh>

      {/* Start wall */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 1.25, 4]}>
        <planeGeometry args={[2, 2.5]} />
        <meshStandardMaterial color="#2e1e15" roughness={1} />
      </mesh>
    </group>
  )
}
