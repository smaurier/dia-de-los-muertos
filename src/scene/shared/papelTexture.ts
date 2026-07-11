import * as THREE from 'three'

// Alpha maps procédurales pour le papel picado : blanc = papier, noir = découpe
// (alphaTest sur le matériau fait disparaître les zones noires).
// 3 motifs traditionnels stylisés : fleur, crâne, losanges.

const W = 256
const H = 320
const S = 2 // facteur d'échelle des motifs (canvas doublé pour des découpes fines)

function makeTexture(draw: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#000000'
  draw(ctx)
  const tex = new THREE.CanvasTexture(canvas)
  return tex
}

function cutCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

function cutEllipse(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, rx: number, ry: number, rot: number,
) {
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2)
  ctx.fill()
}

// Bord inférieur en zigzag — la signature du papel picado.
function cutZigzagBottom(ctx: CanvasRenderingContext2D) {
  const depth = 14 * S
  const step = 12 * S // dents plus serrées (découpe fine)
  ctx.beginPath()
  ctx.moveTo(0, H)
  for (let x = 0; x <= W; x += step) {
    ctx.lineTo(x, H - depth)
    ctx.lineTo(x + step / 2, H)
  }
  ctx.lineTo(W, H)
  ctx.closePath()
  ctx.fill()
}

// Rangée de petits trous ronds sous l'attache (haut du drapeau).
function cutTopDots(ctx: CanvasRenderingContext2D) {
  for (let x = 10 * S; x < W; x += 12 * S) cutCircle(ctx, x, 14 * S, 2.4 * S)
}

// Dentelle latérale : colonnes de trous fins le long des bords.
function cutSideLace(ctx: CanvasRenderingContext2D) {
  for (let y = 34 * S; y < H - 30 * S; y += 13 * S) {
    cutCircle(ctx, 9 * S, y, 2.2 * S)
    cutCircle(ctx, W - 9 * S, y, 2.2 * S)
    cutEllipse(ctx, 19 * S, y + 6 * S, 1.6 * S, 3.2 * S, 0.5)
    cutEllipse(ctx, W - 19 * S, y + 6 * S, 1.6 * S, 3.2 * S, -0.5)
  }
}

// Trous d'angle décoratifs (trèfle de 3 petits trous).
function cutCornerDots(ctx: CanvasRenderingContext2D) {
  for (const [px, py] of [[14, 34], [114, 34], [14, 126], [114, 126]] as [number, number][]) {
    const x = (px / 128) * W
    const y = (py / 160) * H
    cutCircle(ctx, x, y, 3 * S)
    cutCircle(ctx, x - 5 * S, y + 5 * S, 1.8 * S)
    cutCircle(ctx, x + 5 * S, y + 5 * S, 1.8 * S)
  }
}

// Motif 1 — fleur : cœur + 6 pétales fins + double couronne de points.
const fleur = makeTexture(ctx => {
  const cx = W / 2, cy = H / 2 - 6 * S
  cutCircle(ctx, cx, cy, 8 * S)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    cutEllipse(ctx, cx + Math.cos(a) * 22 * S, cy + Math.sin(a) * 22 * S, 5 * S, 11 * S, a + Math.PI / 2)
  }
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.2
    cutCircle(ctx, cx + Math.cos(a) * 40 * S, cy + Math.sin(a) * 40 * S, 2.6 * S)
  }
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2
    cutCircle(ctx, cx + Math.cos(a) * 52 * S, cy + Math.sin(a) * 52 * S, 1.7 * S)
  }
  cutTopDots(ctx)
  cutCornerDots(ctx)
  cutSideLace(ctx)
  cutZigzagBottom(ctx)
})

// Motif 2 — crâne (calavera) : yeux, nez, sourire denté, halo double de points.
const crane = makeTexture(ctx => {
  const cx = W / 2, cy = H / 2 - 8 * S
  cutCircle(ctx, cx - 16 * S, cy - 8 * S, 9 * S)
  cutCircle(ctx, cx + 16 * S, cy - 8 * S, 9 * S)
  ctx.beginPath()
  ctx.moveTo(cx, cy + 4 * S)
  ctx.lineTo(cx - 6 * S, cy + 16 * S)
  ctx.lineTo(cx + 6 * S, cy + 16 * S)
  ctx.closePath()
  ctx.fill()
  for (let i = -3; i <= 3; i++) {
    ctx.fillRect(cx + i * 7 * S - 1.5 * S, cy + 24 * S, 3 * S, 11 * S)
  }
  for (let i = 0; i < 10; i++) {
    const a = Math.PI + (i / 9) * Math.PI
    cutCircle(ctx, cx + Math.cos(a) * 40 * S, cy + 2 * S + Math.sin(a) * 44 * S, 2.6 * S)
  }
  for (let i = 0; i < 12; i++) {
    const a = Math.PI + (i / 11) * Math.PI
    cutCircle(ctx, cx + Math.cos(a) * 52 * S, cy + 2 * S + Math.sin(a) * 56 * S, 1.7 * S)
  }
  cutTopDots(ctx)
  cutCornerDots(ctx)
  cutSideLace(ctx)
  cutZigzagBottom(ctx)
})

// Motif 3 — treillis de losanges fins avec points intercalés.
const losanges = makeTexture(ctx => {
  const s = 11 * S
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const x = 18 * S + col * 19 * S + (row % 2) * 9 * S
      const y = 36 * S + row * 18 * S
      if (x > W - 12 * S) continue
      ctx.beginPath()
      ctx.moveTo(x, y - s / 2)
      ctx.lineTo(x + s / 2, y)
      ctx.lineTo(x, y + s / 2)
      ctx.lineTo(x - s / 2, y)
      ctx.closePath()
      ctx.fill()
      cutCircle(ctx, x + 9.5 * S, y - 9 * S, 1.6 * S)
    }
  }
  cutTopDots(ctx)
  cutSideLace(ctx)
  cutZigzagBottom(ctx)
})

export const papelTextures = [fleur, crane, losanges]
