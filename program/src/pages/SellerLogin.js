import React, { useState, useEffect } from 'react';
import './Login.css';
import logo from '../pages/logovape.png';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function SellerLogin() {
  const [formType, setFormType] = useState('login');
  const [step, setStep] = useState(1);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

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

  const toggleForm = () => {
    resetForm();
    setFormType(formType === 'signup' ? 'login' : 'signup');
  };

  const handleForgotFlow = async (e) => {
    e.preventDefault();
    const { email, otp, newPassword, confirmPassword } = formData;

    if (step === 1) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return alert('Error sending reset email: ' + error.message);
      setStep(2);
      setCooldown(30);
    } else if (step === 2) {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) return alert('Invalid or expired code');
      setStep(3);
    } else if (step === 3) {
      if (newPassword !== confirmPassword) return alert("Passwords don't match.");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return alert('Failed to update password: ' + error.message);
      alert('Password successfully updated!');
      setFormType('login');
      resetForm();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, firstName, lastName } = formData;
  
    if (formType === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin, // optional redirect
          data: { first_name: firstName, last_name: lastName }
        }
      });
  
      if (signUpError) return alert('Signup failed: ' + signUpError.message);
  
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userId = session.user.id;
  
          const { error: sellerError } = await supabase.from('sellers').insert([
            {
              id: userId,
              email,
              first_name: firstName,
              last_name: lastName
            }
          ]);
  
          if (sellerError) {
            console.error('Seller insert error:', sellerError);
            alert('Signup succeeded but seller profile save failed.');
          } else {
            alert('Signup successful! Please check your email.');
          }
  
          listener?.subscription?.unsubscribe(); // Clean up the listener
        }
      });
  
      resetForm();
    } else {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return alert('Login failed: ' + error.message);
  
      const user = authData.user;
      const { data: seller, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', user.id)
        .single();
  
      if (!seller || sellerError) {
        alert('This is not a seller account.');
        return;
      }
  
      alert('Login successful!');
      resetForm();
      window.location.href = '/seller-dashboard';
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
      <div className="seller-redirect">
        <button onClick={() => navigate('/login')}>Customer?</button>
      </div>

      <img src={logo} alt="Logo" className="login-logo" />
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
              <div className="otp-icon">
                <img src="./senticon.png" alt="Send" />
              </div>
              <h2>OTP Verification</h2>
              <p className="otp-subtitle">Enter the verification code we just sent to your email address</p>
            </div>

            <div className="otp-wrapper">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength="1"
                  className="otp-box"
                  value={otpDigits[i]}
                  onChange={(e) => handleOTPInput(e, i)}
                  onKeyDown={(e) => handleOTPKeyDown(e, i)}
                  onPaste={handleOTPPaste}
                  autoComplete="off"
                />
              ))}
            </div>

            <p className="resend-text">
              Didn’t receive the email? Check spam.{' '}
              <span className="resend-link"
                onClick={async () => {
                  if (cooldown > 0) return alert(`Resend failed: wait ${cooldown}s`);
                  const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
                  if (error) return alert("Resend failed: " + error.message);
                  setCooldown(30);
                  alert("Reset email resent!");
                }}
              >Resend</span>
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

export default SellerLogin;
