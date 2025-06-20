import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import Login from './Login';
// import logo from '../../images/logo.png';


const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleAvatarClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleHistory = () => {
    setDropdownOpen(false);
    navigate('/history');
  };

  const handleLogoutDropdown = () => {
    setDropdownOpen(false);
    handleLogout();
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
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
              <div style={{ position: 'relative' }}>
                <div
                  onClick={handleAvatarClick}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #540ac9 60%, #00c6ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 18,
                    cursor: 'pointer',
                    boxShadow: dropdownOpen ? '0 0 0 2px #00c6ff55' : 'none',
                    border: dropdownOpen ? '2px solid #00c6ff' : '2px solid #fff3',
                    transition: 'box-shadow 0.2s, border 0.2s',
                    userSelect: 'none',
                  }}
                  title="User menu"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" fill="#fff" fillOpacity="0.9"/>
                    <ellipse cx="12" cy="17" rx="7" ry="4" fill="#fff" fillOpacity="0.7"/>
                  </svg>
                </div>
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 44,
                    right: 0,
                    background: '#222',
                    color: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
                    minWidth: 120,
                    zIndex: 1002,
                    padding: '8px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}>
                    <button
                      onClick={handleHistory}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        padding: '10px 20px',
                        textAlign: 'left',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseDown={e => e.preventDefault()}
                    >
                      History
                    </button>
                    <button
                      onClick={handleLogoutDropdown}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff5252',
                        padding: '10px 20px',
                        textAlign: 'left',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseDown={e => e.preventDefault()}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
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
