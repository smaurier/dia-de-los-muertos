// src/game/store/subtitleStore.ts
import { create } from 'zustand'

interface SubtitleState {
  text: string | null
  speaker: string | null
  showSubtitle: (text: string, speaker: string, durationMs?: number) => void
}

let _timer: ReturnType<typeof setTimeout> | null = null

export const useSubtitleStore = create<SubtitleState>((set) => ({
  text: null,
  speaker: null,
  showSubtitle: (text, speaker, durationMs = 2500) => {
    if (_timer) clearTimeout(_timer)
    set({ text, speaker })
    _timer = setTimeout(() => set({ text: null, speaker: null }), durationMs)
  },
}))
