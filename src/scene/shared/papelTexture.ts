import * as THREE from 'three'

// Alpha maps procédurales pour le papel picado : blanc = papier, noir = découpe
// (alphaTest sur le matériau fait disparaître les zones noires).
// 3 motifs traditionnels stylisés : fleur, crâne, losanges.

const W = 128
const H = 160

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
  const depth = 14
  const step = 16
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
  for (let x = 16; x < W; x += 24) cutCircle(ctx, x, 14, 4)
}

// Trous d'angle décoratifs.
function cutCornerDots(ctx: CanvasRenderingContext2D) {
  cutCircle(ctx, 14, 34, 5)
  cutCircle(ctx, W - 14, 34, 5)
  cutCircle(ctx, 14, H - 34, 5)
  cutCircle(ctx, W - 14, H - 34, 5)
}

// Motif 1 — fleur : cœur + 6 pétales + couronne de points.
const fleur = makeTexture(ctx => {
  const cx = W / 2, cy = H / 2 - 6
  cutCircle(ctx, cx, cy, 9)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    cutEllipse(ctx, cx + Math.cos(a) * 24, cy + Math.sin(a) * 24, 7, 12, a + Math.PI / 2)
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3
    cutCircle(ctx, cx + Math.cos(a) * 44, cy + Math.sin(a) * 44, 4)
  }
  cutTopDots(ctx)
  cutCornerDots(ctx)
  cutZigzagBottom(ctx)
})

// Motif 2 — crâne (calavera) : yeux, nez, sourire, halo de points.
const crane = makeTexture(ctx => {
  const cx = W / 2, cy = H / 2 - 8
  cutCircle(ctx, cx - 16, cy - 8, 10)
  cutCircle(ctx, cx + 16, cy - 8, 10)
  ctx.beginPath()
  ctx.moveTo(cx, cy + 4)
  ctx.lineTo(cx - 6, cy + 16)
  ctx.lineTo(cx + 6, cy + 16)
  ctx.closePath()
  ctx.fill()
  for (let i = -2; i <= 2; i++) {
    ctx.fillRect(cx + i * 8 - 2, cy + 24, 4, 12)
  }
  for (let i = 0; i < 8; i++) {
    const a = Math.PI + (i / 7) * Math.PI
    cutCircle(ctx, cx + Math.cos(a) * 42, cy + 2 + Math.sin(a) * 46, 4)
  }
  cutTopDots(ctx)
  cutCornerDots(ctx)
  cutZigzagBottom(ctx)
})

// Motif 3 — treillis de losanges.
const losanges = makeTexture(ctx => {
  const s = 15
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const x = 24 + col * 27 + (row % 2) * 13
      const y = 40 + row * 26
      ctx.beginPath()
      ctx.moveTo(x, y - s / 2)
      ctx.lineTo(x + s / 2, y)
      ctx.lineTo(x, y + s / 2)
      ctx.lineTo(x - s / 2, y)
      ctx.closePath()
      ctx.fill()
    }
  }
  cutTopDots(ctx)
  cutZigzagBottom(ctx)
})

export const papelTextures = [fleur, crane, losanges]
