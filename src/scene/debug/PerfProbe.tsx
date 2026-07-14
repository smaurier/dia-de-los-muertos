// src/scene/debug/PerfProbe.tsx
// r3f-perf measurement panel: ?perf in the URL — FPS, draw calls,
// triangles, GPU memory. Read BEFORE/AFTER any optimization.
// Culling comparison: ?perf&noculling to measure without room culling.
//
// ?perflog: JSON sample in the console every 2 s —
// [PERF] {"t":12,"zone":"salon","fpsAvg":58,"fpsMin":31,"calls":420,...}
// fpsMin = the WORST frame in the window (hitches show here). Copy-pasting
// the console gives an analyzable report.
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { zoneAt } from '../../game/systems/roomZones'
import { usePlayerStore } from '../../game/store/playerStore'

const ENABLED = new URLSearchParams(window.location.search).has('perf')
const LOG = new URLSearchParams(window.location.search).has('perflog')

type PerfSample = Record<string, string | number>

function downloadReport(samples: PerfSample[]): void {
  const blob = new Blob([JSON.stringify(samples, null, 1)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'perf-report.json'
  a.click()
  URL.revokeObjectURL(a.href)
}

function PerfLogger() {
  const gl = useThree(s => s.gl)
  const acc = useRef({ frames: 0, time: 0, worst: 0, t0: performance.now() / 1000 })
  const samples = useRef<PerfSample[]>([])
  const downloaded = useRef(false)

  useFrame((_, delta) => {
    const a = acc.current
    a.frames++
    a.time += delta
    if (delta > a.worst) a.worst = delta
    if (a.time < 2) return

    const [px, , pz] = usePlayerStore.getState().position
    const info = gl.info
    const sample: PerfSample = {
      t: Math.round(performance.now() / 1000 - a.t0),
      zone: zoneAt(px, pz),
      x: Math.round(px * 10) / 10,
      z: Math.round(pz * 10) / 10,
      fpsAvg: Math.round(a.frames / a.time),
      fpsMin: Math.round(1 / a.worst),
      calls: info.render.calls,
      tris: info.render.triangles,
      geoms: info.memory.geometries,
      tex: info.memory.textures,
      programs: info.programs?.length ?? 0,
    }
    samples.current.push(sample)
    // eslint-disable-next-line no-console
    console.log('[PERF]', JSON.stringify(sample))
    a.frames = 0
    a.time = 0
    a.worst = 0

    // After 60 s of play: automatic download of perf-report.json
    // (console sampling is too dependent on browser/extensions).
    // Manual dump at any time: window.__perfDump()
    if (!downloaded.current && samples.current.length >= 30) {
      downloaded.current = true
      downloadReport(samples.current)
    }
  })

  // Manual dump exposed on window
  ;(window as unknown as { __perfDump?: () => void }).__perfDump = () =>
    downloadReport(samples.current)

  return null
}

export function PerfProbe() {
  return (
    <>
      {ENABLED && <Perf position="top-left" />}
      {LOG && <PerfLogger />}
    </>
  )
}
