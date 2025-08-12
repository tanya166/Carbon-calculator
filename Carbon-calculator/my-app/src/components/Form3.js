import React, { useState, useEffect } from "react";
import './Form3.css';
import { authUtils } from '../utils/auth';

const Form3 = () => {
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('mi');
  const [vehicleModelId, setVehicleModelId] = useState('');
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vehicleMakes, setVehicleMakes] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const API_KEY = 'HezNqwNiVlOAVbxVDAUtQg';
  const BASE_URL = 'https://www.carboninterface.com/api/v1';

  useEffect(() => {
    const token = sessionStorage.getItem('authToken'); 
    setIsLoggedIn(!!token);
  }, []);
  useEffect(() => {
    const fetchVehicleMakes = async () => {
      setLoadingMakes(true);
      try {
        const response = await fetch(`${BASE_URL}/vehicle_makes`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const makes = await response.json();
          console.log('Vehicle makes response:', makes);
          setVehicleMakes(makes);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch vehicle makes:', errorText);
          setError('Failed to load vehicle makes. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching vehicle makes:', error);
        setError('Error loading vehicle makes. Please check your connection.');
      } finally {
        setLoadingMakes(false);
      }
    };

    fetchVehicleMakes();
  }, [API_KEY, BASE_URL]);
const saveToDatabase = async (formData, carbonFootprint) => {
  try {
    const payload = {
      formType: 'car',
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


  const handleMakeChange = async (makeId) => {
    setSelectedMake(makeId);
    setVehicleModelId(''); 
    setVehicleModels([]);
    
    if (!makeId) return;

    setLoadingModels(true);
    try {
      const response = await fetch(`${BASE_URL}/vehicle_makes/${makeId}/vehicle_models`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const models = await response.json();
        console.log('Vehicle models response:', models);
        setVehicleModels(models);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch vehicle models:', errorText);
        setError('Failed to load vehicle models. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching vehicle models:', error);
      setError('Error loading vehicle models. Please check your connection.');
    } finally {
      setLoadingModels(false);
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    
    if (!distance || !vehicleModelId) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    console.log('Calculating carbon footprint with:', {
      distance,
      distanceUnit,
      vehicleModelId
    });

    try {
      const requestBody = {
        type: 'vehicle',
        distance_unit: distanceUnit,
        distance_value: parseFloat(distance),
        vehicle_model_id: vehicleModelId
      };

      console.log('Request body:', requestBody);

      const response = await fetch(`${BASE_URL}/estimates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Estimate response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Estimate API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      console.log('Carbon estimate response:', data);
      
      if (data.data && data.data.attributes && data.data.attributes.carbon_kg) {
        const carbonKg = data.data.attributes.carbon_kg;
        const finalFootprint = parseFloat(carbonKg.toFixed(2));
        
        setCarbonFootprint(finalFootprint);
        const selectedVehicleInfo = vehicleModels.find(
          model => model.data.id === vehicleModelId
        );
        if (isLoggedIn && selectedVehicleInfo) {
          await saveToDatabase({
            distance: parseFloat(distance),
            distanceUnit: distanceUnit,
            vehicleMake: selectedVehicleInfo.data.attributes.vehicle_make,
            vehicleModel: selectedVehicleInfo.data.attributes.name,
            vehicleYear: selectedVehicleInfo.data.attributes.year,
            vehicleModelId: vehicleModelId
          }, finalFootprint);
        }

        setShowModal(true);
      } else {
        throw new Error('Unexpected response format from estimates API');
      }
      
    } catch (err) {
      console.error('Calculate API Error:', err);
      setError(`Error calculating carbon footprint: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const selectedVehicleInfo = vehicleModels.find(
    model => model.data.id === vehicleModelId
  );

  return (
    <div className="car-footprint-container">
      <div className="car-footprint-card">
        <div className="car-footprint-header">
          <h3>Calculate your carbon footprint for Car</h3>
          <p className="car-footprint-subtitle">Calculate your vehicle's environmental impact</p>
        </div>
        
        {isLoggedIn && (
          <div className="car-footprint-status success">
            <span className="car-footprint-icon">✓</span>
            <span className="car-footprint-text">Your calculations will be saved to your account</span>
          </div>
        )}
        
        {!isLoggedIn && (
          <div className="car-footprint-status warning">
            <span className="car-footprint-icon">⚠</span>
            <span className="car-footprint-text">Login to save your calculations and view history</span>
          </div>
        )}

        <form className="car-footprint-form" onSubmit={handleCalculate}>

          <div className="car-footprint-section">
            <div className="section-title">
                <span className="emoji">🚗</span>
                Distance Travelled
              </div>
            <div className="car-footprint-group">
              <label>Distance Travelled: *</label>
              <div className="car-distance-container">
                <div className="car-distance-input">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Enter distance"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    required
                  />
                </div>
                <div className="car-distance-unit">
                  <select 
                    value={distanceUnit} 
                    onChange={(e) => setDistanceUnit(e.target.value)}
                  >
                    <option value="mi">Miles</option>
                    <option value="km">Kilometers</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="car-footprint-section">
            <div className="section-title">
                <span className="emoji">🚗</span>
              Vehicle Information
              </div>
            <div className="car-footprint-group">
              <label>Vehicle Make: *</label>
              {loadingMakes ? (
                <div className="car-loading-text">Loading vehicle makes...</div>
              ) : (
                <select 
                  value={selectedMake}
                  onChange={(e) => handleMakeChange(e.target.value)}
                  required
                >
                  <option value="">Select a vehicle make</option>
                  {vehicleMakes.map((make) => (
                    <option key={make.data.id} value={make.data.id}>
                      {make.data.attributes.name} ({make.data.attributes.number_of_models} models)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="car-footprint-group">
              <label>Vehicle Model: *</label>
              {loadingModels ? (
                <div className="car-loading-text">Loading vehicle models...</div>
              ) : (
                <select 
                  value={vehicleModelId}
                  onChange={(e) => setVehicleModelId(e.target.value)}
                  required
                  disabled={!selectedMake || vehicleModels.length === 0}
                >
                  <option value="">
                    {selectedMake ? 'Select a vehicle model' : 'Please select a make first'}
                  </option>
                  {vehicleModels.map((model) => (
                    <option key={model.data.id} value={model.data.id}>
                      {model.data.attributes.name} ({model.data.attributes.year})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {error && (
            <div className="car-footprint-error">
              <strong>Error:</strong> {error}
              <br />
              <small>Check the browser console for more details.</small>
            </div>
          )}

          <button 
            type="submit" 
            className="car-footprint-submit"
            disabled={loading || loadingMakes || loadingModels || !vehicleModelId}
          >
            {loading ? 'Calculating...' : 'Calculate Footprint'}
          </button>
        </form>

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <button className="close" onClick={closeModal}>&times;</button>
              
              <div className="inside-content">
                <div className="modal-icon">🚗</div>
                <h2 className="result-text">Car Carbon Footprint Result</h2>
                
                <div className="result-display">
                  <p className="result-text1">Your vehicle carbon footprint:</p>
                  <p className="result-value">{carbonFootprint} kg CO2e</p>
                  <p className="result-text1">Distance: {distance} {distanceUnit}</p>
                  {selectedVehicleInfo && (
                    <p className="result-text1">
                      Vehicle: {selectedVehicleInfo.data.attributes.vehicle_make} {selectedVehicleInfo.data.attributes.name} ({selectedVehicleInfo.data.attributes.year})
                    </p>
                  )}
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
    </div>
  );
};

export default Form3;