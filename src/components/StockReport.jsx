import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Filter, Calendar, ChevronDown, Loader2 } from 'lucide-react';

const StockReports = () => {
  // --- 1. State for Data & UI ---
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 7 days ago
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProduct, setSelectedProduct] = useState('All Products');
  const [products, setProducts] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // --- 2. Fetch Logic ---
  useEffect(() => {
    fetchReportData();
  }, [fromDate, toDate, selectedProduct]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetching orders and products to calculate report
      const [ordersRes, productsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/admin/orders`, config),
        axios.get(`http://localhost:5000/api/admin/products`, config)
      ]);

      setProducts(productsRes.data);

      // Process Logic: Group orders by date and product to show consumption
      // In a large app, you'd create a specific /api/admin/reports/stock endpoint in Node.js
      const rawOrders = ordersRes.data.data;
      const filtered = rawOrders.filter(o => {
        const date = o.createdAt.split('T')[0];
        return date >= fromDate && date <= toDate;
      });

      // Transform data for the table
      const reportRows = filtered.flatMap(order => 
        order.items.map(item => ({
          date: order.createdAt.split('T')[0],
          product: item.product?.name || "Deleted Product",
          consumed: item.quantity,
          status: 'Recorded'
        }))
      ).filter(row => selectedProduct === 'All Products' || row.product === selectedProduct);

      setStockData(reportRows);
      setLoading(false);
    } catch (err) {
      console.error("Report fetch error", err);
      setLoading(false);
    }
  };

  // --- 3. Summary Calculations ---
  const totalConsumed = stockData.reduce((acc, row) => acc + row.consumed, 0);

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="fw-bold mb-1">Stock Reports</h4>
          <p className="text-muted small mb-0">Daily consumption data from completed orders</p>
        </div>
        <button className="btn btn-success d-flex align-items-center gap-2 px-3 py-2" style={{ backgroundColor: '#10b981', border: 'none' }}>
          <Download size={18} />
          <span className="small fw-medium">Export CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4">
        <div className="d-flex flex-wrap align-items-end gap-3">
          <div className="d-flex align-items-center gap-2 text-muted mb-2">
            <Filter size={18} />
            <span className="small fw-medium">Filters</span>
          </div>

          <div className="d-flex gap-3">
            <div>
              <label className="form-label small text-muted mb-1">From Date</label>
              <input type="date" className="form-control form-control-sm" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="form-label small text-muted mb-1">To Date</label>
              <input type="date" className="form-control form-control-sm" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>

          <div style={{ minWidth: '200px' }}>
            <label className="form-label small text-muted mb-1">Product</label>
            <select className="form-select form-select-sm" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
              <option>All Products</option>
              {products.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4 text-center">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-3">
            <div className="text-muted small mb-2">Total Records Found</div>
            <div className="fs-3 fw-bold text-dark">{stockData.length}</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-3">
            <div className="text-muted small mb-2">Total Consumed (Selection)</div>
            <div className="fs-3 fw-bold text-primary">{totalConsumed} kg/L</div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card border-0 shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="fw-bold mb-0">Consumption Log</h6>
          {loading && <Loader2 className="animate-spin text-success" size={20} />}
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-muted">
                <th className="py-3 border-0">Date</th>
                <th className="py-3 border-0">Product</th>
                <th className="py-3 border-0">Consumed Quantity</th>
                <th className="py-3 border-0 text-end pe-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {stockData.length > 0 ? stockData.map((row, index) => (
                <tr key={index}>
                  <td className="py-3 small text-muted">{row.date}</td>
                  <td className="py-3 small fw-medium">{row.product}</td>
                  <td className="py-3 small text-primary fw-bold">-{row.consumed}</td>
                  <td className="py-3 text-end pe-4">
                    <span className="badge bg-success-subtle text-success px-3 py-1 fw-medium" style={{ fontSize: '11px', borderRadius: '12px' }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="text-center py-5 text-muted">No consumption records found for this period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockReports;