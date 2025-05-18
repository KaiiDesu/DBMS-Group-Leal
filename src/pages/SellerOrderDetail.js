import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './SellerOrderDetail.css';

const SellerOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(first_name, last_name, email)')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching order:', error.message);
      } else {
        setOrder(data);
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) return <div style={{ padding: '2rem' }}>Loading order details...</div>;

  const items = JSON.parse(order.items || '[]');

  return (
    <div className="order-detail-container">
<div className="status-tracker-buttons">
  {['To Ship', 'Shipped', 'To Receive'].map((label) => (
    <button
      key={label}
      className={`tracker-btn ${order.status === label.toLowerCase() ? 'active' : ''}`}
    >
      {label}
    </button>
  ))}
</div>
      

      <div className="info-box">
        <h3>🚚 Shipping Information</h3>
        <p><strong>VB Express</strong></p>
        <p>ASDASDCASDCASDC</p>
      </div>

      <div className="info-box">
        <h3>🏠 Delivery Address</h3>
        <p><strong>Vape Bureau Buyer</strong></p>
        <p>{order.address}</p>
      </div>


      {items.map((item, index) => (
        <div className="product-card" key={index}>
          <img src={item.image_url} alt={item.name} className="product-img" />
          <div className="product-details">
            <p className="product-name">{item.name}</p>
            <p className="product-price">SRP: {item.price}</p>
            <p className="product-qty">× {item.quantity}</p>
          </div>
          <div className="order-total">
            <p>Order Total</p>
            <p><strong>₱{order.total}</strong></p>
          </div>
        </div>
      ))}

      <div className="order-id-box">
        <p><strong>Order ID</strong></p>
        <p># {order.code}</p>
      </div>
    </div>
  );
};

export default SellerOrderDetail;