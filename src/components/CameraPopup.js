// CameraPopup.js
import React, { useRef, useState } from 'react';
import './CameraPopup.css';

const CameraPopup = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const capturePhoto = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 320, 240);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setPhoto(dataUrl);
    setShowConfirm(true);
    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
  };

  const confirmSend = () => {
    fetch(photo)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'captured_id.png', { type: 'image/png' });
        onCapture(file);
        onClose();
      });
  };

  return (
    <div className="camera-backdrop">
      <div className="camera-modal">
        {!photo ? (
          <>
            <video ref={videoRef} width="320" height="240" autoPlay playsInline />
            <button onClick={capturePhoto}>Capture</button>
            <button onClick={onClose}>Cancel</button>
            {startCamera()}
          </>
        ) : (
          <>
            <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />
            <img src={photo} alt="Captured" style={{ width: '100%' }} />
            {showConfirm && (
              <div className="confirm-popup">
                <p>Send this photo?</p>
                <button onClick={confirmSend}>Send Photo</button>
                <button onClick={onClose}>Retake</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CameraPopup;
