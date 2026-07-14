// src/scene/shared/ZoneReflector.tsx
// MeshReflectorMaterial vendorisé depuis @react-three/drei (MIT) avec trois
// ajouts DANS sa boucle de rendu — la seule façon fiable de gater la passe :
//   1. zone : la passe ne tourne que si le joueur est dans la zone du
//      réflecteur ou une adjacente (roomZones). Hors zone : le FBO garde sa
//      dernière image, que personne ne regarde. Le matériau reste MONTÉ en
//      permanence → aucun cycle compile/dispose (les bascules React de la
//      version précédente recompilaient des shaders et fuyaient des FBO à
//      chaque frontière de pièce — gels mesurés à 0-1 fps).
//   2. everyNFrames (défaut 2) : demi-cadence, instances déphasées entre
//      elles — au plus ~1 passe réflecteur par frame.
//   3. salonScope : masque le group 'satellite-rooms' pendant la passe (le
//      reflet du sol/fenêtre du salon ne re-rend que le salon).
// ?noreflect : gèle toutes les passes (bissection).
import * as React from 'react'
import {
  Plane, Vector3, Matrix4, Vector4, PerspectiveCamera, WebGLRenderTarget,
  DepthTexture, DepthFormat, UnsignedShortType, LinearFilter, HalfFloatType,
} from 'three'
import type * as THREE from 'three'
import { extend, useThree, useFrame, type ThreeElement } from '@react-three/fiber'
import { BlurPass } from '@react-three/drei/materials/BlurPass.js'
import { MeshReflectorMaterial as MeshReflectorMaterialImpl } from '@react-three/drei/materials/MeshReflectorMaterial.js'
import { isZoneVisible, type ZoneId } from '../../game/systems/roomZones'
import { usePlayerStore } from '../../game/store/playerStore'

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshReflectorMaterialImpl: ThreeElement<typeof MeshReflectorMaterialImpl>
  }
}

const NO_REFLECT = new URLSearchParams(window.location.search).has('noreflect')

// Déphasage global : chaque instance rend sur une frame différente
let nextPhase = 0

type Props = {
  zone: ZoneId
  everyNFrames?: number
  salonScope?: boolean
  mixBlur?: number
  mixStrength?: number
  resolution?: number
  blur?: [number, number] | number
  minDepthThreshold?: number
  maxDepthThreshold?: number
  depthScale?: number
  depthToBlurRatioBias?: number
  mirror: number
  distortion?: number
  mixContrast?: number
  distortionMap?: THREE.Texture
  reflectorOffset?: number
} & Omit<JSX.IntrinsicElements['meshStandardMaterial'], 'ref'>

export function ZoneReflectorMaterial({
  zone,
  everyNFrames = 2,
  salonScope = false,
  mixBlur = 0,
  mixStrength = 1,
  resolution = 256,
  blur = [0, 0],
  minDepthThreshold = 0.9,
  maxDepthThreshold = 1,
  depthScale = 0,
  depthToBlurRatioBias = 0.25,
  mirror = 0,
  distortion = 1,
  mixContrast = 1,
  distortionMap,
  reflectorOffset = 0,
  ...props
}: Props) {
  extend({ MeshReflectorMaterialImpl })
  const gl = useThree(({ gl }) => gl)
  const camera = useThree(({ camera }) => camera)
  const scene = useThree(({ scene }) => scene)
  const blurArr = Array.isArray(blur) ? blur : [blur, blur]
  const hasBlur = blurArr[0] + blurArr[1] > 0
  const materialRef = React.useRef<InstanceType<typeof MeshReflectorMaterialImpl>>(null)
  const [myPhase] = React.useState(() => nextPhase++)
  const frame = React.useRef(0)
  const satellites = React.useRef<THREE.Object3D | null>(null)

  const [reflectorPlane] = React.useState(() => new Plane())
  const [normal] = React.useState(() => new Vector3())
  const [reflectorWorldPosition] = React.useState(() => new Vector3())
  const [cameraWorldPosition] = React.useState(() => new Vector3())
  const [rotationMatrix] = React.useState(() => new Matrix4())
  const [lookAtPosition] = React.useState(() => new Vector3(0, 0, -1))
  const [clipPlane] = React.useState(() => new Vector4())
  const [view] = React.useState(() => new Vector3())
  const [target] = React.useState(() => new Vector3())
  const [q] = React.useState(() => new Vector4())
  const [textureMatrix] = React.useState(() => new Matrix4())
  const [virtualCamera] = React.useState(() => new PerspectiveCamera())

  const beforeRender = React.useCallback(() => {
    const mat = materialRef.current as unknown as { parent?: THREE.Object3D; __r3f?: { parent?: { object?: THREE.Object3D } } } | null
    const parent = mat?.parent || mat?.__r3f?.parent?.object
    if (!parent) return false
    reflectorWorldPosition.setFromMatrixPosition(parent.matrixWorld)
    cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld)
    rotationMatrix.extractRotation(parent.matrixWorld)
    normal.set(0, 0, 1)
    normal.applyMatrix4(rotationMatrix)
    reflectorWorldPosition.addScaledVector(normal, reflectorOffset)
    view.subVectors(reflectorWorldPosition, cameraWorldPosition)
    // Réflecteur vu de dos : rien à faire
    if (view.dot(normal) > 0) return false
    view.reflect(normal).negate()
    view.add(reflectorWorldPosition)
    rotationMatrix.extractRotation(camera.matrixWorld)
    lookAtPosition.set(0, 0, -1)
    lookAtPosition.applyMatrix4(rotationMatrix)
    lookAtPosition.add(cameraWorldPosition)
    target.subVectors(reflectorWorldPosition, lookAtPosition)
    target.reflect(normal).negate()
    target.add(reflectorWorldPosition)
    virtualCamera.position.copy(view)
    virtualCamera.up.set(0, 1, 0)
    virtualCamera.up.applyMatrix4(rotationMatrix)
    virtualCamera.up.reflect(normal)
    virtualCamera.lookAt(target)
    virtualCamera.far = camera.far
    virtualCamera.updateMatrixWorld()
    virtualCamera.projectionMatrix.copy(camera.projectionMatrix)
    textureMatrix.set(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0)
    textureMatrix.multiply(virtualCamera.projectionMatrix)
    textureMatrix.multiply(virtualCamera.matrixWorldInverse)
    textureMatrix.multiply(parent.matrixWorld)
    reflectorPlane.setFromNormalAndCoplanarPoint(normal, reflectorWorldPosition)
    reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse)
    clipPlane.set(reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant)
    const projectionMatrix = virtualCamera.projectionMatrix
    q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0]
    q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5]
    q.z = -1.0
    q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14]
    clipPlane.multiplyScalar(2.0 / clipPlane.dot(q))
    projectionMatrix.elements[2] = clipPlane.x
    projectionMatrix.elements[6] = clipPlane.y
    projectionMatrix.elements[10] = clipPlane.z + 1.0
    projectionMatrix.elements[14] = clipPlane.w
    return true
  }, [camera, reflectorOffset]) // eslint-disable-line react-hooks/exhaustive-deps

  const [fbo1, fbo2, blurpass, reflectorProps] = React.useMemo(() => {
    const parameters = { minFilter: LinearFilter, magFilter: LinearFilter, type: HalfFloatType }
    const fbo1 = new WebGLRenderTarget(resolution, resolution, parameters)
    fbo1.depthBuffer = true
    fbo1.depthTexture = new DepthTexture(resolution, resolution)
    fbo1.depthTexture.format = DepthFormat
    fbo1.depthTexture.type = UnsignedShortType
    const fbo2 = new WebGLRenderTarget(resolution, resolution, parameters)
    const blurpass = new BlurPass({
      gl, resolution, width: blurArr[0], height: blurArr[1],
      minDepthThreshold, maxDepthThreshold, depthScale, depthToBlurRatioBias,
    })
    const reflectorProps = {
      mirror, textureMatrix, mixBlur,
      tDiffuse: fbo1.texture, tDepth: fbo1.depthTexture, tDiffuseBlur: fbo2.texture,
      hasBlur, mixStrength, minDepthThreshold, maxDepthThreshold, depthScale,
      depthToBlurRatioBias, distortion, distortionMap, mixContrast,
      'defines-USE_BLUR': hasBlur ? '' : undefined,
      'defines-USE_DEPTH': depthScale > 0 ? '' : undefined,
      'defines-USE_DISTORTION': distortionMap ? '' : undefined,
    }
    return [fbo1, fbo2, blurpass, reflectorProps]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, blurArr[0], blurArr[1], textureMatrix, resolution, mirror, hasBlur, mixBlur, mixStrength, minDepthThreshold, maxDepthThreshold, depthScale, depthToBlurRatioBias, distortion, distortionMap, mixContrast])

  useFrame(() => {
    if (NO_REFLECT) return
    // ── Gate de zone : la passe ne tourne que si on peut voir ce réflecteur ──
    const [px, , pz] = usePlayerStore.getState().position
    if (!isZoneVisible(zone, px, pz)) return
    // ── Demi-cadence déphasée entre instances ──
    if (frame.current++ % everyNFrames !== myPhase % everyNFrames) return

    const mat = materialRef.current as unknown as { parent?: THREE.Object3D; __r3f?: { parent?: { object?: THREE.Object3D } } } | null
    const parent = mat?.parent || mat?.__r3f?.parent?.object
    if (!parent) return
    ;(parent as THREE.Object3D).visible = false
    const currentXrEnabled = gl.xr.enabled
    const currentShadowAutoUpdate = gl.shadowMap.autoUpdate
    const ok = beforeRender()
    if (ok) {
      // ── Scope salon : le reflet ne re-rend que le salon ──
      if (salonScope) {
        if (!satellites.current) satellites.current = scene.getObjectByName('satellite-rooms') ?? null
        if (satellites.current) satellites.current.visible = false
      }
      gl.xr.enabled = false
      gl.shadowMap.autoUpdate = false
      gl.setRenderTarget(fbo1)
      gl.state.buffers.depth.setMask(true)
      if (!gl.autoClear) gl.clear()
      gl.render(scene, virtualCamera)
      if (hasBlur) blurpass.render(gl, fbo1, fbo2)
      gl.xr.enabled = currentXrEnabled
      gl.shadowMap.autoUpdate = currentShadowAutoUpdate
      gl.setRenderTarget(null)
      if (salonScope && satellites.current) satellites.current.visible = true
    }
    ;(parent as THREE.Object3D).visible = true
  })

  return (
    <meshReflectorMaterialImpl
      attach="material"
      key={'key' + reflectorProps['defines-USE_BLUR'] + reflectorProps['defines-USE_DEPTH'] + reflectorProps['defines-USE_DISTORTION']}
      ref={materialRef}
      {...reflectorProps}
      {...props}
    />
  )
}
