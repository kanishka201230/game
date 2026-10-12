import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import * as THREE from "three";
import Scene from "./Scene";
import Player from "./Player";
import Attacker from "./Attacker";
import WebcamController from "./WebcamController";
import { DOORS_CONFIG, CLUES_CONFIG } from "./pathConfig";
import { ErrorBoundary } from "./ErrorBoundary";
import { InputManager, normalizeEventKey, isTextInput } from "./InputManager";

export default function Game({ onMainMenu }) {
  const [unlockedDoors, setUnlockedDoors] = useState({});
  const [activeModal, setActiveModal] = useState(null); // 'riddle', 'passcode', 'trap', 'victory', 'defeat', 'caught'
  const [currentDoor, setCurrentDoor] = useState(null);
  const [clueDiscovered, setClueDiscovered] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const playerPosRef = useRef({ x: 0, y: 1.5, z: 12 });
  const [webcamInputs, setWebcamInputs] = useState({ runner: {}, attacker: {} });
  
  const [isTrapped, setIsTrapped] = useState(false);
  const [trapPosition, setTrapPosition] = useState(null);

  // Victory State (Requirement 2 & 3)
  const [isVictory, setIsVictory] = useState(false);
  const [nearestInteractableTrophy, setNearestInteractableTrophy] = useState(false);

  // Attacker AI & Survival State
  const [attackerState, setAttackerState] = useState('PATROLLING'); // 'PATROLLING' | 'CHASING' | 'PLAYER CAUGHT' | 'VICTORY ESCAPED'
  const [respawnTrigger, setRespawnTrigger] = useState(0);

  // Hidden Collectible Clues State
  const [collectedClues, setCollectedClues] = useState({});
  const [nearestInteractableClue, setNearestInteractableClue] = useState(null);

  // Passcode Modal State
  const [passcodeEntry, setPasscodeEntry] = useState("");
  const [passcodeStatus, setPasscodeStatus] = useState(null); // null | 'correct' | 'incorrect'
  const [passcodeFeedback, setPasscodeFeedback] = useState("");
  const [isEvaluatingPasscode, setIsEvaluatingPasscode] = useState(false);

  // Question Modal Evaluation State
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizStatus, setQuizStatus] = useState(null); // null | 'correct' | 'incorrect'
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Nearest interactable door within 2-3 world units for on-screen prompt
  const [nearestInteractableDoor, setNearestInteractableDoor] = useState(null);

  // Development-Only Debug Status Overlay State
  const [debugInfo, setDebugInfo] = useState({
    lastKey: "None",
    heldKeys: "None",
    inputDetected: false,
    movementCommand: "None",
    playerPos: "X: 0.00, Y: 0.02, Z: 12.00",
    isOnPath: "YES (On Dirt Path)",
    movementBlocked: "NO",
    blockReason: "None",
    runnerPosBefore: "X: 0.0, Y: 0.0, Z: 12.0",
    runnerPosAfter: "X: 0.0, Y: 0.0, Z: 12.0",
    runnerMovementEnabled: "YES",
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // High-frequency proximity check for on-screen prompts and interaction (clues, doors & trophy)
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeModal || isVictory) {
        setNearestInteractableDoor(null);
        setNearestInteractableClue(null);
        setNearestInteractableTrophy(false);
        return;
      }

      // Check proximity to Golden Trophy (within 4.2 units of [-30, 0, -182])
      const distToTrophy = Math.hypot(playerPosRef.current.x - (-30), playerPosRef.current.z - (-182));
      const nearTrophy = distToTrophy <= 4.2 && Boolean(unlockedDoors.doorA) && !isVictory;
      setNearestInteractableTrophy(nearTrophy);

      // Check proximity to uncollected clues (within 2.8 units)
      let nearestClue = null;
      let minClueDist = Infinity;
      for (const clue of CLUES_CONFIG) {
        if (collectedClues[clue.id]) continue;
        const [cx, cy, cz] = clue.position;
        const dist = Math.hypot(playerPosRef.current.x - cx, playerPosRef.current.z - cz);
        if (dist <= 2.8 && dist < minClueDist) {
          minClueDist = dist;
          nearestClue = clue;
        }
      }
      setNearestInteractableClue(nearestClue);

      // Check proximity to locked gates (within 3.2 units)
      let nearestDoor = null;
      let minDoorDist = Infinity;
      for (const door of DOORS_CONFIG) {
        const [dx, dy, dz] = door.position;
        const dist = Math.hypot(playerPosRef.current.x - dx, playerPosRef.current.z - dz);
        if (dist <= 3.2 && dist < minDoorDist && !unlockedDoors[door.id]) {
          minDoorDist = dist;
          nearestDoor = door;
        }
      }
      setNearestInteractableDoor(nearestDoor);
    }, 80);
    return () => clearInterval(timer);
  }, [unlockedDoors, collectedClues, activeModal, isVictory]);

  // Reliable Interaction Handler (Triggers via E key or on-screen INTERACT button)
  const handleInteract = useCallback(() => {
    if (activeModal || isVictory) return;

    // 1. Priority: Claim Golden Trophy if near altar
    const distToTrophy = Math.hypot(playerPosRef.current.x - (-30), playerPosRef.current.z - (-182));
    if (distToTrophy <= 4.2 && unlockedDoors.doorA && !isVictory) {
      const gateCount = ['door1', 'door2', 'door3'].filter(k => unlockedDoors[k]).length;
      const clueCount = CLUES_CONFIG.filter(c => collectedClues[c.id]).length;
      const finalDoorUnlocked = Boolean(unlockedDoors.doorA);

      if (gateCount === 3 && clueCount === 3 && finalDoorUnlocked) {
        setIsVictory(true);
        setActiveModal('victory');
        setAttackerState('VICTORY ESCAPED');
        InputManager.resetKeys();
        showToast("🏆 GOLDEN TROPHY CLAIMED! You conquered the forest maze!");
        return;
      } else {
        if (gateCount < 3) {
          showToast(`🔒 The Golden Trophy is sealed! You must solve the riddles and unlock all 3 route gates first (${gateCount}/3 unlocked).`);
        } else if (clueCount < 3) {
          showToast(`🔒 The Golden Trophy is sealed! You must collect all 3 hidden clues first (${clueCount}/3 collected).`);
        }
        return;
      }
    }

    // 2. Priority: Collect nearby hidden clue if player is standing near one
    let nearestClue = null;
    let minClueDist = Infinity;
    for (const clue of CLUES_CONFIG) {
      if (collectedClues[clue.id]) continue;
      const [cx, cy, cz] = clue.position;
      const dist = Math.hypot(playerPosRef.current.x - cx, playerPosRef.current.z - cz);
      if (dist <= 2.8 && dist < minClueDist) {
        minClueDist = dist;
        nearestClue = clue;
      }
    }

    if (nearestClue) {
      const newCollected = { ...collectedClues, [nearestClue.id]: true };
      const newCount = CLUES_CONFIG.filter(c => newCollected[c.id]).length;
      setCollectedClues(newCollected);
      InputManager.resetKeys();

      if (newCount === 3) {
        showToast(`🌟 Clue 3 Discovered: ${nearestClue.name} reveals digit '${nearestClue.digit}'! Secret Passcode: 472! Proceed to the Final Moon Gate!`);
      } else {
        showToast(`📜 Clue Discovered: ${nearestClue.name} reveals passcode digit '${nearestClue.digit}'! (${newCount}/3)`);
      }
      return;
    }

    // 3. Door Interaction
    let nearestDoor = null;
    let minDist = Infinity;

    for (const door of DOORS_CONFIG) {
      const [dx, dy, dz] = door.position;
      const dist = Math.hypot(playerPosRef.current.x - dx, playerPosRef.current.z - dz);

      if (dist <= 3.2 && dist < minDist) {
        minDist = dist;
        nearestDoor = door;
      }
    }

    if (!nearestDoor) {
      showToast("No clue, gate, or relic nearby. Approach within 2–3 steps to interact.");
      return;
    }

    if (unlockedDoors[nearestDoor.id]) {
      showToast(`${nearestDoor.name} is already unlocked.`);
      return;
    }

    // Check if interacting with Final Moon Gate (passcode type)
    if (nearestDoor.type === 'passcode' || nearestDoor.id === 'doorA') {
      const clueCount = CLUES_CONFIG.filter(c => collectedClues[c.id]).length;
      if (clueCount < 3) {
        showToast(`🔒 The Ancient Moon Gate is sealed by a 3-digit secret passcode! Find all 3 hidden clues across the forest routes first. (Found: ${clueCount}/3)`);
        return;
      }

      // Player has all 3 clues: open passcode modal
      setPasscodeEntry("");
      setPasscodeStatus(null);
      setPasscodeFeedback("");
      setIsEvaluatingPasscode(false);
      InputManager.resetKeys();
      setCurrentDoor(nearestDoor);
      setActiveModal('passcode');
      return;
    }

    // Reset quiz modal state for riddle gates
    setSelectedOption(null);
    setQuizStatus(null);
    setFeedbackMessage("");
    setIsEvaluating(false);
    InputManager.resetKeys(); // Clear any buffered movement keys

    setCurrentDoor(nearestDoor);
    setActiveModal('riddle');
  }, [unlockedDoors, collectedClues, activeModal, isVictory]);

  // Handle Runner webcam interaction gesture
  useEffect(() => {
    if (webcamInputs.runner && webcamInputs.runner.interact) {
      handleInteract();
    }
  }, [webcamInputs.runner, handleInteract]);

  // Keep stable refs for interact and close actions so listeners are registered ONCE without teardown cycles
  const handleInteractRef = useRef(handleInteract);
  useEffect(() => {
    handleInteractRef.current = handleInteract;
  }, [handleInteract]);

  const activeModalRef = useRef(activeModal);
  useEffect(() => {
    activeModalRef.current = activeModal;
  }, [activeModal]);

  const handleTogglePause = useCallback(() => {
    if (isVictory) return;
    setActiveModal(prev => (prev === 'pause' ? null : prev ? prev : 'pause'));
    InputManager.resetKeys();
  }, [isVictory]);
  const handleTogglePauseRef = useRef(handleTogglePause);
  useEffect(() => {
    handleTogglePauseRef.current = handleTogglePause;
  }, [handleTogglePause]);

  const handleCloseQuestionRef = useRef(null);

  // Highest Priority: Unified, Direct Keyboard Controller
  // Works immediately when game opens, without requiring clicking on-screen buttons
  useEffect(() => {
    // Ensure initial browser window focus
    if (typeof window !== 'undefined') {
      window.focus();
      if (document.body) document.body.focus();
    }

    const onKeyDown = (e) => {
      // Do not move player when typing in input/textarea
      if (isTextInput(e.target) || isTextInput(document.activeElement)) return;

      const normKey = normalizeEventKey(e);
      if (!normKey) return;

      // Prevent browser scrolling while using movement keys during gameplay
      e.preventDefault();

      if (normKey === 'escape') {
        if (!e.repeat) {
          if (activeModalRef.current === 'pause') {
            setActiveModal(null);
            InputManager.resetKeys();
          } else if (activeModalRef.current) {
            if (handleCloseQuestionRef.current) handleCloseQuestionRef.current();
          } else {
            handleTogglePauseRef.current();
          }
        }
        return;
      }

      if (normKey === 'e') {
        if (!e.repeat) {
          handleInteractRef.current();
        }
        return;
      }

      // Continuous movement: holding key keeps key active in InputManager
      InputManager.pressKey(normKey, true);
    };

    const onKeyUp = (e) => {
      const normKey = normalizeEventKey(e);
      if (normKey && normKey !== 'e' && normKey !== 'escape') {
        e.preventDefault();
        InputManager.pressKey(normKey, false);
      }
    };

    const onBlur = () => {
      InputManager.resetKeys();
    };

    const onPointerDownGlobal = () => {
      // Re-focus window on canvas/screen click
      if (typeof window !== 'undefined') window.focus();
    };

    // Attach listeners once with capture: true on window (single global source of truth)
    window.addEventListener('keydown', onKeyDown, { capture: true, passive: false });
    window.addEventListener('keyup', onKeyUp, { capture: true, passive: false });
    window.addEventListener('blur', onBlur);
    window.addEventListener('pointerdown', onPointerDownGlobal);

    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true });
      window.removeEventListener('keyup', onKeyUp, { capture: true });
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('pointerdown', onPointerDownGlobal);
      InputManager.resetKeys();
    };
  }, []); // REGISTERED ONCE ON MOUNT

  const checkZones = useCallback((pos) => {
    if (activeModal || isVictory) return;

    // Sun Gate penalty trap pit trigger at [30, 0, -165]
    if (unlockedDoors.doorB) {
      const distToTrap = Math.hypot(pos.x - 30, pos.z - (-165));
      if (distToTrap < 5.0) {
        setIsTrapped(true);
        setTrapPosition([30, 0, -165]);
        setActiveModal('defeat');
      }
    }
  }, [unlockedDoors, activeModal, isVictory]);

  // Question UI Answer Selection Handler
  const handleSelectOption = (opt, index) => {
    if (isEvaluating || quizStatus === 'correct') return; // Disable repeated clicks while evaluating
    setSelectedOption(index);
    setIsEvaluating(true);

    if (opt.correct) {
      setQuizStatus('correct');
      setFeedbackMessage(`✓ Correct! ${currentDoor.name} unlocked. You may now pass through.`);
      setUnlockedDoors(prev => {
        const next = { ...prev, [currentDoor.id]: true };
        const count = ['door1', 'door2', 'door3'].filter(k => next[k]).length;
        if (count === 3 && !['door1', 'door2', 'door3'].every(k => prev[k])) {
          showToast("🌟 All Three Gates Unlocked! Route-selection objective completed!");
        } else {
          showToast(currentDoor.successMessage || `✓ Correct! ${currentDoor.name} Unlocked!`);
        }
        return next;
      });
      if (opt.clue) {
        setClueDiscovered(opt.clue);
      }

      // Automatically close modal after brief confirmation and enable immediate passage
      setTimeout(() => {
        setActiveModal(null);
        setSelectedOption(null);
        setQuizStatus(null);
        setFeedbackMessage("");
        setIsEvaluating(false);
        InputManager.resetKeys();
        if (typeof window !== 'undefined') window.focus();
      }, 1200);
    } else {
      setQuizStatus('incorrect');
      setFeedbackMessage("✗ Incorrect Answer! The gate remains locked. Think carefully and try again.");
      setIsEvaluating(false);
    }
  };

  const handleRetryQuestion = () => {
    setSelectedOption(null);
    setQuizStatus(null);
    setFeedbackMessage("");
    setIsEvaluating(false);
  };

  const handlePasscodeSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isEvaluatingPasscode || passcodeStatus === 'correct') return;

    setIsEvaluatingPasscode(true);
    const cleaned = passcodeEntry.trim();
    if (cleaned === '472') {
      setPasscodeStatus('correct');
      setPasscodeFeedback("✓ Correct Passcode Accepted! The Ancient Moon Gate swings open.");
      setUnlockedDoors(prev => ({ ...prev, doorA: true }));
      showToast("🌟 Ancient Moon Gate Unlocked! The Golden Trophy Sanctuary is open!");
      setTimeout(() => {
        setActiveModal(null);
        setPasscodeEntry("");
        setPasscodeStatus(null);
        setPasscodeFeedback("");
        setIsEvaluatingPasscode(false);
        InputManager.resetKeys();
        if (typeof window !== 'undefined') window.focus();
      }, 1200);
    } else {
      setPasscodeStatus('incorrect');
      setPasscodeFeedback("✗ Incorrect Passcode! The Moon Gate remains firmly sealed. Check your collected clues.");
      setIsEvaluatingPasscode(false);
    }
  };

  const handleClosePasscode = () => {
    setActiveModal(null);
    setPasscodeEntry("");
    setPasscodeStatus(null);
    setPasscodeFeedback("");
    setIsEvaluatingPasscode(false);
    InputManager.resetKeys();
    if (typeof window !== 'undefined') window.focus();
  };

  const handleCloseQuestion = () => {
    setActiveModal(null);
    setSelectedOption(null);
    setQuizStatus(null);
    setFeedbackMessage("");
    setIsEvaluating(false);
    setPasscodeEntry("");
    setPasscodeStatus(null);
    setPasscodeFeedback("");
    setIsEvaluatingPasscode(false);
    InputManager.resetKeys();
    if (typeof window !== 'undefined') window.focus();
  };

  useEffect(() => {
    handleCloseQuestionRef.current = handleCloseQuestion;
  }, [handleCloseQuestion]);

  const handleRestart = () => {
    window.location.reload();
  };

  const handlePlayAgain = () => {
    setUnlockedDoors({});
    setCollectedClues({});
    setPasscodeEntry("");
    setPasscodeStatus(null);
    setPasscodeFeedback("");
    setIsEvaluatingPasscode(false);
    setSelectedOption(null);
    setQuizStatus(null);
    setFeedbackMessage("");
    setIsEvaluating(false);
    setIsVictory(false);
    setIsTrapped(false);
    setTrapPosition(null);
    setClueDiscovered(null);
    setActiveModal(null);
    setAttackerState('PATROLLING');
    setRespawnTrigger(prev => prev + 1);
    InputManager.resetKeys();
    if (typeof window !== 'undefined') window.focus();
    showToast("Play Again! Explore the 3 routes and collect the clues to win.");
  };

  const handleMainMenu = () => {
    if (onMainMenu) {
      onMainMenu();
    } else {
      window.location.href = window.location.origin + window.location.pathname;
    }
  };

  const handlePlayerCaught = useCallback(() => {
    if (activeModal === 'caught' || activeModal === 'victory' || isVictory) return;
    setActiveModal('caught');
    setAttackerState('PLAYER CAUGHT');
    InputManager.resetKeys();
  }, [activeModal, isVictory]);

  const handleRetry = useCallback(() => {
    setActiveModal(null);
    setAttackerState('PATROLLING');
    setRespawnTrigger(prev => prev + 1);
    InputManager.resetKeys();
    if (typeof window !== 'undefined') window.focus();
    showToast("Respawned at forest entrance. Gate progress and clues preserved!");
  }, []);

  const unlockedGateCount = ['door1', 'door2', 'door3'].filter(k => unlockedDoors[k]).length;
  const allThreeGatesUnlocked = unlockedGateCount === 3;

  const clueCount = CLUES_CONFIG.filter(c => collectedClues[c.id]).length;
  const allThreeCluesCollected = clueCount === 3;
  const finalDoorUnlocked = Boolean(unlockedDoors.doorA);
  const allObjectivesMet = allThreeGatesUnlocked && allThreeCluesCollected && finalDoorUnlocked;

  const passcodeDisplay = [
    collectedClues.clue1 ? '4' : '_',
    collectedClues.clue2 ? '7' : '_',
    collectedClues.clue3 ? '2' : '_'
  ].join(' ');

  return (
    <>
      {/* All Three Gates Unlocked celebration banner */}
      {allThreeGatesUnlocked && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: 'rgba(10, 32, 18, 0.95)',
          border: '2px solid #52b788',
          color: '#e2f0d9',
          padding: '10px 24px',
          borderRadius: '24px',
          fontSize: '15px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          boxShadow: '0 0 25px rgba(82, 183, 136, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '18px' }}>🌟</span>
          <span>All Three Gates Unlocked!</span>
        </div>
      )}

      {/* Top Left Objectives & Progress HUD Panel */}
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        zIndex: 10, 
        color: '#e2f0d9', 
        background: 'linear-gradient(180deg, rgba(5, 22, 17, 0.94) 0%, rgba(2, 14, 11, 0.98) 100%)', 
        padding: '16px 20px', 
        borderRadius: '16px', 
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 8px 32px rgba(0,0,0,0.7), inset 0 0 20px rgba(42, 233, 170, 0.08)',
        border: '1.5px solid rgba(42, 233, 170, 0.45)',
        backdropFilter: 'blur(16px)',
        maxWidth: '320px',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, letterSpacing: '1.5px', fontSize: '14px', color: '#73f5c7', fontFamily: "'Cinzel', serif", fontWeight: 800 }}>
            🌲 FOREST ESCAPE
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleTogglePause}
              style={{
                background: 'rgba(6, 28, 22, 0.85)',
                border: '1px solid #2ae9aa',
                borderRadius: '8px',
                color: '#a7f3d0',
                padding: '2px 8px',
                fontFamily: "'Cinzel', serif",
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 0 10px rgba(42, 233, 170, 0.2)'
              }}
              title="Pause Game (ESC)"
            >
              ⏸ PAUSE
            </button>
            <span style={{ 
              fontSize: '11px', 
              background: allThreeGatesUnlocked ? 'rgba(112, 224, 0, 0.3)' : 'rgba(76, 175, 80, 0.25)', 
              border: `1px solid ${allThreeGatesUnlocked ? '#70e000' : '#4caf50'}`, 
              color: allThreeGatesUnlocked ? '#70e000' : '#a8e0b0', 
              padding: '2px 8px', 
              borderRadius: '12px',
              fontWeight: 'bold',
              fontFamily: "'Cinzel', serif"
            }}>
              Gates: {unlockedGateCount}/3
            </span>
          </div>
        </div>

        {/* Current Objective */}
        <div style={{ 
          background: allThreeGatesUnlocked ? 'rgba(25, 55, 35, 0.85)' : 'rgba(20, 45, 30, 0.65)', 
          borderLeft: `3px solid ${allThreeGatesUnlocked ? '#70e000' : '#52b788'}`, 
          padding: '8px 10px', 
          borderRadius: '4px', 
          fontSize: '11px', 
          lineHeight: '1.45', 
          marginBottom: '10px' 
        }}>
          <b style={{ color: allThreeGatesUnlocked ? '#70e000' : '#ffd700' }}>
            {allThreeGatesUnlocked ? '✅ OBJECTIVE COMPLETED:' : '🎯 OBJECTIVE:'}
          </b><br />
          {allThreeGatesUnlocked
            ? "All Three Gates Unlocked! Route-selection objective completed. Proceed deeper into the forest!"
            : "Explore the 3 branching routes, solve gate riddles, and discover clues."}
        </div>

        {/* Attacker AI Status Indicator (Requirement 6) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: attackerState === 'CHASING' 
            ? 'rgba(75, 15, 20, 0.92)' 
            : attackerState === 'PLAYER CAUGHT'
            ? 'rgba(95, 10, 15, 0.95)'
            : 'rgba(15, 35, 25, 0.8)',
          border: `1.5px solid ${attackerState === 'CHASING' ? '#ff4d4d' : attackerState === 'PLAYER CAUGHT' ? '#ff1a1a' : '#52b788'}`,
          borderRadius: '8px',
          padding: '7px 10px',
          marginBottom: '10px',
          fontSize: '11px',
          fontWeight: 'bold',
          boxShadow: attackerState === 'CHASING' ? '0 0 12px rgba(255, 77, 77, 0.5)' : 'none'
        }}>
          <span style={{ color: '#d8f0d8' }}>👹 ATTACKER:</span>
          <span style={{ 
            color: attackerState === 'CHASING' ? '#ff6b6b' : attackerState === 'PLAYER CAUGHT' ? '#ff3333' : '#70e000',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: attackerState === 'CHASING' ? '#ff4d4d' : attackerState === 'PLAYER CAUGHT' ? '#ff1a1a' : '#70e000',
              boxShadow: `0 0 8px ${attackerState === 'CHASING' ? '#ff4d4d' : attackerState === 'PLAYER CAUGHT' ? '#ff1a1a' : '#70e000'}`
            }} />
            {attackerState}
          </span>
        </div>

        {/* Secret Clues & Passcode Progress HUD Section */}
        <div style={{
          background: allThreeCluesCollected ? 'rgba(12, 45, 28, 0.92)' : 'rgba(15, 32, 22, 0.8)',
          border: `1.5px solid ${allThreeCluesCollected ? '#70e000' : '#2ae9aa'}`,
          borderRadius: '8px',
          padding: '8px 10px',
          marginBottom: '10px',
          boxShadow: allThreeCluesCollected ? '0 0 14px rgba(112, 224, 0, 0.4)' : 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', color: '#a8e0b0', fontWeight: 'bold' }}>📜 HIDDEN CLUES:</span>
            <span style={{
              fontSize: '11px',
              fontWeight: 'bold',
              color: allThreeCluesCollected ? '#70e000' : '#ffd700',
              background: allThreeCluesCollected ? 'rgba(112, 224, 0, 0.25)' : 'rgba(255, 215, 0, 0.15)',
              border: `1px solid ${allThreeCluesCollected ? '#70e000' : 'rgba(255, 215, 0, 0.4)'}`,
              padding: '1px 8px',
              borderRadius: '10px'
            }}>
              Clues: {clueCount}/3
            </span>
          </div>

          {/* Passcode Digits Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(5, 18, 12, 0.8)',
            borderRadius: '6px',
            padding: '5px 8px',
            marginTop: '4px'
          }}>
            <span style={{ fontSize: '11px', color: '#c4e0cb' }}>Passcode:</span>
            <span style={{
              fontSize: '15px',
              fontWeight: 'bold',
              letterSpacing: '4px',
              fontFamily: 'monospace',
              color: allThreeCluesCollected ? '#70e000' : '#2ae9aa',
              textShadow: allThreeCluesCollected ? '0 0 10px rgba(112, 224, 0, 0.8)' : '0 0 8px rgba(42, 233, 170, 0.5)'
            }}>
              {passcodeDisplay}
            </span>
          </div>

          <div style={{ fontSize: '10px', color: allThreeCluesCollected ? '#a8e0b0' : '#88a892', marginTop: '4px', textAlign: 'center' }}>
            {allThreeCluesCollected ? '✨ Passcode Complete! Moon Gate can be unlocked!' : 'Find glowing runes along routes to reveal digits'}
          </div>
        </div>

        {/* Gate Progress Indicator */}
        <div style={{ fontSize: '11px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Route 1 (Left Riddle Gate):</span>
            <span style={{ color: unlockedDoors.door1 ? '#70e000' : '#ffaa00', fontWeight: 'bold' }}>
              {unlockedDoors.door1 ? '🔓 UNLOCKED' : '🔒 LOCKED'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Route 2 (Right Shadow Gate):</span>
            <span style={{ color: unlockedDoors.door2 ? '#70e000' : '#ffaa00', fontWeight: 'bold' }}>
              {unlockedDoors.door2 ? '🔓 UNLOCKED' : '🔒 LOCKED'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Route 3 (Center Ancient Gate):</span>
            <span style={{ color: unlockedDoors.door3 ? '#70e000' : '#ffaa00', fontWeight: 'bold' }}>
              {unlockedDoors.door3 ? '🔓 UNLOCKED' : '🔒 LOCKED'}
            </span>
          </div>
        </div>

        {/* Interaction Instructions */}
        <div style={{ fontSize: '11px', color: '#c4e0cb', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', lineHeight: '1.5' }}>
          <div>🎮 <b>W / A / S / D</b> Walk | <b>SHIFT</b> Run | <b>SPACE</b> Jump</div>
          <div>📜 <b>[E]</b> or <b>INTERACT</b> to Collect Clues & Unlock Gates</div>
        </div>

        {clueDiscovered && (
          <div style={{ marginTop: '10px', background: 'rgba(255, 215, 0, 0.15)', border: '1px solid #ffd700', padding: '8px 10px', borderRadius: '6px', fontSize: '11px', color: '#ffe57f' }}>
            <b>💡 CLUE DISCOVERED:</b><br />
            {clueDiscovered}
          </div>
        )}
      </div>

      {/* Development Debug Status Overlay (Requirement 9) */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 100,
        background: 'rgba(5, 12, 8, 0.9)',
        border: '1px solid #ffcc00',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#fffae6',
        fontFamily: 'monospace',
        fontSize: '11px',
        lineHeight: '1.6',
        boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
        maxWidth: '420px'
      }}>
        <div style={{ fontWeight: 'bold', color: '#ffd700', marginBottom: '4px' }}>🛠️ PATH & MOVEMENT DEBUG OVERLAY</div>
        <div><b>Player Position:</b> <span style={{ color: '#00ffcc' }}>{debugInfo.playerPos || debugInfo.runnerPosAfter}</span></div>
        <div><b>On Path:</b> <span style={{ color: debugInfo.isOnPath?.startsWith('YES') ? '#a8e0b0' : '#ffcc00' }}>{debugInfo.isOnPath}</span></div>
        <div><b>Movement Blocked:</b> <span style={{ color: debugInfo.movementBlocked?.startsWith('YES') ? '#ff9999' : '#a8e0b0' }}>{debugInfo.movementBlocked}</span></div>
        <div><b>Block Reason:</b> <span style={{ color: '#ffb3b3' }}>{debugInfo.blockReason || 'None'}</span></div>
        <div><b>Movement Command:</b> <span style={{ color: '#ffe57f' }}>{debugInfo.movementCommand}</span></div>
        <div><b>Held Keys:</b> <span style={{ color: '#a8e0b0' }}>{debugInfo.heldKeys}</span></div>
        <div><b>Runner Enabled:</b> <span style={{ color: debugInfo.runnerMovementEnabled === 'YES' ? '#a8e0b0' : '#ff9999' }}>{debugInfo.runnerMovementEnabled}</span></div>
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

      {/* Play Store & Mobile/Desktop On-Screen Movement Controller */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 150,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none'
      }}>
        {/* Forward button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onPointerDown={(e) => { e.preventDefault(); InputManager.pressKey('w', true); }}
            onPointerUp={(e) => { e.preventDefault(); InputManager.pressKey('w', false); }}
            onPointerLeave={(e) => { e.preventDefault(); InputManager.pressKey('w', false); }}
            onPointerCancel={(e) => { e.preventDefault(); InputManager.pressKey('w', false); }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'rgba(15, 35, 22, 0.9)',
              border: '2px solid #52b788',
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
              lineHeight: 1
            }}
            title="Move Forward (W / Up)"
          >
            <span>▲</span>
            <span style={{ fontSize: '9px', color: '#a8e0b0', marginTop: '2px' }}>W</span>
          </button>
        </div>

        {/* Left, Backward, Right row */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onPointerDown={(e) => { e.preventDefault(); InputManager.pressKey('a', true); }}
            onPointerUp={(e) => { e.preventDefault(); InputManager.pressKey('a', false); }}
            onPointerLeave={(e) => { e.preventDefault(); InputManager.pressKey('a', false); }}
            onPointerCancel={(e) => { e.preventDefault(); InputManager.pressKey('a', false); }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'rgba(15, 35, 22, 0.9)',
              border: '2px solid #52b788',
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
              lineHeight: 1
            }}
            title="Move Left (A / Left)"
          >
            <span>◀</span>
            <span style={{ fontSize: '9px', color: '#a8e0b0', marginTop: '2px' }}>A</span>
          </button>

          <button
            onPointerDown={(e) => { e.preventDefault(); InputManager.pressKey('s', true); }}
            onPointerUp={(e) => { e.preventDefault(); InputManager.pressKey('s', false); }}
            onPointerLeave={(e) => { e.preventDefault(); InputManager.pressKey('s', false); }}
            onPointerCancel={(e) => { e.preventDefault(); InputManager.pressKey('s', false); }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'rgba(15, 35, 22, 0.9)',
              border: '2px solid #52b788',
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
              lineHeight: 1
            }}
            title="Move Backward (S / Down)"
          >
            <span>▼</span>
            <span style={{ fontSize: '9px', color: '#a8e0b0', marginTop: '2px' }}>S</span>
          </button>

          <button
            onPointerDown={(e) => { e.preventDefault(); InputManager.pressKey('d', true); }}
            onPointerUp={(e) => { e.preventDefault(); InputManager.pressKey('d', false); }}
            onPointerLeave={(e) => { e.preventDefault(); InputManager.pressKey('d', false); }}
            onPointerCancel={(e) => { e.preventDefault(); InputManager.pressKey('d', false); }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'rgba(15, 35, 22, 0.9)',
              border: '2px solid #52b788',
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
              lineHeight: 1
            }}
            title="Move Right (D / Right)"
          >
            <span>▶</span>
            <span style={{ fontSize: '9px', color: '#a8e0b0', marginTop: '2px' }}>D</span>
          </button>
        </div>

        {/* Action Buttons (Interact, Sprint, Jump) */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            disabled={Boolean(activeModal) || isVictory}
            onClick={(e) => {
              e.preventDefault();
              handleInteract();
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              background: nearestInteractableTrophy
                ? 'linear-gradient(135deg, rgba(80, 50, 10, 0.98) 0%, rgba(50, 30, 5, 0.98) 100%)'
                : nearestInteractableClue
                ? 'rgba(12, 60, 40, 0.98)'
                : nearestInteractableDoor
                ? 'rgba(20, 80, 45, 0.98)'
                : 'rgba(20, 60, 35, 0.95)',
              border: nearestInteractableTrophy
                ? '2px solid #ffd700'
                : nearestInteractableClue
                ? '2px solid #2ae9aa'
                : nearestInteractableDoor
                ? '2px solid #70e000'
                : '2px solid #52b788',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: (activeModal || isVictory) ? 'not-allowed' : 'pointer',
              boxShadow: nearestInteractableTrophy
                ? '0 0 18px rgba(255, 215, 0, 0.8)'
                : nearestInteractableClue
                ? '0 0 15px rgba(42, 233, 170, 0.7)'
                : nearestInteractableDoor
                ? '0 0 15px rgba(112, 224, 0, 0.6)'
                : '0 4px 12px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: (activeModal || isVictory) ? 0.5 : 1
            }}
            title="Interact (E)"
          >
            {nearestInteractableTrophy
              ? (allObjectivesMet ? '🏆 CLAIM TROPHY' : '🔒 TROPHY SEALED')
              : nearestInteractableClue
              ? '📜 COLLECT CLUE'
              : nearestInteractableDoor?.id === 'doorA'
              ? (allThreeCluesCollected ? '🌙 ENTER CODE' : '🔒 FINAL GATE')
              : '🚪 INTERACT'}
          </button>
          <button
            disabled={Boolean(activeModal) || isVictory}
            onPointerDown={(e) => {
              e.preventDefault();
              if (activeModal || isVictory) return;
              try { e.currentTarget.setPointerCapture(e.pointerId); } catch(err) {}
              InputManager.pressKey('shift', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(err) {}
              InputManager.pressKey('shift', false);
            }}
            onPointerLeave={(e) => { e.preventDefault(); InputManager.pressKey('shift', false); }}
            onPointerCancel={(e) => { e.preventDefault(); InputManager.pressKey('shift', false); }}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(35, 25, 10, 0.9)',
              border: '1.5px solid #ffd700',
              color: '#ffd700',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: (activeModal || isVictory) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              opacity: (activeModal || isVictory) ? 0.5 : 1
            }}
            title="Sprint / Run"
          >
            ⚡ RUN
          </button>
          <button
            disabled={Boolean(activeModal) || isVictory}
            onPointerDown={(e) => {
              e.preventDefault();
              if (activeModal || isVictory) return;
              try { e.currentTarget.setPointerCapture(e.pointerId); } catch(err) {}
              InputManager.pressKey(' ', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(err) {}
              InputManager.pressKey(' ', false);
            }}
            onPointerLeave={(e) => { e.preventDefault(); InputManager.pressKey(' ', false); }}
            onPointerCancel={(e) => { e.preventDefault(); InputManager.pressKey(' ', false); }}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(15, 35, 45, 0.9)',
              border: '1.5px solid #00ffcc',
              color: '#00ffcc',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: (activeModal || isVictory) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              opacity: (activeModal || isVictory) ? 0.5 : 1
            }}
            title="Jump"
          >
            ⬆ JUMP
          </button>
        </div>
      </div>

      {/* Floating On-Screen Proximity Prompt Banner */}
      {!activeModal && !isVictory && (nearestInteractableTrophy || nearestInteractableClue || nearestInteractableDoor) && (
        <div style={{
          position: 'absolute',
          bottom: 110,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 140,
          background: nearestInteractableTrophy
            ? 'rgba(18, 38, 22, 0.96)'
            : nearestInteractableClue
            ? 'rgba(6, 26, 18, 0.96)'
            : 'rgba(10, 28, 18, 0.95)',
          border: `2px solid ${nearestInteractableTrophy ? '#ffd700' : nearestInteractableClue ? '#2ae9aa' : '#52b788'}`,
          borderRadius: '30px',
          padding: '10px 24px',
          color: '#ffffff',
          fontFamily: "'Segoe UI', Roboto, sans-serif",
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: nearestInteractableTrophy
            ? '0 0 25px rgba(255, 215, 0, 0.75)'
            : nearestInteractableClue
            ? '0 0 25px rgba(42, 233, 170, 0.7)'
            : '0 0 25px rgba(82, 183, 136, 0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}>
          {nearestInteractableTrophy ? (
            allObjectivesMet ? (
              <>
                <span style={{ color: '#ffd700', fontSize: '18px' }}>🏆 [E]</span>
                <span>Press <b>E</b> to Claim the <b>Golden Trophy</b>!</span>
              </>
            ) : (
              <>
                <span style={{ color: '#ffa94d', fontSize: '16px' }}>🔒</span>
                <span><b>Golden Trophy is Sealed!</b> (Unlock all 3 Gates & Clues first)</span>
              </>
            )
          ) : nearestInteractableClue ? (
            <>
              <span style={{ color: '#2ae9aa', fontSize: '16px' }}>📜 [E]</span>
              <span>Press <b>E</b> to Collect <b>{nearestInteractableClue.name}</b></span>
            </>
          ) : nearestInteractableDoor.id === 'doorA' ? (
            allThreeCluesCollected ? (
              <>
                <span style={{ color: '#2ae9aa', fontSize: '16px' }}>🌙 [E]</span>
                <span>Press <b>E</b> to Enter Secret Passcode for <b>{nearestInteractableDoor.name}</b></span>
              </>
            ) : (
              <>
                <span style={{ color: '#ffd700', fontSize: '16px' }}>🔒</span>
                <span><b>{nearestInteractableDoor.name}</b> requires 3 Clues to Unlock ({clueCount}/3 found)</span>
              </>
            )
          ) : (
            <>
              <span style={{ color: '#ffd700', fontSize: '16px' }}>🚪 [E]</span>
              <span>Press <b>E</b> to Interact with <b>{nearestInteractableDoor.name}</b></span>
            </>
          )}
        </div>
      )}

      {/* PASSCODE ENTRY MODAL (Enchanted Forest Theme matching Question Screen) */}
      {activeModal === 'passcode' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'radial-gradient(ellipse at center, rgba(3, 16, 12, 0.72) 0%, rgba(1, 8, 6, 0.94) 100%), url("/forest_question_bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: '24px 16px',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          {/* Ambient Glowing Turquoise Spores */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {[
              { top: '15%', left: '12%', size: 6 },
              { top: '28%', left: '22%', size: 4 },
              { top: '65%', left: '18%', size: 5 },
              { top: '18%', right: '14%', size: 5 },
              { top: '35%', right: '20%', size: 7 },
              { top: '72%', right: '22%', size: 6 },
            ].map((spore, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  top: spore.top,
                  left: spore.left,
                  right: spore.right,
                  width: `${spore.size}px`,
                  height: `${spore.size}px`,
                  borderRadius: '50%',
                  background: '#2ae9aa',
                  boxShadow: '0 0 12px 3px rgba(42, 233, 170, 0.85)',
                  opacity: 0.65
                }}
              />
            ))}
          </div>

          {/* Passcode Stone Tablet Container */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(6, 28, 22, 0.92) 0%, rgba(3, 18, 14, 0.96) 100%)',
            border: '2px solid #2ae9aa',
            borderRadius: '24px',
            padding: '36px 36px 32px 36px',
            width: 'min(90vw, 560px)',
            maxWidth: '650px',
            maxHeight: '94vh',
            overflowY: 'auto',
            boxSizing: 'border-box',
            boxShadow: '0 0 45px rgba(42, 233, 170, 0.35), inset 0 0 35px rgba(42, 233, 170, 0.1), 0 30px 70px rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(16px)',
            color: '#e2f0d9',
            textAlign: 'center'
          }}>
            {/* Top Emblem */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              width: '100%',
              maxWidth: '380px'
            }}>
              <div style={{
                flex: 1,
                height: '1.5px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(42, 233, 170, 0.25) 20%, #2ae9aa 100%)'
              }} />
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #2ae9aa 0%, #0d4a34 100%)',
                border: '1.5px solid #a8e0b0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 12px',
                boxShadow: '0 0 15px rgba(42, 233, 170, 0.6)'
              }}>
                <span style={{ fontSize: '18px' }}>🌙</span>
              </div>
              <div style={{
                flex: 1,
                height: '1.5px',
                background: 'linear-gradient(270deg, transparent 0%, rgba(42, 233, 170, 0.25) 20%, #2ae9aa 100%)'
              }} />
            </div>

            {/* Header Title */}
            <div style={{
              fontSize: '12px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#2ae9aa',
              fontWeight: 'bold',
              marginBottom: '6px'
            }}>
              CELESTIAL SEAL • FINAL DOOR
            </div>
            <h2 style={{
              margin: '0 0 10px 0',
              fontSize: '22px',
              color: '#ffffff',
              letterSpacing: '1.5px',
              fontFamily: "'Cinzel', Georgia, serif"
            }}>
              ANCIENT MOON GATE
            </h2>

            <p style={{
              fontSize: '14px',
              color: '#c4e0cb',
              lineHeight: '1.5',
              margin: '0 0 20px 0'
            }}>
              The Moon Gate is locked by an ancient numeric seal. Enter the 3-digit secret passcode revealed by the hidden forest runes.
            </p>

            {/* Clues Summary Helper */}
            <div style={{
              background: 'rgba(10, 36, 24, 0.85)',
              border: '1px solid #52b788',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#a8e0b0', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px' }}>
                DISCOVERED FOREST CLUES (3/3)
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  background: 'rgba(42, 233, 170, 0.15)',
                  border: '1.5px solid #2ae9aa',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  color: '#2ae9aa',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  fontFamily: 'monospace'
                }}>
                  Rune 1: <b>4</b>
                </div>
                <span style={{ color: '#52b788', fontWeight: 'bold' }}>•</span>
                <div style={{
                  background: 'rgba(42, 233, 170, 0.15)',
                  border: '1.5px solid #2ae9aa',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  color: '#2ae9aa',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  fontFamily: 'monospace'
                }}>
                  Tablet 2: <b>7</b>
                </div>
                <span style={{ color: '#52b788', fontWeight: 'bold' }}>•</span>
                <div style={{
                  background: 'rgba(42, 233, 170, 0.15)',
                  border: '1.5px solid #2ae9aa',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  color: '#2ae9aa',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  fontFamily: 'monospace'
                }}>
                  Scroll 3: <b>2</b>
                </div>
              </div>
            </div>

            {/* Passcode Input Form */}
            <form onSubmit={handlePasscodeSubmit} style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '14px' }}>
                <input
                  type="text"
                  autoFocus
                  maxLength={3}
                  pattern="[0-9]*"
                  value={passcodeEntry}
                  onChange={(e) => setPasscodeEntry(e.target.value.replace(/[^0-9]/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') handleClosePasscode();
                  }}
                  placeholder="Enter 3-digit code..."
                  style={{
                    width: '260px',
                    padding: '12px 18px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    letterSpacing: '8px',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    background: 'rgba(4, 20, 14, 0.95)',
                    border: passcodeStatus === 'correct'
                      ? '2px solid #70e000'
                      : passcodeStatus === 'incorrect'
                      ? '2px solid #ff4d4d'
                      : '2px solid #2ae9aa',
                    borderRadius: '12px',
                    color: '#ffffff',
                    outline: 'none',
                    boxShadow: passcodeStatus === 'correct'
                      ? '0 0 20px rgba(112, 224, 0, 0.5)'
                      : passcodeStatus === 'incorrect'
                      ? '0 0 20px rgba(255, 77, 77, 0.5)'
                      : '0 0 15px rgba(42, 233, 170, 0.3)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Feedback Message */}
              {passcodeFeedback && (
                <div style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: passcodeStatus === 'correct' ? '#70e000' : '#ff8585',
                  marginBottom: '16px',
                  padding: '8px 12px',
                  background: passcodeStatus === 'correct' ? 'rgba(112, 224, 0, 0.15)' : 'rgba(255, 77, 77, 0.15)',
                  borderRadius: '8px',
                  border: `1px solid ${passcodeStatus === 'correct' ? '#70e000' : '#ff4d4d'}`
                }}>
                  {passcodeFeedback}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
                <button
                  type="submit"
                  disabled={isEvaluatingPasscode || passcodeStatus === 'correct' || passcodeEntry.length === 0}
                  style={{
                    padding: '12px 28px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1f6b40 0%, #0d4224 100%)',
                    border: '1.5px solid #2ae9aa',
                    color: '#ffffff',
                    cursor: (isEvaluatingPasscode || passcodeStatus === 'correct' || passcodeEntry.length === 0) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 18px rgba(42, 233, 170, 0.4)',
                    opacity: (isEvaluatingPasscode || passcodeStatus === 'correct' || passcodeEntry.length === 0) ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  🔓 UNLOCK GATE
                </button>

                <button
                  type="button"
                  onClick={handleClosePasscode}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    background: 'rgba(20, 30, 24, 0.8)',
                    border: '1px solid #52b788',
                    color: '#c4e0cb',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  ↩ STEP BACK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUESTION MODAL DIALOG (Exact Visual Redesign Matching Target Fantasy Design) */}
      {activeModal === 'riddle' && currentDoor && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'radial-gradient(ellipse at center, rgba(3, 16, 12, 0.65) 0%, rgba(1, 8, 6, 0.88) 100%), url("/forest_question_bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: '24px 16px',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          {/* Subtle Ambient Magical Floating Spores */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {[
              { top: '15%', left: '12%', size: 6 },
              { top: '28%', left: '22%', size: 4 },
              { top: '45%', left: '15%', size: 7 },
              { top: '65%', left: '18%', size: 5 },
              { top: '80%', left: '25%', size: 6 },
              { top: '18%', right: '14%', size: 5 },
              { top: '35%', right: '20%', size: 7 },
              { top: '55%', right: '16%', size: 4 },
              { top: '72%', right: '22%', size: 6 },
              { top: '85%', right: '15%', size: 5 },
            ].map((spore, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  top: spore.top,
                  left: spore.left,
                  right: spore.right,
                  width: `${spore.size}px`,
                  height: `${spore.size}px`,
                  borderRadius: '50%',
                  background: '#2ae9aa',
                  boxShadow: '0 0 12px 3px rgba(42, 233, 170, 0.85)',
                  opacity: 0.65
                }}
              />
            ))}
          </div>

          {/* Main Question Shrine Tablet Panel */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(6, 28, 22, 0.88) 0%, rgba(3, 18, 14, 0.94) 100%)',
            border: '2px solid #2ae9aa',
            borderRadius: '24px',
            padding: '36px 36px 32px 36px',
            width: 'min(90vw, 760px)',
            maxWidth: '1050px',
            maxHeight: '94vh',
            overflowY: 'auto',
            boxSizing: 'border-box',
            boxShadow: '0 0 45px rgba(42, 233, 170, 0.35), inset 0 0 35px rgba(42, 233, 170, 0.1), 0 30px 70px rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(16px)',
            color: '#e2f0d9',
            textAlign: 'center'
          }}>
            {/* Top Shield Emblem with Horizontal Flourish Wings */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px auto',
              width: '100%',
              maxWidth: '380px'
            }}>
              {/* Left Flourish Line */}
              <div style={{
                flex: 1,
                height: '1.5px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(42, 233, 170, 0.25) 20%, #2ae9aa 100%)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  right: '0',
                  top: '-4px',
                  width: '8px',
                  height: '8px',
                  borderTop: '1.5px solid #2ae9aa',
                  borderRight: '1.5px solid #2ae9aa',
                  transform: 'rotate(45deg)'
                }} />
              </div>

              {/* Center Shield Emblem */}
              <div style={{
                margin: '0 14px',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  {/* Outer Shield Outline */}
                  <path
                    d="M32 4 C46 4 56 12 56 24 C56 43 32 60 32 60 C32 60 8 43 8 24 C8 12 18 4 32 4 Z"
                    fill="#082b22"
                    stroke="#2ae9aa"
                    strokeWidth="2"
                    filter="drop-shadow(0 0 10px rgba(42, 233, 170, 0.8))"
                  />
                  {/* Inner Shield Rim */}
                  <path
                    d="M32 8 C43 8 51 15 51 25 C51 40 32 54 32 54 C32 54 13 40 13 25 C13 15 21 8 32 8 Z"
                    stroke="rgba(42, 233, 170, 0.4)"
                    strokeWidth="1"
                  />
                  {/* Map Scroll Outlines */}
                  <path
                    d="M21 23 L28 20 L37 24 L44 21 L44 41 L37 44 L28 40 L21 43 Z"
                    stroke="#73f5c7"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                    fill="none"
                    opacity="0.85"
                  />
                  <line x1="28" y1="20" x2="28" y2="40" stroke="#73f5c7" strokeWidth="1.2" strokeDasharray="1.5 1.5" opacity="0.6" />
                  <line x1="37" y1="24" x2="37" y2="44" stroke="#73f5c7" strokeWidth="1.2" strokeDasharray="1.5 1.5" opacity="0.6" />
                  {/* Location Marker Pin */}
                  <circle cx="32" cy="29" r="4.5" fill="#2ae9aa" stroke="#051c15" strokeWidth="1.5" />
                  <circle cx="32" cy="29" r="1.8" fill="#051c15" />
                  <path d="M32 33.5 L32 37" stroke="#2ae9aa" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>

              {/* Right Flourish Line */}
              <div style={{
                flex: 1,
                height: '1.5px',
                background: 'linear-gradient(270deg, transparent 0%, rgba(42, 233, 170, 0.25) 20%, #2ae9aa 100%)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '0',
                  top: '-4px',
                  width: '8px',
                  height: '8px',
                  borderTop: '1.5px solid #2ae9aa',
                  borderLeft: '1.5px solid #2ae9aa',
                  transform: 'rotate(-45deg)'
                }} />
              </div>
            </div>

            {/* Route Subtitle */}
            <div style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(14px, 1.8vw, 17px)',
              letterSpacing: '4px',
              color: '#73f5c7',
              textTransform: 'uppercase',
              fontWeight: 700,
              margin: '4px 0 10px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <span style={{ color: '#2ae9aa', fontSize: '10px' }}>✦</span>
              <span>{currentDoor.branch ? currentDoor.branch.toUpperCase() : 'RIGHT BRANCH (ROUTE 2)'}</span>
              <span style={{ color: '#2ae9aa', fontSize: '10px' }}>✦</span>
            </div>

            {/* Gate Title */}
            <h1 style={{
              fontFamily: "'Cinzel', serif",
              color: '#ffffff',
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              margin: '0 0 14px 0',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              textShadow: '0 0 25px rgba(42, 233, 170, 0.5), 0 2px 4px rgba(0,0,0,0.8)'
            }}>
              <span style={{ fontSize: '0.95em', filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))' }}>📜</span>
              <span style={{ color: '#dcfce7' }}>{currentDoor.name}</span>
            </h1>

            {/* Diamond Ornamental Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              margin: '0 auto 20px auto',
              maxWidth: '320px',
              width: '100%'
            }}>
              <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, transparent, #2ae9aa)' }} />
              <span style={{ color: '#2ae9aa', fontSize: '11px', transform: 'rotate(45deg)', display: 'inline-block', filter: 'drop-shadow(0 0 6px #2ae9aa)' }}>◆</span>
              <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(270deg, transparent, #2ae9aa)' }} />
            </div>

            {/* Question Text Box with Botanical Fern Motif */}
            <div style={{
              position: 'relative',
              background: 'rgba(5, 28, 22, 0.85)',
              border: '2px solid #2ae9aa',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '22px',
              boxShadow: '0 0 25px rgba(42, 233, 170, 0.22), inset 0 0 20px rgba(42, 233, 170, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              textAlign: 'left'
            }}>
              {/* Botanical Leaf Motif SVG on left */}
              <div style={{ flexShrink: 0, opacity: 0.9 }}>
                <svg width="34" height="48" viewBox="0 0 34 48" fill="none">
                  <path d="M12 44 C12 28 20 18 22 4" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M15 36 C10 33 6 29 7 24 C10 24 14 27 16 32 Z" fill="#2ae9aa" opacity="0.85" />
                  <path d="M17 28 C22 25 26 21 25 16 C22 16 18 19 17 24 Z" fill="#2ae9aa" opacity="0.85" />
                  <path d="M19 18 C15 15 12 11 13 6 C16 6 20 9 20 14 Z" fill="#2ae9aa" opacity="0.85" />
                  <path d="M22 4 C24 8 28 10 30 7 C30 4 26 2 22 4 Z" fill="#2ae9aa" opacity="0.85" />
                </svg>
              </div>

              {/* Question Text */}
              <div style={{
                flex: 1,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(17px, 2.2vw, 21px)',
                fontWeight: 600,
                lineHeight: '1.6',
                color: '#f0fdf4',
                textShadow: '0 1px 3px rgba(0,0,0,0.9)'
              }}>
                {currentDoor.question}
              </div>
            </div>

            {/* Feedback Message Banner */}
            {feedbackMessage && (
              <div style={{
                marginBottom: '18px',
                padding: '12px 18px',
                borderRadius: '10px',
                fontFamily: "'Cinzel', serif",
                fontSize: '14px',
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                background: quizStatus === 'correct' ? 'rgba(16, 75, 45, 0.75)' : 'rgba(95, 20, 32, 0.75)',
                border: `2px solid ${quizStatus === 'correct' ? '#2ae9aa' : '#ff4d4d'}`,
                color: quizStatus === 'correct' ? '#73f5c7' : '#ffb3b3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: quizStatus === 'correct' ? '0 0 25px rgba(42, 233, 170, 0.4)' : '0 0 25px rgba(255, 77, 77, 0.4)',
                textAlign: 'center'
              }}>
                {feedbackMessage}
              </div>
            )}

            {/* 4 Large Clickable Answer Options (~56px-60px tall with Octagonal Letter Badge) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {currentDoor.options.map((opt, i) => {
                const letters = ['A', 'B', 'C', 'D'];
                const isSelected = selectedOption === i;
                let bg = 'rgba(6, 28, 22, 0.85)';
                let border = '1.5px solid #2ae9aa';
                let shadow = '0 0 15px rgba(42, 233, 170, 0.15)';
                let badgeBg = 'rgba(8, 38, 29, 0.95)';
                let badgeColor = '#a7f3d0';

                if (isSelected) {
                  if (quizStatus === 'correct') {
                    bg = 'rgba(16, 68, 42, 0.95)';
                    border = '2px solid #00e676';
                    shadow = '0 0 25px rgba(0, 230, 118, 0.6)';
                    badgeBg = '#00e676';
                    badgeColor = '#052112';
                  } else if (quizStatus === 'incorrect') {
                    bg = 'rgba(75, 18, 28, 0.95)';
                    border = '2px solid #ff3366';
                    shadow = '0 0 25px rgba(255, 51, 102, 0.6)';
                    badgeBg = '#ff3366';
                    badgeColor = '#ffffff';
                  } else {
                    bg = 'rgba(12, 45, 36, 0.95)';
                    border = '2px solid #73f5c7';
                    shadow = '0 0 20px rgba(115, 245, 199, 0.4)';
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={isEvaluating || quizStatus === 'correct'}
                    onClick={() => handleSelectOption(opt, i)}
                    style={{
                      minHeight: '56px',
                      padding: '0 20px',
                      background: bg,
                      border: border,
                      borderRadius: '14px',
                      color: '#ffffff',
                      cursor: (isEvaluating || quizStatus === 'correct') ? 'default' : 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      boxSizing: 'border-box',
                      transition: 'all 0.18s ease',
                      boxShadow: shadow,
                      width: '100%',
                      outline: 'none'
                    }}
                  >
                    {/* Faceted Octagonal Letter Badge */}
                    <div style={{
                      width: '38px',
                      height: '38px',
                      minWidth: '38px',
                      clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                      background: badgeBg,
                      border: isSelected && quizStatus ? 'none' : '1.5px solid #2ae9aa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Cinzel', serif",
                      fontWeight: 800,
                      fontSize: '17px',
                      color: badgeColor,
                      boxShadow: '0 0 8px rgba(42, 233, 170, 0.4)',
                      flexShrink: 0
                    }}>
                      {letters[i]}
                    </div>

                    {/* Answer Text */}
                    <span style={{
                      flex: 1,
                      fontFamily: "'Cinzel', serif",
                      fontSize: '18px',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      color: '#f0fdf4',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {opt.text}
                    </span>

                    {/* Result indicator or subtle Right Chevron */}
                    {isSelected && quizStatus === 'correct' ? (
                      <span style={{ color: '#00e676', fontWeight: 900, fontSize: '18px' }}>✓</span>
                    ) : isSelected && quizStatus === 'incorrect' ? (
                      <span style={{ color: '#ff3366', fontWeight: 900, fontSize: '18px' }}>✗</span>
                    ) : (
                      <span style={{ color: '#2ae9aa', opacity: 0.5, fontSize: '18px' }}>‹</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions: Pass Gate / Try Again / Step Back */}
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              {quizStatus === 'incorrect' && (
                <button
                  onClick={handleRetryQuestion}
                  style={{
                    height: '46px',
                    padding: '0 24px',
                    background: 'linear-gradient(135deg, #1b5e3a 0%, #0d3822 100%)',
                    border: '1.5px solid #2ae9aa',
                    borderRadius: '20px',
                    color: '#ffffff',
                    fontFamily: "'Cinzel', serif",
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(42, 233, 170, 0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🔄</span> Try Again
                </button>
              )}

              {quizStatus === 'correct' && (
                <button
                  onClick={handleCloseQuestion}
                  style={{
                    height: '46px',
                    padding: '0 28px',
                    background: 'linear-gradient(135deg, #2ae9aa 0%, #15b981 100%)',
                    border: 'none',
                    borderRadius: '20px',
                    color: '#041f16',
                    fontFamily: "'Cinzel', serif",
                    fontSize: '14px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    boxShadow: '0 0 25px rgba(42, 233, 170, 0.65)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  Pass Through Gate ➔
                </button>
              )}

              {/* Step Back Button Styled Exactly Like Image 2 */}
              <button
                onClick={handleCloseQuestion}
                style={{
                  height: '44px',
                  padding: '0 28px',
                  background: 'rgba(6, 28, 22, 0.85)',
                  border: '2px solid #2ae9aa',
                  borderRadius: '22px',
                  color: '#f0fdf4',
                  fontFamily: "'Cinzel', serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 0 18px rgba(42, 233, 170, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '15px' }}>⮌</span>
                <span>{quizStatus === 'correct' ? 'Close' : 'Step Back'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRAP / CAPTURE MODAL DIALOG (Wrong Answer Cage Drop) */}
      {activeModal === 'trap' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(25, 5, 8, 0.88)',
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
            maxWidth: '480px',
            boxShadow: '0 0 45px rgba(255, 77, 77, 0.45)',
            color: '#ffffff',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#ff4d4d', margin: '0 0 12px 0', letterSpacing: '2px' }}>⛓️ CAPTURED BY CAGE TRAP!</h2>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#ffb3b3', marginBottom: '24px' }}>
              Incorrect answer triggered the forest trap mechanism! The iron cage has dropped from the canopy to capture you.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  // Lift cage and retry riddle
                  setIsTrapped(false);
                  setTrapPosition(null);
                  setActiveModal('riddle');
                }}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                  border: '1px solid #4caf50',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                🔄 RETRY PUZZLE
              </button>
              <button
                onClick={() => {
                  // Lift cage and retreat
                  setIsTrapped(false);
                  setTrapPosition(null);
                  setActiveModal(null);
                }}
                style={{
                  padding: '12px 24px',
                  background: '#801a24',
                  border: '1px solid #ff4d4d',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                🚪 LIFT CAGE & RETREAT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VICTORY MODAL DIALOG (Requirement 4) */}
      {activeModal === 'victory' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(14, 38, 20, 0.92) 0%, rgba(3, 14, 8, 0.98) 100%)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 350,
          padding: '24px',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          {/* Subtle Golden Ambient Celebration Spores */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {[
              { top: '12%', left: '15%', size: 6 },
              { top: '25%', left: '22%', size: 4 },
              { top: '70%', left: '18%', size: 5 },
              { top: '15%', right: '16%', size: 5 },
              { top: '30%', right: '24%', size: 7 },
              { top: '75%', right: '20%', size: 6 },
            ].map((spore, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  top: spore.top,
                  left: spore.left,
                  right: spore.right,
                  width: `${spore.size}px`,
                  height: `${spore.size}px`,
                  borderRadius: '50%',
                  background: '#ffd700',
                  boxShadow: '0 0 14px 4px rgba(255, 215, 0, 0.85)',
                  opacity: 0.75
                }}
              />
            ))}
          </div>

          <div style={{
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(20, 48, 28, 0.95) 0%, rgba(8, 24, 14, 0.98) 100%)',
            border: '2px solid #ffd700',
            borderRadius: '24px',
            padding: '40px 36px',
            width: 'min(90vw, 560px)',
            maxWidth: '620px',
            maxHeight: '94vh',
            overflowY: 'auto',
            boxSizing: 'border-box',
            boxShadow: '0 0 65px rgba(255, 215, 0, 0.45), inset 0 0 35px rgba(255, 215, 0, 0.12), 0 30px 70px rgba(0, 0, 0, 0.85)',
            color: '#ffffff',
            textAlign: 'center'
          }}>
            {/* Top Trophy Emblem */}
            <div style={{ fontSize: '48px', marginBottom: '8px', filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.7))' }}>
              🏆
            </div>

            {/* Header Badge */}
            <div style={{
              fontSize: '13px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#a8e0b0',
              fontWeight: 'bold',
              marginBottom: '6px'
            }}>
              FOREST ESCAPE
            </div>

            <h1 style={{
              margin: '0 0 12px 0',
              fontSize: '32px',
              letterSpacing: '3px',
              color: '#ffd700',
              fontFamily: "'Cinzel', Georgia, serif",
              textShadow: '0 0 25px rgba(255, 215, 0, 0.8)'
            }}>
              VICTORY!
            </h1>

            <p style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#e2f0d9',
              fontStyle: 'italic',
              margin: '0 0 24px 0',
              padding: '0 10px'
            }}>
              "You solved the riddles, uncovered the hidden clues, unlocked the ancient gate, and claimed the Golden Trophy!"
            </p>

            {/* Completed Objectives Checklist */}
            <div style={{
              background: 'rgba(8, 30, 18, 0.85)',
              border: '1.5px solid #52b788',
              borderRadius: '14px',
              padding: '16px 20px',
              marginBottom: '28px',
              textAlign: 'left'
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#ffd700',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}>
                🌟 COMPLETED OBJECTIVES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#e8f5e9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#70e000', fontSize: '15px', fontWeight: 'bold' }}>✓</span>
                  <span><b>Three Gates Unlocked</b> (Left, Right, and Center route riddles solved)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#70e000', fontSize: '15px', fontWeight: 'bold' }}>✓</span>
                  <span><b>Three Clues Collected</b> (All secret runic tablets uncovered)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#70e000', fontSize: '15px', fontWeight: 'bold' }}>✓</span>
                  <span><b>Secret Passcode Solved</b> (Deciphered '472' to open Moon Gate)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#ffd700', fontSize: '15px', fontWeight: 'bold' }}>✓</span>
                  <span><b>Golden Trophy Claimed</b> (Reached sacred sanctuary and claimed prize)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: PLAY AGAIN & MAIN MENU */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handlePlayAgain}
                style={{
                  padding: '13px 30px',
                  background: 'linear-gradient(135deg, #ffd700 0%, #d49a00 100%)',
                  border: '2px solid #fff2a3',
                  borderRadius: '28px',
                  color: '#1a1000',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  letterSpacing: '1.5px',
                  cursor: 'pointer',
                  boxShadow: '0 0 25px rgba(255, 215, 0, 0.65)',
                  transition: 'all 0.2s'
                }}
                title="Restart game with all gates and clues reset to initial playable state"
              >
                🔄 PLAY AGAIN
              </button>

              <button
                onClick={handleMainMenu}
                style={{
                  padding: '13px 28px',
                  background: 'rgba(20, 42, 28, 0.85)',
                  border: '1.5px solid #52b788',
                  borderRadius: '28px',
                  color: '#e2f0d9',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  letterSpacing: '1.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                  transition: 'all 0.2s'
                }}
                title="Return to Main Menu"
              >
                🏠 MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAUSE MODAL OVERLAY */}
      {activeModal === 'pause' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(4, 18, 14, 0.88)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 320,
          padding: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(180deg, rgba(6, 28, 22, 0.94) 0%, rgba(3, 16, 12, 0.98) 100%)',
            border: '2px solid #2ae9aa',
            borderRadius: '20px',
            padding: '36px 32px',
            width: '90%',
            maxWidth: '480px',
            boxShadow: '0 0 50px rgba(42, 233, 170, 0.4), inset 0 0 25px rgba(42, 233, 170, 0.08)',
            color: '#ffffff',
            textAlign: 'center',
            fontFamily: "'Cinzel', serif, Georgia"
          }}>
            <div style={{ color: '#2ae9aa', fontSize: '13px', letterSpacing: '4px', marginBottom: '6px' }}>
              ✦ GAME PAUSED ✦
            </div>
            <h1 style={{ color: '#f0fdf4', fontSize: '26px', margin: '0 0 16px 0', letterSpacing: '2px' }}>
              FOREST ESCAPE
            </h1>
            
            {/* Status Summary */}
            <div style={{
              background: 'rgba(4, 20, 15, 0.75)',
              border: '1px solid rgba(42, 233, 170, 0.3)',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '22px',
              fontSize: '12px',
              lineHeight: '1.7',
              textAlign: 'left',
              color: '#d1fae5',
              fontFamily: "'Inter', sans-serif"
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Route Gates:</span>
                <b style={{ color: allThreeGatesUnlocked ? '#4ade80' : '#fbbf24' }}>{unlockedGateCount}/3 Unlocked</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hidden Clues:</span>
                <b style={{ color: allThreeCluesCollected ? '#4ade80' : '#fbbf24' }}>{clueCount}/3 Found (Passcode: {passcodeDisplay})</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Final Moon Gate:</span>
                <b style={{ color: finalDoorUnlocked ? '#4ade80' : '#f87171' }}>{finalDoorUnlocked ? 'OPEN' : 'LOCKED'}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Attacker Creature:</span>
                <b style={{ color: attackerState === 'CHASING' ? '#f87171' : '#4ade80' }}>{attackerState}</b>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => { setActiveModal(null); InputManager.resetKeys(); }}
                style={{
                  padding: '12px',
                  background: 'linear-gradient(135deg, #2ae9aa 0%, #15b981 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#041f16',
                  fontSize: '14px',
                  fontWeight: 800,
                  letterSpacing: '1.5px',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(42, 233, 170, 0.5)'
                }}
              >
                ▶ RESUME GAME
              </button>
              <button
                onClick={handleRetry}
                style={{
                  padding: '11px',
                  background: 'rgba(6, 28, 22, 0.85)',
                  border: '1.5px solid #2ae9aa',
                  borderRadius: '12px',
                  color: '#e2f0d9',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  cursor: 'pointer'
                }}
              >
                🔄 RESPAWN AT ENTRANCE
              </button>
              <button
                onClick={handleRestart}
                style={{
                  padding: '11px',
                  background: 'rgba(30, 15, 18, 0.85)',
                  border: '1.5px solid #f87171',
                  borderRadius: '12px',
                  color: '#fecaca',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  cursor: 'pointer'
                }}
              >
                ⏮ RESTART GAME
              </button>
              <button
                onClick={handleMainMenu}
                style={{
                  padding: '11px',
                  background: 'rgba(6, 24, 20, 0.7)',
                  border: '1px solid rgba(42, 233, 170, 0.4)',
                  borderRadius: '12px',
                  color: '#a7f3d0',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  cursor: 'pointer'
                }}
              >
                🏠 MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEFEAT MODAL DIALOG */}
      {activeModal === 'defeat' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 3, 5, 0.92)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: '24px'
        }}>
          <div style={{
            background: 'radial-gradient(circle at 50% 20%, #4a151b 0%, #150507 100%)',
            border: '2px solid #ff3333',
            borderRadius: '20px',
            padding: '36px 32px',
            width: '90%',
            maxWidth: '480px',
            boxShadow: '0 0 60px rgba(255, 51, 51, 0.55), inset 0 0 25px rgba(0,0,0,0.8)',
            color: '#ffffff',
            textAlign: 'center',
            fontFamily: "'Cinzel', serif, Georgia"
          }}>
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>💀</div>
            <h1 style={{ color: '#ff4d4d', fontSize: '24px', margin: '0 0 12px 0', letterSpacing: '2px' }}>
              WRONG DOOR! TRAP ACTIVATED!
            </h1>
            <p style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#ffc2c2',
              marginBottom: '28px',
              fontFamily: "'Cormorant Garamond', Georgia, serif"
            }}>
              You chose the Sun Gate! The floor collapsed into an ancient spike pit trap. You should have paid attention to the Riddle Gate clue!
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
              <button
                onClick={handleRetry}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #1f502f 0%, #0d2818 100%)',
                  border: '1.5px solid #52b788',
                  borderRadius: '24px',
                  color: '#a8e0b0',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  letterSpacing: '1.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                }}
              >
                🔄 RETRY
              </button>
              <button
                onClick={handleRestart}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #991b1b 0%, #4a0000 100%)',
                  border: '1.5px solid #ff4d4d',
                  borderRadius: '24px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  letterSpacing: '1.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                }}
              >
                ⏮ RESTART
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAPTURE MODAL OVERLAY (Dark Fantasy Style - Requirement 4) */}
      {activeModal === 'caught' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(35, 5, 8, 0.88) 0%, rgba(8, 2, 4, 0.97) 100%)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 350,
          padding: '24px'
        }}>
          <div style={{
            background: 'radial-gradient(circle at 50% 25%, #3a0d14 0%, #180508 100%)',
            border: '2px solid #ff3333',
            borderRadius: '16px',
            padding: '36px 32px',
            width: '90%',
            maxWidth: '480px',
            boxShadow: '0 0 60px rgba(255, 30, 30, 0.55), inset 0 0 30px rgba(0,0,0,0.8)',
            color: '#ffffff',
            textAlign: 'center',
            fontFamily: "'Cinzel', serif, Georgia"
          }}>
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>💀</div>
            <h1 style={{ 
              color: '#ff3333', 
              fontSize: '26px', 
              letterSpacing: '3px', 
              margin: '0 0 12px 0',
              textShadow: '0 0 20px rgba(255, 50, 50, 0.8)'
            }}>
              YOU HAVE BEEN CAUGHT!
            </h1>
            <p style={{ 
              lineHeight: '1.6', 
              color: '#ffc2c2', 
              fontFamily: "'Cormorant Garamond', serif, Georgia",
              fontSize: '17px',
              marginBottom: '32px' 
            }}>
              The shadow creature closed the distance and claimed your soul. Use <b>SHIFT</b> to sprint away and navigate the branching paths to evade it!
            </p>

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleRetry}
                style={{
                  padding: '12px 26px',
                  background: 'linear-gradient(135deg, #1f502f 0%, #0d2818 100%)',
                  border: '1.5px solid #52b788',
                  borderRadius: '24px',
                  color: '#a8e0b0',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  letterSpacing: '1.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                  transition: 'all 0.2s'
                }}
                title="Respawn at forest entrance with gate progress preserved"
              >
                🔄 RETRY
              </button>

              <button
                onClick={handleRestart}
                style={{
                  padding: '12px 26px',
                  background: 'linear-gradient(135deg, #8b0000 0%, #4a0000 100%)',
                  border: '1.5px solid #ff4d4d',
                  borderRadius: '24px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  letterSpacing: '1.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                  transition: 'all 0.2s'
                }}
                title="Restart entire game from beginning"
              >
                ⏮ RESTART
              </button>

              <button
                onClick={handleMainMenu}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(20, 30, 24, 0.85)',
                  border: '1.5px solid #52b788',
                  borderRadius: '24px',
                  color: '#e2f0d9',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  letterSpacing: '1.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                  transition: 'all 0.2s'
                }}
                title="Return to Main Menu"
              >
                🏠 MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      <ErrorBoundary>
        <Canvas 
          tabIndex={0}
          onPointerDown={() => {
            if (typeof window !== 'undefined') window.focus();
          }}
          shadows 
          dpr={1}
          camera={{ position: [0, 5, 18.8], fov: 55, near: 0.1, far: 500 }} 
          style={{ width: '100vw', height: '100vh', background: '#0a0514', outline: 'none' }}
          gl={{
            powerPreference: 'default',
            failIfMajorPerformanceCaveat: false,
            antialias: false,
            alpha: false,
            stencil: false,
            depth: true,
            preserveDrawingBuffer: false,
          }}
          onCreated={({ gl }) => {
            try {
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 0.85;
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;

              // Prevent unhandled WebGL context loss from throwing unrecoverable exceptions
              const domEl = gl.domElement;
              if (domEl) {
                domEl.addEventListener('webglcontextlost', (e) => {
                  e.preventDefault();
                  console.warn('WebGL context lost detected, attempting recovery...');
                }, false);
              }
            } catch (err) {
              console.warn('Error during WebGL initialization adjustments:', err);
            }
          }}
        >
          <color attach="background" args={["#08171a"]} />
          <fog attach="fog" args={["#08171a", 45, 260]} />
          
          {/* Haunted Chinese Ghost Forest Ambient Light (Cyan-Teal Moonlight & Ground Mist) */}
          <ambientLight intensity={0.95} color="#528276" />
          
          {/* Pale Silver-Cyan Lunar Light shining through bamboo canopy */}
          <directionalLight 
            castShadow 
            position={[35, 80, 20]} 
            intensity={2.5} 
            color="#b2f5d9"
            shadow-mapSize={[1024, 1024]}
            shadow-camera-top={150}
            shadow-camera-bottom={-150}
            shadow-camera-left={-150}
            shadow-camera-right={150}
            shadow-camera-near={0.1}
            shadow-camera-far={280}
            shadow-bias={-0.0001}
          />
          
          {/* Ghostly Sky-to-Earth Fill Light */}
          <hemisphereLight skyColor="#1a524e" groundColor="#0c2b24" intensity={1.2} />
          
          <Suspense fallback={null}>
            <Physics gravity={[0, -18, 0]}>
              <Scene 
                unlockedDoors={unlockedDoors} 
                collectedClues={collectedClues}
                playerPosRef={playerPosRef}
                trapPosition={trapPosition}
                isQuestionOpen={Boolean(activeModal)}
                isVictory={isVictory}
                allObjectivesMet={allObjectivesMet}
              />
              <Player 
                unlockedDoors={unlockedDoors} 
                isFrozen={Boolean(activeModal) || isVictory} 
                playerPosRef={playerPosRef}
                onZoneCheck={checkZones}
                webcamInputs={webcamInputs.runner}
                onDebugUpdate={setDebugInfo}
                respawnTrigger={respawnTrigger}
              />
              <Attacker 
                playerPosRef={playerPosRef} 
                unlockedDoors={unlockedDoors} 
                isFrozen={Boolean(activeModal) || isTrapped || isVictory}
                webcamInputs={webcamInputs.attacker}
                onStateChange={setAttackerState}
                onPlayerCaught={handlePlayerCaught}
                respawnTrigger={respawnTrigger}
              />
            </Physics>
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </>
  );
}
