// src/scene/salon/SalonRoom.tsx
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Outlines, RoundedBox } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { papelTextures } from '../shared/papelTexture'
import {
  murAdobeNorth, murAdobeLintel, murAdobeSouth, murAdobeSide,
  solTomettes, nappeBrodee, boisSombre,
} from '../shared/paintedTextures'
import { Prop } from '../shared/Prop'


// ─── Couleurs ────────────────────────────────────────────────────────────────
const C_WOOD_DARK  = '#3A2008'
const C_WOOD_MED   = '#5C3010'
const C_WOOD_LIGHT = '#7A4820'
const C_CUSHION    = '#6B3520'
const C_UPHOLSTERY = '#4A2E1A'
const C_CEIL       = '#F0E0C8'
const C_IRON       = '#2A3530'
const C_GOLD       = '#C8A040'
const C_FRAME      = '#2A1A08'
const C_PHOTO      = '#4A4858'
const C_CACTUS     = '#2D7A2D'
const C_POT        = '#C47A3A'
const C_CANDLE     = '#F5E8D0'
const C_FLAME      = '#FF7700'
const C_LEAF       = '#3E7C3A'
const C_CERAMIC    = '#E8E0D0'

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

// ─── Composants ───────────────────────────────────────────────────────────────

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

// Papel picado — guirlande en caténaire, drapeaux perforés (alphaMap) suspendus
// à la ficelle, chacun pivotant à son attache avec une phase propre (vent doux).
const FLAG_W = 0.30
const FLAG_H = 0.38
const STRAND_X0 = -6.2
const STRAND_X1 = 6.2
const STRAND_Y = 2.92
const STRAND_SAG = 0.30

function strandY(x: number): number {
  const t = (x - STRAND_X0) / (STRAND_X1 - STRAND_X0)
  return STRAND_Y - STRAND_SAG * 4 * t * (1 - t)
}

// Drapeau individuel : ondulation par vertex (papier souple, pas de vent —
// intérieur), amplitude nulle à l'attache, maximale en bas. L'ourlet plié
// par-dessus la ficelle montre comment le drapeau est attaché.
function PapelFlag({ x, y, color, tex, phase }: {
  x: number; y: number; color: string; tex: THREE.Texture; phase: number
}) {
  const geo = useMemo(() => new THREE.PlaneGeometry(FLAG_W, FLAG_H, 6, 8), [])
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo])
  const t = useRef(phase)

  useFrame((_, delta) => {
    t.current += delta
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3]
      const by = base[i * 3 + 1]
      const hang = (FLAG_H / 2 - by) / FLAG_H  // 0 à l'attache, 1 en bas
      pos.setZ(i, Math.sin(t.current * 1.1 + bx * 5 + by * 3) * 0.022 * hang)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
  })

  return (
    <group position={[x, y, 0]}>
      {/* Ourlet : bande du même papier pliée par-dessus la ficelle */}
      <mesh position={[0, 0.002, 0]}>
        <boxGeometry args={[FLAG_W, 0.030, 0.026]} />
        <meshToonMaterial color={color} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[0, -FLAG_H / 2 + 0.012, 0]} geometry={geo}>
        <meshToonMaterial
          color={color}
          gradientMap={toonGradient}
          alphaMap={tex}
          alphaTest={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function PapelStrand({ sz, si }: { sz: number; si: number }) {
  const stringGeo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 24; i++) {
      const x = STRAND_X0 + (i / 24) * (STRAND_X1 - STRAND_X0)
      pts.push(new THREE.Vector3(x, strandY(x), 0))
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.0035, 5, false)
  }, [])

  return (
    <group position={[0, 0, sz]}>
      <mesh geometry={stringGeo}>
        <meshToonMaterial color="#7A5A3A" gradientMap={toonGradient} />
      </mesh>
      {FLAG_X.map((fx, fi) => (
        <PapelFlag
          key={fi}
          x={fx}
          y={strandY(fx)}
          color={PAPEL_COLORS[(si * FLAG_X.length + fi) % PAPEL_COLORS.length]}
          tex={papelTextures[(si + fi) % papelTextures.length]}
          phase={si * 2.1 + fi * 0.9}
        />
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
      {/* Intensités relevées (0.10/0.35 → 0.30/0.60) : murs et sol sont passés
          de meshBasicMaterial (non éclairés) à meshToonMaterial — sans ce
          rattrapage la pièce entière tombe dans la bande d'ombre. */}
      <ambientLight intensity={0.30} color="#f5c87a" />
      {/* Ombres teintées : remplissage bicolore — chaud ambré par le haut,
          rebond terracotta par le sol. Les zones à l'ombre prennent ces teintes
          au lieu de virer au gris (palier 2, visual-refs.md). */}
      <hemisphereLight intensity={0.60} color="#f5c87a" groundColor="#8a4a2a" />
      <pointLight position={[-0.5, 2.35, 0]} intensity={2.2} color="#f0d890" distance={14} decay={2} />
      <directionalLight intensity={0.65} color="#f5c87a" position={[-6, 2, 0]} />
      <pointLight position={[5.9, 1.8, 3.95]} intensity={0.4} color="#8ab4f8" distance={3} decay={2} />
      {/* pointLight buffet supprimée : chaque AnimatedCandle a sa propre pointLight locale */}
      <pointLight position={[-5.5, 2, 2.5]} intensity={0.5} color="#C8E8FF" distance={5} decay={2} />
      <pointLight position={[-5.5, 2, -1.5]} intensity={0.4} color="#C8E8FF" distance={4} decay={2} />

      {/* ─── Sol tomettes (texture peinte, palier 3) ─────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshToonMaterial map={solTomettes} gradientMap={toonGradient} />
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
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[3.775, 1.6, 5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[6.45, 3.2]} />
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[0, 2.7, 5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.1, 1.0]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
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
        <meshToonMaterial map={murAdobeSouth} gradientMap={toonGradient} />
      </mesh>

      {/* ─── Mur Est x=7 ────────────────────────────────────────────────────── */}
      <mesh position={[7, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 3.2]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>

      {/* ─── Mur Ouest x=-7 ─────────────────────────────────────────────────── */}
      <mesh position={[-7, 1.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 3.2]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
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
        <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
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
      {/* Nappe : planeGeometry légèrement plus grande que la table (déborde de 0.1m).
          Texture brodée en 2 copies miroir sur la longueur = deux nappes jointes au centre. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.5, 0.805, 0]}>
        <planeGeometry args={[8.7, 2.42]} />
        <meshToonMaterial map={nappeBrodee} gradientMap={toonGradient} />
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

      {/* ─── 20 chaises (pipeline image-to-3D, ladder-back ref salon-vue-entree-01) ── */}
      {CHAIRS.map((c, i) => (
        <Prop
          key={i}
          url="/models/props/chaise.glb"
          color={C_WOOD_DARK}
          position={c.pos}
          rotationY={c.rot}
          targetHeight={1.05}
        />
      ))}

      {/* ─── Bougies table ──────────────────────────────────────────────────── */}
      {CANDLES_TABLE.map((pos, i) => <AnimatedCandle key={i} position={pos} />)}

      {/* ─── Canapé 3 places — dimensions réelles (assise ~0.44m) ──────────── */}
      <mesh position={[5, 0.13, 2.5]}>
        <boxGeometry args={[2.85, 0.26, 0.95]} />
        <meshToonMaterial color="#1E1008" gradientMap={toonGradient} />
        <Outlines thickness={0.022} color="black" />
      </mesh>
      {/* 3 coussins d'assise — RoundedBox */}
      {([-0.92, 0, 0.92] as number[]).map((dx, i) => (
        <RoundedBox key={i} args={[0.83, 0.18, 0.82]} radius={0.04} smoothness={3}
          position={[5 + dx, 0.35, 2.52]}>
          <meshToonMaterial color={C_UPHOLSTERY} gradientMap={toonGradient} />
          <Outlines thickness={0.022} color="black" />
        </RoundedBox>
      ))}
      {/* Dossier structure */}
      <mesh position={[5, 0.70, 2.08]}>
        <boxGeometry args={[2.85, 0.50, 0.14]} />
        <meshToonMaterial color="#1E1008" gradientMap={toonGradient} />
        <Outlines thickness={0.022} color="black" />
      </mesh>
      {/* 3 coussins dossier — RoundedBox */}
      {([-0.92, 0, 0.92] as number[]).map((dx, i) => (
        <RoundedBox key={i} args={[0.81, 0.45, 0.12]} radius={0.03} smoothness={3}
          position={[5 + dx, 0.70, 2.15]}>
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

      {/* ─── Repose-pied (reculé : place pour les pieds du grand-oncle) ─────── */}
      <mesh position={[5, 0.14, 3.85]}>
        <boxGeometry args={[1.55, 0.28, 0.52]} />
        <meshToonMaterial color="#1E1008" gradientMap={toonGradient} />
        <Outlines thickness={0.018} color="black" />
      </mesh>
      <RoundedBox args={[1.42, 0.12, 0.40]} radius={0.025} smoothness={3} position={[5, 0.30, 3.85]}>
        <meshToonMaterial color={C_UPHOLSTERY} gradientMap={toonGradient} />
        <Outlines thickness={0.016} color="black" />
      </RoundedBox>
      {([4.32, 5.68] as number[]).flatMap(px =>
        ([3.63, 4.07] as number[]).map((pz, j) => (
          <mesh key={`${px}-${j}`} position={[px, 0.07, pz]}>
            <cylinderGeometry args={[0.028, 0.030, 0.14, 6]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
        ))
      )}

      {/* ─── Fauteuil (pipeline image-to-3D) ────────────────────────────────── */}
      <Prop
        url="/models/props/fauteuil.glb"
        color={C_UPHOLSTERY}
        position={[3, 0, 4.1]}
        rotationY={0}
        targetHeight={0.95}
      />

      {/* ─── Télé CRT 90s + meuble (pipeline image-to-3D) ───────────────────── */}
      {/* Coin nord-est, en diagonale face au canapé (spec : canapé face à la télé) */}
      <Prop
        url="/models/props/tv.glb"
        color="#3a3a3e"
        position={[6.25, 0, 4.3]}
        rotationY={-3 * Math.PI / 4}
        targetHeight={1.25}
      />
      {/* Lueur d'écran conservée (la couche lumière ne vient pas du mesh) */}
      <mesh position={[6.11, 0.95, 4.16]} rotation={[0, -3 * Math.PI / 4, 0]}>
        <planeGeometry args={[0.55, 0.42]} />
        <meshBasicMaterial color="#3a4a6a" />
      </mesh>

      {/* ─── Buffet (pipeline image-to-3D, tirage 2) ────────────────────────── */}
      <Prop
        url="/models/props/buffet.glb"
        color={C_WOOD_MED}
        position={[-6.30, 0, -2.5]}
        rotationY={Math.PI / 2}
        targetHeight={1.05}
      />

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

      {/* ─── Lustre fer forgé (au-dessus de la table, ref salon-vue-entree-01) ── */}
      <group position={[-0.5, 0, 0]}>
        {/* Chaîne */}
        <mesh position={[0, 2.93, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.55, 6]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
        {/* Moyeu central */}
        <mesh position={[0, 2.60, 0]}>
          <cylinderGeometry args={[0.06, 0.09, 0.16, 8]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {/* Anneau */}
        <mesh position={[0, 2.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.025, 8, 24]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {/* 4 rayons + bougies sur l'anneau */}
        {[0, Math.PI / 2, Math.PI, 3 * Math.PI / 2].map((a, i) => (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.21, 2.52, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.42, 6]} />
              <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            </mesh>
            <mesh position={[0.42, 2.60, 0]}>
              <cylinderGeometry args={[0.035, 0.030, 0.13, 8]} />
              <meshToonMaterial color={C_CANDLE} gradientMap={toonGradient} />
              <Outlines thickness={0.012} color="black" />
            </mesh>
            <mesh position={[0.42, 2.70, 0]}>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshToonMaterial color={C_FLAME} emissive={C_FLAME} emissiveIntensity={1.4} gradientMap={toonGradient} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ─── Plats de service (centre de table, entre les bougies) ─────────── */}
      {/* Plat de tamales */}
      <group position={[-3.2, 0.84, 0]}>
        <mesh scale={[1.4, 1, 1]}>
          <cylinderGeometry args={[0.24, 0.28, 0.05, 12]} />
          <meshToonMaterial color={C_CERAMIC} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {([-0.20, 0, 0.20] as number[]).map((dx, i) => (
          <mesh key={i} position={[dx, 0.055, 0]} rotation={[0, (i - 1) * 0.25, 0]}>
            <boxGeometry args={[0.11, 0.06, 0.26]} />
            <meshToonMaterial color="#D9B98A" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
        ))}
      </group>
      {/* Marmite de mole */}
      <group position={[-0.6, 0.82, 0]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.19, 0.14, 0.14, 12]} />
          <meshToonMaterial color="#B05038" gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        <mesh position={[0, 0.125, 0]}>
          <cylinderGeometry args={[0.155, 0.155, 0.015, 12]} />
          <meshToonMaterial color="#4A2210" gradientMap={toonGradient} />
        </mesh>
      </group>
      {/* Corbeille d'oranges */}
      <group position={[2.0, 0.83, 0]}>
        <mesh>
          <cylinderGeometry args={[0.20, 0.15, 0.09, 10]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {([[-0.07, 0.07, 0.05], [0.08, 0.07, -0.04], [-0.02, 0.07, -0.08], [0.01, 0.13, 0.01]] as [number, number, number][]).map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.055, 9, 9]} />
            <meshToonMaterial color="#E67E22" gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
        ))}
      </group>

      {/* ─── Photos de famille posées sur le buffet ─────────────────────────── */}
      {([-1.95, -2.5, -3.05] as number[]).map((pz, i) => (
        <group key={i} position={[-6.28, 1.05, pz]} rotation={[-0.06, Math.PI / 2 + (i - 1) * 0.18, 0]}>
          <mesh position={[0, 0.14, 0]}>
            <boxGeometry args={[0.22, 0.28, 0.02]} />
            <meshToonMaterial color={C_FRAME} gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
          <mesh position={[0, 0.14, 0.012]}>
            <boxGeometry args={[0.17, 0.23, 0.008]} />
            <meshToonMaterial color={C_PHOTO} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}

      {/* ─── Plante feuillue (mur est, entre canapé et cadres) ──────────────── */}
      <group position={[6.5, 0, 1.2]}>
        <mesh position={[0, 0.20, 0]}>
          <cylinderGeometry args={[0.20, 0.15, 0.40, 9]} />
          <meshToonMaterial color={C_POT} gradientMap={toonGradient} />
          <Outlines thickness={0.018} color="black" />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.22, 0.20, 0.04, 9]} />
          <meshToonMaterial color="#B06830" gradientMap={toonGradient} />
        </mesh>
        {([[0, 0.85, 0, 0.26], [-0.18, 0.72, 0.08, 0.18], [0.16, 0.70, -0.10, 0.17], [0.02, 0.68, 0.17, 0.15]] as [number, number, number, number][]).map(([px, py, pz, r], i) => (
          <mesh key={i} position={[px, py, pz]} scale={[1, 1.25, 1]}>
            <sphereGeometry args={[r, 9, 9]} />
            <meshToonMaterial color={C_LEAF} gradientMap={toonGradient} />
            <Outlines thickness={0.016} color="black" />
          </mesh>
        ))}
      </group>

      {/* ─── Lampe à abat-jour (coin canapé, halo chaud de la ref) ──────────── */}
      <group position={[3.15, 0, 2.6]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.04, 10]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        <mesh position={[0, 0.60, 0]}>
          <cylinderGeometry args={[0.025, 0.032, 1.12, 8]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
        <mesh position={[0, 1.28, 0]}>
          <cylinderGeometry args={[0.14, 0.21, 0.28, 12, 1, true]} />
          <meshToonMaterial color="#E8C87A" emissive="#F0C060" emissiveIntensity={0.55} gradientMap={toonGradient} side={THREE.DoubleSide} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
      </group>
      <pointLight position={[3.15, 1.3, 2.6]} intensity={0.5} color="#F5C87A" distance={3.5} decay={2} />

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
