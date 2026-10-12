import React, { useEffect, useRef, useState, useCallback } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

// MediaPipe Hand Connection Pairs for Skeletal Visualizer
const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm Base Crossbars
  [5, 9], [9, 13], [13, 17]
];

// Distance helper
function dist3D(p1, p2) {
  if (!p1 || !p2) return 0;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.hypot(dx, dy, dz);
}

// 4 Reference Gestures Classifier
function classifyHandGesture(lm, mirror = true) {
  if (!lm || lm.length < 21) return { gesture: "NO GESTURE", confidence: 0 };

  // Scale invariance: distance from Wrist (0) to Middle MCP (9)
  const handScale = dist3D(lm[0], lm[9]) || 0.2;

  // 1. Index Finger Analysis (MCP 5, PIP 6, DIP 7, TIP 8)
  const tipMcpIndex = dist3D(lm[8], lm[5]);
  const pipMcpIndex = dist3D(lm[6], lm[5]) || 0.001;
  const ratioIndex = tipMcpIndex / pipMcpIndex;
  const tipWristIndex = dist3D(lm[8], lm[0]);
  const pipWristIndex = dist3D(lm[6], lm[0]);
  const isIndexExtended = ratioIndex > 1.35 && tipWristIndex > pipWristIndex * 1.15;
  const isIndexCurled = ratioIndex < 1.15 || tipWristIndex < pipWristIndex * 1.05;

  // 2. Middle Finger Analysis (MCP 9, PIP 10, DIP 11, TIP 12)
  const tipMcpMiddle = dist3D(lm[12], lm[9]);
  const pipMcpMiddle = dist3D(lm[10], lm[9]) || 0.001;
  const ratioMiddle = tipMcpMiddle / pipMcpMiddle;
  const tipWristMiddle = dist3D(lm[12], lm[0]);
  const pipWristMiddle = dist3D(lm[10], lm[0]);
  const isMiddleExtended = ratioMiddle > 1.35 && tipWristMiddle > pipWristMiddle * 1.15;
  const isMiddleCurled = ratioMiddle < 1.15 || tipWristMiddle < pipWristMiddle * 1.05;

  // 3. Ring Finger Analysis (MCP 13, PIP 14, DIP 15, TIP 16)
  const tipMcpRing = dist3D(lm[16], lm[13]);
  const pipMcpRing = dist3D(lm[14], lm[13]) || 0.001;
  const ratioRing = tipMcpRing / pipMcpRing;
  const tipWristRing = dist3D(lm[16], lm[0]);
  const pipWristRing = dist3D(lm[14], lm[0]);
  const isRingExtended = ratioRing > 1.35 && tipWristRing > pipWristRing * 1.15;
  const isRingCurled = ratioRing < 1.15 || tipWristRing < pipWristRing * 1.05;

  // 4. Pinky Finger Analysis (MCP 17, PIP 18, DIP 19, TIP 20)
  const tipMcpPinky = dist3D(lm[20], lm[17]);
  const pipMcpPinky = dist3D(lm[18], lm[17]) || 0.001;
  const ratioPinky = tipMcpPinky / pipMcpPinky;
  const tipWristPinky = dist3D(lm[20], lm[0]);
  const pipWristPinky = dist3D(lm[18], lm[0]);
  const isPinkyExtended = ratioPinky > 1.35 && tipWristPinky > pipWristPinky * 1.15;
  const isPinkyCurled = ratioPinky < 1.15 || tipWristPinky < pipWristPinky * 1.05;

  // 5. Thumb Orientation
  // In finger-gun/L-shape, thumb is extended upwards (lm[4].y is notably above lm[2].y or MCPs)
  const thumbTipWrist = dist3D(lm[4], lm[0]);
  const thumbMcpWrist = dist3D(lm[2], lm[0]);
  const isThumbUp = lm[4].y < lm[2].y + 0.04 || thumbTipWrist > thumbMcpWrist * 1.2;

  // Extended count for palm detection
  const extendedCount = (isIndexExtended ? 1 : 0) + (isMiddleExtended ? 1 : 0) + (isRingExtended ? 1 : 0) + (isPinkyExtended ? 1 : 0);
  const curledCount = (isIndexCurled ? 1 : 0) + (isMiddleCurled ? 1 : 0) + (isRingCurled ? 1 : 0) + (isPinkyCurled ? 1 : 0);

  // GESTURE 2 — FORWARD (Reference Photo 2: Open Palm)
  // All fingers extended, palm facing forward
  if (extendedCount >= 3 && isMiddleExtended && isRingExtended) {
    return { gesture: "FORWARD", confidence: 0.95 };
  }

  // GESTURE 3 & 4 — MOVE RIGHT & MOVE LEFT (Reference Photos 3 & 4: Thumb Up + Index Pointing)
  // Index extended while Middle, Ring, Pinky are curled into palm
  if (isIndexExtended && isMiddleCurled && isRingCurled && isPinkyCurled) {
    // Vector from Index MCP (5) to Index Tip (8)
    // On screen (mirrored preview): screenX = (1 - x)
    const screenTipX = mirror ? (1 - lm[8].x) : lm[8].x;
    const screenBaseX = mirror ? (1 - lm[5].x) : lm[5].x;
    const dx = screenTipX - screenBaseX;
    const dy = lm[8].y - lm[5].y;

    // Check predominantly horizontal pointing
    if (Math.abs(dx) > Math.abs(dy) * 0.55 && Math.abs(dx) > 0.04) {
      if (dx > 0) {
        // Pointing to the RIGHT of the screen/preview (Photo 3)
        return { gesture: "RIGHT", confidence: 0.92 };
      } else {
        // Pointing to the LEFT of the screen/preview (Photo 4)
        return { gesture: "LEFT", confidence: 0.92 };
      }
    }
  }

  // GESTURE 1 — STOP (Reference Photo 1: Closed Fist)
  // All 4 fingers (Index, Middle, Ring, Pinky) curled into palm, thumb wrapped
  if (curledCount >= 3 && !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return { gesture: "STOP", confidence: 0.96 };
  }

  return { gesture: "NO GESTURE", confidence: 0.5 };
}

export default function WebcamController({ onUpdateInputs }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [targetCharacter, setTargetCharacter] = useState("player"); // "player" | "attacker"
  const [currentGesture, setCurrentGesture] = useState("NO GESTURE");
  const [statusMessage, setStatusMessage] = useState("Webcam Disabled (Keyboard Controls Active)");
  const [showGuide, setShowGuide] = useState(false);
  const [mirrorDirection, setMirrorDirection] = useState(true);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animFrameId = useRef(null);
  const historyRef = useRef([]);
  const targetCharRef = useRef(targetCharacter);
  targetCharRef.current = targetCharacter;

  // Keep character routing up to date
  const emitInputs = useCallback((gesture, target) => {
    const isMoving = gesture === "FORWARD" || gesture === "LEFT" || gesture === "RIGHT";
    const moveInput = {
      forward: gesture === "FORWARD",
      backward: false,
      left: gesture === "LEFT",
      right: gesture === "RIGHT",
      stop: gesture === "STOP",
    };

    if (target === "player") {
      onUpdateInputs({
        runner: moveInput,
        attacker: { isManualControl: false } // Attacker resumes autonomous AI patrol
      });
    } else {
      onUpdateInputs({
        runner: {}, // Player stops
        attacker: {
          ...moveInput,
          isManualControl: true // Attacker exclusively controlled by gestures
        }
      });
    }
  }, [onUpdateInputs]);

  // Handle character switch dynamically
  const handleSelectCharacter = (char) => {
    setTargetCharacter(char);
    emitInputs(currentGesture, char);
  };

  // Initialize MediaPipe HandLandmarker
  useEffect(() => {
    let active = true;

    async function initHandLandmarker() {
      if (!isEnabled) return;
      setIsLoading(true);
      setStatusMessage("Loading MediaPipe Hand Landmarker...");

      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );

        if (!active) return;

        // Try local model with CPU delegate to preserve GPU WebGL context for Three.js Canvas
        let handLandmarker = null;
        try {
          handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: "/hand_landmarker.task",
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            numHands: 1,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        } catch (firstErr) {
          console.warn("Local HandLandmarker init failed, falling back to CDN:", firstErr);
          try {
            handLandmarker = await HandLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                delegate: "CPU",
              },
              runningMode: "VIDEO",
              numHands: 1,
            });
          } catch (fallbackErr) {
            console.warn("CDN HandLandmarker fallback also failed:", fallbackErr);
          }
        }

        if (!active) return;
        landmarkerRef.current = handLandmarker;
        setIsLoading(false);
        startCamera();
      } catch (err) {
        console.error("Failed to load HandLandmarker:", err);
        setIsLoading(false);
        setStatusMessage("⚠️ Camera/Model Error (Keyboard Fallback Active)");
      }
    }

    if (isEnabled) {
      initHandLandmarker();
    } else {
      stopCamera();
      setCurrentGesture("NO GESTURE");
      // Reset inputs safely
      onUpdateInputs({ runner: {}, attacker: { isManualControl: false } });
    }

    return () => {
      active = false;
      stopCamera();
    };
  }, [isEnabled]);

  // Start Camera Stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
          setStatusMessage("🟢 Camera Active — Ready for Gestures");
          processVideoLoop();
        };
      }
    } catch (err) {
      console.error("Webcam Access Denied / Error:", err);
      setStatusMessage("⚠️ Webcam Access Denied (Check Browser Permissions)");
      setCameraActive(false);
    }
  };

  // Stop Camera Stream & Safely Release Tracks
  const stopCamera = () => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setStatusMessage("Webcam Disabled (Keyboard Controls Active)");
  };

  // Detection & Analysis Loop
  const processVideoLoop = () => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (video && video.readyState >= 2 && landmarker) {
      const timestamp = performance.now();
      const results = landmarker.detectForVideo(video, timestamp);

      drawHandSkeleton(results);
      analyzeHand(results);
    }

    animFrameId.current = requestAnimationFrame(processVideoLoop);
  };

  // Draw Glowing Neon Skeleton & Gesture Label on Canvas
  const drawHandSkeleton = (results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results || !results.landmarks || results.landmarks.length === 0) {
      // Gentle hint overlay when no hand is in frame
      ctx.fillStyle = "rgba(40, 60, 50, 0.4)";
      ctx.font = "11px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Place hand in frame", canvas.width / 2, canvas.height / 2);
      return;
    }

    const landmarks = results.landmarks[0];
    const isAttacker = targetCharRef.current === "attacker";
    const primaryColor = isAttacker ? "#ff1744" : "#2ae9aa";
    const jointColor = "#ffffff";

    // 1. Draw Bones (Connections)
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 6;

    HAND_CONNECTIONS.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      const x1 = (1 - p1.x) * canvas.width; // Mirror horizontally
      const y1 = p1.y * canvas.height;
      const x2 = (1 - p2.x) * canvas.width;
      const y2 = p2.y * canvas.height;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // 2. Draw Landmark Joints
    ctx.shadowBlur = 4;
    landmarks.forEach((p, idx) => {
      const x = (1 - p.x) * canvas.width;
      const y = p.y * canvas.height;
      ctx.fillStyle = idx === 8 || idx === 4 ? "#ffd700" : jointColor;
      ctx.beginPath();
      ctx.arc(x, y, idx === 8 ? 4.5 : 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  };

  // Stabilize and Emit Recognized Gesture
  const analyzeHand = (results) => {
    if (!results || !results.landmarks || results.landmarks.length === 0) {
      updateGestureBuffer("NO GESTURE");
      return;
    }

    const lm = results.landmarks[0];
    const { gesture } = classifyHandGesture(lm, mirrorDirection);
    updateGestureBuffer(gesture);
  };

  // Rolling Temporal Stabilization Filter (Avoids jitter & single-frame misdetections)
  const updateGestureBuffer = (rawGesture) => {
    const hist = historyRef.current;
    hist.push(rawGesture);
    if (hist.length > 5) hist.shift();

    // Frequency counting
    const counts = {};
    hist.forEach((g) => {
      counts[g] = (counts[g] || 0) + 1;
    });

    let bestGesture = rawGesture;
    let maxCount = 0;
    for (const g in counts) {
      if (counts[g] > maxCount) {
        maxCount = counts[g];
        bestGesture = g;
      }
    }

    // Require majority consensus (at least 3 of 5 frames) to switch gesture
    if (maxCount >= 3) {
      if (bestGesture !== currentGesture) {
        setCurrentGesture(bestGesture);
        emitInputs(bestGesture, targetCharRef.current);
      }
    }
  };

  // Visual Styling Helpers for Gestures
  const getGestureBadge = (gesture) => {
    switch (gesture) {
      case "STOP":
        return {
          icon: "✊",
          label: "STOP",
          desc: "Closed Fist",
          color: "#f87171",
          bg: "rgba(127, 29, 29, 0.4)",
          border: "#ef4444"
        };
      case "FORWARD":
        return {
          icon: "🖐️",
          label: "MOVE FORWARD",
          desc: "Open Palm",
          color: "#4ade80",
          bg: "rgba(20, 83, 45, 0.4)",
          border: "#22c55e"
        };
      case "RIGHT":
        return {
          icon: "👉",
          label: "MOVE RIGHT",
          desc: "Point Right (Thumb Up)",
          color: "#38bdf8",
          bg: "rgba(12, 74, 110, 0.4)",
          border: "#0284c7"
        };
      case "LEFT":
        return {
          icon: "👈",
          label: "MOVE LEFT",
          desc: "Point Left (Thumb Up)",
          color: "#38bdf8",
          bg: "rgba(12, 74, 110, 0.4)",
          border: "#0284c7"
        };
      default:
        return {
          icon: "✋",
          label: "NO GESTURE",
          desc: "Show Hand in Camera",
          color: "#94a3b8",
          bg: "rgba(30, 41, 59, 0.4)",
          border: "#475569"
        };
    }
  };

  const badge = getGestureBadge(currentGesture);

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 120,
        fontFamily: "'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Main Glassmorphic Control Panel */}
      <div
        style={{
          background: "linear-gradient(180deg, rgba(6, 24, 18, 0.94) 0%, rgba(3, 15, 11, 0.98) 100%)",
          border: `1.5px solid ${targetCharacter === "player" ? "rgba(42, 233, 170, 0.45)" : "rgba(255, 23, 68, 0.45)"}`,
          borderRadius: "16px",
          padding: "14px 16px",
          color: "#e2f0d9",
          boxShadow: "0 8px 32px rgba(0,0,0,0.7), inset 0 0 20px rgba(42, 233, 170, 0.06)",
          backdropFilter: "blur(16px)",
          width: "280px",
          boxSizing: "border-box"
        }}
      >
        {/* Top Header & Toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px" }}>✋</span>
            <span style={{
              fontFamily: "'Cinzel', serif, Georgia",
              fontWeight: 800,
              fontSize: "13px",
              color: "#73f5c7",
              letterSpacing: "1px"
            }}>
              GESTURE CONTROLS
            </span>
          </div>

          <label style={{ display: "flex", alignItems: "center", cursor: "pointer", position: "relative" }}>
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              style={{ display: "none" }}
            />
            <div style={{
              width: "38px",
              height: "20px",
              borderRadius: "10px",
              background: isEnabled ? "#10b981" : "rgba(50, 60, 55, 0.8)",
              position: "relative",
              transition: "background 0.25s ease",
              boxShadow: isEnabled ? "0 0 12px rgba(16, 185, 129, 0.6)" : "none"
            }}>
              <div style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#ffffff",
                position: "absolute",
                top: "2px",
                left: isEnabled ? "20px" : "2px",
                transition: "left 0.25s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }} />
            </div>
          </label>
        </div>

        {/* Character Selector Mode (Requirement 2) */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "10px", color: "#a7f3d0", letterSpacing: "1px", marginBottom: "5px", fontWeight: 700 }}>
            TARGET CHARACTER:
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handleSelectCharacter("player")}
              style={{
                flex: 1,
                padding: "8px 6px",
                borderRadius: "8px",
                border: targetCharacter === "player" ? "2px solid #2ae9aa" : "1px solid rgba(82, 183, 136, 0.3)",
                background: targetCharacter === "player" ? "rgba(42, 233, 170, 0.2)" : "rgba(10, 25, 18, 0.6)",
                color: targetCharacter === "player" ? "#ffffff" : "#a8e0b0",
                fontSize: "12px",
                fontWeight: 800,
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.5px",
                cursor: "pointer",
                boxShadow: targetCharacter === "player" ? "0 0 16px rgba(42, 233, 170, 0.4)" : "none",
                transition: "all 0.2s"
              }}
            >
              🏃 PLAYER
            </button>

            <button
              onClick={() => handleSelectCharacter("attacker")}
              style={{
                flex: 1,
                padding: "8px 6px",
                borderRadius: "8px",
                border: targetCharacter === "attacker" ? "2px solid #ff1744" : "1px solid rgba(255, 23, 68, 0.3)",
                background: targetCharacter === "attacker" ? "rgba(255, 23, 68, 0.25)" : "rgba(30, 10, 15, 0.6)",
                color: targetCharacter === "attacker" ? "#ffffff" : "#ffa4b4",
                fontSize: "12px",
                fontWeight: 800,
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.5px",
                cursor: "pointer",
                boxShadow: targetCharacter === "attacker" ? "0 0 16px rgba(255, 23, 68, 0.5)" : "none",
                transition: "all 0.2s"
              }}
            >
              👹 ATTACKER
            </button>
          </div>
        </div>

        {/* Current Active Recognized Gesture Badge (Requirement 2 & 3) */}
        <div style={{
          background: badge.bg,
          border: `1.5px solid ${badge.border}`,
          borderRadius: "10px",
          padding: "8px 12px",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: `0 0 16px ${badge.border}44`,
          transition: "all 0.2s"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>{badge.icon}</span>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: badge.color, letterSpacing: "0.8px" }}>
                {badge.label}
              </div>
              <div style={{ fontSize: "10px", color: "#cbd5e1" }}>
                {badge.desc}
              </div>
            </div>
          </div>
          <span style={{
            fontSize: "9px",
            fontWeight: 800,
            padding: "2px 6px",
            borderRadius: "6px",
            background: "rgba(0,0,0,0.4)",
            color: badge.color,
            border: `1px solid ${badge.border}`
          }}>
            {targetCharacter.toUpperCase()}
          </span>
        </div>

        {/* Live Webcam Video & Skeleton Canvas Preview (Requirement 3) */}
        {isEnabled && (
          <div style={{ marginBottom: "10px" }}>
            <div style={{
              position: "relative",
              width: "100%",
              height: "140px",
              background: "#040e09",
              borderRadius: "10px",
              overflow: "hidden",
              border: "1px solid rgba(42, 233, 170, 0.3)"
            }}>
              <video
                ref={videoRef}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)" // Mirrored selfie view
                }}
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                width={248}
                height={140}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none"
                }}
              />

              {/* Loading Spinner */}
              {isLoading && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(5, 18, 12, 0.85)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  color: "#2ae9aa",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  <div style={{ fontSize: "20px" }}>⏳</div>
                  <div>Loading Hand AI Model...</div>
                </div>
              )}
            </div>

            {/* Mirror Toggle Setting */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", fontSize: "10px", color: "#94a3b8" }}>
              <span>Webcam Orientation:</span>
              <button
                onClick={() => setMirrorDirection(!mirrorDirection)}
                style={{
                  background: "rgba(10, 30, 20, 0.8)",
                  border: "1px solid rgba(42, 233, 170, 0.3)",
                  borderRadius: "6px",
                  color: "#2ae9aa",
                  padding: "2px 8px",
                  fontSize: "9px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                {mirrorDirection ? "🪞 Mirrored (Standard)" : "Normal"}
              </button>
            </div>
          </div>
        )}

        {/* Connection Status Text */}
        <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "8px", textAlign: "center" }}>
          {statusMessage}
        </div>

        {/* Quick Gesture Guide Dropdown / Drawer Button (Requirement 5) */}
        <button
          onClick={() => setShowGuide(!showGuide)}
          style={{
            width: "100%",
            padding: "6px",
            background: "rgba(15, 35, 25, 0.8)",
            border: "1px solid rgba(82, 183, 136, 0.4)",
            borderRadius: "8px",
            color: "#a7f3d0",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.2s"
          }}
        >
          <span>📖</span>
          <span>{showGuide ? "Hide Gesture Guide" : "View 4 Reference Gestures"}</span>
        </button>

        {/* 4 Reference Gestures Guide Modal / Drawer */}
        {showGuide && (
          <div style={{
            marginTop: "10px",
            background: "rgba(4, 16, 12, 0.95)",
            border: "1px solid rgba(42, 233, 170, 0.3)",
            borderRadius: "10px",
            padding: "10px",
            fontSize: "11px",
            lineHeight: "1.5"
          }}>
            <div style={{ fontWeight: 800, color: "#ffd700", marginBottom: "6px", fontSize: "11px", textAlign: "center" }}>
              4 REFERENCE GESTURES GUIDE
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 6px", background: "rgba(20, 30, 25, 0.6)", borderRadius: "6px" }}>
                <span style={{ fontSize: "16px" }}>✊</span>
                <div>
                  <b style={{ color: "#f87171" }}>STOP:</b> Closed fist. Immediately halts character.
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 6px", background: "rgba(20, 30, 25, 0.6)", borderRadius: "6px" }}>
                <span style={{ fontSize: "16px" }}>🖐️</span>
                <div>
                  <b style={{ color: "#4ade80" }}>MOVE FORWARD:</b> Open palm. Walks forward along path.
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 6px", background: "rgba(20, 30, 25, 0.6)", borderRadius: "6px" }}>
                <span style={{ fontSize: "16px" }}>👉</span>
                <div>
                  <b style={{ color: "#38bdf8" }}>MOVE RIGHT:</b> Thumb up, index pointing right.
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 6px", background: "rgba(20, 30, 25, 0.6)", borderRadius: "6px" }}>
                <span style={{ fontSize: "16px" }}>👈</span>
                <div>
                  <b style={{ color: "#38bdf8" }}>MOVE LEFT:</b> Thumb up, index pointing left.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
