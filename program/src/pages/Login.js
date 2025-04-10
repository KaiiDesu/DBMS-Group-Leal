import React, { useState, useEffect } from 'react';
import './Login.css';
import logo from '../pages/logovape.png';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Popup from '../components/Popup';

function Login() {
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
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  useEffect(() => {
    if (redirectAfterPopup && !popupMsg) {
      window.location.href = '/shopfront';
    }
  }, [popupMsg, redirectAfterPopup]);

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

  const toggleForm = () => {
    resetForm();
    setFormType(formType === 'signup' ? 'login' : 'signup');
  };

  const handleForgotFlow = async (e) => {
    e.preventDefault();
    const { email, otp, newPassword, confirmPassword } = formData;

    if (step === 1) {
      const { data: customer, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (checkError || !customer) {
        return setPopupMsg('This email does not belong to a registered customer account.');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return setPopupMsg('Error sending reset email: ' + error.message);

      setStep(2);
      setCooldown(30);
    } else if (step === 2) {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });
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
        options: { data: { first_name: firstName, last_name: lastName } }
      });

      if (signUpError) return alert('Signup failed: ' + signUpError.message);
      const userId = signUpData.user?.id || signUpData.session?.user?.id;
      if (!userId) {
        alert('Signup successful but user ID not found. Check your email.');
        return resetForm();
      }

      const { error: profileError } = await supabase.from('profiles').insert([
        { id: userId, first_name: firstName, last_name: lastName, email }
      ]);

      if (profileError) {
        console.error('Profile insert error:', profileError);
        alert('Signup succeeded but profile save failed.');
      } else {
        setPopupMsg('Signup successful! Check your email.');
      }

      resetForm();
    } else {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return alert('Login failed: ' + error.message);

      const user = authData.user;
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || profileError) {
        setPopupMsg('This is not a customer account.');
        return;
      }

      setPopupMsg('Login successful!');
      setRedirectAfterPopup(true);
      resetForm();
    }
  };

  const handleOTPInput = (e, index) => {
    const value = e.target.value.replace(/\D/g, '');
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    setFormData({ ...formData, otp: updated.join('') });

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOTPKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const updated = Array(6).fill('');
    paste.forEach((val, idx) => updated[idx] = val);
    setOtpDigits(updated);
    setFormData({ ...formData, otp: updated.join('') });

    const lastIndex = paste.length - 1;
    const lastInput = document.getElementById(`otp-${lastIndex}`);
    if (lastInput) lastInput.focus();
  };

  return (
    <div className="login-container">
      <div className="seller-redirect">
        <button onClick={() => navigate('/seller-login')}>Seller?</button>
      </div>

      <img src={logo} alt="Logo" className="login-logo" />

      {popupMsg && (
        <Popup
          message={popupMsg}
          onClose={() => setPopupMsg('')}
          buttonText={redirectAfterPopup ? 'Continue to Shop' : 'Close'}
        />
      )}

      <form onSubmit={formType === 'forgot' ? handleForgotFlow : handleSubmit} className="login-form">
        <p className="switch-text">
          {formType === 'signup' ? 'Have an account? ' : formType === 'forgot' ? 'Back to ' : "Don't have an account? "}
          <span onClick={toggleForm}>
            {formType === 'signup' ? 'Login' : formType === 'forgot' ? 'Login' : 'Register'}
          </span>
        </p>

        <h2>
          {formType === 'signup'
            ? 'Sign Up'
            : formType === 'login'
            ? 'Login'
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

        {/* You can insert the OTP and forgot password steps here if needed */}

        {formType === 'login' && (
          <p className="forgot-text">
            <span onClick={() => {
              resetForm();
              setFormType('forgot');
            }}>
              Forgot password?
            </span>
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

export default Login;
