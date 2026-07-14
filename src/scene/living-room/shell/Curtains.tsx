// src/scene/living-room/shell/Curtains.tsx
// CurtainPanel: pleated curtain — subdivided plane, sinusoidal pleats baked
// into the geometry (fuller at the bottom, gathered at the top) + slow vertex
// undulation, like a sheer near a window. Hung by rings on the rod.
// SashFrame: sliding sash frame — 2 stiles + 2 rails (thin wood section),
// placed in its rail groove. The glass pane is shared (single reflector plane).
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../../shared/toonGradient'
import { rideauTexture } from '../../shared/fabricTexture'
import { C_WOOD_DARK, C_WOOD_MED } from './livingRoomConstants'

export const CURTAIN_W = 0.95
export const CURTAIN_H = 2.82
export const CURTAIN_PLEATS = 5

export function CurtainPanel({ z }: { z: number }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(CURTAIN_W, CURTAIN_H, 28, 20)
    const pos = g.getAttribute('position')
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) / CURTAIN_W + 0.5      // 0..1 across the width
      const v = pos.getY(i) / CURTAIN_H + 0.5      // 0 at bottom, 1 at top
      const depth = 0.028 + 0.05 * (1 - v)         // pleats fuller toward bottom
      pos.setZ(i, Math.sin(u * Math.PI * 2 * CURTAIN_PLEATS) * depth)
    }
    g.computeVertexNormals()
    return g
  }, [])
  const base = useMemo(() => Float32Array.from(geo.getAttribute('position').array), [geo])
  const t = useRef(z * 3.7) // phase unique per panel

  useFrame((_, delta) => {
    t.current += delta
    const pos = geo.getAttribute('position')
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3]
      const by = base[i * 3 + 1]
      const bz = base[i * 3 + 2]
      const hang = (CURTAIN_H / 2 - by) / CURTAIN_H // 0 at rod, 1 at floor
      pos.setZ(i, bz + Math.sin(t.current * 0.8 + bx * 4 + by * 1.5) * 0.028 * hang)
    }
    pos.needsUpdate = true
    // (pleat normals baked at init — no per-frame recompute)
  })

  return (
    <group position={[-6.80, 0, z]}>
      {/* Panel (top at 2.94, just below the rings) */}
      <mesh geometry={geo} position={[0, 2.94 - CURTAIN_H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshToonMaterial map={rideauTexture} gradientMap={toonGradient} side={THREE.DoubleSide} />
      </mesh>
      {/* Suspension rings on the rod (one per pleat crest) */}
      {Array.from({ length: CURTAIN_PLEATS + 1 }, (_, i) => (
        <mesh key={i} position={[0, 2.98, -CURTAIN_W / 2 + (i / CURTAIN_PLEATS) * CURTAIN_W]}>
          <torusGeometry args={[0.036, 0.007, 6, 12]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
        </mesh>
      ))}
    </group>
  )
}

// SashFrame: frame of a sliding sash panel — 2 stiles + 2 rails (thin wood),
// placed in its rail groove. The glass pane is shared (single reflector plane).
export function SashFrame({ x, zMin, zMax }: { x: number; zMin: number; zMax: number }) {
  const zc = (zMin + zMax) / 2
  const w = zMax - zMin
  return (
    <group>
      {[zMin + 0.028, zMax - 0.028].map(mz => (
        <mesh key={mz} position={[x, 1.8, mz]}>
          <boxGeometry args={[0.05, 2.04, 0.056]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      ))}
      {[0.815, 2.785].map(my => (
        <mesh key={my} position={[x, my, zc]}>
          <boxGeometry args={[0.05, 0.055, w]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
      ))}
    </group>
  )
}
