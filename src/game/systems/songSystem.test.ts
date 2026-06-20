// src/game/systems/songSystem.test.ts
import { describe, it, expect } from 'vitest'
import { getSongFragment, SongFragment } from './songSystem'
import { Chapter } from '../store/gameStore'

const base = {
  isStill: false,
  adultIsNear: false,
  isAtOfrenda: false,
  isInSalon: false,
}

describe('getSongFragment', () => {
  it('absent in chapters 1 and 2', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.ONE })).toBe(SongFragment.ABSENT)
    expect(getSongFragment({ ...base, chapter: Chapter.TWO })).toBe(SongFragment.ABSENT)
  })

  it('chapter 3: absent when adult not near', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.THREE })).toBe(SongFragment.ABSENT)
  })

  it('chapter 3: two notes when adult is near', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.THREE, adultIsNear: true }))
      .toBe(SongFragment.TWO_NOTES)
  })

  it('chapter 4: two notes when in salon', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.FOUR, isInSalon: true }))
      .toBe(SongFragment.TWO_NOTES)
  })

  it('chapter 4: absent outside salon', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.FOUR })).toBe(SongFragment.ABSENT)
  })

  it('chapter 5: fragment only when still', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.FIVE })).toBe(SongFragment.ABSENT)
    expect(getSongFragment({ ...base, chapter: Chapter.FIVE, isStill: true }))
      .toBe(SongFragment.FRAGMENT)
  })

  it('chapter 6: always fragment — room holds the song', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.SIX })).toBe(SongFragment.FRAGMENT)
    expect(getSongFragment({ ...base, chapter: Chapter.SIX, isStill: false }))
      .toBe(SongFragment.FRAGMENT)
  })

  it('chapter 7: absent — silence of storage room', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.SEVEN, isStill: true }))
      .toBe(SongFragment.ABSENT)
  })

  it('chapter 8: full song at ofrenda', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.EIGHT })).toBe(SongFragment.ABSENT)
    expect(getSongFragment({ ...base, chapter: Chapter.EIGHT, isAtOfrenda: true }))
      .toBe(SongFragment.FULL)
  })

  it('chapter 9: song is in the child, always', () => {
    expect(getSongFragment({ ...base, chapter: Chapter.NINE })).toBe(SongFragment.IN_CHILD)
  })
})
