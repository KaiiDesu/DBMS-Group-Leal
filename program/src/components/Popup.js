import React from 'react';
import './Popup.css';

function Popup({ message, onClose }) {
  return (
    <div className="custom-popup-overlay">
      <div className="custom-popup">
        <div className="popup-message-box">
          <div className="popup-line" />
          <h2 className="popup-message">{message}</h2>
          <div className="popup-line" />
        </div>
        <button className="popup-button" onClick={onClose}>Okay!</button>
      </div>
    </div>
  );
}

export default Popup;
