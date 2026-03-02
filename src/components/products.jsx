import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Search, X, Image as ImageIcon, Loader2 } from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    monthlyLimit: 5,
    unit: 'kg',
    availableStock: 0,
    pricePerUnit: 0,
    image: '' // This will store the Base64 string
  });

  const BACKEND_URL = "http://localhost:5000";

  // --- 1. Fetch Products ---
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/products`);
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setLoading(false);
    }
  };

  // --- 2. Handle Image Conversion to Base64 ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show local preview
      setPreviewImage(URL.createObjectURL(file));

      // Convert to Base64 for MongoDB storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 3. CRUD Handlers ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Sending as standard JSON since image is now a Base64 string
      const res = await axios.post(`${BACKEND_URL}/api/products`, formData);
      
      setProducts([res.data.data, ...products]); 
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert("Error adding product. Check if the image size is too large.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product permanently from MongoDB?")) {
      try {
        await axios.delete(`${BACKEND_URL}/api/products/${id}`);
        setProducts(products.filter(p => p._id !== id));
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', monthlyLimit: 5, unit: 'kg', availableStock: 0, pricePerUnit: 0, image: '' });
    setPreviewImage(null);
  };

  const getStockInfo = (stock) => {
    if (stock <= 0) return { color: '#ef4444', status: 'Out of Stock', percent: 0 };
    if (stock <= 10) return { color: '#f59e0b', status: 'Low Stock', percent: 30 };
    return { color: '#10b981', status: 'In Stock', percent: 100 };
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-light min-vh-100" style={{ color: '#334155', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold h4 mb-1">Inventory Control</h2>
          <p className="text-muted small mb-0">Manage realistic product data stored in MongoDB</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-4 rounded-3">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="position-relative mb-4" style={{ maxWidth: '450px' }}>
        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
        <input 
          type="text" 
          className="form-control ps-5 border-0 shadow-sm py-2 rounded-3" 
          placeholder="Search by product name..." 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product Grid */}
      <div className="row g-4">
        {loading ? (
          <div className="col-12 text-center p-5">
             <Loader2 className="animate-spin mx-auto text-primary" size={40} />
             <p className="mt-2 text-muted">Connecting to Database...</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const stock = getStockInfo(product.availableStock);
            return (
              <div className="col-md-6 col-lg-4 col-xl-3" key={product._id}>
                <div className="card border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '16px' }}>
                  {/* Image Container */}
                  <div style={{ height: '180px', background: '#f8fafc', position: 'relative' }}>
                    <img 
                      src={product.image || 'https://via.placeholder.com/300x180?text=No+Image'} 
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className="position-absolute top-0 end-0 p-2">
                       <button className="btn btn-light btn-sm rounded-circle shadow-sm text-danger" onClick={() => handleDelete(product._id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="p-3">
                    <h6 className="fw-bold text-dark mb-1">{product.name}</h6>
                    <div className="mb-3">
                      <span className="badge rounded-pill" style={{ 
                        backgroundColor: stock.color + '15', 
                        color: stock.color,
                        fontSize: '10px',
                        border: `1px solid ${stock.color}30` 
                      }}>
                        {product.status || stock.status}
                      </span>
                    </div>

                    <div className="small text-muted mb-2 d-flex justify-content-between">
                      <span>Inventory: <b className="text-dark">{product.availableStock} {product.unit}</b></span>
                      <span className="text-primary fw-bold">₹{product.pricePerUnit}</span>
                    </div>

                    <div className="progress" style={{ height: '5px', backgroundColor: '#e2e8f0' }}>
                      <div className="progress-bar" style={{ width: `${stock.percent}%`, backgroundColor: stock.color, borderRadius: '5px' }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for Adding Products */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <form onSubmit={handleAddProduct} className="modal-content border-0 shadow-2xl overflow-hidden" style={{ borderRadius: '20px' }}>
              <div className="bg-white p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">New Provision Entry</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowModal(false); resetForm(); }}></button>
                </div>

                {/* Image Upload Area */}
                <div className="mb-4 text-center">
                   <label className="cursor-pointer d-block">
                      <div className="border-2 border-dashed rounded-4 p-3 mb-2 d-flex flex-column align-items-center justify-content-center" 
                           style={{ height: '150px', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                        {previewImage ? (
                          <img src={previewImage} className="rounded-3 shadow-sm h-100 w-100 object-cover" alt="Preview" />
                        ) : (
                          <>
                            <ImageIcon className="text-muted mb-2" size={32} />
                            <span className="small text-muted">Click to upload realistic image</span>
                          </>
                        )}
                      </div>
                      <input type="file" hidden accept="image/*" onChange={handleImageChange} required />
                   </label>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Product Name</label>
                  <input required className="form-control rounded-3 py-2" placeholder="e.g. Premium Sona Masuri" onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Monthly Limit</label>
                    <input type="number" className="form-control rounded-3" defaultValue="5" onChange={(e) => setFormData({...formData, monthlyLimit: e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Unit Type</label>
                    <select className="form-select rounded-3" onChange={(e) => setFormData({...formData, unit: e.target.value})}>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="L">Liters (L)</option>
                      <option value="unit">Units (pcs)</option>
                    </select>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Initial Stock</label>
                    <input type="number" required className="form-control rounded-3" placeholder="0" onChange={(e) => setFormData({...formData, availableStock: e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Price per Unit</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">₹</span>
                      <input type="number" step="0.01" required className="form-control border-start-0 rounded-end-3" placeholder="0.00" onChange={(e) => setFormData({...formData, pricePerUnit: e.target.value})} />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={uploading} className="btn btn-primary w-100 py-2 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2">
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  {uploading ? 'Processing Image...' : 'Save to MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;