// src/scene/rooms/kitchen/KitchenLighting.tsx
// Hanging bare bulb (it flickers) + fill lights for the stone wall and stove.
import { BulbFlicker } from './BulbFlicker'

export function KitchenLighting() {
  return (
    <>
      {/* ── Bare bulb hanging above the table — it FLICKERS
          (kitchen sheet: narrative prop) ── */}
      <BulbFlicker />

      {/* ── Fill lights: stone wall (the bulb alone left it in the darkest
          toon band → black wall) + stove glow ── */}
      <pointLight position={[-1.5, 1.8, 9.2]} intensity={1.3} color="#f0c080" distance={4.5} decay={2} />
      <pointLight position={[-2.2, 1.4, 11.0]} intensity={1.0} color="#ff9040" distance={3.5} decay={2} />
    </>
  )
}
