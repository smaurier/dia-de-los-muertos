// src/scene/living-room/shell/SofaCorner.tsx
// South-west lounge corner: footstool, L-shaped corner sofa, woven rug, armchair,
// baby bassinet, CRT TV + TV cabinet, and the photo frames around the TV.
import { Outlines, RoundedBox } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import { Prop } from '../../shared/Prop'
import { Sofa } from '../Sofa'
import { TVScreen } from './TVScreen'
import { PhotoFrame } from '../../shared/PhotoFrame'
import { Bassinet } from '../Bassinet'
import { C_WOOD_DARK, C_UPHOLSTERY } from './livingRoomConstants'

export function SofaCorner() {
  return (
    <>
      {/* ─── South-west lounge corner (refs, analysed crops): sofa facing WEST
          (back toward the table), TV against the west wall near the window,
          footstool between the two. The group inherits the old local geometry,
          rotated by π/2 then translated (sofa centre → (-3.6,-3.3)). ── */}
      <group position={[-0.7, 0, 0.8]} rotation={[0, Math.PI / 2, 0]}>
      {/* (placeholder sofa removed — replaced by the textured model
          canape.glb, placed outside this group in world coordinates) */}

      {/* ─── Footstool (offset north: clears the sofa's corner return) ─── */}
      <mesh position={[4.75, 0.14, -3.85]}>
        <boxGeometry args={[1.55, 0.28, 0.52]} />
        <meshToonMaterial color="#1E1008" gradientMap={toonGradient} />
        <Outlines thickness={0.018} color="black" />
      </mesh>
      <RoundedBox args={[1.42, 0.12, 0.40]} radius={0.025} smoothness={3} position={[4.75, 0.30, -3.85]}>
        <meshToonMaterial color={C_UPHOLSTERY} gradientMap={toonGradient} />
        <Outlines thickness={0.016} color="black" />
      </RoundedBox>
      {([4.07, 5.43] as number[]).flatMap(px =>
        ([-3.63, -4.07] as number[]).map((pz, j) => (
          <mesh key={`${px}-${j}`} position={[px, 0.07, pz]}>
            <cylinderGeometry args={[0.028, 0.030, 0.14, 6]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
        ))
      )}

      {/* (armchair moved out of the group: replaced in world coordinates near the
          window — inside the transformed group it would end up in front of the TV screen) */}

      {/* (coloured cushions removed: the canape.glb model has its own) */}
      </group>

      {/* ─── Corner sofa — canape-full.glb (body + separate cushions).
          Cushions: MeshToonMaterial + PNG pattern (RepeatWrapping), override
          by Object3D.name in Canape.tsx. ────────────────────────────────── */}
      <Sofa
        position={[-3.15, 0, -3.9]}
        rotationY={-Math.PI / 2}
        targetLength={3.6}
      />

      {/* ─── Woven rug under the lounge corner (stripes, visually anchors the L) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.3, 0.012, -3.9]}>
        <planeGeometry args={[2.6, 3.0]} />
        <meshToonMaterial color="#7A4226" gradientMap={toonGradient} />
      </mesh>
      {[-1.25, -0.85, 0.85, 1.25].map((dz2, i) => (
        <mesh key={`rug${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-4.3, 0.014, -3.9 + dz2]}>
          <planeGeometry args={[2.6, 0.12]} />
          <meshToonMaterial color={i % 2 ? '#B05038' : '#C8893A'} gradientMap={toonGradient} />
        </mesh>
      ))}

      {/* ─── Armchair, back against the bottom of the window, facing the room
          (ref entrance-view) ───────────────────────────────────────────────────── */}
      <Prop
        url="/models/props/fauteuil.glb?v=3"
        color={C_UPHOLSTERY}
        position={[-6.42, 0, -0.6]}
        rotationY={Math.PI / 2}
        targetHeight={0.95}
      />
      {/* The baby (22nd guest) sleeps in its bassinet at the foot of the armchair —
          great-aunt Rosa watches over it while dozing */}
      <Bassinet position={[-6.25, 0, 0.35]} />

      {/* ─── 90s CRT TV + TV cabinet — diagonally IN THE south-west CORNER,
          screen toward the north-east: both segments of the L-shaped sofa see it.
          (TV cabinet: dedicated model to come — textured props backlog.) ────────── */}
      <Prop
        url="/models/props/tv.glb?v=3"
        color="#3a3a3e"
        position={[-6.15, 0, -4.95]}
        rotationY={Math.PI / 4}
        targetHeight={1.25}
      />
      {/* Screen: plated on the tube face, TV flicker (simple animated content
          for now — see backlog) */}
      <TVScreen />
      {/* Frames on the west wall around the TV (ref entrance-view) */}
      <PhotoFrame position={[-6.96, 2.3, -2.15]} rotY={Math.PI / 2} />
      <PhotoFrame position={[-6.96, 1.9, -3.5]} rotY={Math.PI / 2} />
    </>
  )
}
