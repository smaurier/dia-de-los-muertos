import * as THREE from 'three'

// 4 bandes : ombre profonde / ombre / lumière / highlight — contraste dessin animé
const colors = new Uint8Array([35, 75, 200, 255])
export const toonGradient = new THREE.DataTexture(colors, 4, 1, THREE.RedFormat)
toonGradient.magFilter = THREE.NearestFilter
toonGradient.minFilter = THREE.NearestFilter
toonGradient.needsUpdate = true
