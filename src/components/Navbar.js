import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import Login from './Login';
// import logo from '../../images/logo.png';


const Navbar = ({ topOffset = 0 }) => {
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
      <nav className="navbar" style={{padding: '20px', top: topOffset}}>
        <div className="navbar-brand">
          <Link to="/" className="navbar-link">
            <h1 className="navbar-brand-title">
              PYQuer
            </h1>
          </Link>
        </div>
        <div className="navbar-end">
          {user ? (
            <div className="navbar-user-row">
              <div className="navbar-avatar-wrapper">
                <div
                  onClick={handleAvatarClick}
                  className={dropdownOpen ? "navbar-avatar navbar-avatar-open" : "navbar-avatar"}
                  title="User menu"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" fill="#fff" fillOpacity="0.9"/>
                    <ellipse cx="12" cy="17" rx="7" ry="4" fill="#fff" fillOpacity="0.7"/>
                  </svg>
                </div>
                {dropdownOpen && (
                  <div className="navbar-dropdown">
                    <button
                      onClick={handleHistory}
                      className="navbar-dropdown-btn"
                      onMouseDown={e => e.preventDefault()}
                    >
                      History
                    </button>
                    <button
                      onClick={handleLogoutDropdown}
                      className="navbar-dropdown-btn navbar-dropdown-logout"
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
