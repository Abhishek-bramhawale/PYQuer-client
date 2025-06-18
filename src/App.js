import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';

function FirstTimeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('pyquer_first_time_dialog_seen');
    if (!seen) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('pyquer_first_time_dialog_seen', 'true');
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.4)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#181825',
        color: '#fff',
        borderRadius: '16px',
        padding: '2.5rem 2.5rem 2rem 2.5rem',
        minWidth: 340,
        maxWidth: 400,
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        position: 'relative',
        textAlign: 'center',
      }}>
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 22,
            cursor: 'pointer',
            lineHeight: 1,
          }}
          aria-label="Close dialog"
        >
          ❌
        </button>
        <img src={process.env.PUBLIC_URL + '/favicon.ico'} alt="PYQuer" style={{ width: 48, marginBottom: 16 }} />
        <h2 style={{ margin: '0 0 18px 0', fontWeight: 700, fontSize: 22 }}>Welcome to PYQuer!</h2>
        <ul style={{ textAlign: 'left', margin: '0 auto', padding: 0, listStyle: 'none', fontSize: 16, lineHeight: 1.7, maxWidth: 320 }}>
          <li>• <b>Select an AI model</b></li>
          <li>• <b>Upload your PYQ PDFs</b></li>
          <li>• <b>Get analysis and repeated questions</b></li>
        </ul>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <FirstTimeDialog />
      <Navbar />
      <main className="main-content">
        <FileUpload />
      </main>
    </div>
  );
}

export default App;
