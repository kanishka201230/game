// Path and Maze Network Configuration for 3D Forest Escape Game

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
  { id: 's_j1_main_to_j2', p1: [0, -40], p2: [0, -70], radius: 3.5, requiredDoor: 'door3' },

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

export const DOORS_CONFIG = [
  {
    id: 'door1',
    name: 'Ancient Riddle Gate',
    position: [-35, 0, -30],
    rotation: [0, 0, 0],
    type: 'riddle',
    question: 'Riddle of the Elders: Which gate leads to the Golden Trophy at the final junction?',
    options: [
      { text: 'The Moon Gate on the Left Branch', correct: true, clue: 'CLUE DISCOVERED: Choose the MOON GATE at the final junction!' },
      { text: 'The Sun Gate on the Right Branch', correct: false },
      { text: 'Neither, both lead to traps', correct: false }
    ]
  },
  {
    id: 'door2',
    name: 'Cursed Iron Gate',
    position: [25, 0, -35],
    rotation: [0, 0, 0],
    type: 'trap',
    message: 'WARNING: You unlocked a Cursed Trap Door! The path leads to a dead end.'
  },
  {
    id: 'door3',
    name: 'Ancient Forest Gate',
    position: [-10, 0, -40],
    rotation: [0, Math.PI / 2, 0],
    type: 'standard',
    message: 'Ancient Gate Unlocked!'
  },
  {
    id: 'doorA',
    name: 'Ancient Moon Gate (Left)',
    position: [-30, 0, -140],
    rotation: [0, 0, 0],
    type: 'final_moon',
    isCorrectExit: true
  },
  {
    id: 'doorB',
    name: 'Ancient Sun Gate (Right)',
    position: [30, 0, -140],
    rotation: [0, 0, 0],
    type: 'final_sun',
    isCorrectExit: false
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
  let minDistance = Infinity;
  let bestX = px;
  let bestZ = pz;
  let bestSegDx = 0;
  let bestSegDz = -1;
  let isOnPath = false;

  for (const seg of PATH_SEGMENTS) {
    if (seg.requiredDoor && !unlockedDoors[seg.requiredDoor]) {
      continue;
    }

    const { dist, projX, projZ, segDx, segDz } = pointToSegmentDistance(
      px, pz,
      seg.p1[0], seg.p1[1],
      seg.p2[0], seg.p2[1]
    );

    if (dist <= seg.radius) {
      isOnPath = true;
      return { isOnPath: true, clampedX: px, clampedZ: pz, segDx, segDz };
    }

    if (dist < minDistance) {
      minDistance = dist;
      bestSegDx = segDx;
      bestSegDz = segDz;
      const angle = Math.atan2(pz - projZ, px - projX);
      bestX = projX + Math.cos(angle) * (seg.radius - 0.2);
      bestZ = projZ + Math.sin(angle) * (seg.radius - 0.2);
    }
  }

  return { isOnPath, clampedX: bestX, clampedZ: bestZ, segDx: bestSegDx, segDz: bestSegDz };
}
