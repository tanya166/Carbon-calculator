import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MenuItems from "./MenuItems";
import { menu_items } from "./menu_items";
import { authUtils } from '../../utils/auth';
import './Navbar.css';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(authUtils.isAuthenticated());
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = authUtils.isAuthenticated();
      setIsAuthenticated(authStatus);
      if (!authStatus && isAuthenticated) {
        setUsername('');
      }
    };

    checkAuth();
    const authCheckInterval = setInterval(checkAuth, 30000);
    window.addEventListener('storage', checkAuth);
    window.addEventListener('focus', checkAuth);

    const handleUserActivity = () => {
      checkAuth();
    };

    document.addEventListener('click', handleUserActivity);
    document.addEventListener('keypress', handleUserActivity);

    console.log("Navbar isAuthenticated:", isAuthenticated);

    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('focus', checkAuth);
      document.removeEventListener('click', handleUserActivity);
      document.removeEventListener('keypress', handleUserActivity);
    };
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    authUtils.logout();
    setIsAuthenticated(false);
    setUsername('');
    navigate('/');
  };

  return (
    <nav>
      <div className="nav">
        <div className="logo_main">
          <Link to="/">
            <div className="nav-brand">
              <div className="nav-logo">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="nav-title">Carbon Tracker</h1>
            </div>
          </Link>
        </div>

        <div className="nav-content">
          <ul className="menus">
            {menu_items.map((menu, index) => (
              <MenuItems items={menu} key={index} depthLevel={0} />
            ))}
          </ul>

          <div className="login-container">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="logout-btnn">
                Logout
              </button>
            ) : (
              <Link to="/login">
                <button className="loginn">Login/Sign up</button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
