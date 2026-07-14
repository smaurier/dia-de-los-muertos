// src/scene/debug/PerfProbe.tsx
// Panneau de mesure r3f-perf : ?perf dans l'URL — FPS, draw calls,
// triangles, mémoire GPU. À lire AVANT/APRÈS toute optimisation.
// Comparaison culling : ?perf&noculling pour mesurer sans le room culling.
//
// ?perflog : échantillon JSON dans la console toutes les 2 s —
// [PERF] {"t":12,"zone":"salon","fpsAvg":58,"fpsMin":31,"calls":420,...}
// fpsMin = la PIRE frame de la fenêtre (les hitchs s'y voient). Copier-coller
// la console donne un rapport analysable.
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { zoneAt } from '../../game/systems/roomZones'
import { usePlayerStore } from '../../game/store/playerStore'

const ENABLED = new URLSearchParams(window.location.search).has('perf')
const LOG = new URLSearchParams(window.location.search).has('perflog')

function PerfLogger() {
  const gl = useThree(s => s.gl)
  const acc = useRef({ frames: 0, time: 0, worst: 0, t0: performance.now() / 1000 })

  useFrame((_, delta) => {
    const a = acc.current
    a.frames++
    a.time += delta
    if (delta > a.worst) a.worst = delta
    if (a.time < 2) return

    const [px, , pz] = usePlayerStore.getState().position
    const info = gl.info
    // eslint-disable-next-line no-console
    console.log('[PERF]', JSON.stringify({
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
    }))
    a.frames = 0
    a.time = 0
    a.worst = 0
  })
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
