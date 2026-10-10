import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import * as THREE from "three";
import { getClosestPathPosition } from "./pathConfig";

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
      {/* Helmet / Head */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[0.34, 0.34, 0.34]} />
        <meshStandardMaterial color="#2b2d30" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Glowing Red Eyes / Visor */}
      <mesh position={[0, 1.65, 0.16]} castShadow>
        <boxGeometry args={[0.26, 0.08, 0.05]} />
        <meshStandardMaterial color="#ff1a1a" emissive="#ff0000" emissiveIntensity={3} />
      </mesh>
      
      {/* Heavy Armor Torso */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.56, 0.72, 0.36]} />
        <meshStandardMaterial color="#401a24" roughness={0.5} />
      </mesh>

      {/* Left Arm Pivot */}
      <group position={[-0.38, 1.4, 0]} ref={leftArmRef}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.22, 0.6, 0.22]} />
          <meshStandardMaterial color="#33141c" roughness={0.5} />
        </mesh>
      </group>

      {/* Right Arm Pivot (Holding Shadow Blade) */}
      <group position={[0.38, 1.4, 0]} ref={rightArmRef}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.22, 0.6, 0.22]} />
          <meshStandardMaterial color="#33141c" roughness={0.5} />
        </mesh>
        {/* Shadow Blade Weapon */}
        <mesh position={[0.1, -0.5, 0.3]} rotation={[0.8, 0, 0]} castShadow>
          <boxGeometry args={[0.08, 0.08, 1.2]} />
          <meshStandardMaterial color="#aa00ff" emissive="#8800cc" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group position={[-0.16, 0.7, 0]} ref={leftLegRef}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.24, 0.7, 0.24]} />
          <meshStandardMaterial color="#1a1c1e" roughness={0.6} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group position={[0.16, 0.7, 0]} ref={rightLegRef}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.24, 0.7, 0.24]} />
          <meshStandardMaterial color="#1a1c1e" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

export default function Attacker({ targetPos, unlockedDoors = {}, isFrozen = false, webcamInputs }) {
  const attackerRef = useRef();
  const modelRef = useRef();
  const speed = 5.5;

  useFrame(() => {
    if (!attackerRef.current || !targetPos) return;

    if (isFrozen) {
      attackerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    const currentPos = attackerRef.current.translation();
    const vel = attackerRef.current.linvel();
    const moveVec = new THREE.Vector3(0, 0, 0);

    const wb = webcamInputs || {};
    const hasWebcamControl = wb.forward || wb.left || wb.right || wb.backward;

    if (hasWebcamControl) {
      // 1. Participant 2 Webcam Direct Movement Mapping
      const fwd = Number(wb.backward || 0) - Number(wb.forward || 0);
      const sde = Number(wb.left || 0) - Number(wb.right || 0);
      moveVec.set(-sde, 0, fwd).normalize().multiplyScalar(speed);
    } else {
      // 2. AI Chase Fallback (When Person 2 is not detected in camera)
      const dx = targetPos.x - currentPos.x;
      const dz = targetPos.z - currentPos.z;
      const distToPlayer = Math.hypot(dx, dz);

      if (distToPlayer > 2.0 && distToPlayer < 45) {
        moveVec.set(dx / distToPlayer, 0, dz / distToPlayer).multiplyScalar(speed);
      }
    }

    // STRICT PATH BOUNDARY VALIDATION FOR ATTACKER
    const dt = 1 / 60;
    const candidateX = currentPos.x + moveVec.x * dt;
    const candidateZ = currentPos.z + moveVec.z * dt;

    const pathCheck = getClosestPathPosition(candidateX, candidateZ, unlockedDoors);

    if (!pathCheck.isOnPath) {
      if (Math.abs(candidateX - pathCheck.clampedX) > 0.01) moveVec.x = (pathCheck.clampedX - currentPos.x) * 10;
      if (Math.abs(candidateZ - pathCheck.clampedZ) > 0.01) moveVec.z = (pathCheck.clampedZ - currentPos.z) * 10;
    }

    attackerRef.current.setLinvel({ x: moveVec.x, y: vel.y, z: moveVec.z }, true);

    // Rotate Attacker towards movement direction
    const currentSpeed = Math.hypot(moveVec.x, moveVec.z);
    if (currentSpeed > 0.1 && modelRef.current) {
      const targetAngle = Math.atan2(moveVec.x, moveVec.z);
      let currentAngle = modelRef.current.rotation.y;
      let diff = targetAngle - currentAngle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      modelRef.current.rotation.y += diff * 0.12;
    }
  });

  return (
    <RigidBody
      ref={attackerRef}
      colliders={false}
      mass={1}
      type="dynamic"
      position={[0, 2, -15]}
      enabledRotations={[false, false, false]}
      friction={0.5}
    >
      <CapsuleCollider args={[0.55, 0.4]} position={[0, 0.95, 0]} />
      <group ref={modelRef}>
        <AttackerModel attackerRef={attackerRef} />
      </group>
    </RigidBody>
  );
}
