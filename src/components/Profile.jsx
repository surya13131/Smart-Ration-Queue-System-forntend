import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, CreditCard, Phone, Users, MapPin, 
  Bell, ShoppingBag, Store, Calendar, 
  Settings, LogOut, ChevronRight, Search, ShieldCheck 
} from 'lucide-react';

const ProfilePage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [language, setLanguage] = useState('English');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Dynamically load Bootstrap for layout support
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
        document.head.appendChild(link);

        const storedUser = localStorage.getItem("userDetails");
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        } else {
            navigate("/login");
        }
    }, [navigate]);

    if (!userData) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light text-primary">
            <div className="spinner-border" role="status"></div>
            <span className="ms-3 fw-bold">Authenticating Digital Identity...</span>
        </div>
    );

    const menuItems = [
        { name: 'Profile', icon: <User size={20}/>, path: '/profile' },
        { name: 'Products', icon: <ShoppingBag size={20}/>, path: '/store' },
       
        { name: 'Payment', icon: <CreditCard size={20}/>, path: '/payment' },
       
    ];

    return (
        <div className="d-flex min-vh-100 bg-light w-100 overflow-hidden text-start">
            <style>{`
                .sidebar { width: 280px; background-color: #0a1128; color: #94a3b8; min-height: 100vh; flex-shrink: 0; }
                .nav-link-custom { color: #94a3b8; padding: 12px 25px; margin: 4px 15px; border-radius: 12px; display: flex; align-items: center; text-decoration: none; transition: 0.3s; font-size: 0.95rem; cursor: pointer; }
                .nav-link-custom:hover { background: rgba(255, 255, 255, 0.05); color: white; }
                .nav-link-custom.active { background-color: #2563eb; color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
                .main-content { flex-grow: 1; height: 100vh; overflow-y: auto; background-color: #f8fafc; }
                
                .profile-card { background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px; display: flex; align-items: center; position: relative; }
                .info-item { display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8fafc; border-radius: 16px; height: 100%; border: 1px solid #f1f5f9; }
                .icon-box { background: white; padding: 10px; border-radius: 12px; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .info-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 800; margin-bottom: 2px; }
                .info-value { font-size: 1.05rem; color: #1e293b; font-weight: 700; }
                
                .next-btn { background: #2563eb; color: white; width: 110px; height: 110px; border-radius: 24px; border: none; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; transition: 0.3s; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2); }
                .next-btn:hover { background: #1d4ed8; transform: scale(1.05); }
                
                .marquee-container { background: #fff; border: 1px solid #2563eb11; border-radius: 15px; overflow: hidden; white-space: nowrap; padding: 15px 0; }
                .marquee-content { display: inline-block; animation: marquee 25s linear infinite; color: #2563eb; font-weight: 600; padding-left: 100%; }
                @keyframes marquee { 0% { transform: translate(0, 0); } 100% { transform: translate(-100%, 0); } }
            `}</style>

            {/* Sidebar UI matching theme */}
            <div className="sidebar d-flex flex-column py-4 shadow-lg">
                <div className="px-4 mb-5 d-flex align-items-center gap-2">
                    <div className="bg-primary p-2 rounded-3 text-white shadow-sm"><ShoppingBag size={20} /></div>
                    <div>
                        <h5 className="mb-0 fw-bold text-white tracking-tight">Smart Ration</h5>
                        <small className="text-primary text-uppercase" style={{fontSize: '9px', fontWeight: 'bold'}}>Secure Portal</small>
                    </div>
                </div>
                
                <nav className="flex-grow-1">
                    {menuItems.map((item) => (
                        <div 
                            key={item.name} 
                            onClick={() => navigate(item.path)} 
                            className={`nav-link-custom ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="me-3">{item.icon}</span>
                            {item.name}
                        </div>
                    ))}
                </nav>

                <div className="px-4 mt-auto pt-4 border-top border-secondary border-opacity-25">
                    <div className="d-flex align-items-center gap-3 mb-3 text-white">
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{width: 35, height: 35, fontSize: '12px'}}>
                            {userData.holderName?.charAt(0) || "U"}
                        </div>
                        <div className="overflow-hidden">
                            <p className="mb-0 text-truncate fw-bold small">{userData.holderName}</p>
                            <p className="mb-0 text-secondary" style={{fontSize: '10px'}}>Verified Citizen</p>
                        </div>
                        <LogOut size={16} className="ms-auto cursor-pointer opacity-75 hover-opacity-100" onClick={() => { localStorage.clear(); navigate('/login'); window.location.reload(); }}/>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="main-content p-5">
                <header className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 className="fw-bold text-dark mb-1">Welcome, {userData.holderName?.split(' ')[0]}</h2>
                        <p className="text-secondary small">Access your digitized ration records and verify eligibility.</p>
                    </div>
                    <div className="d-flex align-items-center gap-4">
                        <div className="position-relative">

                        </div>
                        
                    </div>
                </header>

                <div className="marquee-container shadow-sm mb-5">
                    <div className="marquee-content">
                        <Bell size={18} className="me-2" /> 
                        STOCK ALERT: Rice, Wheat, and Sugar have been replenished at your primary branch. | Please book your visit slot to avoid queueing.
                    </div>
                </div>

                <div className="profile-card shadow-sm mb-4">
                    <div className="row g-3 flex-grow-1 pe-4 border-end">
                        <div className="col-md-6">
                            <div className="info-item">
                                <div className="icon-box"><User size={22}/></div>
                                <div><div className="info-label">Card Holder</div><div className="info-value">{userData.holderName}</div></div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="info-item">
                                <div className="icon-box"><CreditCard size={22}/></div>
                                <div><div className="info-label">Ration Card Number</div><div className="info-value">#{userData.rationNumber}</div></div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="info-item">
                                <div className="icon-box"><Phone size={22}/></div>
                                <div><div className="info-label">Contact Number</div><div className="info-value">+91 {userData.phone}</div></div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="info-item">
                                <div className="icon-box"><ShieldCheck size={22}/></div>
                                <div><div className="info-label">Aadhaar Card Number</div><div className="info-value">{userData.aadhaar || "Biometric Verified"}</div></div>
                            </div>
                        </div>
                        <div className="col-md-12">
                            <div className="info-item">
                                <div className="icon-box"><MapPin size={22}/></div>
                                <div><div className="info-label">Registered Address</div><div className="info-value small">{userData.address || "No address found"}</div></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* TRIGGER ROUTE NAVIGATION TO /store */}
                    <div className="ps-5 text-center">
                        <button className="next-btn" onClick={() => navigate('/store')}>
                            <span className="fw-bold">Next</span>
                            <ChevronRight size={28} />
                        </button>
                        <div className="mt-3 text-secondary" style={{fontSize: '11px', fontWeight: '800', letterSpacing: '1px'}}>GO TO STORE</div>
                    </div>
                </div>

                <div className="text-center text-muted mt-5 opacity-50" style={{fontSize: '12px'}}>
                    Smart Ration Management V3.0 | Secure End-to-End Encryption 🔒
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;