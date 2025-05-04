import React from 'react';
import './AboutUs.css';
import { useNavigate } from 'react-router-dom'; 

export default function AboutUs() {

    const navigate = useNavigate();


  return (
    <div className="about-container">

    <button
        className="about-back-btn"
        onClick={() => navigate('/shopfront')}
      >← Back to Shop
    </button>
      {/* Header */}
      <div className="about-header">
        <h1>ABOUT US</h1>
        <p>We pride ourselves on sourcing only the best brands and products, prioritizing quality and safety. Our commitment to customer 
            satisfaction means we are always here to answer your questions, offer recommendations, and provide support.</p>
      </div>

      {/* Company Information */}
      <div className="section company-info">
        <div className="text-block">
          <h2>Company Information</h2>
          <p>Founded in 2020 by the Garcia siblings amid the global pandemic, Vape Bureau PH was born out of passion, perseverance, and the 
            unwavering support of their mother. From its humble beginnings, the business has grown steadily, becoming a trusted source for 
            high-quality vape essentials including mods, pods, and disposable devices. With locations in Manila, Cabiao, and Quezon City, 
            Vape Bureau PH is committed to delivering premium vape products to customers across Luzon. Their mission is rooted not just in retail,
            but in fostering community and trust within the industry.</p>
        </div>
        <div className="image-block circle">
          <img src="/placeholder.jpg" alt="Company" />
        </div>
      </div>

      {/* Vision & Growth */}
      <div className="section vision-growth">
        <div className="image-block">
          <img src="/placeholder.jpg" alt="Vision & Growth" />
        </div>
        <div className="text-block">
          <h2>Vision & Growth</h2>
          <p>Vape Bureau PH believes in collaboration over competition. The company continues to thrive by building meaningful relationships 
            within the vaping community. Despite growing regulatory challenges and increasing taxes, they remain resilient—adapting to changes 
            and maintaining full compliance with legal standards to ensure long-term stability and trustworthiness.</p>
        </div>
      </div>

      {/* Goals */}
      <div className="section goals">
        <div className="text-block">
          <h2>Goals</h2>
          <p>Looking ahead to 2025, Vape Bureau PH aims to establish a dedicated warehouse facility. This strategic move will streamline
            inventory management, improve logistics, and support the company’s next phase of growth.</p>
        </div>
        <div className="image-block">
          <img src="/placeholder.jpg" alt="Goals" />
        </div>
      </div>
    </div>
  );
}
