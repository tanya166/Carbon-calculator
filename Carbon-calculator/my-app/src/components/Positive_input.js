import React, { useState } from "react";
import './Positive_input.css';
function PositiveInput() {
  const [value, setValue] = useState('');
  const [hasError, setHasError] = useState(false); 

  const handleChange = (event) => {
    const newValue = event.target.value;
    const isPositiveNumber = /^\d+(\.\d+)?$/.test(newValue) || newValue === ''; 

    if (isPositiveNumber) {
      setValue(newValue);
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  const handleBlur = () => {
    if (value === '') {
      setHasError(true); 
    } else if (parseFloat(value) <= 0) {
      setHasError(true); 
    }
  };
  const errorMessage = 'Please enter a positive number.';

  return (
    <div className="numb">
      <input type="number"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        min="0"
        className={hasError ? 'error-input' : ''}
      />
      {hasError && <div className="error-msg">{errorMessage}</div>}
      
    </div>
  );
}

export default PositiveInput;
