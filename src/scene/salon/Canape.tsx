import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF, useTexture } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'

const BODY_URL = '/models/props/canape-body.glb?v=3'
const CUSHION_URLS = [
  '/models/props/coussin-rouge.glb?v=3',
  '/models/props/coussin-creme.glb?v=3',
  '/models/props/coussin-violet.glb?v=3',
] as const

const TEXTURE_URLS = [
  '/textures/coussin-rouge-01.png',
  '/textures/coussin-creme-01.png',
  '/textures/coussin-violet-01.png',
] as const

// UV des coussin-*.glb : toutes faces en [0.27, 0.73]
// Rescaling → [0, 1] : motif couvre toute la face
const UV_MIN = 0.27
const UV_RANGE = 0.46  // 0.73 - 0.27
const UV_REPEAT = 1 / UV_RANGE      // ≈ 2.174
const UV_OFFSET = -UV_MIN / UV_RANGE // ≈ -0.587

// Positions en espace LOCAL GLB (avant scale) — issues de delete_cushions.py
// À remplacer par les valeurs POSITIONS_JSON du script après exécution
// Positions en espace Three.js Y-up (conversion depuis Blender Z-up : x,y,z → x,z,-y)
// Rotations : Blender (rx,ry,rz) → Three.js (rx, rz, -ry)
const CUSHION_DEFS = [
  {
    label: 'rouge',
    // Blender pos [-0.640, -0.300, 0.245] rot [0, -1.361, 0]
    pos: [-0.640,  0.245,  0.300] as [number, number, number],
    rot: [0,       0,      1.361] as [number, number, number],
  },
  {
    label: 'creme',
    // Blender pos [-0.360, 0.421, 0.153] rot [1.361, 0, 0.314]
    pos: [-0.360,  0.153,  -0.421] as [number, number, number],
    rot: [1.361,   0.314,   0    ] as [number, number, number],
  },
  {
    label: 'violet',
    // Blender pos [0.660, 0.282, 0.171] rot [1.361, 0, 0]
    pos: [0.660,   0.171,  -0.282] as [number, number, number],
    rot: [1.361,   0,       0    ] as [number, number, number],
  },
] as const

export function Canape({
  position,
  rotationY = 0,
  targetLength,
}: {
  position: [number, number, number]
  rotationY?: number
  targetLength?: number
}) {
  const { scene: bodyScene } = useGLTF(BODY_URL)
  const { scene: rougeScene } = useGLTF(CUSHION_URLS[0])
  const { scene: cremeScene } = useGLTF(CUSHION_URLS[1])
  const { scene: violetScene } = useGLTF(CUSHION_URLS[2])

  const bodyObj = useMemo(() => bodyScene.clone(true), [bodyScene])
  const cushionObjs = useMemo(
    () => [rougeScene, cremeScene, violetScene].map(s => s.clone(true)),
    [rougeScene, cremeScene, violetScene],
  )

  const [texRouge, texCreme, texViolet] = useTexture(TEXTURE_URLS)

  const { scale, yOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(bodyObj)
    const size = new THREE.Vector3()
    box.getSize(size)
    const s = targetLength ? targetLength / Math.max(size.x, size.z) : 1
    return { scale: s, yOffset: -box.min.y * s }
  }, [bodyObj, targetLength])

  // Body : toon sur texture Hunyuan
  useEffect(() => {
    bodyObj.traverse(o => {
      if (!(o as THREE.Mesh).isMesh) return
      const mesh = o as THREE.Mesh
      if (!mesh.geometry.hasAttribute('normal')) mesh.geometry.computeVertexNormals()
      const old = mesh.material as THREE.MeshStandardMaterial
      mesh.material = new THREE.MeshToonMaterial(
        old?.map
          ? { map: old.map, gradientMap: toonGradient }
          : { color: '#503917', gradientMap: toonGradient },
      )
    })
  }, [bodyObj])

  // Coussins : motif plein cadre via UV rescaling [0.27-0.73] → [0,1]
  useEffect(() => {
    const textures = [texRouge, texCreme, texViolet]
    cushionObjs.forEach((obj, i) => {
      const tex = textures[i].clone()
      tex.wrapS = THREE.ClampToEdgeWrapping
      tex.wrapT = THREE.ClampToEdgeWrapping
      tex.repeat.set(UV_REPEAT, UV_REPEAT)
      tex.offset.set(UV_OFFSET, UV_OFFSET)
      tex.needsUpdate = true

      obj.traverse(o => {
        if (!(o as THREE.Mesh).isMesh) return
        const mesh = o as THREE.Mesh
        if (!mesh.geometry.hasAttribute('normal')) mesh.geometry.computeVertexNormals()
        mesh.material = new THREE.MeshToonMaterial({ map: tex, gradientMap: toonGradient })
      })
    })
  }, [cushionObjs, texRouge, texCreme, texViolet])

  return (
    <group
      position={[position[0], position[1] + yOffset, position[2]]}
      rotation={[0, rotationY, 0]}
      scale={scale}
    >
      <primitive object={bodyObj} />
      {CUSHION_DEFS.map((def, i) => (
        <primitive
          key={def.label}
          object={cushionObjs[i]}
          position={def.pos}
          rotation={def.rot}
        />
      ))}
    </group>
  )
}

for (const url of [BODY_URL, ...CUSHION_URLS]) {
  useGLTF.preload(url)
}
