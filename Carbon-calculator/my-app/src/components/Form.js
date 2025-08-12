import React, { useState, useEffect } from "react";
import Positive_input from './Positive_input';
import './Form.css';
import { authUtils } from '../utils/auth';

const Form = () => {
  const [householdSize, setHouseholdSize] = useState(1);
  const [electricity, setElectricity] = useState('');
  const [electricityUnit, setElectricityUnit] = useState('mwh');
  const [country, setCountry] = useState('us');
  const [state, setState] = useState('');
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const API_KEY = process.env.REACT_APP_API_KEY;
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = sessionStorage.getItem('authToken'); 
    setIsLoggedIn(!!token);
  }, []);

const saveToDatabase = async (formData, carbonFootprint) => {
  try {
    const payload = {
      formType: 'electricity',
      submissionData: formData,
      carbonFootprint: carbonFootprint
    };  
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/form/submit`, {
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
      const electricityValue = parseFloat(electricity) || 0;

      if (electricityValue <= 0) {
        setError('Please enter a valid electricity value');
        setIsLoading(false);
        return;
      }
      
      const payload = {
        type: "electricity",
        electricity_unit: electricityUnit,
        electricity_value: electricityValue,
        country: country.toLowerCase(),
        state: state.toLowerCase() || undefined
      };

      if (!state.trim()) {
        delete payload.state;
      }

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API call failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data); 

      const carbonKg = data.data.attributes.carbon_kg;
      const finalFootprint = householdSize > 1 ? carbonKg / householdSize : carbonKg;

      setCarbonFootprint(finalFootprint.toFixed(2));

      if (isLoggedIn) {
        await saveToDatabase({
          householdSize: parseInt(householdSize),
          electricity: electricityValue,
          electricityUnit,
          country,
          state: state || null
        }, parseFloat(finalFootprint.toFixed(2)));
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
        <h1 className="calc-heading">Calculate your carbon footprint for household</h1>
        <p className="calc-subtitle">Calculate your household's environmental impact</p>
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
              <span className='qsn1'>How many people are in your household?</span>
              <Positive_input 
                value={householdSize} 
                onChange={e => setHouseholdSize(e.target.value)}
                className="positive-input"
              />
            </div>
            <span className='qsn2'>
              (Note: To calculate for your full household footprint e.g. for your family, keep this as "1")
            </span>
          </div>

          <div className='div2'>
            <div className="left-part11">
              <div className="section-title">
                <span className="emoji">📍</span>
                Location
              </div>
              
              <div className="input-group">
                <label className="input-label required">Country Code</label>
                <input 
                  type="text" 
                  className="enter2" 
                  value={country} 
                  onChange={e => setCountry(e.target.value)}
                  placeholder="e.g., us, uk, ca"
                  required
                />
              </div>
              
              <div className="input-group">
                <label className="input-label">State Code (optional)</label>
                <input 
                  type="text" 
                  className="enter2" 
                  value={state} 
                  onChange={e => setState(e.target.value)}
                  placeholder="e.g., ca, fl, ny"
                />
              </div>
            </div>

            <div className="right-part11">
              <div className="section-title">
                <span className="emoji">⚡</span>
                Electricity Usage
              </div>
              
              <div className="input-group">
                <label className="input-label required">Electricity Consumption</label>
                <div className="electricity-input-group">
                  <input 
                    type="number" 
                    className="enter2" 
                    value={electricity} 
                    onChange={e => setElectricity(e.target.value)}
                    placeholder="Enter consumption"
                    required
                  />
                  <select 
                    className="options-12" 
                    value={electricityUnit} 
                    onChange={e => setElectricityUnit(e.target.value)}
                  >
                    <option value="mwh">MWh</option>
                    <option value="kwh">kWh</option>
                  </select>
                </div>
                
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
              className="button-11" 
              type="submit" 
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
              <div className="modal-icon">🌍</div>
              <h2 className="result-text">Carbon Footprint Result</h2>
              
              <div className="result-display">
                <p className="result-text1">Your household carbon footprint is:</p>
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

export default Form;
