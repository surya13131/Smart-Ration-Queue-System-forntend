import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Search, Filter, Loader2, RefreshCw } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. Fetch Real Orders from Backend ---
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/orders');
      // res.data.data contains the array from your getOrders controller
      setOrders(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- 2. Filter Logic ---
  const filteredOrders = orders.filter(order => 
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.rationCard?.holderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.rationCard?.rationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Order History</h4>
          <p className="text-muted small mb-0">Manage and track all ration distribution orders</p>
        </div>
        <button className="btn btn-outline-success btn-sm d-flex align-items-center gap-2" onClick={fetchOrders}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {/* Search and Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="bg-white p-2 rounded shadow-sm d-flex align-items-center border">
            <Search size={18} className="text-muted mx-2" />
            <input 
              type="text" 
              className="form-control border-0 shadow-none small" 
              placeholder="Search by Order ID, Ration No, or Name..." 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4 text-end">
          <button className="btn btn-white border shadow-sm d-flex align-items-center gap-2 ms-auto">
            <Filter size={18} /> <span className="small">Filter Status</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="card border-0 shadow-sm p-3">
        {loading ? (
          <div className="text-center py-5">
            <Loader2 className="animate-spin text-success mx-auto mb-2" size={32} />
            <p className="text-muted small">Fetching latest orders...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th className="py-3 border-0">Order ID</th>
                  <th className="py-3 border-0">Ration No.</th>
                  <th className="py-3 border-0">Holder Name</th>
                  <th className="py-3 border-0">Total Amount</th>
                  <th className="py-3 border-0">Status</th>
                  <th className="py-3 border-0">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="py-3 fw-bold small text-dark">{order.orderNumber || "ORD-TEMP"}</td>
                    <td className="py-3 text-success small">{order.rationCard?.rationNumber || "N/A"}</td>
                    <td className="py-3 fw-medium small">{order.rationCard?.holderName || "Deleted User"}</td>
                    <td className="py-3 small fw-bold">₹{order.totalAmount}</td>
                    <td className="py-3">
                      <span className={`badge px-3 py-1 fw-normal bg-${
                        order.status === 'Delivered' ? 'success' : 
                        order.status === 'Pending' ? 'warning' : 'primary'
                      }-subtle text-${
                        order.status === 'Delivered' ? 'success' : 
                        order.status === 'Pending' ? 'warning' : 'primary'
                      }`} style={{ fontSize: '11px' }}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-muted small">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No orders found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;