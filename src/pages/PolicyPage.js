import React from 'react';
import './PolicyPage.css';
import { useNavigate } from 'react-router-dom';


const PolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-container">
        <div className="header">
      <button className="back-btn" onClick={() => navigate(-1)}>&lt; Back</button>
      <h1>Terms and Conditions</h1>
    </div>
      <button>
        <h2>1. Age Restriction</h2>
        <p>You must be 21 years or older to use Vape Bureau PH. We strictly enforce age verification and require valid identification for all users.</p>
      </button>

      <button>
        <h2>2. ID Verification</h2>
        <p>Users must upload a valid government-issued ID to verify their age. Orders will not be processed until verification is complete.</p>
      </button>

      <button onClick={() => navigate('/policy/refund')}>

        <h2>3. Refund Policy</h2>
        <p>Refunds are only applicable for defective or incorrect products received. To be eligible, you must contact us within 3 days of delivery.</p>
      </button>

      <button onClick={() => navigate('/policy/privacy')}>
        <h2>4. Privacy Policy</h2>
        <p>We value your privacy. Your data is securely stored and will never be shared with third parties without consent.</p>
      </button>

      <button>
        <h2>5. Shipping & Delivery</h2>
        <p>Delivery is available nationwide. Standard shipping fees apply. Orders are processed within 1-2 business days after verification.</p>
      </button>
    </div>
  );
};

export default PolicyPage;
