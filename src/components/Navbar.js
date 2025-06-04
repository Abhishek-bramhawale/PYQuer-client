import React from 'react';
import '../App.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>PYQuer</h1>
      </div>
      <div className="navbar-end">
        <button className="login-btn">Login</button>
      </div>
    </nav>
  );
};

export default Navbar;
