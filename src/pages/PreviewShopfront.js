import React, { useState, useEffect } from 'react';
import './Shopfront.css';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import logo from '../components/logovape.png';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import logos from '../components/images/21age.png'
import Chatbot from '../components/Chatbot';

function PreviewShopfront() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
const [showLoginPopup, setShowLoginPopup] = useState(false);
const [emailInput, setEmailInput] = useState('');




  const navigate = useNavigate();

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
  const showDisclaimer = () => {
Swal.fire({
  title: 'DISCLAIMER',
  html: `
    <strong style="color:#e53935;">!!THIS SHOP ONLY ALLOWS 21+ YEARS OLD!!</strong>
    <br><br>
    This site contains products only suitable for ages 21 and above. Please exit if you do not meet the required age. 
    <br><br>
    By clicking accept, you confirm that you are of legal smoking age 
    and agree to our <a id="terms-link" style="color:#1a0dab; text-decoration:underline; cursor:pointer;">Terms and Conditions</a>.
  `,
  imageUrl: logos,
  imageWidth: 220,
  imageHeight: 200,
  imageAlt: '21+ Icon',
  showCancelButton: false,
  confirmButtonText: 'I Accept',
  allowOutsideClick: false,
  allowEscapeKey: false,
  customClass: { popup: 'swal2-disclaimer' },
  didOpen: () => {
    const link = document.getElementById('terms-link');
    if (link) {
      link.onclick = () => {
        Swal.close();
        setShowDisclaimer(false);
        navigate('/policy');
      };
    }
  }
});
  };

  showDisclaimer(); // show on load

  const interval = setInterval(() => {
    showDisclaimer(); // repeat every 60 seconds
  }, 60000);

  return () => clearInterval(interval); // cleanup on unmount
}, []);



  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
  };

  return (
    <div className="App">
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

      <header className="navbar">
        <div className="navbar-left">
          <img src={logo} alt="Logo" className="nav-logo" />
          <span className="brand-name">Vape Bureau PH</span>
        </div>
        <div className="navbar-right">
          <span className="nav-item" onClick={() => navigate('/login')}>Login</span>
          <span className="nav-item" onClick={() => navigate('/login')}>Register</span>
        </div>
      </header>

      <section className="hero-section">
        <img src={logo} alt="Logo" className="hero-logo" />
        <div className="search-bar">
          <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button className="search-btn" />
        </div>
        <div className="background-box">
          <div className="preview-banner">
            <h4>You're viewing the shop as a guest.</h4>
            <h4><a href="#/login">Register</a> or <a href="#/login">Login</a></h4>
            <p>Browse through our products and get started!</p>
          </div>
        </div>
      </section>

      <section className="products-section">
        
        {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
          <div
            className="product-card"
            key={item.id}
            onClick={() => {
              setSelectedDetailProduct(item);
              setShowDetailPopup(true);
            }}
          >
            <img src={item.image_url} alt={item.name} onError={(e) => e.target.src = '/placeholder.jpg'} />
            <h3>{item.name}</h3>
            <p>SRP: ₱{item.price}</p>
            <p className="product-description">{item.description}</p>
            <div className="preview-disabled-buttons">
<button
  className="compare-btn"
  onClick={(e) => {
    e.stopPropagation();
    Swal.fire({
      title: 'Oops!',
      text: 'You must be logged in to add items to your cart.',
      icon: 'info',
      confirmButtonText: 'Login Now',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/login');
      }
    });
  }}
>
  Login to Add
</button>
<button
  className="buy-btn"
  onClick={(e) => {
    e.stopPropagation();
    Swal.fire({
      title: 'Hold on!',
      text: 'Please log in before placing an order.',
      icon: 'warning',
      confirmButtonText: 'Login Now',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/login');
      }
    });
  }}
>
  Login to Buy
</button>

            </div>
          </div>
        ))}
      </section>

      <Chatbot />
    </div>
  );
}

export default PreviewShopfront;
