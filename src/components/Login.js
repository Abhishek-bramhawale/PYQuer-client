import React, { useState } from 'react';

const Login = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body = isSignUp 
        ? { name: formData.email.split('@')[0], email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${isSignUp ? 'Registration' : 'Login'} failed`);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role
      }));

      onClose();
      window.location.reload();
      
    } catch (error) {
      console.error(`${isSignUp ? 'Registration' : 'Login'} error:`, error);
      setError(error.message || `${isSignUp ? 'Registration' : 'Login'} failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFormData({ email: '', password: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {error && (
          <div className="error-message" style={{
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            border: '1px solid #dc3545',
            color: '#dc3545',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder={isSignUp ? "Enter your password (min 6 characters)" : "Enter your password"}
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading 
              ? (isSignUp ? 'Creating Account...' : 'Logging in...') 
              : (isSignUp ? 'Sign Up' : 'Login')
            }
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #eee'
        }}>
          <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
            <button
              onClick={toggleMode}
              style={{
                background: 'none',
                border: 'none',
                color: '#540ac9',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.9rem'
              }}
              disabled={isLoading}
            >
              {isSignUp ? 'Login here' : 'Sign up here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
