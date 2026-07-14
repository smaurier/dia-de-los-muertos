import * as THREE from 'three'

// "Living face" texture set for a character, generated in memory from the
// GLB's SOURCE texture (canvas). Clones flipY/colorSpace/wrap from the source
// → no orientation mismatch possible (pitfall of external PNGs).
// Generic: each character provides its eye regions (atlas pixels, PNG space).
//
// - blink : closed eyelids (skin tone sampled + shadow fold)
// - gaze  : micro-saccades — inner eye shifted a few pixels
//   (a real saccade is an INSTANT jump: texture swap is the right model,
//   not interpolation)

export type EyeSpot = { x: number; y: number; r: number }

export type FaceTextureSet = {
  blink: THREE.CanvasTexture
  gaze: THREE.CanvasTexture[] // gaze[0] = centered gaze (copy of source)
}

// Pupil offsets (atlas px). Kept small on purpose: the UV charts of both
// eyes are oriented differently — a large offset would make them diverge.
// At ±3-4 px the inconsistency is imperceptible; only the life effect matters.
const GAZE_OFFSETS: [number, number][] = [
  [0, 0],
  [4, 0],
  [-4, 0],
  [2, 2],
  [-2, -2],
  [3, -2],
]

function cloneSettings(tex: THREE.CanvasTexture, source: THREE.Texture): THREE.CanvasTexture {
  tex.flipY = source.flipY
  tex.colorSpace = source.colorSpace
  tex.wrapS = source.wrapS
  tex.wrapT = source.wrapT
  tex.needsUpdate = true
  return tex
}

export function makeFaceTextures(source: THREE.Texture, eyes: EyeSpot[]): FaceTextureSet | null {
  const image = source.image as HTMLImageElement | ImageBitmap | undefined
  if (!image || !('width' in image)) return null

  // Reference canvas (copy of source, never modified)
  const base = document.createElement('canvas')
  base.width = image.width
  base.height = image.height
  const bctx = base.getContext('2d')
  if (!bctx) return null
  bctx.drawImage(image, 0, 0)

  // Debug ?blinkred: solid red variant — isolates "swap doesn't render" from
  // "variant is invisible"
  const debugRed = new URLSearchParams(window.location.search).has('blinkred')

  const data = bctx.getImageData(0, 0, base.width, base.height).data
  const readPx = (x: number, y: number): [number, number, number] => {
    const i = ((Math.round(y) % base.height) * base.width + (Math.round(x) % base.width)) * 4
    return [data[i], data[i + 1], data[i + 2]]
  }

  // GLTFLoader sometimes delivers PRE-FLIPPED ImageBitmaps vertically
  // (createImageBitmap imageOrientation). Eye coordinates are given in PNG
  // space: for each eye, pick the candidate (y or H-y) that actually contains
  // sclera white.
  const whiteScore = (cx: number, cy: number, r: number) => {
    let score = 0
    for (let dx = -r; dx <= r; dx += 3) {
      for (let dy = -r; dy <= r; dy += 3) {
        const [pr, pg, pb] = readPx(cx + dx, cy + dy)
        if (pr > 180 && pg > 180 && pb > 180) score++
      }
    }
    return score
  }

  const resolved = eyes.map(({ x, y, r }) => {
    const direct = whiteScore(x, y, r)
    const flipped = whiteScore(x, base.height - y, r)
    return { x, y: flipped > direct ? base.height - y : y, r }
  })

  const newCanvas = () => {
    const cv = document.createElement('canvas')
    cv.width = base.width
    cv.height = base.height
    const ctx = cv.getContext('2d')
    if (ctx) {
      ctx.drawImage(base, 0, 0)
      if (debugRed) {
        ctx.fillStyle = '#ff2020'
        ctx.fillRect(0, 0, cv.width, cv.height)
      }
    }
    return { cv, ctx }
  }

  // ── Blink variant: closed eyelids ─────────────────────────────────────────
  const { cv: blinkCv, ctx: blinkCtx } = newCanvas()
  if (!blinkCtx) return null
  for (const { x: cx, y: cy, r } of resolved) {
    // Skin tone: average over a ring around the eye (warm hue, neither
    // black hair nor sclera white)
    let sr = 0
    let sg = 0
    let sb = 0
    let n = 0
    for (let dx = -2 * r; dx <= 2 * r; dx += 4) {
      for (let dy = -2 * r; dy <= 2 * r; dy += 4) {
        const d2 = dx * dx + dy * dy
        if (d2 > (1.3 * r) ** 2 && d2 < (1.9 * r) ** 2) {
          const [pr, pg, pb] = readPx(cx + dx, cy + dy)
          if (pr > 120 && pr < 245 && pb < pr && pr - pb > 20) {
            sr += pr
            sg += pg
            sb += pb
            n++
          }
        }
      }
    }
    const skin = n ? [sr / n, sg / n, sb / n] : [198, 140, 108]

    blinkCtx.fillStyle = `rgb(${skin[0] | 0}, ${skin[1] | 0}, ${skin[2] | 0})`
    blinkCtx.beginPath()
    blinkCtx.ellipse(cx, cy, r, r, 0, 0, Math.PI * 2)
    blinkCtx.fill()
    // Eyelid fold: soft horizontal shadow (readable regardless of UV chart
    // orientation)
    blinkCtx.fillStyle = `rgb(${(skin[0] * 0.7) | 0}, ${(skin[1] * 0.7) | 0}, ${(skin[2] * 0.7) | 0})`
    blinkCtx.beginPath()
    blinkCtx.ellipse(cx, cy, r * 0.85, 5, 0, 0, Math.PI * 2)
    blinkCtx.fill()
  }

  // ── Gaze variants: inner eye shifted (clipped inner ellipse) ──────────────
  const gaze = GAZE_OFFSETS.map(([dx, dy]) => {
    const { cv, ctx } = newCanvas()
    if (ctx && (dx !== 0 || dy !== 0)) {
      for (const { x: cx, y: cy, r } of resolved) {
        ctx.save()
        ctx.beginPath()
        ctx.ellipse(cx, cy, r * 0.72, r * 0.72, 0, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(base, dx, dy)
        ctx.restore()
      }
    }
    return cloneSettings(new THREE.CanvasTexture(cv), source)
  })

  return {
    blink: cloneSettings(new THREE.CanvasTexture(blinkCv), source),
    gaze,
  }
}
