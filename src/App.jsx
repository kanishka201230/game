import { useState } from "react";
import "./App.css";

function App() {
  const [videoEnded, setVideoEnded] = useState(false);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const startExperience = () => {
    setShowCharacterSelect(true);
  };

  const selectCharacter = (characterName) => {
    // Navigate straight to the multiplayer page
    window.location.href = `/multiplayer.html?character=${characterName}`;
  };

  if (showCharacterSelect) {
    return (
      <div className="character-select-page">
        <div className="character-select-container">
          <button className="char-btn soushi" onClick={() => selectCharacter('Soushi')} title="Select Soushi" />
          <button className="char-btn wei" onClick={() => selectCharacter('Wei')} title="Select Wei" />
          <button className="char-btn zai" onClick={() => selectCharacter('Zai')} title="Select Zai" />
          <button className="char-btn ren" onClick={() => selectCharacter('Ren')} title="Select Ren" />
        </div>
      </div>
    );
  }

  return (
    <div className="intro-page">
      <video
        className="intro-video"
        autoPlay
        muted
        playsInline
        onEnded={() => setVideoEnded(true)}
      >
        <source src="/first-page.mp4" type="video/mp4" />
        Your browser does not support video.
      </video>

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
