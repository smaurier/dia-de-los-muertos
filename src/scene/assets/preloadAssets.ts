// src/scene/assets/preloadAssets.ts
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { MODEL_URLS, TEXTURE_URLS } from './manifest'

let started = false

// Fire every asset load in one loading-manager batch. Idempotent.
export function preloadAll(): void {
  if (started) return
  started = true
  MODEL_URLS.forEach(url => useGLTF.preload(url))
  const texLoader = new THREE.TextureLoader()
  TEXTURE_URLS.forEach(url => texLoader.load(url))
}
