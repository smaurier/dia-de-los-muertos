// src/game/systems/songSystem.ts
import { Chapter } from '../store/gameStore'

export enum SongFragment {
  ABSENT = 'ABSENT',
  TWO_NOTES = 'TWO_NOTES',
  FRAGMENT = 'FRAGMENT',
  FULL = 'FULL',
  IN_CHILD = 'IN_CHILD',
}

export interface SongContext {
  chapter: Chapter
  isStill: boolean
  adultIsNear: boolean
  isAtOfrenda: boolean
  isInSalon: boolean
}

type FragmentResolver = (ctx: SongContext) => SongFragment

const resolvers: Record<Chapter, FragmentResolver> = {
  [Chapter.ONE]:   () => SongFragment.ABSENT,
  [Chapter.TWO]:   () => SongFragment.ABSENT,
  [Chapter.THREE]: (ctx) => ctx.adultIsNear ? SongFragment.TWO_NOTES : SongFragment.ABSENT,
  [Chapter.FOUR]:  (ctx) => ctx.isInSalon ? SongFragment.TWO_NOTES : SongFragment.ABSENT,
  [Chapter.FIVE]:  (ctx) => ctx.isStill ? SongFragment.FRAGMENT : SongFragment.ABSENT,
  [Chapter.SIX]:   () => SongFragment.FRAGMENT,
  [Chapter.SEVEN]: () => SongFragment.ABSENT,
  [Chapter.EIGHT]: (ctx) => ctx.isAtOfrenda ? SongFragment.FULL : SongFragment.ABSENT,
  [Chapter.NINE]:  () => SongFragment.IN_CHILD,
}

export function getSongFragment(ctx: SongContext): SongFragment {
  return resolvers[ctx.chapter](ctx)
}
