// src/audio/layers.ts
export enum AudioLayer {
  SALON = 'SALON',
  HOUSE = 'HOUSE',
  MEMORY = 'MEMORY',
  ANIMAL = 'ANIMAL',
  SONG = 'SONG',
  SILENCE = 'SILENCE',
}

export interface LayerConfig {
  baseVolume: number
  fadeDurationMs: number
}

export const LAYER_DEFAULTS: Record<AudioLayer, LayerConfig> = {
  [AudioLayer.SALON]:   { baseVolume: 0.8, fadeDurationMs: 2000 },
  [AudioLayer.HOUSE]:   { baseVolume: 0.3, fadeDurationMs: 1000 },
  [AudioLayer.MEMORY]:  { baseVolume: 0.0, fadeDurationMs: 3000 },
  [AudioLayer.ANIMAL]:  { baseVolume: 0.2, fadeDurationMs: 500  },
  [AudioLayer.SONG]:    { baseVolume: 0.0, fadeDurationMs: 4000 },
  [AudioLayer.SILENCE]: { baseVolume: 0.0, fadeDurationMs: 500  },
}
