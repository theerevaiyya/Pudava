import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { CartSidebar } from './components/CartSidebar';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Dashboard } from './pages/Dashboard';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { About } from './pages/About';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Wishlist } from './pages/Wishlist';
import { Profile } from './pages/Profile';
import { SplashScreen } from './components/SplashScreen';

// Helper component to scroll top on route change
const ScrollTopHelper = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

const AppContent: React.FC = () => {
    const { loading } = useAuth();
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        // Force splash screen to stay for at least 3.5 seconds to let animation finish
        // regardless of how fast firebase loads.
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 3500);
        return () => clearTimeout(timer);
    }, []);

    if (loading || showSplash) {
        return <SplashScreen />;
    }

    return (
        <Router>
          <ScrollTopHelper />
          <div className="min-h-screen bg-pudava-bg text-gray-100 font-sans selection:bg-pudava-secondary selection:text-black">
            <Navbar />
            <CartSidebar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
    );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;