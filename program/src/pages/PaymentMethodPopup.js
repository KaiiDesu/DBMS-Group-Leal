import React from 'react';
import './PaymentMethodPopup.css';
import gcashLogo from '../components/images/gcash-logo.png';
import codIcon from '../components/images/cod-icon.png';
import bankIcon from '../components/images/bank-icon.jpeg';

/**
 * Renders only the white panel content.
 * Backdrop & animation are handled by Cart.js
 */
export default function PaymentMethodPopup({
  selectedPayment,
  setSelectedPayment,
  onContinue,
  onClose
}) {
  const disabled = ['gcash', 'bank'];

  const select = (m) => {
    if (disabled.includes(m)) return;
    setSelectedPayment(m);
  };

  return (
    <div className="payment-popup-wrapper">
      <button className="corner-back-btn" onClick={onClose}>Go Back</button>

      <div className="payment-popup">
        <h3>Select payment method</h3>
        <p className="payment-subtext">Preferred method with secure transactions.</p>

        <div className="payment-options">
          <div className="payment-option disabled">
            <div className="payment-left">
              <img src={gcashLogo} alt="Gcash" className="payment-icon" />
              <span>Gcash</span>
            </div>
            <div className="payment-right">
              <span className="not-available">Not available</span>
            </div>
          </div>

          <div
            className={`payment-option ${selectedPayment === 'COD' ? 'selected' : ''}`}
            onClick={() => select('COD')}
          >
            <div className="payment-left">
              <img src={codIcon} alt="Cash on delivery" className="payment-icon" />
              <span>Cash on delivery</span>
            </div>
            <div className="payment-right">
              {selectedPayment === 'COD' && <span className="checkmark">✔</span>}
            </div>
          </div>

          <div className="payment-option disabled">
            <div className="payment-left">
              <img src={bankIcon} alt="Bank Transfer" className="payment-icon" />
              <span>Bank Transfer</span>
            </div>
            <div className="payment-right">
              <span className="not-available">Not available</span>
            </div>
          </div>
        </div>

        <div className="payment-actions-bottom">
          <button className="continue-btn" onClick={() => onContinue(selectedPayment)}>Continue</button>
        </div>
      </div>
    </div>
  );
}
