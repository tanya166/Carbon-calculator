import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';
import signup from '../assets/signup.png';

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
const handleSignUp = async (event) => {
  event.preventDefault();
  
  try {
    // Updated URL:
    const response = await axios.post('https://carbon-calculator-production.up.railway.app/api/auth/signup', {
      username,
      email,
      password
    });
    
    if (response.status === 201) {
      setSuccess(true);
      setError(null);
      console.log("Success:", response.data);
    } else {
      setError('Unexpected response from server');
      setSuccess(false);
      console.log("Unexpected response:", response);
    }
  } catch (error) {
    console.error("Error details:", error);
    if (error.response) {
      setError(error.response.data.error || 'An error occurred during sign up');
      console.log("Error response:", error.response.data);
    } else if (error.request) {
      setError('No response from server. Please try again.');
      console.log("No response received");
    } else {
      setError('Error setting up the request. Please try again.');
      console.log("Error:", error.message);
    }
    setSuccess(false);
  }
};

  return (
    <div className="yx-portal" style={{ backgroundImage: `url(${signup})` }}>
      <div className='yx-box'>
        <h2>Sign up</h2>
        <form onSubmit={handleSignUp}>
          <div>
            <label htmlFor="username">Username:</label>
            <input 
              type="text"
              className='yx-user'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email">Email:</label>
            <input 
              type="email"
              className='yx-email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password">Password:</label>
            <input 
              type="password"
              className='yx-pass'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className='yx-btn'>Sign up</button>
        </form>
        {error && <p className='yx-error'>{error}</p>}
        {success && <p className='yx-success'>Sign up successful! </p>}
        <div className='yx-divider'>
          <div className='yx-line'></div>
          <span className='yx-or'>or</span>
          <div className='yx-line'></div>
        </div>
        <p className='yx-login'>Already have an account?
          <Link to="/login" className="yx-link">
            <button className="yx-nav">Log in</button>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;