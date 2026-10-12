import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { PATH_SEGMENTS, DOORS_CONFIG, CLUES_CONFIG } from "./pathConfig";
import Cage from "./Cage";
import {
  getForestGroundTextures,
  getDirtPathTextures,
  getTreeBarkTextures,
  getMossyStoneTextures,
  getHauntedBambooTextures,
  getTempleWoodTextures,
  getTalismanTextures
} from "./textureGenerator";
import {
  ForestPath,
  Rocks as ProceduralRocks,
  ChineseBambooCluster,
  StonePagodaLantern,
  HangingRedGhostLantern,
  GhostSpiritParticle,
  ChineseTempleGateStructure,
  TaoistWardingTalisman,
  DistantGhostMountains,
  ChineseFernBush,
  DenseLeafyShrub,
  ExposedTreeRoots,
  NaturalTerrainMounds
} from "./components/ForestEnvironment";

// 1. Realistic Ancient Gnarled Forest Oak
function RealisticAncientOak({ position, scale = 1, rotationY = 0, barkTextures }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Main Tapered Gnarled Trunk with deep vertical fissures */}
      <mesh position={[0, 5.0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.65, 1.35, 10, 10]} />
        <meshStandardMaterial
          color="#342214"
          roughness={0.92}
          map={barkTextures?.map}
          bumpMap={barkTextures?.bumpMap}
          bumpScale={0.08}
        />
      </mesh>
      
      {/* 5 Organic Buttress Roots sprawling into forest soil */}
      <mesh position={[0.95, 0.9, 0.3]} rotation={[0.1, 0.4, 0.55]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.75, 2.8, 6]} />
        <meshStandardMaterial color="#2a1a0f" roughness={0.95} map={barkTextures?.map} />
      </mesh>
      <mesh position={[-0.85, 0.8, 0.65]} rotation={[0.3, -0.6, -0.58]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.65, 2.6, 6]} />
        <meshStandardMaterial color="#2a1a0f" roughness={0.95} map={barkTextures?.map} />
      </mesh>
      <mesh position={[-0.25, 0.8, -0.95]} rotation={[-0.5, 0.2, -0.25]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.7, 2.7, 6]} />
        <meshStandardMaterial color="#2a1a0f" roughness={0.95} map={barkTextures?.map} />
      </mesh>
      <mesh position={[0.8, 0.7, -0.7]} rotation={[-0.35, 0.8, 0.45]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.55, 2.3, 6]} />
        <meshStandardMaterial color="#2a1a0f" roughness={0.95} map={barkTextures?.map} />
      </mesh>
      <mesh position={[-0.9, 0.7, -0.4]} rotation={[-0.2, -0.7, -0.4]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.58, 2.2, 6]} />
        <meshStandardMaterial color="#2a1a0f" roughness={0.95} map={barkTextures?.map} />
      </mesh>

      {/* Spreading Lateral Boughs / Branches jutting outward */}
      <mesh position={[1.4, 7.8, 0.5]} rotation={[0.2, 0.3, 0.75]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.42, 3.6, 6]} />
        <meshStandardMaterial color="#301f13" roughness={0.9} map={barkTextures?.map} />
      </mesh>
      <mesh position={[-1.3, 8.2, -0.6]} rotation={[-0.3, -0.4, -0.72]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.4, 3.4, 6]} />
        <meshStandardMaterial color="#301f13" roughness={0.9} map={barkTextures?.map} />
      </mesh>
      <mesh position={[0.4, 8.6, -1.3]} rotation={[-0.7, 0.2, 0.1]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.38, 3.2, 6]} />
        <meshStandardMaterial color="#301f13" roughness={0.9} map={barkTextures?.map} />
      </mesh>

      {/* Primary Canopy Foliage Tier 1 - Deep Forest Emerald */}
      <mesh position={[0, 9.8, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[4.2, 1]} />
        <meshStandardMaterial color="#1a3f20" roughness={0.78} bumpMap={barkTextures?.bumpMap} bumpScale={0.03} />
      </mesh>

      {/* Subsurface Canopy Clusters - Tier 2 (Natural asymmetry & layered depth) */}
      <mesh position={[2.4, 9.4, 1.8]} castShadow receiveShadow>
        <dodecahedronGeometry args={[3.3, 1]} />
        <meshStandardMaterial color="#224e27" roughness={0.75} />
      </mesh>
      <mesh position={[-2.5, 9.0, -1.6]} castShadow receiveShadow>
        <dodecahedronGeometry args={[3.4, 1]} />
        <meshStandardMaterial color="#18381c" roughness={0.82} />
      </mesh>
      <mesh position={[-1.4, 11.2, 2.0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[3.0, 1]} />
        <meshStandardMaterial color="#204a25" roughness={0.78} />
      </mesh>
      <mesh position={[1.2, 11.6, -1.8]} castShadow receiveShadow>
        <dodecahedronGeometry args={[2.9, 1]} />
        <meshStandardMaterial color="#295b2f" roughness={0.75} />
      </mesh>

      {/* Upper Sunlit Crown - Golden Green Highlights */}
      <mesh position={[0.2, 13.6, -0.3]} castShadow receiveShadow>
        <dodecahedronGeometry args={[2.8, 1]} />
        <meshStandardMaterial color="#36703c" roughness={0.7} />
      </mesh>
    </group>
  );
}

// 2. Realistic Towering Conifer / Ancient Pine Tree (22-26 units high)
function RealisticTallPine({ position, scale = 1, rotationY = 0, barkTextures }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Tall straight rough-bark conifer trunk */}
      <mesh position={[0, 11.0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.85, 22, 8]} />
        <meshStandardMaterial
          color="#2a1b11"
          roughness={0.94}
          map={barkTextures?.map}
          bumpMap={barkTextures?.bumpMap}
          bumpScale={0.07}
        />
      </mesh>
      {/* Buttress root flares */}
      <mesh position={[0.5, 0.6, 0.2]} rotation={[0.1, 0.2, 0.4]} castShadow>
        <cylinderGeometry args={[0.15, 0.45, 1.8, 5]} />
        <meshStandardMaterial color="#24160e" roughness={0.95} />
      </mesh>
      <mesh position={[-0.45, 0.6, -0.3]} rotation={[-0.2, 0.3, -0.45]} castShadow>
        <cylinderGeometry args={[0.15, 0.45, 1.8, 5]} />
        <meshStandardMaterial color="#24160e" roughness={0.95} />
      </mesh>

      {/* 6 Drooping Conical Needle Bough Tiers */}
      {/* Tier 1 - Low spreading evergreen bough */}
      <mesh position={[0, 6.0, 0]} castShadow receiveShadow>
        <coneGeometry args={[4.2, 3.6, 7]} />
        <meshStandardMaterial color="#142e18" roughness={0.82} />
      </mesh>
      {/* Tier 2 */}
      <mesh position={[0, 9.6, 0]} castShadow receiveShadow>
        <coneGeometry args={[3.6, 3.4, 7]} />
        <meshStandardMaterial color="#18361d" roughness={0.8} />
      </mesh>
      {/* Tier 3 */}
      <mesh position={[0, 13.0, 0]} castShadow receiveShadow>
        <coneGeometry args={[3.0, 3.0, 7]} />
        <meshStandardMaterial color="#1e4424" roughness={0.78} />
      </mesh>
      {/* Tier 4 */}
      <mesh position={[0, 16.2, 0]} castShadow receiveShadow>
        <coneGeometry args={[2.4, 2.6, 7]} />
        <meshStandardMaterial color="#24522c" roughness={0.76} />
      </mesh>
      {/* Tier 5 */}
      <mesh position={[0, 19.2, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.7, 2.2, 7]} />
        <meshStandardMaterial color="#2b5f34" roughness={0.74} />
      </mesh>
      {/* Tier 6 - Sunlit Pine Crown Needle Spike */}
      <mesh position={[0, 21.8, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.0, 2.0, 6]} />
        <meshStandardMaterial color="#36733e" roughness={0.72} />
      </mesh>
    </group>
  );
}

// 3. Dense Horizon Silhouettes for Sealing Distant Forest Depth
function DenseCanopyBackgroundTree({ position, scale = 1, barkTextures }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 12, 0]}>
        <cylinderGeometry args={[0.9, 1.9, 24, 6]} />
        <meshStandardMaterial color="#1a120b" roughness={1.0} map={barkTextures?.map} />
      </mesh>
      <mesh position={[0, 20, 0]}>
        <dodecahedronGeometry args={[8.0, 1]} />
        <meshStandardMaterial color="#102614" roughness={0.88} />
      </mesh>
      <mesh position={[0, 27, 0]}>
        <dodecahedronGeometry args={[6.0, 1]} />
        <meshStandardMaterial color="#0d2011" roughness={0.88} />
      </mesh>
    </group>
  );
}

// 4. Ancient Mythic Moss-Covered Boulder Cluster
function MossyBoulder({ position, scale = 1, rotation, stoneTextures }) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Main Boulder */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <dodecahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial
          color="#3c423a"
          roughness={0.9}
          map={stoneTextures?.map}
        />
      </mesh>
      {/* Small companion mossy river stone */}
      <mesh castShadow receiveShadow position={[0.9, 0.2, 0.4]}>
        <dodecahedronGeometry args={[0.65, 1]} />
        <meshStandardMaterial
          color="#343a32"
          roughness={0.92}
          map={stoneTextures?.map}
        />
      </mesh>
    </group>
  );
}

// 5. Wild Forest Fern Clump (Multi-Frond Curving Leaves)
function ForestFern({ position, scale = 1, rotationY = 0 }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {[0, 0.78, 1.57, 2.35, 3.14, 3.92, 4.71, 5.49].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.42, 0.38, Math.sin(angle) * 0.42]}
          rotation={[0.48, angle, 0]}
          castShadow
        >
          <planeGeometry args={[0.5, 1.2]} />
          <meshStandardMaterial color="#265a2a" roughness={0.65} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// 6. Fallen Mossy Log with Shelf Mushrooms (Realistic Forest Floor Detail)
function FallenMossyLog({ position, scale = 1, rotationY = 0, barkTextures }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Fallen decaying trunk */}
      <mesh position={[0, 0.32, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.36, 3.4, 7]} />
        <meshStandardMaterial
          color="#322013"
          roughness={0.95}
          map={barkTextures?.map}
        />
      </mesh>
      {/* Velvet moss layer on top */}
      <mesh position={[0, 0.48, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.38, 2.8, 7, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#28562d" roughness={0.88} />
      </mesh>
      {/* Tiny bracket / shelf mushrooms protruding */}
      <mesh position={[0.6, 0.42, 0.28]} rotation={[0.4, 0.2, 0]}>
        <cylinderGeometry args={[0.14, 0.04, 0.04, 6]} />
        <meshStandardMaterial color="#d4a373" roughness={0.7} />
      </mesh>
      <mesh position={[-0.5, 0.38, -0.28]} rotation={[-0.3, 0.4, 0]}>
        <cylinderGeometry args={[0.11, 0.04, 0.04, 6]} />
        <meshStandardMaterial color="#e9edc9" roughness={0.7} />
      </mesh>
    </group>
  );
}

// 7. Chinese Mountain Pine (Huangshan Pine - Black Myth: Wukong style)
function ChineseHuangshanPine({ position, scale = 1, rotationY = 0, barkTextures }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Gnarled Sinuous Ancient Trunk */}
      <mesh position={[0, 3.2, 0]} rotation={[0.08, 0, 0.12]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.95, 6.5, 8]} />
        <meshStandardMaterial color="#2c1a0e" roughness={0.92} map={barkTextures?.map} />
      </mesh>
      <mesh position={[0.6, 7.2, 0.3]} rotation={[-0.15, 0.3, -0.25]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.55, 5.5, 7]} />
        <meshStandardMaterial color="#2c1a0e" roughness={0.92} map={barkTextures?.map} />
      </mesh>
      {/* Reaching Ancient Branch Left */}
      <mesh position={[-1.5, 6.8, -0.4]} rotation={[0.2, -0.4, -0.65]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.38, 4.2, 6]} />
        <meshStandardMaterial color="#2a180c" roughness={0.9} map={barkTextures?.map} />
      </mesh>
      {/* Reaching Ancient Branch Right */}
      <mesh position={[2.1, 8.2, 0.5]} rotation={[-0.1, 0.5, 0.72]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.35, 4.5, 6]} />
        <meshStandardMaterial color="#2a180c" roughness={0.9} map={barkTextures?.map} />
      </mesh>
      {/* Flat Tiered Pine Needle Pads (Horizontal foliage plates) */}
      {[
        [-2.8, 7.8, -0.8, 2.2],
        [3.6, 9.4, 0.8, 2.4],
        [0.8, 10.2, 0.4, 3.0],
        [-0.6, 11.6, -0.2, 2.6],
        [1.2, 12.8, 0.2, 1.8]
      ].map(([px, py, pz, r], idx) => (
        <group key={`pad-${idx}`} position={[px, py, pz]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[r, r * 1.15, 0.45, 8]} />
            <meshStandardMaterial color={idx % 2 === 0 ? "#1a3d1f" : "#224c28"} roughness={0.8} />
          </mesh>
        </group>
      ))}
      {/* Buttress Surface Roots crawling into soil */}
      <mesh position={[0.8, 0.4, 0.3]} rotation={[0.1, 0.2, 0.4]} castShadow>
        <cylinderGeometry args={[0.2, 0.5, 2.2, 6]} />
        <meshStandardMaterial color="#28170b" roughness={0.95} map={barkTextures?.map} />
      </mesh>
      <mesh position={[-0.7, 0.4, -0.4]} rotation={[-0.2, 0.3, -0.45]} castShadow>
        <cylinderGeometry args={[0.18, 0.48, 2.2, 6]} />
        <meshStandardMaterial color="#28170b" roughness={0.95} map={barkTextures?.map} />
      </mesh>
    </group>
  );
}

// 7.1 Natural Shrub & Fern Adapter (Replaces primitive sphere bushes)
function WildflowerBush({ position, scale = 1, rotationY = 0 }) {
  return (
    <ChineseFernBush position={position} scale={scale} rotationY={rotationY} />
  );
}

// 8. Ancient Stone Totem / Trail Stupa Marker
function AncientStonePillar({ position, scale = 1, rotationY = 0, stoneTextures }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Stepped Granite Base */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.8, 1.5]} />
        <meshStandardMaterial color="#363835" roughness={0.9} map={stoneTextures?.map} />
      </mesh>
      {/* Tapered Carved Monolith */}
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 2.8, 1.0]} />
        <meshStandardMaterial color="#3c403a" roughness={0.88} map={stoneTextures?.map} />
      </mesh>
      {/* Weathered Stone Pagoda Cap */}
      <mesh position={[0, 3.8, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.1, 0.7, 4]} rotation={[0, Math.PI / 4, 0]} />
        <meshStandardMaterial color="#2d302c" roughness={0.9} map={stoneTextures?.map} />
      </mesh>
      {/* Soft Ethereal Runic Glow */}
      <pointLight color="#7fe3a6" intensity={2.5} distance={5} position={[0, 2.5, 0]} />
    </group>
  );
}

// 10. Floating Forest Spores & Firefly Dust Motes (Atmospheric Particles)
function ForestAtmosphere() {
  const pointsRef = useRef();

  const particleData = useMemo(() => {
    const count = 320;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = Math.random() * 14 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 180 - 70;
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const t = clock.getElapsedTime();
      const pos = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += Math.sin(t * 1.2 + pos[i]) * 0.006;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleData, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffe299"
        size={0.25}
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 6. Mythic Collectible Hidden Clue (Ancient glowing rune / tablet / scroll pedestal)
function CollectibleClue({ config, isCollected, playerPosRef, stoneTextures, isQuestionOpen = false }) {
  const [x, y, z] = config.position;
  const runeRef = useRef();
  const ringRef = useRef();
  const [isNear, setIsNear] = useState(false);
  const nearRef = useRef(false);

  useFrame(({ clock }) => {
    if (isCollected) return;
    const t = clock.getElapsedTime() + (config.order || 0);
    if (runeRef.current) {
      runeRef.current.rotation.y = t * 1.6;
      runeRef.current.rotation.z = Math.sin(t * 1.3) * 0.15;
      runeRef.current.position.y = 1.3 + Math.sin(t * 2.2) * 0.12;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = -t * 1.1;
      const s = 1.0 + Math.sin(t * 2.8) * 0.12;
      ringRef.current.scale.set(s, s, s);
    }
    if (playerPosRef && playerPosRef.current) {
      const dist = Math.hypot(playerPosRef.current.x - x, playerPosRef.current.z - z);
      const near = dist <= 2.8;
      if (near !== nearRef.current) {
        nearRef.current = near;
        setIsNear(near);
      }
    }
  });

  if (isCollected) {
    // Dormant ancient stone base once gathered
    return (
      <group position={[x, y, z]}>
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.75, 0.5, 8]} />
          <meshStandardMaterial color="#222b24" roughness={0.95} map={stoneTextures?.map} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[x, y, z]}>
      {/* Carved Mossy Stone Pedestal Base */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.75, 0.7, 8]} />
        <meshStandardMaterial color="#2d382e" roughness={0.9} map={stoneTextures?.map} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.55, 0.2, 8]} />
        <meshStandardMaterial color="#1f2920" roughness={0.88} />
      </mesh>

      {/* Floating Glowing Turquoise Runic Crystal / Scroll */}
      <group ref={runeRef} position={[0, 1.3, 0]}>
        <mesh castShadow>
          <octahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial
            color="#2ae9aa"
            metalness={0.2}
            roughness={0.15}
            emissive="#00ffcc"
            emissiveIntensity={3.2}
          />
        </mesh>
        {/* Core Radiance */}
        <mesh>
          <dodecahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#b3ffea"
            emissiveIntensity={4.5}
          />
        </mesh>
        {/* Subtle Turquoise Point Light */}
        <pointLight color="#2ae9aa" intensity={16} distance={12} />
      </group>

      {/* Rotating Magic Runic Ring */}
      <group ref={ringRef} position={[0, 1.3, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.62, 0.035, 8, 24]} />
          <meshStandardMaterial
            color="#2ae9aa"
            emissive="#2ae9aa"
            emissiveIntensity={2.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* Proximity 3D Notification Label */}
      {isNear && !isQuestionOpen && (
        <Html position={[0, 2.4, 0]} center distanceFactor={14} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{
            background: 'rgba(6, 26, 18, 0.95)',
            border: '2px solid #2ae9aa',
            borderRadius: '20px',
            padding: '6px 16px',
            color: '#e2f0d9',
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 22px rgba(42, 233, 170, 0.65)',
            textAlign: 'center'
          }}>
            <div style={{ color: '#2ae9aa', letterSpacing: '1px' }}>📜 {config.name}</div>
            <div style={{ color: '#ffd700', fontSize: '11px', marginTop: '2px' }}>[E] Press E to Collect Clue</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// 11. Interactive Ancient Mountain Gate with Distinct Route Themes
function MazeDoor({ config, isUnlocked = false, playerPosRef, stoneTextures, isQuestionOpen = false }) {
  const [x, y, z] = config.position;
  const isDoor1 = config.id === 'door1';
  const isDoor2 = config.id === 'door2';
  const isDoor3 = config.id === 'door3';
  const isMoonGate = config.id === 'doorA' || config.type === 'final_moon' || config.type === 'passcode';
  const isSunGate = config.id === 'doorB' || config.type === 'final_sun' || config.type === 'trap';
  
  const highlightRef = useRef();
  const [isNear, setIsNear] = useState(false);
  const nearRef = useRef(false);

  // Theme-specific colors & materials
  const pillarColor = isDoor1 ? "#2c382e" : isDoor2 ? "#1a1a24" : isDoor3 ? "#3a3428" : isMoonGate ? "#1c2633" : isSunGate ? "#362218" : "#323832";
  const runeColor = isUnlocked ? "#70e000" : isDoor1 ? "#2ae9aa" : isDoor2 ? "#c084fc" : isDoor3 ? "#fbbf24" : isMoonGate ? "#38bdf8" : isSunGate ? "#f97316" : "#2dd4bf";
  const lanternColor = isUnlocked ? "#70e000" : isDoor1 ? "#10b981" : isDoor2 ? "#a855f7" : isDoor3 ? "#f59e0b" : isMoonGate ? "#0ea5e9" : isSunGate ? "#ea580c" : "#ff9800";

  useFrame(() => {
    if (playerPosRef && playerPosRef.current) {
      const dist = Math.hypot(playerPosRef.current.x - x, playerPosRef.current.z - z);
      const near = dist <= 3.2;
      if (near !== nearRef.current) {
        nearRef.current = near;
        setIsNear(near);
      }
      if (highlightRef.current) {
        highlightRef.current.visible = near && !isUnlocked;
      }
    }
  });

  return (
    <group position={[x, y, z]} rotation={config.rotation}>
      {/* Physical Rapier Colliders across locked gate preventing player crossing */}
      {!isUnlocked && (
        <>
          {/* Main central gateway barrier */}
          <RigidBody type="fixed" position={[0, 4.5, 0]}>
            <CuboidCollider args={[2.4, 4.5, 0.4]} />
          </RigidBody>
          {/* Left flanking barrier sealing trees/side bypass */}
          <RigidBody type="fixed" position={[-5.2, 4.5, 0]}>
            <CuboidCollider args={[2.6, 4.5, 0.4]} />
          </RigidBody>
          {/* Right flanking barrier sealing trees/side bypass */}
          <RigidBody type="fixed" position={[5.2, 4.5, 0]}>
            <CuboidCollider args={[2.6, 4.5, 0.4]} />
          </RigidBody>
        </>
      )}

      {/* Weathered Stone Base Plinths */}
      <mesh position={[-2.4, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 1.2, 1.7]} />
        <meshStandardMaterial color={pillarColor} roughness={0.92} map={stoneTextures?.map} />
      </mesh>
      <mesh position={[2.4, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 1.2, 1.7]} />
        <meshStandardMaterial color={pillarColor} roughness={0.92} map={stoneTextures?.map} />
      </mesh>

      {/* Massive Carved Stone Pillars with Glowing Runic Engravings */}
      <mesh position={[-2.4, 5.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 8.4, 1.3]} />
        <meshStandardMaterial color={pillarColor} roughness={0.88} map={stoneTextures?.map} />
      </mesh>
      {/* Left Pillar Glowing Runic Channel */}
      <mesh position={[-2.4, 5.2, 0.66]}>
        <boxGeometry args={[0.22, 5.6, 0.04]} />
        <meshStandardMaterial
          color={runeColor}
          emissive={runeColor}
          emissiveIntensity={isUnlocked ? 3.2 : 2.0}
        />
      </mesh>

      <mesh position={[2.4, 5.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 8.4, 1.3]} />
        <meshStandardMaterial color={pillarColor} roughness={0.88} map={stoneTextures?.map} />
      </mesh>
      {/* Right Pillar Glowing Runic Channel */}
      <mesh position={[2.4, 5.2, 0.66]}>
        <boxGeometry args={[0.22, 5.6, 0.04]} />
        <meshStandardMaterial
          color={runeColor}
          emissive={runeColor}
          emissiveIntensity={isUnlocked ? 3.2 : 2.0}
        />
      </mesh>

      {/* Route 1 Special: Creeping Emerald Ivy & Vines climbing up stone pillars */}
      {isDoor1 && (
        <>
          <mesh position={[-2.4, 4.0, 0.68]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 6.0, 5]} />
            <meshStandardMaterial color="#1f5424" roughness={0.7} />
          </mesh>
          <mesh position={[-2.15, 5.2, 0.68]} rotation={[0, 0, 0.4]}>
            <dodecahedronGeometry args={[0.35, 0]} />
            <meshStandardMaterial color="#2d7335" roughness={0.65} />
          </mesh>
          <mesh position={[2.4, 4.2, 0.68]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 6.2, 5]} />
            <meshStandardMaterial color="#1f5424" roughness={0.7} />
          </mesh>
          <mesh position={[2.15, 3.8, 0.68]} rotation={[0, 0, -0.3]}>
            <dodecahedronGeometry args={[0.38, 0]} />
            <meshStandardMaterial color="#2d7335" roughness={0.65} />
          </mesh>
        </>
      )}

      {/* Route 2 Special: Obsidian Shadow Finials & Spikes on Pillars */}
      {isDoor2 && (
        <>
          <mesh position={[-2.4, 9.8, 0]} castShadow>
            <coneGeometry args={[0.45, 1.2, 4]} />
            <meshStandardMaterial color="#121218" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[2.4, 9.8, 0]} castShadow>
            <coneGeometry args={[0.45, 1.2, 4]} />
            <meshStandardMaterial color="#121218" metalness={0.6} roughness={0.3} />
          </mesh>
        </>
      )}

      {/* Ethereal Open Gate Energy Field (when unlocked) */}
      {isUnlocked && (
        <mesh position={[0, 4.4, 0]}>
          <planeGeometry args={[4.4, 8.2]} />
          <meshBasicMaterial color="#52b788" transparent opacity={0.22} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Temple Archway Eaves & Lintel */}
      <mesh position={[0, 9.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[8.0, 1.4, 2.2]} />
        <meshStandardMaterial color={pillarColor} roughness={0.8} map={stoneTextures?.map} />
      </mesh>
      {/* Traditional Swept Roof Overhang */}
      <mesh position={[0, 10.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[9.0, 0.5, 3.0]} />
        <meshStandardMaterial color="#16241c" roughness={0.7} />
      </mesh>

      {/* Seasoned Timber Door Panels (Swing open smoothly when unlocked) */}
      <group position={[0, 0, 0]} rotation={[0, isUnlocked ? Math.PI / 2.2 : 0, 0]}>
        <mesh position={[-1.1, 4.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 8.4, 0.42]} />
          <meshStandardMaterial 
            color={isMoonGate ? "#1b2a3d" : isSunGate ? "#3d2417" : isDoor2 ? "#181a20" : isDoor1 ? "#203022" : "#322216"} 
            roughness={0.75} 
          />
        </mesh>
      </group>
      <group position={[0, 0, 0]} rotation={[0, isUnlocked ? -Math.PI / 2.2 : 0, 0]}>
        <mesh position={[1.1, 4.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 8.4, 0.42]} />
          <meshStandardMaterial 
            color={isMoonGate ? "#1b2a3d" : isSunGate ? "#3d2417" : isDoor2 ? "#181a20" : isDoor1 ? "#203022" : "#322216"} 
            roughness={0.75} 
          />
        </mesh>
      </group>

      {/* Ancient Runic Emblems & Insignias */}
      {isMoonGate && (
        <group position={[0, 7.8, 0.35]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.9, 0.9, 0.12, 24]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#73d2ff" emissive="#00a2ff" emissiveIntensity={3.2} />
          </mesh>
          <mesh position={[0.2, 0.1, 0.08]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={3.5} />
          </mesh>
        </group>
      )}
      {isDoor3 && (
        <group position={[0, 7.8, 0.35]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.85, 0.85, 0.12, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={3.0} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#ffffff" emissive="#fbbf24" emissiveIntensity={3.8} />
          </mesh>
        </group>
      )}
      {isSunGate && (
        <mesh position={[0, 7.8, 0.35]} castShadow>
          <cylinderGeometry args={[0.85, 0.85, 0.12, 24]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#ffbb66" emissive="#ff6600" emissiveIntensity={3.2} />
        </mesh>
      )}

      {/* Atmospheric Hanging Route Lanterns */}
      <mesh position={[-2.4, 7.2, 1.1]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.7, 8]} />
        <meshStandardMaterial color={lanternColor} emissive={lanternColor} emissiveIntensity={3.2} />
        <pointLight color={lanternColor} intensity={14} distance={16} />
      </mesh>
      <mesh position={[2.4, 7.2, 1.1]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.7, 8]} />
        <meshStandardMaterial color={lanternColor} emissive={lanternColor} emissiveIntensity={3.2} />
        <pointLight color={lanternColor} intensity={14} distance={16} />
      </mesh>

      {/* Visible 3D Gate Label Badge Above Archway Lintel (Hidden when Question Modal is Open) */}
      {!isQuestionOpen && (
        <Html position={[0, 11.6, 0]} center distanceFactor={16} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{
            background: isUnlocked ? 'rgba(5, 30, 18, 0.95)' : 'rgba(4, 20, 16, 0.95)',
            border: `2px solid ${isUnlocked ? '#2ae9aa' : runeColor}`,
            borderRadius: '12px',
            padding: '7px 16px',
            color: '#ffffff',
            textAlign: 'center',
            fontFamily: "'Cinzel', serif, Georgia",
            boxShadow: `0 0 25px ${isUnlocked ? 'rgba(42, 233, 170, 0.55)' : 'rgba(0,0,0,0.8)'}`,
            whiteSpace: 'nowrap'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '1px', color: isUnlocked ? '#a7f3d0' : '#ffe8a3' }}>
              {config.name}
            </div>
            <div style={{ fontSize: '10px', color: '#6ee7b7', marginTop: '2px', letterSpacing: '0.5px' }}>
              {config.branch}
            </div>
            <div style={{
              fontSize: '11px',
              fontWeight: 800,
              marginTop: '4px',
              color: isUnlocked ? '#4ade80' : '#f87171',
              letterSpacing: '1px'
            }}>
              {isUnlocked ? '🔓 OPEN' : config.type === 'passcode' ? '🔒 PASSCODE SEALED' : '🔒 LOCKED'}
            </div>
          </div>
        </Html>
      )}

      {/* Proximity Interaction Prompt When Player Approaches (Hidden when Question Modal is Open) */}
      {isNear && !isUnlocked && !isQuestionOpen && (
        <Html position={[0, 3.2, 1.2]} center distanceFactor={13} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{
            background: 'rgba(4, 24, 18, 0.96)',
            border: '2px solid #2ae9aa',
            borderRadius: '24px',
            padding: '8px 22px',
            color: '#ffffff',
            textAlign: 'center',
            fontFamily: "'Cinzel', serif, Georgia",
            fontSize: '13px',
            fontWeight: 800,
            boxShadow: '0 0 25px rgba(42, 233, 170, 0.7)',
            whiteSpace: 'nowrap',
            letterSpacing: '0.5px'
          }}>
            <span style={{ color: '#ffd700' }}>[E]</span> {config.type === 'passcode' ? 'Press E to Enter Passcode' : 'Press E to Interact'}
          </div>
        </Html>
      )}

      {/* Interaction Highlight Mesh Ground Guide */}
      {!isUnlocked && (
        <mesh ref={highlightRef} position={[0, 0.15, 0.8]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <planeGeometry args={[3.2, 1.6]} />
          <meshBasicMaterial color="#52b788" transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
}

// 8. Mythic Treasure Chamber & Interactive Golden Trophy Altar
function TreasureChamber({
  position,
  stoneTextures,
  playerPosRef,
  isUnlockedFinalDoor = false,
  isVictory = false,
  allObjectivesMet = false,
  isQuestionOpen = false
}) {
  const trophyRef = useRef();
  const burstRef = useRef();
  const auraRef = useRef();
  const [isNear, setIsNear] = useState(false);
  const nearRef = useRef(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (trophyRef.current) {
      trophyRef.current.rotation.y = t * 1.5;
      trophyRef.current.position.y = 3.6 + Math.sin(t * 2.2) * 0.14;
    }
    if (auraRef.current) {
      auraRef.current.rotation.y = -t * 0.8;
      const s = 1.0 + Math.sin(t * 2.5) * 0.12;
      auraRef.current.scale.set(s, s, s);
    }
    if (burstRef.current && isVictory) {
      burstRef.current.rotation.y = t * 2.0;
      const pulse = 1.0 + Math.sin(t * 4.0) * 0.25;
      burstRef.current.scale.set(pulse, pulse, pulse);
    }

    if (playerPosRef && playerPosRef.current) {
      const dist = Math.hypot(playerPosRef.current.x - position[0], playerPosRef.current.z - position[2]);
      const near = dist <= 4.2;
      if (near !== nearRef.current) {
        nearRef.current = near;
        setIsNear(near);
      }
    }
  });

  return (
    <group position={position}>
      {/* 1. Octagonal Carved Stone Sanctuary Steps & Dais */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.2, 4.8, 0.8, 8]} />
        <meshStandardMaterial color="#2d332d" roughness={0.88} map={stoneTextures?.map} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.2, 3.8, 0.8, 8]} />
        <meshStandardMaterial color="#252b25" roughness={0.85} map={stoneTextures?.map} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.0, 2.5, 0.7, 8]} />
        <meshStandardMaterial color="#1d221d" roughness={0.82} map={stoneTextures?.map} />
      </mesh>
      {/* Central Trophy Plinth */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.3, 0.8, 16]} />
        <meshStandardMaterial color="#181c18" roughness={0.8} map={stoneTextures?.map} />
      </mesh>

      {/* Dedicated Golden Overhead Celestial Spotlight */}
      <spotLight
        position={[0, 16, 0]}
        target-position={[0, 3, 0]}
        angle={0.52}
        penumbra={0.75}
        intensity={50}
        color="#ffd700"
        castShadow
        distance={35}
      />

      {/* 2. Six Ancient Sanctuary Ruined Colonnade Pillars & Lintels Framing the Chamber */}
      {[
        [-5.4, 0, -3.1, 0.4],
        [5.4, 0, -3.1, -0.4],
        [-5.4, 0, 3.1, -0.3],
        [5.4, 0, 3.1, 0.3],
        [0, 0, -6.2, 0.0],
        [0, 0, 6.2, 0.0],
      ].map(([px, py, pz, rot], idx) => (
        <group key={`sanctuary-pillar-${idx}`} position={[px, py, pz]} rotation={[0, rot, 0]}>
          <mesh position={[0, 3.8, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.55, 0.8, 7.6, 8]} />
            <meshStandardMaterial color="#2d362e" roughness={0.9} map={stoneTextures?.map} />
          </mesh>
          <mesh position={[0, 7.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.7, 0.6, 1.7]} />
            <meshStandardMaterial color="#202621" roughness={0.88} />
          </mesh>
          {/* Weathered broken architrave lintel */}
          <mesh position={[0.6, 8.3, 0]} rotation={[0, 0, 0.1]} castShadow receiveShadow>
            <boxGeometry args={[2.4, 0.5, 1.2]} />
            <meshStandardMaterial color="#242b25" roughness={0.9} map={stoneTextures?.map} />
          </mesh>
          {/* Golden Sanctuary Lanterns */}
          <mesh position={[0, 5.2, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.6, 8]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffb700" emissiveIntensity={3.2} />
            <pointLight color="#ffc107" intensity={10} distance={14} />
          </mesh>
        </group>
      ))}

      {/* 3. Golden Treasure Chest beside Altar (Left side) */}
      <group position={[-2.2, 0.8, 1.2]} rotation={[0, 0.45, 0]}>
        {/* Chest Lower Body */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.8, 1.0]} />
          <meshStandardMaterial color="#3e2312" roughness={0.7} />
        </mesh>
        {/* Gold Metal Corner Brackets and Bands */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[1.44, 0.82, 0.35]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} emissive="#ffb700" emissiveIntensity={0.6} />
        </mesh>
        {/* Chest Lid Ajar */}
        <group position={[0, 0.8, -0.48]} rotation={[-0.45, 0, 0]}>
          <mesh position={[0, 0.22, 0.48]} castShadow>
            <cylinderGeometry args={[0.52, 0.52, 1.42, 12, 1, false, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#3e2312" roughness={0.7} />
          </mesh>
        </group>
        {/* Overflowing Gold Coins & Gems inside Chest */}
        <mesh position={[0, 0.82, 0]}>
          <boxGeometry args={[1.2, 0.2, 0.8]} />
          <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.15} emissive="#ffc107" emissiveIntensity={1.8} />
        </mesh>
        {/* Sparkling Treasure Point Light */}
        <pointLight color="#ffd700" intensity={10} distance={8} position={[0, 1.0, 0]} />
      </group>

      {/* 4. Piles of Gold Coins and Ancient Chalices (Right side) */}
      <group position={[2.2, 0.8, 1.0]} rotation={[0, -0.35, 0]}>
        {/* Golden Ceremonial Urn / Chalice */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.15, 0.9, 12]} />
          <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.15} emissive="#ffb700" emissiveIntensity={1.2} />
        </mesh>
        {/* Golden Coin Piles */}
        {[
          [-0.4, 0.1, 0.2],
          [0.35, 0.08, -0.2],
          [0.2, 0.12, 0.35],
          [-0.2, 0.06, -0.35]
        ].map(([cx, cy, cz], idx) => (
          <mesh key={`coin-pile-${idx}`} position={[cx, cy, cz]} castShadow>
            <cylinderGeometry args={[0.22, 0.25, 0.15, 10]} />
            <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.12} emissive="#ffc107" emissiveIntensity={1.5} />
          </mesh>
        ))}
      </group>

      {/* 5. The Golden Trophy (Interactive Grand Prize) */}
      <group ref={trophyRef} position={[0, 3.6, 0]}>
        {/* Trophy Base Ring */}
        <mesh position={[0, -0.7, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.65, 0.25, 16]} />
          <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.15} emissive="#ffaa00" emissiveIntensity={1.5} />
        </mesh>
        {/* Trophy Stem */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.25, 0.5, 16]} />
          <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.15} emissive="#ffaa00" emissiveIntensity={1.5} />
        </mesh>
        {/* Trophy Cup Body */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.72, 0.28, 1.1, 16]} />
          <meshStandardMaterial
            color="#ffd700"
            metalness={0.96}
            roughness={0.12}
            emissive="#ffb700"
            emissiveIntensity={2.5}
          />
        </mesh>
        {/* Inner Glowing Celestial Core */}
        <mesh position={[0, 0.45, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffe8a3"
            emissiveIntensity={4.5}
          />
        </mesh>
        {/* Left Ornate Curved Handle */}
        <mesh position={[-0.8, 0.3, 0]} rotation={[0, 0, 0.4]} castShadow>
          <torusGeometry args={[0.34, 0.08, 8, 16]} />
          <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.15} emissive="#ffaa00" emissiveIntensity={1.5} />
        </mesh>
        {/* Right Ornate Curved Handle */}
        <mesh position={[0.8, 0.3, 0]} rotation={[0, 0, -0.4]} castShadow>
          <torusGeometry args={[0.34, 0.08, 8, 16]} />
          <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.15} emissive="#ffaa00" emissiveIntensity={1.5} />
        </mesh>
        {/* Radiant Celestial Trophy Light */}
        <pointLight color="#ffe57f" intensity={isVictory ? 55 : 32} distance={32} />
      </group>

      {/* Rotating Celestial Golden Ring */}
      <group ref={auraRef} position={[0, 3.6, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.035, 8, 32]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={3} transparent opacity={0.75} />
        </mesh>
      </group>

      {/* Floating Turquoise & Golden Magical Spores */}
      <points position={[0, 3.5, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={36}
            array={new Float32Array([
              -1.2, 0.5, 1.1,  1.4, 1.2, -0.8,  -0.8, 1.8, -1.2,  1.1, 0.2, 1.3,
              -1.5, 1.0, -0.5, 0.5, 2.2, 1.0,   -0.4, 0.6, 1.5,   1.3, 1.7, 0.3,
              -1.1, 2.5, 0.8,  0.8, 0.8, -1.4,  -1.6, 0.4, -1.0,  1.5, 2.0, -1.1,
              -0.3, 1.4, -1.5, 1.2, 2.5, 0.6,   -1.4, 2.0, -0.4,  0.2, 0.4, -1.6,
              -0.7, 0.9, 1.6,  1.6, 1.0, 0.9,   -0.9, 2.2, -1.3,  0.7, 1.6, -1.5,
              -1.3, 1.5, 1.2,  1.0, 0.5, -1.6,  -0.5, 2.6, 0.4,   1.4, 0.9, -1.2,
              -0.2, 1.8, 1.4,  0.9, 2.8, -0.6,  -1.5, 1.2, 0.5,   1.2, 1.4, 1.4,
              -1.0, 0.7, -1.4, 0.4, 1.1, 1.7,   -0.6, 2.4, -0.8,  1.5, 2.2, 0.8,
              -1.4, 1.9, 1.1,  0.6, 0.3, -1.5,  -1.2, 2.7, -0.5,  1.1, 2.1, -1.3
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.16} color="#ffd700" transparent opacity={0.85} />
      </points>

      {/* Victory Golden Explosion Flare Sphere */}
      {isVictory && (
        <group ref={burstRef} position={[0, 3.6, 0]}>
          <mesh>
            <sphereGeometry args={[1.8, 16, 16]} />
            <meshStandardMaterial
              color="#ffd700"
              emissive="#ffe57f"
              emissiveIntensity={5}
              transparent
              opacity={0.35}
            />
          </mesh>
        </group>
      )}

      {/* 3D Proximity Interaction Prompt (Visible when Player Approaches) */}
      {isNear && isUnlockedFinalDoor && !isVictory && !isQuestionOpen && (
        <Html position={[0, 5.2, 0]} center distanceFactor={14} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{
            background: allObjectivesMet ? 'rgba(15, 38, 20, 0.96)' : 'rgba(32, 18, 10, 0.96)',
            border: `2px solid ${allObjectivesMet ? '#ffd700' : '#e67e22'}`,
            borderRadius: '24px',
            padding: '8px 22px',
            color: '#ffffff',
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            fontSize: '13px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            boxShadow: allObjectivesMet ? '0 0 25px rgba(255, 215, 0, 0.8)' : '0 0 20px rgba(230, 126, 34, 0.6)',
            textAlign: 'center'
          }}>
            {allObjectivesMet ? (
              <>
                <div style={{ color: '#ffd700', fontSize: '14px', letterSpacing: '1px' }}>🏆 GOLDEN TROPHY SANCTUARY</div>
                <div style={{ color: '#a8e0b0', fontSize: '12px', marginTop: '3px' }}>[E] Press E to Claim Golden Trophy!</div>
              </>
            ) : (
              <>
                <div style={{ color: '#ffa94d', fontSize: '13px' }}>🔒 SEALED GOLDEN TROPHY</div>
                <div style={{ color: '#ffc9c9', fontSize: '11px', marginTop: '2px' }}>Complete all 3 Gates & Clues first!</div>
              </>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// 8.5 Ancient Runic Waymarker Stone for Route Clarity
function AncientRunicWaymarker({ position, rotationY = 0, title, subtitle, runeColor = "#2ae9aa" }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Stepped Granite Base */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.6, 1.2]} />
        <meshStandardMaterial color="#222e26" roughness={0.9} />
      </mesh>
      {/* Carved Monolith Stone */}
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 2.4, 0.7]} />
        <meshStandardMaterial color="#28382f" roughness={0.85} />
      </mesh>
      {/* Glowing Carved Rune Channel */}
      <mesh position={[0, 1.8, 0.36]}>
        <boxGeometry args={[0.15, 1.6, 0.04]} />
        <meshStandardMaterial color={runeColor} emissive={runeColor} emissiveIntensity={3.0} />
      </mesh>
      {/* Floating Magic Crystal Shard on Top */}
      <mesh position={[0, 3.25, 0]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color={runeColor} emissive={runeColor} emissiveIntensity={3.5} />
      </mesh>
      <pointLight color={runeColor} intensity={2.2} distance={5} position={[0, 2.0, 0.4]} />
      
      {/* 3D Waymarker Sign Badge */}
      <Html position={[0, 3.8, 0]} center distanceFactor={15} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          background: 'rgba(4, 22, 17, 0.94)',
          border: `1.5px solid ${runeColor}`,
          borderRadius: '12px',
          padding: '5px 14px',
          color: '#ffffff',
          fontFamily: "'Cinzel', serif, Georgia",
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '1px',
          whiteSpace: 'nowrap',
          boxShadow: `0 0 18px ${runeColor}66`,
          textAlign: 'center'
        }}>
          <div style={{ color: runeColor }}>{title}</div>
          {subtitle && <div style={{ fontSize: '9px', color: '#a7f3d0', marginTop: '2px', letterSpacing: '0.5px' }}>{subtitle}</div>}
        </div>
      </Html>
    </group>
  );
}

// 8.8 Natural Environment Props (Replaced oversized horizontal glowing green cylinders)
function FallenRuinsPillars() {
  return null;
}

// 9. Mathematically Exact Branching Pathways with Soil & Gravel Shading
function MazePathways({ pathTextures }) {
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

      const vertices = new Float32Array([
        ...v1, ...v3, ...v2,
        ...v2, ...v3, ...v4
      ]);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geometry.computeVertexNormals();

      return (
        <mesh key={`path-${idx}`} geometry={geometry} receiveShadow>
          <meshStandardMaterial
            color="#2a3a2a"
            roughness={0.92}
            map={pathTextures?.map}
            bumpMap={pathTextures?.bumpMap}
            bumpScale={0.04}
            side={THREE.DoubleSide}
          />
        </mesh>
      );
    });
  }, [pathTextures]);

  return <group>{pathGeometries}</group>;
}

export default function Scene({
  unlockedDoors = {},
  collectedClues = {},
  playerPosRef,
  trapPosition = null,
  isQuestionOpen = false,
  isVictory = false,
  allObjectivesMet = false
}) {
  // Generate high quality procedural PBR textures
  const groundTextures = useMemo(() => getForestGroundTextures(), []);
  const pathTextures = useMemo(() => getDirtPathTextures(), []);
  const barkTextures = useMemo(() => getTreeBarkTextures(), []);
  const stoneTextures = useMemo(() => getMossyStoneTextures(), []);
  const bambooTextures = useMemo(() => getHauntedBambooTextures(), []);
  const woodTextures = useMemo(() => getTempleWoodTextures(), []);
  const talismanTextures = useMemo(() => getTalismanTextures(), []);

  // Dense Organic Forest Layout, Bamboo Groves, Ghost Lanterns & Spirits
  const { trees, bambooGroves, bushes, rocks, lanterns, spirits, talismans, ferns, pillars, bgTrees, pathBorderFlora } = useMemo(() => {
    const treesArr = [];
    const bambooArr = [];
    const bushesArr = [];
    const rocksArr = [];
    const lanternsArr = [];
    const spiritsArr = [];
    const talismansArr = [];
    const fernsArr = [];
    const pillarsArr = [];
    const bgTreesArr = [];
    const pathBorderFloraArr = [];

    // 1. Dense Forest Horizon Wall (Perimeter ring)
    for (let angle = 0; angle < Math.PI * 2; angle += 0.04) {
      const radius = 155 + (Math.sin(angle * 6) * 15);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius - 75;
      bgTreesArr.push(
        <DenseCanopyBackgroundTree
          key={`bg-${angle}`}
          position={[x, 0, z]}
          scale={1.3 + Math.random() * 0.5}
          barkTextures={barkTextures}
        />
      );
    }

    // 2. Realistic Path-Flanking Undergrowth Generator (Dense foliage lining both sides of every path)
    PATH_SEGMENTS.forEach((seg, sIdx) => {
      const [x1, z1] = seg.p1;
      const [x2, z2] = seg.p2;
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      if (len === 0) return;
      const ux = dx / len;
      const uz = dz / len;
      const nx = -uz;
      const nz = ux;

      const steps = Math.floor(len / 3.4);
      for (let s = 1; s <= steps; s++) {
        const t = s / (steps + 1);
        const cx = x1 + ux * (t * len);
        const cz = z1 + uz * (t * len);

        // Left side undergrowth
        const leftDist = seg.radius + 0.4 + (Math.sin(sIdx * 7 + s * 1.3) * 0.5 + 0.5) * 1.5;
        const lx = cx + nx * leftDist;
        const lz = cz + nz * leftDist;
        const lType = Math.abs(Math.sin(sIdx * 11 + s * 3.7));

        if (lType < 0.35) {
          pathBorderFloraArr.push(
            <ForestFern
              key={`pb-fern-l-${sIdx}-${s}`}
              position={[lx, 0.05, lz]}
              scale={0.8 + lType * 0.7}
              rotationY={s * 1.5}
            />
          );
        } else if (lType < 0.60) {
          pathBorderFloraArr.push(
            <MossyBoulder
              key={`pb-rock-l-${sIdx}-${s}`}
              position={[lx, 0.35, lz]}
              scale={0.65 + lType * 0.7}
              rotation={[0.1, s * 0.9, 0.1]}
              stoneTextures={stoneTextures}
            />
          );
        } else if (lType < 0.82) {
          pathBorderFloraArr.push(
            <WildflowerBush
              key={`pb-bush-l-${sIdx}-${s}`}
              position={[lx, 0.05, lz]}
              scale={0.75 + lType * 0.6}
              rotationY={s * 2.1}
            />
          );
        } else {
          pathBorderFloraArr.push(
            <FallenMossyLog
              key={`pb-log-l-${sIdx}-${s}`}
              position={[lx, 0.02, lz]}
              scale={0.75 + lType * 0.4}
              rotationY={Math.atan2(dz, dx) + (lType - 0.5) * 0.4}
              barkTextures={barkTextures}
            />
          );
        }

        // Right side undergrowth
        const rightDist = seg.radius + 0.4 + (Math.cos(sIdx * 5 + s * 1.7) * 0.5 + 0.5) * 1.5;
        const rx = cx - nx * rightDist;
        const rz = cz - nz * rightDist;
        const rType = Math.abs(Math.cos(sIdx * 13 + s * 2.9));

        if (rType < 0.35) {
          pathBorderFloraArr.push(
            <ForestFern
              key={`pb-fern-r-${sIdx}-${s}`}
              position={[rx, 0.05, rz]}
              scale={0.8 + rType * 0.7}
              rotationY={s * 2.3}
            />
          );
        } else if (rType < 0.60) {
          pathBorderFloraArr.push(
            <MossyBoulder
              key={`pb-rock-r-${sIdx}-${s}`}
              position={[rx, 0.35, rz]}
              scale={0.65 + rType * 0.7}
              rotation={[0.1, s * 1.4, 0.1]}
              stoneTextures={stoneTextures}
            />
          );
        } else if (rType < 0.82) {
          pathBorderFloraArr.push(
            <WildflowerBush
              key={`pb-bush-r-${sIdx}-${s}`}
              position={[rx, 0.05, rz]}
              scale={0.75 + rType * 0.6}
              rotationY={s * 0.8}
            />
          );
        } else {
          pathBorderFloraArr.push(
            <FallenMossyLog
              key={`pb-log-r-${sIdx}-${s}`}
              position={[rx, 0.02, rz]}
              scale={0.75 + rType * 0.4}
              rotationY={Math.atan2(dz, dx) + (rType - 0.5) * 0.4}
              barkTextures={barkTextures}
            />
          );
        }
      }
    });

    // 3. Dense Forest Environment Interior (Ancient Oaks, Towering Pines, Boulders, Shrubbery)
    for (let i = 0; i < 420; i++) {
      const r = 5 + Math.random() * 140;
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r - 75;

      let tooCloseToPath = false;
      let distToNearestPath = Infinity;
      for (const seg of PATH_SEGMENTS) {
        const dx = seg.p2[0] - seg.p1[0];
        const dz = seg.p2[1] - seg.p1[1];
        const lenSq = dx * dx + dz * dz;
        let t = lenSq === 0 ? 0 : ((x - seg.p1[0]) * dx + (z - seg.p1[1]) * dz) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const projX = seg.p1[0] + t * dx;
        const projZ = seg.p1[1] + t * dz;
        const dist = Math.hypot(x - projX, z - projZ);
        if (dist < distToNearestPath) distToNearestPath = dist;
        if (dist < seg.radius + 1.8) {
          tooCloseToPath = true;
          break;
        }
      }

      if (tooCloseToPath) continue;

      const type = Math.random();
      if (type < 0.35) {
        // 1. Natural Chinese Bamboo Clusters (Dense groves with natural swaying culms)
        bambooArr.push(
          <ChineseBambooCluster
            key={`bamboo-${i}`}
            position={[x, 0, z]}
            scale={0.9 + Math.random() * 0.5}
            rotationY={Math.random() * Math.PI * 2}
            bambooTexture={bambooTextures}
          />
        );
      } else if (type < 0.55) {
        // 2. Ancient Gnarled Oaks, Towering Conifers & Chinese Huangshan Pines
        const treeSub = Math.random();
        if (treeSub < 0.35) {
          treesArr.push(
            <ChineseHuangshanPine
              key={`huangshan-${i}`}
              position={[x, 0, z]}
              scale={0.9 + Math.random() * 0.5}
              rotationY={Math.random() * Math.PI * 2}
              barkTextures={barkTextures}
            />
          );
        } else if (treeSub < 0.70) {
          treesArr.push(
            <RealisticAncientOak
              key={`oak-${i}`}
              position={[x, 0, z]}
              scale={0.85 + Math.random() * 0.75}
              rotationY={Math.random() * Math.PI * 2}
              barkTextures={barkTextures}
            />
          );
        } else {
          treesArr.push(
            <RealisticTallPine
              key={`pine-${i}`}
              position={[x, 0, z]}
              scale={0.85 + Math.random() * 0.75}
              rotationY={Math.random() * Math.PI * 2}
              barkTextures={barkTextures}
            />
          );
        }
      } else if (type < 0.68) {
        // 3. Ancient Chinese Weathered Stone Pagoda Lanterns along path edges & Dense Leafy Undergrowth
        if (distToNearestPath < 8.0) {
          lanternsArr.push(
            <StonePagodaLantern
              key={`pagoda-${i}`}
              position={[x, 0, z]}
              rotationY={Math.random() * Math.PI * 2}
              spirit={Math.random() < 0.4}
            />
          );
        } else {
          bushesArr.push(
            Math.random() < 0.5 ? (
              <ChineseFernBush
                key={`fern-bush-${i}`}
                position={[x, 0.05, z]}
                scale={0.9 + Math.random() * 0.7}
                rotationY={Math.random() * Math.PI * 2}
              />
            ) : (
              <DenseLeafyShrub
                key={`leafy-shrub-${i}`}
                position={[x, 0.05, z]}
                scale={0.9 + Math.random() * 0.7}
                rotationY={Math.random() * Math.PI * 2}
              />
            )
          );
        }
      } else if (type < 0.82) {
        // 4. Mossy Boulders & Rocks
        rocksArr.push(
          <MossyBoulder
            key={`rock-${i}`}
            position={[x, 0.4, z]}
            scale={0.7 + Math.random() * 1.4}
            rotation={[Math.random() * 0.3, Math.random() * Math.PI * 2, Math.random() * 0.3]}
            stoneTextures={stoneTextures}
          />
        );
      } else if (type < 0.92) {
        // 5. Ferns, Fallen Logs & Exposed Surface Roots
        const floorType = Math.random();
        if (floorType < 0.45) {
          fernsArr.push(
            <ForestFern
              key={`fern-${i}`}
              position={[x, 0.05, z]}
              scale={0.9 + Math.random() * 0.8}
              rotationY={Math.random() * Math.PI * 2}
            />
          );
        } else if (floorType < 0.75) {
          fernsArr.push(
            <ExposedTreeRoots
              key={`roots-${i}`}
              position={[x, 0.02, z]}
              scale={0.85 + Math.random() * 0.6}
              rotationY={Math.random() * Math.PI * 2}
              barkTextures={barkTextures}
            />
          );
        } else {
          fernsArr.push(
            <FallenMossyLog
              key={`log-${i}`}
              position={[x, 0.02, z]}
              scale={0.85 + Math.random() * 0.5}
              rotationY={Math.random() * Math.PI * 2}
              barkTextures={barkTextures}
            />
          );
        }
      } else {
        // 6. Ancient Chinese Stone Pillars & Floating Ghost Spirit Orbs
        pillarsArr.push(
          <AncientStonePillar
            key={`pillar-${i}`}
            position={[x, 0, z]}
            scale={0.85 + Math.random() * 0.4}
            rotationY={Math.random() * Math.PI * 2}
            stoneTextures={stoneTextures}
          />
        );
        spiritsArr.push(
          <GhostSpiritParticle
            key={`spirit-${i}`}
            position={[x, 0, z]}
            radius={2.0 + Math.random() * 1.5}
            speed={0.8 + Math.random() * 0.6}
            seed={i * 2.3}
          />
        );
      }
    }

    return {
      trees: treesArr,
      bambooGroves: bambooArr,
      bushes: bushesArr,
      rocks: rocksArr,
      lanterns: lanternsArr,
      spirits: spiritsArr,
      talismans: talismansArr,
      ferns: fernsArr,
      pillars: pillarsArr,
      bgTrees: bgTreesArr,
      pathBorderFlora: pathBorderFloraArr
    };
  }, [barkTextures, stoneTextures, bambooTextures, woodTextures, talismanTextures]);

  return (
    <>
      {/* Rich Forest Soil Ground Collider (Rapier Physics preserved 100%) */}
      <RigidBody type="fixed" colliders="cuboid" friction={1.5} position={[0, -0.5, -75]}>
        <mesh receiveShadow>
          <boxGeometry args={[380, 1, 380]} />
          <meshStandardMaterial
            color="#1c2b1e"
            roughness={0.88}
            map={groundTextures?.map}
            bumpMap={groundTextures?.bumpMap}
            bumpScale={0.08}
          />
        </mesh>
      </RigidBody>

      {/* Natural Rolling Terrain Mounds (Gentle slopes & hills outside path corridors) */}
      <NaturalTerrainMounds groundTextures={groundTextures} />

      {/* 3D Branching Maze Dirt Pathways */}
      <MazePathways pathTextures={pathTextures} />

      {/* 3D Winding Stone Cobblestone Pathway (from ForestEnvironment) */}
      <ForestPath useGamePath={true} stoneTexture={stoneTextures} />

      {/* Floating Forest Spore Particles (Cinematic Atmosphere) */}
      <ForestAtmosphere />

      {/* Chinese Ghost Forest Distant Mountain Silhouettes & World Horizon Depth */}
      <DistantGhostMountains />

      {/* Grand Chinese Temple Paifang Monument Framing the Entrance Junction */}
      <ChineseTempleGateStructure
        position={[0, 0, 14]}
        rotationY={0}
        scale={1.05}
        woodTexture={woodTextures}
        stoneTexture={stoneTextures}
        lanterns={true}
      />

      {/* Secondary Ancient Temple Paifang Framing the Final Split Junction (z = -95) */}
      <ChineseTempleGateStructure
        position={[0, 0, -92]}
        rotationY={0}
        scale={1.1}
        woodTexture={woodTextures}
        stoneTexture={stoneTextures}
        lanterns={true}
      />

      {/* Dense Path-Flanking Undergrowth (Lining both sides of every path) */}
      {pathBorderFlora}

      {/* Chinese Bamboo Groves, Ancient Trees, Ghost Lanterns, Spirits, Rocks & Relics */}
      {bambooGroves}
      {trees}
      {bushes}
      {rocks}
      {lanterns}
      {spirits}
      {talismans}
      {ferns}
      {pillars}
      {bgTrees}
      {/* Procedural Mossy Rocks from ForestEnvironment */}
      <ProceduralRocks useGameBounds={true} />

      {/* Ancient Runic Route Waymarkers (Ensures Route Clarity) */}
      <AncientRunicWaymarker 
        position={[-6.2, 0, -22]} 
        rotationY={0.35}
        title="◂ ROUTE 1" 
        subtitle="RIDDLE GATE" 
        runeColor="#2ae9aa" 
      />
      <AncientRunicWaymarker 
        position={[0, 0, -26]} 
        rotationY={0}
        title="▲ ROUTE 3" 
        subtitle="ANCIENT GATE" 
        runeColor="#2ae9aa" 
      />
      <AncientRunicWaymarker 
        position={[6.2, 0, -22]} 
        rotationY={-0.35}
        title="ROUTE 2 ▸" 
        subtitle="SHADOW GATE" 
        runeColor="#2ae9aa" 
      />
      <AncientRunicWaymarker 
        position={[-18, 0, -96]} 
        rotationY={0.2}
        title="◂ MOON GATE" 
        subtitle="TREASURE SANCTUARY" 
        runeColor="#38bdf8" 
      />
      <AncientRunicWaymarker 
        position={[18, 0, -96]} 
        rotationY={-0.2}
        title="SUN GATE ▸" 
        subtitle="CURSED SPIKE PIT" 
        runeColor="#fb923c" 
      />

      {/* Mythic Mountain Doors distributed throughout maze */}
      {DOORS_CONFIG.map((door) => (
        <MazeDoor
          key={door.id}
          config={door}
          isUnlocked={Boolean(unlockedDoors[door.id])}
          playerPosRef={playerPosRef}
          stoneTextures={stoneTextures}
          isQuestionOpen={isQuestionOpen}
        />
      ))}

      {/* Mythic Collectible Hidden Clues */}
      {CLUES_CONFIG.map((clue) => (
        <CollectibleClue
          key={clue.id}
          config={clue}
          isCollected={Boolean(collectedClues[clue.id])}
          playerPosRef={playerPosRef}
          stoneTextures={stoneTextures}
          isQuestionOpen={isQuestionOpen}
        />
      ))}

      {/* Golden Celestial Treasure Chamber & Interactive Trophy (Behind Moon Gate at -30, -182) */}
      <TreasureChamber
        position={[-30, 0, -182]}
        stoneTextures={stoneTextures}
        playerPosRef={playerPosRef}
        isUnlockedFinalDoor={Boolean(unlockedDoors.doorA)}
        isVictory={isVictory}
        allObjectivesMet={allObjectivesMet}
        isQuestionOpen={isQuestionOpen}
      />
      
      {/* Dynamic Cage Trap */}
      {trapPosition && <Cage position={trapPosition} />}
    </>
  );
}
