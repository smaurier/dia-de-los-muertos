// src/scene/salon/LivingRoom.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { LivingRoomShell } from './LivingRoomShell'
import { GrandUncle } from './GrandUncle'
import { Mama } from './Mama'
import { Dog } from './Dog'
import { FamilyMember } from './FamilyMember'
import { familyConfig } from './familyConfig'
import { useGameStore } from '../../game/store/gameStore'
import { useAudioLayers } from '../../hooks/useAudioLayers'
import { getGrandUnclePosition } from '../../game/systems/npcSystem'
import { NO_NPC } from '../debug/perfFlags'

const ARC_TIMINGS = [240, 480] // seconds: phase 0→1 at 4min, phase 1→2 at 8min
const SALON_RADIUS = 8  // m — beyond this = player has left the salon

export function LivingRoom() {
  const arcTimer   = useRef(0)
  const wasInside  = useRef(true)
  const exitSeed   = useRef(Math.floor(Math.random() * 10000))

  const adultIsNear           = false
  const setLivingRoomArcPhase      = useGameStore(s => s.setLivingRoomArcPhase)
  const livingRoomArcPhase         = useGameStore(s => s.livingRoomArcPhase)
  const setGrandUnclePosition = useGameStore(s => s.setGrandUnclePosition)

  useAudioLayers({ adultIsNear })

  useFrame(({ camera }, delta) => {
    arcTimer.current += delta
    if (livingRoomArcPhase === 0 && arcTimer.current > ARC_TIMINGS[0]) {
      setLivingRoomArcPhase(1)
    } else if (livingRoomArcPhase === 1 && arcTimer.current > ARC_TIMINGS[1]) {
      setLivingRoomArcPhase(2)
    }

    // Grand-uncle: repositions when player leaves the salon
    const dist = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2)
    const inside = dist <= SALON_RADIUS
    if (wasInside.current && !inside) {
      exitSeed.current = (exitSeed.current * 1664525 + 1013904223) >>> 0
      setGrandUnclePosition(getGrandUnclePosition(exitSeed.current))
    }
    wasInside.current = inside
  })

  return (
    <group>
      <LivingRoomShell />
      {/* ?nonpc: perf bisect — cuts all characters */}
      {!NO_NPC && (
        <>
          <GrandUncle />
          <Mama />
          <Dog />
          {familyConfig.filter(c => c.id !== 'maman').map(config => (
            <FamilyMember
              key={config.id}
              config={config}
            />
          ))}
        </>
      )}
    </group>
  )
}
