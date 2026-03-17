import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    User, ShoppingBag, Store, Calendar, 
    CreditCard, Settings, LogOut, Search, ChevronRight, Plus, Minus, CheckCircle2,
    Activity, Bell
} from 'lucide-react';

const ProductsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // User & Cart States
    const [userData, setUserData] = useState(null);
    const [quantities, setQuantities] = useState({});
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [usedQuota, setUsedQuota] = useState({});
    
    // Live Stock State - Initializes at 0
    const [stock, setStock] = useState(0);

    const BACKEND_URL = "http://localhost:5000";

    useEffect(() => {
        // Bootstrap CSS Injection
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
        document.head.appendChild(link);

        // User Auth Check
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

                const actualUserId = currentUser?._id || currentUser?.id;
                
                if (!actualUserId) {
                    console.error("User ID is missing!");
                    setLoading(false);
                    return; 
                }

                // 2. Fetch User Orders
                const orderRes = await axios.get(`${BACKEND_URL}/api/orders/my?userId=${actualUserId}&t=${Date.now()}`);
                
                const usageMap = {};
                const ordersList = orderRes.data.data || orderRes.data;

                if (ordersList && Array.isArray(ordersList)) {
                    const now = new Date();
                    const currentMonth = now.getMonth();
                    const currentYear = now.getFullYear();

                    ordersList.forEach(order => {
                        const orderDate = new Date(order.createdAt);
                        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                            order.items.forEach(item => {
                                const prodId = String(item.product._id || item.product);
                                usageMap[prodId] = (usageMap[prodId] || 0) + Number(item.quantity || 0);
                            });
                        }
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

        // 3. Fetch Live Shop Stock & Setup Polling
        const fetchStock = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/stock`);
                // Safely check if stock exists in response, otherwise fallback to 0
                setStock(res.data?.stock != null ? res.data.stock : 0);
            } catch (err) {
                console.error("Stock fetch error, defaulting to 0:", err);
                // 🔴 FORCE to 0 if the backend fails entirely
                setStock(0); 
            }
        };
        
        fetchStock();
        const stockInterval = setInterval(fetchStock, 5000);

        return () => {
            clearInterval(stockInterval);
            if (document.head.contains(link)) {
                document.head.removeChild(link);
            }
        };
    }, [navigate]);

    // --- Logic for Monthly Limit Constraint ---
    const handleQty = (product, delta) => {
        const currentQty = quantities[product._id] || 0;
        const alreadyBought = usedQuota[String(product._id)] || 0;
        const remainingQuota = product.monthlyLimit - alreadyBought;
        
        const newQty = currentQty + delta;

        if (newQty < 0) return;

        if (newQty > remainingQuota) {
            alert(`Limit Exceeded! You already bought ${alreadyBought}${product.unit}. Remaining quota: ${remainingQuota}${product.unit}.`);
            return;
        }

        setQuantities(prev => ({
            ...prev,
            [product._id]: newQty
        }));
    };

    // --- Handle Direct Input Typing ---
    const handleInputChange = (product, value) => {
        const alreadyBought = usedQuota[String(product._id)] || 0;
        const remainingQuota = product.monthlyLimit - alreadyBought;
        
        let newQty = parseInt(value, 10);
        if (isNaN(newQty)) newQty = 0;
        if (newQty < 0) newQty = 0;

        if (newQty > remainingQuota) {
            alert(`Limit Exceeded! You can only add up to ${remainingQuota}${product.unit} more.`);
            newQty = remainingQuota; 
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
                
                /* LIVE STOCK CSS */
                .stock-dashboard {
                    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                    color: white;
                    border-radius: 20px;
                    padding: 25px 30px;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .stock-info h3 { margin: 0; font-size: 1.4rem; font-weight: 600; display: flex; align-items: center; gap: 10px; }
                .stock-info p { margin: 5px 0 0 0; color: #bfdbfe; font-size: 0.95rem; }
                .stock-amount { font-size: 2.5rem; font-weight: 700; line-height: 1; }
                .stock-amount span { font-size: 1.2rem; font-weight: 500; }
                .status-badge {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    margin-top: 12px;
                    display: inline-block;
                    font-weight: 500;
                }

                /* SCROLLING TICKER CSS */
                .marquee-container {
                    background: white;
                    border-radius: 15px;
                    overflow: hidden;
                    white-space: nowrap;
                    padding: 15px 0;
                    margin-bottom: 30px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }
                .marquee-content {
                    display: inline-block;
                    animation: marquee 20s linear infinite;
                    color: #2563eb;
                    font-weight: 600;
                    padding-left: 100%;
                }
                @keyframes marquee {
                    0% { transform: translateX(0) }
                    100% { transform: translateX(-100%) }
                }

                /* PRODUCT CARD CSS */
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
                .product-card.selected { border-color: #2563eb; background: rgba(37, 99, 235, 0.05); transform: scale(1.02); }
                .selection-overlay { position: absolute; top: 10px; right: 10px; color: #2563eb; z-index: 10; }
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
                .btn-qty:disabled { background: #cbd5e1; cursor: not-allowed; }
                .btn-proceed {
                    background: #0a1128; color: white; border: none; padding: 16px 35px;
                    border-radius: 15px; font-weight: 700; transition: 0.3s;
                }
                .btn-proceed:hover { background: #2563eb; transform: translateY(-2px); }
                .quota-info { font-size: 0.75rem; font-weight: 600; }
                
                /* Hide standard HTML number input arrows */
                input[type="number"]::-webkit-outer-spin-button,
                input[type="number"]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type="number"] { -moz-appearance: textfield; }
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
                
                {/* 🟢 LIVE STOCK DASHBOARD */}
                <div className="stock-dashboard shadow-sm">
                    <div className="stock-info">
                        <h3><Activity size={24} /> Live Shop Stock</h3>
                        <p>Real-time rice availability at your designated ration shop</p>
                        <div className="status-badge">
                            {stock > 0 ? '🟢 Distribution Active' : '🔴 Currently Unavailable'}
                        </div>
                    </div>
                    <div className="text-end">
                        <div className="stock-amount">
                            {/* Force display of 0 if stock is somehow empty */}
                            {stock != null ? stock : 0} <span>KG</span>
                        </div>
                    </div>
                </div>

                {/* 🚨 SCROLLING TICKER */}
                <div className="marquee-container">
                    <div className="marquee-content">
                        <Bell size={18} />  
                        &nbsp; 🚨 STOCK ALERT :
                        {stock > 0 ? (
                            <>
                                Rice Available: <strong>{stock} KG</strong> |
                                Distribution Active |
                                Visit your ration shop
                            </>
                        ) : (
                            <>
                                ❌ Out of Stock |
                                Please wait for update
                            </>
                        )}
                    </div>
                </div>

                {/* Header & Search */}
                <header className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold text-dark mb-1">Select Items</h2>
                        <p className="text-secondary small">Your monthly quota is managed automatically.</p>
                    </div>
                    <div className="bg-white px-3 py-2 rounded-pill shadow-sm border d-flex align-items-center gap-2">
                        <Search size={18} className="text-secondary" />
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            className="border-0 bg-transparent outline-none" 
                            style={{ outline: 'none' }}
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                </header>

                {/* Products Grid */}
                {loading ? (
                    <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
                ) : (
                    <div className="row g-4">
                        {filteredProducts.map((product) => {
                            const isSelected = quantities[product._id] > 0;
                            const alreadyBought = usedQuota[String(product._id)] || 0;
                            const remaining = product.monthlyLimit - alreadyBought;

                            return (
                                <div key={product._id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                                    <div className={`product-card shadow-sm ${isSelected ? 'selected' : ''}`}>
                                        {isSelected && <CheckCircle2 className="selection-overlay" size={24} />}
                                        
                                        <div className="img-wrapper bg-light d-flex align-items-center justify-content-center">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="product-img" />
                                            ) : (
                                                <ShoppingBag size={48} className="text-muted opacity-50" />
                                            )}
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
                                                <button 
                                                    className="btn-qty" 
                                                    onClick={() => handleQty(product, -1)}
                                                    disabled={(quantities[product._id] || 0) <= 0}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                
                                                <input 
                                                    type="number"
                                                    className="text-center fw-bold border-0"
                                                    style={{ width: '40px', background: 'transparent', outline: 'none' }}
                                                    value={quantities[product._id] || ''}
                                                    onChange={(e) => handleInputChange(product, e.target.value)}
                                                    min="0"
                                                    max={remaining}
                                                    placeholder="0"
                                                />
                                                
                                                <button 
                                                    className="btn-qty" 
                                                    onClick={() => handleQty(product, 1)} 
                                                    disabled={(quantities[product._id] || 0) >= remaining || remaining <= 0}
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

                <div className="d-flex justify-content-end mt-5 pb-5">
                    <button className="btn-proceed shadow d-flex align-items-center" onClick={handleProceed}>
                        Proceed to Payment <ChevronRight size={20} className="ms-2"/>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ProductsPage;