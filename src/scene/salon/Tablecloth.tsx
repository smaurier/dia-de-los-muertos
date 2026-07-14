// src/scene/salon/Tablecloth.tsx
//
// Tablecloth for the main feast table — minimal static geometry.
// 1 top panel + 4 full-width side panels that naturally overlap at corners.

import { useMemo } from 'react'
import * as THREE from 'three'
import { toonGradient } from '../shared/toonGradient'
import { nappeBrodee } from '../shared/paintedTextures'

const TABLE_Y    = 0.803
const TABLE_XMIN = -4.30
const TABLE_XMAX =  4.20
const TABLE_ZMIN = -0.05
const TABLE_ZMAX =  2.05
const TABLE_W    = TABLE_XMAX - TABLE_XMIN
const TABLE_D    = TABLE_ZMAX - TABLE_ZMIN
const TABLE_CX   = (TABLE_XMIN + TABLE_XMAX) / 2
const TABLE_CZ   = (TABLE_ZMIN + TABLE_ZMAX) / 2

const SKIRT_BOT  = 0.30   // ~30cm off floor → table legs clearly visible
const SKIRT_H    = TABLE_Y - SKIRT_BOT
const SKIRT_CY   = (TABLE_Y + SKIRT_BOT) / 2

export function Tablecloth() {
  const tex = useMemo(() => {
    const t = nappeBrodee.clone()
    t.wrapS = THREE.MirroredRepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2, 1)
    t.needsUpdate = true
    return t
  }, [])

  const texSide = useMemo(() => {
    const t = nappeBrodee.clone()
    t.wrapS = THREE.MirroredRepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(1, 0.5)
    t.needsUpdate = true
    return t
  }, [])

  const matProps = {
    gradientMap: toonGradient,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  } as const

  return (
    <group>
      {/* ── Top ── */}
      <mesh position={[TABLE_CX, TABLE_Y, TABLE_CZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[TABLE_W, TABLE_D]} />
        <meshToonMaterial map={tex} {...matProps} />
      </mesh>

      {/* ── Side panels — full width, natural overlap at corners ── */}
      <mesh position={[TABLE_CX, SKIRT_CY, TABLE_ZMIN]}>
        <planeGeometry args={[TABLE_W, SKIRT_H]} />
        <meshToonMaterial map={texSide} {...matProps} />
      </mesh>
      <mesh position={[TABLE_CX, SKIRT_CY, TABLE_ZMAX]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[TABLE_W, SKIRT_H]} />
        <meshToonMaterial map={texSide} {...matProps} />
      </mesh>
      <mesh position={[TABLE_XMAX, SKIRT_CY, TABLE_CZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[TABLE_D, SKIRT_H]} />
        <meshToonMaterial map={texSide} {...matProps} />
      </mesh>
      <mesh position={[TABLE_XMIN, SKIRT_CY, TABLE_CZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[TABLE_D, SKIRT_H]} />
        <meshToonMaterial map={texSide} {...matProps} />
      </mesh>
    </group>
  )
}
