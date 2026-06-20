// src/scene/salon/SalonRoom.tsx
import { toonGradient } from '../shared/toonGradient'

const CHAIR_POSITIONS: [number, number, number][] = [
  // Front of table (z=1.1)
  [-3.5, 0, 1.1], [-2.5, 0, 1.1], [-1.5, 0, 1.1], [-0.5, 0, 1.1],
  [0.5, 0, 1.1], [1.5, 0, 1.1], [2.5, 0, 1.1],
  // Back of table (z=-1.1)
  [-3.5, 0, -1.1], [-2.5, 0, -1.1], [-1.5, 0, -1.1], [-0.5, 0, -1.1],
  [0.5, 0, -1.1], [1.5, 0, -1.1], [2.5, 0, -1.1],
  // Left end (x=-4.3)
  [-4.3, 0, -0.35], [-4.3, 0, 0.35],
  // Right end (x=3.3)
  [3.3, 0, -0.35], [3.3, 0, 0.35],
  // 2 extra against wall
  [-6, 0, -3], [-6, 0, -3.8],
]

export function SalonRoom() {
  return (
    <group>
      {/* Éclairage */}
      <ambientLight intensity={0.1} color="#f5c87a" />
      <pointLight position={[0, 3.0, 0]} intensity={2.0} color="#f0d890" distance={14} decay={2} />
      <directionalLight intensity={0.6} color="#f5c87a" position={[-6, 2, 0]} />
      <pointLight position={[6.3, 1.8, 3]} intensity={0.4} color="#8ab4f8" distance={3} decay={2} />

      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshToonMaterial color="#7A5533" gradientMap={toonGradient} />
      </mesh>

      {/* Plafond */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshToonMaterial color="#F0E0C8" gradientMap={toonGradient} />
      </mesh>

      {/* Mur Nord (entrée) — z=5 */}
      <mesh position={[0, 1.6, 5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[14, 3.2]} />
        <meshToonMaterial color="#D4B896" gradientMap={toonGradient} />
      </mesh>

      {/* Mur Sud (cuisine) — z=-5 */}
      <mesh position={[0, 1.6, -5]}>
        <planeGeometry args={[14, 3.2]} />
        <meshToonMaterial color="#D4B896" gradientMap={toonGradient} />
      </mesh>

      {/* Mur Est — x=7 */}
      <mesh position={[7, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 3.2]} />
        <meshToonMaterial color="#C9A87C" gradientMap={toonGradient} />
      </mesh>

      {/* Mur Ouest (fenêtre) — x=-7 */}
      <mesh position={[-7, 1.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 3.2]} />
        <meshToonMaterial color="#C9A87C" gradientMap={toonGradient} />
      </mesh>

      {/* Table centrale */}
      <mesh position={[-0.5, 0.375, 0]}>
        <boxGeometry args={[8, 0.75, 2.2]} />
        <meshToonMaterial color="#5C3010" gradientMap={toonGradient} />
      </mesh>

      {/* 20 chaises */}
      {CHAIR_POSITIONS.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Assise */}
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[0.45, 0.05, 0.45]} />
            <meshToonMaterial color="#3D2010" gradientMap={toonGradient} />
          </mesh>
          {/* Dossier */}
          <mesh position={[0, 0.55, -0.2]}>
            <boxGeometry args={[0.45, 0.6, 0.06]} />
            <meshToonMaterial color="#3D2010" gradientMap={toonGradient} />
          </mesh>
          {/* Pieds */}
          {([[0.18, -0.18], [0.18, 0.18], [-0.18, -0.18], [-0.18, 0.18]] as [number, number][]).map(([px, pz], j) => (
            <mesh key={j} position={[px, 0.1, pz]}>
              <boxGeometry args={[0.04, 0.2, 0.04]} />
              <meshToonMaterial color="#2A1008" gradientMap={toonGradient} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Canapé 3 places — zone TV, droite entrée */}
      {/* Corps */}
      <mesh position={[5, 0.45, 2.5]}>
        <boxGeometry args={[2.8, 0.9, 0.9]} />
        <meshToonMaterial color="#4A3020" gradientMap={toonGradient} />
      </mesh>
      {/* Dossier canapé */}
      <mesh position={[5, 0.95, 2.1]}>
        <boxGeometry args={[2.8, 0.8, 0.15]} />
        <meshToonMaterial color="#3A2010" gradientMap={toonGradient} />
      </mesh>
      {/* Accoudoir gauche */}
      <mesh position={[3.7, 0.65, 2.5]}>
        <boxGeometry args={[0.15, 0.5, 0.9]} />
        <meshToonMaterial color="#3A2010" gradientMap={toonGradient} />
      </mesh>
      {/* Accoudoir droit */}
      <mesh position={[6.3, 0.65, 2.5]}>
        <boxGeometry args={[0.15, 0.5, 0.9]} />
        <meshToonMaterial color="#3A2010" gradientMap={toonGradient} />
      </mesh>

      {/* Repose-pied */}
      <mesh position={[5, 0.2, 3.5]}>
        <boxGeometry args={[1.6, 0.4, 0.5]} />
        <meshToonMaterial color="#3A2010" gradientMap={toonGradient} />
      </mesh>

      {/* Fauteuil */}
      <mesh position={[3, 0.35, 4]}>
        <boxGeometry args={[0.9, 0.7, 0.9]} />
        <meshToonMaterial color="#4A3020" gradientMap={toonGradient} />
      </mesh>
      <mesh position={[3, 0.75, 3.6]}>
        <boxGeometry args={[0.9, 0.7, 0.12]} />
        <meshToonMaterial color="#3A2010" gradientMap={toonGradient} />
      </mesh>

      {/* Télé (mur Est) */}
      <mesh position={[6.85, 1.8, 2.5]}>
        <boxGeometry args={[0.08, 1.0, 1.8]} />
        <meshToonMaterial color="#1a1a1a" gradientMap={toonGradient} emissive="#3a4a6a" emissiveIntensity={0.6} />
      </mesh>

      {/* Buffet / crédence — mur Ouest */}
      <mesh position={[-6.3, 0.5, -2.5]}>
        <boxGeometry args={[0.6, 1.0, 2.0]} />
        <meshToonMaterial color="#4A3010" gradientMap={toonGradient} />
      </mesh>
    </group>
  )
}
