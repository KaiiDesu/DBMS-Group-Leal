import React, { useState, useEffect, useRef } from 'react';
import './Login.css';
import logo from '../pages/logovape.png';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Popup from '../components/Popup';
import { video } from 'framer-motion/client';

function Login() {
  const [formType, setFormType] = useState('login');
  const [step, setStep] = useState(1);
  const [cooldown, setCooldown] = useState(0);
  const [redirectAfterPopup, setRedirectAfterPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [confirmCapture, setConfirmCapture] = useState(false);
  const [previewCaptured, setPreviewCaptured] = useState(false);
  const [idDetected, setIdDetected] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '', phone: '', gender: '', birthdate: '',
    idUpload: null, otp: '', newPassword: '', confirmPassword: '', idType: '', idNumber: '',
    idFront: null, idBack: null, termsAgreed: false, infoConfirmed: false
  });

  useEffect(() => {
    const accepted = sessionStorage.getItem('disclaimerAccepted');
    if (accepted) setShowDisclaimer(false);
    const interval = setInterval(() => setShowDisclaimer(true), 120000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptDisclaimer = () => {
    sessionStorage.setItem('disclaimerAccepted', 'true');
    setShowDisclaimer(false);
  };

  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  useEffect(() => {
    if (redirectAfterPopup && !popupMsg) {
      navigate('/shopfront');
    }
  }, [popupMsg, redirectAfterPopup]);

  const resetForm = () => {
    setFormData({
      email: '', password: '', firstName: '', lastName: '', phone: '', gender: '', birthdate: '',
      idUpload: null, otp: '', newPassword: '', confirmPassword: '',
      idType: '', idNumber: '', idFront: null, idBack: null, termsAgreed: false, infoConfirmed: false
    });
    setOtpDigits(['', '', '', '', '', '']);
    setStep(1);
    setCooldown(0);
    setPreviewImage(null);
    setConfirmCapture(false);
  };

  const switchForm = (type) => {
    resetForm();
    setFormType(type);
  };

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : files ? files[0] : value;
    setFormData({ ...formData, [name]: fieldValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, firstName, lastName, phone } = formData;

    if (formType === 'signup' && (!formData.termsAgreed || !formData.infoConfirmed)) {
      return alert("Please accept the terms and confirm the information.");
    }

    if (formType === 'signup') {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) return alert('Signup failed: ' + signUpError.message);

      const userId = signUpData.user?.id;
      if (!userId) return alert('Signup succeeded but no user ID found.');

      // Insert empty profile row to trigger later update
      await supabase.from('profiles').insert([{ id: userId, email }]);

      setPopupMsg('Signup successful! Please check your email to complete registration.');
      return;
    }

    if (formType === 'login') {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setPopupMsg('Login failed: ' + error.message);
      const user = authData.user;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || profileError) {
        let frontUrl = '';
        let backUrl = '';

        if (formData.idFront) {
          const { error } = await supabase.storage.from('iduploads').upload(`ids/${user.id}-front.png`, formData.idFront, { upsert: true });
          if (error) return alert('Front ID upload failed: ' + error.message);
          frontUrl = supabase.storage.from('iduploads').getPublicUrl(`ids/${user.id}-front.png`).data.publicUrl;
        }

        if (formData.idBack) {
          const { error } = await supabase.storage.from('iduploads').upload(`ids/${user.id}-back.png`, formData.idBack, { upsert: true });
          if (error) return alert('Back ID upload failed: ' + error.message);
          backUrl = supabase.storage.from('iduploads').getPublicUrl(`ids/${user.id}-back.png`).data.publicUrl;
        }

        const { error: updateError } = await supabase.from('profiles').update({
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
          id_front_url: frontUrl,
          id_back_url: backUrl,
          gender: formData.gender,
          birthdate: formData.birthdate,
          id_type: formData.idType,
          id_number: formData.idNumber
        }).eq('id', user.id);

        if (updateError) return alert('Profile update failed: ' + updateError.message);
      }

      setPopupMsg('Login successful!');
      setRedirectAfterPopup(true);
      resetForm();
    }
  };

  return <div className="login-container">
    <img src={logo} alt="Logo" className="login-logo" />
    {popupMsg && <Popup message={popupMsg} onClose={() => setPopupMsg('')} buttonText={redirectAfterPopup ? 'Continue' : 'Okay'} />}
    <form onSubmit={handleSubmit} className="login-form">
      <h2>{formType === 'signup' ? 'Sign Up' : 'Login'}</h2>

          {formType === 'signup' && (
            <>
              <div className="name-fields">
                <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} required />
                <input type="text" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} required />
              </div>
              <div className="input-wrapper">
                <input type="text" name="phone" placeholder="Phone number" value={formData.phone} onChange={handleChange} required />
              </div>
              
              <div className="input-wrapper">
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="input-wrapper">
                <label>Birthdate:</label>
                <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} required />
              </div>

              <div className="input-wrapper">
  <label htmlFor="idType">Select ID Type:</label>
  <select
    name="idType"
    value={formData.idType}
    onChange={handleChange}
    required
  >
    <option value="">-- Choose your ID --</option>
    <option value="Driver's License">Driver's License</option>
    <option value="Passport">Passport</option>
    <option value="PhilHealth ID">PhilHealth ID</option>
    <option value="SSS ID">SSS ID</option>
    <option value="UMID">UMID</option>
    <option value="Student ID">Student ID</option>
    <option value="National ID">National ID</option>
  </select>
</div>

              <div className="id-upload-section">
  <div className="id-upload-labels">
    <label>Photo of front ID</label>
    <label>Photo of back ID</label>
  </div>
  <div className="id-upload-grid">
    {[{ label: 'idFront', file: formData.idFront }, { label: 'idBack', file: formData.idBack }].map(({ label, file }) => (
      <div key={label} className="upload-box">
        {file ? (
          <>
            <img src={URL.createObjectURL(file)} alt="Preview" className="id-preview" />
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, [label]: null }))} className="retake-btn">Retake</button>
          </>
        ) : (
          <>
            <label htmlFor={label} className="upload-placeholder">
              <span className="plus-sign">+</span>
              <input type="file" name={label} id={label} accept="image/*" onChange={handleChange} hidden required />
            </label>
          </>
        )}
      </div>
    ))}
  </div>
</div>



            </>
          )}  



          <div className="input-wrapper">
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="input-wrapper">
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          </div>

          {formType === 'signup' && (
            <div className="terms-section">
  <p className="terms-text">
    *Review your personal information to ensure it is correct and complete. By clicking the checkbox,
    you confirm that the information you have provided is correct and complete.
  </p>
  <p className="terms-link">
    
      Click here to see the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms and Condition
    </a>
  </p>

  <label className="checkbox-line">
    <input
      type="checkbox"
      name="termsAgreed"
      checked={formData.termsAgreed}
      onChange={handleChange}
      required
    />
    <span className="checkmark">✔</span>
    I accept terms and condition.
  </label>

  <label className="checkbox-line">
    <input
      type="checkbox"
      name="infoConfirmed"
      checked={formData.infoConfirmed}
      onChange={handleChange}
      required
    />
    <span className="checkmark">✔</span>
    I confirm that the information I have provided is correct and complete.
  </label>
</div>

          )}
          

          <button type="submit">{formType === 'signup' ? 'Register' : 'Login'}</button>
        </form>
      </div>
    </>
  );
}

export default Login;
