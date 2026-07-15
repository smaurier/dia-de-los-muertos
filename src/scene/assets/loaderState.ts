// Pure ready-detection for the preload gate. "ready" = loading has started
// (active went true once) AND has then been idle (active false) for a debounce.
// No dependence on loaded/error counts → 404-safe.

export type LoaderState = { hasStarted: boolean; idleMs: number; ready: boolean }

export const initialLoaderState: LoaderState = { hasStarted: false, idleMs: 0, ready: false }

const IDLE_DEBOUNCE_MS = 300

export function advanceLoader(prev: LoaderState, active: boolean, dtMs: number): LoaderState {
  if (prev.ready) return prev
  const hasStarted = prev.hasStarted || active
  if (!hasStarted) return { hasStarted: false, idleMs: 0, ready: false }
  if (active) return { hasStarted: true, idleMs: 0, ready: false }
  const idleMs = prev.idleMs + dtMs
  return { hasStarted: true, idleMs, ready: idleMs >= IDLE_DEBOUNCE_MS }
}
