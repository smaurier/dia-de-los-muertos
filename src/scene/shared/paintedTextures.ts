import * as THREE from 'three'

// Textures peintes (palier 3) — gouache style Ghibli générées d'après
// docs/references/textures/prompts-textures-salon.md, servies depuis /textures.
// MirroredRepeatWrapping : le raccord miroir masque les coutures résiduelles
// des images « seamless » générées.

const loader = new THREE.TextureLoader()

function painted(file: string, repeatX: number, repeatY: number): THREE.Texture {
  const tex = loader.load(`/textures/${file}`)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping
  tex.repeat.set(repeatX, repeatY)
  return tex
}

// Variante désaturée : les refs montrent un plâtre sable/crème, l'image adobe
// brute tire trop à l'orange. Filtre appliqué une fois au chargement (canvas).
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

// Murs : une répétition ≈ 3,2 m (hauteur de mur) pour garder le grain constant
// entre segments de largeurs différentes.
export const murAdobeNorth = paintedDesat('mur-adobe-01.png', 2.0, 1, 0.78, 1.05)   // segments 6,45 m
export const murAdobeLintel = paintedDesat('mur-adobe-01.png', 0.34, 0.31, 0.78, 1.05) // linteau 1,1×1,0 m
export const murAdobeSouth = paintedDesat('mur-adobe-01.png', 4.4, 1, 0.78, 1.05)   // mur 14 m
export const murAdobeSide  = paintedDesat('mur-adobe-01.png', 3.1, 1, 0.78, 1.05)   // murs 10 m

// Sol : l'image contient 4×4 tomettes → 7×5 répétitions sur 14×10 m ≈ 0,5 m/carreau.
export const solTomettes = painted('sol-tomettes-01.png', 7, 5)

// Normal map dérivée de la luminance de l'image (Sobel simplifié) : les joints
// clairs entre tomettes deviennent des creux qui brisent les réflexions et
// accrochent la lumière chaude des bougies. Générée au chargement, en linéaire.
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

// Nappe : bordure brodée non répétable en pavage — 2 copies miroir sur la
// longueur = deux nappes jointes au centre (usage réel sur table de 8,5 m),
// la broderie reste continue grâce au miroir.
export const nappeBrodee = painted('nappe-brodee-01.png', 2, 1)

// Plateau de table : planches horizontales dans l'image → répéter surtout en X.
export const boisSombre = painted('bois-sombre-01.png', 4, 1)
