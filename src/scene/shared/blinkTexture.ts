import * as THREE from 'three'

// Jeu de textures « visage vivant » d'un personnage, généré en mémoire depuis
// la texture SOURCE du GLB (canvas). On clone flipY/colorSpace/wrap de la
// source → aucune désynchronisation d'orientation possible (piège du PNG
// externe). Générique : chaque personnage fournit ses zones d'yeux (pixels
// atlas, repère PNG).
//
// - blink : paupières fermées (teint échantillonné + pli d'ombre)
// - gaze  : micro-saccades — l'intérieur de l'œil décalé de quelques pixels
//   (une vraie saccade est un SAUT instantané : le swap de texture est le bon
//   modèle, pas une interpolation)

export type EyeSpot = { x: number; y: number; r: number }

export type FaceTextureSet = {
  blink: THREE.CanvasTexture
  gaze: THREE.CanvasTexture[] // gaze[0] = regard centré (copie de la source)
}

// Décalages de pupille (px atlas). Petits exprès : les charts UV des deux
// yeux sont orientés différemment, un grand décalage ferait diverger le
// regard — à ±3-4 px l'incohérence est imperceptible, seule la vie compte.
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

  // Canvas de référence (copie de la source, jamais modifié)
  const base = document.createElement('canvas')
  base.width = image.width
  base.height = image.height
  const bctx = base.getContext('2d')
  if (!bctx) return null
  bctx.drawImage(image, 0, 0)

  // Debug ?blinkred : variante rouge uni — isole « le swap ne rend pas » de
  // « la variante ne se voit pas »
  const debugRed = new URLSearchParams(window.location.search).has('blinkred')

  const data = bctx.getImageData(0, 0, base.width, base.height).data
  const readPx = (x: number, y: number): [number, number, number] => {
    const i = ((Math.round(y) % base.height) * base.width + (Math.round(x) % base.width)) * 4
    return [data[i], data[i + 1], data[i + 2]]
  }

  // GLTFLoader livre des ImageBitmap parfois PRÉ-RETOURNÉES verticalement
  // (createImageBitmap imageOrientation). Les coordonnées d'yeux sont données
  // dans le repère du PNG : on choisit, pour chaque œil, le candidat (y ou
  // H-y) qui contient réellement du blanc de sclère.
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

  // ── Variante blink : paupières fermées ────────────────────────────────────
  const { cv: blinkCv, ctx: blinkCtx } = newCanvas()
  if (!blinkCtx) return null
  for (const { x: cx, y: cy, r } of resolved) {
    // Peau : moyenne sur un anneau autour de l'œil (teinte chaude, ni cheveux
    // noirs ni blanc de sclère)
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
    // Pli de paupière : ombre douce horizontale (lisible quelle que soit
    // l'orientation du chart UV)
    blinkCtx.fillStyle = `rgb(${(skin[0] * 0.7) | 0}, ${(skin[1] * 0.7) | 0}, ${(skin[2] * 0.7) | 0})`
    blinkCtx.beginPath()
    blinkCtx.ellipse(cx, cy, r * 0.85, 5, 0, 0, Math.PI * 2)
    blinkCtx.fill()
  }

  // ── Variantes gaze : intérieur de l'œil décalé (clip ellipse interne) ─────
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
