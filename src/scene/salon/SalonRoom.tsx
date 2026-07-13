// src/scene/salon/SalonRoom.tsx
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MeshReflectorMaterial, Outlines, RoundedBox } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import { papelTextures } from '../shared/papelTexture'
import {
  murAdobeNorth, murAdobeLintel, murAdobeSouth, murAdobeSide,
  solTomettes, solTomettesNormal, boisSombre,
  azulejosTalavera, murPierre,
} from '../shared/paintedTextures'
import { rideauTexture, plafondBoisTexture } from '../shared/fabricTexture'
import { WindowVista } from './WindowVista'
import { Prop } from '../shared/Prop'
import { Canape } from './Canape'
import { SALON_OBSTACLES } from './salonCollision'
import { NappeCloth } from './NappeCloth'

// Debug : ?aabb affiche les boîtes de collision (rouge translucide) et masque le plafond
const SHOW_AABB = new URLSearchParams(window.location.search).has('aabb')

// Intrados de l'arche cuisine : demi-cylindre vu par DESSOUS → normales et
// winding inversés, sinon la face est éclairée à l'envers (noire en toon).
const intradosGeometry = (() => {
  const g = new THREE.CylinderGeometry(0.9, 0.9, 0.35, 24, 1, true, Math.PI / 2, Math.PI)
  g.rotateX(Math.PI / 2)
  const normals = g.getAttribute('normal')
  for (let i = 0; i < normals.count; i++) {
    normals.setXYZ(i, -normals.getX(i), -normals.getY(i), -normals.getZ(i))
  }
  const index = g.getIndex()
  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i)
      index.setX(i, index.getX(i + 2))
      index.setX(i + 2, a)
    }
  }
  return g
})()


// ─── Couleurs ────────────────────────────────────────────────────────────────
const C_WOOD_DARK  = '#3A2008'
const C_WOOD_MED   = '#5C3010'
const C_WOOD_LIGHT = '#7A4820'
const C_CUSHION    = '#6B3520'
const C_UPHOLSTERY = '#4A2E1A'
const C_CEIL       = '#F0E0C8'
const C_IRON       = '#1A1512' // fer forgé quasi noir (l'ancien #2A3530 tirait au vert)
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
// Guirlandes perpendiculaires à la table (le long de Z), accrochées sous les
// vigas (x pairs) : cluster resserré côté entrée + une au fond (ref).
const PAPEL_X = [4, 2, 0, -4]
const FLAG_X  = [-4.9, -4.1, -3.3, -2.5, -1.7, -0.9, -0.1, 0.7, 1.5, 2.3, 3.1, 3.9, 4.7]

// ─── Chaises ─────────────────────────────────────────────────────────────────
type ChairCfg = { pos: [number, number, number]; rot: number }
// Table centre z=1.0. Nord z=2.60, sud z=-0.60 — passage ~1m entre chaises sud et canapé (front z≈-2.1).
// End chairs : West end face à +x → rot=+π/2. East end face à -x → rot=-π/2.
// Positions x sorties du range table [-4.75, 3.75].
const CHAIRS: ChairCfg[] = [
  { pos: [-3.05, 0, 2.60], rot: Math.PI },    // nord — face au sud (table)
  { pos: [-2.05, 0, 2.60], rot: Math.PI },
  { pos: [-1.05, 0, 2.60], rot: Math.PI },
  { pos: [-0.05, 0, 2.60], rot: Math.PI },
  { pos: [0.95,  0, 2.60], rot: Math.PI },
  { pos: [1.95,  0, 2.60], rot: Math.PI },
  { pos: [2.95,  0, 2.60], rot: Math.PI },
  { pos: [-3.05, 0, -0.60], rot: 0 },         // sud — face au nord (table)
  { pos: [-2.05, 0, -0.60], rot: 0 },
  { pos: [-1.05, 0, -0.60], rot: 0 },
  { pos: [-0.05, 0, -0.60], rot: 0 },
  { pos: [0.95,  0, -0.60], rot: 0 },
  { pos: [1.95,  0, -0.60], rot: 0 },
  { pos: [2.95,  0, -0.60], rot: 0 },
  { pos: [-4.55, 0,  0.60], rot:  Math.PI / 2 }, // ouest — face à +x (table)
  { pos: [-4.55, 0,  1.40], rot:  Math.PI / 2 },
  { pos: [ 4.65, 0,  0.60], rot: -Math.PI / 2 }, // est — face à -x (table)
  { pos: [ 4.65, 0,  1.40], rot: -Math.PI / 2 }, // chaise vide d'Emi
  { pos: [ 3.95, 0,  2.60], rot: Math.PI },        // nord +1 — chaise vide grande-tante (elle est au fauteuil)
  { pos: [ 3.95, 0, -0.60], rot: 0 },              // sud +1 — coin enfant complet
]

const TABLE_LEG_X = [-3.55, -0.05, 3.45]
const TABLE_LEG_Z = [0.25, 1.75]

// Cadres muraux (ref vue-entrée). Nord : autour de l'arche et au-dessus du
// buffet. Sud : au-dessus du coin salon. Est : de part et d'autre de la porte.
const FRAMES_NORTH: [number, number, number][] = [[-0.6, 1.9, 5.77], [1.4, 2.1, 5.77], [3.2, 2.15, 5.77]]
const FRAMES_SOUTH: [number, number, number][] = [[3.6, 2.1, -5.77], [4.8, 1.95, -5.77], [6.0, 2.15, -5.77]]
const FRAMES_EAST:  [number, number, number][] = [[6.97, 1.9, 2.0], [6.97, 1.9, -1.8]]
// Bougies sur le buffet (mur sud), de part et d'autre des photos
const CANDLES_BUFFET: [number, number, number][] = [[2.12, 1.13, 5.32], [4.38, 1.13, 5.32]]
const CANDLES_TABLE: [number, number, number][]  = [[-1.55, 0.78, 1.25], [1.25, 0.78, 0.75]]
// Grande fenêtre unique à rideaux, centrée mur ouest (ref salon-vue-entree-01)
const WINDOW_CZ = 0.5
const REJA_DZ   = [-1.32, -0.88, -0.44, 0, 0.44, 0.88, 1.32]
const PLATE_X   = [-3.05, -2.05, -1.05, -0.05, 0.95, 1.95, 2.95]
const PLATE_Z   = [1.80, 0.20]  // table centre z=1.0, assiettes à z=1.0±0.80

// ─── Composants ───────────────────────────────────────────────────────────────
// Écran CRT : lueur bleutée qui scintille (match/programme lointain).
// Plaqué sur la face est du tube (TV à (-6.33, -2.15) monde contre le mur
// ouest, écran vers l'est face au canapé).
function TVScreen() {
  const matRef = useRef<THREE.MeshToonMaterial>(null)
  const t = useRef(0)
  useFrame((_, delta) => {
    t.current += delta
    if (matRef.current) {
      const flicker =
        0.95 +
        0.25 * Math.sin(t.current * 9.3) * Math.sin(t.current * 2.7) +
        (Math.random() < 0.03 ? 0.35 : 0)
      matRef.current.emissiveIntensity = flicker
    }
  })
  return (
    <mesh position={[-6.01, 0.78, -4.81]} rotation={[0, Math.PI / 4, 0]}>
      <planeGeometry args={[0.44, 0.34]} />
      <meshToonMaterial
        ref={matRef}
        color="#5a7ab0"
        gradientMap={toonGradient}
        emissive="#7a9ad0"
        emissiveIntensity={0.55}
      />
    </mesh>
  )
}

function PlanteFeuillue({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
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

// Papel picado — guirlande en caténaire, drapeaux perforés (alphaMap) suspendus
// à la ficelle, chacun pivotant à son attache avec une phase propre (vent doux).
const FLAG_W = 0.30
const FLAG_H = 0.38
// La guirlande court le long de Z (local X du strand, groupe tourné de π/2),
// ancrée sous les vigas (bas de poutre à y=3.04).
const STRAND_X0 = -5.4
const STRAND_X1 = 5.4
const STRAND_Y = 3.02
const STRAND_SAG = 0.34

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

// sx : position X (sous une viga). Le groupe est tourné de π/2 : le X local
// de la guirlande devient le Z monde → elle traverse la pièce comme la ref.
function PapelStrand({ sx, si }: { sx: number; si: number }) {
  const stringGeo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 24; i++) {
      const x = STRAND_X0 + (i / 24) * (STRAND_X1 - STRAND_X0)
      pts.push(new THREE.Vector3(x, strandY(x), 0))
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.0035, 5, false)
  }, [])

  return (
    <group position={[sx, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <mesh geometry={stringGeo}>
        <meshToonMaterial color="#7A5A3A" gradientMap={toonGradient} />
      </mesh>
      {/* Attaches sur la poutre aux deux extrémités */}
      {[STRAND_X0, STRAND_X1].map(ax => (
        <mesh key={ax} position={[ax, 3.05, 0]}>
          <boxGeometry args={[0.03, 0.06, 0.03]} />
          <meshToonMaterial color="#7A5A3A" gradientMap={toonGradient} />
        </mesh>
      ))}
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

// Rideau plissé : plane subdivisé, plis sinusoïdaux figés dans la géométrie
// (amples en bas, froncés en haut) + ondulation lente par vertex — aérien,
// comme un voile près d'une fenêtre. Suspendu par anneaux à la tringle.
const RIDEAU_W = 0.95
const RIDEAU_H = 2.82
const RIDEAU_PLEATS = 5

function RideauPanel({ z }: { z: number }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(RIDEAU_W, RIDEAU_H, 28, 20)
    const pos = g.getAttribute('position')
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) / RIDEAU_W + 0.5      // 0..1 sur la largeur
      const v = pos.getY(i) / RIDEAU_H + 0.5      // 0 en bas, 1 en haut
      const depth = 0.028 + 0.05 * (1 - v)        // plis plus amples vers le bas
      pos.setZ(i, Math.sin(u * Math.PI * 2 * RIDEAU_PLEATS) * depth)
    }
    g.computeVertexNormals()
    return g
  }, [])
  const base = useMemo(() => Float32Array.from(geo.getAttribute('position').array), [geo])
  const t = useRef(z * 3.7) // phase propre à chaque panneau

  useFrame((_, delta) => {
    t.current += delta
    const pos = geo.getAttribute('position')
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3]
      const by = base[i * 3 + 1]
      const bz = base[i * 3 + 2]
      const hang = (RIDEAU_H / 2 - by) / RIDEAU_H // 0 à la tringle, 1 au sol
      pos.setZ(i, bz + Math.sin(t.current * 0.8 + bx * 4 + by * 1.5) * 0.028 * hang)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
  })

  return (
    <group position={[-6.80, 0, z]}>
      {/* Panneau (haut à 2.94, juste sous les anneaux) */}
      <mesh geometry={geo} position={[0, 2.94 - RIDEAU_H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshToonMaterial map={rideauTexture} gradientMap={toonGradient} side={THREE.DoubleSide} />
      </mesh>
      {/* Anneaux de suspension sur la tringle (un par crête de pli) */}
      {Array.from({ length: RIDEAU_PLEATS + 1 }, (_, i) => (
        <mesh key={i} position={[0, 2.98, -RIDEAU_W / 2 + (i / RIDEAU_PLEATS) * RIDEAU_W]}>
          <torusGeometry args={[0.036, 0.007, 6, 12]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
        </mesh>
      ))}
    </group>
  )
}

// Cadre d'un panneau coulissant : 2 montants + 2 traverses (section fine bois),
// posé dans sa gorge de rail. La vitre est partagée (plane réflecteur unique).
function SashFrame({ x, zMin, zMax }: { x: number; zMin: number; zMax: number }) {
  const zc = (zMin + zMax) / 2
  const w = zMax - zMin
  return (
    <group>
      {[zMin + 0.028, zMax - 0.028].map(mz => (
        <mesh key={mz} position={[x, 1.8, mz]}>
          <boxGeometry args={[0.05, 2.04, 0.056]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      ))}
      {[0.815, 2.785].map(my => (
        <mesh key={my} position={[x, my, zc]}>
          <boxGeometry args={[0.05, 0.055, w]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
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
      {/* Intensités relevées (0.10/0.35 → 0.30/0.60) : murs et sol sont passés
          de meshBasicMaterial (non éclairés) à meshToonMaterial — sans ce
          rattrapage la pièce entière tombe dans la bande d'ombre. */}
      {/* Refs : pièce SOMBRE, flaques de lumière chaude (lustre, bougies, lampe,
          TV, cuisine). L'ambiance générale est basse, le contraste fait le mood. */}
      <ambientLight intensity={0.13} color="#e8bd80" />
      {/* Ombres teintées : remplissage bicolore — chaud ambré par le haut,
          rebond terracotta par le sol. Les zones à l'ombre prennent ces teintes
          au lieu de virer au gris (palier 2, visual-refs.md). */}
      <hemisphereLight intensity={0.26} color="#e8bd80" groundColor="#7a4226" />
      {/* Sous le lustre (pas dedans : à bout portant l'anneau sature en gris) */}
      <pointLight position={[-0.05, 2.0, 0]} intensity={2.8} color="#f0d890" distance={10} decay={2} />
      <directionalLight intensity={0.18} color="#f5c87a" position={[-6, 2, 0]} />
      <pointLight position={[-5.7, 1.6, -4.5]} intensity={0.9} color="#8ab4f8" distance={4} decay={2} />
      {/* pointLight buffet supprimée : chaque AnimatedCandle a sa propre pointLight locale */}
      {/* Clair de lune par la grande fenêtre (bleu nuit, ref) */}
      <pointLight position={[-6.2, 2, 0.5]} intensity={1.0} color="#8aa4d8" distance={7} decay={2} />

      {/* ─── Sol tomettes (texture peinte, palier 3) ─────────────────────────── */}
      {/* Réflexion planaire floutée : la ref montre chaises/nappe/lustre qui se
          mirent dans les tomettes cirées. Seule entorse au toon, assumée. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[14, 11.6]} />
        <MeshReflectorMaterial
          map={solTomettes}
          normalMap={solTomettesNormal}
          normalScale={new THREE.Vector2(0.7, 0.7)}
          resolution={1024}
          mirror={0.45}
          mixStrength={0.8}
          mixBlur={1}
          blur={[250, 90]}
          roughness={0.5}
          metalness={0}
          distortion={0.12}
          distortionMap={solTomettesNormal}
          depthScale={0.6}
          minDepthThreshold={0.5}
          maxDepthThreshold={1.2}
        />
      </mesh>

      {/* ─── Plafond + vigas (poutres bois, ref salon-vue-entree-01) ────────── */}
      {!SHOW_AABB && (
        <>
          {/* Plafond bois : planches sombres (refs — pas de plâtre au plafond) */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, 0]}>
            <planeGeometry args={[14, 11.6]} />
            <meshToonMaterial map={plafondBoisTexture} gradientMap={toonGradient} />
          </mesh>
          {/* Vigas : plus nombreuses et massives (refs — poutres ~1,5 m d'entraxe) */}
          {[-6.3, -4.9, -3.5, -2.1, -0.7, 0.7, 2.1, 3.5, 4.9, 6.3].map(bx => (
            <mesh key={bx} position={[bx, 3.08, 0]}>
              <boxGeometry args={[0.22, 0.24, 11.6]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            </mesh>
          ))}
        </>
      )}
      {SHOW_AABB && SALON_OBSTACLES.map(([mx, Mx, mz, Mz], i) => (
        <mesh key={i} position={[(mx + Mx) / 2, 0.8, (mz + Mz) / 2]}>
          <boxGeometry args={[Mx - mx, 1.6, Mz - mz]} />
          <meshBasicMaterial color="#ff2020" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      ))}

      {/* ─── Mur Sud z=-5.8 — panneau continu (arche sud supprimée, plan-maison-v1) */}
      <mesh position={[-0.05, 1.6, -5.8]}>
        <boxGeometry args={[14, 3.2, 0.35]} />
        <meshToonMaterial map={murAdobeSouth} gradientMap={toonGradient} />
      </mesh>

      {/* ─── Mur Nord z=5.8 avec arche vers la cuisine (ref : ouverture chaude) ── */}
      {/* Mur ÉPAIS (0,35 m, ref : embrasure adobe profonde, aucune menuiserie).
          Panneaux en boxes de part et d'autre de l'ouverture [-3.4, -1.6],
          embrasure texturée (jambages plans + intrados cylindrique). */}
      <mesh position={[-5.2, 1.6, 5.975]}>
        <boxGeometry args={[3.6, 3.2, 0.35]} />
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      {/* Panneau nord droit — scindé pour l'arche 2 (x=4.5, ouverture x∈[3.6,5.4]) */}
      <mesh position={[1.0, 1.6, 5.975]}>
        <boxGeometry args={[5.2, 3.2, 0.35]} />
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[6.2, 1.6, 5.975]}>
        <boxGeometry args={[1.6, 3.2, 0.35]} />
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      {/* Arche 2 — bandeau, cintres, intrados, jambages */}
      <mesh position={[4.5, 2.95, 5.975]}>
        <boxGeometry args={[1.8, 0.5, 0.35]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[4.5, 1.8, 5.79]} rotation={[0, Math.PI, 0]}>
        <ringGeometry args={[0.9, 1.6, 24, 1, 0, Math.PI]} />
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[4.5, 1.8, 6.16]}>
        <ringGeometry args={[0.9, 1.6, 24, 1, 0, Math.PI]} />
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[4.5, 1.8, 5.975]} geometry={intradosGeometry}>
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[3.6, 0.9, 5.975]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.35, 1.8]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[5.4, 0.9, 5.975]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.35, 1.8]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      {/* Bandeau au-dessus de l'arche 1 (de l'apex 2,7 au plafond 3,2) */}
      <mesh position={[-2.5, 2.95, 5.975]}>
        <boxGeometry args={[1.8, 0.5, 0.35]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      {/* Cintre : anneaux adobe côté salon et côté cuisine */}
      <mesh position={[-2.5, 1.8, 5.79]} rotation={[0, Math.PI, 0]}>
        <ringGeometry args={[0.9, 1.6, 24, 1, 0, Math.PI]} />
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-2.5, 1.8, 6.16]}>
        <ringGeometry args={[0.9, 1.6, 24, 1, 0, Math.PI]} />
        <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
      </mesh>
      {/* Intrados : sous-face courbe de l'arche. Normales inversées (on la voit
          par dessous) — géométrie préparée par intradosGeometry. */}
      <mesh position={[-2.5, 1.8, 5.975]} geometry={intradosGeometry}>
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      {/* Jambages : faces internes de l'embrasure, normales vers l'ouverture */}
      <mesh position={[-3.4, 0.9, 5.975]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.35, 1.8]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-1.6, 0.9, 5.975]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.35, 1.8]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>

      {/* ─── Cuisine (z∈[5.8,8.6], x∈[-4.4,-0.6]) — ref cuisine-entree-01/02 ─── */}
      <group>
        {/* ── Sol tomettes ── */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0.001, 7.2]}>
          <planeGeometry args={[3.8, 2.8]} />
          <meshPhongMaterial map={solTomettes} shininess={40} specular="#4a3420" />
        </mesh>
        {/* ── Plafond ── */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[-2.5, 2.9, 7.2]}>
          <planeGeometry args={[3.8, 2.8]} />
          <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
        </mesh>
        {/* ── Mur fond nord (z=8.6) — adobe ── */}
        <mesh position={[-2.5, 1.45, 8.6]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[3.8, 2.9]} />
          <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
        </mesh>
        {/* ── Mur ouest (x=-4.4) — adobe ── */}
        <mesh position={[-4.4, 1.45, 7.2]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.8, 2.9]} />
          <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
        </mesh>
        {/* ── Mur est (x=-0.6) — pierre (ref cuisine-coin-pierres-01) ── */}
        <mesh position={[-0.6, 1.45, 7.2]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[2.8, 2.9]} />
          <meshToonMaterial map={murPierre} gradientMap={toonGradient} />
        </mesh>

        {/* ── Azulejos crédence — mur est derrière le fogón ── */}
        <mesh position={[-0.61, 1.3, 8.1]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.0, 0.82]} />
          <meshToonMaterial map={azulejosTalavera} gradientMap={toonGradient} />
        </mesh>
        {/* Azulejos crédence — mur fond derrière le fogón */}
        <mesh position={[-1.05, 1.3, 8.59]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.90, 0.82]} />
          <meshToonMaterial map={azulejosTalavera} gradientMap={toonGradient} />
        </mesh>

        {/* ── Porte bleue (mur fond, côté ouest) ── */}
        <group position={[-3.55, 0, 8.58]}>
          <mesh position={[0, 1.10, 0]}>
            <boxGeometry args={[0.96, 2.20, 0.08]} />
            <meshToonMaterial color="#2A5A1A" gradientMap={toonGradient} />
            <Outlines thickness={0.020} color="black" />
          </mesh>
          <mesh position={[0, 1.10, 0.01]}>
            <boxGeometry args={[0.84, 2.06, 0.06]} />
            <meshToonMaterial color="#1E4080" gradientMap={toonGradient} />
            <Outlines thickness={0.018} color="black" />
          </mesh>
          <mesh position={[0, 1.54, 0.04]}>
            <boxGeometry args={[0.72, 0.62, 0.04]} />
            <meshToonMaterial color="#2050A0" gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 0.64, 0.04]}>
            <boxGeometry args={[0.72, 0.88, 0.04]} />
            <meshToonMaterial color="#2050A0" gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0.31, 1.10, 0.08]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.015, 0.015, 0.18, 8]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        </group>

        {/* ── Fogón (vieux poêle blanc, coin est, ref cuisine-entree-02) ── */}
        <group position={[-0.95, 0, 8.15]}>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.58, 0.90, 0.62]} />
            <meshToonMaterial color="#E8E4DC" gradientMap={toonGradient} />
            <Outlines thickness={0.018} color="black" />
          </mesh>
          <mesh position={[0, 0.92, 0]}>
            <boxGeometry args={[0.60, 0.04, 0.64]} />
            <meshToonMaterial color="#D0CCC4" gradientMap={toonGradient} />
          </mesh>
          {/* 4 brûleurs */}
          {([-0.13, 0.13] as number[]).flatMap(bx =>
            ([-0.14, 0.14] as number[]).map((bz, j) => (
              <mesh key={`b${bx}${j}`} position={[bx, 0.945, bz]}>
                <cylinderGeometry args={[0.068, 0.068, 0.012, 8]} />
                <meshToonMaterial color="#888880" gradientMap={toonGradient} />
              </mesh>
            ))
          )}
          {/* Porte du four */}
          <mesh position={[0, 0.28, 0.32]}>
            <boxGeometry args={[0.46, 0.38, 0.022]} />
            <meshToonMaterial color="#D0CCC4" gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
          <mesh position={[0, 0.20, 0.336]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.011, 0.011, 0.30, 6]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
          {/* Grande marmite sur le feu + vapeur */}
          <group position={[0.13, 0.95, -0.13]}>
            <mesh position={[0, 0.14, 0]}>
              <cylinderGeometry args={[0.155, 0.135, 0.28, 10]} />
              <meshToonMaterial color="#3A3028" gradientMap={toonGradient} />
              <Outlines thickness={0.012} color="black" />
            </mesh>
            <mesh position={[0, 0.285, 0]}>
              <cylinderGeometry args={[0.170, 0.170, 0.022, 10]} />
              <meshToonMaterial color="#2A2018" gradientMap={toonGradient} />
            </mesh>
            <mesh position={[0, 0.37, 0]}>
              <sphereGeometry args={[0.048, 6, 6]} />
              <meshToonMaterial color="#E8E0D0" gradientMap={toonGradient} transparent opacity={0.52} />
            </mesh>
            <mesh position={[0, 0.42, 0]}>
              <sphereGeometry args={[0.036, 6, 6]} />
              <meshToonMaterial color="#F0E8D8" gradientMap={toonGradient} transparent opacity={0.35} />
            </mesh>
          </group>
          {/* Petite casserole côté */}
          <group position={[-0.13, 0.95, -0.14]}>
            <mesh position={[0, 0.09, 0]}>
              <cylinderGeometry args={[0.09, 0.08, 0.18, 8]} />
              <meshToonMaterial color="#606870" gradientMap={toonGradient} />
              <Outlines thickness={0.010} color="black" />
            </mesh>
            <mesh position={[0.20, 0.06, 0]} rotation={[0, 0, -0.25]}>
              <cylinderGeometry args={[0.010, 0.010, 0.38, 6]} />
              <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
            </mesh>
          </group>
        </group>

        {/* ── Étagère murale + ustensiles suspendus (mur fond, côté est) ── */}
        <group position={[-1.55, 0, 8.56]}>
          {/* Planche */}
          <mesh position={[0, 1.68, 0]}>
            <boxGeometry args={[1.55, 0.042, 0.22]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          {/* 2 supports */}
          {[-0.62, 0.62].map(sx => (
            <mesh key={sx} position={[sx, 1.52, 0.04]}>
              <boxGeometry args={[0.040, 0.32, 0.22]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            </mesh>
          ))}
          {/* Ollas / pots sur l'étagère */}
          <group position={[-0.50, 1.72, 0.04]}>
            <mesh position={[0, 0.09, 0]}>
              <cylinderGeometry args={[0.08, 0.065, 0.18, 10]} />
              <meshToonMaterial color="#B87040" gradientMap={toonGradient} />
              <Outlines thickness={0.010} color="black" />
            </mesh>
            <mesh position={[0, 0.186, 0]}>
              <cylinderGeometry args={[0.048, 0.075, 0.048, 10]} />
              <meshToonMaterial color="#A06030" gradientMap={toonGradient} />
            </mesh>
          </group>
          <group position={[0.08, 1.72, 0.04]}>
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.072, 0.065, 0.16, 8]} />
              <meshToonMaterial color="#707880" gradientMap={toonGradient} />
              <Outlines thickness={0.008} color="black" />
            </mesh>
          </group>
          <group position={[0.52, 1.72, 0.04]}>
            <mesh position={[0, 0.065, 0]}>
              <cylinderGeometry args={[0.062, 0.055, 0.13, 8]} />
              <meshToonMaterial color="#606870" gradientMap={toonGradient} />
              <Outlines thickness={0.008} color="black" />
            </mesh>
          </group>
          {/* Tringle à ustensiles sous l'étagère */}
          <mesh position={[0, 1.54, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.009, 0.009, 1.45, 5]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
          {/* Ustensiles (louches / spatules alternés) */}
          {([-0.52, -0.22, 0.12, 0.46] as number[]).map((ux, ui) => (
            <group key={ui} position={[ux, 1.54, 0.06]}>
              <mesh position={[0, -0.042, 0]}>
                <boxGeometry args={[0.013, 0.082, 0.013]} />
                <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
              </mesh>
              <mesh position={[0, ui % 2 === 0 ? -0.225 : -0.185, 0]}>
                <cylinderGeometry args={ui % 2 === 0 ? [0.040, 0.010, 0.28, 8] : [0.012, 0.012, 0.24, 6]} />
                <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
                <Outlines thickness={0.006} color="black" />
              </mesh>
            </group>
          ))}
        </group>

        {/* ── Table cuisine centrale ── */}
        <group position={[-2.55, 0, 7.15]}>
          <mesh position={[0, 0.76, 0]}>
            <boxGeometry args={[1.20, 0.055, 0.80]} />
            <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
            <Outlines thickness={0.016} color="black" />
          </mesh>
          {/* Nappe courte brodée */}
          <mesh position={[0, 0.79, 0]}>
            <boxGeometry args={[1.08, 0.010, 0.70]} />
            <meshToonMaterial color="#F0E8D8" gradientMap={toonGradient} />
          </mesh>
          {/* 4 pieds */}
          {([-0.50, 0.50] as number[]).flatMap(lx =>
            ([-0.30, 0.30] as number[]).map((lz, j) => (
              <mesh key={`${lx}${j}`} position={[lx, 0.37, lz]}>
                <cylinderGeometry args={[0.036, 0.042, 0.74, 7]} />
                <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
                <Outlines thickness={0.012} color="black" />
              </mesh>
            ))
          )}
          {/* Olla en terre cuite + cempasúchil */}
          <group position={[-0.20, 0.79, 0.05]}>
            <mesh position={[0, 0.095, 0]}>
              <cylinderGeometry args={[0.088, 0.068, 0.19, 10]} />
              <meshToonMaterial color="#C07040" gradientMap={toonGradient} />
              <Outlines thickness={0.010} color="black" />
            </mesh>
            {([[0, 0.24, 0], [-0.06, 0.22, 0.04], [0.07, 0.21, -0.03]] as [number, number, number][]).map((p, i) => (
              <mesh key={i} position={p}>
                <sphereGeometry args={[0.036, 7, 7]} />
                <meshToonMaterial color="#E8821E" gradientMap={toonGradient} />
                <Outlines thickness={0.007} color="black" />
              </mesh>
            ))}
          </group>
          {/* Bougie table cuisine */}
          <group position={[0.28, 0.79, -0.12]}>
            <mesh position={[0, 0.062, 0]}>
              <cylinderGeometry args={[0.022, 0.025, 0.124, 7]} />
              <meshToonMaterial color={C_CANDLE} gradientMap={toonGradient} />
            </mesh>
            <mesh position={[0, 0.148, 0]}>
              <coneGeometry args={[0.022, 0.058, 6]} />
              <meshToonMaterial color={C_FLAME} gradientMap={toonGradient} emissive="#FF4400" emissiveIntensity={1.5} />
            </mesh>
            <pointLight position={[0, 0.18, 0]} intensity={0.55} color="#FF8833" distance={1.6} decay={2} />
          </group>
          {/* Tasse céramique */}
          <mesh position={[0.22, 0.80, 0.18]}>
            <cylinderGeometry args={[0.055, 0.045, 0.068, 9]} />
            <meshToonMaterial color={C_CERAMIC} gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
          {/* Pain / tortillas (bosse arrondie) */}
          <mesh position={[0.05, 0.80, -0.22]} scale={[1.6, 0.7, 1.0]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshToonMaterial color="#D9B98A" gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        </group>

        {/* ── Chaise cuisine ── */}
        <Prop
          url="/models/props/chaise.glb"
          color={C_WOOD_DARK}
          position={[-2.55, 0, 6.48]}
          rotationY={Math.PI}
          targetHeight={0.95}
        />

        {/* ── Ofrenda de cuisine (mur ouest, ref : bougie + cempasúchil + calavera) ── */}
        <group position={[-4.12, 0, 6.95]}>
          {/* Console basse */}
          <mesh position={[0, 0.44, 0]}>
            <boxGeometry args={[0.50, 0.88, 0.34]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            <Outlines thickness={0.014} color="black" />
          </mesh>
          <mesh position={[0, 0.90, 0]}>
            <boxGeometry args={[0.54, 0.030, 0.38]} />
            <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          </mesh>
          {/* Bouquet cempasúchil */}
          <group position={[-0.08, 0.93, 0.05]}>
            <mesh position={[0, 0.095, 0]}>
              <cylinderGeometry args={[0.052, 0.062, 0.19, 9]} />
              <meshToonMaterial color={C_CERAMIC} gradientMap={toonGradient} />
              <Outlines thickness={0.010} color="black" />
            </mesh>
            {([[0, 0.28, 0], [-0.07, 0.26, 0.04], [0.06, 0.25, -0.04], [0.03, 0.23, 0.07]] as [number, number, number][]).map((p, i) => (
              <mesh key={i} position={p}>
                <sphereGeometry args={[0.042, 7, 7]} />
                <meshToonMaterial color="#E8821E" gradientMap={toonGradient} />
                <Outlines thickness={0.008} color="black" />
              </mesh>
            ))}
          </group>
          {/* Bougie ofrenda */}
          <group position={[0.12, 0.93, -0.06]}>
            <mesh position={[0, 0.068, 0]}>
              <cylinderGeometry args={[0.023, 0.027, 0.136, 7]} />
              <meshToonMaterial color={C_CANDLE} gradientMap={toonGradient} />
            </mesh>
            <mesh position={[0, 0.155, 0]}>
              <coneGeometry args={[0.023, 0.062, 6]} />
              <meshToonMaterial color={C_FLAME} gradientMap={toonGradient} emissive="#FF4400" emissiveIntensity={1.5} />
            </mesh>
            <pointLight position={[0, 0.18, 0]} intensity={0.65} color="#FF8833" distance={1.4} decay={2} />
          </group>
          {/* Calavera déco */}
          <mesh position={[0, 1.04, 0.10]}>
            <sphereGeometry args={[0.072, 10, 10]} />
            <meshToonMaterial color="#F5F0E8" gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
          {[-0.032, 0.032].map(dx => (
            <mesh key={dx} position={[dx, 1.074, 0.172]}>
              <circleGeometry args={[0.018, 8]} />
              <meshToonMaterial color="#1A1010" gradientMap={toonGradient} />
            </mesh>
          ))}
          {/* Cadre photo mur ouest */}
          <PhotoFrame position={[0.005, 1.78, 0.36]} rotY={Math.PI / 2} />
        </group>

        {/* ── Ampoule nue suspendue (ref : fil + douille + globe) ── */}
        <group position={[-2.5, 0, 7.2]}>
          <mesh position={[0, 2.74, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.44, 5]} />
            <meshToonMaterial color="#1A1010" gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 2.51, 0]}>
            <cylinderGeometry args={[0.022, 0.018, 0.058, 8]} />
            <meshToonMaterial color="#B0A080" gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 2.46, 0]}>
            <sphereGeometry args={[0.050, 10, 10]} />
            <meshToonMaterial color="#F8E8A0" gradientMap={toonGradient} emissive="#F5D040" emissiveIntensity={3.0} />
          </mesh>
          <pointLight position={[0, 2.40, 0]} intensity={3.2} color="#f5b060" distance={5.5} decay={2} />
        </group>

        {/* Cadre photo mur fond */}
        <PhotoFrame position={[-2.5, 1.82, 8.56]} rotY={Math.PI} />
      </group>

      {/* ─── Pièce arche 2 — couloir nord-est (x∈[3.5,6.5], z∈[5.8,8.4]) ─── */}
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.0, 0.001, 7.1]}>
          <planeGeometry args={[3.0, 2.6]} />
          <meshPhongMaterial map={solTomettes} shininess={40} specular="#4a3420" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[5.0, 2.9, 7.1]}>
          <planeGeometry args={[3.0, 2.6]} />
          <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
        </mesh>
        <mesh position={[5.0, 1.45, 8.4]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[3.0, 2.9]} />
          <meshToonMaterial map={murAdobeNorth} gradientMap={toonGradient} />
        </mesh>
        <mesh position={[3.5, 1.45, 7.1]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.6, 2.9]} />
          <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
        </mesh>
        <mesh position={[6.5, 1.45, 7.1]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[2.6, 2.9]} />
          <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
        </mesh>
        <pointLight position={[5.0, 2.2, 7.2]} intensity={1.8} color="#f5b860" distance={5} decay={2} />
        <PhotoFrame position={[5.0, 1.8, 8.35]} rotY={Math.PI} />
      </group>

      {/* ─── Mur Est x=7 — arche d'entrée (zaguán, z=0, ouverture z∈[-0.9,0.9]) */}
      <mesh position={[7, 1.6, -3.35]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[4.9, 3.2]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[7, 1.6, 3.35]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[4.9, 3.2]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Bandeau et cintre arche est */}
      <mesh position={[7, 2.95, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.8, 0.5]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[7, 1.8, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <ringGeometry args={[0.9, 1.6, 24, 1, 0, Math.PI]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* Croix au-dessus de l'arche est (intérieur salon) */}
      <mesh position={[6.99, 2.82, 0]}>
        <boxGeometry args={[0.04, 0.42, 0.07]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>
      <mesh position={[6.99, 2.90, 0]}>
        <boxGeometry args={[0.04, 0.07, 0.26]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
      </mesh>

      {/* ─── Mur Ouest x=-7, percé pour la fenêtre (ouverture z∈[-1.2,2.2],
          y∈[0.75,2.85] — la ref lui donne l'essentiel du mur) : 4 segments +
          embrasure profonde 0,35 m ──────────────────────────────────────────── */}
      <mesh position={[-7, 1.6, -3.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.6, 3.2]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-7, 1.6, 4.0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.6, 3.2]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-7, 3.025, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.4, 0.35]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-7, 0.375, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.4, 0.75]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      {/* Embrasure : jambages, sous-linteau, appui (faces vers l'ouverture) */}
      <mesh position={[-7.175, 1.8, 2.2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.35, 2.1]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-7.175, 1.8, -1.2]}>
        <planeGeometry args={[0.35, 2.1]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-7.175, 2.85, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.35, 3.4]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-7.175, 0.75, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.35, 3.4]} />
        <meshToonMaterial map={murAdobeLintel} gradientMap={toonGradient} />
      </mesh>

      {/* ─── Grande fenêtre à rideaux (mur ouest, ref salon-vue-entree-01) ──── */}
      <group position={[0, 0, WINDOW_CZ]}>
        {/* Diorama extérieur en couches (parallaxe réelle) — voir WindowVista */}
        <WindowVista />
        {/* Encadrement : montants + linteau + appui (ouverture 3,4 × 2,1) */}
        <mesh position={[-6.92, 1.8, 1.75]}>
          <boxGeometry args={[0.1, 2.3, 0.11]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
        <mesh position={[-6.92, 1.8, -1.75]}>
          <boxGeometry args={[0.1, 2.3, 0.11]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
        <mesh position={[-6.92, 2.9, 0]}>
          <boxGeometry args={[0.1, 0.1, 3.6]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
        <mesh position={[-6.90, 0.70, 0]}>
          <boxGeometry args={[0.16, 0.09, 3.66]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
        </mesh>
        {/* ── Fenêtre coulissante 2 panneaux (logique réelle : dormant bois,
            rail double haut/bas, panneau intérieur sur gorge avant, panneau
            extérieur sur gorge arrière, recouvrement central, poignée sur le
            montant de rencontre) ─────────────────────────────────────────── */}
        {/* Rails haut et bas : semelle + 2 gorges décalées en profondeur */}
        {[0.77, 2.83].map(ry => (
          <group key={ry}>
            <mesh position={[-7.085, ry, 0]}>
              <boxGeometry args={[0.11, 0.04, 3.42]} />
              <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
            </mesh>
            {[-7.055, -7.115].map(rx => (
              <mesh key={rx} position={[rx, ry + (ry < 1 ? 0.028 : -0.028), 0]}>
                <boxGeometry args={[0.014, 0.022, 3.42]} />
                <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Panneau coulissant INTÉRIEUR (gauche, gorge avant x=-7.055) */}
        <SashFrame x={-7.055} zMin={-1.71} zMax={0.06} />
        {/* Panneau coulissant EXTÉRIEUR (droite, gorge arrière x=-7.115) */}
        <SashFrame x={-7.115} zMin={-0.06} zMax={1.71} />
        {/* Poignée coquille sur le montant de rencontre du panneau intérieur */}
        <mesh position={[-7.025, 1.78, 0.01]}>
          <boxGeometry args={[0.022, 0.16, 0.045]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.006} color="black" />
        </mesh>
        {/* Vitre unique partagée (mi-profondeur des deux gorges) : reflet
            planaire — de nuit l'intérieur éclairé se mire dans le verre */}
        <mesh position={[-7.085, 1.8, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[3.36, 2.04]} />
          <MeshReflectorMaterial
            transparent
            opacity={0.68}
            color="#e8f0f4"
            resolution={512}
            mirror={1}
            mixStrength={1.4}
            mixBlur={0}
            blur={[0, 0]}
            roughness={0.06}
            metalness={0}
            depthScale={0}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Rejas — fer forgé scellé dans la maçonnerie, PROFOND dans l'embrasure
            (côté extérieur, comme en vrai : la menuiserie est intérieure, la
            grille protège dehors). Barreaux carrés qui plongent dans l'appui et
            le linteau ; traverses plates encastrées dans les jambages. Variation
            de forge : barreaux maîtres épais alternés de barreaux fins. */}
        {REJA_DZ.map((dz, ri) => (
          <mesh key={ri} position={[-7.24, 1.8, dz]}>
            <boxGeometry args={ri % 2 === 0 ? [0.026, 2.16, 0.026] : [0.016, 2.16, 0.016]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            <Outlines thickness={0.006} color="black" />
          </mesh>
        ))}
        {/* 3 traverses plates (encastrées dans les jambages, ancrage réel) */}
        {[1.15, 1.8, 2.45].map(hy => (
          <mesh key={hy} position={[-7.225, hy, 0]}>
            <boxGeometry args={[0.012, 0.04, 3.44]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        ))}
        {/* Colliers forgés aux croisements des barreaux maîtres */}
        {REJA_DZ.filter((_, ri) => ri % 2 === 0).flatMap(dz =>
          [1.15, 2.45].map(hy => (
            <mesh key={`${dz}-${hy}`} position={[-7.235, hy, dz]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.026, 0.007, 6, 10]} />
              <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            </mesh>
          ))
        )}
        {/* Pointes de lance sur les barreaux maîtres (dépassent l'appui côté
            extérieur — signature des rejas forgées) */}
        {REJA_DZ.filter((_, ri) => ri % 2 === 0).map(dz => (
          <mesh key={`spike-${dz}`} position={[-7.24, 0.72, dz]}>
            <coneGeometry args={[0.030, 0.09, 4]} />
            <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          </mesh>
        ))}
        {/* Rideaux : panneaux plissés animés, suspendus par anneaux (voir Rideau) */}
        <RideauPanel z={2.05} />
        <RideauPanel z={-2.05} />
        {/* Tringle bois tournée */}
        <mesh position={[-6.80, 2.98, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 4.75, 10]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        {/* Embouts tournés : collerette + boule */}
        {[-2.42, 2.42].map(dz => (
          <group key={dz}>
            <mesh position={[-6.80, 2.98, dz]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.03, 10]} />
              <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
            </mesh>
            <mesh position={[-6.80, 2.98, dz + Math.sign(dz) * 0.055]}>
              <sphereGeometry args={[0.055, 10, 10]} />
              <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
              <Outlines thickness={0.010} color="black" />
            </mesh>
          </group>
        ))}
        {/* Supports muraux : platine vissée au mur + bras + collier autour de
            la tringle — on voit COMMENT ça tient (ref) */}
        {[-2.15, 2.15].map(dz => (
          <group key={dz}>
            <mesh position={[-6.965, 2.90, dz]}>
              <boxGeometry args={[0.025, 0.16, 0.07]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
              <Outlines thickness={0.008} color="black" />
            </mesh>
            <mesh position={[-6.88, 2.94, dz]} rotation={[0, 0, -0.45]}>
              <cylinderGeometry args={[0.014, 0.018, 0.20, 8]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            </mesh>
            <mesh position={[-6.80, 2.98, dz]}>
              <torusGeometry args={[0.045, 0.011, 8, 14]} />
              <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ─── Papel picado ───────────────────────────────────────────────────── */}
      {PAPEL_X.map((sx, si) => <PapelStrand key={si} sx={sx} si={si} />)}

      {/* ─── Table centrale ─────────────────────────────────────────────────── */}
      {/* Plateau resserré (2.3 → 2.1) : proportions banquet plus réalistes sans
          toucher chaises/NPCs/AABB (tous calibrés sur z=±1.5/1.6). */}
      <mesh position={[-0.05, 0.76, 1.0]}>
        <boxGeometry args={[8.5, 0.08, 2.1]} />
        <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
        <Outlines thickness={0.025} color="black" />
      </mesh>
      {/* Ceinture longue nord */}
      <mesh position={[-0.05, 0.66, 1.88]}>
        <boxGeometry args={[8.1, 0.14, 0.06]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      {/* Ceinture longue sud */}
      <mesh position={[-0.05, 0.66, 0.12]}>
        <boxGeometry args={[8.1, 0.14, 0.06]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-3.75, 0.66, 1.0]}>
        <boxGeometry args={[0.06, 0.14, 1.8]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[3.65, 0.66, 1.0]}>
        <boxGeometry args={[0.06, 0.14, 1.8]} />
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
      <NappeCloth />
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
          {/* Assiette garnie (refs : plats servis) — mole / riz / frijoles alternés */}
          <mesh position={[0, 0.022, 0]} scale={[1, 1, 0.85 + ((pi + zi) % 3) * 0.1]}>
            <cylinderGeometry args={[0.095, 0.105, 0.025, 10]} />
            <meshToonMaterial
              color={['#5A2E14', '#D9C78A', '#3A1C10'][(pi + zi * 3) % 3]}
              gradientMap={toonGradient}
            />
            <Outlines thickness={0.008} color="black" />
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
      {([ [-4.15, 1.4], [-4.15, 0.6], [4.25, 1.4], [4.25, 0.6] ] as [number, number][]).map(([px, pz], i) => (
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
      <mesh position={[-0.05, 0.816, 1.0]}>
        <cylinderGeometry args={[0.30, 0.30, 0.020, 12]} />
        <meshToonMaterial color="#E8D4B4" gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      <mesh position={[-2.05, 0.816, 1.0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.018, 10]} />
        <meshToonMaterial color="#D4B890" gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>
      <mesh position={[1.95, 0.816, 1.0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.018, 10]} />
        <meshToonMaterial color="#D4B890" gradientMap={toonGradient} />
        <Outlines thickness={0.010} color="black" />
      </mesh>

      {/* ─── 20 chaises (pipeline image-to-3D, ladder-back ref salon-vue-entree-01) ──
          Étirement Y non uniforme : hauts dossiers des refs sans élargir
          l'empreinte au sol (collisions calibrées). */}
      {CHAIRS.map((c, i) => (
        <group key={i} scale={[1, 1.14, 1]}>
          <Prop
            url="/models/props/chaise.glb"
            color={C_WOOD_DARK}
            position={c.pos}
            rotationY={c.rot}
            targetHeight={1.05}
          />
        </group>
      ))}

      {/* ─── Bougies table ──────────────────────────────────────────────────── */}
      {CANDLES_TABLE.map((pos, i) => <AnimatedCandle key={i} position={pos} />)}

      {/* ─── Coin salon SUD-OUEST (refs, crops analysés) : canapé face à l'OUEST
          (dossier vers la table), TV contre le mur ouest près de la fenêtre,
          repose-pied entre les deux. Le groupe hérite de l'ancienne géométrie
          locale, tournée de π/2 puis translatée (centre canapé → (-3.6,-3.3)). ── */}
      <group position={[-0.7, 0, 0.8]} rotation={[0, Math.PI / 2, 0]}>
      {/* (canapé placeholder retiré — remplacé par le model texturé
          canape.glb, posé hors de ce groupe en coordonnées monde) */}

      {/* ─── Repose-pied (décalé nord : dégage le retour d'angle du canapé) ─── */}
      <mesh position={[4.75, 0.14, -3.85]}>
        <boxGeometry args={[1.55, 0.28, 0.52]} />
        <meshToonMaterial color="#1E1008" gradientMap={toonGradient} />
        <Outlines thickness={0.018} color="black" />
      </mesh>
      <RoundedBox args={[1.42, 0.12, 0.40]} radius={0.025} smoothness={3} position={[4.75, 0.30, -3.85]}>
        <meshToonMaterial color={C_UPHOLSTERY} gradientMap={toonGradient} />
        <Outlines thickness={0.016} color="black" />
      </RoundedBox>
      {([4.07, 5.43] as number[]).flatMap(px =>
        ([-3.63, -4.07] as number[]).map((pz, j) => (
          <mesh key={`${px}-${j}`} position={[px, 0.07, pz]}>
            <cylinderGeometry args={[0.028, 0.030, 0.14, 6]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
        ))
      )}

      {/* (fauteuil sorti du groupe : replacé en coordonnées monde près de la
          fenêtre — dans le groupe transformé il finirait devant l'écran TV) */}

      {/* (coussins colorés retirés : le model canape.glb a les siens) */}
      </group>

      {/* ─── Canapé d'angle — canape-full.glb (body + coussins séparés).
          Coussins : MeshToonMaterial + motif PNG (RepeatWrapping), override
          par Object3D.name dans Canape.tsx. ────────────────────────────────── */}
      <Canape
        position={[-3.15, 0, -3.9]}
        rotationY={-Math.PI / 2}
        targetLength={3.6}
      />

      {/* ─── Tapis tissé sous le coin salon (rayures, ancre visuellement le L) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.3, 0.012, -3.9]}>
        <planeGeometry args={[2.6, 3.0]} />
        <meshToonMaterial color="#7A4226" gradientMap={toonGradient} />
      </mesh>
      {[-1.25, -0.85, 0.85, 1.25].map((dz2, i) => (
        <mesh key={`rug${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-4.3, 0.014, -3.9 + dz2]}>
          <planeGeometry args={[2.6, 0.12]} />
          <meshToonMaterial color={i % 2 ? '#B05038' : '#C8893A'} gradientMap={toonGradient} />
        </mesh>
      ))}

      {/* ─── Fauteuil dossier contre le bas de la fenêtre, face à la pièce
          (ref vue-entree) ───────────────────────────────────────────────────── */}
      <Prop
        url="/models/props/fauteuil.glb"
        color={C_UPHOLSTERY}
        position={[-6.42, 0, -0.6]}
        rotationY={Math.PI / 2}
        targetHeight={0.95}
      />

      {/* ─── Télé CRT 90s + meuble TV — en diagonale DANS L'ANGLE sud-ouest,
          écran vers le nord-est : les deux segments du canapé en L la voient.
          (Meuble TV : model dédié à venir — backlog props texturés.) ────────── */}
      <Prop
        url="/models/props/tv.glb"
        color="#3a3a3e"
        position={[-6.15, 0, -4.95]}
        rotationY={Math.PI / 4}
        targetHeight={1.25}
      />
      {/* Écran : plaqué sur la face du tube, scintillement TV (contenu animé
          simple en attendant mieux — voir backlog) */}
      <TVScreen />
      {/* Cadres au mur ouest autour de la TV (ref vue-entree) */}
      <PhotoFrame position={[-6.96, 2.3, -2.15]} rotY={Math.PI / 2} />
      <PhotoFrame position={[-6.96, 1.9, -3.5]} rotY={Math.PI / 2} />

      {/* ─── Buffet/commode (mur nord, à gauche en entrant — ref vue-entrée) ─── */}
      <Prop
        url="/models/props/buffet.glb"
        color={C_WOOD_MED}
        position={[3.2, 0, 5.32]}
        rotationY={Math.PI}
        targetHeight={1.05}
      />
      {/* Photos de famille debout sur le buffet */}
      {([[2.9, -0.06], [3.25, 0.04], [3.65, -0.04], [4.0, 0.06]] as [number, number][]).map(([px, rot], i) => (
        <group key={i} position={[px, 1.05, 5.32]} rotation={[0, Math.PI + rot, 0]}>
          <mesh>
            <boxGeometry args={[0.16, 0.22, 0.02]} />
            <meshToonMaterial color={C_FRAME} gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
          <mesh position={[0, 0, 0.011]}>
            <planeGeometry args={[0.12, 0.17]} />
            <meshToonMaterial color={C_PHOTO} gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}
      {/* Vase de cempasúchil (fleurs oranges) */}
      <group position={[2.45, 1.05, 5.32]}>
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.055, 0.075, 0.22, 9]} />
          <meshToonMaterial color={C_CERAMIC} gradientMap={toonGradient} />
          <Outlines thickness={0.010} color="black" />
        </mesh>
        {([[0, 0.28, 0], [-0.07, 0.25, 0.04], [0.07, 0.26, -0.03], [0.03, 0.24, 0.06], [-0.05, 0.23, -0.06]] as [number, number, number][]).map(([fx, fy, fz], i) => (
          <mesh key={i} position={[fx, fy, fz]}>
            <sphereGeometry args={[0.045, 7, 7]} />
            <meshToonMaterial color="#E8821E" gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
        ))}
      </group>

      {/* ─── Bougies buffet ─────────────────────────────────────────────────── */}
      {CANDLES_BUFFET.map((pos, i) => <AnimatedCandle key={i} position={pos} />)}

      {/* ─── Zaguán / vestibule d'entrée derrière l'arche est ───────────────
          x∈[7,10], z∈[-2,2] — lumière naturelle chaude, porte extérieure */}
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.5, 0.001, 0]}>
          <planeGeometry args={[3.0, 4.0]} />
          <meshPhongMaterial map={solTomettes} shininess={40} specular="#4a3420" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[8.5, 2.9, 0]}>
          <planeGeometry args={[3.0, 4.0]} />
          <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
        </mesh>
        <mesh position={[10, 1.45, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[4.0, 2.9]} />
          <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
        </mesh>
        <mesh position={[8.5, 1.45, -2]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[3.0, 2.9]} />
          <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
        </mesh>
        <mesh position={[8.5, 1.45, 2]}>
          <planeGeometry args={[3.0, 2.9]} />
          <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
        </mesh>
        {/* Porte extérieure (double, planches) sur le mur est du zaguán */}
        {[-0.42, 0.42].map(dz => (
          <mesh key={dz} position={[9.94, 1.15, dz]}>
            <boxGeometry args={[0.12, 2.3, 0.82]} />
            <meshToonMaterial color="#3E2210" gradientMap={toonGradient} />
            <Outlines thickness={0.020} color="black" />
          </mesh>
        ))}
        {/* Lumière naturelle du zaguán (entrée + ciel extérieur) */}
        <pointLight position={[9.0, 2.2, 0]} intensity={1.6} color="#f8e8c0" distance={5} decay={2} />
      </group>

      {/* ─── Vaisselier (coin nord-est, ref vue-fenetre) ────────────────────── */}
      <group position={[5.7, 0, 5.45]} rotation={[0, Math.PI, 0]}>
        {/* Caisson bas */}
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.5, 0.9, 0.48]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          <Outlines thickness={0.020} color="black" />
        </mesh>
        {/* Vitrine haute */}
        <mesh position={[0, 1.62, 0.04]}>
          <boxGeometry args={[1.42, 1.44, 0.38]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.018} color="black" />
        </mesh>
        {/* Fond de vitrine + 2 étagères d'assiettes */}
        <mesh position={[0, 1.62, -0.10]}>
          <planeGeometry args={[1.34, 1.34]} />
          <meshToonMaterial color="#2A1608" gradientMap={toonGradient} />
        </mesh>
        {([1.28, 1.92] as number[]).flatMap(sy =>
          ([-0.45, 0, 0.45] as number[]).map(sxx => (
            <mesh key={`${sy}-${sxx}`} position={[sxx, sy, -0.02]} rotation={[0.12, 0, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.018, 12]} />
              <meshToonMaterial color={C_CERAMIC} gradientMap={toonGradient} />
              <Outlines thickness={0.008} color="black" />
            </mesh>
          ))
        )}
        {/* Corniche */}
        <mesh position={[0, 2.38, 0.05]}>
          <boxGeometry args={[1.56, 0.09, 0.46]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
      </group>

      {/* ─── Cadres photos ──────────────────────────────────────────────────── */}
      {/* Mur nord : grande tapisserie encadrée + cadres (ref vue-entree, gauche) */}
      <group position={[-5.2, 2.0, 5.77]} rotation={[0, Math.PI, 0]} scale={[1.45, 1.45, 1]}>
        <PhotoFrame position={[0, 0, 0]} />
      </group>
      {FRAMES_NORTH.map((pos, i) => <PhotoFrame key={i} position={pos} rotY={Math.PI} />)}
      {/* Mur sud : cadres au-dessus du coin salon (ref vue-entree, droite) */}
      {FRAMES_SOUTH.map((pos, i) => <PhotoFrame key={i} position={pos} />)}
      {FRAMES_EAST.map((pos, i) => (
        <PhotoFrame key={i} position={pos} rotY={-Math.PI / 2} />
      ))}

      {/* ─── Cactus ─────────────────────────────────────────────────────────── */}
      <group position={[-6.1, 0, 4.7]}>
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
      <group position={[-0.05, 0, 0]}>
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
        {/* Anneau (refs : couronne large, 6 bougies) */}
        <mesh position={[0, 2.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.032, 8, 28]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {/* 6 rayons + bougies sur l'anneau */}
        {Array.from({ length: 6 }, (_, i) => (i * Math.PI) / 3).map((a, i) => (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.275, 2.52, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.014, 0.014, 0.55, 6]} />
              <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            </mesh>
            {/* Coupelle */}
            <mesh position={[0.55, 2.545, 0]}>
              <cylinderGeometry args={[0.05, 0.028, 0.03, 8]} />
              <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
            </mesh>
            <mesh position={[0.55, 2.63, 0]}>
              <cylinderGeometry args={[0.038, 0.033, 0.15, 8]} />
              <meshToonMaterial color={C_CANDLE} gradientMap={toonGradient} />
              <Outlines thickness={0.012} color="black" />
            </mesh>
            <mesh position={[0.55, 2.745, 0]}>
              <sphereGeometry args={[0.032, 8, 8]} />
              <meshToonMaterial color={C_FLAME} emissive={C_FLAME} emissiveIntensity={2.2} gradientMap={toonGradient} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ─── Plats de service (centre de table, entre les bougies) ─────────── */}
      {/* Plat de tamales */}
      <group position={[-2.75, 0.84, 0]}>
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
      <group position={[-0.15, 0.82, 0]}>
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
      <group position={[2.45, 0.83, 0]}>
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

      {/* ─── Festin complété (refs : la table est couverte de plats) ────────── */}
      {/* Pile de tortillas + linge */}
      <group position={[1.55, 0.84, 0.35]}>
        <mesh>
          <cylinderGeometry args={[0.16, 0.16, 0.015, 10]} />
          <meshToonMaterial color={C_CERAMIC} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {[0.02, 0.045, 0.07].map((py, i) => (
          <mesh key={i} position={[(i % 2) * 0.012, py, -(i % 2) * 0.01]}>
            <cylinderGeometry args={[0.12 - i * 0.004, 0.12 - i * 0.004, 0.022, 10]} />
            <meshToonMaterial color="#E9D8A8" gradientMap={toonGradient} />
          </mesh>
        ))}
      </group>
      {/* Bol de frijoles */}
      <group position={[-1.45, 0.84, -0.35]}>
        <mesh position={[0, 0.045, 0]}>
          <cylinderGeometry args={[0.13, 0.09, 0.10, 12]} />
          <meshToonMaterial color="#8A4A2A" gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.105, 0.105, 0.012, 12]} />
          <meshToonMaterial color="#3A1C10" gradientMap={toonGradient} />
        </mesh>
      </group>
      {/* Deux jarras (agua de jamaica) */}
      {([[-3.55, 0.55], [3.35, -0.5]] as [number, number][]).map(([jx, jz], i) => (
        <group key={i} position={[jx, 0.84, jz]}>
          <mesh position={[0, 0.10, 0]}>
            <cylinderGeometry args={[0.075, 0.055, 0.20, 10]} />
            <meshToonMaterial color="#B05038" gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
          <mesh position={[0, 0.215, 0]}>
            <cylinderGeometry args={[0.05, 0.075, 0.035, 10]} />
            <meshToonMaterial color="#B05038" gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0.085, 0.12, 0]} rotation={[0, 0, -0.3]}>
            <torusGeometry args={[0.045, 0.011, 6, 10, Math.PI]} />
            <meshToonMaterial color="#B05038" gradientMap={toonGradient} />
          </mesh>
        </group>
      ))}
      {/* Corbeille de pan de muerto */}
      <group position={[0.05, 0.84, 0.42]}>
        <mesh>
          <cylinderGeometry args={[0.17, 0.13, 0.07, 10]} />
          <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {([[-0.05, 0.04], [0.06, -0.03], [0.0, 0.09]] as [number, number][]).map(([bx, bz], i) => (
          <group key={i} position={[bx, 0.065 + (i === 2 ? 0.05 : 0), bz]}>
            <mesh>
              <sphereGeometry args={[0.062, 9, 9]} />
              <meshToonMaterial color="#C8893A" gradientMap={toonGradient} />
              <Outlines thickness={0.010} color="black" />
            </mesh>
            <mesh position={[0, 0.045, 0]}>
              <sphereGeometry args={[0.02, 7, 7]} />
              <meshToonMaterial color="#B8792F" gradientMap={toonGradient} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ─── Vase de cempasúchil sur le buffet nord (ref vue-fenetre) ────────── */}
      <group position={[3.3, 1.02, 5.35]}>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.09, 0.06, 0.28, 10]} />
          <meshToonMaterial color="#7A9AB8" gradientMap={toonGradient} />
          <Outlines thickness={0.014} color="black" />
        </mesh>
        {([[0, 0.36, 0], [-0.09, 0.32, 0.04], [0.09, 0.33, -0.03], [-0.04, 0.30, -0.08], [0.05, 0.31, 0.08], [0, 0.42, -0.02]] as [number, number, number][]).map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshToonMaterial color={i % 2 ? '#E8940A' : '#D97E08'} gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
        ))}
      </group>

      {/* ─── Bougies murales nord sur consoles (ref vue-fenetre : lueurs sur le
          mur droit) ─────────────────────────────────────────────────────────── */}
      {([[0.3, 5.62], [4.9, 5.62]] as [number, number][]).map(([sx2, sz2], i) => (
        <group key={i}>
          <mesh position={[sx2, 1.94, sz2 + 0.09]}>
            <boxGeometry args={[0.24, 0.03, 0.16]} />
            <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
          <AnimatedCandle position={[sx2, 1.955, sz2 + 0.09]} />
        </group>
      ))}

      {/* ─── Tenture tissée (mur nord, à l'ouest de l'arche — ref) ───────────── */}
      <group position={[-4.9, 2.0, 5.77]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <planeGeometry args={[0.72, 1.0]} />
          <meshToonMaterial color="#8A3A2A" gradientMap={toonGradient} />
        </mesh>
        {[-0.30, -0.10, 0.10, 0.30].map((ty, i) => (
          <mesh key={i} position={[0, ty, 0.005]}>
            <planeGeometry args={[0.72, 0.07]} />
            <meshToonMaterial color={['#E8940A', '#27AE60', '#F1C40F', '#2980B9'][i]} gradientMap={toonGradient} />
          </mesh>
        ))}
        <mesh position={[0, 0.54, 0.01]}>
          <boxGeometry args={[0.82, 0.04, 0.03]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        </mesh>
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

      {/* ─── Plantes feuillues : mur est + de part et d'autre de la fenêtre (ref) ── */}
      <PlanteFeuillue position={[6.5, 0, 1.2]} />
      <PlanteFeuillue position={[-6.35, 0, 2.35]} />
      <PlanteFeuillue position={[-6.4, 0, -1.6]} />

      {/* ─── Petite commode + lampe de chevet + mini plante — ENTRE le bout du
          retour du canapé et la TV, contre le mur sud (position B validée) ──── */}
      <group position={[-5.0, 0, -5.45]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Commode : caisson bois, 2 tiroirs à boutons, 4 pieds courts */}
        <mesh position={[0, 0.34, 0]}>
          <boxGeometry args={[0.44, 0.44, 0.55]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0, 0.575, 0]}>
          <boxGeometry args={[0.48, 0.035, 0.59]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
        {[0.24, 0.44].map((ty, i) => (
          <group key={i}>
            <mesh position={[0.225, ty, 0]}>
              <boxGeometry args={[0.015, 0.155, 0.46]} />
              <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
            </mesh>
            <mesh position={[0.235, ty, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.016, 0.016, 0.02, 8]} />
              <meshToonMaterial color={C_GOLD} gradientMap={toonGradient} />
            </mesh>
          </group>
        ))}
        {([-0.16, 0.16] as number[]).flatMap(lx =>
          ([-0.22, 0.22] as number[]).map((lz, j) => (
            <mesh key={`${lx}-${j}`} position={[lx, 0.06, lz]}>
              <cylinderGeometry args={[0.02, 0.024, 0.12, 6]} />
              <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            </mesh>
          ))
        )}
        {/* Mini plante en pot (quelques centimètres, à côté de la lampe) */}
        <group position={[0.02, 0.59, 0.17]}>
          <mesh position={[0, 0.035, 0]}>
            <cylinderGeometry args={[0.035, 0.026, 0.07, 8]} />
            <meshToonMaterial color={C_POT} gradientMap={toonGradient} />
            <Outlines thickness={0.008} color="black" />
          </mesh>
          {([[0, 0.1, 0, 0.045], [-0.03, 0.085, 0.02, 0.03], [0.03, 0.09, -0.015, 0.032]] as [number, number, number, number][]).map(([px, py, pz, r], i) => (
            <mesh key={i} position={[px, py, pz]} scale={[1, 1.4, 1]}>
              <sphereGeometry args={[r, 7, 7]} />
              <meshToonMaterial color={C_LEAF} gradientMap={toonGradient} />
              <Outlines thickness={0.006} color="black" />
            </mesh>
          ))}
        </group>
        {/* Lampe de chevet : socle + tige courte + petit abat-jour */}
        <group position={[0.02, 0.075, -0.14]}>
          <mesh position={[0, 0.535, 0]}>
            <cylinderGeometry args={[0.06, 0.075, 0.03, 10]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
            <Outlines thickness={0.010} color="black" />
          </mesh>
          <mesh position={[0, 0.63, 0]}>
            <cylinderGeometry args={[0.014, 0.018, 0.16, 8]} />
            <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          </mesh>
          <mesh position={[0, 0.76, 0]}>
            <cylinderGeometry args={[0.075, 0.11, 0.15, 12, 1, true]} />
            <meshToonMaterial color="#E8C87A" emissive="#F0C060" emissiveIntensity={0.6} gradientMap={toonGradient} side={THREE.DoubleSide} />
            <Outlines thickness={0.012} color="black" />
          </mesh>
        </group>
      </group>
      <pointLight position={[-4.86, 1.0, -5.43]} intensity={0.6} color="#F5C87A" distance={3} decay={2} />

      {/* ─── Plinthes segmentées — évitent arches et portes ─────────────────
          Nord (z=5.772) : arche1 x∈[-3.4,-1.6] arche2 x∈[3.6,5.4]
          Sud (z=-5.772) : arche3 x∈[-4.4,-2.6]
          Est (x=6.952) : porte z∈[-0.9,0.9]
          Ouest (x=-6.952) : plein (fenêtre à y>0.75, plinthe en dessous) ──── */}
      {/* Nord — 3 segments */}
      <mesh position={[-5.2, 0.06, 5.772]}>
        <boxGeometry args={[3.6, 0.12, 0.055]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      <mesh position={[1.0, 0.06, 5.772]}>
        <boxGeometry args={[5.2, 0.12, 0.055]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      <mesh position={[6.2, 0.06, 5.772]}>
        <boxGeometry args={[1.6, 0.12, 0.055]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      {/* Sud — 2 segments */}
      <mesh position={[-5.7, 0.06, -5.772]}>
        <boxGeometry args={[2.6, 0.12, 0.055]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      <mesh position={[2.2, 0.06, -5.772]}>
        <boxGeometry args={[9.6, 0.12, 0.055]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      {/* Est — 2 segments (porte z∈[-0.9,0.9]) */}
      <mesh position={[6.952, 0.06, -3.35]}>
        <boxGeometry args={[0.055, 0.12, 4.9]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      <mesh position={[6.952, 0.06, 3.35]}>
        <boxGeometry args={[0.055, 0.12, 4.9]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>
      {/* Ouest — plein */}
      <mesh position={[-6.952, 0.06, 0]}>
        <boxGeometry args={[0.055, 0.12, 11.6]} />
        <meshBasicMaterial color="#3A2008" />
      </mesh>

      {/* (corniche supprimée : en meshBasicMaterial clair elle brillait comme
          un néon dans la pénombre — les refs font rencontrer adobe et bois
          sombre directement) */}
    </group>
  )
}
