// ProductDetailPopup.js
import React from 'react';
import './ProductDetailPopup.css';

export default function ProductDetailPopup({ product, onClose, onAddToCart }) {
  if (!product) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        <div className="popup-content">
          <img src={product.image_url} alt={product.name} className="popup-image" />
          <div className="popup-details">
            <h2>{product.name}</h2>
            <p className="popup-price">₱{product.price}</p>
            <p className="popup-description">{product.description}</p>

            <label htmlFor="variety">Select variety</label>
            <select id="variety" className="popup-select">
              <option value="default">Kaltok panga grade</option>
            </select>

            <button className="popup-add" onClick={() => onAddToCart(product)}>
              Buy now
            </button>
            <button className="popup-add" onClick={() => onAddToCart(product)}>
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
