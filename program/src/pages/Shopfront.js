import React, { useState, useEffect } from 'react';
import './App.css';
import { supabase } from '../supabaseClient';
import LogoutPopup from '../components/LogoutPopup'; // ✅ NEW custom popup

function Shopfront() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
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
        .select('id, name, price, image_url, description');

      if (error) {
        console.error('❌ Error fetching products:', error);
      } else {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

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
          <button className="icon-btn">
            <img src="/cart-icon.png" alt="Cart" />
          </button>
          <button className="icon-btn" onClick={toggleMenu}>
            <img src="/menu-icon.png" alt="Menu" />
          </button>
        </div>
      </header>

      <section className="hero-section">
        <img src="/logovape.png" alt="Vape Bureau Logo" className="hero-logo" />
        <div className="search-bar">
          <input type="text" placeholder="Search" />
          <button className="search-btn" />
        </div>
        <p>Welcome to Vape Bureau, your ultimate destination for all things vape!</p>
      </section>

      <section className="products-section">
        {products.map((item) => (
          <div className="product-card" key={item.id}>
            <img src={item.image_url} alt={item.name} />
            <h3>{item.name}</h3>
            <p>SRP: ₱{item.price}</p>
            <p className="product-description">{item.description}</p>
            {item.is_sold_out ? (
              <p style={{ color: '#D397F8', fontWeight: 'bold' }}>SOLD OUT</p>
            ) : (
              <div className="buttons">
                <button className="compare-btn">+ Add to compare</button>
                <button className="buy-btn">Buy now</button>
              </div>
            )}
           
          </div>
        ))}
      </section>

      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={closeMenu}>×</button>
        <ul className="menu-items">
          <li><img src="sidebar/user.png" alt="User" /><span>User</span></li>
          <li><img src="sidebar/categories.png" alt="Categories" /><span>Categories</span></li>
          <li><img src="sidebar/about.png" alt="About Us" /><span>About Us</span></li>
          <li><img src="sidebar/contact.png" alt="Contact Us" /><span>Contact Us</span></li>
        </ul>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => setShowLogoutPopup(true)}>
            Log Out <img src="sidebar/logout.png" alt="Logout" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Shopfront;
