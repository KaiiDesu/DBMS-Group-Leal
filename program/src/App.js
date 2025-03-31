import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Shopfront from './pages/Shopfront';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/shopfront" element={<Shopfront />} />
      </Routes>
    </Router>
  );
}


export default App;
