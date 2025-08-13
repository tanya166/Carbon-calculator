import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authUtils } from '../utils/auth';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login with:', { username, password: '***' });

      const response = await authUtils.login({
        username: username,
        password: password
      });
      
      console.log('Login response:', response);
      
      setSuccessMessage("Log in successful !!");
      setErrorMessage('');
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        if (error.response.data && error.response.data.error) {
          setErrorMessage(error.response.data.error);
        } else {
          setErrorMessage(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        setErrorMessage('No response from server. Please check if the server is running.');
      } else {
        setErrorMessage(`Request error: ${error.message}`);
      }
      setSuccessMessage('');
    }
  };

  return (
    <div className="zx-portal" style={{ backgroundImage: `url(/assets/login.png)` }}>
      <div className='zx-box'>
        <h2>Log in</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="Username">Username:</label>
            <input
              type="text"
              className='zx-user'
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              className='zx-pass'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className='zx-btn'>Log in</button>
        </form>
        {successMessage && <p className="zx-success">{successMessage}</p>}
        {errorMessage && <p className="zx-error">{errorMessage}</p>}
        <div className='zx-divider'>
          <div className='zx-line'></div>
          <span className='zx-or'>or</span>
          <div className='zx-line'></div>
        </div>
        <p className='zx-signup'>
          Don't have an account?
          <Link to="/signup" className="zx-link">
            <button className="zx-nav">Signup</button>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;