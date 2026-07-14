// src/scene/living-room/LivingRoomShell.tsx
import { PapelGarland } from './shell/PapelGarland'
import { SatelliteRooms } from './shell/SatelliteRooms'
import { SceneAuditProbe } from '../debug/sceneAudit'
import { PerfProbe } from '../debug/PerfProbe'
import { LivingRoomLighting } from './shell/LivingRoomLighting'
import { LivingRoomStructure } from './shell/LivingRoomStructure'
import { LivingRoomWindow } from './shell/LivingRoomWindow'
import { DiningArea } from './shell/DiningArea'
import { SofaCorner } from './shell/SofaCorner'
import { Furniture } from './shell/Furniture'
import { Decorations } from './shell/Decorations'

// ─── Scene ────────────────────────────────────────────────────────────────────
export function LivingRoomShell() {
  return (
    <group>
      {/* Lighting */}
      <LivingRoomLighting />

      {/* Structure (floor, ceiling, four walls) */}
      <LivingRoomStructure />

      {/* Satellite rooms + starry sky bubble */}
      <SatelliteRooms />

      {/* Graphics audit (?audit) + perf measurement (?perf) — inactive otherwise */}
      <SceneAuditProbe />
      <PerfProbe />

      {/* Large curtained window (west wall, ref salon-vue-entree-01) */}
      <LivingRoomWindow />

      {/* Papel picado */}
      <PapelGarland />

      {/* Central table + set table + 20 chairs + table candles */}
      <DiningArea />

      {/* South-west lounge corner: footstool, sofa, rug, armchair,
          bassinet, CRT TV + cabinet, and the TV photo frames */}
      <SofaCorner />

      {/* Wall furniture: buffet + candles, zaguán entry corridor
          (with front door), china cabinet */}
      <Furniture />

      {/* Decor: photo frames, cactus, wrought-iron chandelier, serving
          plates, feast, vase, wall candles, tapestry, plants, dresser,
          and baseboards */}
      <Decorations />
    </group>
  )
}
