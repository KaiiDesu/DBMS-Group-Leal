import React, { useState, useEffect } from 'react';
import './Cart.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentMethodPopup from '../pages/PaymentMethodPopup';

function Cart() {
  const location = useLocation();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('COD');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(stored);
    setSelectedItemIds(stored.map(i => i.id));
  }, []);

  useEffect(() => {
    if (location.state?.directCheckout) {
      setShowOrderSummary(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const updateLocalStorage = items =>
    localStorage.setItem('cart', JSON.stringify(items));

  const handleItemSelect = id =>
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const toggleAll = () => {
    const allIds = cartItems.map(i => i.id);
    const allSelected = allIds.every(id => selectedItemIds.includes(id));
    setSelectedItemIds(allSelected ? [] : allIds);
  };

  const handleDeleteItem = id => {
    const next = cartItems.filter(i => i.id !== id);
    setCartItems(next);
    updateLocalStorage(next);
    setSelectedItemIds(prev => prev.filter(x => x !== id));
  };

  const handleDeleteSelected = () => {
    const next = cartItems.filter(i => !selectedItemIds.includes(i.id));
    setCartItems(next);
    updateLocalStorage(next);
    setSelectedItemIds([]);
  };

  const handleQuantityChange = (id, qty) => {
    const next = cartItems.map(i =>
      i.id === id ? { ...i, quantity: Math.max(1, parseInt(qty, 10) || 1) } : i
    );
    setCartItems(next);
    updateLocalStorage(next);
  };

  const handlePlaceOrder = () => {
    setShowOrderSummary(false);
    setShowPaymentMethod(true);
  };

  const confirmOrder = async (method) => {
    if (!address.trim() || !contactNumber.trim()) {
      alert('Missing Info: Please enter both address and contact number.');
      return;
    }

    const { data: { user }, error: ue } = await supabase.auth.getUser();
    if (ue || !user) {
      alert('Not Logged In');
      return;
    }

    const orderPayload = {
      user_id: user.id,
      items: JSON.stringify(selectedItems),
      address: address.trim(),
      contact_number: contactNumber.trim(),
      total: subtotal + shipping - discount,
      payment_method: method,
      status: 'pending', 
      created_at: new Date().toISOString()
    };

    alert('Submitting order: ' + JSON.stringify(orderPayload));

    const { data: orderInsert, error: orderError } = await supabase
      .from('orders')
      .insert([orderPayload])
      .select();

    if (orderError || !orderInsert || !orderInsert[0]) {
      alert('Insert Error: ' + JSON.stringify(orderError));
      return;
    }

    const orderId = orderInsert[0].id;
    alert('Order Placed Successfully! Order ID: ' + orderId);

    const orderItemsPayload = selectedItems.map(item => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);
    if (itemsError) {
      alert('Failed to insert order items: ' + JSON.stringify(itemsError));
      return;
    }

    for (const item of selectedItems) {
      const { data: productData, error: fetchError } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', item.id)
        .single();

      if (fetchError || !productData) continue;

      const newQty = productData.quantity - item.quantity;

      await supabase
        .from('products')
        .update({
          quantity: newQty,
          is_sold_out: newQty <= 0
        })
        .eq('id', item.id);
    }

    const remaining = cartItems.filter(i => !selectedItemIds.includes(i.id));
    setCartItems(remaining);
    updateLocalStorage(remaining);
    navigate('/shopfront');
  };

  const selectedItems = cartItems.filter(i => selectedItemIds.includes(i.id));
  const totalSelectedQty = selectedItems.reduce((a, i) => a + i.quantity, 0);
  const subtotal = selectedItems.reduce((a, i) => a + i.price * i.quantity, 0);
  const shipping = 36;
  const discount = 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="cart-container">
      <div className="cart-header">
        <button className="back-btn" onClick={() => navigate(-1)}>&lt;</button>
        <h2 className="cart-title">Shopping cart ({cartItems.length})</h2>
      </div>

      <table className="cart-table">
        <thead>
          <tr>
            <th></th>
            <th>Item</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map(i => (
            <tr key={i.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedItemIds.includes(i.id)}
                  onChange={() => handleItemSelect(i.id)}
                />
              </td>
              <td className="cart-item">
                <img src={i.image_url} alt={i.name} />
                <span>{i.name}</span>
              </td>
              <td>₱{i.price}</td>
              <td>
                <input
                  type="number"
                  value={i.quantity}
                  min="1"
                  onChange={e => handleQuantityChange(i.id, e.target.value)}
                />
              </td>
              <td>₱{i.price * i.quantity}</td>
              <td>
                <button onClick={() => handleDeleteItem(i.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            checked={cartItems.length > 0 && cartItems.every(i => selectedItemIds.includes(i.id))}
            onChange={toggleAll}
          />
          <span>ALL</span>
          {selectedItemIds.length > 0 && (
            <button className="delete-selected-btn" onClick={handleDeleteSelected}>
              🗑️ Delete
            </button>
          )}
        </div>
        <div className="cart-summary">
          <p>₱{total.toLocaleString()}</p>
          <p className="sub-details">Shipping: ₱{shipping.toFixed(2)}</p>
          <p className="sub-details">₱{discount.toFixed(2)} OFF</p>
        </div>
        <button
          className={`checkout-btn ${selectedItemIds.length === 0 ? 'disabled' : ''}`}
          disabled={selectedItemIds.length === 0}
          onClick={() => selectedItemIds.length > 0 && setShowOrderSummary(true)}
        >
          Check Out ({totalSelectedQty})
        </button>
      </div>

      <AnimatePresence>
        {showOrderSummary && (
          <motion.div
            className="order-summary-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="order-summary-popup"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <h2>Order summary</h2>
              <button className="edit-btn" onClick={() => setShowOrderSummary(false)}>
                Exit
              </button>
              <div className="form">
                <label>Address:</label>
                <input
                  type="text"
                  placeholder="Enter address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
                <label>Contact Number:</label>
                <input
                  type="tel"
                  pattern="[0-9]{10,13}"
                  maxLength="13"
                  placeholder="Enter contact number"
                  value={contactNumber}
                  onChange={e => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) setContactNumber(value);
                  }}
                  required
                />
              </div>
              <div className="summary-items">
                {selectedItems.map(i => (
                  <div className="summary-item" key={i.id}>
                    <img src={i.image_url} alt={i.name} />
                    <div>
                      <p>{i.name}</p>
                      <p>₱{i.price} × {i.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="summary-details">
                <p>Subtotal: ₱{subtotal.toFixed(2)}</p>
                <p>Shipping: ₱{shipping.toFixed(2)}</p>
                <p>Discount: ₱{discount.toFixed(2)}</p>
              </div>
              <button className="place-order-btn" onClick={handlePlaceOrder}>
                Place order
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaymentMethod && (
          <motion.div
            className="order-summary-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="order-summary-popup"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <PaymentMethodPopup
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
                onClose={() => {
                  setShowPaymentMethod(false);
                  setShowOrderSummary(true);
                }}
                onContinue={() => confirmOrder(selectedPayment)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Cart;
