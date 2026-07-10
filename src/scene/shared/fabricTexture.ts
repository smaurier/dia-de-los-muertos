// Texture tissu procédurale (canvas) : trame tissée subtile + rayures
// verticales douces — pour les rideaux (pas d'asset peint dédié).
import * as THREE from 'three'

function makeFabric(base: string, stripe: string): THREE.CanvasTexture {
  const size = 256
  const cv = document.createElement('canvas')
  cv.width = size
  cv.height = size
  const ctx = cv.getContext('2d')!

  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  // Rayures verticales douces
  ctx.fillStyle = stripe
  ctx.globalAlpha = 0.35
  for (let x = 0; x < size; x += 32) {
    ctx.fillRect(x, 0, 10, size)
  }

  // Trame : petits traits alternés horizontaux/verticaux
  ctx.globalAlpha = 0.10
  ctx.strokeStyle = '#4a3820'
  ctx.lineWidth = 1
  for (let y = 0; y < size; y += 3) {
    ctx.beginPath()
    ctx.moveTo((y % 6) / 2, y + 0.5)
    ctx.lineTo(size, y + 0.5)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 3)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const rideauTexture = makeFabric('#EFE6D2', '#E2D3B4')

// Paysage nocturne derrière la fenêtre : ciel dégradé, lune, collines,
// quelques fenêtres allumées d'un village lointain.
function makeNightScape(): THREE.CanvasTexture {
  const w = 512
  const h = 384
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const ctx = cv.getContext('2d')!

  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#101c3a')
  sky.addColorStop(0.6, '#1c2f5c')
  sky.addColorStop(1, '#2a3f66')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  // Étoiles
  ctx.fillStyle = '#cfd8ee'
  for (let i = 0; i < 60; i++) {
    const x = (i * 97.3) % w
    const y = ((i * 53.7) % (h * 0.55))
    ctx.globalAlpha = 0.3 + ((i * 7) % 10) / 14
    ctx.fillRect(x, y, 1.6, 1.6)
  }
  ctx.globalAlpha = 1

  // Lune + halo
  ctx.fillStyle = 'rgba(220, 228, 248, 0.18)'
  ctx.beginPath()
  ctx.arc(w * 0.72, h * 0.24, 46, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#E8EDF8'
  ctx.beginPath()
  ctx.arc(w * 0.72, h * 0.24, 26, 0, Math.PI * 2)
  ctx.fill()

  // Collines en silhouette
  ctx.fillStyle = '#0c1526'
  ctx.beginPath()
  ctx.moveTo(0, h * 0.78)
  ctx.quadraticCurveTo(w * 0.22, h * 0.62, w * 0.45, h * 0.76)
  ctx.quadraticCurveTo(w * 0.68, h * 0.88, w, h * 0.7)
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.fill()

  // Fenêtres chaudes d'un village lointain
  ctx.fillStyle = '#f0b860'
  const windows: [number, number][] = [[0.16, 0.84], [0.19, 0.87], [0.55, 0.86], [0.58, 0.83], [0.61, 0.88], [0.83, 0.8]]
  for (const [fx, fy] of windows) {
    ctx.fillRect(fx * w, fy * h, 4, 3)
  }

  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const paysageNuitTexture = makeNightScape()
