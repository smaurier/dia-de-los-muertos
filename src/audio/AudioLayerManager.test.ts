// src/audio/AudioLayerManager.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AudioLayerManager, HowlPort } from './AudioLayerManager'
import { AudioLayer, LAYER_DEFAULTS } from './layers'

function makeMockHowl(): HowlPort {
  return {
    play: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn(),
    fade: vi.fn(),
    loop: vi.fn(),
  }
}

describe('AudioLayerManager', () => {
  let mockHowls: Map<string, HowlPort>
  let manager: AudioLayerManager

  beforeEach(() => {
    mockHowls = new Map()
    const factory = (src: string): HowlPort => {
      const howl = makeMockHowl()
      mockHowls.set(src, howl)
      return howl
    }
    manager = new AudioLayerManager(factory, {
      [AudioLayer.SALON]:  'salon.mp3',
      [AudioLayer.SONG]:   'song.mp3',
      [AudioLayer.MEMORY]: 'memory.mp3',
    })
  })

  it('initializes SALON at default baseVolume', () => {
    expect(manager.getVolume(AudioLayer.SALON))
      .toBe(LAYER_DEFAULTS[AudioLayer.SALON].baseVolume)
  })

  it('initializes SONG at 0', () => {
    expect(manager.getVolume(AudioLayer.SONG)).toBe(0)
  })

  it('clamps volume above 1', () => {
    manager.setVolume(AudioLayer.SALON, 1.5)
    expect(manager.getVolume(AudioLayer.SALON)).toBe(1)
  })

  it('clamps volume below 0', () => {
    manager.setVolume(AudioLayer.SALON, -0.5)
    expect(manager.getVolume(AudioLayer.SALON)).toBe(0)
  })

  it('calls howl.volume when no fade', () => {
    manager.setVolume(AudioLayer.SALON, 0.5)
    expect(mockHowls.get('salon.mp3')!.volume).toHaveBeenCalledWith(0.5)
    expect(mockHowls.get('salon.mp3')!.fade).not.toHaveBeenCalled()
  })

  it('calls howl.fade when fade=true', () => {
    manager.setVolume(AudioLayer.SALON, 0.5, true)
    expect(mockHowls.get('salon.mp3')!.fade).toHaveBeenCalled()
    expect(mockHowls.get('salon.mp3')!.volume).not.toHaveBeenCalled()
  })

  it('loops all initialized howls', () => {
    expect(mockHowls.get('salon.mp3')!.loop).toHaveBeenCalledWith(true)
  })

  it('applyStillness(1): memory rises to 0.6', () => {
    manager.applyStillness(1)
    expect(manager.getVolume(AudioLayer.MEMORY)).toBe(0.6)
  })

  it('applyStillness(1): salon fades to 0.3', () => {
    manager.applyStillness(1)
    expect(manager.getVolume(AudioLayer.SALON)).toBe(0.3)
  })

  it('applyStillness(0): salon stays at 0.8', () => {
    manager.applyStillness(0)
    expect(manager.getVolume(AudioLayer.SALON)).toBe(0.8)
  })

  it('applyStillness(0): memory stays at 0', () => {
    manager.applyStillness(0)
    expect(manager.getVolume(AudioLayer.MEMORY)).toBe(0)
  })

  it('no crash when layer has no source', () => {
    expect(() => manager.setVolume(AudioLayer.ANIMAL, 0.5)).not.toThrow()
  })
})
