// src/scene/rooms/kitchen/KitchenStructure.tsx
// Kitchen shell: floor, ceiling, the three walls (north with an openable door
// to the pantry, west with the blue garden door, east stone wall pierced for
// the hallway door), the azulejos backsplash, and the blue garden door.
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import { Wall } from '../../shared/Wall'
import {
  solTomettes,
  azulejosTalavera,
  murPierre,
} from '../../shared/paintedTextures'
import { AnimatedDoor } from '../../shared/AnimatedDoor'
import { BlueDoor } from '../../shared/BlueDoor'
import {
  C_CEIL,
  C_WOOD_DARK,
  C_WOOD_MED,
  CX,
  CZ,
  CW,
  CD,
} from './kitchenConstants'

// Stone wall PIERCED for the hallway door: a single mesh (ShapeGeometry with a
// hole) → continuous texture over the whole wall, no segments that break the
// UVs. Local: x = length (6.2 m, world z 5.8→12), y = height.
// Door hole: local x∈[0.6,1.6] (world z [6.4,7.4]), y∈[0,2.1].
const stoneWallGeometry = (() => {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.lineTo(6.2, 0)
  shape.lineTo(6.2, 2.9)
  shape.lineTo(0, 2.9)
  shape.closePath()
  const hole = new THREE.Path()
  hole.moveTo(0.6, 0)
  hole.lineTo(1.6, 0)
  hole.lineTo(1.6, 2.1)
  hole.lineTo(0.6, 2.1)
  hole.closePath()
  shape.holes.push(hole)
  const g = new THREE.ShapeGeometry(shape)
  // ShapeGeometry: UV = raw coordinates → normalise to 0..1
  const uv = g.getAttribute('uv')
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 6.2, uv.getY(i) / 2.9)
  return g
})()

export function KitchenStructure() {
  return (
    <>
      {/* ── Terracotta tile floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CX, 0.001, CZ]}>
        <planeGeometry args={[CW, CD]} />
        <meshPhongMaterial map={solTomettes} shininess={40} specular="#4a3420" />
      </mesh>
      {/* ── Ceiling ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[CX, 2.9, CZ]}>
        <planeGeometry args={[CW, CD]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>
      {/* ── North back wall (z=12.0) — adobe, OPENABLE door to the pantry
          x∈[-6.3,-5.3] (the pantry is behind this wall, cf. plan) ── */}
      <Wall position={[-6.65, 1.45, 12.0]} rotation={[0, Math.PI, 0]} size={[0.7, 2.9]} />
      <Wall position={[-2.95, 1.45, 12.0]} rotation={[0, Math.PI, 0]} size={[4.7, 2.9]} />
      <Wall position={[-5.8, 2.5, 12.0]} rotation={[0, Math.PI, 0]} size={[1.0, 0.8]} />
      {/* ── West wall (x=-7.0) — solid adobe. The blue garden door (not
          openable) is applied on it, at the old spot z∈[9.5,10.5] ── */}
      <Wall position={[-7.0, 1.45, CZ]} rotation={[0, Math.PI / 2, 0]} size={[CD, 2.9]} />
      {/* ── East wall (x=-0.6) — stone (ref cuisine-coin-pierres-01), PIERCED
          for the hallway door (z∈[6.4,7.4]): a single holed mesh →
          continuous texture. DoubleSide: also visible from the hallway. ── */}
      <mesh geometry={stoneWallGeometry} position={[-0.6, 0, 5.8]} rotation={[0, -Math.PI / 2, 0]}>
        <meshToonMaterial map={murPierre} gradientMap={toonGradient} side={THREE.DoubleSide} />
      </mesh>
      {/* Frame + closed door to the hallway (applied on the stone) */}
      {[6.4, 7.4].map(dz => (
        <mesh key={dz} position={[-0.66, 1.05, dz]}>
          <boxGeometry args={[0.1, 2.1, 0.08]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      ))}
      <mesh position={[-0.66, 2.12, 6.9]}>
        <boxGeometry args={[0.1, 0.09, 1.08]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      {/* CLOSED by default, interact key to open (opens toward the
          kitchen) → north-east hallway. */}
      <AnimatedDoor id="couloir-cuisine" position={[-0.68, 0, 6.43]} openAngle={-1.9} width={0.94} />

      {/* ── Azulejos backsplash — large panel behind the stove, from the base
          to mid-wall as in the ref entree-02 ── */}
      <Wall position={[-2.2, 1.2, 11.96]} rotation={[0, Math.PI, 0]} size={[2.6, 1.5]} map={azulejosTalavera} />
      {/* Wood trim at the top of the backsplash */}
      <mesh position={[-2.2, 1.97, 11.95]}>
        <boxGeometry args={[2.6, 0.045, 0.03]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
      </mesh>
      {/* Soft glow on the backsplash (otherwise a dark toon band at the back) */}
      <pointLight position={[-2.2, 1.6, 11.2]} intensity={0.8} color="#f5d8a0" distance={2.5} decay={2} />

      {/* ── Blue garden door (west wall, not openable — plan: "door to the
          garden"). Takes the old spot of the pantry door. ── */}
      <BlueDoor position={[-6.96, 0, 10.0]} rotationY={Math.PI / 2} />
    </>
  )
}
