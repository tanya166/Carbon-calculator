import React, { useEffect, useState } from 'react';
import { authUtils } from '../utils/auth';
import './Dashboard.css';

function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { email, userId ,username} = authUtils.getCurrentUser();
    setUserInfo({ email, userId , username });
    setLoading(false);
  }, []);
  console.log(userInfo?.email);
 console.log(userInfo?.username);
  const handleLogout = async () => {
    try {
      await authUtils.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateToUserDashboard = () => {
    window.location.href = '/userDashboard';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFormTypeColor = (formType) => {
    const colors = {
      'household': '#4facfe',
      'flight': '#43e97b',
      'car': '#f093fb',
      'fuel combustion': '#ff6b6b'
    };
    return colors[formType] || '#667eea';
  };

  if (loading) {
    return (
      <div className="profile-loading-wrapper">
        <div className="profile-loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="profile-main-container">
      <div className="profile-content-card">
        <div className="profile-header-section">
          <h1 className="profile-main-title">Profile</h1>
          <p className="profile-welcome-text">Welcome back! You're successfully authenticated.</p>
        </div>

        <div className="profile-body-content">
          {userInfo && (
            <div className="profile-user-details">
              <h3 className="profile-details-heading">User Information</h3>
              <div>Email: {userInfo.email}</div>
              <div>Username: {userInfo.username}</div>
              
            </div>
          )}

          <div className="profile-button-section">
            <button 
              className="profile-btn profile-records-btn"
              onClick={navigateToUserDashboard}
            >
              Past Calculations
            </button>
            <button 
              className="profile-btn profile-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;