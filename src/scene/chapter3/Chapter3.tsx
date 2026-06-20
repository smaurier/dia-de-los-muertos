// src/scene/chapter3/Chapter3.tsx
import { useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { EffectComposer, Outline } from '@react-three/postprocessing'
import { Corridor } from './Corridor'
import { Mirror } from './Mirror'
import { Adult } from './Adult'
import { useAudioLayers } from '../../hooks/useAudioLayers'

export function Chapter3() {
  const adultRef = useRef<THREE.Group>(null)
  const corridorRef = useRef<THREE.Group>(null)
  const [adultIsNear, setAdultIsNear] = useState(false)

  useAudioLayers({ adultIsNear })

  const handleNearPlayer = useCallback((near: boolean) => {
    setAdultIsNear(near)
  }, [])

  return (
    <>
      <group>
        <Corridor ref={corridorRef} />
        <Mirror adultRef={adultRef} />
        <Adult onNearPlayer={handleNearPlayer} meshRef={adultRef} />
      </group>
      <EffectComposer>
        <Outline
          selection={[corridorRef, adultRef]}
          edgeStrength={3}
          pulseSpeed={0}
          visibleEdgeColor={0x000000}
          hiddenEdgeColor={0x000000}
          blur={false}
        />
      </EffectComposer>
    </>
  )
}
