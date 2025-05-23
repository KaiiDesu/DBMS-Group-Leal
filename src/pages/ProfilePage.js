import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import logo from '../pages/logovape.png';
import { supabase } from '../supabaseClient';

export default function ProfilePage() {
  const [image, setImage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [firstName, setFirstName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [lastName, setLastName] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone_number, gender, birthdate, email')
        .eq('id', user.id)
        .single();

        if (data) {
          // display the existing name
          setFirstName(data.first_name || '');
          setLastName (data.last_name   || '');
    
          // ALWAYS start the inputs blank on mount
          setNameInput('');
          setLastNameInput('');

    
          // if you want phone/gender/birthdate to keep their current values, leave these:
          setPhoneNumber(data.phone_number || '');
          setGender     (data.gender       || '');
          setBirthdate  (data.birthdate    || '');
    
          setEmail(data.email || '');
        }
    
    }

    loadProfile();
  }, []);

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!userId) return;
  
    // Directly update without any empty‐field validation
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: nameInput.trim(),
        last_name:  lastNameInput.trim(),
        phone_number: phoneNumber.trim(),
        gender,
        birthdate: birthdate.trim()
      })
      .eq('id', userId);
  
    if (error) {
      console.log('Update error:', error);
      alert('❌ Failed to update profile.');
    } else {
      alert('✅ Profile updated successfully!');
      // refresh the displayed name and then clear the inputs
      setFirstName(nameInput.trim());
      setLastName (lastNameInput.trim());
      setNameInput('');
      setLastNameInput('');
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <div className="left-section">
          <img src={logo} alt="Logo" className="profile-logo" />
          <span className="back-button" onClick={() => navigate('/shopfront')}>Home</span>
          <span> &gt; My Profile</span>
        </div>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <header className="card-header">
            <h2>My Profile</h2>
            <p>Manage and protect your account</p>
            <hr />
          </header>

          <div className="profile-content">
            {/* LEFT SIDE FORM */}
            <div className="profile-left">
              <p><strong>Name:</strong> {firstName} {lastName}</p>

              <label>
                First Name
                <input
                  type="text"
                  placeholder="Change First Name"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                />
              </label>

              <label>
                Last Name
                <input
                  type="text"
                  placeholder="Change Last Name"
                  value={lastNameInput}
                  onChange={e => setLastNameInput(e.target.value)}
                />
              </label>

              <label>
                Email
                <input type="email" value={email} disabled />
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  pattern="[0-9]{10,13}"
                  maxLength="13"
                  placeholder="Enter Phone Number"
                  value={phoneNumber}
                  onChange={e => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) setPhoneNumber(value);
                  }}
                  required
                />
              </label>

              <label>Gender</label>
              <div className="gender-options">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={gender === 'Male'}
                    onChange={e => setGender(e.target.value)}
                  /> Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={gender === 'Female'}
                    onChange={e => setGender(e.target.value)}
                  /> Female
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Others"
                    checked={gender === 'Others'}
                    onChange={e => setGender(e.target.value)}
                  /> Others
                </label>
              </div>

              <label>
                Date of Birth
                <input
                  type="date"
                  className="date-input"
                  value={birthdate}
                  onChange={e => setBirthdate(e.target.value)}
                />
              </label>

              <button className="save-btn" onClick={handleSave}>Save</button>
            </div>

            {/* VERTICAL DIVIDER */}
            <div className="profile-divider" />
          </div>
        </div>
      </div>
    </div>
  );
}
