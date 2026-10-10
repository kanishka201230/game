import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import * as THREE from "three";
import { getClosestPathPosition } from "./pathConfig";

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
      {/* Adventurer Head */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
        <meshStandardMaterial color="#ffdbac" roughness={0.5} />
      </mesh>
      
      {/* Bright Crimson/Gold Cloak Hood & Hair */}
      <mesh position={[0, 2.0, -0.05]} castShadow>
        <boxGeometry args={[0.42, 0.16, 0.42]} />
        <meshStandardMaterial color="#d97706" roughness={0.4} emissive="#b45309" emissiveIntensity={0.3} />
      </mesh>

      {/* Vibrant Red Adventurer Tunic */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.62, 0.82, 0.38]} />
        <meshStandardMaterial color="#e63946" roughness={0.5} emissive="#991b1b" emissiveIntensity={0.2} />
      </mesh>

      {/* Gold Chest Emblem & Belt */}
      <mesh position={[0, 1.35, 0.2]} castShadow>
        <boxGeometry args={[0.2, 0.2, 0.05]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.82, 0]} castShadow>
        <boxGeometry args={[0.64, 0.12, 0.4]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>

      {/* Left Arm Pivot */}
      <group position={[-0.42, 1.5, 0]} ref={leftArmRef}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.24, 0.7, 0.24]} />
          <meshStandardMaterial color="#dc2626" roughness={0.6} />
        </mesh>
      </group>

      {/* Right Arm Pivot */}
      <group position={[0.42, 1.5, 0]} ref={rightArmRef}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.24, 0.7, 0.24]} />
          <meshStandardMaterial color="#dc2626" roughness={0.6} />
        </mesh>
      </group>

      {/* Left Leg Pivot */}
      <group position={[-0.18, 0.78, 0]} ref={leftLegRef}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.26, 0.8, 0.26]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
      </group>

      {/* Right Leg Pivot */}
      <group position={[0.18, 0.78, 0]} ref={rightLegRef}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.26, 0.8, 0.26]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
      </group>

      {/* Character Rim Light */}
      <pointLight color="#ffedd5" intensity={4} distance={6} position={[0, 2, 0]} />
    </group>
  );
}

export default function Player({ unlockedDoors = {}, isFrozen = false, onPositionUpdate, webcamInputs, onDebugUpdate }) {
  const playerRef = useRef();
  const characterRef = useRef();
  const [, getKeys] = useKeyboardControls();
  
  // Ref-based synchronous window keyboard state
  const directKeysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    run: false,
    lastKeyPressed: "None",
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const code = e.code;
      const key = e.key.toLowerCase();

      let matched = false;
      if (code === 'KeyW' || code === 'ArrowUp' || key === 'w') { directKeysRef.current.forward = true; directKeysRef.current.lastKeyPressed = "W / ArrowUp"; matched = true; }
      if (code === 'KeyS' || code === 'ArrowDown' || key === 's') { directKeysRef.current.backward = true; directKeysRef.current.lastKeyPressed = "S / ArrowDown"; matched = true; }
      if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a') { directKeysRef.current.left = true; directKeysRef.current.lastKeyPressed = "A / ArrowLeft"; matched = true; }
      if (code === 'KeyD' || code === 'ArrowRight' || key === 'd') { directKeysRef.current.right = true; directKeysRef.current.lastKeyPressed = "D / ArrowRight"; matched = true; }
      if (code === 'Space' || key === ' ') { directKeysRef.current.jump = true; directKeysRef.current.lastKeyPressed = "Space"; matched = true; }
      if (e.shiftKey || code === 'ShiftLeft' || code === 'ShiftRight') { directKeysRef.current.run = true; directKeysRef.current.lastKeyPressed = "Shift"; matched = true; }

      if (matched && e.target === document.body) {
        e.preventDefault(); // Prevent page scrolling while playing
      }
    };

    const handleKeyUp = (e) => {
      const code = e.code;
      const key = e.key.toLowerCase();
      if (code === 'KeyW' || code === 'ArrowUp' || key === 'w') directKeysRef.current.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown' || key === 's') directKeysRef.current.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a') directKeysRef.current.left = false;
      if (code === 'KeyD' || code === 'ArrowRight' || key === 'd') directKeysRef.current.right = false;
      if (code === 'Space' || key === ' ') directKeysRef.current.jump = false;
      if (!e.shiftKey && (code === 'ShiftLeft' || code === 'ShiftRight')) directKeysRef.current.run = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const baseSpeed = 9.0;
  const direction = useRef(new THREE.Vector3());
  const frontVector = useRef(new THREE.Vector3());
  const sideVector = useRef(new THREE.Vector3());

  useFrame((state) => {
    if (!playerRef.current) return;

    const translation = playerRef.current.translation();
    if (onPositionUpdate) {
      onPositionUpdate(translation);
    }

    if (isFrozen) {
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      if (onDebugUpdate) {
        onDebugUpdate({
          lastKey: directKeysRef.current.lastKeyPressed,
          inputDetected: false,
          coords: `X: ${translation.x.toFixed(1)}, Y: ${translation.y.toFixed(1)}, Z: ${translation.z.toFixed(1)}`,
          status: "FROZEN (Quiz Modal Open)",
        });
      }
      return;
    }
    
    // Combine Drei KeyboardControls, Direct Window Ref Keys, and Webcam Body Inputs
    const kb = getKeys();
    const dk = directKeysRef.current;
    const wb = webcamInputs || {};

    const forward = kb.forward || dk.forward || wb.forward;
    const backward = kb.backward || dk.backward || wb.backward;
    const left = kb.left || dk.left || wb.left;
    const right = kb.right || dk.right || wb.right;
    const jump = kb.jump || dk.jump || wb.jump;
    const run = kb.run || dk.run || wb.run;

    const inputDetected = forward || backward || left || right || jump;

    const velocity = playerRef.current.linvel();
    const currentMaxSpeed = run ? baseSpeed * 1.8 : baseSpeed;

    frontVector.current.set(0, 0, Number(backward) - Number(forward));
    sideVector.current.set(Number(left) - Number(right), 0, 0);
    
    direction.current.subVectors(frontVector.current, sideVector.current);
    
    if (direction.current.lengthSq() > 0.001) {
      direction.current.normalize().multiplyScalar(currentMaxSpeed);
    } else {
      direction.current.set(0, 0, 0);
    }

    // ELEGANT PATH BOUNDARY VALIDATION & FLUID SLIDING
    const dt = 1 / 60;
    const candidateX = translation.x + direction.current.x * dt;
    const candidateZ = translation.z + direction.current.z * dt;

    const pathCheck = getClosestPathPosition(candidateX, candidateZ, unlockedDoors);
    let movementStatus = "OK (On Dirt Path)";

    if (!pathCheck.isOnPath) {
      movementStatus = "SLIDING (Path Edge Boundary)";
      
      // Project movement vector onto nearest path segment direction to allow fluid sliding along turns
      const dot = direction.current.x * pathCheck.segDx + direction.current.z * pathCheck.segDz;
      if (Math.abs(dot) > 0.1) {
        direction.current.x = pathCheck.segDx * dot;
        direction.current.z = pathCheck.segDz * dot;
      } else {
        // Nudge gently towards center of closest path segment
        direction.current.x = (pathCheck.clampedX - translation.x) * 4;
        direction.current.z = (pathCheck.clampedZ - translation.z) * 4;
      }
    }

    // Explicitly wake up RigidBody and apply velocity
    playerRef.current.wakeUp();
    playerRef.current.setLinvel({ x: direction.current.x, y: velocity.y, z: direction.current.z }, true);

    const horizontalSpeed = Math.sqrt(direction.current.x * direction.current.x + direction.current.z * direction.current.z);

    if (horizontalSpeed > 0.1 && characterRef.current) {
      const targetAngle = Math.atan2(direction.current.x, direction.current.z);
      let currentAngle = characterRef.current.rotation.y;
      let diff = targetAngle - currentAngle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      characterRef.current.rotation.y += diff * 0.18;
    }

    // Jump logic with ground check
    if (jump && Math.abs(velocity.y) < 0.2 && translation.y < 1.2) {
      playerRef.current.setLinvel({ x: velocity.x, y: 8.5, z: velocity.z }, true);
    }

    // Smooth Third-Person Camera Following
    const camY = Math.max(translation.y + 3.8, 1.8);
    const targetY = Math.max(translation.y + 1.4, 0.6);
    
    const cameraPosition = new THREE.Vector3(translation.x, camY, translation.z + 6.8);
    const cameraTarget = new THREE.Vector3(translation.x, targetY, translation.z - 2.0);
    
    state.camera.position.lerp(cameraPosition, 0.14);
    state.camera.lookAt(cameraTarget);

    // Update Debug Overlay State
    if (onDebugUpdate) {
      onDebugUpdate({
        lastKey: dk.lastKeyPressed,
        inputDetected,
        coords: `X: ${translation.x.toFixed(1)}, Y: ${translation.y.toFixed(1)}, Z: ${translation.z.toFixed(1)}`,
        status: movementStatus,
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
      friction={0.5}
      linearDamping={0.5}
    >
      <CapsuleCollider args={[0.6, 0.4]} position={[0, 1.0, 0]} />
      <group ref={characterRef}>
        <Humanoid playerRef={playerRef} />
      </group>
    </RigidBody>
  );
}
