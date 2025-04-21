import React, { useState, useEffect } from 'react';
import './Cart.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // if not yet imported

function Cart() {
  const navigate = useNavigate();

  
  const [cartItems, setCartItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [editMode, setEditMode] = useState(false);


  const handlePlaceOrder = async () => {
    const address = document.querySelector('input[placeholder="Enter address"]').value;
    const contactNumber = document.querySelector('input[placeholder="Enter contact"]').value;
  
    if (!address || !contactNumber) {
      alert('Please enter both address and contact number.');
      return;
    }
  
    const orderPayload = {
      items: selectedItems,
      address,
      contact_number: contactNumber,
      total: subtotal + shipping - discount,
      user_id: null, // replace with user ID if you use auth
    };
  
    const { error } = await supabase.from('orders').insert([orderPayload]);
  
    if (error) {
      alert('❌ Failed to place order: ' + error.message);
    } else {
      alert('✅ Order placed successfully!');
      localStorage.removeItem('cart');
      navigate('/shopfront');
    }
  };
  
  // Load from localStorage on mount
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(storedCart);
    setSelectedItemIds(storedCart.map(item => item.id));
  }, []);

  const updateLocalStorage = (items) => {
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const handleQuantityChange = (id, newQuantity) => {
    const updated = cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, parseInt(newQuantity) || 1) } : item
    );
    setCartItems(updated);
    updateLocalStorage(updated);
  };

  const handleItemSelect = (id) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const allIds = cartItems.map(item => item.id);
    const allSelected = allIds.every(id => selectedItemIds.includes(id));
    setSelectedItemIds(allSelected ? [] : allIds);
  };

  const selectedItems = cartItems.filter(item => selectedItemIds.includes(item.id));
  const totalSelectedQty = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 36;
  const discount = 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="cart-container">
<div className="cart-header">
  <button className="back-btn" onClick={() => navigate(-1)}>&lt;</button>
  <h2 className="cart-title">Shopping cart ({cartItems.length})</h2>
  <button className="edit-btn" onClick={() => setEditMode(!editMode)}>Edit</button>
</div>


      <table className="cart-table">
        <thead>
          <tr>
            <th></th>
            <th>Item</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map(item => (
            <tr key={item.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedItemIds.includes(item.id)}
                  onChange={() => handleItemSelect(item.id)}
                />
              </td>
              <td className="cart-item">
                <img src={item.image_url} alt={item.name} />
                <span>{item.name}</span>
              </td>
              <td>₱{item.price}</td>
              <td>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={e => handleQuantityChange(item.id, e.target.value)}
                  min="1"
                />
              </td>
              <td>₱{item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-footer">
        <div>
          <input
            type="checkbox"
            checked={cartItems.length > 0 && cartItems.every(item => selectedItemIds.includes(item.id))}
            onChange={toggleAll}
          /> ALL
        </div>

        <div className="cart-summary">
          <p>₱{total.toLocaleString()}</p>
          <p className="sub-details">Shipping: ₱{shipping.toFixed(2)}</p>
          <p className="sub-details">₱{discount.toFixed(2)} OFF</p>
        </div>

        <button className="checkout-btn" onClick={() => setShowOrderSummary(true)}>
          Check Out ({totalSelectedQty})
        </button>
      </div>

      {showOrderSummary && (
        <div className="order-summary-backdrop">
          <div className="order-summary-popup">
            <h2>Order summary</h2>
            <button className="edit-btn" onClick={() => setShowOrderSummary(false)}>Exit</button>

            <div className="form">
              <label>Address:</label>
              <input type="text" placeholder="Enter address" />
              <label>Contact Number:</label>
              <input type="text" placeholder="Enter contact" />
            </div>

            <div className="summary-items">
              {selectedItems.map(item => (
                <div className="summary-item" key={item.id}>
                  <img src={item.image_url} alt={item.name} />
                  <div>
                    <p>{item.name}</p>
                    <p>₱{item.price} x {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-details">
              <p>Subtotal: ₱{subtotal.toFixed(2)}</p>
              <p>Shipping: ₱{shipping.toFixed(2)}</p>
              <p>Discount: ₱{discount.toFixed(2)}</p>
            </div>

            <button className="place-order-btn" onClick={handlePlaceOrder}>Place order</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
