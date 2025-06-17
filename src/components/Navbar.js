import React, { useState, useEffect } from 'react';
import '../App.css';
import Login from './Login';

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
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
    setIsLoginOpen(true);
  };

  const closeModal = () => {
    setIsLoginOpen(false);
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
              <button
                className="login-btn"
                onClick={() => console.log('History button clicked')}
                style={{
                  backgroundColor: '#6c757d',
                  fontSize: '0.8rem',
                  padding: '6px 12px'
                }}
              >
                History
              </button>
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
            <button 
              className="login-btn" 
              onClick={openLogin}
              style={{ 
                backgroundColor: '#540ac9',
                fontSize: '0.9rem',
                padding: '8px 16px'
              }}
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </nav>
      
      <Login 
        isOpen={isLoginOpen} 
        onClose={closeModal}
      />
    </>
  );
};

export default Navbar;
