import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Html } from "@react-three/drei";

export default function Cage({ position }) {
  const rigidBodyRef = useRef();
  
  useFrame((state, delta) => {
    if (rigidBodyRef.current) {
      const currentPos = rigidBodyRef.current.translation();
      if (currentPos.y > 0) {
        const nextY = Math.max(0, currentPos.y - delta * 30);
        rigidBodyRef.current.setNextKinematicTranslation({ x: position[0], y: nextY, z: position[2] });
      }
    }
  });

  const bars = [];
  const barCount = 6;
  const size = 3.2;
  const halfSize = size / 2;

  // Front and Back bars
  for (let i = 0; i <= barCount; i++) {
    const offset = -halfSize + (i * size) / barCount;
    bars.push(<mesh key={`f-${i}`} position={[offset, 1.5, halfSize]} castShadow><cylinderGeometry args={[0.05, 0.05, 3, 8]} /><meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.2} /></mesh>);
    bars.push(<mesh key={`b-${i}`} position={[offset, 1.5, -halfSize]} castShadow><cylinderGeometry args={[0.05, 0.05, 3, 8]} /><meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.2} /></mesh>);
  }

  // Left and Right bars
  for (let i = 1; i < barCount; i++) {
    const offset = -halfSize + (i * size) / barCount;
    bars.push(<mesh key={`l-${i}`} position={[-halfSize, 1.5, offset]} castShadow><cylinderGeometry args={[0.05, 0.05, 3, 8]} /><meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.2} /></mesh>);
    bars.push(<mesh key={`r-${i}`} position={[halfSize, 1.5, offset]} castShadow><cylinderGeometry args={[0.05, 0.05, 3, 8]} /><meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.2} /></mesh>);
  }

  return (
    <RigidBody 
      ref={rigidBodyRef} 
      type="kinematicPosition" 
      position={[position[0], 25, position[2]]}
      colliders={false}
    >
      <group>
        {bars}
        {/* Top Rim */}
        <mesh position={[0, 3, 0]} castShadow><boxGeometry args={[3.2, 0.2, 3.2]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
        {/* Bottom Rim */}
        <mesh position={[0, 0, 0]} castShadow><boxGeometry args={[3.2, 0.2, 3.2]} /><meshStandardMaterial color="#1a1a1a" /></mesh>

        <Html position={[0, 4, 0]} center transform>
          <div style={{
            background: 'rgba(180, 0, 0, 0.85)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: '18px',
            border: '2px solid #ff4444',
            boxShadow: '0 0 20px rgba(255,0,0,0.5)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}>
            ⚠️ TRAPPED! Solve the puzzle to escape.
          </div>
        </Html>

        {/* Physics Walls so the player can't walk out */}
        <CuboidCollider args={[1.6, 1.5, 0.1]} position={[0, 1.5, 1.6]} />
        <CuboidCollider args={[1.6, 1.5, 0.1]} position={[0, 1.5, -1.6]} />
        <CuboidCollider args={[0.1, 1.5, 1.6]} position={[1.6, 1.5, 0]} />
        <CuboidCollider args={[0.1, 1.5, 1.6]} position={[-1.6, 1.5, 0]} />
        <CuboidCollider args={[1.6, 0.1, 1.6]} position={[0, 3, 0]} />
      </group>
    </RigidBody>
  );
}