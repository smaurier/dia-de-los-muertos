// src/scene/shared/DomeCiel.tsx
// Bulle de ciel étoilé au-dessus de toute la maison : hémisphère vu de
// l'intérieur (BackSide), texture d'étoiles générée au chargement (canvas).
// Visible depuis le patio, par-dessus les murs d'enceinte, et derrière
// toute ouverture donnant dehors. Nuit du Día de Muertos.
import * as THREE from 'three'

const cieloTexture = (() => {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Dégradé : noir bleuté au zénith → bleu nuit chaud à l'horizon
  const grad = ctx.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0, '#060B18')
  grad.addColorStop(0.55, '#0A1424')
  grad.addColorStop(0.85, '#16223E')
  grad.addColorStop(1, '#1E2A48')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1024, 512)

  // Étoiles : plus denses vers le zénith (haut de la texture), tailles et
  // éclats variés, quelques-unes bleutées ou dorées
  const rand = (a: number, b: number) => a + Math.random() * (b - a)
  for (let i = 0; i < 420; i++) {
    const x = rand(0, 1024)
    const y = Math.pow(Math.random(), 1.6) * 470 // biais vers le haut
    const r = rand(0.4, 1.4)
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
  // Une poignée d'étoiles brillantes avec halo doux
  for (let i = 0; i < 14; i++) {
    const x = rand(0, 1024)
    const y = Math.pow(Math.random(), 1.8) * 400
    const halo = ctx.createRadialGradient(x, y, 0, x, y, 6)
    halo.addColorStop(0, 'rgba(255,255,255,0.9)')
    halo.addColorStop(0.3, 'rgba(220,230,255,0.35)')
    halo.addColorStop(1, 'rgba(220,230,255,0)')
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
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
