import React from 'react';
import './RefundPolicy.css';
import { useNavigate } from 'react-router-dom';

const RefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-container">
        <div className="header">
      <button className="back-btn" onClick={() => navigate(-1)}>&lt; Back</button>
      <h1>Refund Policy</h1>
    </div>
      <section>
        <h2> Refunds (Change of Mind / Wrong Item)</h2>
        <p>
          <ul>
          - Customers with item refund requests have a 24 hour time frame to claim their items after delivery. <br/>
          - Items must be in original unopened condition, and with complete packaging.<br/>
          - Shipping costs of returns are to be paid by the buyer unless it's an error on our part.<br/>
        </ul>
        </p>

        <h2>Damage or Broken Items</h2>
        <p>
          In the event that an item is damaged from the start, we will require you to provide a clear unboxing video showing that the item 
          was never used prior to applying for an unboxing video, for the package. The video must:
          <ul>
            - Capture the undamaged package.<br/>
            - Capture all parts of the unsealing/unboxing procedure.<br/>
            - Display the damaged or broken section immediately once the unboxing is done.<br/>
            - Without complete and clear unboxing video we will not process claims for return or refund for damage.
          </ul>
        </p>

        <h2>Non-Returnable Conditions</h2>
        <p>
          <ul>
            - Items returned without video proof of damage.<br/>
            - Used, altered, and incomplete items<br/>
            Claims made after 24 hours of post delivery<br/>
            <br/>

            For refund complains, kindly proceed to <a href="#/refund">Refund Page</a> 

          </ul>
        </p>
      </section>
    </div>
  );
};

export default RefundPolicy;
