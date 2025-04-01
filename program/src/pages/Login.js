import React, { useState } from 'react';
import './Login.css';
import logo from '../pages/logovape.png';
import { supabase } from '../supabaseClient';

function Login() {
  const [formType, setFormType] = useState('signup');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleFormType = () => {
    resetForm(); // 👈 Reset input fields when toggling form type
    setFormType((prevType) => (prevType === 'signup' ? 'login' : 'signup'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, firstName, lastName } = formData;

    if (formType === 'signup') {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (signUpError) {
        alert('Signup failed: ' + signUpError.message);
        return;
      }

      const userId = signUpData.user?.id || signUpData.session?.user?.id;
      if (!userId) {
        alert('Signup successful but user ID not found. Please confirm your email.');
        resetForm();
        return;
      }

      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: userId,
          first_name: firstName,
          last_name: lastName,
          email: email
        }
      ]);

      if (profileError) {
        console.error('Error inserting profile:', profileError);
        alert('Signup succeeded but failed to save profile: ' + profileError.message);
      } else {
        alert('Signup successful! Please check your email to confirm your account.');
      }

      resetForm(); // ✅ clear fields after sign up
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        alert('Login failed: ' + loginError.message);
      } else {
        alert('Login successful!');
        resetForm(); // ✅ clear fields after login
        window.location.href = '/shopfront';
      }
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Logo" className="login-logo" />

      <form className="login-form" onSubmit={handleSubmit}>
        <p className="switch-text">
          {formType === 'signup' ? 'Have an account? ' : "Don't have an account? "}
          <span onClick={handleToggleFormType}>
            {formType === 'signup' ? 'Login' : 'Register'}
          </span>
        </p>

        <h2>{formType === 'signup' ? 'Sign Up' : 'Login'}</h2>

        {formType === 'signup' && (
          <div className="name-fields">
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="input-wrapper">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-wrapper">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">
          {formType === 'signup' ? 'Register' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
