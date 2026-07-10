import * as THREE from 'three'

// 5 bandes : ombre / pénombre / mi-teinte / lumière / highlight.
// Plancher relevé (35 → 60) : l'ombre la plus profonde reste colorée — la teinte
// vient des lumières de remplissage chaudes (gradientMap ne lit que le canal R,
// impossible de teinter ici).
const colors = new Uint8Array([60, 100, 150, 210, 255])
export const toonGradient = new THREE.DataTexture(colors, 5, 1, THREE.RedFormat)
toonGradient.magFilter = THREE.NearestFilter
toonGradient.minFilter = THREE.NearestFilter
toonGradient.needsUpdate = true
