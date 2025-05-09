import React, { useState, useEffect } from 'react';
import './Shopfront.css';
import { supabase } from '../supabaseClient';
import LogoutPopup from '../components/LogoutPopup';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { motion, AnimatePresence } from 'framer-motion';
import Chatbot from '../components/Chatbot';

function Shopfront() {
  const [products, setProducts] = useState([]);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQtyPopup, setShowQtyPopup] = useState(false);
  const [selectedProd, setSelectedProd] = useState(null);
  const [buyQty, setBuyQty] = useState(1);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const navigate = useNavigate();
  const toggleUserDropdown = () => setIsDropdownOpen(open => !open);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, quantity, image_url, description, is_sold_out');
      if (!error) setProducts(data);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(stored);
  }, [cartPreviewOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowDisclaimer(true);
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
  };

  const handleBuyNow = (product) => {
    setSelectedProd(product);
    setBuyQty(1);
    setShowQtyPopup(true);
  };

  const handleConfirmBuy = () => {
    const cur = JSON.parse(localStorage.getItem('cart')) || [];
    const filtered = cur.filter(i => i.id !== selectedProd.id);
    const updated = [...filtered, { ...selectedProd, quantity: buyQty }];
    localStorage.setItem('cart', JSON.stringify(updated));
    setShowQtyPopup(false);
    navigate('/cart', { state: { directCheckout: true } });
  };

  const toggleCartPreview = () => setCartPreviewOpen(!cartPreviewOpen);

  const handleAddToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = existingCart.findIndex(item => item.id === product.id);

    if (existingIndex !== -1) {
      existingCart[existingIndex].quantity += 1;
    } else {
      existingCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    setCartItems(existingCart);

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Added to Cart!',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate('/login');
  };

  return (
    <div className="App">
      {showDisclaimer && (
        <div className="disclaimer-backdrop">
          <div className="disclaimer-box">
            <button className="disclaimer-close" onClick={() => navigate('/login')}>×</button>
            <div className="disclaimer-header">DISCLAIMER</div>
            <div className="disclaimer-age-circle">
              <span className="age-text">21+</span>
            </div>
            <h3 className="disclaimer-warning">!!THIS SHOP ONLY ALLOWS 21+ YEARS OLD!!</h3>
            <p className="disclaimer-text">
              This site contains products only suitable for those aged 21 and over.
              Please exit if you are underage. By clicking accept, you confirm that
              you are of legal smoking age in your jurisdiction and agree to our terms and conditions.
            </p>
            <p className="disclaimer-terms">Terms & Conditions</p>
            <button className="disclaimer-accept" onClick={handleAcceptDisclaimer}>I Accept</button>
          </div>
        </div>
      )}
      
      {/* ——— Logout Popup ——— */}
      <AnimatePresence>
        {showLogoutPopup && (
          <motion.div className="logout-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="logout-modal" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
              <LogoutPopup onConfirm={handleLogout} onCancel={() => setShowLogoutPopup(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ——— Header ——— */}
      <header className="navbar">
        <div className="navbar-left">
          <img src="/logovape.png" alt="Logo" className="nav-logo" />
          <span className="brand-name">Vape Bureau PH</span>
        </div>
        <div className="navbar-right">
          <div className="navbar-mid">
            <div className="dropdown">
              <span className={`dropdown-label ${isDropdownOpen ? 'rotated' : ''}`} onClick={toggleUserDropdown}>User ▾</span>
              <div className={`dropdown-content ${isDropdownOpen ? 'show' : ''}`}>
                <button onClick={() => navigate('/profile')}>Profile</button>
                <button onClick={() => navigate('/order')}>Orders</button>
                <button onClick={() => setShowLogoutPopup(true)}>Logout</button>
              </div>
            </div>
            <span className="nav-item" onClick={() => navigate('/about')}>About Us</span>
            <span className="nav-item" onClick={() => navigate('/contact')}>Contact Us</span>
          </div>
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={toggleCartPreview}><img src={`${process.env.PUBLIC_URL}/cart-icon.png`} /></button>
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

      {/* ——— Hero Section ——— */}
      <section className="hero-section">
        <img src={`${process.env.PUBLIC_URL}/logovape.png`} alt="Vape Bureau Logo" className="hero-logo" />
        <div className="search-bar">
          <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button className="search-btn" />
        </div>
        <p>Welcome to Vape Bureau, your ultimate destination for all things vape!</p>
      </section>

      {/* ——— Products ——— */}
      <section className="products-section">
        {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
          <div className="product-card" key={item.id} onClick={() => {
            setSelectedDetailProduct(item);
            setShowDetailPopup(true);
          }}>
            <img src={item.image_url} alt={item.name} onError={(e) => e.target.src = '/placeholder.jpg'} />
            <h3>{item.name}</h3>
            <p>SRP: ₱{item.price}</p>
            <p className="product-description">{item.description}</p>
            {item.is_sold_out ? (
              <p style={{ color: '#D397F8', fontWeight: 'bold' }}>SOLD OUT</p>
            ) : (
              <div className="buttons">
                <button className="compare-btn" onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}>+ Add to Cart</button>
                <button className="buy-btn" onClick={(e) => { e.stopPropagation(); handleBuyNow(item); }}>Buy now</button>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ——— Quantity Popup ——— */}
      <AnimatePresence>
        {showQtyPopup && (
          <motion.div className="qty-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="qty-modal" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
              <h3>Product: {selectedProd?.name}</h3>
              <label>Quantity:
                <input type="number" min="1" value={buyQty} onChange={e => setBuyQty(Math.max(1, +e.target.value))} />
              </label>
              <div className="qty-actions">
                <button className="cancel-btn" onClick={() => setShowQtyPopup(false)}>Cancel</button>
                <button className="confirm-btn" onClick={handleConfirmBuy}>Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ——— Product Detail Modal ——— */}
{/* ——— Product Detail Modal ——— */}
<AnimatePresence>
  {showDetailPopup && selectedDetailProduct && (
    <motion.div
  className="order-summary-backdrop"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  onClick={() => setShowDetailPopup(false)} // ✅ this closes on click
>
<motion.div
    className="order-summary-popup detail-popup"
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 50, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    onClick={(e) => e.stopPropagation()} // ✅ this prevents inner box from closing it
  >
        <div className="detail-content">
          <div className="image-wrapper">
            <img
              src={selectedDetailProduct.image_url}
              alt={selectedDetailProduct.name}
              className="detail-image"
            />
          </div>
          <div className="detail-info">
            <h2>{selectedDetailProduct.name}</h2>
            <p><strong>Price:</strong> ₱{selectedDetailProduct.price}</p>
            <p><strong>Description:</strong> {selectedDetailProduct.description}</p>
            <button className="place-order-btn" onClick={() => setShowDetailPopup(false)}>Close</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

<Chatbot />
    </div>
  );
}

export default Shopfront;
