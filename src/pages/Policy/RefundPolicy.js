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
<br/>
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
<br/>
        <h2>Non-Returnable Conditions</h2>
        <p>
          <ul>
            - Items returned without video proof of damage.<br/>
            - Used, altered, and incomplete items<br/>
            - Claims made after 24 hours of post delivery<br/>
            <br/>
          </ul>
          <h2>Refund Process</h2>
          <p>
            <ul>
              <strong>Inspection:</strong> Returned items will be inspected upon receipt.<br/>
             <strong>Refund Method:</strong> Refunds will be issued to the original payment method.<br/>
              <strong>Processing Time:</strong> Please allow 7-10 business days for the refund to be processed after the return is received.</ul>
          </p>
<br/>
          <h2>Non Returnable Items</h2>
          <p>
            The following items are non-returnable:
            <ul>
              <strong>E-liquids:</strong> Once opened, for health and safety reasons.<br/>
              <strong>Coils, Pods, and Cartridges:</strong> Opened or used items.<br/>
              <strong>Batteries:</strong> For safety and hygiene reasons.<br/>
              <strong>Promotional Items:</strong> Final sale unless defective.<br/>
            </ul>

          </p>
<br/>
          <h2>Return Exception</h2>
          <p>
             If you receive a product that is defective or damaged:
             <ul>
                <strong>Notification:</strong> Contact us within 48 hours of delivery.<br/>
                <strong>Defective/Damaged Products:</strong> We will verify the defect or damage.<br/>
                <strong>Resolution:</strong> We will offer a replacement or refund, depending on the situation. 
             </ul>
          </p>
<br/>
          <h2>Return Shipping</h2>
          <p>
            <ul>
              <strong>Customer Responsibility:</strong> Return shipping costs are the responsibility of the customer unless the return is 
              due to a defective or incorrect item.<br/>
              <strong>Shipping Charges:</strong> Original shipping fees are non-refundable.
            </ul>
<br/>
            For refund complains, kindly proceed to <i><a href="#/refund">Refund Page</a> </i>
          </p>
        </p>
      </section>
    </div>
  );
};

export default RefundPolicy;
