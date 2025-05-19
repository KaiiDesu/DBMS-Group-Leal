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
  const [activeView, setActiveView] = useState('upload');
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
      .rpc('approve_registree', { input_user_id: userId });

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
              className={activeView === 'upload' ? 'active' : ''}
              onClick={() => handleSidebarClick('upload')}
            >
              Home
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
              onClick={() => handleSidebarClick('refund')}
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
        {activeView === 'upload' && (
          <UploadOrderPage onCancel={() => setActiveView('upload')} />
        )}
        {activeView === 'inventory' && <InventoryPage />}
        {activeView === 'order' && <SellerOrders />}
        {activeView === 'registree' && <RegistreeTab />}
        {activeView === 'audit' && <SalesReport />}
        {activeView === 'refund' && <SellerRefunds />}
      </div>
    </div>
  );
}

export default SellerDashboard;
