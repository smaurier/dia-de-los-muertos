// src/scene/shared/DomeCiel.tsx
// Bulle de ciel étoilé au-dessus de toute la maison : hémisphère vu de
// l'intérieur (BackSide), texture d'étoiles générée au chargement (canvas).
// Visible depuis le patio, par-dessus les murs d'enceinte, et derrière
// toute ouverture donnant dehors. Nuit du Día de Muertos.
import * as THREE from 'three'

const cieloTexture = (() => {
  // 4096×2048 : à 1024 le dôme de 26 m étirait les texels — étoiles floues.
  const W = 4096
  const H = 2048
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Dégradé : noir bleuté au zénith → bleu nuit chaud à l'horizon
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#060B18')
  grad.addColorStop(0.55, '#0A1424')
  grad.addColorStop(0.85, '#16223E')
  grad.addColorStop(1, '#1E2A48')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Étoiles : plus denses vers le zénith (haut de la texture), tailles et
  // éclats variés, quelques-unes bleutées ou dorées. Petits rayons en px :
  // à cette résolution elles restent des points nets.
  const rand = (a: number, b: number) => a + Math.random() * (b - a)
  for (let i = 0; i < 1700; i++) {
    const x = rand(0, W)
    const y = Math.pow(Math.random(), 1.6) * (H - 170) // biais vers le haut
    const r = rand(1.0, 3.2)
    const alpha = rand(0.35, 1)
    const tint = Math.random()
    ctx.fillStyle =
      tint < 0.75 ? `rgba(235,240,255,${alpha})` :
      tint < 0.9 ? `rgba(180,200,255,${alpha})` :
      `rgba(255,230,180,${alpha})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  // Une poignée d'étoiles brillantes : cœur net + halo doux + croix fine
  for (let i = 0; i < 16; i++) {
    const x = rand(0, W)
    const y = Math.pow(Math.random(), 1.8) * (H * 0.78)
    const halo = ctx.createRadialGradient(x, y, 0, x, y, 18)
    halo.addColorStop(0, 'rgba(255,255,255,0.55)')
    halo.addColorStop(0.35, 'rgba(220,230,255,0.18)')
    halo.addColorStop(1, 'rgba(220,230,255,0)')
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.arc(x, y, 18, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.beginPath()
    ctx.arc(x, y, 2.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillRect(x - 9, y - 0.7, 18, 1.4)
    ctx.fillRect(x - 0.7, y - 9, 1.4, 18)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8 // netteté aux angles rasants (horizon du dôme)
  return tex
})()

export function DomeCiel() {
  return (
    // Centré sur la maison (x∈[-7.2,13.6], z∈[-10.75,15.4]), rayon large.
    // meshBasicMaterial : le ciel n'est pas éclairé par les lampes.
    <mesh position={[3.2, 0, 2.3]}>
      <sphereGeometry args={[26, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshBasicMaterial map={cieloTexture} side={THREE.BackSide} fog={false} />
    </mesh>
  )
}
