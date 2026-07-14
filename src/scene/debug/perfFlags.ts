// src/scene/debug/perfFlags.ts
// Perf bisection switches: the salon is slow even nearly empty (59 k tris
// → 15 fps) — the cost is elsewhere than geometry. Each flag cuts one
// subsystem; measure fps with/without → isolate the culprit.
//
// Protocol (salon fps, at spawn, without moving, ~20 s each):
//   ?perflog                       → baseline
//   ?perflog&noreflect             → without the 3 reflectors (floor/window/mirror)
//   ?perflog&nonpc                 → without the 22 NPCs + dog
//   ?perflog&nopapel               → without papel picado + animated curtains
//   ?perflog&nofx                  → without Bloom/Vignette/Grain (existing)
const q = new URLSearchParams(window.location.search)

export const NO_REFLECT = q.has('noreflect')
export const NO_NPC = q.has('nonpc')
export const NO_PAPEL = q.has('nopapel')
