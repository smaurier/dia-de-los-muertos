// src/scene/living-room/familyConfig.ts
import type { NPCConfig, Scenario } from '../../game/systems/npcSystem'

// ─── Scenarios by type ────────────────────────────────────────────────

const momScenarios: Scenario[] = [
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
      { type: 'walk', target: [-2.5, 0, 4.6] },  // in front of kitchen arch (north wall)
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

const dadScenarios: Scenario[] = [
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

const uncleScenarios: Scenario[] = [
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

// uncleScenarios use generic 'Tío' — the system displays NPC.name at runtime

const auntScenarios: Scenario[] = [
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

// auntScenarios/uncleScenarios use generic 'Tío'/'Tía'.
// The speakerName shown on screen comes from NPC.name (individualized below).

const youngUncleSeatedScenarios: Scenario[] = [
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

const youngAuntSeatedScenarios: Scenario[] = [
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

// ─── Config for 20 NPCs ───────────────────────────────────────────────
// Tier 2: startPosition = their sit-target chair (spawn there, move per scenario)
// Tier 3: startPosition with y=-0.45 (seated from spawn — Tier 3 skips Y lerp)

export const familyConfig: NPCConfig[] = [
  // ── Tier 2 — semi-active ────────────────────────────────────────────────────────
  {
    id: 'maman', name: 'Mamá Elena', tier: 2,
    startPosition: [-3.05, 0, 2.60],
    waypoints: [],
    scenarios: momScenarios,
    meshColor: '#c8956c',
    modelUrl: '/models/characters/base-03.glb?v=3',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI,
  },
  {
    id: 'papa', name: 'Papá Carlos', tier: 2,
    startPosition: [-2.05, 0, 2.60],
    waypoints: [],
    scenarios: dadScenarios,
    meshColor: '#8B6543',
    modelUrl: '/models/characters/base-01.glb?v=3',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI,
  },
  {
    id: 'oncle1', name: 'Tío Héctor', tier: 2,
    startPosition: [-1.05, 0, 2.60],
    waypoints: [],
    scenarios: uncleScenarios,
    meshColor: '#7A5533',
    modelUrl: '/models/characters/base-01.glb?v=3',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI,
  },
  {
    id: 'oncle2', name: 'Tío Ramón', tier: 2,
    startPosition: [-0.05, 0, 2.60],
    waypoints: [],
    scenarios: uncleScenarios,
    meshColor: '#6B4423',
    modelUrl: '/models/characters/base-02.glb?v=3',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI,
  },
  {
    id: 'oncle3', name: 'Tío Beto', tier: 2,
    startPosition: [0.95, 0, 2.60],
    waypoints: [],
    scenarios: uncleScenarios,
    meshColor: '#8B6040',
    modelUrl: '/models/characters/base-02.glb?v=3',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI,
  },
  {
    id: 'tante1', name: 'Tía Lupita', tier: 2,
    startPosition: [1.95, 0, 2.60],
    waypoints: [],
    scenarios: auntScenarios,
    meshColor: '#C27B5A',
    modelUrl: '/models/characters/base-03.glb?v=3',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI,
  },
  {
    id: 'tante2', name: 'Tía Consuelo', tier: 2,
    startPosition: [2.95, 0, 2.60],
    waypoints: [],
    scenarios: auntScenarios,
    meshColor: '#B8705A',
    modelUrl: '/models/characters/base-03.glb?v=3',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI,
  },
  {
    id: 'enfant4', name: 'Mariana', tier: 3, isChild: true,
    // standing ON her chair (east end): y = seat height
    startPosition: [4.65, 0.45, 0.60],
    waypoints: [],
    scenarios: [],
    meshColor: '#D4956A',
    rotationY: -Math.PI / 2,  // east END of table → facing -x (toward table)
  },
  // ── Tier 1 — active (roaming) ───────────────────────────────────────────────────
  {
    id: 'cousin1', name: 'Toño', tier: 3, isChild: true,
    // standing ON his chair (south row): y = seat height
    startPosition: [-3.05, 0.45, -0.60],
    waypoints: [],
    scenarios: [],
    meshColor: '#A87050',
  },
  {
    id: 'cousine1', name: 'Fernanda', tier: 3, isChild: true,
    // standing ON her chair (south row): y = seat height
    startPosition: [-2.05, 0.45, -0.60],
    waypoints: [],
    scenarios: [],
    meshColor: '#D4906A',
  },
  {
    id: 'cousine2', name: 'Camila', tier: 3, isChild: true,
    // standing ON her chair (south row): y = seat height
    startPosition: [-1.05, 0.45, -0.60],
    waypoints: [],
    scenarios: [],
    meshColor: '#C88060',
  },
  {
    id: 'oncle-jeune', name: 'Tío Andrés', tier: 2,
    startPosition: [-4.55, 0, 1.40],
    waypoints: [],
    scenarios: youngUncleSeatedScenarios,
    meshColor: '#7B5535',
    modelUrl: '/models/characters/base-01.glb?v=3',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI / 2,  // WEST end of table → facing +x (toward table)
  },
  {
    id: 'tante-jeune', name: 'Tía Verónica', tier: 2,
    startPosition: [-4.55, 0, 0.60],
    waypoints: [],
    scenarios: youngAuntSeatedScenarios,
    meshColor: '#C07060',
    modelUrl: '/models/characters/base-03.glb?v=3',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI / 2,  // WEST end of table → facing +x (toward table)
  },
  {
    id: 'enfant1', name: 'Mateo', tier: 3, isChild: true,
    // standing ON his chair (south row): y = seat height
    startPosition: [-0.05, 0.45, -0.60],
    waypoints: [],
    scenarios: [],
    meshColor: '#D4906A',
  },
  {
    id: 'enfant2', name: 'Valentina', tier: 3, isChild: true,
    // standing ON her chair (south row): y = seat height
    startPosition: [0.95, 0.45, -0.60],
    waypoints: [],
    scenarios: [],
    meshColor: '#E0A080',
  },
  {
    id: 'enfant3', name: 'Diego', tier: 3, isChild: true,
    // standing ON his chair (south row): y = seat height
    startPosition: [2.95, 0.45, -0.60],
    waypoints: [],
    scenarios: [],
    meshColor: '#C88050',
  },
  // ── Tier 3 — static ────────────────────────────────────────────────────────────
  {
    id: 'soeur', name: 'Sofía', tier: 3, isChild: true,
    // standing ON her chair (south row): y = seat height
    startPosition: [1.95, 0.45, -0.60],
    waypoints: [],
    scenarios: [],
    meshColor: '#E0A888',
  },
  {
    id: 'grande-tante', name: 'Tía Abuela Rosa', tier: 3,  // dozing in the sideboard armchair
    startPosition: [-6.42, 0, -0.6],   // west armchair — her table chair (x=3.95 north) is empty
    waypoints: [],
    scenarios: [],
    meshColor: '#A88068',
    modelUrl: '/models/characters/base-04.glb?v=3',
    clipIdle: 'Sitting Idle(4)',
    rotationY: Math.PI / 2,  // armchair faces east (+x) — "sleeping" idle to come
  },
]
