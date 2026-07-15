// src/scene/assets/compileProgressStore.ts
// Bridges compile progress from inside the Canvas (ProgressiveWarmup) to the
// FadeIn overlay outside it. Mirrors how drei's useProgress is a store.
import { create } from 'zustand'

type CompileProgress = {
  progress: number // 0..1
  done: boolean
  setProgress: (p: number) => void
  markDone: () => void
}

export const useCompileProgress = create<CompileProgress>(set => ({
  progress: 0,
  done: false,
  setProgress: progress => set({ progress }),
  markDone: () => set({ done: true }),
}))
