import React from 'react';
import '../PolicyPage.css';
import { useNavigate } from 'react-router-dom';

const IDVerPolicy = () => {
  const navigate = useNavigate();

return (
    <div className="policy-container">
        <div className="header">
            <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
            <h1>ID Verification</h1>
        </div>
        <section>
            <h2>IDs Accepted</h2>
            <p>
                <ul>
                    - National ID<br/>
                    - Driver License<br/>
                    - Passport ID (Philippine)<br/>
                    - Postal ID<br/>
                    - UMID (Unified Multi-Purpose ID)<br/>
                    - Voters ID

                    </ul>
            </p><br/>
            <h2>ID Requirements</h2>
            <p>
                National ID (PhilSys)<br/>
                <ul>
                    
<strong>Camera Angle:</strong> Flat and directly above; entire front and back must be visible.<br/>
<strong>Lighting:</strong> Bright, even lighting; no shadows or glare, especially on holograms.<br/>
<strong>Background:</strong> Plain, contrasting background (white or black).<br/>
<strong>Image Clarity:</strong> Must clearly show name, birthdate, QR code, serial number.<br/>
<strong>Other Tips:</strong> Both front and back images required; don’t crop out any data.<br/>

                </ul>
            </p>

            <p>
                Driver’s License<br/>
                <ul>
                    
<strong>Camera Angle:</strong> Front-facing, horizontal capture for both sides.<br/>
<strong>Lighting:</strong> No reflection on plastic; avoid flash.<br/>
<strong>Background:</strong> Light, solid surface for contrast.<br/>
<strong>Image Clarity:</strong>  Must show photo, license number, expiration, restrictions.<br/>

                </ul>
            </p>

                        <p>
                Passport<br/>
                <ul>
                    
<strong>Camera Angle:</strong> Flat, full page visible, especially machine-readable zone (MRZ).<br/>
<strong>Lighting:</strong> Uniform lighting; avoid shadow near the photo and MRZ.<br/>
<strong>Background:</strong> Clean, light background; no other objects visible.<br/>
<strong>Image Clarity:</strong> Text and photo must be sharp; signature page required.<br/>
<strong>Other Tips:</strong> Keep the page flat (don’t let it curl or bend).<br/>

                </ul>
            </p>

                                    <p>
                Postal ID<br/>
                <ul>
                    
<strong>Camera Angle:</strong> Front side straight-on.<br/>
<strong>Lighting:</strong> Even light to reveal QR code, no flash glare.<br/>
<strong>Background:</strong> Preferably a dark or white plain surface.<br/>
<strong>Image Clarity:</strong> Clearly show photo, birthdate, and postal reference number.<br/>
<strong>Other Tips:</strong> Some ask for barcode scanability, so avoid blur.<br/>

                </ul>
            </p>

                                    <p>
                UMID<br/>
                <ul>
                    
<strong>Camera Angle:</strong>  Horizontal, front-facing image.<br/>
<strong>Lighting:</strong> Bright, especially for showing microchips if visible.<br/>
<strong>Background:</strong> Solid, neutral color.<br/>
<strong>Image Clarity:</strong>  All personal info (CRN, name, address) must be readable.<br/>
<strong>Other Tips:</strong> Keep cards clean; fingerprints or smudges can cause rejection.<br/>

                </ul>
            </p>

                                    <p>
                Voter's ID<br/>
                <ul>
                    
<strong>Camera Angle:</strong> Flat, horizontal capture.<br/>
<strong>Lighting:</strong> Soft lighting to capture both QR codes without reflection.<br/>
<strong>Background:</strong> Plain white or black surface.<br/>
<strong>Image Clarity:</strong> Name, VIN, precinct number, and signature must be visible.<br/>
<strong>Other Tips:</strong> Both front and back may be required for QR visibility.<br/>

                </ul>
            </p>
        </section>
    </div>
);
};

export default IDVerPolicy;
