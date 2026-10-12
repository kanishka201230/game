import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PATH_SEGMENTS, pointToSegmentDistance } from "../pathConfig";

// =========================================================================
// 1. AUTHENTIC CHINESE BAMBOO GROVE (Black Myth: Wukong style)
// Slender segmented culms with distinct joint nodes, natural arching, 
// multi-leaf blade sprays, and shoots sprouting at the base
// =========================================================================
export function ChineseBambooCluster({ position, scale = 1, rotationY = 0, bambooTexture }) {
  const bamboos = useMemo(() => {
    const list = [];
    const count = 6 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * 2.8;
      const offsetZ = (Math.random() - 0.5) * 2.8;
      const height = 15 + Math.random() * 7;
      const leanX = (Math.random() - 0.5) * 0.14;
      const leanZ = (Math.random() - 0.5) * 0.14;
      const radius = 0.07 + Math.random() * 0.04;
      const nodeCount = 8;
      list.push({ offsetX, offsetZ, height, leanX, leanZ, radius, nodeCount });
    }
    return list;
  }, []);

  // Bamboo shoots at ground level
  const shoots = useMemo(() => {
    const list = [];
    for (let i = 0; i < 3; i++) {
      list.push({
        offsetX: (Math.random() - 0.5) * 2.0,
        offsetZ: (Math.random() - 0.5) * 2.0,
        height: 0.8 + Math.random() * 0.7,
        radius: 0.12 + Math.random() * 0.05
      });
    }
    return list;
  }, []);

  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Bamboo Shoots at the base */}
      {shoots.map((s, idx) => (
        <group key={`shoot-${idx}`} position={[s.offsetX, 0, s.offsetZ]}>
          <mesh position={[0, s.height / 2, 0]} castShadow>
            <coneGeometry args={[s.radius, s.height, 6]} />
            <meshStandardMaterial color="#423b20" roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Main Bamboo Culms */}
      {bamboos.map((b, idx) => (
        <group key={`culm-${idx}`} position={[b.offsetX, 0, b.offsetZ]} rotation={[b.leanX, 0, b.leanZ]}>
          {/* Main Bamboo Tapered Stalk */}
          <mesh position={[0, b.height / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[b.radius * 0.75, b.radius, b.height, 8]} />
            <meshStandardMaterial
              color="#2d5231"
              roughness={0.72}
              map={bambooTexture?.map}
            />
          </mesh>

          {/* Segmented Bamboo Nodes (Joint Rings) */}
          {Array.from({ length: b.nodeCount }).map((_, nIdx) => {
            const nodeY = (b.height * (nIdx + 1)) / (b.nodeCount + 1);
            const nodeR = b.radius * (1 - (nIdx / b.nodeCount) * 0.25) * 1.15;
            return (
              <mesh key={`node-${nIdx}`} position={[0, nodeY, 0]}>
                <cylinderGeometry args={[nodeR, nodeR, 0.09, 8]} />
                <meshStandardMaterial color="#5c633a" roughness={0.8} />
              </mesh>
            );
          })}

          {/* Thin Delicate Bamboo Leaf Sprays Fan-Out along upper half */}
          {[0.55, 0.7, 0.85, 0.98].map((ratio, lIdx) => {
            const sprayY = b.height * ratio;
            const sprayAngle = (lIdx * 2.3) + idx * 1.1;
            return (
              <group key={`spray-${lIdx}`} position={[0, sprayY, 0]} rotation={[0, sprayAngle, 0]}>
                {/* Branch 1 */}
                <group position={[0.45, 0.15, 0]} rotation={[0.25, 0.4, -0.35]}>
                  <mesh castShadow>
                    <planeGeometry args={[0.55, 1.4]} />
                    <meshStandardMaterial
                      color="#386b36"
                      roughness={0.65}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                  <mesh position={[0.2, 0.3, 0.1]} rotation={[0, 0.3, 0.2]}>
                    <planeGeometry args={[0.45, 1.1]} />
                    <meshStandardMaterial
                      color="#4a8547"
                      roughness={0.6}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                </group>

                {/* Branch 2 */}
                <group position={[-0.45, 0.1, 0.2]} rotation={[-0.2, -0.5, 0.4]}>
                  <mesh castShadow>
                    <planeGeometry args={[0.5, 1.3]} />
                    <meshStandardMaterial
                      color="#2f5a2e"
                      roughness={0.7}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                </group>
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}

// =========================================================================
// 2. WEATHERED STONE PAGODA LANTERN (Toro / Chinese Stone Lantern)
// Classical tiered carved stone pagoda with glowing amber or spirit core
// =========================================================================
export function StonePagodaLantern({ position, rotationY = 0, spirit = false }) {
  const flameRef = useRef();
  useFrame(({ clock }) => {
    if (flameRef.current) {
      const t = clock.getElapsedTime();
      flameRef.current.intensity = spirit
        ? 1.8 + Math.sin(t * 3.5 + position[0]) * 0.5
        : 2.2 + Math.sin(t * 4.0 + position[2]) * 0.6;
    }
  });

  const glowColor = spirit ? "#2ae9aa" : "#ff9d42";
  const lightColor = spirit ? "#00ffcc" : "#ff7b00";

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Stone Plinth Foundation */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.5, 1.2]} />
        <meshStandardMaterial color="#383c39" roughness={0.92} />
      </mesh>
      {/* Mid Pillar Shaft */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.4, 1.2, 6]} />
        <meshStandardMaterial color="#414541" roughness={0.9} />
      </mesh>
      {/* Light Chamber Base Plate */}
      <mesh position={[0, 1.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.2, 1.0]} />
        <meshStandardMaterial color="#383c39" roughness={0.92} />
      </mesh>
      {/* Hollow Light Fire Chamber */}
      <mesh position={[0, 2.15, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={2.8}
          transparent
          opacity={0.88}
        />
      </mesh>
      {/* Dynamic Point Light */}
      <pointLight
        ref={flameRef}
        color={lightColor}
        intensity={2.2}
        distance={7.5}
        position={[0, 2.2, 0]}
      />
      {/* Tiered Sweeping Eaves Roof */}
      <mesh position={[0, 2.65, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.2, 0.65, 4]} rotation={[0, Math.PI / 4, 0]} />
        <meshStandardMaterial color="#2d302e" roughness={0.88} />
      </mesh>
      {/* Finial Jewel Crest */}
      <mesh position={[0, 3.1, 0]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#555a55" roughness={0.85} />
      </mesh>
    </group>
  );
}

// =========================================================================
// 3. HANGING RED SILK GHOST LANTERN WITH GOLD RIBS
// =========================================================================
export function HangingRedGhostLantern({ position, scale = 1, swayOffset = 0 }) {
  const groupRef = useRef();
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * 1.5 + swayOffset;
      groupRef.current.rotation.z = Math.sin(t) * 0.08;
      groupRef.current.rotation.x = Math.cos(t * 0.8) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Hanging Silk Cord */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 4]} />
        <meshStandardMaterial color="#1a1111" />
      </mesh>
      {/* Black Lacquer Cap Top */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.32, 0.1, 10]} />
        <meshStandardMaterial color="#140707" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Glowing Crimson Silk Body */}
      <mesh position={[0, -0.45, 0]} castShadow>
        <sphereGeometry args={[0.48, 12, 10]} scale={[1, 1.25, 1]} />
        <meshStandardMaterial
          color="#ff1e38"
          emissive="#dc2626"
          emissiveIntensity={2.4}
          roughness={0.5}
        />
      </mesh>
      {/* Black Lacquer Cap Bottom */}
      <mesh position={[0, -0.9, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.28, 0.08, 10]} />
        <meshStandardMaterial color="#140707" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Red Silk Tassel */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.04, 0.08, 0.55, 6]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.7} />
      </mesh>
      {/* Warm Ambient Lantern Light */}
      <pointLight color="#ff3344" intensity={2.0} distance={6.0} position={[0, -0.45, 0]} />
    </group>
  );
}

// =========================================================================
// 4. FLOATING GHOST SPIRIT ORB (Cyan/Mint Will-o'-the-wisp)
// =========================================================================
export function GhostSpiritParticle({ position, radius = 2.0, speed = 1.0, seed = 0 }) {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * speed + seed;
      meshRef.current.position.x = Math.sin(t * 1.3) * radius;
      meshRef.current.position.y = 1.5 + Math.sin(t * 2.1) * 0.6;
      meshRef.current.position.z = Math.cos(t * 1.1) * radius;
    }
  });

  return (
    <group position={position}>
      <group ref={meshRef}>
        {/* Core Spirit Orb */}
        <mesh>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial
            color="#a7f3d0"
            emissive="#2ae9aa"
            emissiveIntensity={3.2}
            roughness={0.2}
          />
        </mesh>
        {/* Soft Ethereal Halo */}
        <mesh>
          <sphereGeometry args={[0.42, 8, 8]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={2.0}
            transparent
            opacity={0.35}
          />
        </mesh>
        <pointLight color="#2ae9aa" intensity={1.8} distance={6.0} />
      </group>
    </group>
  );
}

// =========================================================================
// 5. GRAND CHINESE TEMPLE GATE / PAIFANG ARCHITECTURAL PORTAL
// =========================================================================
export function ChineseTempleGateStructure({
  position,
  rotationY = 0,
  scale = 1,
  woodTexture,
  stoneTexture,
  lanterns = true
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Stone Carved Pillar Pedestals */}
      <mesh position={[-3.8, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 1.2, 1.4]} />
        <meshStandardMaterial color="#3a3f3a" roughness={0.9} map={stoneTexture?.map} />
      </mesh>
      <mesh position={[3.8, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 1.2, 1.4]} />
        <meshStandardMaterial color="#3a3f3a" roughness={0.9} map={stoneTexture?.map} />
      </mesh>

      {/* Main Vermilion Temple Pillars */}
      <mesh position={[-3.8, 5.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.55, 8.2, 10]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.75} map={woodTexture?.map} />
      </mesh>
      <mesh position={[3.8, 5.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.55, 8.2, 10]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.75} map={woodTexture?.map} />
      </mesh>

      {/* Main Crossbeam */}
      <mesh position={[0, 8.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[9.6, 0.9, 1.1]} />
        <meshStandardMaterial color="#991b1b" roughness={0.7} map={woodTexture?.map} />
      </mesh>

      {/* Dou-Gong Bracket Cluster Tier */}
      <mesh position={[0, 9.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[10.4, 0.5, 1.5]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.8} />
      </mesh>

      {/* Sweeping Curved Pagoda Eaves Roof */}
      <mesh position={[0, 10.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[12.2, 0.7, 3.4]} />
        <meshStandardMaterial color="#1e2922" roughness={0.65} />
      </mesh>
      {/* Upturned Eave Corners */}
      <mesh position={[-6.2, 10.8, 0]} rotation={[0, 0, 0.4]} castShadow>
        <coneGeometry args={[0.8, 1.6, 4]} />
        <meshStandardMaterial color="#1e2922" roughness={0.65} />
      </mesh>
      <mesh position={[6.2, 10.8, 0]} rotation={[0, 0, -0.4]} castShadow>
        <coneGeometry args={[0.8, 1.6, 4]} />
        <meshStandardMaterial color="#1e2922" roughness={0.65} />
      </mesh>

      {/* Traditional Temple Plaque in Center */}
      <mesh position={[0, 7.8, 0.58]} castShadow>
        <boxGeometry args={[2.8, 1.0, 0.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 7.8, 0.62]}>
        <boxGeometry args={[2.6, 0.8, 0.05]} />
        <meshStandardMaterial color="#d97706" emissive="#b45309" emissiveIntensity={0.8} />
      </mesh>

      {/* Hanging Red Silk Lanterns */}
      {lanterns && (
        <>
          <HangingRedGhostLantern position={[-3.6, 8.0, 0.9]} scale={0.85} swayOffset={0.2} />
          <HangingRedGhostLantern position={[3.6, 8.0, 0.9]} scale={0.85} swayOffset={1.4} />
        </>
      )}
    </group>
  );
}

// =========================================================================
// 6. TAOIST WARDING TALISMAN STRIPS
// =========================================================================
export function TaoistWardingTalisman({ position, rotationY = 0, scale = 1, talismanTexture }) {
  const talismanRef = useRef();
  useFrame(({ clock }) => {
    if (talismanRef.current) {
      const t = clock.getElapsedTime() * 3 + position[0];
      talismanRef.current.rotation.x = Math.sin(t) * 0.12;
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh ref={talismanRef} position={[0, -0.4, 0.02]} castShadow>
        <planeGeometry args={[0.26, 0.75]} />
        <meshStandardMaterial
          color="#dfb142"
          map={talismanTexture?.map}
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// =========================================================================
// 7. MOUNTAIN HILL GEOMETRY / DISTANT CHINESE GHOST PEAKS
// =========================================================================
export function DistantGhostMountains() {
  const peaks = useMemo(() => {
    const list = [];
    const count = 22;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = 175 + Math.random() * 45;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist - 75;
      const height = 50 + Math.random() * 40;
      const width = 38 + Math.random() * 26;
      list.push({ x, z, height, width, rotationY: Math.random() * Math.PI });
    }
    return list;
  }, []);

  return (
    <group>
      {peaks.map((p, idx) => (
        <mesh
          key={idx}
          position={[p.x, p.height / 2 - 4, p.z]}
          rotation={[0, p.rotationY, 0]}
        >
          <coneGeometry args={[p.width, p.height, 5]} />
          <meshStandardMaterial
            color="#09181b"
            roughness={0.95}
          />
        </mesh>
      ))}
    </group>
  );
}

// =========================================================================
// 8. ORGANIC WINDING STONE FLAGSTONE PATHWAY (Replaces flat box stepping stones)
// Irregular rounded/hexagonal flagstones, varied heights, stone colors, 
// moss borders, and river pebbles along path borders
// =========================================================================
export function ForestPath({ useGamePath = true, stoneTexture }) {
  const { flagstones, pebbles } = useMemo(() => {
    const stoneList = [];
    const pebbleList = [];

    const segments = useGamePath ? PATH_SEGMENTS : [];

    segments.forEach((seg, segIdx) => {
      const [x1, z1] = seg.p1;
      const [x2, z2] = seg.p2;
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      if (len < 0.5) return;

      const ux = dx / len;
      const uz = dz / len;
      const nx = -uz;
      const nz = ux;

      const step = 1.35;
      const steps = Math.floor(len / step);

      for (let s = 0; s <= steps; s++) {
        const t = Math.min(len, s * step + (Math.sin(s * 3.7 + segIdx) * 0.25));
        const cx = x1 + ux * t;
        const cz = z1 + uz * t;

        // Flagstone placement: 2-3 organic stones across path width
        for (const lane of [-0.9, 0.0, 0.9]) {
          if (Math.random() > 0.14) {
            const laneOffset = lane * (0.85 + Math.random() * 0.4);
            const posX = cx + nx * laneOffset + (Math.random() - 0.5) * 0.25;
            const posZ = cz + nz * laneOffset + (Math.random() - 0.5) * 0.25;
            const radius = 0.55 + Math.random() * 0.35;
            const height = 0.06 + Math.random() * 0.04;
            const rotY = Math.random() * Math.PI * 2;
            const toneIdx = (s + segIdx + Math.floor(lane * 3)) % 3;

            stoneList.push({
              position: [posX, height / 2 + 0.02, posZ],
              radius,
              height,
              rotationY: rotY,
              color: toneIdx === 0 ? "#434842" : toneIdx === 1 ? "#373c37" : "#4e544c"
            });
          }
        }

        // River pebbles along the edges
        if (Math.random() > 0.4) {
          const side = Math.random() > 0.5 ? 1 : -1;
          const pOffset = side * (seg.radius * 0.75 + Math.random() * 0.6);
          pebbleList.push({
            position: [cx + nx * pOffset, 0.04, cz + nz * pOffset],
            scale: [0.18 + Math.random() * 0.15, 0.08, 0.22 + Math.random() * 0.15],
            color: Math.random() > 0.5 ? "#2d332d" : "#555d55"
          });
        }
      }
    });

    return { flagstones: stoneList, pebbles: pebbleList };
  }, [useGamePath]);

  return (
    <group>
      {/* Irregular Faceted Flagstones with Mossy Weathering */}
      {flagstones.map((st, i) => (
        <mesh
          key={`flagstone-${i}`}
          position={st.position}
          rotation={[0.02, st.rotationY, -0.02]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[st.radius * 0.9, st.radius, st.height, 6]} />
          <meshStandardMaterial
            color={st.color}
            roughness={0.88}
            map={stoneTexture?.map}
          />
        </mesh>
      ))}

      {/* River Pebbles lining path boundaries */}
      {pebbles.map((pb, i) => (
        <mesh
          key={`pebble-${i}`}
          position={pb.position}
          scale={pb.scale}
          receiveShadow
        >
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color={pb.color} roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
}

// =========================================================================
// 9. DENSE CHINESE FERN BUSH & LEAFY SHRUB (Replaces low-poly sphere bushes)
// Organic radiating fern fronds, multi-tiered leafy blades, dark moss base
// =========================================================================
export function ChineseFernBush({ position, scale = 1, rotationY = 0 }) {
  const fronds = useMemo(() => {
    const list = [];
    const count = 9;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2;
      const tilt = 0.45 + Math.random() * 0.25;
      const frondLen = 1.1 + Math.random() * 0.5;
      const frondWidth = 0.4 + Math.random() * 0.2;
      list.push({ angle, tilt, frondLen, frondWidth });
    }
    return list;
  }, []);

  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Mossy Soil Mound Base */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[0.7, 0.9, 0.16, 7]} />
        <meshStandardMaterial color="#203d22" roughness={0.95} />
      </mesh>

      {/* Radiating Arching Fern Blades */}
      {fronds.map((f, idx) => (
        <mesh
          key={`frond-${idx}`}
          position={[Math.cos(f.angle) * 0.35, 0.45, Math.sin(f.angle) * 0.35]}
          rotation={[f.tilt * Math.sin(f.angle), f.angle, -f.tilt * Math.cos(f.angle)]}
          castShadow
        >
          <planeGeometry args={[f.frondWidth, f.frondLen]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? "#235427" : "#2d6330"}
            roughness={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// =========================================================================
// 10. DENSE LEAFY UNDERGROWTH SHRUB (Multi-stem woodland shrub)
// =========================================================================
export function DenseLeafyShrub({ position, scale = 1, rotationY = 0 }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Center mound */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 0.2, 6]} />
        <meshStandardMaterial color="#1a351d" roughness={0.95} />
      </mesh>
      {/* Layered leaf fans at staggered angles */}
      {[0, 1.2, 2.4, 3.6, 4.8].map((rot, idx) => (
        <mesh
          key={`leaf-${idx}`}
          position={[Math.cos(rot) * 0.3, 0.35 + idx * 0.05, Math.sin(rot) * 0.3]}
          rotation={[0.3, rot, 0.2]}
          castShadow
        >
          <planeGeometry args={[0.75, 1.0]} />
          <meshStandardMaterial
            color={idx % 2 ? "#265429" : "#326935"}
            roughness={0.75}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// =========================================================================
// 11. EXPOSED ANCIENT TREE ROOTS (Black Myth: Wukong aesthetic)
// Snaking gnarled roots crawling over the mossy ground around trees
// =========================================================================
export function ExposedTreeRoots({ position, rotationY = 0, scale = 1, barkTextures }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Primary surface root arching across ground */}
      <mesh position={[0.9, 0.18, 0.2]} rotation={[0.1, 0.3, 0.25]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.38, 2.8, 7]} />
        <meshStandardMaterial color="#2d1c10" roughness={0.92} map={barkTextures?.map} />
      </mesh>
      {/* Secondary flanking root */}
      <mesh position={[-0.8, 0.16, -0.4]} rotation={[-0.15, -0.5, -0.22]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.32, 2.4, 7]} />
        <meshStandardMaterial color="#2a190e" roughness={0.92} map={barkTextures?.map} />
      </mesh>
      {/* Tertiary curling root */}
      <mesh position={[0.3, 0.14, -0.9]} rotation={[0.2, 1.1, 0.1]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.26, 2.0, 6]} />
        <meshStandardMaterial color="#27170c" roughness={0.92} map={barkTextures?.map} />
      </mesh>
    </group>
  );
}

// =========================================================================
// 12. NATURAL ROLLING TERRAIN MOUNDS (Hills & gentle slopes outside path)
// Builds continuous undulating 3D forest terrain without flat black void
// =========================================================================
export function NaturalTerrainMounds({ groundTextures }) {
  const mounds = useMemo(() => {
    const list = [];
    const count = 35;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 22 + Math.random() * 85;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist - 75;

      // Ensure mound does not block the walkable path segments
      let nearPath = false;
      for (const seg of PATH_SEGMENTS) {
        const { dist: d } = pointToSegmentDistance(x, z, seg.p1[0], seg.p1[1], seg.p2[0], seg.p2[1]);
        if (d < seg.radius + 3.5) {
          nearPath = true;
          break;
        }
      }

      if (!nearPath) {
        list.push({
          position: [x, 0, z],
          radius: 8 + Math.random() * 12,
          height: 2.5 + Math.random() * 3.5,
          rotY: Math.random() * Math.PI
        });
      }
    }
    return list;
  }, []);

  return (
    <group>
      {mounds.map((m, idx) => (
        <mesh
          key={`mound-${idx}`}
          position={[m.position[0], m.height * 0.35, m.position[2]]}
          rotation={[0, m.rotY, 0]}
          receiveShadow
        >
          <coneGeometry args={[m.radius, m.height, 9]} />
          <meshStandardMaterial
            color="#1b2a1d"
            roughness={0.92}
            map={groundTextures?.map}
            bumpMap={groundTextures?.bumpMap}
            bumpScale={0.06}
          />
        </mesh>
      ))}
    </group>
  );
}

// =========================================================================
// 13. WEATHERED MOSSY BOULDERS
// =========================================================================
export function Rocks({ useGameBounds = false, stoneTexture }) {
  const rocks = useMemo(() => {
    const result = [];
    const attempts = 70;
    for (let i = 0; i < attempts; i++) {
      const x = (Math.random() - 0.5) * 120;
      const z = Math.random() * 210 - 180;

      let minDist = Infinity;
      for (const seg of PATH_SEGMENTS) {
        const { dist } = pointToSegmentDistance(x, z, seg.p1[0], seg.p1[1], seg.p2[0], seg.p2[1]);
        if (dist < minDist) minDist = dist;
      }

      if (minDist >= 4.2 && minDist <= 24.0) {
        result.push({
          position: [x, 0.4, z],
          scale: [0.9 + Math.random() * 1.2, 0.6 + Math.random() * 0.8, 0.9 + Math.random() * 1.2],
          rotation: [Math.random() * 0.4, Math.random() * Math.PI * 2, Math.random() * 0.4]
        });
      }
    }
    return result;
  }, []);

  return (
    <group>
      {rocks.map((rock, i) => (
        <mesh
          key={`rock-prop-${i}`}
          position={rock.position}
          scale={rock.scale}
          rotation={rock.rotation}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={i % 2 ? "#3a423b" : "#444d45"}
            roughness={0.92}
            map={stoneTexture?.map}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ForestEnvironment() {
  return (
    <group>
      <ForestPath />
      <Rocks />
    </group>
  );
}
