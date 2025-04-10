import React from 'react';
import './LogoutPopup.css';

function LogoutPopup({ onConfirm, onCancel }) {
  return (
    <div className="logout-popup-backdrop">
      <div className="logout-popup-box">
      <div className="popup-line" />
        <h3 className="logout-title">Are you sure you want to log out?</h3>
        <div className="popup-line" />
        <div className="logout-btns">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="confirm-btn" onClick={onConfirm}>Log Out</button>
        </div>
      </div>
    </div>
  );
}

export default LogoutPopup;
