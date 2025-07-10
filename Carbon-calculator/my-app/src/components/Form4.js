
import React, { useState, useEffect } from "react";
import './Form4.css';

const Form4 = () => {
  const [fuelSourceValue, setFuelSourceValue] = useState('');
  const [fuelSourceType, setFuelSourceType] = useState('dfo');
  const [fuelSourceUnit, setFuelSourceUnit] = useState('gallon');
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const API_KEY = 'HezNqwNiVlOAVbxVDAUtQg';
  const BASE_URL = 'https://www.carboninterface.com/api/v1';

  useEffect(() => {
    const tokenFromsession = sessionStorage.getItem('authToken');
    const tokenFromSession = sessionStorage.getItem('authToken');
    const token = tokenFromsession || tokenFromSession;
    
    setIsLoggedIn(!!token);
  }, []);

  const fuelOptions = [
    { type: 'bit', name: 'Bituminous Coal', units: ['short_ton', 'btu'] },
    { type: 'dfo', name: 'Home Heating and Diesel Fuel (Distillate)', units: ['gallon', 'btu'] },
    { type: 'jf', name: 'Jet Fuel', units: ['gallon', 'btu'] },
    { type: 'ker', name: 'Kerosene', units: ['gallon', 'btu'] },
    { type: 'lig', name: 'Lignite Coal', units: ['short_ton', 'btu'] },
    { type: 'msw', name: 'Municipal Solid Waste', units: ['short_ton', 'btu'] },
    { type: 'ng', name: 'Natural Gas', units: ['thousand_cubic_feet', 'btu'] },
    { type: 'pc', name: 'Petroleum Coke', units: ['gallon', 'btu'] },
    { type: 'pg', name: 'Propane Gas', units: ['gallon', 'btu'] },
    { type: 'rfo', name: 'Residual Fuel Oil', units: ['gallon', 'btu'] },
    { type: 'sub', name: 'Subbituminous Coal', units: ['short_ton', 'btu'] },
    { type: 'tdf', name: 'Tire-Derived Fuel', units: ['short_ton', 'btu'] },
    { type: 'wo', name: 'Waste Oil', units: ['barrel', 'btu'] }
  ];

  const validCombinations = {
    bit: ['short_ton', 'btu'],
    dfo: ['gallon', 'btu'],
    jf: ['gallon', 'btu'],
    ker: ['gallon', 'btu'],
    lig: ['short_ton', 'btu'],
    msw: ['short_ton', 'btu'],
    ng: ['thousand_cubic_feet', 'btu'],
    pc: ['gallon', 'btu'],
    pg: ['gallon', 'btu'],
    rfo: ['gallon', 'btu'],
    sub: ['short_ton', 'btu'],
    tdf: ['short_ton', 'btu'],
    wo: ['barrel', 'btu']
  };

  const getAvailableUnits = () => {
    const selectedFuel = fuelOptions.find(fuel => fuel.type === fuelSourceType);
    return selectedFuel ? selectedFuel.units : [];
  };

  const formatUnitName = (unit) => {
    const unitNames = {
      'short_ton': 'Short Ton',
      'btu': 'BTU',
      'gallon': 'Gallon',
      'thousand_cubic_feet': 'Thousand Cubic Feet',
      'barrel': 'Barrel'
    };
    return unitNames[unit] || unit.replace(/_/g, ' ');
  };

  const handleFuelTypeChange = (newFuelType) => {
    setFuelSourceType(newFuelType);
    const newFuel = fuelOptions.find(fuel => fuel.type === newFuelType);
    if (newFuel && newFuel.units.length > 0) {
      setFuelSourceUnit(newFuel.units[0]);
    }
  };

  const saveToDatabase = async (formData, carbonFootprint) => {
    try {
      const payload = {
        formType: 'fuel_combustion',
        submissionData: formData,
        carbonFootprint: carbonFootprint
      };

      const tokenFromsession = sessionStorage.getItem('authToken');
      const tokenFromSession = sessionStorage.getItem('authToken');
      const token = tokenFromsession || tokenFromSession;
      
      const response = await fetch('http://localhost:3000/api/form/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

    if (!fuelSourceValue || !fuelSourceType || !fuelSourceUnit) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validCombinations[fuelSourceType]?.includes(fuelSourceUnit)) {
      setError(`Invalid unit "${fuelSourceUnit}" for fuel type "${fuelSourceType}"`);
      return;
    }

    setLoading(true);
    setError('');

    const requestBody = {
      type: 'fuel_combustion',
      fuel_source_type: fuelSourceType,
      fuel_source_unit: fuelSourceUnit,
      fuel_source_value: parseFloat(fuelSourceValue)
    };

    console.log('🚀 Sending to API:', requestBody);

    try {
      const response = await fetch(`${BASE_URL}/estimates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📬 Estimate response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔥 Fuel Combustion API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);

      const carbonKg = data.data.attributes.carbon_kg;
      const finalFootprint = parseFloat(carbonKg.toFixed(2));
      setCarbonFootprint(finalFootprint);

      if (isLoggedIn) {
        await saveToDatabase({
          fuelSourceType,
          fuelSourceUnit,
          fuelSourceValue: parseFloat(fuelSourceValue),
          selectedFuelName: fuelOptions.find(fuel => fuel.type === fuelSourceType)?.name || ''
        }, finalFootprint);
      }

      setShowModal(true);

    } catch (err) {
      console.error('❌ Calculate API Error:', err);
      setError(`Error calculating fuel combustion footprint: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const selectedFuelName = fuelOptions.find(fuel => fuel.type === fuelSourceType)?.name || '';

  return (
    <div className='boxx'>
      <div className="text-center mb-8">
        <h1 className="calc-heading">🔥 Fuel Combustion Carbon Footprint Calculator</h1>
        <p className="calc-subtitle">Calculate your fuel combustion's environmental impact</p>
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
          <div className="section-fuel">
            <div className="section-title">
              <span className="emoji">⛽</span>
              Enter fuel details for carbon footprint calculation
            </div>

            <div className="form-group">
              <label htmlFor="fuelType" className="input-label required">Fuel Type</label>
              <select
                id="fuelType"
                className="form-select"
                value={fuelSourceType}
                onChange={(e) => handleFuelTypeChange(e.target.value)}
                required
              >
                {fuelOptions.map(fuel => (
                  <option key={fuel.type} value={fuel.type}>
                    {fuel.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fuelAmount" className="input-label required">Fuel Amount</label>
              <input
                id="fuelAmount"
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={fuelSourceValue}
                onChange={(e) => setFuelSourceValue(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fuelUnit" className="input-label required">Unit</label>
              <select
                id="fuelUnit"
                className="form-select"
                value={fuelSourceUnit}
                onChange={(e) => setFuelSourceUnit(e.target.value)}
                required
              >
                {getAvailableUnits().map(unit => (
                  <option key={unit} value={unit}>
                    {formatUnitName(unit)}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="error-message">
                <span className="icon">⚠</span>
                <span className="text">{error}</span>
              </div>
            )}

            <div className="submitt-1">
              <button
                type="submit"
                disabled={loading}
                className="button-11"
              >
                {loading && <div className="loading-spinner"></div>}
                {loading ? 'Calculating...' : 'Calculate Footprint'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="close" onClick={closeModal}>&times;</button>
            <div className="inside-content">
              <div className="modal-icon">🔥</div>
              <h2 className="result-text">Fuel Combustion Carbon Footprint Result</h2>
              
              <div className="result-display">
                <p className="result-text1">Your fuel combustion carbon footprint:</p>
                <p className="result-value">{carbonFootprint} kgCO2e</p>
                <p className="result-text1">
                  Fuel used: {fuelSourceValue} {formatUnitName(fuelSourceUnit)} of {selectedFuelName}
                </p>
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

export default Form4;