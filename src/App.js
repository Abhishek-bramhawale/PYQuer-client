import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';
import { Routes, Route } from 'react-router-dom';
import History from './components/History';
// import AOS from 'aos';
// import 'aos/dist/aos.css';

function FirstTimeDialog({ open, onClose }) {
  const gifSize = 180;
  const [showColoredButtons, setShowColoredButtons] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setShowColoredButtons(window.innerWidth > 538);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!open) return null;

  return (
    <div className="first-time-dialog-outer">
      <div className="first-time-dialog-inner">
        <div className="close-btns">
          {showColoredButtons && (
            <>
              <div onClick={onClose} className="close-btn-red" title="Close" />
              <div onClick={onClose} className="close-btn-yellow" title="Close" />
              <div onClick={onClose} className="close-btn-green" title="Close" />
            </>
          )}
        </div>
        <h2 className="how-it-works-title">How it works</h2>
        <div className="how-it-works-steps">
          <div className="how-it-works-step">
            <img src={process.env.PUBLIC_URL + '/model.gif'} alt="Select Model" className="how-it-works-img" />
            <div className="how-it-works-desc">Select an AI model</div>
          </div>
          <div className="how-it-works-step">
            <img src={process.env.PUBLIC_URL + '/upload.gif'} alt="Upload PDFs" className="how-it-works-img" />
            <div className="how-it-works-desc">Upload your PYQ PDFs</div>
          </div>
          <div className="how-it-works-step">
            <img src={process.env.PUBLIC_URL + '/analysis.gif'} alt="Get Analysis" className="how-it-works-img" />
            <div className="how-it-works-desc">Get AI analysis about PYQS</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="get-started-btn"
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
    <div className="login-info-note-root">
      <div className="login-info-note-bg" />
      <div className="login-info-note-content">
        <span className="login-info-note-emoji">✨</span>
        <span>
          login is required only if you want to store analysis in history and view later..
        </span>
      </div>
      <button className="login-info-note-close navclose1"
        onClick={onClose}
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
  const [showNote, setShowNote] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setShowNote(window.innerWidth >= 816);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      {showNote && <LoginInfoNote open={showLoginNote && !isLoggedIn} onClose={handleLoginNoteClose} />}
      <div className={dialogOpen ? 'blurred-bg' : '' + (showLoginNote && !isLoggedIn && showNote ? ' login-note-padding' : '')}>
        <Navbar topOffset={showLoginNote && !isLoggedIn && showNote ? 40 : 0} />
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
