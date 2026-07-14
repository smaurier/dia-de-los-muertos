// src/scene/ui/DoorHint.tsx
// Door interaction hint: "F — open / close" when the player is within range
// of a door. The key comes from controlsConfig (reconfigurable).
import { createPortal } from 'react-dom'
import { usePlayerStore } from '../../game/store/playerStore'
import { useDoorStore } from '../../game/store/doorStore'
import { nearestDoorId } from '../../game/systems/doorSystem'
import { DOORS, DOOR_INTERACT_DIST } from '../living-room/doorConfig'
import { INTERACT_LABEL } from '../../game/controlsConfig'

export function DoorHint() {
  const position = usePlayerStore(s => s.position)
  const open = useDoorStore(s => s.open)

  const doorId = nearestDoorId(position[0], position[2], DOORS, DOOR_INTERACT_DIST)
  if (!doorId) return null
  const door = DOORS.find(d => d.id === doorId)
  if (!door) return null

  const action = door.locked ? 'ouvrir' : open[doorId] ? 'fermer' : 'ouvrir'

  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: '12vh',
        left: 0,
        right: 0,
        zIndex: 99998,
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          background: 'rgba(0,0,0,0.65)',
          borderRadius: '6px',
          padding: '0.5em 1em',
          color: '#ffffff',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '20px',
          textShadow: '1px 1px 4px #000',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            border: '2px solid #f5c87a',
            borderRadius: '4px',
            padding: '0 0.45em',
            marginRight: '0.55em',
            color: '#f5c87a',
            fontWeight: 'bold',
          }}
        >
          {INTERACT_LABEL}
        </span>
        {action}
      </span>
    </div>,
    document.body,
  )
}
