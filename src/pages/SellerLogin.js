import React, { useState, useEffect } from 'react';
import './Login.css';
import logo from '../pages/logovape.png';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Popup from '../components/Popup';
import Swal from 'sweetalert2';

function SellerLogin() {
  const [formType, setFormType] = useState('login');
  const [step, setStep] = useState(1);
  const [cooldown, setCooldown] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [popupMsg, setPopupMsg] = useState('');
  const [redirectAfterPopup, setRedirectAfterPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (seller) {
        navigate('/seller-dashboard');
      }
    }
  };

  checkSession();
}, []);

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
    setOtpDigits(['', '', '', '', '', '']);
    setStep(1);
    setCooldown(0);
  };

  
  const handleForgotFlow = async (e) => {
    e.preventDefault();
    const { email, otp, newPassword, confirmPassword } = formData;

    if (step === 1) {
      const { data: seller, error: checkError } = await supabase
        .from('sellers')
        .select('id')
        .eq('email', email)
        .single();

      if (checkError || !seller) return setPopupMsg('This email does not belong to a registered seller account.');

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return setPopupMsg('Error sending reset email: ' + error.message);

      setStep(2);
      setCooldown(30);
    } else if (step === 2) {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) return setPopupMsg('Invalid or expired code');
      setStep(3);
    } else if (step === 3) {
      if (newPassword !== confirmPassword) return setPopupMsg("Passwords don't match.");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return setPopupMsg('Failed to update password: ' + error.message);
      setPopupMsg('Password successfully updated!');
      setFormType('login');
      resetForm();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, firstName, lastName } = formData;
  
    if (formType === 'signup') {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName }
        }
      });
  
      if (signUpError) return setPopupMsg('Signup failed: ' + signUpError.message);
      const userId = signUpData.user?.id;
      if (!userId) return setPopupMsg('Signup succeeded but user ID not found.');
  
      const { error: insertError } = await supabase.from('sellers').insert([
        {
          id: userId,
          email,
          first_name: firstName,
          last_name: lastName
        }
      ]);
  
      if (insertError) return setPopupMsg('Seller profile insert failed: ' + insertError.message);
      setPopupMsg('Signup successful! You can now log in.');
      resetForm();
    } else {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
      Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: error.message || 'An unknown error occurred while trying to log in.'
       });
      return;
      }
  
      // ✅ Wait for session to load before accessing RLS-protected data
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) return setPopupMsg('Session error or not authenticated.');
  
      const userId = session.user.id;
  
      const { data: seller, error: sellerError } = await supabase
        .from('sellers')
        .select('id, email, first_name, last_name')
        .eq('id', userId)
        .single();
  
      if (!seller || sellerError) {
          Swal.fire({
          icon: 'error',
          title: 'Invalid Email',
          text: 'This email does not belong to a registered seller account.'
  });
      }
  
      Swal.fire({
      icon: 'success',
      title: 'Login successful!',
      showConfirmButton: true
}).then(() => navigate('/seller-dashboard'));
    }
  };
  

  const handlePopupClose = () => {
    setPopupMsg('');
    if (redirectAfterPopup) {
      navigate('/seller-dashboard');
    }
  };

  const handleOTPInput = (e, index) => {
    const value = e.target.value.replace(/\D/g, '');
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    setFormData({ ...formData, otp: updated.join('') });
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleOTPKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const updated = Array(6).fill('');
    paste.forEach((val, idx) => updated[idx] = val);
    setOtpDigits(updated);
    setFormData({ ...formData, otp: updated.join('') });
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Logo" className="login-logo" />
      {popupMsg && <Popup message={popupMsg} onClose={handlePopupClose} />}

      <form onSubmit={formType === 'forgot' ? handleForgotFlow : handleSubmit} className="login-form">
        <p className="switch-text">
          {formType === 'signup' ? 'Have an account? ' : formType === 'forgot' ? 'Back to ' : "Don't have an account? "}
          <span onClick={() => {
            resetForm();
            setFormType(formType === 'signup' ? 'login' : formType === 'forgot' ? 'login' : 'signup');
          }}>
            {formType === 'signup' ? 'Login' : formType === 'forgot' ? 'Login' : 'Register'}
          </span>
        </p>

        <h2>
          {formType === 'signup'
            ? 'Seller Sign Up'
            : formType === 'login'
            ? 'Seller Login'
            : 'Forgot Your Password?'}
        </h2>

        {formType === 'signup' && (
          <div className="name-fields">
            <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} required />
            <input type="text" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} required />
          </div>
        )}

        {(formType !== 'forgot' || step === 1) && (
          <div className="input-wrapper">
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          </div>
        )}

        {(formType === 'login' || formType === 'signup') && (
          <div className="input-wrapper">
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          </div>
        )}

        {formType === 'forgot' && step === 2 && (
          <>
            <div className="otp-header">
              <div className="otp-icon"><img src="./senticon.png" alt="Send Icon" /></div>
              <h2>OTP Verification</h2>
              <p className="otp-subtitle">Enter the verification code sent to your email</p>
            </div>

            <div className="otp-wrapper">
              {[...Array(6)].map((_, i) => (
                <input key={i} id={`otp-${i}`} type="text" maxLength="1" className="otp-box"
                  value={otpDigits[i]} onChange={(e) => handleOTPInput(e, i)}
                  onKeyDown={(e) => handleOTPKeyDown(e, i)} onPaste={handleOTPPaste} autoComplete="off" />
              ))}
            </div>

            <p className="resend-text">
              Didn’t receive the email?{' '}
              <span className="resend-link" onClick={async () => {
                if (cooldown > 0) return setPopupMsg(`Resend failed: wait ${cooldown}s`);
                const { data: seller, error: checkError } = await supabase
                  .from('sellers').select('id').eq('email', formData.email).single();
                if (checkError || !seller) return setPopupMsg('This fdoes not belong to a registered seller account.');
                const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
                if (error) return setPopupMsg("Resend failed: " + error.message);
                setCooldown(30);
                setPopupMsg("Reset email resent!");
              }}>Resend</span>
            </p>
          </>
        )}

        {formType === 'forgot' && step === 3 && (
          <>
            <div className="input-wrapper">
              <input type="password" name="newPassword" placeholder="New Password" value={formData.newPassword} onChange={handleChange} required />
            </div>
            <div className="input-wrapper">
              <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </>
        )}

        {formType === 'login' && (
          <p className="forgot-text">
            <span onClick={() => {
              resetForm();
              setFormType('forgot');
            }}>Forgot password?</span>
          </p>
        )}

        <button type="submit">
          {formType === 'signup'
            ? 'Register'
            : formType === 'login'
            ? 'Login'
            : step === 1
            ? 'Send Email'
            : step === 2
            ? `Verify Code ${cooldown > 0 ? `(${cooldown})` : ''}`
            : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

export default SellerLogin;
