import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="navbar bg-white px-4 py-3 border-bottom sticky-top">
      <div className="container-fluid d-flex justify-content-between">
        <div className="input-group" style={{ maxWidth: '300px' }}>
          <span className="input-group-text bg-light border-0"><Search size={18} className="text-muted" /></span>
          <input type="text" className="form-control bg-light border-0 small" placeholder="Search ration cards..." />
        </div>
        
        <div className="d-flex align-items-center gap-4">
          <div className="position-relative text-secondary cursor-pointer">
            <Bell size={20} />
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
          </div>
          <div className="d-flex align-items-center gap-2 border-start ps-4">
            <div className="text-end">
              <div className="fw-bold small mb-0">Admin Officer</div>
              <div className="text-muted" style={{ fontSize: '11px' }}>FPS Gandhi Nagar</div>
            </div>
            <div className="bg-success rounded-circle p-2 d-flex align-items-center justify-content-center text-white" style={{ width: '35px', height: '35px' }}>
              <User size={18} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;