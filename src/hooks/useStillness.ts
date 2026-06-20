// src/hooks/useStillness.ts
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { usePlayerStore } from '../game/store/playerStore'
import { isPlayerStill, stillnessIntensity } from '../game/systems/stillnessSystem'

interface StillnessState {
  isStill: boolean
  intensity: number
}

export function useStillness(): StillnessState {
  const stateRef = useRef<StillnessState>({ isStill: false, intensity: 0 })

  useFrame(() => {
    const lastMoveTime = usePlayerStore.getState().lastMoveTime
    const now = Date.now()
    stateRef.current = {
      isStill: isPlayerStill(lastMoveTime, now),
      intensity: stillnessIntensity(lastMoveTime, now),
    }
  })

  return stateRef.current
}
