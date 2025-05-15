import React, { useState, useEffect, useRef,} from 'react';
import './Login.css';
import logo from '../pages/logovape.png';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import Popup from '../components/Popup';
import { video } from 'framer-motion/client';
import Swal from 'sweetalert2';
import logos from '../components/images/21age.png'

function Login() {
  const [formType, setFormType] = useState('login');
  const [step, setStep] = useState(1);
  const [cooldown, setCooldown] = useState(0);
  const [redirectAfterPopup, setRedirectAfterPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [showCamera, setShowCamera] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [confirmCapture, setConfirmCapture] = useState(false);
  const [previewCaptured, setPreviewCaptured] = useState(false);
  const [idDetected, setIdDetected] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();
 const [showPassword, setShowPassword] = useState(false);
 const location = useLocation();
const queryParams = new URLSearchParams(location.search);
const prefilledEmail = queryParams.get('email') || '';


  const [formData, setFormData] = useState({
    email: prefilledEmail, password: '', firstName: '', lastName: '', phone: '', gender: '', birthdate: '',
    idUpload: null, otp: '', newPassword: '', confirmPassword: '', idType: '', idNumber: '',
    idFront: null, idBack: null, termsAgreed: false, infoConfirmed: false
  });

const showDisclaimer = () => {
  Swal.fire({
    title: 'DISCLAIMER',
    html: `
      <strong style="color:#e53935;">!!THIS SHOP ONLY ALLOWS 21+ YEARS OLD!!</strong><br><br>
      This site contains products only suitable for those aged 21 and over. 
      Please exit if you are underage.<br><br>
      By clicking accept, you confirm that you are of legal smoking age 
      and agree to our <a href="/terms" target="_blank">Terms and Conditions</a>.
    `,
    imageUrl: logos,
    imageWidth: 220,
    imageHeight: 200,
    imageAlt: '21+ Icon',
    showCancelButton: false,
    confirmButtonText: 'I Accept',
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: { popup: 'swal2-disclaimer' }
  });
};
useEffect(() => {
  showDisclaimer(); // show on page load

  const interval = setInterval(() => {
    showDisclaimer(); // repeat every 60 seconds
  }, 60000);

  return () => clearInterval(interval); // clean up
}, []);



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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setShowCamera(true);
      setIdDetected(false);
      setTimeout(() => {
        if (videoRef.current) {
          streamRef.current = stream;
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => console.error("Playback error:", err));
        }
      }, 100);
      setTimeout(() => setIdDetected(true), 5000);
    } catch (err) {
      console.error('Camera error:', err.name, err.message);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      canvas.toBlob(blob => {
        const newFile = new File([blob], 'captured-id.png', { type: 'image/png' });
        setPreviewImage(URL.createObjectURL(blob));
        setFormData(prev => ({ ...prev, idUpload: newFile }));
        setPreviewCaptured(true);
      });
    }
  };

  const retakePhoto = () => {
    setPreviewCaptured(false);
    setPreviewImage(null);
    startCamera();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, firstName, lastName, phone, idUpload, termsAgreed, infoConfirmed } = formData;
  
    if (formType === 'signup' && (!termsAgreed || !infoConfirmed)) {
      return alert("Please accept the terms and confirm the information.");
    }
  
if (formType === 'signup') {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) return alert('Signup failed: ' + signUpError.message);

    const userId = signUpData.user?.id || signUpData.session?.user?.id;
    if (!userId) return alert('Signup succeeded but no user ID found.');

  let frontUrl = '';
  let backUrl = '';

  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (!sessionData.session || sessionErr) {
    console.error('Session not active or error:', sessionErr);
    return alert('Session not active. Please login again.');
  }

  // ✅ Upload front ID
  if (formData.idFront) {
    if (!formData.idFront.type.startsWith('image/')) {
      return alert('Front ID must be an image file.');
    }
    if (formData.idFront.size > 5 * 1024 * 1024) {
      return alert('Front ID image is too large. Max size is 5MB.');
    }

    const { error: uploadFrontError } = await supabase.storage
      .from('iduploads')
      .upload(`ids/${userId}-front.png`, formData.idFront, {
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadFrontError) {
      console.error('Front ID upload error:', uploadFrontError);
      return alert('Front ID upload failed: ' + uploadFrontError.message);
    }

    frontUrl = supabase.storage
      .from('iduploads')
      .getPublicUrl(`ids/${userId}-front.png`).data.publicUrl;
  }

  // ✅ Upload back ID
  if (formData.idBack) {
    if (!formData.idBack.type.startsWith('image/')) {
      return alert('Back ID must be an image file.');
    }
    if (formData.idBack.size > 5 * 1024 * 1024) {
      return alert('Back ID image is too large. Max size is 5MB.');
    }

    const { error: uploadBackError } = await supabase.storage
      .from('iduploads')
      .upload(`ids/${userId}-back.png`, formData.idBack, {
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadBackError) {
      console.error('Back ID upload error:', uploadBackError);
      return alert('Back ID upload failed: ' + uploadBackError.message);
    }

    backUrl = supabase.storage
      .from('iduploads')
      .getPublicUrl(`ids/${userId}-back.png`).data.publicUrl;
  }

  // ✅ Insert into registree_requests
  const { error: registreeError } = await supabase.from('registree_requests').insert([{
    id: userId,
    first_name: formData.firstName,
    last_name: formData.lastName,
    email,
    phone_number: formData.phone,
    birthdate: formData.birthdate,
    gender: formData.gender,
    id_type: formData.idType,
    id_number: formData.idNumber,
    id_front_url: frontUrl,
    id_back_url: backUrl
  }]);

  if (registreeError) {
    console.error('Insert registree error:', registreeError);
    return alert('Failed to submit for verification: ' + registreeError.message);
  }

  await Swal.fire({
  title: 'Success!',
  text: 'Sign-up successful! Your ID has been submitted for review. You’ll receive an email once approved.',
  icon: 'success',
  confirmButtonText: 'Okay',
  customClass: { popup: 'swal2-login-success' }
});
  resetForm();
  return;
    } else {
      try {
        const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          await Swal.fire({
            title: 'Login Failed',
            text: error.message || 'Invalid credentials.',
            icon: 'error',
            confirmButtonText: 'Okay',
            customClass: { popup: 'swal2-login-error' }
          });
          return;
        }

        const user = authData.user;

        // Check if user exists in `profiles`
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profile || profileError) {
          const { data: pendingUser, error: pendingError } = await supabase
            .from('registree_requests')
            .select('*')
            .eq('id', user.id)
            .single();

          if (pendingUser && !pendingError) {
            await Swal.fire({
              title: 'Pending Verification',
              text: 'Your account is still under review. Please wait for approval.',
              icon: 'info',
              confirmButtonText: 'Okay',
              customClass: { popup: 'swal2-login-info' }
            });
            return;
          }

          await Swal.fire({
            title: 'Access Denied',
            text: 'This is not a customer account.',
            icon: 'error',
            confirmButtonText: 'Okay',
            customClass: { popup: 'swal2-login-error' }
          });
          return;
        }

        await Swal.fire({
          title: 'Login Successful!',
          text: 'Welcome back to Vape Bureau!',
          icon: 'success',
          confirmButtonText: 'Continue',
          customClass: { popup: 'swal2-login-success' }
        });

        navigate('/shopfront');

      } catch (err) {
        await Swal.fire({
          title: 'Unexpected Error',
          text: err.message || 'Something went wrong.',
          icon: 'error',
          confirmButtonText: 'Okay',
          customClass: { popup: 'swal2-login-error' }
        });
      }
      }
    };
    return (
        <>
{showCamera && (
  <div className="camera-popup">
    <div className="camera-popup-modal">
      {!previewCaptured ? (
        <>
        <div className="camera-frame-overlay"
        />
          <video ref={videoRef} autoPlay playsInline muted
            style={{
              width: '100%',
              maxHeight: '300px',
              background: '#000',
              borderRadius: '8px',
              marginBottom: '16px',
              transform: 'scaleX(-1)'
            }}
          />
          <div className="camera-btns">
            <button onClick={capturePhoto}>Capture</button>
            <button onClick={() => setShowCamera(false)}>Cancel</button>
          </div>
        </>
      ) : (
        <>
        
          <img src={previewImage} alt="Captured Preview"
            style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }}
          />
        </>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  </div>
)}


 
      {confirmCapture && previewImage && (
        <div className="camera-preview-modal">
          <img src={previewImage} alt="Captured ID Preview" />
          <button onClick={() => setConfirmCapture(false)}>Send Photo</button>
        </div>
      )}

      <div className="login-container">
        <a href="/"><img src={logo} alt="Logo" className="login-logo" /></a>
        

        <form onSubmit={handleSubmit} className="login-form">
          <p className="switch-text">
            {formType === 'signup' ? 'Have an account? ' : "Don't have an account? "}
            <span onClick={() => switchForm(formType === 'signup' ? 'login' : 'signup')}>
              {formType === 'signup' ? 'Login' : 'Register'}
            </span>
          </p>

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
};

export default Login;