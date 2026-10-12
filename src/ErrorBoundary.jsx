import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error in 3D scene:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errMsg = this.state.error?.message || String(this.state.error);
      const isActualWebglCrash = /webgl|gpu|context lost|three\.webgl/i.test(errMsg);

      return (
        <div style={{ 
          color: '#ffffff', 
          padding: '24px', 
          background: 'rgba(15, 10, 12, 0.96)', 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: "'Segoe UI', Roboto, sans-serif",
          zIndex: 9999
        }}>
          <h2 style={{ color: isActualWebglCrash ? '#ff4d4d' : '#ffaa00', fontSize: '24px', marginBottom: '12px' }}>
            {isActualWebglCrash ? "WebGL Crash Detected!" : "3D Scene Component Error"}
          </h2>
          <p style={{ 
            color: '#ff9999', 
            fontFamily: 'monospace', 
            background: 'rgba(40, 10, 15, 0.9)', 
            border: '1px solid #ff4d4d', 
            padding: '12px 20px', 
            borderRadius: '8px',
            maxWidth: '700px',
            wordBreak: 'break-word',
            fontSize: '14px'
          }}>
            {errMsg}
          </p>
          <p style={{ maxWidth: '600px', textAlign: 'center', marginTop: '16px', color: '#c4e0cb', fontSize: '13px', lineHeight: '1.5' }}>
            {isActualWebglCrash
              ? "Your browser failed to initialize WebGL (3D Graphics). This usually happens if your computer ran out of memory, or if hardware acceleration crashed."
              : "A runtime exception occurred inside the 3D scene. Click below to reload the game."}
          </p>
          <button 
            onClick={() => {
              // Clear session cache and reload
              window.location.href = window.location.origin + window.location.pathname + "?game=true&t=" + Date.now();
            }} 
            style={{ 
              marginTop: '20px', 
              padding: '12px 28px', 
              fontSize: '15px', 
              fontWeight: 'bold',
              borderRadius: '24px',
              border: 'none',
              background: 'linear-gradient(135deg, #52b788 0%, #1f502f 100%)',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}
          >
            🔄 Reload Game
          </button>
          {isActualWebglCrash && (
            <div style={{ marginTop: '20px', color: '#94a3b8', fontSize: '12px', maxWidth: '500px', textAlign: 'center', lineHeight: '1.6' }}>
              💡 <b>Tip:</b> If this persists, your browser (Brave/Chrome) may have disabled WebGL temporarily. Please open a new tab, navigate to <code style={{ color: '#38bdf8' }}>brave://settings/system</code> (or <code style={{ color: '#38bdf8' }}>chrome://settings/system</code>), and ensure <b>"Use graphics acceleration when available"</b> is turned ON.
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}