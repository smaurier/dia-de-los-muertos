// src/hooks/useAudioLayers.ts
import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Howl } from 'howler'
import { AudioLayerManager, HowlPort } from '../audio/AudioLayerManager'
import { AudioLayer } from '../audio/layers'
import { usePlayerStore } from '../game/store/playerStore'
import { stillnessIntensity } from '../game/systems/stillnessSystem'
import { getSongFragment, SongFragment } from '../game/systems/songSystem'
import { useGameStore } from '../game/store/gameStore'

interface UseAudioLayersOptions {
  adultIsNear: boolean
}

function howlFactory(src: string): HowlPort {
  const h = new Howl({ src: [src], loop: true })
  return {
    play: () => h.play(),
    stop: () => h.stop(),
    volume: (v) => h.volume(v),
    fade: (from, to, dur) => h.fade(from, to, dur),
    loop: (l) => h.loop(l),
  }
}

export function useAudioLayers({ adultIsNear }: UseAudioLayersOptions): void {
  const managerRef = useRef<AudioLayerManager | null>(null)

  useEffect(() => {
    // Sources are empty for prototype — swap for real audio files later
    managerRef.current = new AudioLayerManager(howlFactory, {})
    return () => {
      managerRef.current = null
    }
  }, [])

  useFrame(() => {
    const manager = managerRef.current
    if (!manager) return

    const lastMoveTime = usePlayerStore.getState().lastMoveTime
    const chapter = useGameStore.getState().chapter
    const now = Date.now()

    const intensity = stillnessIntensity(lastMoveTime, now)
    manager.applyStillness(intensity)

    const fragment = getSongFragment({
      chapter,
      isStill: intensity > 0.3,
      adultIsNear,
      isAtOfrenda: false,
      isInSalon: false,
    })

    const songVolume =
      fragment === SongFragment.TWO_NOTES ? 0.3 :
      fragment === SongFragment.FRAGMENT  ? 0.5 :
      fragment === SongFragment.FULL      ? 0.8 :
      fragment === SongFragment.IN_CHILD  ? 0.6 : 0

    manager.setVolume(AudioLayer.SONG, songVolume, true)
  })
}
