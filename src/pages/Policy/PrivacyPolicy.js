import React from 'react';
import '../PolicyPage.css';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-container">
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
        <h1>Privacy Policy</h1>
      </div>
      <section>
        <h2></h2>
        <p>
          Your privacy is of great importance to us. It will explain how we collect, use, and store the information provided by you while 
          using our website. You are also protected under the Data Privacy Act of 2012, which ensures the confidentiality, integrity, and 
          availability of your personal data.
        </p><br/>

        <h2>Information we Collect</h2>

        <p>The information we may collect when you visit or order from our website includes the following:
        <ul>
          - Full name <br />
          - Contact number <br />
          - Delivery address <br />
          - Email address <br />
          - Purchase history <br />  
          - Payment information (processed securely through third parties)
        </ul><br/>
        </p>

        <h2>Why We Collect Your Information</h2>
      <p>
        
          We use your data to:<br />
          <ul>

          - Process and deliver your orders. <br />
          - Сonfirm your age to comply with RA 11900.<br />
          - Provide customer support.<br />
          - Enhance our products and website experience.<br />
          - Send order updates and promotional offers only if opted in.<br /> 
        </ul>

        </p>

        <h2> How We Protect Your Data</h2>

        <p>
          Private information regarding an individual is kept in a secured location. It is meant only for the access of specific personnel.<br/>
          <ul>
          - We safely implement encryption, firewalls, and secure server hosting.<br/>
          - Payment data is not stored on our servers; all payments are handled by secure third-party processors.
          </ul>
        </p><br/>

        <h2>Sharing of Information</h2>
        <p>We have never and will never sell, trade, or rent your personal information. Your information can be shared exclusively with:  <br/>

          <ul>
          - Service providers of delivery for the purpose of completion of shipment  <br/>
          - Law enforcement and other government bodies when needed<br/>
          </ul>
        </p><br/>

        <h2>Cookies and Analytics </h2>

        <p>
          Our site might use cookies to: <br/>
        <ul>
        - Enhance navigational experience of the site <br/>
        - Monitor non-identifiable data for analytics <br/>
        - Modify your experience as a user on the website. <br/>
        - If you prefer, you may turn off cookies from the settings on your browser.<br/>
        </ul>
        </p><br/>
        

        <h2>Your Rights</h2>
        <p>
          As per the Data Privacy Act of 2012, you have the right to: <br/>
          <ul>
          - Gain access to your personal data <br/>
          - Modify your data <br/>
          - Revoke consent <br/>
          - Ask for deletion (without prejudice to our legal obligation to keep data) <br/>
          - To make use of any of these rights, please reach out to us using this <br/>
          <br/>
          </ul>

          

        <h2>Policy Updates</h2>
        <p>
          This policy may be changed without prior notification brought to your attention. The changes made will be published on this 
          page alongside the date which marks the new effective date. Contact us, If you have questions or concerns about your privacy, contact us at:

          <ul className="policy-contact">
            <strong>Email:</strong> <a href="mailto:VapeBureauPh@gmail.com">VapeBureauPh@gmail.com</a><br/>
            <strong>Phone:</strong> <a href="tel:09453202818">09453202818</a><br/>
            <strong>Address:</strong> <a href="https://www.google.com/maps?q=826+Matimyas+St.+Sampaloc+Manila" target="_blank" rel="noopener noreferrer">
            826 Matimyas St. Sampaloc Manila
            </a><br/>
          </ul>
        </p>

        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
