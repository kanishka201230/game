import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import * as THREE from "three";
import { getClosestPathPosition, checkGateCollision, GESTURE_MOVE_SPEED } from "./pathConfig";

// High visibility, distinct Adventurer character model
function Humanoid({ playerRef }) {
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    let speed = 0;
    if (playerRef.current) {
      const vel = playerRef.current.linvel();
      speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
    }
    
    // Smooth limb animation
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
    <group position={[0, -0.1, 0]}>
      {/* Adventurer Head & Face */}
      <mesh position={[0, 1.82, 0]} castShadow>
        <boxGeometry args={[0.36, 0.36, 0.36]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.6} />
      </mesh>

      {/* Dark Hair Visible Under Hood */}
      <mesh position={[0, 1.94, 0.13]} castShadow>
        <boxGeometry args={[0.34, 0.1, 0.14]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>

      {/* Dark Purple / Indigo Hood */}
      <mesh position={[0, 1.88, -0.04]} castShadow>
        <boxGeometry args={[0.42, 0.44, 0.42]} />
        <meshStandardMaterial color="#1a0a2e" roughness={0.6} emissive="#2d1052" emissiveIntensity={0.2} />
      </mesh>
      {/* Hood Cowl & Shoulder Mantle */}
      <mesh position={[0, 1.66, 0]} castShadow>
        <boxGeometry args={[0.48, 0.14, 0.4]} />
        <meshStandardMaterial color="#2d1052" roughness={0.6} />
      </mesh>

      {/* Slim Athletic Torso & Dark Armor Underneath */}
      <mesh position={[0, 1.22, 0]} castShadow>
        <boxGeometry args={[0.54, 0.78, 0.34]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} emissive="#0f0f1a" emissiveIntensity={0.3} />
      </mesh>
      {/* Dark Chest Armor Plate */}
      <mesh position={[0, 1.26, 0.03]} castShadow>
        <boxGeometry args={[0.46, 0.48, 0.32]} />
        <meshStandardMaterial color="#0f0f1a" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Purple Crystal (replacing gold medallion) */}
      <mesh position={[0, 1.38, 0.2]} castShadow>
        <octahedronGeometry args={[0.11, 0]} />
        <meshStandardMaterial color="#9333ea" emissive="#7c3aed" emissiveIntensity={2.0} roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Dark Belt & Buckle */}
      <mesh position={[0, 0.84, 0]} castShadow>
        <boxGeometry args={[0.56, 0.12, 0.36]} />
        <meshStandardMaterial color="#1a0a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.84, 0.19]} castShadow>
        <boxGeometry args={[0.14, 0.1, 0.04]} />
        <meshStandardMaterial color="#2d1052" metalness={0.7} roughness={0.3} emissive="#7c3aed" emissiveIntensity={0.5} />
      </mesh>

      {/* Flowing Dark Cape Behind Body */}
      <mesh position={[0, 1.15, -0.21]} rotation={[0.14, 0, 0]} castShadow>
        <boxGeometry args={[0.52, 0.95, 0.04]} />
        <meshStandardMaterial color="#1a0a2e" roughness={0.7} emissive="#2d1052" emissiveIntensity={0.15} />
      </mesh>

      {/* Glowing Sword on Back */}
      <group position={[-0.14, 1.35, -0.26]} rotation={[0, 0, -0.52]}>
        {/* Blade */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.026, 0.026, 0.72, 6]} />
          <meshStandardMaterial color="#9333ea" emissive="#7c3aed" emissiveIntensity={2.5} roughness={0.2} metalness={0.5} />
        </mesh>
        {/* Blade Tip */}
        <mesh position={[0, 0.52, 0]} castShadow>
          <coneGeometry args={[0.026, 0.12, 6]} />
          <meshStandardMaterial color="#9333ea" emissive="#7c3aed" emissiveIntensity={2.8} roughness={0.2} metalness={0.5} />
        </mesh>
        {/* Crossguard */}
        <mesh position={[0, -0.26, 0]} castShadow>
          <boxGeometry args={[0.18, 0.04, 0.06]} />
          <meshStandardMaterial color="#0f0f1a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Hilt */}
        <mesh position={[0, -0.38, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.2, 8]} />
          <meshStandardMaterial color="#1a0a1a" roughness={0.6} />
        </mesh>
        {/* Pommel */}
        <mesh position={[0, -0.5, 0]} castShadow>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#9333ea" emissive="#7c3aed" emissiveIntensity={2.0} />
        </mesh>
      </group>

      {/* Floating Purple Energy Orb */}
      <group position={[0.36, 1.05, 0.14]}>
        <mesh castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#a855f7" emissive="#9333ea" emissiveIntensity={3.2} roughness={0.1} />
        </mesh>
        <mesh rotation={[1.1, 0.4, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.015, 12]} />
          <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={2.0} transparent opacity={0.6} />
        </mesh>
        <pointLight color="#a855f7" intensity={3.5} distance={6} />
      </group>

      {/* Left Arm Pivot */}
      <group position={[-0.38, 1.48, 0]} ref={leftArmRef}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.18, 0.44, 0.18]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.6} />
        </mesh>
        {/* Dark Gauntlet */}
        <mesh position={[0, -0.48, 0]} castShadow>
          <boxGeometry args={[0.2, 0.28, 0.2]} />
          <meshStandardMaterial color="#1a0a1a" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.64, 0]} castShadow>
          <boxGeometry args={[0.14, 0.12, 0.16]} />
          <meshStandardMaterial color="#1a0a1a" roughness={0.6} />
        </mesh>
      </group>

      {/* Right Arm Pivot */}
      <group position={[0.38, 1.48, 0]} ref={rightArmRef}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.18, 0.44, 0.18]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.6} />
        </mesh>
        {/* Dark Gauntlet */}
        <mesh position={[0, -0.48, 0]} castShadow>
          <boxGeometry args={[0.2, 0.28, 0.2]} />
          <meshStandardMaterial color="#1a0a1a" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.64, 0]} castShadow>
          <boxGeometry args={[0.14, 0.12, 0.16]} />
          <meshStandardMaterial color="#1a0a1a" roughness={0.6} />
        </mesh>
      </group>

      {/* Left Leg Pivot */}
      <group position={[-0.16, 0.78, 0]} ref={leftLegRef}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.2, 0.72, 0.2]} />
          <meshStandardMaterial color="#0f0f1a" roughness={0.7} />
        </mesh>
        {/* Dark Boot */}
        <mesh position={[0, -0.64, 0.03]} castShadow>
          <boxGeometry args={[0.22, 0.28, 0.26]} />
          <meshStandardMaterial color="#1a0a1a" roughness={0.7} metalness={0.2} />
        </mesh>
      </group>

      {/* Right Leg Pivot */}
      <group position={[0.16, 0.78, 0]} ref={rightLegRef}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.2, 0.72, 0.2]} />
          <meshStandardMaterial color="#0f0f1a" roughness={0.7} />
        </mesh>
        {/* Dark Boot */}
        <mesh position={[0, -0.64, 0.03]} castShadow>
          <boxGeometry args={[0.22, 0.28, 0.26]} />
          <meshStandardMaterial color="#1a0a1a" roughness={0.7} metalness={0.2} />
        </mesh>
      </group>

      {/* Purple Magical Aura Light */}
      <pointLight color="#a855f7" intensity={2.5} distance={6} position={[0, 1.8, 0]} />
    </group>
  );
}

import { InputManager } from "./InputManager";

export default function Player({ 
  unlockedDoors = {}, 
  isFrozen = false, 
  playerPosRef, 
  onZoneCheck, 
  webcamInputs, 
  onDebugUpdate,
  respawnTrigger = 0
}) {
  const playerRef = useRef();
  const characterRef = useRef();

  const baseSpeed = 9.0;
  const direction = useRef(new THREE.Vector3());
  const smoothVelocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const frontVector = useRef(new THREE.Vector3());
  const sideVector = useRef(new THREE.Vector3());
  const lastUpdateRef = useRef(0);

  // Persistent vector refs to eliminate GC pauses and camera jitter
  const camPosRef = useRef(new THREE.Vector3(0, 5, 18.8));
  const lookAtRef = useRef(new THREE.Vector3(0, 1.4, 10));
  const targetCamPosRef = useRef(new THREE.Vector3());
  const targetLookAtRef = useRef(new THREE.Vector3());

  // Instant Respawn handler on Retry
  useEffect(() => {
    if (playerRef.current && respawnTrigger > 0) {
      playerRef.current.setTranslation({ x: 0, y: 1.5, z: 12 }, true);
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      playerRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      smoothVelocityRef.current.set(0, 0, 0);
      camPosRef.current.set(0, 5, 18.8);
      lookAtRef.current.set(0, 1.4, 10);
      if (playerPosRef) {
        playerPosRef.current = { x: 0, y: 1.5, z: 12 };
      }
    }
  }, [respawnTrigger, playerPosRef]);

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const translation = playerRef.current.translation();
    if (playerPosRef) {
      playerPosRef.current = translation;
    }
    if (onZoneCheck) {
      onZoneCheck(translation);
    }

    if (isFrozen) {
      smoothVelocityRef.current.set(0, 0, 0);
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      if (onDebugUpdate && state.clock.elapsedTime - lastUpdateRef.current > 0.1) {
        lastUpdateRef.current = state.clock.elapsedTime;
        onDebugUpdate({
          lastKey: "None",
          inputDetected: false,
          coords: `X: ${translation.x.toFixed(1)}, Y: ${translation.y.toFixed(1)}, Z: ${translation.z.toFixed(1)}`,
          status: "FROZEN (Quiz Modal Open)",
        });
      }
      return;
    }
    
    const wb = webcamInputs || {};

    const isKeyboardActive = Boolean(
      InputManager.getForward() ||
      InputManager.getBackward() ||
      InputManager.getLeft() ||
      InputManager.getRight()
    );

    const isGestureActive = Boolean(
      (wb.forward || wb.backward || wb.left || wb.right) &&
      !wb.stop &&
      !isKeyboardActive
    );

    let forward = false;
    let backward = false;
    let left = false;
    let right = false;
    const jump = InputManager.getJump() || !!wb.jump;
    const run = InputManager.getRun();

    if (isKeyboardActive) {
      forward = InputManager.getForward();
      backward = InputManager.getBackward();
      left = InputManager.getLeft();
      right = InputManager.getRight();
    } else if (isGestureActive) {
      forward = Boolean(wb.forward);
      backward = Boolean(wb.backward);
      left = Boolean(wb.left);
      right = Boolean(wb.right);
    }

    const inputDetected = forward || backward || left || right || jump;

    const velocity = playerRef.current.linvel();
    const dt = Math.min(Math.max(delta, 1 / 120), 0.1);

    frontVector.current.set(0, 0, Number(backward) - Number(forward));
    sideVector.current.set(Number(left) - Number(right), 0, 0);
    direction.current.subVectors(frontVector.current, sideVector.current);

    let vx = 0;
    let vz = 0;

    if (isKeyboardActive) {
      // 1. Keyboard Controls: Normal walk speed (9.0) or sprint with Shift (16.2), immediate response
      const keyboardSpeed = run ? baseSpeed * 1.8 : baseSpeed;
      if (direction.current.lengthSq() > 0.001) {
        direction.current.normalize().multiplyScalar(keyboardSpeed);
      } else {
        direction.current.set(0, 0, 0);
      }
      smoothVelocityRef.current.copy(direction.current);
      vx = direction.current.x;
      vz = direction.current.z;
    } else if (isGestureActive) {
      // 2. Gesture Controls: Reduced speed (~40-50% of normal speed: 4.0 units/sec) with gradual acceleration
      if (direction.current.lengthSq() > 0.001) {
        direction.current.normalize().multiplyScalar(GESTURE_MOVE_SPEED);
      } else {
        direction.current.set(0, 0, 0);
      }
      // Gradual acceleration toward target gesture speed
      const accelFactor = 1 - Math.exp(-5.5 * dt);
      smoothVelocityRef.current.x = THREE.MathUtils.lerp(smoothVelocityRef.current.x, direction.current.x, accelFactor);
      smoothVelocityRef.current.z = THREE.MathUtils.lerp(smoothVelocityRef.current.z, direction.current.z, accelFactor);
      vx = smoothVelocityRef.current.x;
      vz = smoothVelocityRef.current.z;
    } else {
      // 3. No Movement / Closed Fist STOP / Hand Disappeared: Gradual safe deceleration to 0
      const decelFactor = 1 - Math.exp(-8.0 * dt);
      smoothVelocityRef.current.x = THREE.MathUtils.lerp(smoothVelocityRef.current.x, 0, decelFactor);
      smoothVelocityRef.current.z = THREE.MathUtils.lerp(smoothVelocityRef.current.z, 0, decelFactor);
      if (smoothVelocityRef.current.lengthSq() < 0.02) {
        smoothVelocityRef.current.set(0, 0, 0);
      }
      vx = smoothVelocityRef.current.x;
      vz = smoothVelocityRef.current.z;
    }
    let movementStatus = "OK";
    let isBlocked = false;
    let blockedGateName = null;

    if (vx !== 0 || vz !== 0) {
      const candX = translation.x + vx * dt;
      const candZ = translation.z + vz * dt;

      // 1. Strict Physical & Spatial Gate Barrier Check
      const gateHit = checkGateCollision(candX, candZ, unlockedDoors, vx, vz);
      if (gateHit.isBlocked) {
        isBlocked = true;
        blockedGateName = gateHit.gate.name;
        movementStatus = `LOCKED GATE (${gateHit.gate.name})`;
        // Zero out velocity penetrating the gate barrier
        if (gateHit.gate.barrierAxis === 'x') {
          vx = 0;
        } else if (gateHit.gate.barrierAxis === 'z') {
          vz = 0;
        } else {
          vx = 0;
          vz = 0;
        }
      } else {
        // 2. Strict Walkable Forest Dirt Path Boundary Check
        const pathCheck = getClosestPathPosition(candX, candZ, unlockedDoors);
        if (pathCheck.isOnPath) {
          movementStatus = "OK";
        } else {
          isBlocked = true;
          // Boundary reached: remove outward velocity component directed into forest
          const nx = pathCheck.normalX;
          const nz = pathCheck.normalZ;
          const dot = vx * nx + vz * nz;
          if (dot > 0) {
            vx -= dot * nx;
            vz -= dot * nz;
          }
          movementStatus = "SLIDING (Path Boundary)";
        }
      }
    } else {
      movementStatus = "IDLE";
      isBlocked = false;
    }

    const safeVelY = velocity && velocity.y !== undefined ? velocity.y : 0;

    // EMERGENCY FALL RECOVERY: Only if character fell below the entire world floor
    if (translation.y < -4.0) {
      playerRef.current.setTranslation({ x: 0, y: 1.5, z: 12 }, true);
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      movementStatus = "RECOVERED FROM FALL";
    } else {
      // Pure continuous physics integration via linear velocity (no setTranslation position fight)
      playerRef.current.wakeUp();
      playerRef.current.setLinvel({ x: vx, y: safeVelY, z: vz }, true);
    }

    const horizontalSpeed = Math.sqrt(vx * vx + vz * vz);

    // Frame-rate independent character rotation smoothing
    if (horizontalSpeed > 0.1 && characterRef.current) {
      const targetAngle = Math.atan2(vx, vz);
      let currentAngle = characterRef.current.rotation.y;
      let diff = targetAngle - currentAngle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      characterRef.current.rotation.y += diff * Math.min(1.0, 14 * dt);
    }

    // Jump logic with ground check
    if (jump && Math.abs(safeVelY) < 0.3 && translation.y < 0.25) {
      playerRef.current.setLinvel({ x: vx, y: 8.5, z: vz }, true);
    }

    // Stable, Jitter-Free Third-Person Camera Follow
    // Frame-rate independent exponential smoothing (1 - e^(-decay * dt))
    const baseGroundY = Math.max(translation.y, 0.0);
    const camY = baseGroundY + 3.8;
    const targetY = baseGroundY + 1.4;
    
    targetCamPosRef.current.set(translation.x, camY, translation.z + 6.8);
    targetLookAtRef.current.set(translation.x, targetY, translation.z - 2.0);
    
    const camLerp = 1 - Math.exp(-9 * dt);
    camPosRef.current.lerp(targetCamPosRef.current, camLerp);
    lookAtRef.current.lerp(targetLookAtRef.current, camLerp);
    
    state.camera.position.copy(camPosRef.current);
    state.camera.lookAt(lookAtRef.current);

    // Get position after physics apply
    const postX = translation.x;
    const postZ = translation.z;

    const heldKeysStr = InputManager.getHeldKeysString();

    let cmdStr = "None";
    if (forward && left) cmdStr = "Diagonal (Forward-Left)";
    else if (forward && right) cmdStr = "Diagonal (Forward-Right)";
    else if (backward && left) cmdStr = "Diagonal (Backward-Left)";
    else if (backward && right) cmdStr = "Diagonal (Backward-Right)";
    else if (forward) cmdStr = "Forward";
    else if (backward) cmdStr = "Backward";
    else if (left) cmdStr = "Left";
    else if (right) cmdStr = "Right";
    else if (jump) cmdStr = "Jump";

    // Current position path check for debug overlay
    const currentPathCheck = getClosestPathPosition(translation.x, translation.z, unlockedDoors);
    let blockReason = "None";
    if (isFrozen) {
      blockReason = "Question Modal Open";
    } else if (blockedGateName) {
      blockReason = `Locked Gate: ${blockedGateName}`;
    } else if (isBlocked) {
      blockReason = `Path Boundary Edge (${movementStatus})`;
    }

    // Update Debug Overlay State throttled to 10fps
    if (onDebugUpdate && state.clock.elapsedTime - lastUpdateRef.current > 0.1) {
      lastUpdateRef.current = state.clock.elapsedTime;
      onDebugUpdate({
        lastKey: InputManager.lastKeyPressed,
        heldKeys: heldKeysStr,
        inputDetected: inputDetected,
        movementCommand: cmdStr,
        playerPos: `X: ${translation.x.toFixed(2)}, Y: ${translation.y.toFixed(2)}, Z: ${translation.z.toFixed(2)}`,
        isOnPath: currentPathCheck.isOnPath ? "YES (On Dirt Path)" : "NO (At Path Edge)",
        movementBlocked: (isBlocked || isFrozen) ? "YES" : "NO",
        blockReason: blockReason,
        runnerPosBefore: `X: ${preX.toFixed(2)}, Y: ${translation.y.toFixed(2)}, Z: ${preZ.toFixed(2)}`,
        runnerPosAfter: `X: ${postX.toFixed(2)}, Y: ${translation.y.toFixed(2)}, Z: ${postZ.toFixed(2)}`,
        runnerMovementEnabled: !isFrozen ? "YES" : "NO (Frozen)",
      });
    }
  });

  return (
    <RigidBody 
      ref={playerRef} 
      colliders={false} 
      mass={1} 
      type="dynamic" 
      position={[0, 1.5, 12]} 
      enabledRotations={[false, false, false]}
      friction={0}
      linearDamping={0}
    >
      <CapsuleCollider args={[0.6, 0.4]} position={[0, 1.0, 0]} restitution={0} />
      <group ref={characterRef}>
        <Humanoid playerRef={playerRef} />
      </group>
    </RigidBody>
  );
}
