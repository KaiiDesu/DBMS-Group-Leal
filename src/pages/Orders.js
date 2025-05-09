import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './Orders.css';
import LogoutPopup from '../components/LogoutPopup';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { motion, AnimatePresence } from 'framer-motion';

function generate12DigitCode() {
  return Math.floor(1e11 + Math.random() * 9e11).toString();
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  

  // Load cart from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(stored);
  }, [cartPreviewOpen]);

  // Fetch only current user's orders
  useEffect(() => {
    (async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("User fetch error:", userError);
        return;
      }

      const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        code,
        address,
        total,
        status,
        items,
        profiles: profiles (first_name, last_name, email)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading orders:', error);
        return;
      }

      const withCodes = data.map(o => ({
        ...o,
        code: o.code || generate12DigitCode()
      }));

      console.log("Authenticated user ID:", user.id);
      console.log("Fetched orders:", data);

      setOrders(withCodes);
    })();
  }, []);

  

  const filtered = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    return o.code.includes(term) || (o.address || '').toLowerCase().includes(term);
  });

  const toggleUserDropdown = () => setIsDropdownOpen(v => !v);
  const toggleCartPreview = () => setCartPreviewOpen(v => !v);
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate('/login');
  };

  return (
    <div className="orders-page">
      <AnimatePresence>
        {showLogoutPopup && (
          <motion.div className="logout-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="logout-modal" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
              <LogoutPopup
                message="Are you sure you want to logout?"
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutPopup(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="navbar">
        <div className="navbar-left">
          <img src="/logovape.png" alt="Logo" className="nav-logo" />
          <span className="brand-name">Vape Bureau PH</span>
        </div>
        <div className="navbar-right">
          <div className="navbar-mid">
            <div className="dropdown">
              <span className={`dropdown-label ${isDropdownOpen ? 'rotated' : ''}`} onClick={toggleUserDropdown}>
                User ▾
              </span>
              <div className={`dropdown-content ${isDropdownOpen ? 'show' : ''}`}>
                <button onClick={() => navigate('/shopfront')}>Shop</button>
                <button onClick={() => navigate('/profile')}>Profile</button>
                <button onClick={() => setShowLogoutPopup(true)}>Logout</button>
              </div>
            </div>
            <span className="nav-item" onClick={() => navigate('/about')}>About Us</span>
            <span className="nav-item" onClick={() => navigate('/contact')}>Contact Us</span>
          </div>
          <div className="cart-preview-wrapper">
            <button className="icon-btn" onClick={toggleCartPreview}>
              <img src="/cart-icon.png" alt="Cart" />
            </button>
            {cartPreviewOpen && (
              <div className="cart-preview-dropdown">
                {cartItems.length === 0 ? (
                  <p style={{ padding: '10px' }}>Cart is empty</p>
                ) : (
                  <>
                    <ul className="cart-preview-list">
                      {cartItems.map(i => <li key={i.id}>• {i.name}</li>)}
                    </ul>
                    <button className="view-all-btn" onClick={() => navigate('/cart')}>View All</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="orders-container">
        <h1>Orders</h1>
        <div className="orders-search">
          <input type="text" placeholder="Search orders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <table className="orders-table">
          <thead>
            <tr>
              <th></th>
              <th>Order ID</th>
              <th>Name</th>
              <th>Address</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id}>
                <td>
                <img
  src={(() => {
    try {
      const items = JSON.parse(o.items);
      return items[0]?.image_url || '/avatar.png';
    } catch {
      return '/avatar.png';
    }
  })()}
  alt="Product"
  className="avatar"
  style={{ cursor: 'pointer' }}
  onClick={() => {
    try {
      const items = JSON.parse(o.items);
      setPreviewImage(items[0]?.image_url);
    } catch {
      setPreviewImage('/avatar.png');
    }
  }}
/>

                </td>

                <td>{o.code}</td>
                <td>{o.profiles?.first_name} {o.profiles?.last_name}</td>
                <td>{o.address}</td>
                <td>₱{o.total}</td>
                <td className={`status ${o.status?.toUpperCase()}`}>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      {previewImage && (
  <div className="image-popup-backdrop" onClick={() => setPreviewImage(null)}>
    <div className="image-popup">
      <img src={previewImage} alt="Full" />
    </div>
  </div>
)}

    </div>
  );
}
