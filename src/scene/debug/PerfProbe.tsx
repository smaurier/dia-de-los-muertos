// src/scene/debug/PerfProbe.tsx
// Panneau de mesure r3f-perf : ?perf dans l'URL — FPS, draw calls,
// triangles, mémoire GPU. À lire AVANT/APRÈS toute optimisation.
// Comparaison culling : ?perf&noculling pour mesurer sans le room culling.
import { Perf } from 'r3f-perf'

const ENABLED = new URLSearchParams(window.location.search).has('perf')

export function PerfProbe() {
  if (!ENABLED) return null
  return <Perf position="top-left" />
}
