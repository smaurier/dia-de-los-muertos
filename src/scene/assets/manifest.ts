// src/scene/assets/manifest.ts
// Single source of truth for asset URLs. Components import from here; the
// preloader loads MODEL_URLS + TEXTURE_URLS as one batch.

// ── Character GLBs ──
export const HERO_URL = '/models/characters/heros.glb?v=3'
export const MAMA_URL = '/models/characters/mama.glb?v=3'
export const GRAND_UNCLE_URL = '/models/characters/grand-oncle.glb?v=3'
export const DOG_URL = '/models/characters/chien-puppy2.glb?v=3'
export const BASE_URLS = [
  '/models/characters/base-01.glb?v=6',
  '/models/characters/base-02.glb?v=3',
  '/models/characters/base-03.glb?v=7',
  '/models/characters/base-04.glb?v=7',
] as const

// ── Prop GLBs ──
export const SOFA_BODY_URL = '/models/props/canape-body.glb?v=3'
export const CUSHION_URLS = [
  '/models/props/coussin-rouge.glb?v=3',
  '/models/props/coussin-creme.glb?v=3',
  '/models/props/coussin-violet.glb?v=3',
] as const
export const CHAIR_URL = '/models/props/chaise.glb?v=3'
export const BUFFET_URL = '/models/props/buffet.glb?v=3'
export const ARMCHAIR_URL = '/models/props/fauteuil.glb?v=3'
export const TV_URL = '/models/props/tv.glb?v=3'

// ── Texture files ──
export const TEX_ADOBE = '/textures/mur-adobe-01.png'
export const TEX_TOMETTES = '/textures/sol-tomettes-01.png'
export const TEX_STONE = '/textures/mur-pierre.png'
export const TEX_WOOD_DARK = '/textures/bois-sombre-01.png'
export const TEX_AZULEJOS = '/textures/azulejos-talavera.png'
export const TEX_TABLECLOTH = '/textures/nappe-brodee-01.png'
export const CUSHION_TEX_URLS = [
  '/textures/coussin-rouge-01.png',
  '/textures/coussin-creme-01.png',
  '/textures/coussin-violet-01.png',
] as const

// ── Aggregates for the preloader ──
export const MODEL_URLS: string[] = [
  HERO_URL, MAMA_URL, GRAND_UNCLE_URL, DOG_URL, ...BASE_URLS,
  SOFA_BODY_URL, ...CUSHION_URLS, CHAIR_URL, BUFFET_URL, ARMCHAIR_URL, TV_URL,
]
export const TEXTURE_URLS: string[] = [
  TEX_ADOBE, TEX_TOMETTES, TEX_STONE, TEX_WOOD_DARK, TEX_AZULEJOS, TEX_TABLECLOTH,
  ...CUSHION_TEX_URLS,
]
