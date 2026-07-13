// src/game/store/doorStore.ts
// État d'ouverture des portes interactives. Toutes fermées par défaut.
import { create } from 'zustand'

type DoorState = {
  open: Record<string, boolean>
  toggleDoor: (id: string) => void
  isOpen: (id: string) => boolean
}

export const useDoorStore = create<DoorState>((set, get) => ({
  open: {},
  toggleDoor: (id) => set(s => ({ open: { ...s.open, [id]: !s.open[id] } })),
  isOpen: (id) => !!get().open[id],
}))
