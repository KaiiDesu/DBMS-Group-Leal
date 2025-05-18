import React, { useState } from 'react';
import { useEffect } from 'react';
import './SellerDashboard.css';
import logo from '../pages/logovape.png';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import InventoryPage from './InventoryPage';
import UploadOrderPage from './UploadOrderPage';
import SellerOrders from './SellerOrders';
import RegistreeTab from './RegistreeTab';
import SalesReport from './SalesReport';
import SellerRefunds from './SellerRefunds';
import Swal from 'sweetalert2';

function SellerDashboard() {
  const [activeView, setActiveView] = useState('home');
  const navigate = useNavigate();
  const [sellerName, setSellerName] = useState('');

useEffect(() => {
  const checkAccess = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return;

    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('id', session.session.user.id)
      .single();

    if (!seller) {
      navigate('/seller-login'); // block customer access to seller side
    }
  };

  checkAccess();
}, []);



const approveUser = async (userId) => {
  const { data, error } = await supabase
    .rpc('approve_registree', { input_user_id: userId }); // matches the SQL function name

  if (error) {
    console.error("Approval failed:", error);
    Swal.fire({
      icon: 'error',
      title: 'Approval Failed',
      text: error.message || 'Failed to approve user.'
    });
  } else {
    Swal.fire({
      icon: 'success',
      title: 'User Approved',
      text: 'User has been approved successfully!'
    });
  }
};

  useEffect(() => {
    const fetchSellerName = async () => {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();
  
      if (authError || !user) {
        console.error('Auth error:', authError?.message || 'No user found');
        return;
      }
  
      const { data, error } = await supabase
        .from('sellers')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
  
      if (error) {
        console.error('Error fetching seller name:', error.message);
      } else {
        setSellerName(`${data.first_name}` .replace(/\b\w/g, char => char.toUpperCase()));
      }
    };
  
    fetchSellerName();
  }, []);
  

    const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
        Swal.fire({ icon: 'error', title: 'Logout Failed', text: error.message });
      } else {
        navigate('/seller-login');
      }
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
    <li
      className={activeView === 'home' ? 'active' : ''}
      onClick={() => handleSidebarClick('home')}
    >
      Home
    </li>
    <li
      className={activeView === 'upload' ? 'active' : ''}
      onClick={() => handleSidebarClick('upload')}
    >
      Upload Order
    </li>
    <li
      className={activeView === 'order' ? 'active' : ''}
      onClick={() => handleSidebarClick('order')}
    >
      Order
    </li>
    <li
      className={activeView === 'inventory' ? 'active' : ''}
      onClick={() => handleSidebarClick('inventory')}
    >
      Inventory
    </li>
<li
  className={activeView === 'refund' ? 'active' : ''}
  onClick={() => handleSidebarClick('refund')}  // ✅ corrected
>
  Refunds
</li>
    <li
      className={activeView === 'audit' ? 'active' : ''}
      onClick={() => handleSidebarClick('audit')}
    >
      Report
    </li>
    <li
      className={activeView === 'registree' ? 'active' : ''}
      onClick={() => handleSidebarClick('registree')}
    >
      Registree
    </li>
    <li onClick={handleLogout}>Log Out</li>
  </ul>
</nav>

      </aside>

      {/* Main Content */}
      <div className="main-content">
        {activeView === 'home' && (
          <div className="content-wrapper">
            <header className="dashboard-header">
              <div className="user-info">
              <span className="username">Seller: {sellerName || 'Seller'} </span>
                
              </div>
            </header>

            <div className="metrics-container">
              <div className="metric-box">
                <p>Total Revenue</p>
                <h3>₱0</h3>
              </div>
              <div className="metric-box">
                <p>Total Orders</p>
                <h3>500</h3>
              </div>
              <div className="metric-box">
                <p>Product in Stock</p>
                <h3>25</h3>
              </div>
              <div className="metric-box">
                <p>Pending Shipments</p>
                <h3>2</h3>
              </div>
            </div>

            <div className="data-section">
              <div className="bar-chart-box">
                Product Overview (Bar Chart)
              </div>
              <div className="pie-chart-box">
                Top Selling Products (Pie Chart)
              </div>
            </div>

            <div className="bottom-section">
              <div className="table-box">
                <h4>Stock Alert</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Quantity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>order ID</td>
                      <td>Date</td>
                      <td>Quantity</td>
                      <td>Status</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="table-box">
                <h4>Top Selling Products / Delivery</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>order ID</td>
                      <td>Quantity</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeView === 'inventory' && <InventoryPage />}
        {activeView === 'upload' && (
          <UploadOrderPage onCancel={() => setActiveView('home')} />
        )}
        {activeView === 'order' && <SellerOrders />}
        {activeView === 'registree' && <RegistreeTab />}
        {activeView === 'audit' && <SalesReport />}
        {activeView === 'refund' && <SellerRefunds />}
        

      </div>

    </div>
  );
}

export default SellerDashboard;
