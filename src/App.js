import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Shopfront from './pages/Shopfront';
import SellerLogin from './pages/SellerLogin';
import Cart from './pages/Cart';
import SellerDashboard from './pages/SellerDashboard';
import SellerConfirm from './pages/SellerConfirm';
import ProfilePage from './pages/ProfilePage';
import ContactSection from './pages/ContactSection';
import AboutUs from './pages/AboutUs';
import Orders from './pages/Orders';
import OrderDetailsPage from './pages/OrderDetailsPage';
import Confirm from './pages/Confirm';
import BelowAge from './pages/BelowAge';
import PreviewShopfront from './pages/PreviewShopfront';

import { useEffect } from 'react';                      // 🔁 for useEffect
import { useNavigate } from 'react-router-dom';         // 🔁 for navigate
import { supabase } from './supabaseClient'; 
import RefundPage from './pages/RefundPage';

function App() {
  const navigate = useNavigate();

useEffect(() => {
  const pathname = window.location.hash;

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;

    // only redirect from home page or preview
    if (pathname === '' || pathname === '#/' || pathname === '#/login' || pathname === '#/seller-login') {
      const { data: customerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      const { data: sellerProfile } = await supabase
        .from('sellers')
        .select('id')
        .eq('id', userId)
        .single();

      if (sellerProfile) {
        navigate('/seller-dashboard');
      } else if (customerProfile) {
        navigate('/shopfront');
      }
    }
  };

  checkSession();
}, []);


  return (
    <Routes>
      <Route path="/" element={<PreviewShopfront />} />
      <Route path="/shopfront" element={<Shopfront />} />
      <Route path="/seller-login" element={<SellerLogin />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/seller-dashboard" element={<SellerDashboard />} />
      <Route path="/seller-confirm" element={<SellerConfirm />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/contact" element={<ContactSection />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/order" element={<Orders />} />
      <Route path="/seller-order/:id" element={<OrderDetailsPage />} />
      <Route path="/confirm" element={<Confirm />} />
      <Route path="/underage" element={<BelowAge />} />
      <Route path="/refund" element={<RefundPage/>} />
    </Routes>
  );
}

export default App;
