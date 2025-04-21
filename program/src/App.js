import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Shopfront from './pages/Shopfront';
import SellerLogin from './pages/SellerLogin';
import Cart from './pages/Cart';
import SellerDashboard from './pages/SellerDashboard';
import SellerConfirm from './pages/SellerConfirm';




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/shopfront" element={<Shopfront />} />
        <Route path="/seller-login" element={<SellerLogin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
        <Route path="/seller-confirm" element={<SellerConfirm />} />
      </Routes>
    </Router>
  );
}


export default App;
