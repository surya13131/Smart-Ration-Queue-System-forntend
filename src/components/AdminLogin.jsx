import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = ({ onLogin }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        enteredCaptcha: ''
    });

    const [currentCaptcha, setCurrentCaptcha] = useState('');
    const [loading, setLoading] = useState(false);

    // ✅ FORCE AUTHENTICATION: Clear any existing role on mount
    useEffect(() => {
        localStorage.removeItem("role"); // Removes 'admin' or 'user' role
        localStorage.removeItem("userDetails"); // Removes user data
        generateCaptcha();
        
        // Notify the App component that we are logged out
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('storage'));
        }
    }, []);

    const generateCaptcha = () => {
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCurrentCaptcha(result);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (formData.enteredCaptcha.toUpperCase() !== currentCaptcha) {
            alert("Invalid Captcha!");
            generateCaptcha();
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/api/auth/login", {
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                // ✅ AUTHENTICATION SECURED: Set role ONLY after server success
                localStorage.setItem("role", "admin");
                onLogin(); 
                navigate("/admin-dashboard");
            }
        } catch (error) {
            alert("Invalid Admin Credentials");
            generateCaptcha();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.logoContainer}>
                    <button onClick={() => navigate('/login')} style={styles.backBtn}>
                        ← Back to User Login
                    </button>
                    <div style={styles.logoCircle}><span style={{ fontSize: '10px' }}>LOGO</span></div>
                    <h1 style={styles.title}>SMART RATION QUEUE - Admin Login</h1>
                </div>
            </header>

            <hr style={styles.divider} />

            <main style={styles.main}>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.loginTitle}>ADMIN LOGIN REQUIRED</h2>
                        <div style={styles.redUnderline}></div>
                    </div>

                    <form style={styles.form} onSubmit={handleLogin}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Admin Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                style={styles.input}
                                placeholder="admin@gmail.com"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                style={styles.input}
                                placeholder="Enter admin password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Captcha</label>
                            <div style={styles.captchaRow}>
                                <div style={styles.captchaDisplay}>{currentCaptcha}</div>
                                <button type="button" onClick={generateCaptcha} style={styles.refreshBtn}>🔄</button>
                            </div>
                            <input
                                type="text"
                                name="enteredCaptcha"
                                required
                                style={styles.input}
                                placeholder="Enter code"
                                value={formData.enteredCaptcha}
                                onChange={(e) => setFormData({...formData, enteredCaptcha: e.target.value})}
                            />
                        </div>

                        <button type="submit" style={styles.loginBtn} disabled={loading}>
                            {loading ? "Verifying..." : "Secure Login"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f4f8', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 40px', backgroundColor: '#fff' },
    logoContainer: { display: 'flex', alignItems: 'center', gap: '15px' },
    backBtn: { backgroundColor: '#f0f0f0', border: '1px solid #ccc', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
    logoCircle: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc' },
    title: { fontSize: '18px', color: '#333', fontWeight: 'bold' },
    divider: { border: '0', borderTop: '2px solid #0056b3', margin: '0' },
    main: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: '#eef6ff', width: '100%', maxWidth: '400px', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    cardHeader: { textAlign: 'center', marginBottom: '20px' },
    loginTitle: { fontSize: '16px', color: '#0056b3', fontWeight: 'bold' },
    redUnderline: { height: '2px', backgroundColor: 'red', marginTop: '8px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '14px', fontWeight: 'bold' },
    input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' },
    captchaRow: { display: 'flex', gap: '10px' },
    captchaDisplay: { flex: 1, textAlign: 'center', padding: '8px', backgroundColor: '#fff', border: '1px solid #ccc', fontWeight: 'bold' },
    refreshBtn: { backgroundColor: '#0056b3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 10px' },
    loginBtn: { backgroundColor: 'red', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }
};

export default AdminLogin;