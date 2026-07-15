// Pure helpers for the progressive compile queue.

// Priority items first, then the rest; dedupe by key (first occurrence wins),
// preserving order within each group.
export function dedupePriority<T>(items: { key: string; priority: boolean; value: T }[]): T[] {
  const seen = new Set<string>()
  const pri: T[] = []
  const rest: T[] = []
  for (const it of items) {
    if (seen.has(it.key)) continue
    seen.add(it.key)
    ;(it.priority ? pri : rest).push(it.value)
  }
  return [...pri, ...rest]
}

export function progressOf(compiled: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(1, compiled / total)
}
