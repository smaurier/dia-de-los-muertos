// src/scene/salon/Salon.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SalonRoom } from './SalonRoom'
import { GrandUncle } from './GrandUncle'
import { FamilyMember } from './FamilyMember'
import { familyConfig } from './familyConfig'
import { useGameStore } from '../../game/store/gameStore'
import { useAudioLayers } from '../../hooks/useAudioLayers'

const ARC_TIMINGS = [240, 480] // secondes : phase 0→1 à 4min, phase 1→2 à 8min

export function Salon() {
  const arcTimer = useRef(0)

  const adultIsNear = false // Salon sandbox : pas de mécanique adulte-couloir
  const setSalonArcPhase = useGameStore(s => s.setSalonArcPhase)
  const salonArcPhase = useGameStore(s => s.salonArcPhase)

  useAudioLayers({ adultIsNear })

  useFrame((_, delta) => {
    arcTimer.current += delta
    if (salonArcPhase === 0 && arcTimer.current > ARC_TIMINGS[0]) {
      setSalonArcPhase(1)
    } else if (salonArcPhase === 1 && arcTimer.current > ARC_TIMINGS[1]) {
      setSalonArcPhase(2)
    }
  })

  return (
    <group>
      <SalonRoom />
      <GrandUncle />
      {familyConfig.map(config => (
        <FamilyMember
          key={config.id}
          config={config}
        />
      ))}
    </group>
  )
}
