import * as THREE from 'three'

const colors = new Uint8Array([40, 128, 255])
export const toonGradient = new THREE.DataTexture(colors, 3, 1, THREE.RedFormat)
toonGradient.magFilter = THREE.NearestFilter
toonGradient.minFilter = THREE.NearestFilter
toonGradient.needsUpdate = true
