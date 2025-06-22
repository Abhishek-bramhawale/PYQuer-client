import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';
import { Routes, Route } from 'react-router-dom';
import History from './components/History';
import AOS from 'aos';
import 'aos/dist/aos.css';

function FirstTimeDialog({ open, onClose }) {
  const gifSize = 180;
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        {isMobile && (
          <div style={{
            marginTop: 18,
            color: '#ffbd2e',
            fontWeight: 600,
            fontSize: 16,
            textAlign: 'center',
            letterSpacing: '0.2px',
          }}>
            mobile view detected.. use desktop view for better experience
          </div>
        )}
        <button
          onClick={onClose}
          style={{
            marginTop: 32,
            padding: '4px 14px',
            background: 'linear-gradient(90deg, #6419ff 0%, #540ac9 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            border: 'none',
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(84,10,201,0.18)',
            cursor: 'pointer',
            letterSpacing: '1px',
            transition: 'background 0.2s',
            outline: 'none',
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

function LoginInfoNote({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      width: '100%',
      background: 'black',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1200,
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 10,
      boxShadow: '0 2px 8px rgba(84,10,201,0.08)',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 50,
        // background: 'radial-gradient(50% 80% at 50% 0%, #6419ff 0%, rgba(0,0,0,0) 100%)',
              
      background: 'radial-gradient(29.05% 42.59% at 50% -5.56%, rgb(100, 25, 255) 0%, rgba(0, 0, 0, 0) 100%)',
   

        pointerEvents: 'none',
      }} />
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '10px 0',
        fontWeight: 700,
        fontSize: 14,
        color: '#fff',
        zIndex: 1,
      }}>
        <span style={{ fontSize: 20, marginRight: 4 }}>✨</span>
        <span>
          login is required only if you want to store analysis in history and view later..
        </span>
      </div>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          right: 134,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: 22,
          cursor: 'pointer',
          fontWeight: 700,
          lineHeight: 1,
          zIndex: 2,
        }}
        aria-label="Close info note"
      >
        ×
      </button>
    </div>
  );
}

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showLoginNote, setShowLoginNote] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('pyquer_first_time_dialog_seen');
    if (!seen) {
      setDialogOpen(true);
    }
    const loginNoteSeen = localStorage.getItem('pyquer_login_note_seen');
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (!loginNoteSeen && !token) {
      setShowLoginNote(true);
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

  useEffect(() => {
    AOS.init({
      once: false, 
    });
  }, []);

  const handleDialogClose = () => {
    setDialogOpen(false);
    localStorage.setItem('pyquer_first_time_dialog_seen', 'true');
  };

  const handleLoginNoteClose = () => {
    setShowLoginNote(false);
    localStorage.setItem('pyquer_login_note_seen', 'true');
  };

  return (
    <div className="App">
      <FirstTimeDialog open={dialogOpen} onClose={handleDialogClose} />
      <LoginInfoNote open={showLoginNote && !isLoggedIn} onClose={handleLoginNoteClose} />
      <div className={dialogOpen ? 'blurred-bg' : ''} style={{ paddingTop: showLoginNote && !isLoggedIn ? 48 : 0 }}>
        <Navbar topOffset={showLoginNote && !isLoggedIn ? 40 : 0} />
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
