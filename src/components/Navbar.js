import React, { useState, useEffect } from 'react';
import '../App.css';
import Login from './Login';
import SignUp from './SignUp';

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in on component mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  const openLogin = () => {
    setIsSignUpOpen(false);
    setIsLoginOpen(true);
  };

  const openSignUp = () => {
    setIsLoginOpen(false);
    setIsSignUpOpen(true);
  };

  const closeModals = () => {
    setIsLoginOpen(false);
    setIsSignUpOpen(false);
  };

  return (
    <>
      <nav className="navbar" style={{padding :'20px'}}>
        <div className="navbar-brand">
          <h1>PYQuer</h1>
        </div>
        <div className="navbar-end">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ 
                color: '#dcdcdc', 
                fontSize: '0.9rem',
                maxWidth: '150px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                Welcome, {user.name}
              </span>
              <button 
                className="login-btn" 
                onClick={handleLogout}
                style={{ 
                  backgroundColor: '#dc3545',
                  fontSize: '0.8rem',
                  padding: '6px 12px'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="login-btn" 
                onClick={openLogin}
                style={{ 
                  backgroundColor: '#540ac9',
                  fontSize: '0.8rem',
                  padding: '6px 12px'
                }}
              >
                Login
              </button>
              <button 
                className="login-btn" 
                onClick={openSignUp}
                style={{ 
                  backgroundColor: '#28a745',
                  fontSize: '0.8rem',
                  padding: '6px 12px'
                }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>
      
      <Login 
        isOpen={isLoginOpen} 
        onClose={closeModals}
        onSwitchToSignUp={openSignUp}
      />
      
      <SignUp 
        isOpen={isSignUpOpen} 
        onClose={closeModals}
        onSwitchToLogin={openLogin}
      />
    </>
  );
};

export default Navbar;
