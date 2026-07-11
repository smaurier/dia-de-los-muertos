import * as THREE from 'three'

// Rampe « peinture » : la structure 5 bandes demeure (ombre / pénombre /
// mi-teinte / lumière / highlight) mais chaque frontière a un épaulement de
// 1-2 texels et le filtrage est linéaire → les transitions fondent comme un
// lavis gouache (refs salon) au lieu de casser net (rendu plastique).
// Plancher relevé (min 60) : l'ombre la plus profonde reste colorée — la
// teinte vient des lumières de remplissage chaudes (gradientMap ne lit que
// le canal R, impossible de teinter ici).
const ramp = [
  60, 62, 70,          // ombre
  95, 100, 112,        // pénombre
  140, 150, 165,       // mi-teinte
  195, 210, 222,       // lumière
  240, 250, 255, 255,  // highlight
]
const colors = new Uint8Array(ramp)
export const toonGradient = new THREE.DataTexture(colors, ramp.length, 1, THREE.RedFormat)
toonGradient.magFilter = THREE.LinearFilter
toonGradient.minFilter = THREE.LinearFilter
toonGradient.needsUpdate = true
