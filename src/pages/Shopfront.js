import React, { useState, useEffect, useRef } from 'react';
import './Shopfront.css';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { motion, AnimatePresence } from 'framer-motion';
import Chatbot from '../components/Chatbot';
import logo from '../components/logovape.png';

function Shopfront({ previewMode = false }) {
  const scrollTargetRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProd, setSelectedProd] = useState(null);
  const [buyQty, setBuyQty] = useState(1);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const getProductSlice = (page) => {
    if (page === 1) return [0, 6];
    const start = 6 + (page - 2) * 9;
    const end = start + 9;
    return [start, end];
  };

  const [startIdx, endIdx] = getProductSlice(currentPage);
  const currentProducts = products.slice(startIdx, endIdx);
  const totalPages = Math.ceil((products.length - 6) / 9) + 1;

  const navigate = useNavigate();
  const toggleUserDropdown = () => setIsDropdownOpen(open => !open);

  useEffect(() => {
  if (!previewMode) {
    Swal.fire({
      title: '21+ DISCLAIMER',
      html: `
        <strong style="color:#e53935;">!!THIS SHOP ONLY ALLOWS 21+ YEARS OLD!!</strong><br><br>
        This site contains products only suitable for ages 21 and above. Please exit if you do not meet the reqruired age. 
        <br><br>
        By clicking accept, you confirm that you are of legal smoking age 
        and agree to our <a href="/terms" target="_blank">terms and conditions</a>.
      `,
      icon: 'warning',
      showCancelButton: false,
      confirmButtonText: 'I Accept',
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: 'swal2-disclaimer',
      }
    }).then(() => {
      setShowDisclaimer(false);
    });
  }
}, []);


  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
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

  const handleAcceptDisclaimer = () => setShowDisclaimer(false);

  const handleBuyNow = async (product) => {
    const { value: quantity } = await Swal.fire({
      title: `Buy ${product.name}`,
      input: 'number',
      inputLabel: 'Quantity',
      inputValue: 1,
      inputAttributes: {
        min: 1,
        step: 1
      },
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    });

    if (quantity && !isNaN(quantity)) {
      const cur = JSON.parse(localStorage.getItem('cart')) || [];
      const filtered = cur.filter(i => i.id !== product.id);
      const updated = [...filtered, { ...product, quantity: +quantity }];
      localStorage.setItem('cart', JSON.stringify(updated));
      navigate('/cart', { state: { directCheckout: true } });
    }
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

useEffect(() => {
  const checkAccess = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.session.user.id)
      .single();

    if (!profile) {
      navigate('/login'); // block seller access to customer side
    }
  };

  checkAccess();
}, []);


  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel'
    });

    if (confirm.isConfirmed) {
      const { error } = await supabase.auth.signOut();
      if (!error) navigate('/');
    }
  };

  const scrollToProductSection = () => {
    scrollTargetRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="App">
      {previewMode && (
        <div className="preview-banner">
          You're browsing as a guest. <a href="/login">Login</a> or <a href="/login">Register</a> to purchase.
        </div>
      )}



      <header className="navbar">
        <div className="navbar-left">
          <a href="#/shopfront"><img src={logo} alt="Logo" className="nav-logo" /></a>
          <span className="brand-name">Vape Bureau PH</span>
        </div>
        <div className="navbar-right">
          <div className="navbar-mid">
            <div className="dropdown">
              <span className={`dropdown-label ${isDropdownOpen ? 'rotated' : ''}`} onClick={toggleUserDropdown}>User ▾</span>
              <div className={`dropdown-content ${isDropdownOpen ? 'show' : ''}`}>
                <button onClick={() => navigate('/profile')}>Profile</button>
                <button onClick={() => navigate('/order')}>Orders</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
            <span className="nav-item" onClick={() => navigate('/about')}>About Us</span>
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


      <section className="hero-section">
        <img src={`${process.env.PUBLIC_URL}/logovape.png`} alt="Vape Bureau Logo" className="hero-logo" />
        <div className="search-bar">
          <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button className="search-btn" />
        </div>
        <p>Welcome to Vape Bureau, your ultimate destination for all things vape!</p>
      </section>


      <div ref={scrollTargetRef}></div>
      <section className="products-section">
        {currentProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
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
) : previewMode ? (
  <div className="preview-disabled-buttons">
    <button disabled className="compare-btn">Login to Add</button>
    <button disabled className="buy-btn">Login to Buy</button>
  </div>
) : (
  <div className="buttons">
    <button className="compare-btn" onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}>+ Add to Cart</button>
    <button className="buy-btn" onClick={(e) => { e.stopPropagation(); handleBuyNow(item);}}
>
  Buy now
</button>
  </div>
)}

          </div>
        ))}
      </section>

<div className="pagination-controls">
        <button
  className="prev-btn"
  onClick={() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
    scrollToProductSection();
  }}
  disabled={currentPage === 1}
>
  ← Prev
</button>
        <span className="page-number">{currentPage}</span>
<button
  className="next-btn"
  onClick={() => {
    const nextPage = currentPage + 1;
    const totalPages = Math.ceil((products.length - 6) / 9) + 1;
    if (nextPage <= totalPages) {
      setCurrentPage(nextPage);
      scrollToProductSection();
    }
  }}
  disabled={currentPage >= Math.ceil((products.length - 6) / 9) + 1}
>
  Next →
</button>
      </div>





<AnimatePresence>
  {showDetailPopup && selectedDetailProduct && (
    <motion.div
  className="order-summary-backdrop"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  onClick={() => setShowDetailPopup(false)} 
>
<motion.div
    className="order-summary-popup detail-popup"
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 50, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    onClick={(e) => e.stopPropagation()} 
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
<footer className="shop-footer">
  <div className="footer-left">
    <img src={logo} alt="Vape Logo" className="footer-logo" />
  </div>
  <div className="footer-center">
    <h4>Contacts</h4>
    <p>
      Have questions, feedback, or need assistance? Our team is here to help!<br />
      Whether you're inquiring about our services, want to collaborate, or just want to say hello —
      don’t hesitate to reach out.
    </p>
  </div>
  <div className="footer-right">
    <p>📍 826 Matimyas St. Sampaloc Manila</p>
    <p>📞 09453202818</p>
    <p>📧 <a href="mailto:VapeBureauPh@gmail.com">VapeBureauPh@gmail.com</a></p>
    <p>🔵 Vape Bureau Ph</p>
  </div>
</footer>

<Chatbot />
    </div>
  );
}

export default Shopfront;
