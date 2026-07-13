// src/scene/rooms/Cuisine.tsx
// Cuisine familiale (x∈[-7,-0.6], z∈[5.8,12.0]) — accès depuis l'arche nord du salon.
// Refs : cuisine-entree-01/02.png, cuisine-coin-pierres-01/02.png
import { Outlines } from '@react-three/drei'
import { toonGradient } from '../shared/toonGradient'
import {
  murAdobeSide,
  solTomettes,
  boisSombre,
  azulejosTalavera,
  murPierre,
} from '../shared/paintedTextures'
import { Prop } from '../shared/Prop'
import { PhotoFrame } from '../shared/PhotoFrame'
import { Porte } from '../shared/Porte'
import { PorteBleue } from '../shared/PorteBleue'

const C_CEIL      = '#F0E0C8'
const C_IRON      = '#1A1512'
const C_WOOD_DARK = '#3A2008'
const C_WOOD_MED  = '#5C3010'
const C_CERAMIC   = '#E8E0D0'
const C_CANDLE    = '#F5E8D0'
const C_FLAME     = '#FF7700'

// Cuisine : x∈[-7,-0.6], z∈[5.8,12.0] → centre (-3.8, 8.9), taille (6.4, 6.2)
const CX = -3.8
const CZ =  8.9
const CW =  6.4  // largeur x
const CD =  6.2  // profondeur z

export function Cuisine() {
  return (
    <group>
      {/* ── Sol tomettes ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CX, 0.001, CZ]}>
        <planeGeometry args={[CW, CD]} />
        <meshPhongMaterial map={solTomettes} shininess={40} specular="#4a3420" />
      </mesh>
      {/* ── Plafond ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[CX, 2.9, CZ]}>
        <planeGeometry args={[CW, CD]} />
        <meshToonMaterial color={C_CEIL} gradientMap={toonGradient} />
      </mesh>
      {/* ── Mur fond nord (z=12.0) — adobe, porte OUVRABLE vers le cellier
          x∈[-6.3,-5.3] (le cellier est derrière ce mur, cf. plan) ── */}
      <mesh position={[-6.65, 1.45, 12.0]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.7, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-2.95, 1.45, 12.0]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4.7, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      <mesh position={[-5.8, 2.5, 12.0]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.0, 0.8]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── Mur ouest (x=-7.0) — adobe plein. La porte bleue du jardin (non
          ouvrable) est plaquée dessus, à l'ancien emplacement z∈[9.5,10.5] ── */}
      <mesh position={[-7.0, 1.45, CZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[CD, 2.9]} />
        <meshToonMaterial map={murAdobeSide} gradientMap={toonGradient} />
      </mesh>
      {/* ── Mur est (x=-0.6) — pierre (ref cuisine-coin-pierres-01) : UN SEUL
          plan sur toute la longueur → texture continue. La porte FERMÉE vers le
          futur couloir (z∈[6.4,7.4]) est PLAQUÉE dessus avec son encadrement —
          on percera le mur quand le couloir existera. ── */}
      <mesh position={[-0.6, 1.45, CZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[CD, 2.9]} />
        <meshToonMaterial map={murPierre} gradientMap={toonGradient} />
      </mesh>
      {/* Encadrement + porte fermée vers le couloir (plaqués sur la pierre) */}
      {[6.4, 7.4].map(dz => (
        <mesh key={dz} position={[-0.66, 1.05, dz]}>
          <boxGeometry args={[0.1, 2.1, 0.08]} />
          <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
          <Outlines thickness={0.012} color="black" />
        </mesh>
      ))}
      <mesh position={[-0.66, 2.12, 6.9]}>
        <boxGeometry args={[0.1, 0.09, 1.08]} />
        <meshToonMaterial color={C_WOOD_DARK} gradientMap={toonGradient} />
        <Outlines thickness={0.012} color="black" />
      </mesh>
      <Porte position={[-0.68, 0, 6.43]} angle={0} width={0.94} />

      {/* ── Azulejos crédence — grand pan derrière le fogón, du soubassement
          à mi-mur comme dans la ref entree-02 ── */}
      <mesh position={[-2.2, 1.2, 11.96]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.6, 1.5]} />
        <meshToonMaterial map={azulejosTalavera} gradientMap={toonGradient} />
      </mesh>
      {/* Liseré bois en haut de la crédence */}
      <mesh position={[-2.2, 1.97, 11.95]}>
        <boxGeometry args={[2.6, 0.045, 0.03]} />
        <meshToonMaterial color={C_WOOD_MED} gradientMap={toonGradient} />
      </mesh>
      {/* Lueur douce sur la crédence (sinon bande toon sombre au fond) */}
      <pointLight position={[-2.2, 1.6, 11.2]} intensity={0.8} color="#f5d8a0" distance={2.5} decay={2} />

      {/* ── Porte bleue du jardin (mur ouest, non ouvrable — plan : "porte vers
          jardin"). Prend l'ancien emplacement de la porte du cellier. ── */}
      <PorteBleue position={[-6.96, 0, 10.0]} rotationY={Math.PI / 2} />

      {/* ── Fogón (vieux poêle blanc, mur du fond à droite, ref cuisine-entree-02)
          rotation π : porte du four face au sud (vers la pièce) ── */}
      <group position={[-2.2, 0, 11.62]} rotation={[0, Math.PI, 0]}>
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

      {/* ── Étagère murale + ustensiles suspendus (mur du fond, à l'ouest du fogón) ── */}
      <group position={[-4.0, 0, 11.94]}>
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
        {/* Ollas sur l'étagère */}
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
        {/* Tringle à ustensiles */}
        <mesh position={[0, 1.54, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.009, 0.009, 1.45, 5]} />
          <meshToonMaterial color={C_IRON} gradientMap={toonGradient} />
        </mesh>
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

      {/* ── Table cuisine au centre de la pièce (ref entree-01/02) ── */}
      <group position={[-3.8, 0, 8.9]}>
        <mesh position={[0, 0.76, 0]}>
          <boxGeometry args={[1.20, 0.055, 0.80]} />
          <meshToonMaterial map={boisSombre} gradientMap={toonGradient} />
          <Outlines thickness={0.016} color="black" />
        </mesh>
        <mesh position={[0, 0.79, 0]}>
          <boxGeometry args={[1.08, 0.010, 0.70]} />
          <meshToonMaterial color="#F0E8D8" gradientMap={toonGradient} />
        </mesh>
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
        {/* Bougie table */}
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
        {/* Pain / tortillas */}
        <mesh position={[0.05, 0.80, -0.22]} scale={[1.6, 0.7, 1.0]}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshToonMaterial color="#D9B98A" gradientMap={toonGradient} />
          <Outlines thickness={0.008} color="black" />
        </mesh>
      </group>

      {/* ── Chaises cuisine : une au sud face à la table, une à l'ouest (ref) ── */}
      <Prop
        url="/models/props/chaise.glb"
        color={C_WOOD_DARK}
        position={[-3.6, 0, 8.05]}
        rotationY={0}
        targetHeight={0.95}
      />
      <Prop
        url="/models/props/chaise.glb"
        color={C_WOOD_DARK}
        position={[-4.85, 0, 8.9]}
        rotationY={Math.PI / 2}
        targetHeight={0.95}
      />

      {/* ── Ofrenda de cuisine — contre le mur ouest (ref coin-pierres-02) ── */}
      <group position={[-6.72, 0, 7.6]}>
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
        <PhotoFrame position={[-0.22, 1.78, 0]} rotY={Math.PI / 2} />
      </group>

      {/* ── Ampoule nue suspendue au-dessus de la table (ref) ── */}
      <group position={[-3.8, 0, 8.9]}>
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

      {/* ── Lumières d'appoint : mur en pierre (l'ampoule seule le laissait dans
          la bande toon la plus sombre → mur noir) + lueur du fogón ── */}
      <pointLight position={[-1.5, 1.8, 9.2]} intensity={1.3} color="#f0c080" distance={4.5} decay={2} />
      <pointLight position={[-2.2, 1.4, 11.0]} intensity={1.0} color="#ff9040" distance={3.5} decay={2} />

      {/* Cadre photo mur fond, près du coin en pierres */}
      <PhotoFrame position={[-0.95, 1.82, 11.96]} rotY={Math.PI} />
    </group>
  )
}
