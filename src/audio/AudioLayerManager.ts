// src/audio/AudioLayerManager.ts
import { AudioLayer, LayerConfig, LAYER_DEFAULTS } from './layers'

export interface HowlPort {
  play(): void
  stop(): void
  volume(vol: number): void
  fade(from: number, to: number, durationMs: number): void
  loop(loop: boolean): void
}

export type HowlFactory = (src: string) => HowlPort

export class AudioLayerManager {
  private volumes = new Map<AudioLayer, number>()
  private howls = new Map<AudioLayer, HowlPort>()

  constructor(
    private readonly factory: HowlFactory,
    private readonly sources: Partial<Record<AudioLayer, string>> = {},
    private readonly configs: Record<AudioLayer, LayerConfig> = LAYER_DEFAULTS
  ) {
    for (const layer of Object.values(AudioLayer)) {
      this.volumes.set(layer, configs[layer].baseVolume)
      const src = sources[layer]
      if (src) {
        const howl = factory(src)
        howl.loop(true)
        this.howls.set(layer, howl)
      }
    }
  }

  getVolume(layer: AudioLayer): number {
    return this.volumes.get(layer) ?? 0
  }

  setVolume(layer: AudioLayer, volume: number, fade = false): void {
    const clamped = Math.max(0, Math.min(1, volume))
    const current = this.volumes.get(layer) ?? 0
    this.volumes.set(layer, clamped)

    const howl = this.howls.get(layer)
    if (!howl) return

    if (fade) {
      howl.fade(current, clamped, this.configs[layer].fadeDurationMs)
    } else {
      howl.volume(clamped)
    }
  }

  play(layer: AudioLayer): void {
    this.howls.get(layer)?.play()
  }

  stop(layer: AudioLayer): void {
    this.howls.get(layer)?.stop()
  }

  applyStillness(intensity: number): void {
    this.setVolume(AudioLayer.MEMORY, intensity * 0.6, true)
    const salonVol = Math.round(Math.max(0.3, 0.8 - intensity * 0.5) * 1000) / 1000
    this.setVolume(AudioLayer.SALON, salonVol, true)
  }
}
