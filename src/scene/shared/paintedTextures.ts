import * as THREE from 'three'

// Painted textures (tier 3) — Ghibli-style gouache generated from
// docs/references/textures/prompts-textures-salon.md, served from /textures.
// MirroredRepeatWrapping: mirror tiling hides residual seams of
// AI-generated "seamless" images.

const loader = new THREE.TextureLoader()

function painted(file: string, repeatX: number, repeatY: number): THREE.Texture {
  const tex = loader.load(`/textures/${file}`)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping
  tex.repeat.set(repeatX, repeatY)
  return tex
}

// Desaturated variant: refs show a sand/cream plaster; the raw Adobe image
// pulls too orange. Filter applied once at load time (canvas).
function paintedDesat(
  file: string, repeatX: number, repeatY: number,
  saturate: number, brightness: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping
  tex.repeat.set(repeatX, repeatY)
  const img = new Image()
  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.filter = `saturate(${saturate}) brightness(${brightness})`
    ctx.drawImage(img, 0, 0)
    tex.needsUpdate = true
  }
  img.src = `/textures/${file}`
  return tex
}

// Walls: one repeat ≈ 3.2 m (wall height) to keep grain consistent
// across segments of different widths.
export const murAdobeNorth = paintedDesat('mur-adobe-01.png', 2.0, 1, 0.78, 1.05)   // 6.45 m segments
export const murAdobeLintel = paintedDesat('mur-adobe-01.png', 0.34, 0.31, 0.78, 1.05) // lintel 1.1×1.0 m
export const murAdobeSouth = paintedDesat('mur-adobe-01.png', 4.4, 1, 0.78, 1.05)   // 14 m wall
export const murAdobeSide  = paintedDesat('mur-adobe-01.png', 3.1, 1, 0.78, 1.05)   // 10 m walls

// Floor: image contains 4×4 tiles → 7×5 repeats over 14×10 m ≈ 0.5 m/tile.
export const solTomettes = painted('sol-tomettes-01.png', 7, 5)

// Normal map derived from image luminance (simplified Sobel): the light grout
// lines between tiles become recesses that break reflections and catch warm
// candle light. Generated at load time, in linear space.
function paintedNormal(
  file: string, repeatX: number, repeatY: number, strength: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping
  tex.repeat.set(repeatX, repeatY)
  const img = new Image()
  img.onload = () => {
    const w = img.width
    const h = img.height
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(img, 0, 0)
    const src = ctx.getImageData(0, 0, w, h).data
    const out = ctx.createImageData(w, h)
    const lum = new Float32Array(w * h)
    for (let i = 0; i < w * h; i++) {
      lum[i] = (src[i * 4] * 0.299 + src[i * 4 + 1] * 0.587 + src[i * 4 + 2] * 0.114) / 255
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = (lum[y * w + (x - 1 + w) % w] - lum[y * w + (x + 1) % w]) * strength
        const ny = (lum[((y - 1 + h) % h) * w + x] - lum[((y + 1) % h) * w + x]) * strength
        const inv = 1 / Math.hypot(nx, ny, 1)
        const o = (y * w + x) * 4
        out.data[o] = (nx * inv * 0.5 + 0.5) * 255
        out.data[o + 1] = (ny * inv * 0.5 + 0.5) * 255
        out.data[o + 2] = (inv * 0.5 + 0.5) * 255
        out.data[o + 3] = 255
      }
    }
    ctx.putImageData(out, 0, 0)
    tex.needsUpdate = true
  }
  img.src = `/textures/${file}`
  return tex
}

export const solTomettesNormal = paintedNormal('sol-tomettes-01.png', 7, 5, 2.5)

// Tablecloth: embroidered border, not tileable by translation — 2 mirrored
// copies along the length = two cloths joined at center (real use on 8.5 m
// table), embroidery stays continuous thanks to the mirror.
export const nappeBrodee = painted('nappe-brodee-01.png', 2, 1)

// Table top: horizontal planks in the image → repeat mostly on X.
export const boisSombre = painted('bois-sombre-01.png', 4, 1)

// ── Kitchen ──────────────────────────────────────────────────────────────────
// Talavera azulejos: ~20 cm tiles → 3×2 repeats on backsplash ~60×40 cm.
export const azulejosTalavera = painted('azulejos-talavera.png', 3, 2)
// Stone wall (rubble): east wall of the kitchen.
export const murPierre = paintedDesat('mur-pierre.png', 1.2, 1, 0.85, 1.0)
