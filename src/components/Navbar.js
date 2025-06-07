import React, { useState } from 'react';
import '../App.css';
import Login from './Login';

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <nav className="navbar" style={{padding :'20px'}}>
        <div className="navbar-brand">
          <h1>PYQuer</h1>
        </div>
        <div className="navbar-end">
          <button className="login-btn" onClick={() => setIsLoginOpen(true)}>Login</button>
        </div>
      </nav>
      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default Navbar;
