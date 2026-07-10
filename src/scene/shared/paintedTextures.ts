import * as THREE from 'three'

// Textures peintes (palier 3) — gouache style Ghibli générées d'après
// docs/references/textures/prompts-textures-salon.md, servies depuis /textures.
// MirroredRepeatWrapping : le raccord miroir masque les coutures résiduelles
// des images « seamless » générées.

const loader = new THREE.TextureLoader()

function painted(file: string, repeatX: number, repeatY: number): THREE.Texture {
  const tex = loader.load(`/textures/${file}`)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping
  tex.repeat.set(repeatX, repeatY)
  return tex
}

// Murs : une répétition ≈ 3,2 m (hauteur de mur) pour garder le grain constant
// entre segments de largeurs différentes.
export const murAdobeNorth = painted('mur-adobe-01.png', 2.0, 1)   // segments 6,45 m
export const murAdobeLintel = painted('mur-adobe-01.png', 0.34, 0.31) // linteau 1,1×1,0 m
export const murAdobeSouth = painted('mur-adobe-01.png', 4.4, 1)   // mur 14 m
export const murAdobeSide  = painted('mur-adobe-01.png', 3.1, 1)   // murs 10 m

// Sol : l'image contient 4×4 tomettes → 7×5 répétitions sur 14×10 m ≈ 0,5 m/carreau.
export const solTomettes = painted('sol-tomettes-01.png', 7, 5)

// Nappe : bordure brodée non répétable en pavage — 2 copies miroir sur la
// longueur = deux nappes jointes au centre (usage réel sur table de 8,5 m),
// la broderie reste continue grâce au miroir.
export const nappeBrodee = painted('nappe-brodee-01.png', 2, 1)

// Plateau de table : planches horizontales dans l'image → répéter surtout en X.
export const boisSombre = painted('bois-sombre-01.png', 4, 1)
