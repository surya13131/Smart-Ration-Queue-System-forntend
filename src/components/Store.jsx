import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  User, ShoppingBag, Store, Calendar, 
  CreditCard, Settings, LogOut, Search, ChevronRight, Plus, Minus, CheckCircle2 
} from 'lucide-react';

const ProductsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState(null);
    const [quantities, setQuantities] = useState({});
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    // NEW: State to track what has been bought already
    const [usedQuota, setUsedQuota] = useState({});

    const BACKEND_URL = "http://localhost:5000";

    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
        document.head.appendChild(link);

        const storedUser = localStorage.getItem("userDetails");
        let currentUser = null;
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            setUserData(currentUser);
        } else {
            navigate("/login");
            return;
        }

        const fetchData = async () => {
            try {
                // 1. Fetch Products
                const prodRes = await axios.get(`${BACKEND_URL}/api/products`);
                setProducts(prodRes.data);

                // 2. Fetch User Orders to calculate used quota
                const orderRes = await axios.get(`${BACKEND_URL}/api/orders/my?userId=${currentUser._id}`);
                
                const usageMap = {};
                if (orderRes.data.data) {
                    orderRes.data.data.forEach(order => {
                        order.items.forEach(item => {
                            // Link quantity to product ID
                            const prodId = item.product._id || item.product;
                            usageMap[prodId] = (usageMap[prodId] || 0) + item.quantity;
                        });
                    });
                }
                setUsedQuota(usageMap);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load data:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    // --- Logic for Monthly Limit Constraint (Updated for Quota) ---
    const handleQty = (product, delta) => {
        const currentQty = quantities[product._id] || 0;
        const alreadyBought = usedQuota[product._id] || 0;
        const remainingQuota = product.monthlyLimit - alreadyBought;
        
        const newQty = currentQty + delta;

        // 1. Prevent negative quantities
        if (newQty < 0) return;

        // 2. Check against Remaining Quota (Limit - Already Bought)
        if (newQty > remainingQuota) {
          alert(`Limit Exceeded! You already bought ${alreadyBought}${product.unit}. Remaining quota: ${remainingQuota}${product.unit}.`);
          return;
        }

        setQuantities(prev => ({
            ...prev,
            [product._id]: newQty
        }));
    };

    // --- Proceed to Payment ---
    const handleProceed = () => {
        const selectedItems = products
            .filter(p => quantities[p._id] > 0)
            .map(p => ({
                ...p,
                selectedQty: quantities[p._id],
                totalPrice: quantities[p._id] * p.pricePerUnit
            }));

        if (selectedItems.length === 0) {
            alert("Please select at least one item.");
            return;
        }

        // Pass selected data to Payment Page
        navigate('/payment', { state: { cart: selectedItems } });
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const menuItems = [
        { name: 'Profile', icon: <User size={20}/>, path: '/profile' },
        { name: 'Products', icon: <ShoppingBag size={20}/>, path: '/store' },
 
        { name: 'Payment', icon: <CreditCard size={20}/>, path: '/payment' },
        
    ];

    if (!userData) return null;

    return (
        <div className="d-flex min-vh-100 bg-white w-100 overflow-hidden text-start">
            <style>{`
                .sidebar { width: 280px; background-color: #0a1128; color: #94a3b8; min-height: 100vh; flex-shrink: 0; }
                .nav-link-custom { color: #94a3b8; padding: 12px 25px; margin: 4px 15px; border-radius: 12px; display: flex; align-items: center; text-decoration: none; transition: 0.3s; font-size: 0.95rem; cursor: pointer; }
                .nav-link-custom:hover { background: rgba(255, 255, 255, 0.05); color: white; }
                .nav-link-custom.active { background-color: #2563eb; color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
                .main-content { flex-grow: 1; height: 100vh; overflow-y: auto; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); }
                
                .product-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 2px solid transparent;
                    border-radius: 20px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    height: 100%;
                    position: relative;
                }
                .product-card.selected {
                    border-color: #2563eb;
                    background: rgba(37, 99, 235, 0.05);
                    transform: scale(1.02);
                }
                .selection-overlay {
                    position: absolute; top: 10px; right: 10px; color: #2563eb; z-index: 10;
                }
                .img-wrapper { width: 100%; height: 140px; overflow: hidden; }
                .product-img { width: 100%; height: 100%; object-fit: cover; }
                
                .qty-controls {
                    display: flex; align-items: center; justify-content: center; gap: 12px;
                    background: white; border-radius: 50px; padding: 5px; border: 1px solid #e2e8f0;
                }
                .btn-qty {
                    width: 28px; height: 28px; border-radius: 50%; border: none;
                    background: #2563eb; color: white; display: flex; align-items: center; justify-content: center;
                }
                .btn-proceed {
                    background: #0a1128; color: white; border: none; padding: 16px 35px;
                    border-radius: 15px; font-weight: 700; transition: 0.3s;
                }
                .btn-proceed:hover { background: #2563eb; transform: translateY(-2px); }
                .quota-info { font-size: 0.75rem; font-weight: 600; }
            `}</style>

            {/* Sidebar */}
            <div className="sidebar d-flex flex-column py-4 shadow-lg">
                <div className="px-4 mb-5 d-flex align-items-center gap-2 text-white">
                    <ShoppingBag className="text-primary" size={24} />
                    <h5 className="mb-0 fw-bold">Smart Ration</h5>
                </div>
                <nav className="flex-grow-1">
                    {menuItems.map((item) => (
                        <div key={item.name} onClick={() => navigate(item.path)} 
                             className={`nav-link-custom ${location.pathname === item.path ? 'active' : ''}`}>
                            <span className="me-3">{item.icon}</span>{item.name}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <main className="main-content p-5">
                <header className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 className="fw-bold text-dark mb-1">Select Items</h2>
                        <p className="text-secondary small">Your monthly quota is managed automatically.</p>
                    </div>
                    <div className="bg-white px-3 py-2 rounded-pill shadow-sm border d-flex align-items-center gap-2">
                        <Search size={18} className="text-secondary" />
                        <input type="text" placeholder="Search..." className="border-0 bg-transparent outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </header>

                {loading ? (
                    <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
                ) : (
                    <div className="row g-4">
                        {filteredProducts.map((product) => {
                            const isSelected = quantities[product._id] > 0;
                            const alreadyBought = usedQuota[product._id] || 0;
                            const remaining = product.monthlyLimit - alreadyBought;

                            return (
                                <div key={product._id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                                    <div className={`product-card shadow-sm ${isSelected ? 'selected' : ''}`}>
                                        {isSelected && <CheckCircle2 className="selection-overlay" size={24} />}
                                        
                                        <div className="img-wrapper">
                                            <img src={product.image} alt={product.name} className="product-img" />
                                        </div>

                                        <div className="p-3">
                                            <h6 className="fw-bold text-dark mb-1">{product.name}</h6>
                                            <div className="d-flex flex-column small mb-2">
                                                <span className="text-muted">Total Limit: {product.monthlyLimit}{product.unit}</span>
                                                <span className={`quota-info ${remaining > 0 ? 'text-success' : 'text-danger'}`}>
                                                    Available Quota: {remaining}{product.unit}
                                                </span>
                                                <span className="text-primary fw-bold mt-1">₹{product.pricePerUnit}/{product.unit}</span>
                                            </div>
                                            
                                            <div className="qty-controls mt-3">
                                                <button className="btn-qty" onClick={() => handleQty(product, -1)}><Minus size={14} /></button>
                                                <span className="fw-bold">{quantities[product._id] || 0}</span>
                                                <button 
                                                    className="btn-qty" 
                                                    onClick={() => handleQty(product, 1)} 
                                                    disabled={remaining <= 0}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            {isSelected && (
                                                <div className="text-center mt-2 small text-primary fw-bold">
                                                    Subtotal: ₹{(quantities[product._id] * product.pricePerUnit).toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="d-flex justify-content-end mt-5">
                    <button className="btn-proceed shadow d-flex align-items-center" onClick={handleProceed}>
                        Proceed to Payment <ChevronRight size={20} className="ms-2"/>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ProductsPage;