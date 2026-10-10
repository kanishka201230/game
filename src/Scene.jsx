import { RigidBody } from "@react-three/rapier";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PATH_SEGMENTS, DOORS_CONFIG } from "./pathConfig";

// High quality procedural tree component
function DetailedTree({ position, scale = 1, rotationY = 0 }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.85, 9, 8]} />
        <meshStandardMaterial color="#3b2b1d" roughness={0.95} />
      </mesh>
      
      {/* Root Base Accents */}
      <mesh position={[0.6, 0.6, 0]} rotation={[0, 0, 0.45]} castShadow receiveShadow>
         <cylinderGeometry args={[0.2, 0.45, 1.8, 6]} />
         <meshStandardMaterial color="#3b2b1d" roughness={0.95} />
      </mesh>
      <mesh position={[-0.5, 0.6, 0.5]} rotation={[0.2, 0, -0.45]} castShadow receiveShadow>
         <cylinderGeometry args={[0.2, 0.45, 1.8, 6]} />
         <meshStandardMaterial color="#3b2b1d" roughness={0.95} />
      </mesh>

      {/* Foliage Canopy */}
      <mesh position={[0, 9.2, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[3.2]} />
        <meshStandardMaterial color="#224823" roughness={0.8} />
      </mesh>
      <mesh position={[1.6, 8.5, 1.4]} castShadow receiveShadow>
        <dodecahedronGeometry args={[2.7]} />
        <meshStandardMaterial color="#2d592e" roughness={0.8} />
      </mesh>
      <mesh position={[-1.6, 8.0, -1.2]} castShadow receiveShadow>
        <dodecahedronGeometry args={[2.7]} />
        <meshStandardMaterial color="#1b3b1c" roughness={0.8} />
      </mesh>
      <mesh position={[0, 11.2, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[2.2]} />
        <meshStandardMaterial color="#326634" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Background dense tree wall filler to seal the horizon
function DenseBackgroundTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 8, 0]}>
        <cylinderGeometry args={[0.8, 1.4, 16, 6]} />
        <meshStandardMaterial color="#211710" roughness={1} />
      </mesh>
      <mesh position={[0, 15, 0]}>
        <dodecahedronGeometry args={[6]} />
        <meshStandardMaterial color="#16381b" roughness={0.85} />
      </mesh>
    </group>
  );
}

// Interactive Ancient Door Component
function MazeDoor({ config, isUnlocked = false, playerPos }) {
  const [x, y, z] = config.position;
  const isMoonGate = config.type === 'final_moon';
  const isSunGate = config.type === 'final_sun';

  const dist = playerPos ? Math.hypot(playerPos.x - x, playerPos.z - z) : 999;
  const isNearby = dist < 4.8;

  return (
    <group position={[x, y, z]} rotation={config.rotation}>
      {/* Door Frame Pillars */}
      <mesh position={[-2.4, 4.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 9, 1.2]} />
        <meshStandardMaterial color="#555856" roughness={0.85} />
      </mesh>
      <mesh position={[2.4, 4.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 9, 1.2]} />
        <meshStandardMaterial color="#555856" roughness={0.85} />
      </mesh>

      {/* Main Archway Lintel */}
      <mesh position={[0, 9.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.2, 1.2, 1.5]} />
        <meshStandardMaterial color="#454846" roughness={0.85} />
      </mesh>

      {/* Door Panels (Open when unlocked) */}
      <group position={[0, 0, 0]} rotation={[0, isUnlocked ? Math.PI / 2.2 : 0, 0]}>
        <mesh position={[-1.1, 4.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 8.2, 0.4]} />
          <meshStandardMaterial 
            color={isMoonGate ? "#2b3d54" : isSunGate ? "#543d2b" : "#4a3525"} 
            roughness={0.75} 
          />
        </mesh>
      </group>
      <group position={[0, 0, 0]} rotation={[0, isUnlocked ? -Math.PI / 2.2 : 0, 0]}>
        <mesh position={[1.1, 4.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 8.2, 0.4]} />
          <meshStandardMaterial 
            color={isMoonGate ? "#2b3d54" : isSunGate ? "#543d2b" : "#4a3525"} 
            roughness={0.75} 
          />
        </mesh>
      </group>

      {/* Glowing Emblems */}
      {isMoonGate && (
        <mesh position={[0, 7.5, 0.25]} castShadow>
          <cylinderGeometry args={[0.7, 0.7, 0.1, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#88ccff" emissive="#0088ff" emissiveIntensity={3} />
        </mesh>
      )}
      {isSunGate && (
        <mesh position={[0, 7.5, 0.25]} castShadow>
          <cylinderGeometry args={[0.7, 0.7, 0.1, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#ffcc88" emissive="#ff8800" emissiveIntensity={3} />
        </mesh>
      )}

      {/* Hanging Lanterns */}
      <mesh position={[-1.8, 6.5, 0.8]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.6, 6]} />
        <meshStandardMaterial color="#ffc107" emissive="#ff9800" emissiveIntensity={2.5} />
        <pointLight color="#ffaa33" intensity={10} distance={14} />
      </mesh>
      <mesh position={[1.8, 6.5, 0.8]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.6, 6]} />
        <meshStandardMaterial color="#ffc107" emissive="#ff9800" emissiveIntensity={2.5} />
        <pointLight color="#ffaa33" intensity={10} distance={14} />
      </mesh>

      {/* Interaction Prompt Highlight */}
      {isNearby && !isUnlocked && (
        <mesh position={[0, 2.5, 0.8]}>
          <boxGeometry args={[2.6, 0.65, 0.1]} />
          <meshStandardMaterial color="#a8e0b0" emissive="#4caf50" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  );
}

// Golden Trophy Shrine Component at Final Exit
function TrophyShrine({ position }) {
  const trophyRef = useRef();

  useFrame(({ clock }) => {
    if (trophyRef.current) {
      trophyRef.current.rotation.y = clock.getElapsedTime() * 1.5;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 3.0, 1.2, 12]} />
        <meshStandardMaterial color="#454846" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 2.2, 0.6, 12]} />
        <meshStandardMaterial color="#333634" roughness={0.7} />
      </mesh>

      <group ref={trophyRef} position={[0, 3.2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.7, 0.3, 1.2, 16]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.15} emissive="#ffaa00" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[-0.75, 0.2, 0]} rotation={[0, 0, 0.4]} castShadow>
          <torusGeometry args={[0.3, 0.08, 8, 16]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0.75, 0.2, 0]} rotation={[0, 0, -0.4]} castShadow>
          <torusGeometry args={[0.3, 0.08, 8, 16]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.15} />
        </mesh>
        <pointLight color="#ffe57f" intensity={25} distance={30} />
      </group>
    </group>
  );
}

// 100% Mathematically Exact 3D Branching Path Geometry Generator
// Fixed vertex winding order (v1, v3, v2 & v2, v3, v4) to ensure normals point UPWARDS (+Y)
function MazePathways() {
  const pathGeometries = useMemo(() => {
    return PATH_SEGMENTS.map((seg, idx) => {
      const [x1, z1] = seg.p1;
      const [x2, z2] = seg.p2;
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      if (len === 0) return null;

      const halfW = seg.radius;
      const nx = (-dz / len) * halfW;
      const nz = (dx / len) * halfW;

      // 4 corners of segment quad on XZ plane at Y = 0.08
      const v1 = [x1 + nx, 0.08, z1 + nz];
      const v2 = [x1 - nx, 0.08, z1 - nz];
      const v3 = [x2 + nx, 0.08, z2 + nz];
      const v4 = [x2 - nx, 0.08, z2 - nz];

      // Counter-Clockwise vertex order for upward +Y normals
      const vertices = new Float32Array([
        ...v1, ...v3, ...v2,
        ...v2, ...v3, ...v4
      ]);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geometry.computeVertexNormals();

      return (
        <mesh key={`path-${idx}`} geometry={geometry} receiveShadow>
          <meshStandardMaterial color="#6e4d34" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      );
    });
  }, []);

  return <group>{pathGeometries}</group>;
}

export default function Scene({ unlockedDoors = {}, playerPos }) {
  const { trees, bushes, rocks, logs, bgTrees } = useMemo(() => {
    const treesArr = [];
    const bushesArr = [];
    const rocksArr = [];
    const logsArr = [];
    const bgTreesArr = [];

    // Background forest border wall around perimeter (380x380)
    for (let angle = 0; angle < Math.PI * 2; angle += 0.035) {
      const radius = 155 + (Math.sin(angle * 6) * 15);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius - 75;
      bgTreesArr.push(
        <DenseBackgroundTree key={`bg-${angle}`} position={[x, 0, z]} scale={1.3 + Math.random() * 0.5} />
      );
    }

    // Dense Forest Vegetation throughout maze
    for (let i = 0; i < 350; i++) {
      const r = 5 + Math.random() * 140;
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r - 75;

      let tooCloseToPath = false;
      for (const seg of PATH_SEGMENTS) {
        const dx = seg.p2[0] - seg.p1[0];
        const dz = seg.p2[1] - seg.p1[1];
        const lenSq = dx * dx + dz * dz;
        let t = lenSq === 0 ? 0 : ((x - seg.p1[0]) * dx + (z - seg.p1[1]) * dz) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const projX = seg.p1[0] + t * dx;
        const projZ = seg.p1[1] + t * dz;
        if (Math.hypot(x - projX, z - projZ) < seg.radius + 1.8) {
          tooCloseToPath = true;
          break;
        }
      }

      if (tooCloseToPath) continue;

      const type = Math.random();
      if (type < 0.40) {
        treesArr.push(
          <DetailedTree key={`tree-${i}`} position={[x, 0, z]} scale={0.75 + Math.random() * 0.75} rotationY={Math.random() * Math.PI} />
        );
      } else if (type < 0.70) {
        bushesArr.push(
          <mesh key={`bush-${i}`} position={[x, 0.6 + Math.random() * 0.4, z]} castShadow receiveShadow>
            <dodecahedronGeometry args={[0.9 + Math.random() * 1.6]} />
            <meshStandardMaterial color="#1e4521" roughness={0.9} />
          </mesh>
        );
      } else if (type < 0.88) {
        rocksArr.push(
          <mesh key={`rock-${i}`} position={[x, 0.4, z]} rotation={[Math.random(), Math.random(), Math.random()]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.9, 1.4].map(v => v * (0.6 + Math.random() * 1.4))} />
            <meshStandardMaterial color="#4f524e" roughness={0.8} />
          </mesh>
        );
      } else {
        logsArr.push(
          <mesh key={`log-${i}`} position={[x, 0.35, z]} rotation={[Math.random() * 0.1, Math.random() * Math.PI, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.35, 0.35, 3.5 + Math.random() * 2, 7]} />
            <meshStandardMaterial color="#2d2015" roughness={0.9} />
          </mesh>
        );
      }
    }

    return { trees: treesArr, bushes: bushesArr, rocks: rocksArr, logs: logsArr, bgTrees: bgTreesArr };
  }, []);

  return (
    <>
      {/* Bright Solid green forest ground */}
      <RigidBody type="fixed" friction={1.5}>
        <mesh position={[0, -0.5, -75]} receiveShadow>
          <boxGeometry args={[380, 1, 380]} />
          <meshStandardMaterial color="#214223" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* 3D Branching Maze Pathways */}
      <MazePathways />

      {/* Forest Trees & Undergrowth */}
      {trees}
      {bushes}
      {rocks}
      {logs}
      {bgTrees}

      {/* Doors distributed throughout the maze */}
      {DOORS_CONFIG.map((door) => (
        <MazeDoor
          key={door.id}
          config={door}
          isUnlocked={Boolean(unlockedDoors[door.id])}
          playerPos={playerPos}
        />
      ))}

      {/* Golden Trophy Shrine at Final Exit (Behind Moon Gate Door A at -30, -182) */}
      <TrophyShrine position={[-30, 0, -182]} />
    </>
  );
}
