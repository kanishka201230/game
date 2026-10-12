import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import * as THREE from "three";
import { getClosestPathPosition, checkGateCollision, ATTACKER_INITIAL_SPAWN, GESTURE_MOVE_SPEED } from "./pathConfig";

// Configurable Hand Gesture Movement Speed for Attacker (~40-50% of normal speed)
export { GESTURE_MOVE_SPEED };

function AttackerModel({ attackerRef }) {
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    let speed = 0;
    if (attackerRef.current) {
      const vel = attackerRef.current.linvel();
      speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
    }
    
    if (speed > 0.5) {
      const swing = Math.sin(t * 14) * 0.75;
      leftArmRef.current.rotation.x = -swing;
      rightArmRef.current.rotation.x = swing;
      leftLegRef.current.rotation.x = swing;
      rightLegRef.current.rotation.x = -swing;
    } else {
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.15);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.15);
      leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.15);
      rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.15);
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* Horned Shadow Helm */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <boxGeometry args={[0.36, 0.36, 0.36]} />
        <meshStandardMaterial color="#0f1115" roughness={0.25} metalness={0.85} />
      </mesh>
      {/* Left Horn */}
      <mesh position={[-0.18, 1.84, 0.02]} rotation={[0.2, 0, 0.4]} castShadow>
        <coneGeometry args={[0.06, 0.3, 5]} />
        <meshStandardMaterial color="#1f0710" roughness={0.3} />
      </mesh>
      {/* Right Horn */}
      <mesh position={[0.18, 1.84, 0.02]} rotation={[0.2, 0, -0.4]} castShadow>
        <coneGeometry args={[0.06, 0.3, 5]} />
        <meshStandardMaterial color="#1f0710" roughness={0.3} />
      </mesh>
      
      {/* Glowing Menacing Red Eyes */}
      <mesh position={[0, 1.66, 0.17]} castShadow>
        <boxGeometry args={[0.26, 0.06, 0.05]} />
        <meshStandardMaterial color="#ff1744" emissive="#ff0033" emissiveIntensity={4.5} />
      </mesh>
      
      {/* Heavy Obsidian Void Plate Torso */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <boxGeometry args={[0.58, 0.74, 0.38]} />
        <meshStandardMaterial color="#16121b" roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Chest Void Sigil (Pulsing dark crimson rune) */}
      <mesh position={[0, 1.2, 0.2]} castShadow>
        <octahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial color="#ff1744" emissive="#d50000" emissiveIntensity={3} />
      </mesh>

      {/* Left Arm (Spiked Pauldron & Void Claws) */}
      <group position={[-0.4, 1.42, 0]} ref={leftArmRef}>
        {/* Pauldron */}
        <mesh position={[0, 0.08, 0]} rotation={[0, 0, 0.2]} castShadow>
          <boxGeometry args={[0.26, 0.16, 0.28]} />
          <meshStandardMaterial color="#2d0f19" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial color="#17111a" roughness={0.5} />
        </mesh>
      </group>

      {/* Right Arm (Holding Shadow Greatblade) */}
      <group position={[0.4, 1.42, 0]} ref={rightArmRef}>
        {/* Pauldron */}
        <mesh position={[0, 0.08, 0]} rotation={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[0.26, 0.16, 0.28]} />
          <meshStandardMaterial color="#2d0f19" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial color="#17111a" roughness={0.5} />
        </mesh>
        
        {/* Cursed Shadow Greatblade */}
        <group position={[0.1, -0.5, 0.35]} rotation={[0.85, 0, 0]}>
          {/* Blade Hilt & Crossguard */}
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.06, 0.08]} />
            <meshStandardMaterial color="#2c1820" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Glowing Violet Blade Core */}
          <mesh position={[0, 0, -0.55]} castShadow>
            <boxGeometry args={[0.07, 0.04, 1.3]} />
            <meshStandardMaterial color="#9c27b0" emissive="#7b1fa2" emissiveIntensity={3.5} />
          </mesh>
          {/* Radiant Blade Edge */}
          <mesh position={[0, 0, -0.55]}>
            <boxGeometry args={[0.1, 0.015, 1.35]} />
            <meshStandardMaterial color="#ff1744" emissive="#e91e63" emissiveIntensity={3.0} />
          </mesh>
        </group>
      </group>

      {/* Left Leg (Armored Greaves) */}
      <group position={[-0.16, 0.7, 0]} ref={leftLegRef}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.24, 0.72, 0.24]} />
          <meshStandardMaterial color="#121316" roughness={0.5} metalness={0.6} />
        </mesh>
      </group>

      {/* Right Leg (Armored Greaves) */}
      <group position={[0.16, 0.7, 0]} ref={rightLegRef}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.24, 0.72, 0.24]} />
          <meshStandardMaterial color="#121316" roughness={0.5} metalness={0.6} />
        </mesh>
      </group>

      {/* Ominous Crimson & Void Shadow Aura */}
      <pointLight color="#ff1744" intensity={4.5} distance={8} position={[0, 1.8, 0]} />
    </group>
  );
}

// Autonomous Patrol Waypoints across the far end of the forest maze between final doors
const PATROL_WAYPOINTS = [
  { x: -30, z: -130, label: "Near Final Moon Gate (Door A)" },
  { x: -30, z: -110, label: "Moon Gate Approach Corridor" },
  { x: -30, z: -95, label: "Final Split Left Branch" },
  { x: 0, z: -95, label: "Final Junction J3 Center" },
  { x: 30, z: -95, label: "Final Split Right Branch" },
  { x: 30, z: -110, label: "Sun Gate Approach Corridor" },
  { x: 30, z: -130, label: "Near Cursed Sun Gate (Door B)" },
  { x: 30, z: -110, label: "Return Sun Gate Corridor" },
  { x: 0, z: -95, label: "Final Junction J3 Center" },
  { x: 0, z: -75, label: "Deep Forest Approach Trunk" },
  { x: 0, z: -95, label: "Return Final Junction J3" },
  { x: -30, z: -95, label: "Return Moon Gate Split" }
];

export default function Attacker({ 
  playerPosRef, 
  unlockedDoors = {}, 
  isFrozen = false, 
  webcamInputs,
  onStateChange,
  onPlayerCaught,
  respawnTrigger = 0
}) {
  const attackerRef = useRef();
  const modelRef = useRef();
  const moveVecRef = useRef(new THREE.Vector3());
  const smoothMoveVecRef = useRef(new THREE.Vector3(0, 0, 0));
  const waypointIndexRef = useRef(0);
  const aiStateRef = useRef('PATROL');
  const lastStateReportRef = useRef('PATROLLING');

  // Helper to report state updates cleanly without excessive re-renders
  const reportState = (newState) => {
    if (lastStateReportRef.current !== newState) {
      lastStateReportRef.current = newState;
      if (onStateChange) onStateChange(newState);
    }
  };

  // Instant Respawn / Retry reset to far-end spawn near final doors
  useEffect(() => {
    if (attackerRef.current && respawnTrigger > 0) {
      attackerRef.current.setTranslation({ x: ATTACKER_INITIAL_SPAWN[0], y: ATTACKER_INITIAL_SPAWN[1], z: ATTACKER_INITIAL_SPAWN[2] }, true);
      attackerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      attackerRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      smoothMoveVecRef.current.set(0, 0, 0);
      waypointIndexRef.current = 0;
      aiStateRef.current = 'PATROL';
      reportState('PATROLLING');
    }
  }, [respawnTrigger]);

  useFrame((state, delta) => {
    if (!attackerRef.current || !playerPosRef || !playerPosRef.current) return;

    const dt = Math.min(Math.max(delta, 1 / 120), 0.1);

    // Freeze when quiz modal is active or when caught
    if (isFrozen || aiStateRef.current === 'CAUGHT') {
      smoothMoveVecRef.current.set(0, 0, 0);
      attackerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    const currentPos = attackerRef.current.translation();
    const vel = attackerRef.current.linvel();
    const moveVec = moveVecRef.current.set(0, 0, 0);

    const wb = webcamInputs || {};
    const isManualControl = Boolean(wb.isManualControl);
    const hasWebcamControl = wb.forward || wb.left || wb.right || wb.backward;

    const targetPos = playerPosRef.current;
    const dxPlayer = targetPos.x - currentPos.x;
    const dzPlayer = targetPos.z - currentPos.z;
    const distToPlayer = Math.hypot(dxPlayer, dzPlayer);

    // 1. CAPTURE DETECTION: contact triggers caught state and overlay
    if (distToPlayer <= 1.8) {
      aiStateRef.current = 'CAUGHT';
      reportState('PLAYER CAUGHT');
      smoothMoveVecRef.current.set(0, 0, 0);
      attackerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      if (onPlayerCaught) onPlayerCaught();
      return;
    }

    if (isManualControl) {
      // Manual Webcam Gesture Control Mode for Attacker (~40-50% speed with smooth acceleration/deceleration)
      const targetSpeed = (hasWebcamControl && !wb.stop) ? GESTURE_MOVE_SPEED : 0;
      if (targetSpeed > 0) {
        const fwd = Number(wb.backward || 0) - Number(wb.forward || 0);
        const sde = Number(wb.left || 0) - Number(wb.right || 0);
        const targetDir = new THREE.Vector3(-sde, 0, fwd);
        if (targetDir.lengthSq() > 0.001) {
          targetDir.normalize().multiplyScalar(GESTURE_MOVE_SPEED);
        }
        // Gradual acceleration
        const accelFactor = 1 - Math.exp(-5.5 * dt);
        smoothMoveVecRef.current.x = THREE.MathUtils.lerp(smoothMoveVecRef.current.x, targetDir.x, accelFactor);
        smoothMoveVecRef.current.z = THREE.MathUtils.lerp(smoothMoveVecRef.current.z, targetDir.z, accelFactor);
        moveVec.copy(smoothMoveVecRef.current);
        reportState('MANUAL GESTURE (MOVING)');
      } else {
        // Fist STOP or No Gesture: gradual safe deceleration to 0
        const decelFactor = 1 - Math.exp(-8.0 * dt);
        smoothMoveVecRef.current.x = THREE.MathUtils.lerp(smoothMoveVecRef.current.x, 0, decelFactor);
        smoothMoveVecRef.current.z = THREE.MathUtils.lerp(smoothMoveVecRef.current.z, 0, decelFactor);
        if (smoothMoveVecRef.current.lengthSq() < 0.02) {
          smoothMoveVecRef.current.set(0, 0, 0);
        }
        moveVec.copy(smoothMoveVecRef.current);
        reportState(smoothMoveVecRef.current.lengthSq() > 0.01 ? 'MANUAL GESTURE (SLOWING)' : 'MANUAL GESTURE (STOPPED)');
      }
    } else {
      // Reset manual velocity when returning to autonomous patrol
      smoothMoveVecRef.current.set(0, 0, 0);
      // 2. AUTONOMOUS STATE MACHINE: PATROL vs CHASE with Line-of-Sight Check
      const DETECTION_RANGE = 18.0;
      const ESCAPE_RANGE = 24.0;

      // Line-of-sight check: ensure no locked gate barrier lies directly between Attacker and Player
      let hasLineOfSight = true;
      if (distToPlayer <= DETECTION_RANGE) {
        for (let t = 0.2; t <= 0.8; t += 0.2) {
          const rx = currentPos.x + t * dxPlayer;
          const rz = currentPos.z + t * dzPlayer;
          if (checkGateCollision(rx, rz, unlockedDoors).isBlocked) {
            hasLineOfSight = false;
            break;
          }
        }
      }

      if (aiStateRef.current === 'PATROL') {
        if (distToPlayer <= DETECTION_RANGE && hasLineOfSight) {
          aiStateRef.current = 'CHASE';
          reportState('CHASING');
        }
      } else if (aiStateRef.current === 'CHASE') {
        if (distToPlayer > ESCAPE_RANGE) {
          aiStateRef.current = 'PATROL';
          reportState('PATROLLING');
        }
      }

      // 3. MOVEMENT VELOCITY DETERMINATION
      if (aiStateRef.current === 'CHASE') {
        // Move faster than normal Player walking speed (9.0), but escapable via sprint (16.2)
        const chaseSpeed = 9.6;
        moveVec.set(dxPlayer / distToPlayer, 0, dzPlayer / distToPlayer).multiplyScalar(chaseSpeed);
      } else {
        // PATROL MODE: follow connected maze route waypoints across final doors sector
        const wp = PATROL_WAYPOINTS[waypointIndexRef.current];
        const dxWp = wp.x - currentPos.x;
        const dzWp = wp.z - currentPos.z;
        const distToWp = Math.hypot(dxWp, dzWp);

        if (distToWp < 2.0) {
          waypointIndexRef.current = (waypointIndexRef.current + 1) % PATROL_WAYPOINTS.length;
        } else {
          const patrolSpeed = 3.6; // Steady walking speed
          moveVec.set(dxWp / distToWp, 0, dzWp / distToWp).multiplyScalar(patrolSpeed);
        }
      }
    }

    // 4. FRAME-RATE INDEPENDENT PATH BOUNDARY & LOCKED GATE VALIDATION
    let ax = moveVec.x;
    let az = moveVec.z;

    if (ax !== 0 || az !== 0) {
      const candX = currentPos.x + ax * dt;
      const candZ = currentPos.z + az * dt;

      // Gate collision barrier check: locked gates stop attacker completely
      const gateCheck = checkGateCollision(candX, candZ, unlockedDoors, ax, az);
      if (gateCheck.isBlocked) {
        if (gateCheck.gate.barrierAxis === 'x') {
          ax = 0;
        } else if (gateCheck.gate.barrierAxis === 'z') {
          az = 0;
        } else {
          ax = 0;
          az = 0;
        }
      } else {
        // Ensure attacker stays on walkable paths and slides along path normal if nearing boundary
        const fullCheck = getClosestPathPosition(candX, candZ, unlockedDoors);
        if (!fullCheck.isOnPath) {
          const zCheck = getClosestPathPosition(currentPos.x, candZ, unlockedDoors);
          const xCheck = getClosestPathPosition(candX, currentPos.z, unlockedDoors);
          if (zCheck.isOnPath && az !== 0) {
            ax = 0;
          } else if (xCheck.isOnPath && ax !== 0) {
            az = 0;
          } else {
            const dot = ax * fullCheck.normalX + az * fullCheck.normalZ;
            if (dot > 0) {
              ax -= dot * fullCheck.normalX;
              az -= dot * fullCheck.normalZ;
            }
          }
        }
      }
    }

    attackerRef.current.setLinvel({ x: ax, y: vel.y, z: az }, true);

    // 5. SMOOTH TURNING TOWARD DESTINATION
    const currentSpeed = Math.hypot(ax, az);
    if (currentSpeed > 0.1 && modelRef.current) {
      const targetAngle = Math.atan2(ax, az);
      let currentAngle = modelRef.current.rotation.y;
      let diff = targetAngle - currentAngle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      modelRef.current.rotation.y += diff * Math.min(1.0, 10 * dt);
    }
  });

  return (
    <RigidBody
      ref={attackerRef}
      colliders={false}
      mass={1}
      type="dynamic"
      position={ATTACKER_INITIAL_SPAWN}
      enabledRotations={[false, false, false]}
      friction={0.5}
    >
      <CapsuleCollider args={[0.55, 0.4]} position={[0, 0.95, 0]} restitution={0} />
      <group ref={modelRef}>
        <AttackerModel attackerRef={attackerRef} />
      </group>
    </RigidBody>
  );
}
