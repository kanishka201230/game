// Path and Maze Network Configuration for 3D Forest Escape Game

// Far-end initial spawn coordinates near final doors (Door A: Moon Gate and Door B: Sun Gate)
export const ATTACKER_INITIAL_SPAWN = [-30, 1.8, -130];

// Configurable Hand Gesture Movement Speed (~40-50% of normal keyboard speed for slow, smooth control)
// Default: 4.0 units/sec (Normal keyboard walk speed is 9.0)
export const GESTURE_MOVE_SPEED = 4.0;

export const PATH_SEGMENTS = [
  // 1. Start Entrance Segment (Spawn at [0, 12])
  { id: 's_start', p1: [0, 16], p2: [0, -10], radius: 3.5 },

  // 2. Turn 1 & Split at Junction 1 (-20, -10)
  { id: 's_turn1', p1: [0, -10], p2: [-20, -10], radius: 3.5 },

  // Branch 1A (Left Branch -> Riddle Door 1 -> Reconnects to J2)
  { id: 's_j1_left_up', p1: [-20, -10], p2: [-20, 10], radius: 3.5 },
  { id: 's_j1_left_top', p1: [-20, 10], p2: [-35, 10], radius: 3.5 },
  { id: 's_j1_left_down1', p1: [-35, 10], p2: [-35, -30], radius: 3.5 },
  // Requires Door 1 (Riddle Door at -35, -30)
  { id: 's_j1_left_down2', p1: [-35, -30], p2: [-35, -60], radius: 3.5, requiredDoor: 'door1' },
  { id: 's_j1_left_reconnect', p1: [-35, -60], p2: [0, -60], radius: 3.5, requiredDoor: 'door1' },

  // Branch 1B (Right Branch -> Cursed Trap Door 2)
  { id: 's_j1_right_east', p1: [0, -10], p2: [25, -10], radius: 3.5 },
  { id: 's_j1_right_down', p1: [25, -10], p2: [25, -35], radius: 3.5 },
  // Behind Trap Door 2
  { id: 's_j1_right_trap', p1: [25, -35], p2: [25, -55], radius: 3.8, requiredDoor: 'door2' },

  // Branch 1C (Main Center Path through Door 3 to J2)
  { id: 's_j1_main_down1', p1: [-20, -10], p2: [-20, -40], radius: 3.5 },
  { id: 's_j1_main_east', p1: [-20, -40], p2: [-10, -40], radius: 3.5 },
  // Requires Door 3 (Ancient Gate 1 at -10, -40)
  { id: 's_j1_main_down2', p1: [-10, -40], p2: [0, -40], radius: 3.5, requiredDoor: 'door3' },
  { id: 's_j1_main_to_reconnect', p1: [0, -40], p2: [0, -60], radius: 3.5, requiredDoor: 'door3' },
  // Reconnection trunk from z = -60 to J2 (accessible from Door 1 or Door 3)
  { id: 's_reconnect_to_j2', p1: [0, -60], p2: [0, -70], radius: 3.5 },

  // 3. Segment J2 -> J3 (Final Junction at z = -95)
  { id: 's_j2_to_j3', p1: [0, -70], p2: [0, -95], radius: 3.5 },

  // 4. Final Junction J3 (at z = -95) -> TWO CONFUSING DOORS ON SEPARATE BRANCHES
  // Left Branch -> Door A (Ancient Moon Gate) -> Golden Trophy Shrine
  { id: 's_j3_left_east', p1: [0, -95], p2: [-30, -95], radius: 3.5 },
  { id: 's_j3_left_down1', p1: [-30, -95], p2: [-30, -140], radius: 3.5 },
  // Behind Moon Gate Door A (-30, -140)
  { id: 's_j3_left_down2', p1: [-30, -140], p2: [-30, -170], radius: 3.5, requiredDoor: 'doorA' },
  { id: 's_j3_trophy', p1: [-30, -170], p2: [-30, -182], radius: 5.0, requiredDoor: 'doorA' }, // Trophy Shrine

  // Right Branch -> Door B (Ancient Sun Gate) -> Penalty Trap Pit
  { id: 's_j3_right_east', p1: [0, -95], p2: [30, -95], radius: 3.5 },
  { id: 's_j3_right_down1', p1: [30, -95], p2: [30, -140], radius: 3.5 },
  // Behind Sun Gate Door B (30, -140)
  { id: 's_j3_right_down2', p1: [30, -140], p2: [30, -165], radius: 4.2, requiredDoor: 'doorB' }, // Trap Pit
];

// Hidden Collectible Clues scattered on walkable forest paths
export const CLUES_CONFIG = [
  {
    id: 'clue1',
    name: 'Rune of Whispers',
    route: 'Left Route (Route 1)',
    digit: '4',
    order: 1,
    position: [-33, 0.4, -10],
    description: 'An ancient turquoise runestone revealing the 1st passcode digit: 4'
  },
  {
    id: 'clue2',
    name: 'Shadow Tablet',
    route: 'Right Route (Route 2)',
    digit: '7',
    order: 2,
    position: [23, 0.4, -22],
    description: 'A glowing etched stone tablet revealing the 2nd passcode digit: 7'
  },
  {
    id: 'clue3',
    name: 'Ancient Moon Scroll',
    route: 'Center Route (Route 3)',
    digit: '2',
    order: 3,
    position: [-15, 0.4, -38],
    description: 'An enchanted floating parchment revealing the 3rd passcode digit: 2'
  }
];

export const DOORS_CONFIG = [
  {
    id: 'door1',
    name: 'Left Riddle Gate',
    branch: 'Left Branch (Route 1)',
    position: [-35, 0, -30],
    rotation: [0, 0, 0],
    type: 'riddle',
    question: "What has keys but cannot open locks?",
    options: [
      { text: 'A Treasure Chest', correct: false },
      { text: 'A Piano', correct: true, clue: 'CLUE DISCOVERED: At the final split, the MOON GATE leads to the Trophy Shrine!' },
      { text: 'A Door', correct: false },
      { text: 'A Map', correct: false }
    ],
    successMessage: 'Left Riddle Gate Unlocked! The Left Branch continues.'
  },
  {
    id: 'door2',
    name: 'Right Shadow Gate',
    branch: 'Right Branch (Route 2)',
    position: [25, 0, -35],
    rotation: [0, 0, 0],
    type: 'riddle',
    question: "How many distinct branching routes split from the entrance junction of this forest maze?",
    options: [
      { text: 'Two Routes', correct: false },
      { text: 'Three Routes', correct: true, clue: 'CLUE DISCOVERED: Beware the Sun Gate—it conceals a deadly dead-end trap!' },
      { text: 'Four Routes', correct: false },
      { text: 'Five Routes', correct: false }
    ],
    successMessage: 'Right Shadow Gate Unlocked! The Right Branch continues.'
  },
  {
    id: 'door3',
    name: 'Center Ancient Gate',
    branch: 'Center Branch (Route 3)',
    position: [-10, 0, -40],
    rotation: [0, Math.PI / 2, 0],
    type: 'riddle',
    question: "What is the safest action when you encounter a locked gate?",
    options: [
      { text: 'Run through it', correct: false },
      { text: 'Ignore the rules', correct: false },
      { text: 'Inspect it and solve its riddle', correct: true, clue: 'CLUE DISCOVERED: The Golden Trophy waits in the northern sanctuary!' },
      { text: 'Jump through the wall', correct: false }
    ],
    successMessage: 'Center Ancient Gate Unlocked! The Center Branch continues.'
  },
  {
    id: 'doorA',
    name: 'Ancient Moon Gate (Final Door)',
    branch: 'Final Split - Left Exit',
    position: [-30, 0, -140],
    rotation: [0, 0, 0],
    type: 'passcode',
    passcode: '472',
    question: "Celestial Moon Gate: 'Enter the 3-digit secret passcode revealed by the hidden forest runes.'",
    isCorrectExit: true,
    successMessage: 'Ancient Moon Gate Unlocked! The path to the Golden Trophy Sanctuary is open!'
  },
  {
    id: 'doorB',
    name: 'Cursed Sun Gate (Right)',
    branch: 'Final Split - Right Exit',
    position: [30, 0, -140],
    rotation: [0, 0, 0],
    type: 'trap',
    question: "The Sun Gate radiates burning heat: 'Dare you breach the forbidden Sun Gate into the unknown?'",
    options: [
      { text: 'Force the doors open', correct: false },
      { text: 'Step through into the light', correct: false },
      { text: 'Shatter the rusted seal', correct: false },
      { text: 'Turn back to the Moon Gate', correct: true, clue: 'You wisely stepped back! Choose the Moon Gate!' }
    ],
    isCorrectExit: false,
    message: 'WARNING: You triggered the Cursed Sun Gate trap!'
  }
];

// Calculate distance from point (px, pz) to segment (ax, az) -> (bx, bz)
export function pointToSegmentDistance(px, pz, ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  const lenSq = dx * dx + dz * dz;
  if (lenSq === 0) return { dist: Math.hypot(px - ax, pz - az), projX: ax, projZ: az, segDx: 0, segDz: 0 };

  let t = ((px - ax) * dx + (pz - az) * dz) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = ax + t * dx;
  const projZ = az + t * dz;
  const len = Math.sqrt(lenSq);
  return { dist: Math.hypot(px - projX, pz - projZ), projX, projZ, segDx: dx / len, segDz: dz / len };
}

// Strict Walkability Validator: Checks if (x, z) is within allowed path radius
export function getClosestPathPosition(px, pz, unlockedDoors = {}) {
  const margin = 0.2; // Generous walkable path radius while keeping player on dirt path
  let minDistance = Infinity;
  let bestClampedX = px;
  let bestClampedZ = pz;
  let bestNormalX = 0;
  let bestNormalZ = 0;
  let bestSegDx = 0;
  let bestSegDz = -1;

  for (const seg of PATH_SEGMENTS) {
    if (seg.requiredDoor && !unlockedDoors[seg.requiredDoor]) {
      continue;
    }

    const walkRadius = seg.radius - margin;
    const { dist, projX, projZ, segDx, segDz } = pointToSegmentDistance(
      px, pz,
      seg.p1[0], seg.p1[1],
      seg.p2[0], seg.p2[1]
    );

    if (dist <= walkRadius) {
      return { isOnPath: true, clampedX: px, clampedZ: pz, normalX: 0, normalZ: 0, segDx, segDz };
    }

    if (dist < minDistance) {
      minDistance = dist;
      bestSegDx = segDx;
      bestSegDz = segDz;
      const angle = Math.atan2(pz - projZ, px - projX);
      bestNormalX = Math.cos(angle);
      bestNormalZ = Math.sin(angle);
      bestClampedX = projX + bestNormalX * walkRadius;
      bestClampedZ = projZ + bestNormalZ * walkRadius;
    }
  }

  return { isOnPath: false, clampedX: bestClampedX, clampedZ: bestClampedZ, normalX: bestNormalX, normalZ: bestNormalZ, segDx: bestSegDx, segDz: bestSegDz };
}

// Strict Gate Physical & Kinematic Collision Barriers
// Stops the player completely at locked gates even when holding W, running, or moving diagonally
export const GATE_COLLISION_BARRIERS = [
  {
    id: 'door1',
    name: 'Left Riddle Gate',
    // Gate at [-35, 0, -30], rotation 0 (blocks Z <= -28.6 from approach side z > -30)
    check: (x, z, vx, vz) => {
      if (vz !== undefined && vz > 0.01) return false; // Moving backward away from gate
      return Math.abs(x - (-35)) <= 3.8 && z <= -28.6 && z >= -34.5;
    },
    barrierAxis: 'z',
    stopX: null,
    stopZ: -28.5,
  },
  {
    id: 'door2',
    name: 'Right Shadow Gate',
    // Gate at [25, 0, -35], rotation 0 (blocks Z <= -33.6 from approach side z > -35)
    check: (x, z, vx, vz) => {
      if (vz !== undefined && vz > 0.01) return false; // Moving backward away from gate
      return Math.abs(x - 25) <= 3.8 && z <= -33.6 && z >= -39.5;
    },
    barrierAxis: 'z',
    stopX: null,
    stopZ: -33.5,
  },
  {
    id: 'door3',
    name: 'Center Ancient Gate',
    // Gate at [-10, 0, -40], rotation PI/2 (blocks X >= -11.5 from approach side x < -10)
    check: (x, z, vx, vz) => {
      if (vx !== undefined && vx < -0.01) return false; // Moving westward away from gate
      return Math.abs(z - (-40)) <= 3.8 && x >= -11.5 && x <= -5.5;
    },
    barrierAxis: 'x',
    stopX: -11.6,
    stopZ: null,
  },
  {
    id: 'doorA',
    name: 'Ancient Moon Gate (Final Door)',
    // Gate at [-30, 0, -140], rotation 0 (blocks Z <= -138.6 from approach side z > -140)
    check: (x, z, vx, vz) => {
      if (vz !== undefined && vz > 0.01) return false; // Moving backward away from gate
      return Math.abs(x - (-30)) <= 3.8 && z <= -138.6 && z >= -144.5;
    },
    barrierAxis: 'z',
    stopX: null,
    stopZ: -138.5,
  },
  {
    id: 'doorB',
    name: 'Cursed Sun Gate (Right)',
    // Gate at [30, 0, -140], rotation 0 (blocks Z <= -138.6 from approach side z > -140)
    check: (x, z, vx, vz) => {
      if (vz !== undefined && vz > 0.01) return false; // Moving backward away from gate
      return Math.abs(x - 30) <= 3.8 && z <= -138.6 && z >= -144.5;
    },
    barrierAxis: 'z',
    stopX: null,
    stopZ: -138.5,
  }
];

export function checkGateCollision(x, z, unlockedDoors = {}, vx, vz) {
  for (const gate of GATE_COLLISION_BARRIERS) {
    if (!unlockedDoors[gate.id]) {
      if (gate.check(x, z, vx, vz)) {
        return { isBlocked: true, gate };
      }
    }
  }
  return { isBlocked: false, gate: null };
}
