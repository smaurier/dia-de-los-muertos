// src/scene/salon/familyConfig.ts
import type { NPCConfig, Scenario } from '../../game/systems/npcSystem'

// ─── Scénarios par type ────────────────────────────────────────────────

const mamanScenarios: Scenario[] = [
  {
    id: 'maman_sert', weight: 3, duration: [8, 15],
    steps: [
      { type: 'walk', target: [-1, 0, -3] },
      { type: 'dialogue', text: '¿Alguien quiere más?', speakerName: 'Mamá Elena' },
      { type: 'idle', duration: 4 },
      { type: 'walk', target: [-1, 0, 2.5] },
    ],
  },
  {
    id: 'maman_cuisine', weight: 2, duration: [10, 18],
    steps: [
      { type: 'dialogue', text: 'Voy a la cocina un momento.', speakerName: 'Mamá Elena' },
      { type: 'walk', target: [-2.5, 0, 4.6] },  // devant l'arche de la cuisine (mur nord)
      { type: 'idle', duration: 6 },
      { type: 'walk', target: [-5.5, 0, 0] },
    ],
  },
  {
    id: 'maman_assise', weight: 4, duration: [12, 20],
    steps: [
      { type: 'sit', targetId: 'table-chair-1' },
      { type: 'idle', duration: 10 },
      { type: 'dialogue', text: '¡Ven a comer, mijo!', speakerName: 'Mamá Elena' },
    ],
  },
  {
    id: 'maman_embrasse', weight: 1, duration: [5, 8],
    steps: [
      { type: 'walk', target: [0, 0, 2] },
      { type: 'dialogue', text: '¿Estás bien, mi amor?', speakerName: 'Mamá Elena' },
      { type: 'idle', duration: 3 },
    ],
  },
]

const papaScenarios: Scenario[] = [
  {
    id: 'papa_assis', weight: 5, duration: [15, 25],
    steps: [
      { type: 'sit', targetId: 'table-chair-2' },
      { type: 'idle', duration: 12 },
      { type: 'dialogue', text: '¡Qué buena está la comida!', speakerName: 'Papá Carlos' },
    ],
  },
  {
    id: 'papa_debout', weight: 2, duration: [8, 12],
    steps: [
      { type: 'walk', target: [-3, 0, -2.5] },
      { type: 'dialogue', text: '¿Otro tequila, cuñado?', speakerName: 'Papá Carlos' },
      { type: 'idle', duration: 4 },
      { type: 'walk', target: [-1.5, 0, 2.5] },
    ],
  },
  {
    id: 'papa_tv', weight: 1, duration: [10, 15],
    steps: [
      { type: 'walk', target: [2, 0, -3.5] },
      { type: 'idle', duration: 8 },
      { type: 'dialogue', text: '¡Gol! ¡Gol!', speakerName: 'Papá Carlos' },
      { type: 'walk', target: [-1, 0, 0] },
    ],
  },
]

const oncleScenarios: Scenario[] = [
  {
    id: 'oncle_rit', weight: 4, duration: [8, 14],
    steps: [
      { type: 'sit', targetId: 'table-chair-3' },
      { type: 'idle', duration: 5 },
      { type: 'dialogue', text: '¡Ja, ja, ja! ¡Eso sí que es bueno!', speakerName: 'Tío' },
    ],
  },
  {
    id: 'oncle_appelle', weight: 2, duration: [6, 10],
    steps: [
      { type: 'dialogue', text: '¡Oye, pásame el pan!', speakerName: 'Tío' },
      { type: 'idle', duration: 3 },
    ],
  },
  {
    id: 'oncle_marche', weight: 2, duration: [10, 16],
    steps: [
      { type: 'walk', target: [-4, 0, -2] },
      { type: 'idle', duration: 4 },
      { type: 'dialogue', text: '¿Y cómo va el trabajo?', speakerName: 'Tío' },
      { type: 'walk', target: [-1, 0, -2.5] },
    ],
  },
  {
    id: 'oncle_boit', weight: 3, duration: [6, 10],
    steps: [
      { type: 'idle', duration: 4 },
      { type: 'dialogue', text: '¡Salud!', speakerName: 'Tío' },
      { type: 'idle', duration: 3 },
    ],
  },
]

// Scénarios spécifiques par oncle (speakerName individualisé dans NPCConfig via name)
// Les oncleScenarios utilisent 'Tío' générique — le système affiche NPC.name au runtime

const tanteScenarios: Scenario[] = [
  {
    id: 'tante_parle', weight: 4, duration: [10, 16],
    steps: [
      { type: 'sit', targetId: 'table-chair-4' },
      { type: 'dialogue', text: '¿Ya viste lo que pasó con los vecinos?', speakerName: 'Tía' },
      { type: 'idle', duration: 8 },
    ],
  },
  {
    id: 'tante_aide', weight: 2, duration: [8, 14],
    steps: [
      { type: 'dialogue', text: '¿Te ayudo, cuñada?', speakerName: 'Tía' },
      { type: 'walk', target: [0, 0, -4] },
      { type: 'idle', duration: 5 },
      { type: 'walk', target: [-0.5, 0, -2.5] },
    ],
  },
  {
    id: 'tante_enfant', weight: 2, duration: [6, 10],
    steps: [
      { type: 'walk', target: [0, 0, 2.5] },
      { type: 'dialogue', text: '¡Ven aquí, chiquito!', speakerName: 'Tía' },
      { type: 'idle', duration: 3 },
    ],
  },
]

// tanteScenarios/oncleScenarios utilisent 'Tío'/'Tía' générique.
// Le speakerName affiché à l'écran vient de NPC.name (individualisé ci-dessous).

const cousinScenarios: Scenario[] = [
  {
    id: 'cousin_court', weight: 3, duration: [5, 8],
    steps: [
      { type: 'walk', target: [3, 0, -2] },
      { type: 'walk', target: [-3, 0, 2] },
    ],
  },
  {
    id: 'cousin_cache', weight: 2, duration: [8, 14],
    steps: [
      { type: 'walk', target: [-1, 0, 0.8] },
      { type: 'sit', targetId: 'under-table' },
      { type: 'idle', duration: 6 },
      { type: 'walk', target: [1, 0, 3] },
    ],
  },
  {
    id: 'cousin_console', weight: 2, duration: [15, 25],
    steps: [
      { type: 'walk', target: [3, 0, -4] },
      { type: 'sit', targetId: 'fauteuil' },
      { type: 'idle', duration: 18 },
    ],
  },
  {
    id: 'cousin_interpelle', weight: 2, duration: [4, 7],
    steps: [
      { type: 'dialogue', text: '¡Oye, ven! ¡Te toca!', speakerName: 'Toño' },
      { type: 'walk', target: [2, 0, 2] },
    ],
  },
]

const enfantScenarios: Scenario[] = [
  {
    id: 'enfant_court', weight: 4, duration: [4, 7],
    steps: [
      { type: 'walk', target: [2, 0, -2.5] },
      { type: 'walk', target: [-2, 0, 2] },
      { type: 'walk', target: [5, 0, 4] },
    ],
  },
  {
    id: 'enfant_cache_table', weight: 3, duration: [8, 14],
    steps: [
      { type: 'walk', target: [-0.5, 0, 0.5] },
      { type: 'sit', targetId: 'under-table' },
      { type: 'idle', duration: 6 },
      { type: 'walk', target: [1, 0, 2] },
    ],
  },
  {
    id: 'enfant_pleure', weight: 1, duration: [5, 8],
    steps: [
      { type: 'idle', duration: 2 },
      { type: 'dialogue', text: '¡Mamáaaa!', speakerName: 'Niño' },
      { type: 'walk', target: [-1, 0, 0] },
    ],
  },
  {
    id: 'enfant_joue', weight: 3, duration: [6, 10],
    steps: [
      { type: 'walk', target: [1, 0, 3] },
      { type: 'idle', duration: 5 },
      { type: 'walk', target: [-1, 0, 2.5] },
    ],
  },
]

const oncleJeuneSeatedScenarios: Scenario[] = [
  {
    id: 'oncle_jeune_assis', weight: 5, duration: [15, 25],
    steps: [
      { type: 'sit', targetId: 'table-chair-west-1' },
      { type: 'idle', duration: 12 },
    ],
  },
  {
    id: 'oncle_jeune_rit', weight: 3, duration: [6, 10],
    steps: [
      { type: 'idle', duration: 3 },
      { type: 'dialogue', text: '¡Ja ja, qué bueno!', speakerName: 'Tío Andrés' },
      { type: 'idle', duration: 3 },
    ],
  },
  {
    id: 'oncle_jeune_enfants', weight: 2, duration: [5, 8],
    steps: [
      { type: 'dialogue', text: '¿Dónde están los niños?', speakerName: 'Tío Andrés' },
      { type: 'idle', duration: 4 },
    ],
  },
]

const tanteJeuneSeatedScenarios: Scenario[] = [
  {
    id: 'tante_jeune_assise', weight: 5, duration: [15, 25],
    steps: [
      { type: 'sit', targetId: 'table-chair-west-2' },
      { type: 'idle', duration: 12 },
    ],
  },
  {
    id: 'tante_jeune_appelle', weight: 3, duration: [5, 8],
    steps: [
      { type: 'dialogue', text: '¡Niños, vengan a comer!', speakerName: 'Tía Verónica' },
      { type: 'idle', duration: 4 },
    ],
  },
  {
    id: 'tante_jeune_parle', weight: 2, duration: [8, 14],
    steps: [
      { type: 'sit', targetId: 'table-chair-west-2' },
      { type: 'dialogue', text: '¿Ya viste lo que pasó?', speakerName: 'Tía Verónica' },
      { type: 'idle', duration: 6 },
    ],
  },
]

// ─── Config des 20 NPCs ────────────────────────────────────────────────
// Tier 2 : startPosition = leur chaise de sit target (démarrent là, bougent selon scénario)
// Tier 3 : startPosition avec y=-0.45 (assis dès le spawn — Tier 3 ne passe pas par le lerp Y)

export const familyConfig: NPCConfig[] = [
  // ── Tier 2 — semi-actifs ────────────────────────────────────────────────────────
  {
    id: 'maman', name: 'Mamá Elena', tier: 2,
    startPosition: [-3.05, 0, 2.60],
    waypoints: [],
    scenarios: mamanScenarios,
    meshColor: '#c8956c',
    modelUrl: '/models/characters/base-03.glb',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI,
  },
  {
    id: 'papa', name: 'Papá Carlos', tier: 2,
    startPosition: [-2.05, 0, 2.60],
    waypoints: [],
    scenarios: papaScenarios,
    meshColor: '#8B6543',
    modelUrl: '/models/characters/base-01.glb',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI,
  },
  {
    id: 'oncle1', name: 'Tío Héctor', tier: 2,
    startPosition: [-1.05, 0, 2.60],
    waypoints: [],
    scenarios: oncleScenarios,
    meshColor: '#7A5533',
    modelUrl: '/models/characters/base-01.glb',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI,
  },
  {
    id: 'oncle2', name: 'Tío Ramón', tier: 2,
    startPosition: [-0.05, 0, 2.60],
    waypoints: [],
    scenarios: oncleScenarios,
    meshColor: '#6B4423',
    modelUrl: '/models/characters/base-02.glb',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI,
  },
  {
    id: 'oncle3', name: 'Tío Beto', tier: 2,
    startPosition: [0.95, 0, 2.60],
    waypoints: [],
    scenarios: oncleScenarios,
    meshColor: '#8B6040',
    modelUrl: '/models/characters/base-02.glb',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI,
  },
  {
    id: 'tante1', name: 'Tía Lupita', tier: 2,
    startPosition: [1.95, 0, 2.60],
    waypoints: [],
    scenarios: tanteScenarios,
    meshColor: '#C27B5A',
    modelUrl: '/models/characters/base-03.glb',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI,
  },
  {
    id: 'tante2', name: 'Tía Consuelo', tier: 2,
    startPosition: [2.95, 0, 2.60],
    waypoints: [],
    scenarios: tanteScenarios,
    meshColor: '#B8705A',
    modelUrl: '/models/characters/base-03.glb',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI,
  },
  {
    id: 'enfant4', name: 'Mariana', tier: 3, isChild: true,
    // debout SUR sa chaise (bout est) : y = hauteur d'assise
    startPosition: [4.65, 0.45, 0.60],
    waypoints: [],
    scenarios: [],
    meshColor: '#D4956A',
    rotationY: -Math.PI / 2,  // bout EST de la table → face -x (vers la table)
  },
  // ── Tier 1 — actifs (roaming) ───────────────────────────────────────────────────
  {
    id: 'cousin1', name: 'Toño', tier: 1, isChild: true,
    startPosition: [1, 0, 3],
    waypoints: [[1, 0, 3], [-2, 0, -1], [3, 0, -2], [0, 0, 1]],
    scenarios: cousinScenarios,
    meshColor: '#A87050',
  },
  {
    id: 'cousine1', name: 'Fernanda', tier: 1, isChild: true,
    startPosition: [-1, 0, 2],
    waypoints: [[-1, 0, 2], [2, 0, -1], [-3, 0, 1]],
    scenarios: cousinScenarios,
    meshColor: '#D4906A',
  },
  {
    id: 'cousine2', name: 'Camila', tier: 1, isChild: true,
    startPosition: [2, 0, 2],
    waypoints: [[2, 0, 1], [-1, 0, -2], [1, 0, 3]],
    scenarios: cousinScenarios,
    meshColor: '#C88060',
  },
  {
    id: 'oncle-jeune', name: 'Tío Andrés', tier: 2,
    startPosition: [-4.55, 0, 1.40],
    waypoints: [],
    scenarios: oncleJeuneSeatedScenarios,
    meshColor: '#7B5535',
    modelUrl: '/models/characters/base-01.glb',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI / 2,  // bout OUEST de la table → face +x (vers la table)
  },
  {
    id: 'tante-jeune', name: 'Tía Verónica', tier: 2,
    startPosition: [-4.55, 0, 0.60],
    waypoints: [],
    scenarios: tanteJeuneSeatedScenarios,
    meshColor: '#C07060',
    modelUrl: '/models/characters/base-03.glb',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI / 2,  // bout OUEST de la table → face +x (vers la table)
  },
  {
    id: 'enfant1', name: 'Mateo', tier: 1,
    startPosition: [2, 0, 2],
    waypoints: [[2, 0, 2], [-2, 0, -1], [1, 0, -2], [3, 0, 1]],
    scenarios: enfantScenarios,
    meshColor: '#D4906A',
  },
  {
    id: 'enfant2', name: 'Valentina', tier: 1,
    startPosition: [-1, 0, 3],
    waypoints: [[-1, 0, 3], [2, 0, -2], [0, 0, 1]],
    scenarios: enfantScenarios,
    meshColor: '#E0A080',
  },
  {
    id: 'enfant3', name: 'Diego', tier: 1,
    startPosition: [3, 0, -1.5],
    waypoints: [[3, 0, -1], [-1, 0, 2], [1, 0, -3]],
    scenarios: enfantScenarios,
    meshColor: '#C88050',
  },
  // ── Tier 3 — statiques ──────────────────────────────────────────────────────────
  {
    id: 'soeur', name: 'Sofía', tier: 3, isChild: true,
    // debout SUR sa chaise (rangée sud) : y = hauteur d'assise
    startPosition: [1.95, 0.45, -0.60],
    waypoints: [],
    scenarios: [],
    meshColor: '#E0A888',
  },
  {
    id: 'grande-tante', name: 'Tía Abuela Rosa', tier: 3,  // assoupie dans le fauteuil du buffet
    startPosition: [-6.42, 0, -0.6],   // fauteuil ouest — sa chaise de table (x=3.95 nord) est vide
    waypoints: [],
    scenarios: [],
    meshColor: '#A88068',
    modelUrl: '/models/characters/base-04.glb',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI / 2,  // fauteuil face est (+x) — idle "dort" à venir
  },
]
