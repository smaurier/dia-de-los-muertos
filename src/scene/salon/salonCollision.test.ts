import { describe, it, expect } from 'vitest'
import { cameraBackDistance, canMove, clampCameraToRoom, SALON_BOUNDS } from './salonCollision'

// La caméra suit le garçon 1,2 m derrière lui : dos au mur, elle sortait de la
// pièce (murs = planes une face → écran entièrement sombre). Elle doit rester
// strictement à l'intérieur des murs, avec une marge supérieure au near plane (0.1).

describe('clampCameraToRoom', () => {
  it('ne touche pas une position déjà dans la pièce', () => {
    expect(clampCameraToRoom(0, 0)).toEqual([0, 0])
    expect(clampCameraToRoom(3.2, -2.1)).toEqual([3.2, -2.1])
  })

  it('ramène la caméra à l’intérieur quand elle sort par un mur est/ouest', () => {
    const [x] = clampCameraToRoom(7.9, 0)
    expect(x).toBeLessThan(7)
    const [x2] = clampCameraToRoom(-8.4, 0)
    expect(x2).toBeGreaterThan(-7)
  })

  it('ramène la caméra à l’intérieur quand elle sort par un mur nord/sud', () => {
    const [, z] = clampCameraToRoom(0, 6.9)
    expect(z).toBeLessThan(5.8)
    const [, z2] = clampCameraToRoom(0, -6.7)
    expect(z2).toBeGreaterThan(-5.8)
  })

  it('garde une marge > near plane (0.1) par rapport aux murs', () => {
    const [x] = clampCameraToRoom(7.9, 0)
    expect(7 - x).toBeGreaterThan(0.1)
    const [, z] = clampCameraToRoom(0, -9)
    expect(z - -5.8).toBeGreaterThan(0.1)
  })

  it('gère les coins (deux axes hors limites à la fois)', () => {
    const [x, z] = clampCameraToRoom(8, -6.9)
    expect(x).toBeLessThan(7)
    expect(z).toBeGreaterThan(-5.8)
  })

  it('la marge caméra reste plus large que les bornes du garçon', () => {
    // Le garçon va jusqu'à ±6.7/±4.8 : la caméra doit pouvoir rester derrière
    // lui sans être clampée plus fort que lui (sinon à-coups visibles).
    const [x] = clampCameraToRoom(SALON_BOUNDS.maxX, 0)
    expect(x).toBeGreaterThanOrEqual(SALON_BOUNDS.maxX)
  })
})

// La caméra à 1,2 m derrière le garçon traversait meubles et murs : chaque mesh
// porte une coque <Outlines> (BackSide, noire) visible de l'intérieur → écran
// noir dès que la caméra entre dans un obstacle. cameraBackDistance raccourcit
// le recul caméra à la première obstruction (murs + AABB SALON_OBSTACLES).
// (backX, backZ) = direction normalisée du garçon VERS la caméra.

describe('cameraBackDistance', () => {
  const MAX_BACK = 1.2

  it('rend le recul complet en espace libre', () => {
    // Spawn (0, 3) caméra vers le sud : rien entre z=3 et z=4.2.
    expect(cameraBackDistance(0, 3, 0, 1, MAX_BACK)).toBe(MAX_BACK)
  })

  it('raccourcit le recul contre un mur', () => {
    // Garçon dos au mur nord (z=5.5), caméra repoussée vers z=6.7 :
    // limite mur = 5.65 → recul max 0.15.
    expect(cameraBackDistance(0, 5.5, 0, 1, MAX_BACK)).toBeCloseTo(0.15, 5)
    // Mur est : garçon x=6.6, caméra vers +x, limite 6.85 → 0.25.
    expect(cameraBackDistance(6.6, 0, 1, 0, MAX_BACK)).toBeCloseTo(0.25, 5)
  })

  it('raccourcit le recul devant un meuble (AABB élargie de la marge caméra)', () => {
    // Garçon à z=3.1, caméra vers sud, bord table z=2.55+marge 0.15=2.70 → recul 0.4.
    expect(cameraBackDistance(0, 3.1, 0, -1, MAX_BACK)).toBeCloseTo(0.4, 5)
  })

  it('rend 0 quand le point de départ touche déjà la zone élargie', () => {
    // Garçon collé au bord de la table (z=1.5 < 1.6 élargi) reculant dedans.
    expect(cameraBackDistance(0, 1.5, 0, -1, MAX_BACK)).toBe(0)
  })

  it('ignore les obstacles hors du rayon', () => {
    // Ras du mur ouest vers le nord : aucun obstacle sur x=-4, z∈[3, 4.2].
    expect(cameraBackDistance(-4, 3, 0, 1, MAX_BACK)).toBe(MAX_BACK)
  })

  it('détecte une entrée latérale dans une AABB (test slab, pas seulement frontal)', () => {
    // Recul longeant le mur est (x=6.3, z croissant) : le rayon entre dans la
    // plante en pot [6.1, 6.7, 2.50, 3.10] élargie (z > 2.35) → depuis z=1.5 recul 0.85.
    expect(cameraBackDistance(6.3, 1.5, 0, 1, MAX_BACK)).toBeCloseTo(0.85, 5)
  })

  it('ne rend jamais un recul négatif', () => {
    // Garçon (impossible mais défensif) au-delà de la limite mur.
    expect(cameraBackDistance(0, 5.75, 0, 1, MAX_BACK)).toBe(0)
  })
})

// Un personnage déjà DANS un obstacle (NPC assis, spawn limite) doit pouvoir
// en sortir : canMove ne bloque qu'en ENTRANT dans une AABB depuis l'extérieur.
describe('canMove', () => {
  it('autorise un déplacement en espace libre', () => {
    expect(canMove(0, 3, 0.1, 3)).toBe(true)
  })

  it("bloque l'entrée dans un obstacle depuis l'extérieur", () => {
    // Table AABB z max 2.55 : entrer depuis z=2.6 (dehors) vers z=2.4 (dedans) → refusé.
    expect(canMove(0, 2.6, 0, 2.4)).toBe(false)
  })

  it("autorise la sortie d'un obstacle depuis l'intérieur", () => {
    // Départ dans la zone table (z=1.0), sortie vers z=1.5 → accepté.
    expect(canMove(0, 1.0, 0, 1.5)).toBe(true)
  })

  it("autorise le déplacement à l'intérieur d'un même obstacle (traversée de sortie)", () => {
    expect(canMove(0, 1.0, 0.2, 1.1)).toBe(true)
  })

  it('bloque toujours la sortie de la pièce (hors arches)', () => {
    // Mur nord plein entre les arches (arche cuisine x≈-2.5, arche 2 x∈[3.6,5.4])
    expect(canMove(1, 5.5, 1, 5.7)).toBe(false)
    // Arche 2 (x=4.5) ouverte vers le couloir → passage autorisé
    expect(canMove(4.5, 5.5, 4.5, 5.7)).toBe(true)
    // Arche zaguán (z=0) est ouverte → passage autorisé
    expect(canMove(6.6, 0, 6.8, 0)).toBe(true)
    // Mur est plein au nord de l'arche (z=3 hors ouverture z∈[-0.9,0.9])
    expect(canMove(6.6, 3, 6.8, 3)).toBe(false)
  })
})
