// Inside Shopfront.js or as a new component
import React from 'react';
import './ContactSection.css';
import { useNavigate } from 'react-router-dom';

const ContactSection = () => {

  const navigate = useNavigate();

  return (
    <div className="contact-container">
      <h2 className="contact-title">Contacts</h2>
      <p className="contact-subtitle">
        Have questions, feedback, or need assistance? Our team is here to help! Whether you're inquiring about our services,
        want to collaborate, or just want to say hello — don’t hesitate to reach out.
      </p>

      <div className="contact-grid">
        <div className="contact-item">
          <span className="icon">🏠</span>
          <p>826 Matimyas St. Sampaloc Manila</p>
        </div>

        <div className="contact-item">
          <span className="icon">📞</span>
          <p>09453202818</p>
        </div>

        <div className="contact-item">
          <span className="icon">📧</span>
          <p>VapeBureauPh@gmail.com</p>
        </div>

        <div className="contact-item">
          <span className="icon">📘</span>
          <p>Vape Bureau Ph</p>
        </div>
      </div>

      <footer className="contact-footer">
        <span>Website Developers &gt;&gt;&gt;</span>
      </footer>

      <button className="back-btn" onClick={() => navigate('/shopfront')}>
      ← Back to Shop
      </button>
    </div>
  );
};

export default ContactSection;
