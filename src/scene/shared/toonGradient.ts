import * as THREE from 'three'

// "Painted" ramp: the 5-band structure remains (shadow / penumbra /
// midtone / light / highlight) but each boundary has a 1-2 texel shoulder
// and filtering is linear → transitions blend like gouache wash (salon refs)
// instead of snapping hard (plastic look).
// Lifted floor (min 60): the deepest shadow stays coloured — the tint comes
// from warm fill lights (gradientMap only reads the R channel, can't tint here).
const ramp = [
  60, 62, 70,          // shadow
  95, 100, 112,        // penumbra
  140, 150, 165,       // midtone
  195, 210, 222,       // light
  240, 250, 255, 255,  // highlight
]
const colors = new Uint8Array(ramp)
export const toonGradient = new THREE.DataTexture(colors, ramp.length, 1, THREE.RedFormat)
toonGradient.magFilter = THREE.LinearFilter
toonGradient.minFilter = THREE.LinearFilter
toonGradient.needsUpdate = true
