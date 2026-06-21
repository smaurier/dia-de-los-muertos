// src/scene/ui/Subtitles.tsx
import { createPortal } from 'react-dom'
import { useSubtitleStore } from '../../game/store/subtitleStore'

export function Subtitles() {
  const text = useSubtitleStore(s => s.text)
  const speaker = useSubtitleStore(s => s.speaker)

  if (!text) return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.90)',
        padding: '2vh 6vw',
        textAlign: 'center',
        pointerEvents: 'none',
        zoom: 1,
      }}
    >
      <p
        style={{
          margin: 0,
          color: '#ffffff',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '28px',
          lineHeight: 1.5,
          textShadow: '2px 2px 6px #000',
          zoom: 1,
        }}
      >
        {speaker && (
          <span style={{ color: '#f5c87a', fontWeight: 'bold', marginRight: '0.5em' }}>
            {speaker} :
          </span>
        )}
        {text}
      </p>
    </div>,
    document.body,
  )
}
