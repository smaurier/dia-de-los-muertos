// src/scene/shared/GlassReflector.tsx
// Shared "window glass" reflector preset: the exact material used on every
// satellite-room window. Bakes the 11 props that were duplicated across rooms;
// only `zone` varies. Renders as a material (attaches to the parent mesh).
import * as THREE from 'three'
import { ZoneReflectorMaterial } from './ZoneReflector'
import type { ZoneId } from '../../game/systems/roomZones'

export function GlassReflector({ zone }: { zone: ZoneId }) {
  return (
    <ZoneReflectorMaterial
      zone={zone}
      transparent
      opacity={0.68}
      color="#e8f0f4"
      resolution={256}
      mirror={1}
      mixStrength={1.4}
      blur={[0, 0]}
      roughness={0.06}
      metalness={0}
      depthScale={0}
      side={THREE.DoubleSide}
    />
  )
}
