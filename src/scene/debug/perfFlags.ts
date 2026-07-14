// src/scene/debug/perfFlags.ts
// Interrupteurs de bissection perf : le salon rame même quasi vide (59 k
// tris → 15 fps) — le coût est ailleurs que la géométrie. Chaque flag coupe
// un sous-système ; on mesure le fps avec/sans → le coupable s'isole.
//
// Protocole (fps salon, spawn, sans bouger, ~20 s chacun) :
//   ?perflog                       → référence
//   ?perflog&noreflect             → sans les 3 réflecteurs (sol/fenêtre/miroir)
//   ?perflog&nonpc                 → sans les 22 NPCs + chien
//   ?perflog&nopapel               → sans papel picado + rideaux animés
//   ?perflog&nofx                  → sans Bloom/Vignette/Grain (existant)
const q = new URLSearchParams(window.location.search)

export const NO_REFLECT = q.has('noreflect')
export const NO_NPC = q.has('nonpc')
export const NO_PAPEL = q.has('nopapel')
