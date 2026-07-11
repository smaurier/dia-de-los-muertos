import * as THREE from 'three'

// Textures du diorama extérieur (vue fenêtre ouest) — générées en canvas,
// registre quasi photoréaliste : dégradés doux, étoiles à halo, perspective
// atmosphérique peinte couche par couche (le fog de la scène est désactivé
// dehors, sinon tout serait avalé par le brun intérieur à 24 m).

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const ctx = cv.getContext('2d')
  if (ctx) draw(ctx)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// Générateur pseudo-aléatoire déterministe (mulberry32) : même ciel à chaque
// chargement, pas de re-tirage Math.random.
function rng(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ─── Ciel nocturne : dégradé profond, voie lactée, ~350 étoiles, lune ───────
export const cielNuitTexture = canvasTexture(2048, 1024, (ctx) => {
  const w = 2048
  const h = 1024
  const rand = rng(20261102)

  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#04070f')
  sky.addColorStop(0.45, '#0a1226')
  sky.addColorStop(0.78, '#152743')
  sky.addColorStop(1, '#28405c')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  // Voie lactée : bande diagonale laiteuse très faible
  ctx.save()
  ctx.translate(w * 0.5, h * 0.42)
  ctx.rotate(-0.35)
  const mw = ctx.createLinearGradient(0, -140, 0, 140)
  mw.addColorStop(0, 'rgba(160,180,220,0)')
  mw.addColorStop(0.5, 'rgba(175,190,225,0.10)')
  mw.addColorStop(1, 'rgba(160,180,220,0)')
  ctx.fillStyle = mw
  ctx.fillRect(-w, -140, w * 2, 280)
  ctx.restore()

  // Étoiles : tailles/éclats variés, halo doux sur les brillantes
  for (let i = 0; i < 350; i++) {
    const x = rand() * w
    const y = rand() * rand() * h * 0.85
    const mag = rand()
    const r = 0.6 + mag * 1.8
    const alpha = 0.25 + mag * 0.75
    if (mag > 0.82) {
      const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 6)
      halo.addColorStop(0, `rgba(210,225,255,${alpha * 0.5})`)
      halo.addColorStop(1, 'rgba(210,225,255,0)')
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(x, y, r * 6, 0, Math.PI * 2)
      ctx.fill()
    }
    const warm = rand() > 0.8
    ctx.fillStyle = warm ? `rgba(255,235,210,${alpha})` : `rgba(215,228,255,${alpha})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Lune : halo large, disque, mers (taches sombres), liseré éclairé
  const mx = w * 0.68
  const my = h * 0.26
  const mr = 58
  const halo = ctx.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 5)
  halo.addColorStop(0, 'rgba(200,215,245,0.30)')
  halo.addColorStop(0.4, 'rgba(190,205,240,0.10)')
  halo.addColorStop(1, 'rgba(190,205,240,0)')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(mx, my, mr * 5, 0, Math.PI * 2)
  ctx.fill()

  const disc = ctx.createRadialGradient(mx - mr * 0.35, my - mr * 0.35, mr * 0.2, mx, my, mr)
  disc.addColorStop(0, '#f4f6fb')
  disc.addColorStop(0.75, '#dde4f2')
  disc.addColorStop(1, '#b8c4dd')
  ctx.fillStyle = disc
  ctx.beginPath()
  ctx.arc(mx, my, mr, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(150,165,195,0.35)'
  const maria: [number, number, number][] = [
    [-0.25, -0.15, 0.30], [0.18, 0.05, 0.22], [-0.05, 0.32, 0.18],
    [0.32, -0.28, 0.14], [-0.42, 0.18, 0.12],
  ]
  for (const [dx, dy, dr] of maria) {
    ctx.beginPath()
    ctx.arc(mx + dx * mr, my + dy * mr, dr * mr, 0, Math.PI * 2)
    ctx.fill()
  }
})

// ─── Nuages fins dérivants (plane séparé, offset animé) ─────────────────────
export const nuagesTexture = (() => {
  const tex = canvasTexture(1024, 256, (ctx) => {
    const rand = rng(4211)
    ctx.clearRect(0, 0, 1024, 256)
    for (let i = 0; i < 14; i++) {
      const x = rand() * 1024
      const y = 40 + rand() * 160
      const rx = 90 + rand() * 160
      const ry = 10 + rand() * 16
      const g = ctx.createRadialGradient(x, y, 0, x, y, rx)
      g.addColorStop(0, 'rgba(140,160,200,0.10)')
      g.addColorStop(1, 'rgba(140,160,200,0)')
      ctx.fillStyle = g
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(1, ry / rx)
      ctx.beginPath()
      ctx.arc(0, 0, rx, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  })
  tex.wrapS = THREE.RepeatWrapping
  return tex
})()

// ─── Montagnes lointaines : crête déchiquetée, brume atmosphérique en pied ──
export const montagnesTexture = canvasTexture(2048, 512, (ctx) => {
  const w = 2048
  const h = 512
  const rand = rng(77)
  ctx.clearRect(0, 0, w, h)

  // Deux crêtes superposées, la plus lointaine plus claire (perspective)
  const ridge = (baseY: number, jag: number, color: string) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(0, h)
    let y = baseY + (rand() - 0.5) * jag
    ctx.lineTo(0, y)
    for (let x = 0; x <= w; x += 32) {
      y += (rand() - 0.5) * jag
      y = Math.max(baseY - jag * 2.2, Math.min(baseY + jag * 1.4, y))
      ctx.lineTo(x, y)
    }
    ctx.lineTo(w, h)
    ctx.fill()
  }
  ridge(h * 0.42, 44, '#1b2c47')
  ridge(h * 0.60, 36, '#131f36')

  // Brume au pied des montagnes
  const haze = ctx.createLinearGradient(0, h * 0.55, 0, h)
  haze.addColorStop(0, 'rgba(50,72,105,0)')
  haze.addColorStop(1, 'rgba(50,72,105,0.55)')
  ctx.fillStyle = haze
  ctx.fillRect(0, 0, w, h)
})

// ─── Collines + village : maisons endormies, fenêtres chaudes, clocher ──────
export const collinesVillageTexture = canvasTexture(2048, 512, (ctx) => {
  const w = 2048
  const h = 512
  const rand = rng(1102)
  ctx.clearRect(0, 0, w, h)

  // Collines sombres
  ctx.fillStyle = '#0a1220'
  ctx.beginPath()
  ctx.moveTo(0, h)
  ctx.lineTo(0, h * 0.55)
  ctx.quadraticCurveTo(w * 0.18, h * 0.38, w * 0.38, h * 0.52)
  ctx.quadraticCurveTo(w * 0.55, h * 0.64, w * 0.72, h * 0.46)
  ctx.quadraticCurveTo(w * 0.88, h * 0.34, w, h * 0.5)
  ctx.lineTo(w, h)
  ctx.fill()

  // Village blotti dans le creux : silhouettes de maisons + clocher
  const houses: [number, number, number, number][] = []
  for (let i = 0; i < 22; i++) {
    const hx = w * (0.42 + rand() * 0.26)
    const hw = 26 + rand() * 40
    const hh = 22 + rand() * 30
    const hy = h * 0.62 + rand() * h * 0.16
    houses.push([hx, hy, hw, hh])
  }
  ctx.fillStyle = '#070d18'
  for (const [hx, hy, hw, hh] of houses) {
    ctx.fillRect(hx, hy - hh, hw, hh)
    // Toit
    ctx.beginPath()
    ctx.moveTo(hx - 3, hy - hh)
    ctx.lineTo(hx + hw / 2, hy - hh - 12)
    ctx.lineTo(hx + hw + 3, hy - hh)
    ctx.fill()
  }
  // Clocher de l'église, croix au sommet
  const cx = w * 0.55
  const cy = h * 0.68
  ctx.fillRect(cx, cy - 95, 34, 95)
  ctx.beginPath()
  ctx.moveTo(cx - 4, cy - 95)
  ctx.lineTo(cx + 17, cy - 118)
  ctx.lineTo(cx + 38, cy - 95)
  ctx.fill()
  ctx.fillRect(cx + 15, cy - 132, 4, 16)
  ctx.fillRect(cx + 10, cy - 127, 14, 4)

  // Fenêtres chaudes : halo + point lumineux (veillée du Día de Muertos)
  for (const [hx, hy, hw, hh] of houses) {
    if (rand() > 0.45) continue
    const wx = hx + 6 + rand() * (hw - 14)
    const wy = hy - hh + 6 + rand() * (hh - 12)
    const glow = ctx.createRadialGradient(wx, wy, 0, wx, wy, 14)
    glow.addColorStop(0, 'rgba(255,190,110,0.55)')
    glow.addColorStop(1, 'rgba(255,190,110,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(wx, wy, 14, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffcf85'
    ctx.fillRect(wx - 2.5, wy - 2, 5, 4)
  }

  // Chemin de lumières vers le cimetière (cempasúchil + bougies, tradition)
  ctx.fillStyle = '#e8a84e'
  for (let i = 0; i < 9; i++) {
    const px = w * (0.58 + i * 0.022)
    const py = h * (0.78 + Math.sin(i * 0.9) * 0.02)
    ctx.globalAlpha = 0.5 + rand() * 0.5
    ctx.fillRect(px, py, 3, 2.5)
  }
  ctx.globalAlpha = 1
})
