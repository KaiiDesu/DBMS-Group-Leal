import React from 'react';
import './ProductDetailPopup.css';

export default function ProductDetailPopup({ product, onClose }) {
  if (!product) return null;

  return (
    <div className="product-detail-backdrop" onClick={onClose}>
      <div className="product-detail-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="product-detail-content">
          <img src={product.image_url} alt={product.name} className="product-detail-image" />
          <div className="product-detail-info">
            <h2>{product.name}</h2>
            <p className="price">₱{product.price}</p>
            <p className="description">{product.description || 'No description available.'}</p>
            <button className="add-to-cart-btn">Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}