// src/scene/salon/SalonRoom.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Outlines, RoundedBox } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'

// ─── Couleurs ────────────────────────────────────────────────────────────────
const C_WOOD_DARK  = '#3A2008'
const C_WOOD_MED   = '#5C3010'
const C_WOOD_LIGHT = '#7A4820'
const C_CUSHION    = '#6B3520'
const C_UPHOLSTERY = '#4A2E1A'
const C_WALL       = '#D4B896'
const C_WALL_SIDE  = '#C9A87C'
const C_TILE_GROUT = '#B8B0A6'
const C_TILE_FACE  = '#F0EBE3'
const C_CEIL       = '#F0E0C8'
const C_IRON       = '#2A3530'
const C_GOLD       = '#C8A040'
const C_FRAME      = '#2A1A08'
const C_PHOTO      = '#4A4858'
const C_CACTUS     = '#2D7A2D'
const C_POT        = '#C47A3A'
const C_CANDLE     = '#F5E8D0'
const C_FLAME      = '#FF7700'

// ─── Papel picado ─────────────────────────────────────────────────────────────
const PAPEL_COLORS = ['#C0392B', '#8E44AD', '#E67E22', '#27AE60', '#F1C40F', '#2980B9']
const PAPEL_Z = [3.8, 1.4, -2.0]
const FLAG_X  = [-5.5, -4.2, -2.9, -1.6, -0.3, 1.0, 2.3, 3.6, 4.9, 6.0]

// ─── Chaises ─────────────────────────────────────────────────────────────────
type ChairCfg = { pos: [number, number, number]; rot: number }
// Chaises nord/sud : z=1.25 → 1.60 (assise s'étendait jusqu'à z=1.04, table va à z=1.15 → 11cm overlap).
// End chairs : rot corrigé. local +z = direction assise. West end doit faire face à +x (table) → rot=+π/2.
// East end doit faire face à -x → rot=-π/2. Positions x sorties du range table [-4.75, 3.75].
const CHAIRS: ChairCfg[] = [
  { pos: [-3.5, 0, 1.60], rot: Math.PI },    // nord — face au sud (table)
  { pos: [-2.5, 0, 1.60], rot: Math.PI },
  { pos: [-1.5, 0, 1.60], rot: Math.PI },
  { pos: [-0.5, 0, 1.60], rot: Math.PI },
  { pos: [0.5,  0, 1.60], rot: Math.PI },
  { pos: [1.5,  0, 1.60], rot: Math.PI },
  { pos: [2.5,  0, 1.60], rot: Math.PI },
  { pos: [-3.5, 0, -1.60], rot: 0 },         // sud — face au nord (table)
  { pos: [-2.5, 0, -1.60], rot: 0 },
  { pos: [-1.5, 0, -1.60], rot: 0 },
  { pos: [-0.5, 0, -1.60], rot: 0 },
  { pos: [0.5,  0, -1.60], rot: 0 },
  { pos: [1.5,  0, -1.60], rot: 0 },
  { pos: [2.5,  0, -1.60], rot: 0 },
  { pos: [-5.0, 0, -0.4], rot:  Math.PI / 2 }, // ouest — face à +x (table), était rot=-π/2 (dos à la table!)
  { pos: [-5.0, 0,  0.4], rot:  Math.PI / 2 },
  { pos: [ 4.2, 0, -0.4], rot: -Math.PI / 2 }, // est — face à -x (table), était rot=+π/2 (dos à la table!)
  { pos: [ 4.2, 0,  0.4], rot: -Math.PI / 2 },
  { pos: [-6.1, 0, -3.1], rot: -Math.PI / 2 }, // coin buffet (inchangé)
  { pos: [-6.1, 0, -3.9], rot: -Math.PI / 2 },
]

const LEG_POS: [number, number][] = [[-0.16, 0.15], [0.16, 0.15], [-0.16, -0.17], [0.16, -0.17]]
const TABLE_LEG_X = [-4.0, -0.5, 3.0]
const TABLE_LEG_Z = [-0.9, 0.9]

const FRAMES_SOUTH: [number, number, number][] = [[-3, 1.9, -4.97], [0, 1.9, -4.97], [3, 1.9, -4.97]]
const FRAMES_EAST:  [number, number, number][] = [[6.97, 1.9, 0.8], [6.97, 1.9, -1.2]]
const CANDLES_BUFFET: [number, number, number][] = [[-6.3, 1.08, -1.9], [-6.3, 1.08, -2.5], [-6.3, 1.08, -3.1]]
const CANDLES_TABLE: [number, number, number][]  = [[-2.0, 0.78, 0.25], [0.8, 0.78, -0.25]]
const WINDOW_Z  = [2.5, -1.5]
const REJA_DZ   = [-0.35, 0, 0.35]
const PLATE_X   = [-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5]
const PLATE_Z   = [0.90, -0.90]  // aligné avec chaises à z=±1.60 (était ±0.70, aucun rapport avec les chaises)

// Carrelage : 512×512 canvas, grille 4×4, joints gris, carreaux crème
function makeTileTexture(): THREE.CanvasTexture {
  const px = 512
  const canvas = document.createElement('canvas')
  canvas.width = px; canvas.height = px
  const ctx = canvas.getContext('2d')!
  const n = 4, grout = 7
  const tile = (px - grout * (n + 1)) / n
  ctx.fillStyle = C_TILE_GROUT
  ctx.fillRect(0, 0, px, px)
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const x = grout + c * (tile + grout)
      const y = grout + r * (tile + grout)
      ctx.fillStyle = C_TILE_FACE
      ctx.fillRect(x, y, tile, tile)
    }
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(7, 5) // 7 tuiles sur 14m, 5 sur 10m → tuile ≈ 2m
  return tex
}
const tileTexture = makeTileTexture()

// ─── Composants ───────────────────────────────────────────────────────────────
function Chair({ pos, rot }: { pos: [number, number, number]; rot: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {/* Assise structurelle */}
      <mesh position={[0, 0.44, 0]}>
        <boxGeometry args={[0.44, 0.055, 0.42]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      {/* Coussin — RoundedBox */}
      <RoundedBox args={[0.36, 0.08, 0.34]} radius={0.018} smoothness={3} position={[0, 0.48, 0.01]}>
        <meshToonMaterial color={C_CUSHION} gradientMap={toonGradient} />
        <Outlines thickness={0.018} color="black" />
      </RoundedBox>
      {/* Montant dossier gauche */}
      <mesh position={[-0.155, 0.74, -0.19]}>
        <boxGeometry args={[0.038, 0.58, 0.038]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      {/* Montant dossier droit */}
      <mesh position={[0.155, 0.74, -0.19]}>
        <boxGeometry args={[0.038, 0.58, 0.038]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      {/* Rail supérieur */}
      <mesh position={[0, 1.01, -0.19]}>
        <boxGeometry args={[0.38, 0.06, 0.038]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
        <Outlines thickness={0.016} color="black" />
      </mesh>
      {/* Barreau central */}
      <mesh position={[0, 0.75, -0.19]}>
        <boxGeometry args={[0.30, 0.038, 0.038]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
      </mesh>
      {/* 4 pieds */}
      {LEG_POS.map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.21, lz]}>
          <cylinderGeometry args={[0.024, 0.028, 0.42, 7]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
      ))}
    </group>
  )
}

// Flicker : timer accumule dt, change target intensité tous ~100ms (Math.random → organique),
// lerp lisse la transition. Sin séparé pour la forme de la flamme (scale oscillant).
function AnimatedCandle({ position }: { position: [number, number, number] }) {
  const lightRef  = useRef<THREE.PointLight>(null)
  const flameRef  = useRef<THREE.Mesh>(null)
  const targetI   = useRef(1.0)
  const elapsed   = useRef(Math.random() * 0.15)
  const gt        = useRef(Math.random() * 100) // temps global pour sin flamme

  useFrame((_, delta) => {
    gt.current += delta
    elapsed.current += delta
    if (elapsed.current > 0.10) {
      elapsed.current = 0
      targetI.current = 0.65 + Math.random() * 0.70
    }
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetI.current, delta * 12)
    }
    if (flameRef.current) {
      flameRef.current.scale.x = 0.88 + Math.sin(gt.current * 8.7)  * 0.12
      flameRef.current.scale.z = 0.88 + Math.sin(gt.current * 11.3) * 0.10
    }
  })

  return (
    <group position={position}>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.028, 0.033, 0.18, 7]} />
        <meshToonMaterial color={C_CANDLE} gradientMap={toonGradient} />
        <Outlines thickness={0.015} color="black" />
      </mesh>
      <mesh position={[0, 0.185, 0]}>
        <cylinderGeometry args={[0.033, 0.028, 0.01, 7]} />
        <meshToonMaterial color={C_CANDLE} gradientMap={toonGradient} />
      </mesh>
      <mesh ref={flameRef} position={[0, 0.24, 0]}>
        <coneGeometry args={[0.028, 0.07, 6]} />
        <meshToonMaterial color={C_FLAME} gradientMap={toonGradient} emissive="#FF4400" emissiveIntensity={1.2} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      {/* pointLight local → chaque bougie éclaire sa zone */}
      <pointLight ref={lightRef} position={[0, 0.28, 0]} intensity={1.0} color="#FF8833" distance={2.2} decay={2} />
    </group>
  )
}

// Papel picado animé — la guirlande se balance via rotation.x sinusoïdale.
// Chaque strand a un offset de phase (si * 2.1) pour éviter la synchronisation.
function PapelStrand({ sz, si }: { sz: number; si: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const t = useRef(si * 2.1)

  useFrame((_, delta) => {
    t.current += delta * 0.5
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(t.current) * 0.025
      groupRef.current.position.y = Math.sin(t.current * 1.6) * 0.006
    }
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 2.88, sz]}>
        <boxGeometry args={[12.5, 0.012, 0.012]} />
        <meshToonMaterial color="#8B6543" gradientMap={toonGradient} />
      </mesh>
      {FLAG_X.map((fx, fi) => (
        <mesh key={fi} position={[fx, 2.67, sz]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.29, 0.37, 0.012]} />
          <meshToonMaterial
            color={PAPEL_COLORS[(si * FLAG_X.length + fi) % PAPEL_COLORS.length]}
            gradientMap={toonGradient}
          />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      ))}
    </group>
  )
}

function PhotoFrame({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh>
        <boxGeometry args={[0.60, 0.78, 0.05]} />
        <meshToonMaterial color={C_FRAME} gradientMap={toonGradient} />
        <Outlines thickness={0.018} color="black" />
      </mesh>
      <mesh position={[0, 0, 0.028]}>
        <boxGeometry args={[0.50, 0.68, 0.01]} />
        <meshToonMaterial color="#E8E0D0" gradientMap={toonGradient} />
      </mesh>
      <mesh position={[0, 0, 0.034]}>
        <boxGeometry args={[0.40, 0.56, 0.01]} />
        <meshToonMaterial color={C_PHOTO} gradientMap={toonGradient} />
      </mesh>
    </group>
  )
}

// ─── Scene ────────────────────────────────────────────────────────────────────
export function SalonRoom() {
  return (
    <group>
      {/* ─── Éclairage ──────────────────────────────────────────────────────── */}
      <ambientLight intensity={0.12} color="#f5c87a" />
      <pointLight position={[0, 3.0, 0]} intensity={2.2} color="#f0d890" distance={14} decay={2} />
      <directionalLight intensity={0.65} color="#f5c87a" position={[-6, 2, 0]} />
      <pointLight position={[6.3, 1.8, 3]} intensity={0.4} color="#8ab4f8" distance={3} decay={2} />
      {/* pointLight buffet supprimée : chaque AnimatedCandle a sa propre pointLight locale */}
      <pointLight position={[-5.5, 2, 2.5]} intensity={0.5} color="#C8E8FF" distance={5} decay={2} />
      <pointLight position={[-5.5, 2, -1.5]} intensity={0.4} color="#C8E8FF" distance={4} decay={2} />

      {/* ─── Sol carrelage ──────────────────────────────────────────────────── */}
      {/* meshBasicMaterial + map : texture multipliée par color (white = neutre → couleurs exactes du canvas) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshBasicMaterial map={tileTexture} />
      </mesh>

      {/* ─── Tapis ──────────────────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.5, 0.006, 0]}>
        <planeGeometry args={[9.2, 3.4]} />
        <meshBasicMaterial color="#5A0808" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.5, 0.014, 0]}>
        <planeGeometry args={[8.6, 2.8]} />
        <meshBasicMaterial color="#8B1A1A" />
      </mesh>

      {/* ─── Plafond ────────────────────────────────────────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshBasicMaterial color={C_CEIL} />
      </mesh>

      {/* ─── Mur Nord z=5 (avec porte) ──────────────────────────────────────── */}
      <mesh position={[-3.775, 1.6, 5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[6.45, 3.2]} />
        <meshBasicMaterial color={C_WALL} />
      </mesh>
      <mesh position={[3.775, 1.6, 5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[6.45, 3.2]} />
        <meshBasicMaterial color={C_WALL} />
      </mesh>
      <mesh position={[0, 2.7, 5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.1, 1.0]} />
        <meshBasicMaterial color={C_WALL} />
      </mesh>

      {/* ─── Porte ──────────────────────────────────────────────────────────── */}
      <mesh position={[0, 1.1, 4.96]}>
        <boxGeometry args={[0.96, 2.18, 0.07]} />
        <meshToonMaterial color="#5C3318" gradientMap={toonGradient} />
        <Outlines thickness={0.022} color="black" />
      </mesh>
      <mesh position={[0, 1.68, 4.915]}>
        <boxGeometry args={[0.74, 0.70, 0.02]} />
        <meshToonMaterial color="#4A2810" gradientMap={toonGradient} />
      </mesh>
      <mesh position={[0, 0.55, 4.915]}>
        <boxGeometry args={[0.74, 0.74, 0.02]} />
        <meshToonMaterial color="#4A2810" gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-0.54, 1.1, 4.96]}>
        <boxGeometry args={[0.07, 2.30, 0.1]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[0.54, 1.1, 4.96]}>
        <boxGeometry args={[0.07, 2.30, 0.1]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[0, 2.24, 4.96]}>
        <boxGeometry args={[1.12, 0.08, 0.1]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[0, 0.02, 4.96]}>
        <boxGeometry args={[1.12, 0.04, 0.1]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[0.38, 1.05, 4.90]}>
        <sphereGeometry args={[0.038, 8, 8]} />
        <meshToonMaterial color={C_GOLD} gradientMap={toonGradient} />
      </mesh>

      {/* ─── Mur Sud z=-5 ───────────────────────────────────────────────────── */}
      <mesh position={[0, 1.6, -5]}>
        <planeGeometry args={[14, 3.2]} />
        <meshBasicMaterial color={C_WALL} />
      </mesh>

      {/* ─── Mur Est x=7 ────────────────────────────────────────────────────── */}
      <mesh position={[7, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 3.2]} />
        <meshBasicMaterial color={C_WALL_SIDE} />
      </mesh>

      {/* ─── Mur Ouest x=-7 ─────────────────────────────────────────────────── */}
      <mesh position={[-7, 1.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 3.2]} />
        <meshBasicMaterial color={C_WALL_SIDE} />
      </mesh>

      {/* ─── Fenêtres ───────────────────────────────────────────────────────── */}
      {WINDOW_Z.map((wz, wi) => (
        <group key={wi}>
          <mesh position={[-6.97, 1.75, wz]}>
            <boxGeometry args={[0.02, 1.22, 1.22]} />
            <meshToonMaterial color="#C8E8FF" gradientMap={toonGradient} emissive="#8ACAF0" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[-6.92, 1.75, wz + 0.66]}>
            <boxGeometry args={[0.1, 1.40, 0.09]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[-6.92, 1.75, wz - 0.66]}>
            <boxGeometry args={[0.1, 1.40, 0.09]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[-6.92, 2.44, wz]}>
            <boxGeometry args={[0.1, 0.1, 1.44]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[-6.90, 1.06, wz]}>
            <boxGeometry args={[0.14, 0.09, 1.50]} />
            <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          </mesh>
          {/* Croisillon vertical */}
          <mesh position={[-6.93, 1.75, wz]}>
            <boxGeometry args={[0.07, 1.24, 0.045]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
          {/* Croisillon horizontal — x décalé pour éviter z-fighting à l'intersection */}
          <mesh position={[-6.91, 1.75, wz]}>
            <boxGeometry args={[0.03, 0.045, 1.24]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
          {/* Rejas — barreaux */}
          {REJA_DZ.map((dz, ri) => (
            <mesh key={ri} position={[-6.91, 1.75, wz + dz]}>
              <cylinderGeometry args={[0.022, 0.022, 1.06, 6]} />
              <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            </mesh>
          ))}
          {/* Barre horizontale rejas — x décalé pour éviter z-fighting avec les cylindres */}
          <mesh position={[-6.89, 1.75, wz]}>
            <boxGeometry args={[0.02, 0.035, 1.1]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}

      {/* ─── Papel picado ───────────────────────────────────────────────────── */}
      {PAPEL_Z.map((sz, si) => <PapelStrand key={si} sz={sz} si={si} />)}

      {/* ─── Table centrale ─────────────────────────────────────────────────── */}
      <mesh position={[-0.5, 0.76, 0]}>
        <boxGeometry args={[8.5, 0.08, 2.3]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
        <Outlines thickness={0.025} color="black" />
      </mesh>
      {/* Ceinture longue nord */}
      <mesh position={[-0.5, 0.66, 0.98]}>
        <boxGeometry args={[8.1, 0.14, 0.06]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      {/* Ceinture longue sud */}
      <mesh position={[-0.5, 0.66, -0.98]}>
        <boxGeometry args={[8.1, 0.14, 0.06]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-4.2, 0.66, 0]}>
        <boxGeometry args={[0.06, 0.14, 2.0]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[3.2, 0.66, 0]}>
        <boxGeometry args={[0.06, 0.14, 2.0]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      {/* 6 pieds */}
      {TABLE_LEG_X.flatMap(lx =>
        TABLE_LEG_Z.map((lz, j) => (
          <mesh key={`${lx}-${j}`} position={[lx, 0.30, lz]}>
            <cylinderGeometry args={[0.055, 0.065, 0.60, 8]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            <Outlines thickness={0.018} color="black" />
          </mesh>
        ))
      )}

      {/* ─── Table dressée ──────────────────────────────────────────────────── */}
      {/* Nappe : planeGeometry légèrement plus grande que la table (déborde de 0.1m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.5, 0.805, 0]}>
        <planeGeometry args={[8.7, 2.42]} />
        <meshBasicMaterial color="#F5F0E8" />
      </mesh>
      {/* Tombées nord + sud — fins boxes qui pendent */}
      <mesh position={[-0.5, 0.755, 1.22]}>
        <boxGeometry args={[8.7, 0.10, 0.012]} />
        <meshBasicMaterial color="#F5F0E8" />
      </mesh>
      <mesh position={[-0.5, 0.755, -1.22]}>
        <boxGeometry args={[8.7, 0.10, 0.012]} />
        <meshBasicMaterial color="#F5F0E8" />
      </mesh>
      {/* Assiettes + verres — une assiette + un verre par convive */}
      {PLATE_X.flatMap((px, pi) => PLATE_Z.map((pz, zi) => (
        <group key={`p-${pi}-${zi}`} position={[px, 0.814, pz]}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.18, 0.014, 12]} />
            <meshToonMaterial color="#F8F4EE" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          {/* Fond surélevé de l'assiette */}
          <mesh position={[0, 0.008, 0]}>
            <cylinderGeometry args={[0.13, 0.16, 0.008, 12]} />
            <meshToonMaterial color="#EEEBE4" gradientMap={toonGradient} />
          </mesh>
          {/* Verre : cylinder transparent-bleuté avec emissive */}
          <mesh position={[0.28, 0.065, 0]}>
            <cylinderGeometry args={[0.044, 0.036, 0.13, 8]} />
            <meshToonMaterial color="#C8E0F0" gradientMap={toonGradient} emissive="#A0C0E0" emissiveIntensity={0.2} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        </group>
      )))}
      {/* Assiettes bouts de table — end chairs ouest (x=-5.0) et est (x=4.2) */}
      {([ [-4.6, 0.4], [-4.6, -0.4], [3.8, 0.4], [3.8, -0.4] ] as [number, number][]).map(([px, pz], i) => (
        <group key={`end-plate-${i}`} position={[px, 0.814, pz]}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.18, 0.014, 12]} />
            <meshToonMaterial color="#F8F4EE" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[0, 0.008, 0]}>
            <cylinderGeometry args={[0.13, 0.16, 0.008, 12]} />
            <meshToonMaterial color="#EEEBE4" gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 0.065, 0.28]}>
            <cylinderGeometry args={[0.044, 0.036, 0.13, 8]} />
            <meshToonMaterial color="#C8E0F0" gradientMap={toonGradient} emissive="#A0C0E0" emissiveIntensity={0.2} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        </group>
      ))}

      {/* Plats de service centraux */}
      <mesh position={[-0.5, 0.816, 0]}>
        <cylinderGeometry args={[0.30, 0.30, 0.020, 12]} />
        <meshToonMaterial color="#E8D4B4" gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      <mesh position={[-2.5, 0.816, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.018, 10]} />
        <meshToonMaterial color="#D4B890" gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>
      <mesh position={[1.5, 0.816, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.018, 10]} />
        <meshToonMaterial color="#D4B890" gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>

      {/* ─── 20 chaises ─────────────────────────────────────────────────────── */}
      {CHAIRS.map((c, i) => <Chair key={i} pos={c.pos} rot={c.rot} />)}

      {/* ─── Bougies table ──────────────────────────────────────────────────── */}
      {CANDLES_TABLE.map((pos, i) => <AnimatedCandle key={i} position={pos} />)}

      {/* ─── Canapé 3 places ────────────────────────────────────────────────── */}
      <mesh position={[5, 0.2, 2.5]}>
        <boxGeometry args={[2.85, 0.4, 0.95]} />
        <meshToonMaterial color="#1E1008" gradientMap={toonGradient} />
        <Outlines thickness={0.022} color="black" />
      </mesh>
      {/* 3 coussins d'assise — RoundedBox */}
      {([-0.92, 0, 0.92] as number[]).map((dx, i) => (
        <RoundedBox key={i} args={[0.83, 0.30, 0.82]} radius={0.04} smoothness={3}
          position={[5 + dx, 0.55, 2.52]}>
          <meshToonMaterial color={C_UPHOLSTERY} gradientMap={toonGradient} />
          <Outlines thickness={0.022} color="black" />
        </RoundedBox>
      ))}
      {/* Dossier structure */}
      <mesh position={[5, 0.90, 2.08]}>
        <boxGeometry args={[2.85, 0.70, 0.14]} />
        <meshToonMaterial color="#1E1008" gradientMap={toonGradient} />
        <Outlines thickness={0.022} color="black" />
      </mesh>
      {/* 3 coussins dossier — RoundedBox */}
      {([-0.92, 0, 0.92] as number[]).map((dx, i) => (
        <RoundedBox key={i} args={[0.81, 0.58, 0.12]} radius={0.03} smoothness={3}
          position={[5 + dx, 0.90, 2.15]}>
          <meshToonMaterial color={C_UPHOLSTERY} gradientMap={toonGradient} />
          <Outlines thickness={0.020} color="black" />
        </RoundedBox>
      ))}
      {/* Accoudoir gauche */}
      <mesh position={[3.58, 0.62, 2.5]}>
        <boxGeometry args={[0.17, 0.54, 0.95]} />
        <meshToonMaterial color="#1E1008" gradientMap={toonGradient} />
        <Outlines thickness={0.018} color="black" />
      </mesh>
      <mesh position={[3.58, 0.90, 2.5]}>
        <boxGeometry args={[0.20, 0.08, 1.02]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        <Outlines thickness={0.016} color="black" />
      </mesh>
      {/* Accoudoir droit */}
      <mesh position={[6.42, 0.62, 2.5]}>
        <boxGeometry args={[0.17, 0.54, 0.95]} />
        <meshToonMaterial color="#1E1008" gradientMap={toonGradient} />
        <Outlines thickness={0.018} color="black" />
      </mesh>
      <mesh position={[6.42, 0.90, 2.5]}>
        <boxGeometry args={[0.20, 0.08, 1.02]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        <Outlines thickness={0.016} color="black" />
      </mesh>
      {/* 4 pieds canapé */}
      {([3.68, 6.32] as number[]).flatMap(px =>
        ([2.08, 2.92] as number[]).map((pz, j) => (
          <mesh key={`${px}-${j}`} position={[px, 0.10, pz]}>
            <cylinderGeometry args={[0.038, 0.044, 0.20, 6]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
        ))
      )}

      {/* ─── Repose-pied ────────────────────────────────────────────────────── */}
      <mesh position={[5, 0.14, 3.52]}>
        <boxGeometry args={[1.55, 0.28, 0.52]} />
        <meshToonMaterial color="#1E1008" gradientMap={toonGradient} />
        <Outlines thickness={0.018} color="black" />
      </mesh>
      <RoundedBox args={[1.42, 0.12, 0.40]} radius={0.025} smoothness={3} position={[5, 0.30, 3.52]}>
        <meshToonMaterial color={C_UPHOLSTERY} gradientMap={toonGradient} />
        <Outlines thickness={0.016} color="black" />
      </RoundedBox>
      {([4.32, 5.68] as number[]).flatMap(px =>
        ([3.30, 3.74] as number[]).map((pz, j) => (
          <mesh key={`${px}-${j}`} position={[px, 0.07, pz]}>
            <cylinderGeometry args={[0.028, 0.030, 0.14, 6]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
        ))
      )}

      {/* ─── Fauteuil ───────────────────────────────────────────────────────── */}
      <mesh position={[3, 0.19, 4.15]}>
        <boxGeometry args={[0.90, 0.38, 0.92]} />
        <meshToonMaterial color="#1E1008" gradientMap={toonGradient} />
        <Outlines thickness={0.020} color="black" />
      </mesh>
      <RoundedBox args={[0.76, 0.22, 0.76]} radius={0.035} smoothness={3} position={[3, 0.49, 4.16]}>
        <meshToonMaterial color={C_UPHOLSTERY} gradientMap={toonGradient} />
        <Outlines thickness={0.020} color="black" />
      </RoundedBox>
      <mesh position={[3, 0.80, 3.74]}>
        <boxGeometry args={[0.90, 0.72, 0.13]} />
        <meshToonMaterial color="#1E1008" gradientMap={toonGradient} />
        <Outlines thickness={0.020} color="black" />
      </mesh>
      <RoundedBox args={[0.74, 0.58, 0.12]} radius={0.025} smoothness={3} position={[3, 0.80, 3.80]}>
        <meshToonMaterial color={C_UPHOLSTERY} gradientMap={toonGradient} />
        <Outlines thickness={0.018} color="black" />
      </RoundedBox>
      <mesh position={[2.57, 0.56, 4.1]}>
        <boxGeometry args={[0.15, 0.44, 0.92]} />
        <meshToonMaterial color="#1E1008" gradientMap={toonGradient} />
        <Outlines thickness={0.016} color="black" />
      </mesh>
      <mesh position={[2.57, 0.80, 4.1]}>
        <boxGeometry args={[0.18, 0.07, 0.98]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        <Outlines thickness={0.014} color="black" />
      </mesh>
      <mesh position={[3.43, 0.56, 4.1]}>
        <boxGeometry args={[0.15, 0.44, 0.92]} />
        <meshToonMaterial color="#1E1008" gradientMap={toonGradient} />
        <Outlines thickness={0.016} color="black" />
      </mesh>
      <mesh position={[3.43, 0.80, 4.1]}>
        <boxGeometry args={[0.18, 0.07, 0.98]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        <Outlines thickness={0.014} color="black" />
      </mesh>
      {([2.63, 3.37] as number[]).flatMap(px =>
        ([3.72, 4.58] as number[]).map((pz, j) => (
          <mesh key={`${px}-${j}`} position={[px, 0.09, pz]}>
            <cylinderGeometry args={[0.032, 0.038, 0.18, 6]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
        ))
      )}

      {/* ─── Meuble TV + Télé ───────────────────────────────────────────────── */}
      <mesh position={[6.68, 0.24, 2.5]}>
        <boxGeometry args={[0.24, 0.48, 2.0]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        <Outlines thickness={0.018} color="black" />
      </mesh>
      <mesh position={[6.67, 0.50, 2.5]}>
        <boxGeometry args={[0.28, 0.04, 2.1]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
      </mesh>
      {([1.55, 3.45] as number[]).map((pz, i) => (
        <mesh key={i} position={[6.68, 0.05, pz]}>
          <boxGeometry args={[0.22, 0.10, 0.06]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
      ))}
      <mesh position={[6.80, 1.70, 2.5]}>
        <boxGeometry args={[0.06, 0.90, 1.62]} />
        <meshToonMaterial color="#1a1a1a" gradientMap={toonGradient} />
        <Outlines thickness={0.018} color="black" />
      </mesh>
      <mesh position={[6.77, 1.70, 2.5]}>
        <boxGeometry args={[0.02, 0.78, 1.46]} />
        <meshToonMaterial color="#2a3850" gradientMap={toonGradient} emissive="#3a4a6a" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[6.84, 1.70, 2.5]}>
        <boxGeometry args={[0.06, 0.30, 0.06]} />
        <meshToonMaterial color="#1a1a1a" gradientMap={toonGradient} />
      </mesh>

      {/* ─── Buffet ─────────────────────────────────────────────────────────── */}
      <mesh position={[-6.30, 0.54, -2.5]}>
        <boxGeometry args={[0.52, 1.00, 2.10]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
        <Outlines thickness={0.022} color="black" />
      </mesh>
      <mesh position={[-6.27, 1.07, -2.5]}>
        <boxGeometry args={[0.56, 0.06, 2.20]} />
        <meshToonMaterial color={C_WOOD_LIGHT} gradientMap={toonGradient} />
        <Outlines thickness={0.016} color="black" />
      </mesh>
      <mesh position={[-6.03, 0.52, -1.8]}>
        <boxGeometry args={[0.02, 0.82, 0.88]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-6.03, 0.52, -3.2]}>
        <boxGeometry args={[0.02, 0.82, 0.88]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-6.04, 0.52, -2.5]}>
        <boxGeometry args={[0.02, 0.84, 0.04]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-6.02, 0.52, -2.18]}>
        <sphereGeometry args={[0.030, 7, 7]} />
        <meshToonMaterial color={C_GOLD} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-6.02, 0.52, -2.82]}>
        <sphereGeometry args={[0.030, 7, 7]} />
        <meshToonMaterial color={C_GOLD} gradientMap={toonGradient} />
      </mesh>
      {([-6.27, -6.27] as number[]).flatMap((px, pi) =>
        ([-1.52, -3.48] as number[]).map((pz, j) => (
          <mesh key={`${pi}-${j}`} position={[px, 0.06, pz]}>
            <cylinderGeometry args={[0.04, 0.04, 0.12, 6]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
        ))
      )}

      {/* ─── Bougies buffet ─────────────────────────────────────────────────── */}
      {CANDLES_BUFFET.map((pos, i) => <AnimatedCandle key={i} position={pos} />)}

      {/* ─── Cadres photos ──────────────────────────────────────────────────── */}
      {FRAMES_SOUTH.map((pos, i) => <PhotoFrame key={i} position={pos} />)}
      {FRAMES_EAST.map((pos, i) => (
        <PhotoFrame key={i} position={pos} rotY={-Math.PI / 2} />
      ))}

      {/* ─── Cactus ─────────────────────────────────────────────────────────── */}
      <group position={[-6.1, 0, 3.9]}>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.21, 0.16, 0.44, 9]} />
          <meshToonMaterial color={C_POT} gradientMap={toonGradient} />
          <Outlines thickness={0.020} color="black" />
        </mesh>
        <mesh position={[0, 0.445, 0]}>
          <cylinderGeometry args={[0.24, 0.21, 0.05, 9]} />
          <meshToonMaterial color="#B06830" gradientMap={toonGradient} />
        </mesh>
        <mesh position={[0, 0.47, 0]}>
          <cylinderGeometry args={[0.20, 0.20, 0.04, 9]} />
          <meshToonMaterial color="#3A2010" gradientMap={toonGradient} />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[0.11, 0.14, 1.15, 9]} />
          <meshToonMaterial color={C_CACTUS} gradientMap={toonGradient} />
          <Outlines thickness={0.022} color="black" />
        </mesh>
        <mesh position={[-0.22, 0.82, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.09, 0.36, 8]} />
          <meshToonMaterial color={C_CACTUS} gradientMap={toonGradient} />
          <Outlines thickness={0.018} color="black" />
        </mesh>
        <mesh position={[-0.40, 0.99, 0]}>
          <cylinderGeometry args={[0.065, 0.075, 0.30, 8]} />
          <meshToonMaterial color={C_CACTUS} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0.21, 0.70, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.065, 0.08, 0.30, 8]} />
          <meshToonMaterial color={C_CACTUS} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0.36, 0.84, 0]}>
          <cylinderGeometry args={[0.055, 0.065, 0.26, 8]} />
          <meshToonMaterial color={C_CACTUS} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
      </group>

      {/* ─── Plinthes (bois sombre) ──────────────────────────────────────────── */}
      {/* x/z légèrement décalés par rapport aux plans de murs pour éviter z-fighting */}
      <mesh position={[0, 0.06, 4.952]}>
        <boxGeometry args={[14, 0.12, 0.055]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      <mesh position={[0, 0.06, -4.952]}>
        <boxGeometry args={[14, 0.12, 0.055]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      <mesh position={[6.952, 0.06, 0]}>
        <boxGeometry args={[0.055, 0.12, 10]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      <mesh position={[-6.952, 0.06, 0]}>
        <boxGeometry args={[0.055, 0.12, 10]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>

      {/* ─── Corniche (plâtre clair) ─────────────────────────────────────────── */}
      <mesh position={[0, 3.16, 4.952]}>
        <boxGeometry args={[14, 0.07, 0.06]} />
        <meshBasicMaterial color="#E8D8C4" />
      </mesh>
      <mesh position={[0, 3.16, -4.952]}>
        <boxGeometry args={[14, 0.07, 0.06]} />
        <meshBasicMaterial color="#E8D8C4" />
      </mesh>
      <mesh position={[6.952, 3.16, 0]}>
        <boxGeometry args={[0.06, 0.07, 10]} />
        <meshBasicMaterial color="#D8C8B0" />
      </mesh>
      <mesh position={[-6.952, 3.16, 0]}>
        <boxGeometry args={[0.06, 0.07, 10]} />
        <meshBasicMaterial color="#D8C8B0" />
      </mesh>
    </group>
  )
}
