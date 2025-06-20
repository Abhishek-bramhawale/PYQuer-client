import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import Login from './Login';
// import logo from '../../images/logo.png';


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
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1
              style={{
                fontFamily: 'cursive',
                textShadow: '4px 0px 6px rgba(128, 0, 128, 0.6)',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              PYQuer
            </h1>
          </Link>
        </div>
        <div className="navbar-end">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/history">
                <button
                  className="login-btn"
                  style={{
                    backgroundColor: '#6c757d',
                    fontSize: '0.8rem',
                    padding: '6px 12px'
                  }}
                >
                  History
                </button>
              </Link>
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
