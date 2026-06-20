// src/scene/chapter3/Chapter3.tsx
import { useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { Corridor } from './Corridor'
import { Mirror } from './Mirror'
import { Adult } from './Adult'
import { useAudioLayers } from '../../hooks/useAudioLayers'

export function Chapter3() {
  const adultRef = useRef<THREE.Group>(null)
  const [adultIsNear, setAdultIsNear] = useState(false)

  useAudioLayers({ adultIsNear })

  const handleNearPlayer = useCallback((near: boolean) => {
    setAdultIsNear(near)
  }, [])

  return (
    <group>
      <Corridor />
      <Mirror adultRef={adultRef} />
      <Adult onNearPlayer={handleNearPlayer} meshRef={adultRef} />
    </group>
  )
}
