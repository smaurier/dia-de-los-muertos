// src/game/store/playerStore.ts
import { create } from 'zustand'

interface PlayerState {
  position: [number, number, number]
  lastMoveTime: number
  isHidden: boolean
  setPosition: (pos: [number, number, number]) => void
  setLastMoveTime: (time: number) => void
  setHidden: (hidden: boolean) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  position: [0, 0, 0],
  lastMoveTime: Date.now(),
  isHidden: false,
  setPosition: (position) => set({ position }),
  setLastMoveTime: (lastMoveTime) => set({ lastMoveTime }),
  setHidden: (isHidden) => set({ isHidden }),
}))
