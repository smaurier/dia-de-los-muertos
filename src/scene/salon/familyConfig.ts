// src/scene/salon/familyConfig.ts
import type { NPCConfig, Scenario } from '../../game/systems/npcSystem'

// ─── Scénarios par type ────────────────────────────────────────────────

const mamanScenarios: Scenario[] = [
  {
    id: 'maman_sert', weight: 3, duration: [8, 15],
    steps: [
      { type: 'walk', target: [-1, 0, -3] },
      { type: 'dialogue', text: '¿Alguien quiere más?', speakerName: 'Mamá' },
      { type: 'idle', duration: 4 },
      { type: 'walk', target: [-1, 0, 2.5] },  // z=1 était dans la table AABB → z=2.5 (nord de la table)
    ],
  },
  {
    id: 'maman_cuisine', weight: 2, duration: [10, 18],
    steps: [
      { type: 'dialogue', text: 'Voy a la cocina un momento.', speakerName: 'Mamá' },
      { type: 'walk', target: [1, 0, -4.5] },
      { type: 'idle', duration: 6 },
      { type: 'walk', target: [-5.5, 0, 0] },  // z=0 était dans la table → contourne par l'ouest
    ],
  },
  {
    id: 'maman_assise', weight: 4, duration: [12, 20],
    steps: [
      { type: 'sit', targetId: 'table-chair-1' },
      { type: 'idle', duration: 10 },
      { type: 'dialogue', text: '¡Ven a comer, mijo!', speakerName: 'Mamá' },
    ],
  },
  {
    id: 'maman_embrasse', weight: 1, duration: [5, 8],
    steps: [
      { type: 'walk', target: [0, 0, 2] },
      { type: 'dialogue', text: '¿Estás bien, mi amor?', speakerName: 'Mamá' },
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
      { type: 'dialogue', text: '¡Qué buena está la comida!', speakerName: 'Papá' },
    ],
  },
  {
    id: 'papa_debout', weight: 2, duration: [8, 12],
    steps: [
      { type: 'walk', target: [-3, 0, -2.5] },  // z=-1 → z=-2.5 (sud de la table)
      { type: 'dialogue', text: '¿Otro tequila, cuñado?', speakerName: 'Papá' },
      { type: 'idle', duration: 4 },
      { type: 'walk', target: [-1.5, 0, 2.5] }, // z=0.5 → z=2.5 (nord de la table)
    ],
  },
  {
    id: 'papa_tv', weight: 1, duration: [10, 15],
    steps: [
      { type: 'walk', target: [2, 0, 3.5] },
      { type: 'idle', duration: 8 },
      { type: 'dialogue', text: '¡Gol! ¡Gol!', speakerName: 'Papá' },
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
      { type: 'walk', target: [-1, 0, -2.5] },  // z=0 → z=-2.5 (côté sud, hors table)
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
      { type: 'walk', target: [-0.5, 0, -2.5] },  // z=0.5 → z=-2.5 (retour côté sud)
    ],
  },
  {
    id: 'tante_enfant', weight: 2, duration: [6, 10],
    steps: [
      { type: 'walk', target: [0, 0, 2.5] },  // z=1 → z=2.5 (nord de la table)
      { type: 'dialogue', text: '¡Ven aquí, chiquito!', speakerName: 'Tía' },
      { type: 'idle', duration: 3 },
    ],
  },
]

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
      { type: 'walk', target: [3, 0, 4] },
      { type: 'sit', targetId: 'fauteuil' },
      { type: 'idle', duration: 18 },
    ],
  },
  {
    id: 'cousin_interpelle', weight: 2, duration: [4, 7],
    steps: [
      { type: 'dialogue', text: '¡Oye, ven! ¡Te toca!', speakerName: 'Primo' },
      { type: 'walk', target: [2, 0, 2] },
    ],
  },
]

const enfantScenarios: Scenario[] = [
  {
    id: 'enfant_court', weight: 4, duration: [4, 7],
    steps: [
      { type: 'walk', target: [2, 0, -2.5] },  // z=-1 → z=-2.5
      { type: 'walk', target: [-2, 0, 2] },
      { type: 'walk', target: [5, 0, 4] },      // z=0 → zone canapé/TV (loin de la table)
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
      { type: 'walk', target: [-1, 0, 2.5] },  // z=1 → z=2.5 (nord de la table)
    ],
  },
]

const oncleJeuneScenarios: Scenario[] = [
  ...oncleScenarios,
  {
    id: 'oncle_jeune_enfant', weight: 3, duration: [6, 10],
    steps: [
      { type: 'walk', target: [1, 0, 2] },
      { type: 'dialogue', text: '¡Oye! ¿A dónde vas tan rápido?', speakerName: 'Tío Joven' },
      { type: 'idle', duration: 3 },
    ],
  },
]

// ─── Config des 20 NPCs ────────────────────────────────────────────────

export const familyConfig: NPCConfig[] = [
  // Tier 2 — semi-actifs
  {
    id: 'maman', name: 'Mamá', tier: 2,
    startPosition: [-1, 0, 1.5],
    waypoints: [[-1, 0, 1.5], [-1, 0, -2], [1, 0, -4.5]],
    scenarios: mamanScenarios,
    meshColor: '#c8956c',
  },
  {
    id: 'papa', name: 'Papá', tier: 2,
    startPosition: [-1.5, 0, 1.5],
    waypoints: [[-1.5, 0, 1.5], [-3, 0, 2], [2, 0, 3.5]],
    scenarios: papaScenarios,
    meshColor: '#8B6543',
  },
  {
    id: 'oncle1', name: 'Tío Carlos', tier: 2,
    startPosition: [-3, 0, 1.5],
    waypoints: [[-3, 0, 1.5], [-4, 0, 2.5], [-1, 0, 1.5]],
    scenarios: oncleScenarios,
    meshColor: '#7A5533',
  },
  {
    id: 'oncle2', name: 'Tío Roberto', tier: 2,
    startPosition: [1, 0, -1.5],
    waypoints: [[1, 0, -1.5], [-1, 0, -2.5], [0, 0, -1.5]],
    scenarios: oncleScenarios,
    meshColor: '#6B4423',
  },
  {
    id: 'oncle3', name: 'Tío Miguel', tier: 2,
    startPosition: [-2, 0, 1.5],
    waypoints: [[-2, 0, 1.5], [-3, 0, 2.5], [-1, 0, 1.5]],
    scenarios: oncleScenarios,
    meshColor: '#8B6040',
  },
  {
    id: 'tante1', name: 'Tía Rosa', tier: 2,
    startPosition: [0, 0, -1.5],
    waypoints: [[0, 0, -1.5], [0, 0, -4], [-1, 0, 0]],
    scenarios: tanteScenarios,
    meshColor: '#C27B5A',
  },
  {
    id: 'tante2', name: 'Tía Elena', tier: 2,
    startPosition: [-2, 0, -1.5],
    waypoints: [[-2, 0, -1.5], [-1, 0, 1.5], [0, 0, -2.5]],
    scenarios: tanteScenarios,
    meshColor: '#B8705A',
  },
  {
    id: 'enfant4', name: 'Niño', tier: 2,
    startPosition: [0, 0, 1.5],
    waypoints: [[0, 0, 1]],
    scenarios: [{ id: 'enfant4_sage', weight: 1, duration: [20, 30], steps: [{ type: 'sit', targetId: 'table-chair-5' }, { type: 'idle', duration: 20 }] }],
    meshColor: '#D4956A',
  },
  // Tier 1 — actifs
  {
    id: 'cousin1', name: 'Primo Diego', tier: 1,
    startPosition: [1, 0, 3],
    waypoints: [[1, 0, 3], [-2, 0, -1], [3, 0, -2], [0, 0, 1]],
    scenarios: cousinScenarios,
    meshColor: '#A87050',
  },
  {
    id: 'cousine1', name: 'Prima Sofía', tier: 1,
    startPosition: [-1, 0, 2],
    waypoints: [[-1, 0, 2], [2, 0, -1], [-3, 0, 1]],
    scenarios: cousinScenarios,
    meshColor: '#D4906A',
  },
  {
    id: 'cousine2', name: 'Prima Valentina', tier: 1,
    startPosition: [2, 0, 2],
    waypoints: [[2, 0, 1], [-1, 0, -2], [1, 0, 3]],
    scenarios: cousinScenarios,
    meshColor: '#C88060',
  },
  {
    id: 'oncle-jeune', name: 'Tío Joven', tier: 1,
    startPosition: [0, 0, -2],
    waypoints: [[0, 0, -2], [1, 0, 2], [-2, 0, 1], [-1, 0, -3]],
    scenarios: oncleJeuneScenarios,
    meshColor: '#7B5535',
  },
  {
    id: 'tante-jeune', name: 'Tía Joven', tier: 1,
    startPosition: [1, 0, -1.5],
    waypoints: [[1, 0, -1.5], [0, 0, 2], [-1, 0, -3]],
    scenarios: tanteScenarios,
    meshColor: '#C07060',
  },
  {
    id: 'enfant1', name: 'Niño', tier: 1,
    startPosition: [2, 0, 2],
    waypoints: [[2, 0, 2], [-2, 0, -1], [1, 0, -2], [3, 0, 1]],
    scenarios: enfantScenarios,
    meshColor: '#D4906A',
  },
  {
    id: 'enfant2', name: 'Niña', tier: 1,
    startPosition: [-1, 0, 3],
    waypoints: [[-1, 0, 3], [2, 0, -2], [0, 0, 1]],
    scenarios: enfantScenarios,
    meshColor: '#E0A080',
  },
  {
    id: 'enfant3', name: 'Niño', tier: 1,
    startPosition: [3, 0, -1.5],
    waypoints: [[3, 0, -1], [-1, 0, 2], [1, 0, -3]],
    scenarios: enfantScenarios,
    meshColor: '#C88050',
  },
  // Tier 3 — statiques
  {
    id: 'soeur1', name: 'Hermana', tier: 3,
    startPosition: [-0.5, 0, 1.5],
    waypoints: [],
    scenarios: [],
    meshColor: '#E0A888',
  },
  {
    id: 'soeur2', name: 'Hermana', tier: 3,
    startPosition: [0.5, 0, 1.5],
    waypoints: [],
    scenarios: [],
    meshColor: '#E8B090',
  },
  {
    id: 'grande-tante', name: 'Tía Abuela', tier: 3,
    startPosition: [-5.5, 0, -3],
    waypoints: [],
    scenarios: [],
    meshColor: '#A88068',
  },
  {
    id: 'bebe', name: 'Bebé', tier: 3,
    startPosition: [-0.8, 0, 1.5],
    waypoints: [],
    scenarios: [],
    meshColor: '#F0C0A0',
  },
]
