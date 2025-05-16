import React from 'react';
import './LegalitiesPolicy.css';
import { useNavigate } from 'react-router-dom';

const LegalitiesPolicy = () => {
  const navigate = useNavigate();

return (
    <div className="policy-container">
        <div className="header">
            <button className="back-btn" onClick={() => navigate(-1)}>&lt; Back</button>
            <h1>Legalities</h1>
        </div>
        <section>
            <h2>Legalities</h2>
            <p>
                Verify that selling vape and smoking products through online abides with the following:
            </p><br/>
            <strong><i>RA 11467</i></strong>
            <p>
                <ul>
                    - Regulates the e-cigarettes and heated tobacco
                </ul>
            </p>
            <br/>

            <strong><i>RA 11900</i></strong>
            <p>
                <ul>
                    - Regulates vaporized nicotine and non-nicotine products, including sales and age restrictions. <br/>
                    - Seller must not sell to individuals who’s under 21 years old.<br/>
                    - IDs must be verified prior to checkout.<br/>
                    - Online Platforms must clearly show age restrictions and warnings.<br/>
                    - No sales within 100 meters of school or playgrounds(it includes delivery drop-offs)<br/>
                </ul>
            </p>
            <br/>

            <h2>Valid ID</h2>

            <p>
                The following valid IDs are accepted are:<br/>
                <ul>
                    - National ID<br/>
                    - Driver License<br/>
                    - Passport ID (Philippine)<br/>
                    - Postal ID<br/>
                    - UMID (Unified Multi-Purpose ID)<br/>
                    - Voters ID<br/>
                </ul>
            </p>

        </section>
    </div>
);
};

export default LegalitiesPolicy;
