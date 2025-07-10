import React, { useState, useEffect } from 'react';
import { authUtils } from '../utils/auth';
import './UserDashboard.css';

const UserDashboard = () => {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const currentUser = authUtils.getCurrentUser();
        setUser(currentUser);
        console.log('Current user:', currentUser);
        const response = await authUtils.show();
        console.log('API Response:', response);
        
        let calculationsData = [];
        
        if (response && response.success && Array.isArray(response.data)) {
          calculationsData = response.data;
        } else if (response && Array.isArray(response.data)) {
          calculationsData = response.data;
        } else if (response && Array.isArray(response)) {
          calculationsData = response;
        } else {
          console.warn('Unexpected response format:', response);
          calculationsData = [];
        }
        
        console.log('Processed calculations data:', calculationsData);
        console.log('Number of calculations:', calculationsData.length);
        calculationsData.forEach((calc, index) => {
          console.log(`Calculation ${index}:`, calc);
        });
        
        setCalculations(calculationsData);
        
      } catch (error) {
        console.error('Error fetching calculations:', error);
        setError(error.message || 'Failed to fetch calculations');
        setCalculations([]);
      } finally {
        setLoading(false);
      }
    };
    if (authUtils.isAuthenticated()) {
      fetchUserData();
    } else {
      setLoading(false);
      setError('Please log in to view your calculations');
    }
  }, []);

  const handleLogout = () => {
    authUtils.logout();
  };

  const goBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getFormTypeColor = (formType) => {
    const colors = {
      'electricity': '#4facfe',
      'household': '#4facfe',
      'flight': '#43e97b',
      'car': '#f093fb',
      'fuel combustion': '#ff6b6b',
      'gas': '#ffa726',
      'transportation': '#ab47bc'
    };
    return colors[formType?.toLowerCase()] || '#667eea';
  };

  const safeJSONParse = (jsonString) => {
    if (!jsonString) return {};
    if (typeof jsonString === 'object') return jsonString;
    
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Error parsing JSON:', e, 'Raw data:', jsonString);
      return {};
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your calculations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <div className="error-message">
            <strong>Error: </strong>
            {error}
          </div>
          <div className="error-buttons">
            <button
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              Retry
            </button>
            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Your Carbon Footprint History</h1>
          <p className="dashboard-subtitle">View all your past calculations and track your environmental impact.</p>
        </div>

        <div className="dashboard-content">

          <div className="user-info-card">
            <div className="user-info-title">
              <div className="user-info">
                {user?.email && (
                  <div className="user-avatar">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="user-email">{user?.email}</span>
                  <p>User ID: <span className="user-id">{user?.userId || 'Not found'}</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="actions-section">
            <button 
              className="action-button records-button"
              onClick={goBackToDashboard}
            >
              ← Back to Dashboard
            </button>
            <button 
              className="action-button logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          <div className="debug-info" style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            fontSize: '0.9rem',
            color: '#666'
          }}>
            <p><strong>Debug Info:</strong> Found {calculations.length} calculations</p>
            <p>User ID: {user?.userId || 'Not found'}</p>
            <p>User Email: {user?.email || 'Not found'}</p>
            <p>Is Authenticated: {authUtils.isAuthenticated() ? 'Yes' : 'No'}</p>
          </div>

          <div className="calculations-section">
            <div className="calculations-header">
              <h2 className="calculations-title">Your Calculations</h2>
              <div className="calculations-count">
                {calculations.length} calculation{calculations.length !== 1 ? 's' : ''}
              </div>
            </div>

            {calculations.length === 0 ? (
              <div className="no-data">
                <div className="no-data-icon">📊</div>
                <h3>No calculations found</h3>
                <p>You haven't created any carbon footprint calculations yet.</p>
              </div>
            ) : (
              <div className="calculations-grid">
                {calculations.map((calculation, index) => {
                  const submissionData = safeJSONParse(calculation.submissionData);
                  const formType = calculation.formType || 'Unknown';
                  const carbonFootprint = calculation.carbonFootprint || 0;
                  const submittedAt = calculation.submittedAt || calculation.createdAt;
                  const calculationId = calculation.id;

                  return (
                    <div 
                      key={calculationId} 
                      className="calculation-card"
                      style={{ borderLeftColor: getFormTypeColor(formType) }}
                    >
                      <div className="calculation-header">
                        <div 
                          className="form-type-badge"
                          style={{ backgroundColor: getFormTypeColor(formType) }}
                        >
                          {formType}
                        </div>
                        <div className="calculation-date">
                          {formatDate(submittedAt)}
                        </div>
                      </div>

                      <div className="carbon-footprint">
                        {carbonFootprint.toFixed(2)} kg CO₂e
                      </div>

                      <div className="calculation-details">
                        <h4 className="details-title">Calculation Details</h4>
                        <div className="detail-row">
                          <span className="detail-label">Type:</span>
                          <span className="detail-value">{formType}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Carbon Footprint:</span>
                          <span className="detail-value">{carbonFootprint.toFixed(2)} kg CO₂e</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Submitted:</span>
                          <span className="detail-value">{formatDate(submittedAt)}</span>
                        </div>
                        
                        {submissionData.electricity && (
                          <div className="detail-row">
                            <span className="detail-label">Electricity:</span>
                            <span className="detail-value">{submissionData.electricity} {submissionData.electricityUnit || 'kWh'}</span>
                          </div>
                        )}
                        {submissionData.householdSize && (
                          <div className="detail-row">
                            <span className="detail-label">Household Size:</span>
                            <span className="detail-value">{submissionData.householdSize}</span>
                          </div>
                        )}
                        {submissionData.country && (
                          <div className="detail-row">
                            <span className="detail-label">Country:</span>
                            <span className="detail-value">{submissionData.country.toUpperCase()}</span>
                          </div>
                        )}
                        {submissionData.distance && (
                          <div className="detail-row">
                            <span className="detail-label">Distance:</span>
                            <span className="detail-value">{submissionData.distance} km</span>
                          </div>
                        )}
                        {submissionData.fuelType && (
                          <div className="detail-row">
                            <span className="detail-label">Fuel Type:</span>
                            <span className="detail-value">{submissionData.fuelType}</span>
                          </div>
                        )}
                        {submissionData.gas && (
                          <div className="detail-row">
                            <span className="detail-label">Gas:</span>
                            <span className="detail-value">{submissionData.gas} {submissionData.gasUnit || 'units'}</span>
                          </div>
                        )}
                        {submissionData.vehicleType && (
                          <div className="detail-row">
                            <span className="detail-label">Vehicle Type:</span>
                            <span className="detail-value">{submissionData.vehicleType}</span>
                          </div>
                        )}
                        {submissionData.passengers && (
                          <div className="detail-row">
                            <span className="detail-label">Passengers:</span>
                            <span className="detail-value">{submissionData.passengers}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;