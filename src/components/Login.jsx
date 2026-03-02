import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import rationLogo from '../assets/rationlogo.jpg';
import rationIllustration from '../assets/ration.jpg';

const Login = ({ onLogin }) => { 
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''); // Aadhaar or Phone
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('AB12C');
  const [consent, setConsent] = useState(false);
  const [prefetch, setPrefetch] = useState(false);

  // Clear any existing session data when landing on Login page to prevent ID mismatches
  useEffect(() => {
    localStorage.removeItem("userDetails");
    localStorage.removeItem("role");
  }, []);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
  };

  const handleGenerateOTP = () => {
    if (identifier.length >= 10) {
      alert("OTP functionality triggered! For this version, please proceed with your auto-generated 8-digit password.");
    } else {
      alert("Please enter a valid Aadhaar or Phone number.");
    }
  };

  // --- API CONNECTION LOGIC ---
  const handleSubmit = async () => {
    if (!identifier || !password || !consent) {
      alert("Please check your credentials (Aadhaar/Phone, Password) and provide consent.");
      return;
    }

    if (captchaInput.toUpperCase() !== captchaCode) {
      alert("Invalid Captcha code.");
      generateCaptcha();
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifier, // Sends Aadhaar or Phone to the backend
          password: password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        /** * DATA PERSISTENCE: 
         * We store the full object returned by MongoDB. 
         * This includes _id, holderName, and cardNumber.
         */
        localStorage.setItem("userDetails", JSON.stringify(result.data));
        localStorage.setItem("role", result.role || "user");
        
        alert(`Welcome, ${result.data.holderName}!`);
        
        // Trigger the login state update in App.jsx
        if (onLogin) onLogin(); 
        
        // Redirect to profile where details are displayed
        navigate("/profile"); 
      } else {
        alert(result.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Server is not responding. Please ensure your backend is running on port 5000.");
    }
  };

  return (
    <div className="main-wrapper d-flex flex-column min-vh-100 bg-light text-start">
      <style>{`
        .main-header { background-color: #063f7b; border-radius: 8px; margin: 10px; padding: 10px 20px; }
        .header-btn { 
          background: linear-gradient(90deg, #00c6ff, #0072ff); 
          color: white; border: none; padding: 8px 20px; 
          border-radius: 25px; font-weight: bold; transition: 0.3s;
        }
        .header-btn:hover { transform: scale(1.05); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .captcha-display { 
          background: #e9ecef; padding: 8px 15px; 
          border-radius: 5px; font-family: monospace; 
          font-weight: bold; letter-spacing: 3px; font-size: 1.2rem;
        }
        .login-card { border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: none; }
        .illustration-img { max-height: 400px; object-fit: contain; }
        footer { background-color: #e9ecef; font-size: 0.8rem; color: #6c757d; }
        .btn-primary { background-color: #063f7b; border-color: #063f7b; }
        .btn-primary:hover { background-color: #002244; border-color: #002244; }
      `}</style>

      {/* Header */}
      <header className="main-header d-flex justify-content-between align-items-center text-white shadow-sm">
        <div className="d-flex align-items-center gap-3">
          <img src={rationLogo} alt="Logo" height="50" style={{borderRadius: '5px'}} />
          <h1 className="h4 mb-0 fw-bold">Smart Ration Queue System</h1>
        </div>
        <button className="header-btn" onClick={() => navigate('/admin-auth')}>Admin Panel</button>
      </header>

      {/* Main Content */}
      <main className="container py-4 flex-grow-1">
        <div className="row g-4 justify-content-center align-items-stretch">
          
          {/* Left Panel: Branding */}
          <div className="col-lg-6 d-none d-lg-block">
            <div className="card login-card h-100 p-4 text-center justify-content-center bg-white">
              <h2 className="fw-bold mb-3" style={{color: '#063f7b'}}>Skip the Queue, Book Online!</h2>
              <p className="text-muted">Easily book your ration slot without standing in long lines.</p>
              <img 
                src={rationIllustration} 
                alt="Queue Illustration" 
                className="img-fluid illustration-img my-4 mx-auto"
              />
              <h3 className="h5 fw-bold text-primary">Be a Smart Citizen</h3>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="col-lg-5">
            <div className="card login-card p-4 h-100 bg-white">
              <h2 className="fw-bold mb-4" style={{color: '#063f7b'}}>Cardholder Login</h2>
              
              <div className="mb-3">
                <label className="form-label fw-bold small"> Phone Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter Registered Number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>

             

              <div className="mb-4">
                <label className="form-label fw-bold small text-secondary">8-Digit Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="First 4 Name + First 4 Phone"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small">Captcha Verification</label>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="captcha-display border text-dark">{captchaCode}</span>
                  <button className="btn btn-outline-secondary btn-sm" onClick={generateCaptcha}>↻</button>
                </div>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter Captcha Code"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                />
              </div>

              <div className="form-check mb-2">
                <input className="form-check-input" type="checkbox" id="prefetch" checked={prefetch} onChange={(e) => setPrefetch(e.target.checked)} />
                <label className="form-check-label small" htmlFor="prefetch">
                  Prefetch ration details while logging in
                </label>
              </div>

              <div className="form-check mb-4">
                <input className="form-check-input" type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <label className="form-check-label small" htmlFor="consent">
                  I authorize data usage for booking and authentication.
                </label>
              </div>

              <button className="btn btn-primary w-100 py-2 fw-bold shadow" onClick={handleSubmit}>
                PROCEED TO PROFILE
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-4 border-top mt-auto">
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <p className="mb-0">© 2026 Smart Ration Digital Portal.</p>
          <p className="mb-0">Privacy Policy | Help Desk | Terms of Use</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;