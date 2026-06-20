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

export type GrandUnclePosition = 'couch' | 'buffet' | 'window'
export type SalonArcPhase = 0 | 1 | 2

interface GameState {
  chapter: Chapter
  phase: GamePhase
  salonAudibilityLevel: number
  houseScale: number
  adultHasLeft: boolean
  grandUnclePosition: GrandUnclePosition
  salonArcPhase: SalonArcPhase
  setChapter: (chapter: Chapter) => void
  setPhase: (phase: GamePhase) => void
  setSalonAudibility: (level: number) => void
  setHouseScale: (scale: number) => void
  setAdultHasLeft: (value: boolean) => void
  setGrandUnclePosition: (pos: GrandUnclePosition) => void
  setSalonArcPhase: (phase: SalonArcPhase) => void
}

export const useGameStore = create<GameState>((set) => ({
  chapter: Chapter.THREE,
  phase: GamePhase.EXPLORING,
  salonAudibilityLevel: 0.8,
  houseScale: 1.0,
  adultHasLeft: false,
  grandUnclePosition: 'couch',
  salonArcPhase: 0,
  setChapter: (chapter) => set({ chapter }),
  setPhase: (phase) => set({ phase }),
  setSalonAudibility: (level) =>
    set({ salonAudibilityLevel: Math.max(0, Math.min(1, level)) }),
  setHouseScale: (scale) =>
    set({ houseScale: Math.max(1, Math.min(2, scale)) }),
  setAdultHasLeft: (adultHasLeft) => set({ adultHasLeft }),
  setGrandUnclePosition: (grandUnclePosition) => set({ grandUnclePosition }),
  setSalonArcPhase: (salonArcPhase) => set({ salonArcPhase }),
}))
