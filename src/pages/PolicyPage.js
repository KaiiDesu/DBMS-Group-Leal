import React from 'react';
import './PolicyPage.css';
import { useNavigate } from 'react-router-dom';


const PolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-container">
        <div className="header">
      <button className="back-btn" onClick={() => { if (window.history.length > 2) { navigate(-1);
    } else {
      // fallback route when user opens /policy directly
      navigate('/shopfront'); // or '/login' depending on your preferred default
    }
  }}
>
  &lt; Back
</button>
      <h1>Terms and Conditions</h1>
    </div>
      <button onClick={() => navigate('/policy/legalities')}>
        <h2>Legalities</h2>
        <p>You must be 21 years or older to use Vape Bureau PH. We strictly enforce age verification and require valid identification for all users.</p>
      </button>

      <button onClick={() => navigate('/policy/idver')}>
        <h2>ID Verification</h2>
        <p>Users must upload a valid government-issued ID to verify their age. Orders will not be processed until verification is complete.</p>
      </button>

      <button onClick={() => navigate('/policy/refund')}>

        <h2>Refund Policy</h2>
        <p>Refunds are only applicable for defective or incorrect products received. To be eligible, you must contact us within 3 days of delivery.</p>
      </button>

      <button onClick={() => navigate('/policy/privacy')}>
        <h2>Privacy Policy</h2>
        <p>We value your privacy. Your data is securely stored and will never be shared with third parties without consent.</p>
      </button>

      <button>
        <h2>Shipping & Delivery</h2>
        <p>Delivery is available nationwide. Standard shipping fees apply. Orders are processed within 1-2 business days after verification.</p>
      </button>
    </div>
  );
};

export default PolicyPage;
