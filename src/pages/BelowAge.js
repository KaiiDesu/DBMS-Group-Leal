import React from 'react';
import './BelowAge.css';

function BelowAge() {
  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="below-age-container">
      <div className="below-age-box">
        <div className="below-age-circle">21+</div>
        <h2 className="blinking-warning">!!UNDER AGE!!</h2>
        <p className="below-age-text">
          This site contains vape products and is restricted to those aged 21 and above.
          You have been identified as underage. For your safety, please exit the site immediately.
        </p>
        <button className="exit-btn" onClick={handleExit}>Exit Site</button>
      </div>
    </div>
  );
}

export default BelowAge;
