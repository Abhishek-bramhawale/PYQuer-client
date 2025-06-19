import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';
import { Routes, Route } from 'react-router-dom';
import History from './components/History';

function FirstTimeDialog({ open, onClose }) {
  if (!open) return null;
  const gifSize = 180;
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
        width: '100%',
        maxWidth: 800,
        boxSizing: 'border-box',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        position: 'relative',
        textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', top: 18, left: 18, display: 'flex', gap: 10, zIndex: 2, }}>
          <div onClick={onClose} style={{ width: 20, height: 20, borderRadius: '50%', background: '#ff5f56',  border: '2px solid #fff2', boxShadow: '0 0 4px #ff5f56aa' }} title="Close" />
          <div onClick={onClose} style={{ width: 20, height: 20, borderRadius: '50%', background: '#ffbd2e', border: '2px solid #fff2', boxShadow: '0 0 4px #ffbd2eaa' }} title="Close" />
          <div onClick={onClose} style={{ width: 20, height: 20, borderRadius: '50%', background: '#27c93f',  border: '2px solid #fff2', boxShadow: '0 0 4px #27c93faa' }} title="Close" />
        </div>
        <h2 style={{ margin: '0 0 28px 0', fontWeight: 700, fontSize: 28 }}>How it works</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, margin: '0 0 10px 0', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={process.env.PUBLIC_URL + '/model.gif'} alt="Select Model" style={{ width: gifSize, height: gifSize, objectFit: 'cover', borderRadius: 16, boxShadow: '0 0 24px 6px #fff8, 0 2px 12px rgba(0,0,0,0.18)' }} />
            <div style={{ marginTop: 16, fontSize: 18, fontWeight: 500, textAlign: 'center', maxWidth: 150 }}>Select an AI model</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={process.env.PUBLIC_URL + '/upload.gif'} alt="Upload PDFs" style={{ width: gifSize, height: gifSize, objectFit: 'cover', borderRadius: 16, boxShadow: '0 0 24px 6px #fff8, 0 2px 12px rgba(0,0,0,0.18)' }} />
            <div style={{ marginTop: 16, fontSize: 18, fontWeight: 500, textAlign: 'center', maxWidth: 150 }}>Upload your PYQ PDFs</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={process.env.PUBLIC_URL + '/analysis.gif'} alt="Get Analysis" style={{ width: gifSize, height: gifSize, objectFit: 'cover', borderRadius: 16, boxShadow: '0 0 24px 6px #fff8, 0 2px 12px rgba(0,0,0,0.18)' }} />
            <div style={{ marginTop: 16, fontSize: 18, fontWeight: 500, textAlign: 'center', maxWidth: 150 }}>Get AI analysis about PYQS</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('pyquer_first_time_dialog_seen');
    if (!seen) {
      setDialogOpen(true);
    }
  }, []);

  useEffect(() => {
    if (dialogOpen) {
      document.body.classList.add('dialog-open');
      document.documentElement.classList.add('dialog-open');
    } else {
      document.body.classList.remove('dialog-open');
      document.documentElement.classList.remove('dialog-open');
    }
  }, [dialogOpen]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    localStorage.setItem('pyquer_first_time_dialog_seen', 'true');
  };

  return (
    <div className="App">
      <FirstTimeDialog open={dialogOpen} onClose={handleDialogClose} />
      <div className={dialogOpen ? 'blurred-bg' : ''}>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<FileUpload />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
