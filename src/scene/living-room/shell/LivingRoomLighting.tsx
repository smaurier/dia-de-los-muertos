// src/scene/living-room/shell/LivingRoomLighting.tsx
// Ambient, hemisphere, and point/directional lights for the living room.

// ─── Lighting ─────────────────────────────────────────────────────────────────
export function LivingRoomLighting() {
  return (
    <>
      {/* Intensities raised (0.10/0.35 → 0.30/0.60): walls and floor switched
          from meshBasicMaterial (unlit) to meshToonMaterial — without this
          correction the whole room fell into the shadow band. */}
      {/* Refs: DARK room, warm light pools (chandelier, candles, lamp, TV, kitchen).
          Overall ambience is low; contrast sets the mood. */}
      <ambientLight intensity={0.13} color="#e8bd80" />
      {/* Tinted shadows: two-colour fill — warm amber from above,
          terracotta bounce from the floor. Areas in shadow pick up these tints
          instead of going grey (milestone 2, visual-refs.md). */}
      <hemisphereLight intensity={0.26} color="#e8bd80" groundColor="#7a4226" />
      {/* Under the chandelier (not inside it: at point-blank the ring saturates to grey) */}
      <pointLight position={[-0.05, 2.0, 0]} intensity={2.8} color="#f0d890" distance={10} decay={2} />
      <directionalLight intensity={0.18} color="#f5c87a" position={[-6, 2, 0]} />
      <pointLight position={[-5.7, 1.6, -4.5]} intensity={0.9} color="#8ab4f8" distance={4} decay={2} />
      {/* pointLight for sideboard removed: each AnimatedCandle has its own local pointLight */}
      {/* Moonlight through the large window (night blue, ref) */}
      <pointLight position={[-6.2, 2, 0.5]} intensity={1.0} color="#8aa4d8" distance={7} decay={2} />
    </>
  )
}
