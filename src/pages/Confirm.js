import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function Confirm() {
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();

  useEffect(() => {
    const completeSignup = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setMessage('No authenticated user found.');
        return;
      }

      const profileData = JSON.parse(localStorage.getItem('pendingProfile'));

      if (!profileData || profileData.id !== user.id) {
        setMessage('No saved profile data. Please register again.');
        return;
      }

      const { error: insertError } = await supabase.from('profiles').insert([profileData]);

      if (insertError) {
        setMessage('Email confirmed, but profile save failed.');
        console.error(insertError);
      } else {
        setMessage('Email confirmed and profile saved! Redirecting...');
        localStorage.removeItem('pendingProfile');
        setTimeout(() => navigate('/shopfront'), 2000);
      }
    };

    completeSignup();
  }, [navigate]);

  return (
    <div style={{ padding: '40px', fontSize: '1.5rem' }}>
      {message}
    </div>
  );
}

export default Confirm;
