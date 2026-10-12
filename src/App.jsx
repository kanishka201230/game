import { useState, useEffect } from "react";
import "./App.css";
import Game from "./Game";

function App() {
  const [videoEnded, setVideoEnded] = useState(false);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [isGame, setIsGame] = useState(false);

  useEffect(() => {
    if (window.location.search.includes("game=true")) {
      setIsGame(true);
    }
  }, []);

  const startExperience = () => {
    setShowCharacterSelect(true);
  };

  const selectCharacter = (characterName) => {
    // Navigate straight to the multiplayer page
    window.location.href = `/multiplayer.html?character=${characterName}`;
  };

  const handleReturnToMenu = () => {
    setIsGame(false);
    setShowCharacterSelect(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("game");
    window.history.pushState({}, "", url.pathname + (url.search ? url.search : ""));
  };

  if (isGame) {
    return <Game onMainMenu={handleReturnToMenu} />;
  }

  if (showCharacterSelect) {
    return (
      <div className="character-select-page">
        {/* Fantasy Realm Header */}
        <div style={{
          position: "absolute",
          top: "3%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 30,
          textAlign: "center",
          fontFamily: "'Cinzel', serif, Georgia",
          pointerEvents: "none"
        }}>
          <div style={{ color: "#2ae9aa", fontSize: "12px", letterSpacing: "4px" }}>
            ✦ DARK ENCHANTED REALM ✦
          </div>
          <h1 style={{
            color: "#ffffff",
            fontSize: "clamp(22px, 3vw, 34px)",
            letterSpacing: "3px",
            margin: "4px 0 0 0",
            textShadow: "0 0 25px rgba(42, 233, 170, 0.6)"
          }}>
            FOREST ESCAPE: PLAYER VS ATTACKER
          </h1>
        </div>

        <div className="character-select-container">
          <button className="char-btn soushi" onClick={() => selectCharacter('Soushi')} title="Select Soushi" />
          <button className="char-btn wei" onClick={() => selectCharacter('Wei')} title="Select Wei" />
          <button className="char-btn zai" onClick={() => selectCharacter('Zai')} title="Select Zai" />
          <button className="char-btn ren" onClick={() => selectCharacter('Ren')} title="Select Ren" />

          {/* Quick link button to enter Forest Escape 3D single-player mode */}
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("game", "true");
              window.history.pushState({}, "", url.pathname + "?" + url.searchParams.toString());
              setIsGame(true);
            }}
            style={{
              position: "absolute",
              bottom: "4%",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "12px 28px",
              background: "linear-gradient(135deg, rgba(10, 48, 30, 0.95) 0%, rgba(4, 24, 16, 0.98) 100%)",
              border: "2px solid #2ae9aa",
              borderRadius: "26px",
              color: "#e2f0d9",
              fontSize: "14px",
              fontWeight: "bold",
              letterSpacing: "1.5px",
              cursor: "pointer",
              zIndex: 30,
              boxShadow: "0 0 25px rgba(42, 233, 170, 0.5)",
              transition: "all 0.2s ease",
              fontFamily: "'Cinzel', serif, Georgia"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 35px rgba(42, 233, 170, 0.85)";
              e.currentTarget.style.transform = "translateX(-50%) scale(1.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 25px rgba(42, 233, 170, 0.5)";
              e.currentTarget.style.transform = "translateX(-50%) scale(1.0)";
            }}
          >
            🌲 ENTER FOREST ESCAPE (SOLO 3D)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="intro-page">
      <div style={{
        position: "absolute",
        top: "4%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 30,
        textAlign: "center",
        fontFamily: "'Cinzel', serif, Georgia",
        pointerEvents: "none"
      }}>
        <div style={{ color: "#2ae9aa", fontSize: "12px", letterSpacing: "4px" }}>
          ✦ MYTHIC 3D SURVIVAL ✦
        </div>
        <h1 style={{
          color: "#ffffff",
          fontSize: "clamp(24px, 3.5vw, 36px)",
          letterSpacing: "3px",
          margin: "4px 0 0 0",
          textShadow: "0 0 25px rgba(42, 233, 170, 0.6)"
        }}>
          FOREST ESCAPE: PLAYER VS ATTACKER
        </h1>
      </div>

      <video
        className="intro-video"
        autoPlay
        muted
        playsInline
        onEnded={() => setVideoEnded(true)}
        onError={() => setVideoEnded(true)}
      >
        <source src="/first-page.mp4" type="video/mp4" />
        Your browser does not support video.
      </video>

      {/* Direct Play button always available on intro page */}
      <button
        onClick={() => {
          const url = new URL(window.location.href);
          url.searchParams.set("game", "true");
          window.history.pushState({}, "", url.pathname + "?" + url.searchParams.toString());
          setIsGame(true);
        }}
        style={{
          position: "absolute",
          bottom: "4%",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "14px 34px",
          background: "linear-gradient(135deg, rgba(6, 40, 24, 0.95) 0%, rgba(3, 20, 14, 0.98) 100%)",
          border: "2px solid #2ae9aa",
          borderRadius: "28px",
          color: "#e2f0d9",
          fontSize: "15px",
          fontWeight: 800,
          letterSpacing: "2px",
          cursor: "pointer",
          zIndex: 30,
          boxShadow: "0 0 25px rgba(42, 233, 170, 0.55)",
          fontFamily: "'Cinzel', serif, Georgia",
          transition: "all 0.25s ease"
        }}
      >
        🌲 PLAY 3D FOREST ESCAPE
      </button>

      {videoEnded && (
        <button
          className="start-button"
          onClick={startExperience}
          aria-label="Start Experience"
        />
      )}
    </div>
  );
}

export default App;
