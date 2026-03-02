import React from 'react';
import { NavLink } from 'react-router-dom'; // Import NavLink
import { LayoutDashboard, CreditCard, Box, ShoppingCart, BarChart3 } from 'lucide-react';

const Sidebar = () => {
  // Define paths for your routes here
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Ration Cards', path: '/ration-cards', icon: <CreditCard size={18} /> },
    { name: 'Products', path: '/products', icon: <Box size={18} /> }, // Placeholder path
    { name: 'Orders', path: '/orders', icon: <ShoppingCart size={18} /> }, // Placeholder path
    { name: 'Stock Reports', path: '/stock-reports', icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="d-flex flex-column flex-shrink-0 text-white vh-100" style={{ width: '240px', backgroundColor: '#111827' }}>
      
      {/* Logo Section */}
      <div className="p-4 d-flex align-items-center gap-2">
        <div className="bg-success rounded p-1 d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}}>
          <LayoutDashboard size={20} className="text-white" />
        </div>
        <span className="fs-6 fw-bold">Smart Ration</span>
      </div>
      
      {/* Navigation Links */}
      <ul className="nav nav-pills flex-column mb-auto px-3">
        {menuItems.map((item, index) => (
          <li key={index} className="nav-item mb-1">
            <NavLink 
              to={item.path}
              className={({ isActive }) => 
                `nav-link w-100 text-start d-flex align-items-center gap-3 py-2 px-3 border-0 ${
                  isActive ? 'bg-success text-white rounded-3 shadow-sm' : 'text-white opacity-50 hover-opacity-75'
                }`
              }
              style={{ textDecoration: 'none' }}
            >
              {item.icon}
              <span style={{ fontSize: '14px' }}>{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="p-4 mt-auto">
        <p className="text-secondary mb-0" style={{ fontSize: '10px', opacity: 0.6 }}>
          Government of India<br />Public Distribution System
        </p>
      </div>
    </div>
  );
};

export default Sidebar;