// OrderDetailsPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './OrderDetailsPage.css';


const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(first_name, last_name, phone_number), items')
      .eq('id', id)
      .single();

    if (!error) {
      setOrder(data);
      setStatus(data.status);
    } else {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) console.error('Update failed:', error);
    else alert('Order status updated.');
  };

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found</p>;

  const fullName = `${order.profiles?.first_name} ${order.profiles?.last_name}`;
  const contact = order.profiles?.phone_number || 'N/A';

  return (
    <div className="order-details-container">
      <h2>Order Details</h2>
      <div className="status-tracker">
        <p>Your Order has been <strong>{status}</strong></p>
        <div className="status-steps">
          <label>
            <input
              type="radio"
              checked={status === 'pending'}
              onChange={() => setStatus('pending')}
            />{' '}
            Preparing
          </label>
          <label>
            <input
              type="radio"
              checked={status === 'shipped'}
              onChange={() => setStatus('shipped')}
            />{' '}
            Order Shipped
          </label>
          <label>
            <input
              type="radio"
              checked={status === 'delivered'}
              onChange={() => setStatus('delivered')}
            />{' '}
            Order Delivered
          </label>
        </div>
        <button onClick={handleSave} className="save-status-btn">SAVE</button>
      </div>

      <div className="details-box">
        <h3>Delivery Address :</h3>
        <p>{order.address}</p>
        <p>Contact Number: {contact}</p>
        <p>Order Date: {new Date(order.created_at).toLocaleString()}</p>
      </div>

      <div className="items-box">
        <h3>Order Items:</h3>
        <ul>
          {order.items.map((item, i) => (
            <li key={i}>
              <img src={item.image_url} alt={item.name} className="item-img" />
              <div>
                <p>{item.name}</p>
                <p>₱{item.price} × {item.quantity}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="summary-box">
        <p>Delivery Fee: ₱0.00</p>
        <p>Discount: ₱0.00</p>
        <h4>Total: ₱{order.total.toFixed(2)}</h4>
      </div>
    </div>
  );
};

export default OrderDetailsPage;