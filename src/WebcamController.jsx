import React, { useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

export default function WebcamController({ onUpdateInputs }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState({
    runnerTracked: false,
    attackerTracked: false,
    message: "Webcam disabled (Keyboard Controls Active)",
  });
  const [sensitivity, setSensitivity] = useState(1.0);
  const [showCalibration, setShowCalibration] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animFrameId = useRef(null);

  // Velocity / Gesture History Buffers for smoothing
  const historyRef = useRef({
    p1PrevHipY: 0,
    p2PrevHipY: 0,
    p1PrevShoulderY: 0,
    p1RunTicks: 0,
    p2RunTicks: 0,
    attackCooldown: 0,
  });

  // Initialize MediaPipe PoseLandmarker
  useEffect(() => {
    let active = true;

    async function initPoseLandmarker() {
      if (!isEnabled) return;
      setIsLoading(true);
      setTrackingStatus({ runnerTracked: false, attackerTracked: false, message: "Loading MediaPipe PoseLandmarker..." });

      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        if (!active) return;

        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 2,
        });

        if (!active) return;
        landmarkerRef.current = poseLandmarker;
        setIsLoading(false);
        startCamera();
      } catch (err) {
        console.error("Failed to load PoseLandmarker:", err);
        setIsLoading(false);
        setTrackingStatus({
          runnerTracked: false,
          attackerTracked: false,
          message: "PoseLandmarker Error (Keyboard Fallback Active)",
        });
      }
    }

    if (isEnabled) {
      initPoseLandmarker();
    } else {
      stopCamera();
    }

    return () => {
      active = false;
      stopCamera();
    };
  }, [isEnabled]);

  // Start Video Stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
          processVideoLoop();
        };
      }
    } catch (err) {
      console.error("Webcam Access Denied / Error:", err);
      setTrackingStatus({
        runnerTracked: false,
        attackerTracked: false,
        message: "Webcam Access Denied (Keyboard Fallback Active)",
      });
    }
  };

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
  };

  // Main Detection & Movement Analysis Loop
  const processVideoLoop = () => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (video && video.readyState >= 2 && landmarker) {
      const timestamp = performance.now();
      const results = landmarker.detectForVideo(video, timestamp);

      drawSkeleton(results);
      analyzePoses(results);
    }

    animFrameId.current = requestAnimationFrame(processVideoLoop);
  };

  // Draw Skeleton Overlay on Canvas
  const drawSkeleton = (results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results || !results.landmarks || results.landmarks.length === 0) return;

    results.landmarks.forEach((landmarks, index) => {
      const color = index === 0 ? "#00ffcc" : "#ff3366";
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      landmarks.forEach((lm) => {
        const x = (1 - lm.x) * canvas.width; // Mirror horizontal
        const y = lm.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
  };

  // Process Keypoints & Extract Movement Commands for Both Players
  const analyzePoses = (results) => {
    const runnerInputs = { forward: false, backward: false, left: false, right: false, jump: false, run: false, interact: false };
    const attackerInputs = { forward: false, backward: false, left: false, right: false, attack: false };

    if (!results || !results.landmarks || results.landmarks.length === 0) {
      setTrackingStatus({
        runnerTracked: false,
        attackerTracked: false,
        message: "⚠️ No Participants Detected (Keyboard Fallback Active)",
      });
      onUpdateInputs({ runner: runnerInputs, attacker: attackerInputs });
      return;
    }

    // Sort poses by horizontal X position (Left = Person 1 / Runner, Right = Person 2 / Attacker)
    const poses = [...results.landmarks].sort((a, b) => a[0].x - b[0].x);

    const hist = historyRef.current;
    if (hist.attackCooldown > 0) hist.attackCooldown--;

    // 1. RUNNER CONTROLS (Person 1)
    const p1 = poses[0];
    if (p1) {
      // Hip landmarks (23, 24)
      const hipY = (p1[23].y + p1[24].y) / 2;
      const hipX = (p1[23].x + p1[24].x) / 2;
      const shoulderY = (p1[11].y + p1[12].y) / 2;

      // Running in place detection (vertical hip oscillation)
      const hipDelta = Math.abs(hipY - hist.p1PrevHipY);
      if (hipDelta > 0.008 * sensitivity) {
        hist.p1RunTicks = 12;
      }
      if (hist.p1RunTicks > 0) {
        runnerInputs.forward = true;
        if (hipDelta > 0.02 * sensitivity) {
          runnerInputs.run = true;
        }
        hist.p1RunTicks--;
      }

      // Leaning Left / Right
      const torsoCenterOffset = 0.5 - hipX;
      if (torsoCenterOffset > 0.12 * sensitivity) {
        runnerInputs.left = true;
      } else if (torsoCenterOffset < -0.12 * sensitivity) {
        runnerInputs.right = true;
      }

      // Jump Gesture (Upward displacement of shoulders)
      const shoulderDelta = hist.p1PrevShoulderY - shoulderY;
      if (shoulderDelta > 0.04 * sensitivity) {
        runnerInputs.jump = true;
      }

      // Interact Gesture (Right wrist raised above right shoulder)
      const rightWristY = p1[16].y;
      const rightShoulderY = p1[12].y;
      if (rightWristY < rightShoulderY - 0.1) {
        runnerInputs.interact = true;
      }

      hist.p1PrevHipY = hipY;
      hist.p1PrevShoulderY = shoulderY;
    }

    // 2. ATTACKER CONTROLS (Person 2 if present)
    const p2 = poses.length > 1 ? poses[1] : null;

    if (p2) {
      const hipY = (p2[23].y + p2[24].y) / 2;
      const hipX = (p2[23].x + p2[24].x) / 2;

      const hipDelta = Math.abs(hipY - hist.p2PrevHipY);
      if (hipDelta > 0.008 * sensitivity) {
        hist.p2RunTicks = 12;
      }
      if (hist.p2RunTicks > 0) {
        attackerInputs.forward = true;
        hist.p2RunTicks--;
      }

      const torsoCenterOffset = 0.5 - hipX;
      if (torsoCenterOffset > 0.12 * sensitivity) {
        attackerInputs.left = true;
      } else if (torsoCenterOffset < -0.12 * sensitivity) {
        attackerInputs.right = true;
      }

      // Attack Gesture (Left wrist raised above left shoulder)
      const leftWristY = p2[15].y;
      const leftShoulderY = p2[11].y;
      if (leftWristY < leftShoulderY - 0.1 && hist.attackCooldown === 0) {
        attackerInputs.attack = true;
        hist.attackCooldown = 45; // Cooldown frames
      }

      hist.p2PrevHipY = hipY;
    }

    setTrackingStatus({
      runnerTracked: true,
      attackerTracked: Boolean(p2),
      message: p2
        ? "🟢 Both Runner & Attacker Tracked!"
        : "🟢 Runner Tracked | ⚠️ Attacker 2 Not Detected (AI Fallback Active)",
    });

    onUpdateInputs({ runner: runnerInputs, attacker: attackerInputs });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 100,
        fontFamily: "'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Toggle Webcam Controller Card */}
      <div
        style={{
          background: "rgba(12, 25, 18, 0.9)",
          border: "1px solid rgba(120, 180, 130, 0.35)",
          borderRadius: "12px",
          padding: "14px 18px",
          color: "#e2f0d9",
          boxShadow: "0 6px 25px rgba(0,0,0,0.5)",
          width: "280px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h4 style={{ margin: 0, letterSpacing: "1px", color: "#a8e0b0", fontSize: "14px" }}>📹 WEBCAM POSE BODY CONTROLS</h4>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
            title="Toggle Webcam Tracking"
          />
        </div>

        {/* Tracking Status Badge */}
        <div style={{ fontSize: "11px", marginBottom: "10px", lineHeight: "1.4", color: isEnabled ? "#cce6d0" : "#a0b0a2" }}>
          {trackingStatus.message}
        </div>

        {isEnabled && (
          <div>
            {/* Live Video & Canvas Preview */}
            <div style={{ position: "relative", width: "100%", height: "140px", background: "#08100b", borderRadius: "8px", overflow: "hidden", marginBottom: "10px" }}>
              <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} muted playsInline />
              <canvas ref={canvasRef} width={240} height={140} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
              {isLoading && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a8e0b0", fontSize: "12px" }}>
                  Loading Pose Model...
                </div>
              )}
            </div>

            {/* Tracking Status Badges */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <span style={{ flex: 1, padding: "4px 6px", borderRadius: "4px", fontSize: "10px", textAlign: "center", background: trackingStatus.runnerTracked ? "rgba(0, 255, 204, 0.2)" : "rgba(255, 0, 0, 0.2)", border: `1px solid ${trackingStatus.runnerTracked ? "#00ffcc" : "#ff3333"}`, color: "#fff" }}>
                {trackingStatus.runnerTracked ? "🟢 Runner (P1)" : "❌ Runner Lost"}
              </span>
              <span style={{ flex: 1, padding: "4px 6px", borderRadius: "4px", fontSize: "10px", textAlign: "center", background: trackingStatus.attackerTracked ? "rgba(255, 51, 102, 0.2)" : "rgba(255, 165, 0, 0.2)", border: `1px solid ${trackingStatus.attackerTracked ? "#ff3366" : "#ffa500"}`, color: "#fff" }}>
                {trackingStatus.attackerTracked ? "🟢 Attacker (P2)" : "🤖 AI Attacker"}
              </span>
            </div>

            {/* Calibration & Sensitivity Slider */}
            <div style={{ fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label>Sensitivity:</label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                style={{ width: "100px" }}
              />
              <span>{sensitivity.toFixed(1)}x</span>
            </div>

            <button
              onClick={() => setShowCalibration(!showCalibration)}
              style={{ width: "100%", marginTop: "8px", padding: "6px", background: "rgba(30, 60, 42, 0.8)", border: "1px solid #5a9e67", borderRadius: "6px", color: "#fff", fontSize: "11px", cursor: "pointer" }}
            >
              {showCalibration ? "Hide Pose Calibration Guide" : "Show Pose Gesture Guide"}
            </button>
          </div>
        )}
      </div>

      {/* CALIBRATION / GESTURE GUIDE MODAL */}
      {showCalibration && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(5, 12, 8, 0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "radial-gradient(circle at 50% 20%, #1e3626 0%, #0e1c13 100%)", border: "2px solid #a8e0b0", borderRadius: "14px", padding: "28px", width: "90%", maxWidth: "480px", color: "#e2f0d9", boxShadow: "0 0 40px rgba(168, 224, 176, 0.3)" }}>
            <h3 style={{ color: "#a8e0b0", margin: "0 0 14px 0", letterSpacing: "1.5px" }}>🤸 WEBCAM BODY GESTURE CALIBRATION</h3>
            <ul style={{ fontSize: "13px", lineHeight: "1.8", paddingLeft: "20px" }}>
              <li><b>Run in Place:</b> Move legs/hips up & down to run forward.</li>
              <li><b>Steer Left / Right:</b> Lean torso left or right to choose branches at maze junctions.</li>
              <li><b>Jump:</b> Jump or dip shoulders upward.</li>
              <li><b>Runner Door Interact:</b> Raise Right Hand above shoulder height.</li>
              <li><b>Attacker Attack Action:</b> Person 2 raises Left Hand above shoulder height.</li>
            </ul>
            <button
              onClick={() => setShowCalibration(false)}
              style={{ width: "100%", marginTop: "16px", padding: "10px", background: "linear-gradient(135deg, #2e5938 0%, #142e1b 100%)", border: "1px solid #78b482", borderRadius: "8px", color: "#fff", fontWeight: "bold", cursor: "pointer" }}
            >
              Start Game with Webcam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
