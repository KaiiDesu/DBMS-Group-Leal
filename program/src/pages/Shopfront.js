import React, { useState, useEffect } from 'react';
import './Shopfront.css';
import { supabase } from '../supabaseClient';
import LogoutPopup from '../components/LogoutPopup';
import { useNavigate } from 'react-router-dom';

function Shopfront() {
  const [products, setProducts] = useState([]);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const toggleCartPreview = () => {
    setCartPreviewOpen(!cartPreviewOpen);
  };

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
    alert(`${product.name} added to cart!`);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
      return;
    }
    window.location.href = '/login';
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, description, is_sold_out');

      if (error) {
        console.error('❌ Error fetching products:', error);
      } else {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(storedCart);
  }, [cartPreviewOpen]);

  return (
    <div className="App">
      {showLogoutPopup && (
        <LogoutPopup
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutPopup(false)}
        />
      )}

      <header className="navbar">
        <div className="navbar-left">
          <img src="/logovape.png" alt="Logo" className="nav-logo" />
          <span className="brand-name">Vape Bureau PH</span>
        </div>

        <div className="navbar-right">
          <div className="navbar-mid">
            <div className="dropdown">
              <span className="dropdown-label" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                User <span className={`arrow ${isDropdownOpen ? 'rotated' : ''}`}>▾</span>
              </span>

              <div className={`dropdown-content ${isDropdownOpen ? 'show' : ''}`}>
              <button onClick={() => navigate('/profile')}>Profile</button>
                <button onClick={() => setShowLogoutPopup(true)}>Logout</button>
              </div>
            </div>

            <span className="nav-item">Categories</span>
            <span className="nav-item">About Us</span>
            <span className="nav-item">Contact Us</span>
          </div>

          <div style={{ position: 'relative' }}>
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
                      {cartItems.map((item) => (
                        <li key={item.id}>
                          <span>• {item.name}</span>
                        </li>
                      ))}
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
        <img src="/logovape.png" alt="Vape Bureau Logo" className="hero-logo" />
        <div className="search-bar">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

          <button className="search-btn" />
        </div>
        <p>Welcome to Vape Bureau, your ultimate destination for all things vape!</p>
      </section>

      <section className="products-section">
      {products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).map((item) => (

          <div className="product-card" key={item.id}>
            <img src={item.image_url} alt={item.name} />
            <h3>{item.name}</h3>
            <p>SRP: ₱{item.price}</p>
            <p className="product-description">{item.description}</p>
            {item.is_sold_out ? (
              <p style={{ color: '#D397F8', fontWeight: 'bold' }}>SOLD OUT</p>
            ) : (
              <div className="buttons">
                <button className="compare-btn" onClick={() => handleAddToCart(item)}>+ Add to Cart</button>
                <button className="buy-btn" onClick={() => navigate('/cart')}>Buy now</button>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

export default Shopfront;
