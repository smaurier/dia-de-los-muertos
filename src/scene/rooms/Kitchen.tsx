// src/scene/rooms/Kitchen.tsx
// Family kitchen (x∈[-7,-0.6], z∈[5.8,12.0]) — accessed from the living room's north archway.
// Refs: cuisine-entree-01/02.png, cuisine-coin-pierres-01/02.png
import { KitchenStructure } from './kitchen/KitchenStructure'
import { Stove } from './kitchen/Stove'
import { KitchenLighting } from './kitchen/KitchenLighting'
import { KitchenShelf } from './kitchen/KitchenShelf'
import { KitchenTable } from './kitchen/KitchenTable'
import { KitchenAppliances } from './kitchen/KitchenAppliances'
import { KitchenAltar } from './kitchen/KitchenAltar'
import { KitchenDecor } from './kitchen/KitchenDecor'

export function Kitchen() {
  return (
    <group>
      <KitchenStructure />

      <Stove />

      <KitchenShelf />

      <KitchenTable />

      <KitchenAltar />

      <KitchenLighting />

      <KitchenDecor />

      <KitchenAppliances />
    </group>
  )
}
