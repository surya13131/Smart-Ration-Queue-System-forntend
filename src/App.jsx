import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Admin Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RationCards from './components/RationCard';
import StockReports from './components/StockReport';
import ProductManagement from './components/products';
import Orders from './components/orders';
import AdminLogin from './components/AdminLogin';

// User Components
import Login from './components/Login';
import Profile from './components/Profile';
import Store from './components/Store';
import Payment from './components/Payment';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  // ✅ Initialize states directly from localStorage for instant sync
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(localStorage.getItem("role") === "admin");
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(!!localStorage.getItem("userDetails"));

  useEffect(() => {
    const checkAuth = () => {
      setIsUserLoggedIn(!!localStorage.getItem("userDetails"));
      setIsAdminLoggedIn(localStorage.getItem("role") === "admin");
    };
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleUserLogin = () => {
    setIsUserLoggedIn(true);
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
  };

  return (
    <Router>
      <Routes>
        {/* ================= USER FLOW ================= */}
        <Route
          path="/login"
          element={isUserLoggedIn ? <Navigate to="/profile" replace /> : <Login onLogin={handleUserLogin} />}
        />
        <Route path="/profile" element={isUserLoggedIn ? <Profile /> : <Navigate to="/login" replace />} />
        <Route path="/store" element={isUserLoggedIn ? <Store /> : <Navigate to="/login" replace />} />
        <Route path="/payment" element={isUserLoggedIn ? <Payment /> : <Navigate to="/login" replace />} />

        {/* ================= ADMIN FLOW ================= */}
        
        {/* Admin Login Route */}
        <Route
          path="/admin-auth"
          element={isAdminLoggedIn ? <Navigate to="/admin-dashboard" replace /> : <AdminLogin onLogin={handleAdminLogin} />}
        />

        {/* Admin Protected Layout */}
        <Route
          path="/*"
          element={
            isAdminLoggedIn ? (
              <div className="d-flex w-100 vh-100 bg-light overflow-hidden">
                <Sidebar />
                <div className="d-flex flex-column flex-grow-1 w-100" style={{ overflowY: 'auto' }}>
                  <Header />
                  <Routes>
                    <Route path="admin-dashboard" element={<Dashboard />} />
                    <Route path="ration-cards" element={<RationCards />} />
                    <Route path="stock-reports" element={<StockReports />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="orders" element={<Orders />} />
                    {/* Fallback for admin sub-routes */}
                    <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
                  </Routes>
                </div>
              </div>
            ) : (
              /* If NOT admin, redirect everything that isn't a user route to user login */
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Root Redirect */}
        <Route 
          path="/" 
          element={isUserLoggedIn ? <Navigate to="/profile" replace /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;