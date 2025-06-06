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
import Policy from './pages/PolicyPage';
import RefundPage from './pages/RefundPage';
import RefundPolicy from './pages/Policy/RefundPolicy';
import PrivacyPolicy from './pages/Policy/PrivacyPolicy'
import LegalitiesPolicy from './pages/Policy/LegalitiesPolicy';
import IDVerPolicy from './pages/Policy/IDVerPolicy';

import { useEffect } from 'react';                      // 🔁 for useEffect
import { useNavigate } from 'react-router-dom';         // 🔁 for navigate
import { supabase } from './supabaseClient'; 





function App() {
  const navigate = useNavigate();

useEffect(() => {
  const pathname = window.location.hash;

  const handleRedirect = async (session) => {
    const userId = session.user.id;

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
  };

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session && (pathname === '' || pathname === '#/' || pathname === '#/login' || pathname === '#/seller-login')) {
      handleRedirect(session);
    }
  });

  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      handleRedirect(session);
    }
  });

  return () => {
    listener.subscription.unsubscribe();
  };
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
      <Route path="/policy" element={<Policy/>}/>
      <Route path="/policy/refund" element={<RefundPolicy />} />
      <Route path="/policy/privacy" element={<PrivacyPolicy />} />
      <Route path="/policy/legalities" element={<LegalitiesPolicy />} />
      <Route path="/policy/idver" element={<IDVerPolicy />} />
    </Routes>
  );
}

export default App;
