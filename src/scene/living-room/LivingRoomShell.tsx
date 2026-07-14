// src/scene/living-room/LivingRoomShell.tsx
import * as THREE from 'three'
import { Outlines, RoundedBox } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import {
  murAdobeSide,
  solTomettes, boisSombre,
} from '../shared/paintedTextures'
import { WindowVista } from './WindowVista'
import { Prop } from '../shared/Prop'
import { Sofa } from './Sofa'
import { TVScreen } from './shell/TVScreen'
import { LeafyPlant } from './shell/LeafyPlant'
import { PapelGarland } from './shell/PapelGarland'
import { CurtainPanel, SashFrame } from './shell/Curtains'
import { Tablecloth } from './Tablecloth'
import { PhotoFrame } from '../shared/PhotoFrame'
import { Kitchen } from '../rooms/Kitchen'
import { Pantry } from '../rooms/Pantry'
import { Corridor } from '../rooms/Corridor'
import { Bedroom1 } from '../rooms/Bedroom1'
import { Bedroom2 } from '../rooms/Bedroom2'
import { Bathroom } from '../rooms/Bathroom'
import { StorageRoom } from '../rooms/StorageRoom'
import { Office } from '../rooms/Office'
import { FrontDoor } from './FrontDoor'
import { Patio } from '../rooms/Patio'
import { Garage } from '../rooms/Garage'
import { SkyDome } from '../shared/SkyDome'
import { SceneAuditProbe } from '../debug/sceneAudit'
import { NO_PAPEL } from '../debug/perfFlags'
import { ZoneReflectorMaterial } from '../shared/ZoneReflector'
import { PerfProbe } from '../debug/PerfProbe'
import { LivingRoomLighting } from './shell/LivingRoomLighting'
import { LivingRoomStructure } from './shell/LivingRoomStructure'
import { Bassinet } from './Bassinet'
import {
  C_WOOD_DARK, C_WOOD_MED, C_UPHOLSTERY, C_CEIL, C_IRON, C_GOLD,
  C_FRAME, C_PHOTO, C_CACTUS, C_POT, C_CANDLE, C_FLAME, C_LEAF, C_CERAMIC,
  CHAIRS,
  TABLE_LEG_X, TABLE_LEG_Z,
  FRAMES_SOUTH, FRAMES_EAST,
  WINDOW_CZ, REJA_DZ, PLATE_X, PLATE_Z,
} from './shell/livingRoomConstants'

// ─── Composants ───────────────────────────────────────────────────────────────

// ─── Scene ────────────────────────────────────────────────────────────────────
export function LivingRoomShell() {
  return (
    <group>
      {/* ─── Lighting ───────────────────────────────────────────────────────── */}
      <LivingRoomLighting />

      {/* ─── Structure (floor, ceiling, four walls) ─────────────────────────── */}
      <LivingRoomStructure />

      {/* ─── Pièces satellites. (Room culling retiré : les murs sont partagés
          entre pièces — trous visibles — et la mesure a montré que le coût
          dominant est ailleurs : réflecteurs + coûts fixes par frame.) */}
      {/* Group nommé : masqué PENDANT les passes des réflecteurs du salon
          (leur reflet ne montre que le salon — re-rendre la maison entière
          coûtait ~35 ms/frame, mesuré par bissection). ReflectorThrottle. */}
      <group name="satellite-rooms">
        <Kitchen />
        <Pantry />
        <Corridor />
        <Bedroom1 />
        <Bedroom2 />
        <Bathroom />
        <StorageRoom />
        <Office />
        <Patio />
        <Garage />
      </group>

      {/* ─── Bulle de ciel étoilé au-dessus de toute la maison ─── */}
      <SkyDome />

      {/* ─── Audit graphique (?audit) + mesure perf (?perf) — inactifs sinon ─── */}
      <SceneAuditProbe />
      <PerfProbe />

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
        <mesh position={[-7.085, 1.8, 0]} rotation={[0, Math.PI / 2, 0]} userData={{ reflectorScope: 'salon', reflectorZone: 'salon' }}>
          <planeGeometry args={[3.36, 2.04]} />
          <ZoneReflectorMaterial zone="salon" salonScope transparent opacity={0.68} color="#e8f0f4" resolution={512} mirror={1} mixStrength={1.4} blur={[0, 0]} roughness={0.06} metalness={0} depthScale={0} side={THREE.DoubleSide} />
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
        {!NO_PAPEL && <CurtainPanel z={2.05} />}
        {!NO_PAPEL && <CurtainPanel z={-2.05} />}
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
      <PapelGarland />

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
      <Tablecloth />
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
            url="/models/props/chaise.glb?v=3"
            color={C_WOOD_DARK}
            position={c.pos}
            rotationY={c.rot}
            targetHeight={1.05}
          />
        </group>
      ))}

      {/* ─── Bougies table ──────────────────────────────────────────────────── */}

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
      <Sofa
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
        url="/models/props/fauteuil.glb?v=3"
        color={C_UPHOLSTERY}
        position={[-6.42, 0, -0.6]}
        rotationY={Math.PI / 2}
        targetHeight={0.95}
      />
      {/* Le bébé (22e présent) dort dans son couffin au pied du fauteuil —
          la grande-tante Rosa veille dessus en sommeillant */}
      <Bassinet position={[-6.25, 0, 0.35]} />

      {/* ─── Télé CRT 90s + meuble TV — en diagonale DANS L'ANGLE sud-ouest,
          écran vers le nord-est : les deux segments du canapé en L la voient.
          (Meuble TV : model dédié à venir — backlog props texturés.) ────────── */}
      <Prop
        url="/models/props/tv.glb?v=3"
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
        url="/models/props/buffet.glb?v=3"
        color={C_WOOD_MED}
        position={[2.0, 0, 5.35]}
        rotationY={Math.PI}
        targetHeight={1.05}
      />
      {/* Photos de famille debout sur le buffet */}
      {([[1.7, -0.06], [2.05, 0.04], [2.45, -0.04], [2.8, 0.06]] as [number, number][]).map(([px, rot], i) => (
        <group key={i} position={[px, 1.05, 5.35]} rotation={[0, Math.PI + rot, 0]}>
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
      <group position={[1.25, 1.05, 5.35]}>
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

      {/* ─── Zaguán : couloir d'entrée derrière l'arche est ──────────────────
          x∈[7.35,10], z∈[-0.9,0.9] — LA LARGEUR DE L'ARCHE. Derrière l'arche,
          un carrefour : tout droit la porte principale, à gauche (nord) la
          branche est vers les chambres, à droite (sud) le couloir du bureau. */}
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.675, 0.001, 0]}>
          <planeGeometry args={[2.65, 1.8]} />
          <meshPhongMaterial map={solTomettes} shininess={40} specular="#4a3420" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[8.675, 2.9, 0]}>
          <planeGeometry args={[2.65, 1.8]} />
          <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
        </mesh>
        {/* Mur est x=10 (derrière la porte principale) */}
        <mesh position={[10, 1.45, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.8, 2.9]} />
          <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
        </mesh>
        {/* Murs nord z=0.9 et sud z=-0.9 (x∈[8.75,9.94] — à l'ouest, le
            carrefour est ouvert). DoubleSide : visibles des deux côtés. */}
        <mesh position={[9.345, 1.45, 0.9]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.19, 2.9]} />
          <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[9.345, 1.45, -0.9]}>
          <planeGeometry args={[1.19, 2.9]} />
          <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} side={THREE.DoubleSide} />
        </mesh>
        {/* Porte principale : vantaux cloutés, cantera, imposte, farol —
            voir PorteEntree.tsx */}
        <FrontDoor />
      </group>

      {/* ─── Vaisselier (coin nord-est, ref vue-fenetre) ────────────────────── */}
      <group position={[6.15, 0, 5.45]} rotation={[0, Math.PI, 0]}>
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
      {/* FRAMES_NORTH supprimés — place pour l'arche chambre 1 (mur milieu x∈[-1.6,3.6]) */}
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
      <group position={[2.1, 1.02, 5.35]}>
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
      <LeafyPlant position={[6.5, 0, 2.8]} />
      <LeafyPlant position={[-6.35, 0, 2.35]} />
      <LeafyPlant position={[-6.4, 0, -1.6]} />

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
