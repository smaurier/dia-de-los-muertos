import { create } from 'zustand'

export enum Chapter {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  NINE = 9,
}

export enum GamePhase {
  HIDING = 'HIDING',
  EXPLORING = 'EXPLORING',
  LOST = 'LOST',
  RETURNING = 'RETURNING',
  END = 'END',
}

interface GameState {
  chapter: Chapter
  phase: GamePhase
  salonAudibilityLevel: number
  houseScale: number
  adultHasLeft: boolean
  setChapter: (chapter: Chapter) => void
  setPhase: (phase: GamePhase) => void
  setSalonAudibility: (level: number) => void
  setHouseScale: (scale: number) => void
  setAdultHasLeft: (value: boolean) => void
}

export const useGameStore = create<GameState>((set) => ({
  chapter: Chapter.THREE,
  phase: GamePhase.EXPLORING,
  salonAudibilityLevel: 0.8,
  houseScale: 1.0,
  adultHasLeft: false,
  setChapter: (chapter) => set({ chapter }),
  setPhase: (phase) => set({ phase }),
  setSalonAudibility: (level) =>
    set({ salonAudibilityLevel: Math.max(0, Math.min(1, level)) }),
  setHouseScale: (scale) =>
    set({ houseScale: Math.max(1, Math.min(2, scale)) }),
  setAdultHasLeft: (adultHasLeft) => set({ adultHasLeft }),
}))
