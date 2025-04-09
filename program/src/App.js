import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Shopfront from './pages/Shopfront';
import SellerLogin from './pages/SellerLogin'; 


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/shopfront" element={<Shopfront />} />
        <Route path="/seller-login" element={<SellerLogin />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}


export default App;
