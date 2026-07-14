// src/scene/living-room/shell/PapelGarland.tsx
// Papel picado: catenary garlands with perforated flags (alphaMap),
// each flag hanging from the string with its own phase (gentle indoor sway).
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { toonGradient } from '../../shared/toonGradient'
import { papelTextures } from '../../shared/papelTexture'
import { NO_PAPEL } from '../../debug/perfFlags'
import { PAPEL_COLORS, PAPEL_X, FLAG_X } from './livingRoomConstants'

const FLAG_W = 0.30
const FLAG_H = 0.38

// Garland runs along Z (local X of the strand, group rotated π/2),
// anchored under the vigas (bottom of beam at y=3.04).
const STRAND_X0 = -5.4
const STRAND_X1 = 5.4
const STRAND_Y = 3.02
const STRAND_SAG = 0.34

function strandY(x: number): number {
  const t = (x - STRAND_X0) / (STRAND_X1 - STRAND_X0)
  return STRAND_Y - STRAND_SAG * 4 * t * (1 - t)
}

// Individual flag: vertex undulation (soft paper, no wind — indoors),
// zero amplitude at the attachment point, maximum at the bottom.
// The folded hem over the string shows how the flag is attached.
function PapelFlag({ x, y, color, tex, phase }: {
  x: number; y: number; color: string; tex: THREE.Texture; phase: number
}) {
  const geo = useMemo(() => new THREE.PlaneGeometry(FLAG_W, FLAG_H, 6, 8), [])
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo])
  const t = useRef(phase)

  useFrame((_, delta) => {
    t.current += delta
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3]
      const by = base[i * 3 + 1]
      const hang = (FLAG_H / 2 - by) / FLAG_H  // 0 at attachment, 1 at bottom
      pos.setZ(i, Math.sin(t.current * 1.1 + bx * 5 + by * 3) * 0.022 * hang)
    }
    pos.needsUpdate = true
    // (no computeVertexNormals per frame: ×52 flags was one of the measured
    // fixed CPU costs — 2 cm undulation doesn't change shading)
  })

  return (
    <group position={[x, y, 0]}>
      {/* Hem: strip of the same paper folded over the string */}
      <mesh position={[0, 0.002, 0]}>
        <boxGeometry args={[FLAG_W, 0.030, 0.026]} />
        <meshToonMaterial color={color} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[0, -FLAG_H / 2 + 0.012, 0]} geometry={geo}>
        <meshToonMaterial
          color={color}
          gradientMap={toonGradient}
          alphaMap={tex}
          alphaTest={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// sx: X position (under a viga). Group rotated π/2: local X becomes world Z
// → garland crosses the room as in the ref.
function PapelStrand({ sx, si }: { sx: number; si: number }) {
  const stringGeo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 24; i++) {
      const x = STRAND_X0 + (i / 24) * (STRAND_X1 - STRAND_X0)
      pts.push(new THREE.Vector3(x, strandY(x), 0))
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.0035, 5, false)
  }, [])

  return (
    <group position={[sx, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <mesh geometry={stringGeo}>
        <meshToonMaterial color="#7A5A3A" gradientMap={toonGradient} />
      </mesh>
      {/* Attachments on the beam at both ends */}
      {[STRAND_X0, STRAND_X1].map(ax => (
        <mesh key={ax} position={[ax, 3.05, 0]}>
          <boxGeometry args={[0.03, 0.06, 0.03]} />
          <meshToonMaterial color="#7A5A3A" gradientMap={toonGradient} />
        </mesh>
      ))}
      {FLAG_X.map((fx, fi) => (
        <PapelFlag
          key={fi}
          x={fx}
          y={strandY(fx)}
          color={PAPEL_COLORS[(si * FLAG_X.length + fi) % PAPEL_COLORS.length]}
          tex={papelTextures[(si + fi) % papelTextures.length]}
          phase={si * 2.1 + fi * 0.9}
        />
      ))}
    </group>
  )
}

export function PapelGarland() {
  if (NO_PAPEL) return null
  return (
    <>
      {PAPEL_X.map((sx, si) => <PapelStrand key={si} sx={sx} si={si} />)}
    </>
  )
}
