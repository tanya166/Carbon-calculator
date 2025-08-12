import React, { useState, useEffect } from 'react';
import { authUtils } from '../utils/auth';
import './UserDashboard.css';

// Constants
const FORM_TYPE_COLORS = {
  'electricity': '#4facfe',
  'household': '#4facfe',
  'flight': '#43e97b',
  'car': '#f093fb',
  'fuel combustion': '#ff6b6b',
  'gas': '#ffa726',
  'transportation': '#ab47bc'
};

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
        
        console.log('=== DASHBOARD DEBUG START ===');
        console.log('Is authenticated:', authUtils.isAuthenticated());
        
        const currentUser = authUtils.getCurrentUser();
        console.log('getCurrentUser() result:', currentUser);
        setUser(currentUser);
        
        console.log('About to call authUtils.show()...');
        const response = await authUtils.show();
        console.log('API Response from show():', response);
        console.log('Response structure:', JSON.stringify(response, null, 2));
        
        let calculationsData = [];
        
        // Handle the expected response format: { success: true, count: 1, data: [...] }
        if (response && response.success === true && Array.isArray(response.data)) {
          console.log('✅ Found data in response.data, length:', response.data.length);
          calculationsData = response.data;
        } else if (response && Array.isArray(response.data)) {
          console.log('✅ Found array in response.data');
          calculationsData = response.data;
        } else if (Array.isArray(response)) {
          console.log('✅ Response is direct array');
          calculationsData = response;
        } else {
          console.warn('⚠️ Unexpected response format:', response);
          calculationsData = [];
        }
        
        console.log('Final calculations data:', calculationsData);
        console.log('Setting calculations state with', calculationsData.length, 'items');
        console.log('=== DASHBOARD DEBUG END ===');
        
        setCalculations(calculationsData);
        
      } catch (error) {
        console.error('❌ Error fetching calculations:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
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
      console.error('Date formatting error:', e);
      return dateString;
    }
  };

  const getFormTypeColor = (formType) => {
    return FORM_TYPE_COLORS[formType?.toLowerCase()] || '#667eea';
  };

  // Completely bulletproof function to convert carbon footprint to number
  const getCarbonFootprintValue = (value) => {
    console.log('getCarbonFootprintValue input:', value, 'type:', typeof value);
    
    // Handle all possible falsy values
    if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
      console.log('Returning 0 for falsy value');
      return 0;
    }
    
    // If it's already a number
    if (typeof value === 'number') {
      const result = isNaN(value) ? 0 : Number(value);
      console.log('Already number, returning:', result);
      return result;
    }
    
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
        console.log('Empty string, returning 0');
        return 0;
      }
      
      const parsed = parseFloat(trimmed);
      const result = isNaN(parsed) ? 0 : parsed;
      console.log('Parsed string:', trimmed, 'result:', result);
      return result;
    }
    
    // For any other type, try Number conversion as last resort
    try {
      const converted = Number(value);
      const result = isNaN(converted) ? 0 : converted;
      console.log('Number conversion result:', result);
      return result;
    } catch (e) {
      console.warn('Failed to convert value to number:', value, e);
      return 0;
    }
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

  const handleDeleteCalculation = async (calculationId) => {
    if (window.confirm('Are you sure you want to delete this calculation?')) {
      try {
        await authUtils.deleteCalculation(calculationId);
        setCalculations(prev => prev.filter(calc => calc.id !== calculationId));
        console.log(`✅ Deleted calculation ${calculationId}`);
      } catch (error) {
        console.error('Error deleting calculation:', error);
        setError('Failed to delete calculation');
      }
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
                  <span className="user-email">{user?.email || user?.username || 'User'}</span>
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

          {/* Debug info - remove this once working */}
          <div style={{ 
            background: '#e8f5e8', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            fontSize: '0.9rem',
            color: '#2e7d32',
            border: '1px solid #c8e6c9'
          }}>
            <p><strong>Debug Status:</strong></p>
            <p>• Found {Array.isArray(calculations) ? calculations.length : 'invalid'} calculations</p>
            <p>• User: {user?.email || 'Not loaded'}</p>
            <p>• Data Type: {Array.isArray(calculations) ? 'Array' : typeof calculations}</p>
          </div>

          <div className="calculations-section">
            <div className="calculations-header">
              <h2 className="calculations-title">Your Calculations</h2>
              <div className="calculations-count">
                {Array.isArray(calculations) ? calculations.length : 0} calculation{(Array.isArray(calculations) ? calculations.length : 0) !== 1 ? 's' : ''}
              </div>
            </div>

            {!Array.isArray(calculations) || calculations.length === 0 ? (
              <div className="no-data">
                <div className="no-data-icon">📊</div>
                <h3>No calculations found</h3>
                <p>You haven't created any carbon footprint calculations yet.</p>
                <button 
                  className="action-button records-button"
                  onClick={() => window.location.href = '/'}
                  style={{ marginTop: '1rem' }}
                >
                  Start Calculating
                </button>
              </div>
            ) : (
              <div className="calculations-grid">
                {calculations.map((calculation, index) => {
                  console.log(`🔍 Rendering calculation ${index + 1}:`, calculation);
                  
                  try {
                    // Add the requested debug logs
                    console.log('DEBUG - calculation object:', calculation);
                    console.log('DEBUG - carbonFootprint raw value:', calculation.carbonFootprint);
                    console.log('DEBUG - carbonFootprint type:', typeof calculation.carbonFootprint);
                    
                    // Handle the data from your Postman response
                    const submissionData = calculation.submissionData || {};
                    const formType = calculation.formType || 'Unknown';
                    
                    // FIXED: Use the robust function to get carbon footprint number
                    const carbonFootprintNumber = getCarbonFootprintValue(calculation.carbonFootprint);
                    
                    // Add the additional debug logs for the processed value
                    console.log('DEBUG - carbonFootprintNumber:', carbonFootprintNumber);
                    console.log('DEBUG - carbonFootprintNumber type:', typeof carbonFootprintNumber);
                    
                    // Extra safety check - ensure it's definitely a number
                    const safeCarbonFootprint = (typeof carbonFootprintNumber === 'number' && !isNaN(carbonFootprintNumber)) ? carbonFootprintNumber : 0;
                    
                    console.log('DEBUG - safeCarbonFootprint:', safeCarbonFootprint);
                    console.log('DEBUG - safeCarbonFootprint type:', typeof safeCarbonFootprint);
                    
                    const submittedAt = calculation.submittedAt || calculation.createdAt;
                    const calculationId = calculation.id || index;

                    console.log(`Processing calculation ${calculationId}:`, {
                      formType,
                      carbonFootprintRaw: calculation.carbonFootprint,
                      carbonFootprintNumber,
                      submissionData,
                      submittedAt
                    });

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
                          {(typeof safeCarbonFootprint === 'number' && !isNaN(safeCarbonFootprint) ? safeCarbonFootprint.toFixed(2) : '0.00')} kg CO₂e
                        </div>

                        <div className="calculation-details">
                          <h4 className="details-title">Calculation Details</h4>
                          
                          <div className="detail-row">
                            <span className="detail-label">Type:</span>
                            <span className="detail-value">{formType}</span>
                          </div>
                          
                          <div className="detail-row">
                            <span className="detail-label">Carbon Footprint:</span>
                            <span className="detail-value">{(typeof safeCarbonFootprint === 'number' && !isNaN(safeCarbonFootprint) ? safeCarbonFootprint.toFixed(2) : '0.00')} kg CO₂e</span>
                          </div>
                          
                          <div className="detail-row">
                            <span className="detail-label">Submitted:</span>
                            <span className="detail-value">{formatDate(submittedAt)}</span>
                          </div>

                          {/* Flight-specific fields based on your Postman data */}
                          {submissionData.from && (
                            <div className="detail-row">
                              <span className="detail-label">From:</span>
                              <span className="detail-value">{submissionData.from}</span>
                            </div>
                          )}
                          
                          {submissionData.to && (
                            <div className="detail-row">
                              <span className="detail-label">To:</span>
                              <span className="detail-value">{submissionData.to}</span>
                            </div>
                          )}
                          
                          {submissionData.distance && (
                            <div className="detail-row">
                              <span className="detail-label">Distance:</span>
                              <span className="detail-value">{submissionData.distance}</span>
                            </div>
                          )}
                          
                          {submissionData.tripType && (
                            <div className="detail-row">
                              <span className="detail-label">Trip Type:</span>
                              <span className="detail-value">{submissionData.tripType}</span>
                            </div>
                          )}
                          
                          {submissionData.passengers && (
                            <div className="detail-row">
                              <span className="detail-label">Passengers:</span>
                              <span className="detail-value">{submissionData.passengers}</span>
                            </div>
                          )}

                          {/* Electricity data */}
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

                          {/* Car data */}
                          {submissionData.vehicleType && (
                            <div className="detail-row">
                              <span className="detail-label">Vehicle Type:</span>
                              <span className="detail-value">{submissionData.vehicleType}</span>
                            </div>
                          )}
                          
                          {submissionData.fuelType && (
                            <div className="detail-row">
                              <span className="detail-label">Fuel Type:</span>
                              <span className="detail-value">{submissionData.fuelType}</span>
                            </div>
                          )}

                          {/* Gas/fuel combustion data */}
                          {submissionData.gas && (
                            <div className="detail-row">
                              <span className="detail-label">Gas:</span>
                              <span className="detail-value">{submissionData.gas} {submissionData.gasUnit || 'units'}</span>
                            </div>
                          )}
                        </div>

                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDeleteCalculation(calculationId)}
                            style={{
                              background: '#e53935',
                              color: 'white',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            title="Delete this calculation"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    );
                  } catch (renderError) {
                    console.error(`❌ Error rendering calculation ${index}:`, renderError);
                    return (
                      <div key={index} className="calculation-card" style={{ background: '#ffebee', borderLeftColor: '#f44336' }}>
                        <h4 style={{ color: '#d32f2f' }}>Error rendering calculation {index + 1}</h4>
                        <p style={{ fontSize: '12px', color: '#666' }}>
                          Error: {renderError.message}
                        </p>
                        <details style={{ marginTop: '10px' }}>
                          <summary style={{ cursor: 'pointer', fontSize: '12px' }}>Raw data</summary>
                          <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '150px', background: '#f5f5f5', padding: '10px', marginTop: '5px' }}>
                            {JSON.stringify(calculation, null, 2)}
                          </pre>
                        </details>
                      </div>
                    );
                  }
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