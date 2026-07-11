import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF, useTexture } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'

const MODEL_URL = '/models/props/canape-full.glb'

const BODY_COLOR = '#4a3728'

export function Canape({
  position,
  rotationY = 0,
  targetLength,
}: {
  position: [number, number, number]
  rotationY?: number
  targetLength?: number
}) {
  const { scene } = useGLTF(MODEL_URL)
  const object = useMemo(() => scene.clone(true), [scene])

  const [texRouge, texCreme, texViolet] = useTexture([
    '/textures/coussin-rouge-01.png',
    '/textures/coussin-creme-01.png',
    '/textures/coussin-violet-01.png',
  ])

  // RepeatWrapping : motif tile sur toutes les faces (UV [0.27–0.73])
  useEffect(() => {
    for (const tex of [texRouge, texCreme, texViolet]) {
      tex.wrapS = THREE.RepeatWrapping
      tex.wrapT = THREE.RepeatWrapping
      tex.repeat.set(3, 3)
      tex.needsUpdate = true
    }
  }, [texRouge, texCreme, texViolet])

  const { scale, yOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(object)
    const size = new THREE.Vector3()
    box.getSize(size)
    const s = targetLength
      ? targetLength / Math.max(size.x, size.z)
      : 1
    return { scale: s, yOffset: -box.min.y * s }
  }, [object, targetLength])

  useEffect(() => {
    object.traverse(o => {
      if (!(o as THREE.Mesh).isMesh) return
      const mesh = o as THREE.Mesh
      if (!mesh.geometry.hasAttribute('normal')) {
        mesh.geometry.computeVertexNormals()
      }
      const name = o.name
      let mat: THREE.MeshToonMaterial
      if (name === 'coussin-rouge') {
        mat = new THREE.MeshToonMaterial({ map: texRouge, gradientMap: toonGradient })
      } else if (name === 'coussin-creme') {
        mat = new THREE.MeshToonMaterial({ map: texCreme, gradientMap: toonGradient })
      } else if (name === 'coussin-violet') {
        mat = new THREE.MeshToonMaterial({ map: texViolet, gradientMap: toonGradient })
      } else {
        // body canapé : conserve la texture Hunyuan si présente, sinon tissu uni
        const old = mesh.material as THREE.MeshStandardMaterial
        mat = new THREE.MeshToonMaterial(
          old?.map
            ? { map: old.map, gradientMap: toonGradient }
            : { color: BODY_COLOR, gradientMap: toonGradient },
        )
      }
      mesh.material = mat
    })
  }, [object, texRouge, texCreme, texViolet])

  return (
    <primitive
      object={object}
      position={[position[0], position[1] + yOffset, position[2]]}
      rotation={[0, rotationY, 0]}
      scale={scale}
    />
  )
}

useGLTF.preload(MODEL_URL)
