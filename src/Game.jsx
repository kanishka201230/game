import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Suspense, useState, useEffect, useCallback } from "react";
import Scene from "./Scene";
import Player from "./Player";
import Attacker from "./Attacker";
import WebcamController from "./WebcamController";
import { DOORS_CONFIG } from "./pathConfig";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW", "w", "W"] },
  { name: "backward", keys: ["ArrowDown", "KeyS", "s", "S"] },
  { name: "left", keys: ["ArrowLeft", "KeyA", "a", "A"] },
  { name: "right", keys: ["ArrowRight", "KeyD", "d", "D"] },
  { name: "jump", keys: ["Space", " "] },
  { name: "run", keys: ["ShiftLeft", "ShiftRight", "Shift"] },
  { name: "interact", keys: ["KeyE", "e", "E"] },
];

export default function Game() {
  const [unlockedDoors, setUnlockedDoors] = useState({});
  const [activeModal, setActiveModal] = useState(null); // 'riddle', 'trap', 'victory', 'defeat'
  const [currentDoor, setCurrentDoor] = useState(null);
  const [clueDiscovered, setClueDiscovered] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 1.5, z: 12 });
  const [webcamInputs, setWebcamInputs] = useState({ runner: {}, attacker: {} });

  // Development-Only Debug Status Overlay State
  const [debugInfo, setDebugInfo] = useState({
    lastKey: "None",
    inputDetected: false,
    coords: "X: 0.0, Y: 1.5, Z: 12.0",
    status: "OK (On Dirt Path)",
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Door interaction checker
  const handleInteract = useCallback(() => {
    if (activeModal) return;

    for (const door of DOORS_CONFIG) {
      const [dx, dy, dz] = door.position;
      const dist = Math.hypot(playerPos.x - dx, playerPos.z - dz);

      if (dist < 4.8) {
        if (unlockedDoors[door.id]) {
          showToast(`${door.name} is already open.`);
          return;
        }

        setCurrentDoor(door);

        if (door.type === 'riddle') {
          setActiveModal('riddle');
        } else if (door.type === 'trap') {
          setActiveModal('trap');
          setUnlockedDoors(prev => ({ ...prev, [door.id]: true }));
        } else if (door.type === 'final_moon') {
          setUnlockedDoors(prev => ({ ...prev, [door.id]: true }));
          showToast('Ancient Moon Gate Unlocked! Proceed to the Trophy Shrine!');
        } else if (door.type === 'final_sun') {
          setUnlockedDoors(prev => ({ ...prev, [door.id]: true }));
          showToast('Ancient Sun Gate Unlocked...');
        } else {
          setUnlockedDoors(prev => ({ ...prev, [door.id]: true }));
          showToast(`${door.name} Unlocked!`);
        }
        return;
      }
    }
  }, [playerPos, unlockedDoors, activeModal]);

  // Handle Runner webcam interaction gesture
  useEffect(() => {
    if (webcamInputs.runner && webcamInputs.runner.interact) {
      handleInteract();
    }
  }, [webcamInputs.runner, handleInteract]);

  // Global E key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyE') {
        handleInteract();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInteract]);

  // Check victory / trap zones
  useEffect(() => {
    if (unlockedDoors.doorA && !activeModal) {
      const distToTrophy = Math.hypot(playerPos.x - (-30), playerPos.z - (-182));
      if (distToTrophy < 6.0) {
        setActiveModal('victory');
      }
    }

    if (unlockedDoors.doorB && !activeModal) {
      const distToTrap = Math.hypot(playerPos.x - (30), playerPos.z - (-165));
      if (distToTrap < 5.0) {
        setActiveModal('defeat');
      }
    }
  }, [playerPos, unlockedDoors, activeModal]);

  const handleAnswerQuiz = (option) => {
    if (option.correct) {
      setUnlockedDoors(prev => ({ ...prev, [currentDoor.id]: true }));
      if (option.clue) {
        setClueDiscovered(option.clue);
      }
      showToast('Riddle Solved! Ancient Riddle Gate Unlocked!');
      setActiveModal(null);
    } else {
      showToast('Incorrect Answer! The gate remains locked.');
      setActiveModal(null);
    }
  };

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <KeyboardControls map={keyboardMap}>
      {/* Top Left Keyboard HUD */}
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        zIndex: 10, 
        color: '#e2f0d9', 
        background: 'rgba(15, 28, 20, 0.88)', 
        padding: '16px 20px', 
        borderRadius: '10px', 
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        border: '1px solid rgba(120, 180, 130, 0.3)',
        maxWidth: '280px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', letterSpacing: '1.5px', fontSize: '15px', color: '#a8e0b0' }}>FOREST ESCAPE MAZE</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 10px 0', fontSize: '12px', lineHeight: '1.7' }}>
          <li><b>W / A / S / D</b> - Walk</li>
          <li><b>SHIFT</b> - Run | <b>SPACE</b> - Jump</li>
          <li><b>E</b> - Interact with Doors</li>
        </ul>

        {clueDiscovered && (
          <div style={{ background: 'rgba(255, 215, 0, 0.15)', border: '1px solid #ffd700', padding: '8px 10px', borderRadius: '6px', fontSize: '11px', color: '#ffe57f' }}>
            <b>💡 CLUE DISCOVERED:</b><br />
            {clueDiscovered}
          </div>
        )}
      </div>

      {/* Development Debug Status Overlay (Requirement 5) */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 100,
        background: 'rgba(5, 12, 8, 0.85)',
        border: '1px solid #ffcc00',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#fffae6',
        fontFamily: 'monospace',
        fontSize: '11px',
        lineHeight: '1.6',
        boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
        maxWidth: '320px'
      }}>
        <div style={{ fontWeight: 'bold', color: '#ffd700', marginBottom: '4px' }}>🛠️ DEV MOVEMENT DEBUG OVERLAY</div>
        <div><b>Last Key Pressed:</b> <span style={{ color: '#a8e0b0' }}>{debugInfo.lastKey}</span></div>
        <div><b>Input Detected:</b> <span style={{ color: debugInfo.inputDetected ? '#00ffcc' : '#ff9999' }}>{debugInfo.inputDetected ? 'YES (Active)' : 'NO (Idle)'}</span></div>
        <div><b>Runner Coordinates:</b> {debugInfo.coords}</div>
        <div><b>Movement Status:</b> <span style={{ color: '#ffe57f' }}>{debugInfo.status}</span></div>
      </div>

      {/* Top Right Webcam Pose Controller UI */}
      <WebcamController onUpdateInputs={setWebcamInputs} />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: 'rgba(10, 25, 18, 0.95)',
          border: '1px solid #a8e0b0',
          color: '#e2f0d9',
          padding: '12px 28px',
          borderRadius: '30px',
          fontSize: '14px',
          letterSpacing: '1px',
          boxShadow: '0 0 25px rgba(168, 224, 176, 0.4)'
        }}>
          {toastMessage}
        </div>
      )}

      {/* RIDDLE MODAL DIALOG */}
      {activeModal === 'riddle' && currentDoor && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 12, 8, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200
        }}>
          <div style={{
            background: 'radial-gradient(circle at 50% 20%, #1e3626 0%, #0e1c13 100%)',
            border: '2px solid #a8e0b0',
            borderRadius: '14px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 0 40px rgba(168, 224, 176, 0.3)',
            color: '#e2f0d9',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#a8e0b0', margin: '0 0 10px 0', letterSpacing: '2px' }}>📜 ANCIENT RIDDLE GATE</h2>
            <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>{currentDoor.question}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentDoor.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerQuiz(opt)}
                  style={{
                    padding: '14px 18px',
                    background: 'rgba(30, 60, 42, 0.8)',
                    border: '1px solid #5a9e67',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TRAP MODAL DIALOG */}
      {activeModal === 'trap' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(25, 5, 8, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200
        }}>
          <div style={{
            background: 'radial-gradient(circle at 50% 20%, #3a1418 0%, #170709 100%)',
            border: '2px solid #ff4d4d',
            borderRadius: '14px',
            padding: '32px',
            width: '90%',
            maxWidth: '460px',
            boxShadow: '0 0 40px rgba(255, 77, 77, 0.4)',
            color: '#ffffff',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#ff4d4d', margin: '0 0 12px 0', letterSpacing: '2px' }}>⚠️ CURSED TRAP DOOR!</h2>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#ffb3b3', marginBottom: '24px' }}>
              You unlocked a dead-end trap area! Turn back and find the correct branch of the maze.
            </p>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                padding: '12px 28px',
                background: '#801a24',
                border: '1px solid #ff4d4d',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Turn Back
            </button>
          </div>
        </div>
      )}

      {/* VICTORY MODAL DIALOG */}
      {activeModal === 'victory' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 25, 12, 0.9)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300
        }}>
          <div style={{
            background: 'radial-gradient(circle at 50% 20%, #2e4d26 0%, #0d1a0b 100%)',
            border: '2px solid #ffd700',
            borderRadius: '16px',
            padding: '40px',
            width: '90%',
            maxWidth: '520px',
            boxShadow: '0 0 60px rgba(255, 215, 0, 0.5)',
            color: '#ffffff',
            textAlign: 'center'
          }}>
            <h1 style={{ color: '#ffd700', fontSize: '32px', margin: '0 0 10px 0', letterSpacing: '3px' }}>🏆 VICTORY!</h1>
            <h3 style={{ color: '#a8e0b0', margin: '0 0 16px 0', fontWeight: '400' }}>YOU ESCAPED THE FOREST MAZE!</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#d8f0d8', marginBottom: '28px' }}>
              You chose the correct Moon Gate and reached the Golden Trophy Shrine! The Attacker was outsmarted and left behind in the dark forest.
            </p>
            <button
              onClick={handleRestart}
              style={{
                padding: '14px 36px',
                background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
                border: 'none',
                borderRadius: '30px',
                color: '#1a1000',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 0 25px rgba(255, 215, 0, 0.6)'
              }}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* DEFEAT MODAL DIALOG */}
      {activeModal === 'defeat' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 5, 8, 0.9)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300
        }}>
          <div style={{
            background: 'radial-gradient(circle at 50% 20%, #4a151b 0%, #150507 100%)',
            border: '2px solid #ff3333',
            borderRadius: '16px',
            padding: '40px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 0 60px rgba(255, 51, 51, 0.5)',
            color: '#ffffff',
            textAlign: 'center'
          }}>
            <h1 style={{ color: '#ff3333', fontSize: '28px', margin: '0 0 10px 0', letterSpacing: '2px' }}>💀 WRONG DOOR! TRAP ACTIVATED!</h1>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#ffb3b3', marginBottom: '28px' }}>
              You chose the Sun Gate! The floor collapsed into an ancient spike pit trap. You should have paid attention to the Riddle Gate clue!
            </p>
            <button
              onClick={handleRestart}
              style={{
                padding: '14px 32px',
                background: '#991b1b',
                border: '1px solid #ff4d4d',
                borderRadius: '30px',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      <Canvas 
        shadows 
        camera={{ position: [0, 5, 10], fov: 55 }} 
        style={{ width: '100vw', height: '100vh', background: '#1e3b25' }}
      >
        <color attach="background" args={["#1e3b25"]} />
        <fog attach="fog" args={["#1e3b25", 20, 180]} />
        
        {/* Bright Natural Ambient Light */}
        <ambientLight intensity={1.4} color="#b2e0b8" />
        
        {/* Directional Daylight filtering through canopy */}
        <directionalLight 
          castShadow 
          position={[40, 60, 30]} 
          intensity={3.2} 
          color="#fff3d1"
          shadow-mapSize={[2048, 2048]}
          shadow-camera-top={140}
          shadow-camera-bottom={-140}
          shadow-camera-left={-140}
          shadow-camera-right={140}
          shadow-camera-near={0.1}
          shadow-camera-far={260}
          shadow-bias={-0.0001}
        />
        
        <hemisphereLight skyColor="#9be3b4" groundColor="#2d4a32" intensity={1.0} />
        
        <Suspense fallback={null}>
          <Physics gravity={[0, -18, 0]}>
            <Scene 
              unlockedDoors={unlockedDoors} 
              playerPos={playerPos} 
            />
            <Player 
              unlockedDoors={unlockedDoors} 
              isFrozen={Boolean(activeModal)} 
              onPositionUpdate={setPlayerPos}
              webcamInputs={webcamInputs.runner}
              onDebugUpdate={setDebugInfo}
            />
            <Attacker 
              targetPos={playerPos} 
              unlockedDoors={unlockedDoors} 
              isFrozen={Boolean(activeModal)}
              webcamInputs={webcamInputs.attacker}
            />
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
