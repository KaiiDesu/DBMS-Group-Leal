import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      
      <section className="hero-section">
        <img src="logovape.png" alt="Vape Bureau Logo" className="hero-logo" />
        <div className="search-bar">
          <input type="text" placeholder="Search" />
          <button className="search-btn" />
          </div>

        <p>Welcome to Vape Bureau, your ultimate destination for all things vape!</p>
      </section>

      
      <section className="products-section">
        {[...Array(9)].map((_, i) => (
          <div className="product-card" key={i}>
            <img src="https://via.placeholder.com/150" alt="Product" />
            <h3>Lana Airship</h3>
            <p>SRP: ₱10000</p>
            <div className="buttons">
              <button className="compare-btn">+ Add to compare</button>
              <button className="buy-btn">Buy now</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;
