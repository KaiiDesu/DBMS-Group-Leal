import React, { useState } from 'react';
import './SellerDashboard.css';
import logo from '../pages/logovape.png';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import LogoutPopup from '../components/LogoutPopup';
import InventoryPage from './InventoryPage';
import UploadOrderPage from './UploadOrderPage';

function SellerDashboard() {
  const [activeView, setActiveView] = useState('home');
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    } else {
      navigate('/seller-login');
    }
  };

  const handleSidebarClick = (view) => {
    setActiveView(view);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <img src={logo} alt="Logo" className="logo" />
        <nav className="sidebar-nav">
          <ul>
            <li className={activeView === 'home' ? 'active' : ''} onClick={() => handleSidebarClick('home')}>Home</li>
            <li className={activeView === 'order' ? 'active' : ''}>Order</li>
            <li className={activeView === 'upload' ? 'active' : ''} onClick={() => handleSidebarClick('upload')}>Upload Order</li>
            <li className={activeView === 'inventory' ? 'active' : ''} onClick={() => handleSidebarClick('inventory')}>Inventory</li>  
            <li className={activeView === 'manage' ? 'active' : ''}>Manage User</li>
            <li className={activeView === 'setting' ? 'active' : ''}>Setting</li>
            <li onClick={() => setShowLogout(true)}>Log Out</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {activeView === 'home' && (
          <div className="content-wrapper">
            <header className="dashboard-header">
              <input type="text" placeholder="Search" className="search-input" />
              <div className="user-info">
                <span className="username">USERNAME</span>
                <span className="role">Admin</span>
              </div>
            </header>

            <div className="metrics-container">
              <div className="metric-box"><p>Total Revenue</p><h3>₱0</h3></div>
              <div className="metric-box"><p>Total Orders</p><h3>500</h3></div>
              <div className="metric-box"><p>Product in Stock</p><h3>25</h3></div>
              <div className="metric-box"><p>Pending Shipments</p><h3>2</h3></div>
            </div>

            <div className="data-section">
              <div className="bar-chart-box">Product Overview (Bar Chart)</div>
              <div className="pie-chart-box">Top Selling Products (Pie Chart)</div>
            </div>

            <div className="bottom-section">
              <div className="table-box">
                <h4>Stock Alert</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th><th>Date</th><th>Quantity</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>order ID</td><td>Date</td><td>Quantity</td><td>Status</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="table-box">
                <h4>Top Selling Products / Delivery</h4>
                <table>
                  <thead>
                    <tr><th>Order ID</th><th>Quantity</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>order ID</td><td>Quantity</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeView === 'inventory' && <InventoryPage />}
        {activeView === 'upload' && <UploadOrderPage onCancel={() => setActiveView('home')} />}

      </div>

      {showLogout && (
        <LogoutPopup
          message="Are you sure you want to logout?"
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </div>
  );
}

export default SellerDashboard;
