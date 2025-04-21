// ModalUploadForm.js
import React from 'react';
import './ModalUploadForm.css';

function ModalUploadForm({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Basic Information</h3>
        
        <label className="upload-section">
          <span>Product image</span>
          <div className="image-upload-box">
            <span className="plus-icon">＋</span>
          </div>
        </label>

        <label className="form-label">
          Product name
          <input type="text" maxLength={100} className="form-input" />
        </label>

        <label className="form-label">
          Product description
          <textarea className="form-textarea" rows="5" />
        </label>

        <div className="form-actions">
          <button onClick={onClose} className="cancel-btn">Cancel</button>
          <button className="submit-btn">Upload</button>
        </div>
      </div>
    </div>
  );
}

export default ModalUploadForm;
