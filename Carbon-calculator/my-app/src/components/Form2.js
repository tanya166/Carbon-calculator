import React, { useState, useEffect } from "react";
import './Form2.css';
import { authUtils } from '../utils/auth';

const Form2 = () => {
  const [tripType, setTripType] = useState('one-way');
  const [passengers, setPassengers] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  const [distance, setDistance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const API_BASE_URL = 'https://www.carboninterface.com/api/v1/estimates';
  const API_KEY = 'HezNqwNiVlOAVbxVDAUtQg';

  useEffect(() => {
    const token = sessionStorage.getItem('authToken'); 
    setIsLoggedIn(!!token);
  }, []);

  const saveToDatabase = async (formData, carbonFootprint) => {
  try {
    const payload = {
      formType: 'flight',
      submissionData: formData,
      carbonFootprint: carbonFootprint
    };  
    
    // Updated URL:
    const response = await fetch('https://carbon-calculator-production.up.railway.app/api/form/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authUtils.getToken()}`
      },
      body: JSON.stringify(payload)
    });   
    
    const responseData = await response.json();
    if (response.ok) {
      console.log('Successfully saved to database');
      setError(''); 
    } else {
      console.error('Failed to save to database:', responseData);
      setError('Failed to save to database');
    }
  } catch (error) {
    console.error('Error saving to database:', error);
    setError('Error saving to database');
  }
};
  const handleCalculate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!from.trim() || !to.trim()) {
        setError('Please enter both departure and destination airports');
        setIsLoading(false);
        return;
      }

      if (passengers <= 0) {
        setError('Please enter a valid number of passengers');
        setIsLoading(false);
        return;
      }

      let legs = [
        {
          departure_airport: from.toLowerCase().trim(),
          destination_airport: to.toLowerCase().trim()
        }
      ];

      if (tripType === 'round-trip') {
        legs.push({
          departure_airport: to.toLowerCase().trim(),
          destination_airport: from.toLowerCase().trim()
        });
      }

      const payload = {
        type: "flight",
        passengers: parseInt(passengers),
        legs: legs
      };

      console.log('API Payload:', payload);

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API call failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      const carbonKg = data.data.attributes.carbon_kg;
      const distanceValue = data.data.attributes.distance_value;
      const distanceUnit = data.data.attributes.distance_unit;

      const finalFootprint = parseFloat(carbonKg.toFixed(2));
      const finalDistance = `${distanceValue.toFixed(2)} ${distanceUnit}`;

      setCarbonFootprint(finalFootprint);
      setDistance(finalDistance);

      if (isLoggedIn) {
        await saveToDatabase({
          tripType,
          passengers: parseInt(passengers),
          from: from.toUpperCase().trim(),
          to: to.toUpperCase().trim(),
          distance: finalDistance
        }, finalFootprint);
      }

      setShowModal(true);
    } catch (error) {
      console.error('Error calculating carbon footprint:', error);
      setError(`Failed to calculate carbon footprint: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className='boxx'>
      <div className="text-center mb-8">
        <h1 className="calc-heading">Calculate your carbon footprint for flight</h1>
        <p className="calc-subtitle">Calculate your flight's environmental impact</p>
      </div>

      {isLoggedIn && (
        <div className="status-message success">
          <span className="icon">✓</span>
          <span className="text">Your calculations will be saved to your account</span>
        </div>
      )}
      
      {!isLoggedIn && (
        <div className="status-message warning">
          <span className="icon">⚠</span>
          <span className="text">Login to save your calculations and view history</span>
        </div>
      )}

      <div className="calculate-1">
        <form onSubmit={handleCalculate}>
          <div className="section-household">
            <div className='no_h'>
              <span className='qsn1'>Enter flight details for carbon footprint calculation</span>
            </div>
            
            <div className='no_h' style={{ marginBottom: '1rem' }}>
              <span className='qsn1'>Number of passengers:</span>
              <input
                type="number"
                min="1"
                max="10"
                className="positive-input"
                style={{ padding: "0.75rem", width: "80px", marginLeft: "1rem" }}
                value={passengers}
                onChange={e => setPassengers(e.target.value)}
                required
              />
            </div>

            <div className="rad" style={{ marginBottom: '1.5rem' }}>
              <label style={{ marginRight: '1rem', display: 'inline-flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="tripType"
                  value="one-way"
                  checked={tripType === 'one-way'}
                  onChange={e => setTripType(e.target.value)}
                  style={{ marginRight: '0.5rem' }}
                />
                One-way
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="tripType"
                  value="round-trip"
                  checked={tripType === 'round-trip'}
                  onChange={e => setTripType(e.target.value)}
                  style={{ marginRight: '0.5rem' }}
                />
                Round trip
              </label>
            </div>
          </div>

          <div className='div2'>
            <div className="left-part11">
              <div className="section-title">
                <span className="emoji">🛫</span>
                From
              </div>
              <div className="input-group">
                <label className="input-label required">Departure Airport</label>
                <input
                  type="text"
                  className="enter2"
                  value={from}
                  onChange={e => setFrom(e.target.value.toUpperCase())}
                  placeholder="e.g., SFO"
                  maxLength="3"
                  required
                />
                <span className="text33">Please enter the three letter airport code</span>
              </div>
            </div>

            <div className="right-part11">
              <div className="section-title">
                <span className="emoji">🛬</span>
                To
              </div>
              <div className="input-group">
                <label className="input-label required">Destination Airport</label>
                <input
                  type="text"
                  className="enter2"
                  value={to}
                  onChange={e => setTo(e.target.value.toUpperCase())}
                  placeholder="e.g., YYZ"
                  maxLength="3"
                  required
                />
                <span className="text33">Please enter the three letter airport code</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="icon">⚠</span>
              <span className="text">{error}</span>
            </div>
          )}
          
          <div className='submitt-1'>
            <button 
              type="submit" 
              className="button-11" 
              disabled={isLoading}
            >
              {isLoading && <div className="loading-spinner"></div>}
              {isLoading ? 'Calculating...' : 'Calculate Footprint'}
            </button>
          </div>
        </form>
      </div>
      
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="close" onClick={closeModal}>×</button>
            <div className="inside-content">
              <div className="modal-icon">✈️</div>
              <h2 className="result-text">Flight Carbon Footprint Result</h2>
              
              <div className="result-display">
                <p className="result-text1">Your flight carbon footprint:</p>
                <p className="result-value">{carbonFootprint} kgCO2e</p>
              </div>
              
              <div className="result-text2">
                Want to decrease your Carbon footprint? Start carbon offsetting now!
              </div>
              
              {isLoggedIn && (
                <div className="modal-status success">
                  <span className="icon">✓</span>
                  <span>This calculation has been saved to your account</span>
                </div>
              )}
              
              {!isLoggedIn && (
                <div className="modal-status warning">
                  <span className="icon">⚠</span>
                  <span>Login to save your calculations and track progress</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form2;
