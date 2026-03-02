import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, ShoppingBag, Package, Database, LogOut, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalCards: 0,
    ordersToday: 0,
    totalProducts: 0,
    totalStock: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes, cardsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/orders'),
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/admin/ration-cards')
      ]);

      const fetchedOrders = ordersRes.data.data || [];
      const fetchedProducts = productsRes.data || [];
      const fetchedCards = cardsRes.data.data || [];

      setOrders(fetchedOrders.slice(0, 5));

      setStats({
        totalCards: fetchedCards.length,
        ordersToday: fetchedOrders.filter(o => 
          new Date(o.createdAt).toDateString() === new Date().toDateString()
        ).length,
        totalProducts: fetchedProducts.length,
        totalStock: fetchedProducts.reduce((acc, p) => acc + (Number(p.availableStock) || 0), 0)
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
      setLoading(false);
    }
  };

  // Function to handle logout and go back to login
  const handleBackToLogin = () => {
    localStorage.removeItem("role"); // Clear admin role
    localStorage.removeItem("userDetails"); // Clear session
    navigate("/"); // Navigate back to the admin login page
  };

  const statCards = [
    { label: 'Total Ration Records', value: stats.totalCards, bg: '#10b981', icon: <Users size={20} /> },
    { label: 'Orders Today', value: stats.ordersToday, bg: '#3b82f6', icon: <ShoppingBag size={20} /> },
    { label: 'Active Products', value: stats.totalProducts, bg: 'white', textColor: 'dark', icon: <Package size={20} /> },
    { label: 'Available Stock', value: `${stats.totalStock} units`, bg: 'white', textColor: 'dark', icon: <Database size={20} /> },
  ];

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <div className="fw-bold text-muted">Syncing Administrative Data...</div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid p-4 bg-light min-vh-100 text-start">
      {/* Top Header with Back Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0 text-dark">Admin Dashboard</h4>
          <small className="text-muted">Real-time system overview</small>
        </div>
        
        <button 
          onClick={handleBackToLogin}
          className="btn btn-outline-danger d-flex align-items-center gap-2 shadow-sm fw-bold px-3 py-2"
          style={{ borderRadius: '10px' }}
        >
          <LogOut size={18} />
          Back to Login
        </button>
      </div>

      {/* Stats Section */}
      <div className="row g-3 mb-4">
        {statCards.map((stat, i) => (
          <div className="col-12 col-md-6 col-xl-3" key={i}>
            <div className={`card border-0 shadow-sm p-3 h-100 ${stat.bg === 'white' ? '' : 'text-white'}`} 
                 style={{ backgroundColor: stat.bg, borderRadius: '15px' }}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className={`small opacity-75 fw-medium mb-1 ${stat.textColor === 'dark' ? 'text-muted' : ''}`}>{stat.label}</div>
                  <h2 className="fw-bold mb-1">{stat.value}</h2>
                </div>
                <div className={`p-2 rounded-3 ${stat.bg === 'white' ? 'bg-light text-primary' : 'bg-white bg-opacity-25'}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content: Recent Orders */}
      <div className="card border-0 shadow-sm p-4 w-100" style={{ borderRadius: '20px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-2">
            <RefreshCw size={20} className="text-primary" />
            <h6 className="fw-bold mb-0">Recent Order Logs</h6>
          </div>
          <button 
            onClick={fetchDashboardData} 
            className="btn btn-sm btn-primary px-3 fw-bold shadow-sm"
            style={{ borderRadius: '8px' }}
          >
            Refresh Data
          </button>
        </div>
        
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-uppercase text-muted">
                <th className="border-0 py-3">Ration ID</th>
                <th className="border-0 py-3">Holder Name</th>
                <th className="border-0 py-3">Item Count</th>
                <th className="border-0 py-3">Revenue</th>
                <th className="border-0 py-3">Order Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order, i) => (
                  <tr key={i}>
                    <td className="py-3 text-primary fw-bold small">{order.rationCard?.cardNumber || 'N/A'}</td>
                    <td className="py-3 fw-medium small">{order.rationCard?.holderName || 'Unknown User'}</td>
                    <td className="py-3 text-muted small">
                      {order.items?.length || 0} Products
                    </td>
                    <td className="py-3 fw-bold small">₹{order.totalAmount || 0}</td>
                    <td className="py-3">
                      <span className={`badge rounded-pill bg-${order.status === 'Delivered' ? 'success' : 'warning'}-subtle text-${order.status === 'Delivered' ? 'success' : 'warning'} px-3 py-2 fw-bold`} style={{ fontSize: '10px' }}>
                        {order.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <ShoppingBag size={40} className="mb-2 opacity-25" />
                    <div>No recent digital bookings found in the database.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <footer className="mt-5 text-center text-muted small opacity-50">
        Smart Ration Management Console V3.1 | Protected Administrative Access
      </footer>
    </div>
  );
};

export default Dashboard;