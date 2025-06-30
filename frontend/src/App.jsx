import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ModalProvider } from './context/ModalContext';
import './index.css';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import PopularItems from './components/PopularItems';
import Suggestion from './components/Suggestion';
import ProductDetail from './components/ProductDetail';
import InboxModal from './components/InboxModal';
import SearchResults from './components/SearchResults';
import Login from './Admin/Login';
import Dashboard from './Admin/Dashboard'; 
import Products from './Admin/Products'; 

function AppContent() {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  // Ẩn header/footer nếu là bất kỳ trang nào thuộc /admin
  const hideHeaderFooter = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {!hideHeaderFooter && <Header />}
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Suggestion />
              <PopularItems />
            </>
          } />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </main>
      {!hideHeaderFooter && <Footer />}
      {showModal && <Modal onClose={() => setShowModal(false)} />}
      <InboxModal />
    </div>
  );
}

function App() {
  return (
    <ModalProvider>
      <Router>
        <AppContent />
      </Router>
    </ModalProvider>
  );
}

export default App;
