// src/scene/living-room/shell/SatelliteRooms.tsx
// Satellite rooms + sky bubble.
import { Kitchen } from '../../rooms/Kitchen'
import { Pantry } from '../../rooms/Pantry'
import { Corridor } from '../../rooms/Corridor'
import { Bedroom1 } from '../../rooms/Bedroom1'
import { Bedroom2 } from '../../rooms/Bedroom2'
import { Bathroom } from '../../rooms/Bathroom'
import { StorageRoom } from '../../rooms/StorageRoom'
import { Office } from '../../rooms/Office'
import { Patio } from '../../rooms/Patio'
import { Garage } from '../../rooms/Garage'
import { SkyDome } from '../../shared/SkyDome'

export function SatelliteRooms() {
  return (
    <>
      {/* ─── Satellite rooms. (Room culling removed: walls are shared between
          rooms — visible holes — and profiling showed the dominant cost is
          elsewhere: reflectors + per-frame fixed costs.) */}
      {/* Named group: hidden DURING the living-room reflector passes (their
          reflection only shows the living room — re-rendering the whole house
          cost ~35 ms/frame, measured by bisection). ReflectorThrottle. */}
      <group name="satellite-rooms">
        <Kitchen />
        <Pantry />
        <Corridor />
        <Bedroom1 />
        <Bedroom2 />
        <Bathroom />
        <StorageRoom />
        <Office />
        <Patio />
        <Garage />
      </group>

      {/* ─── Starry sky bubble above the whole house ─── */}
      <SkyDome />
    </>
  )
}
