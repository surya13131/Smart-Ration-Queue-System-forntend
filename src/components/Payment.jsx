import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CreditCard, Wallet, MapPin, ShoppingBag, 
  ChevronLeft, ChevronRight, Printer, CheckCircle2 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cart } = location.state || { cart: [] };
    
    const [userData] = useState(() => {
        const saved = localStorage.getItem("userDetails");
        return saved ? JSON.parse(saved) : null;
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const totalAmount = cart.reduce((acc, item) => acc + item.totalPrice, 0);

    const generateReceipt = (order) => {
        try {
            const doc = new jsPDF();
            doc.setFillColor(10, 17, 40);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text("SMART RATION RECEIPT", 105, 25, { align: "center" });
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(`OFFICIAL ORDER NO: ${order.orderNumber}`, 15, 50);
            
            doc.setFont(undefined, 'normal');
            doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 15, 57);
            doc.text(`Payment Status: ${order.paymentStatus}`, 15, 62);
            
            doc.setFontSize(12);
            doc.text(`Card Holder: ${userData?.holderName || 'N/A'}`, 15, 72);
            doc.text(`Ration Card: ${userData?.cardNumber || userData?.rationNumber || '---'}`, 15, 79);
            doc.text(`Branch: ${userData?.branch || 'Central Zonal Shop'}`, 15, 86);

            const tableRows = cart.map(item => [
                item.name,
                `${item.selectedQty} ${item.unit}`,
                `Rs. ${item.pricePerUnit}`,
                `Rs. ${item.totalPrice.toFixed(2)}`
            ]);

            autoTable(doc, {
                startY: 95,
                head: [['Provision Item', 'Quantity', 'Rate', 'Subtotal']],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], halign: 'center' },
                columnStyles: { 3: { halign: 'right' } }
            });

            const finalY = doc.lastAutoTable.finalY + 15;
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(`TOTAL PAID: Rs. ${totalAmount.toFixed(2)}`, 195, finalY, { align: 'right' });
            
            doc.save(`${order.orderNumber}_Receipt.pdf`);
        } catch (error) {
            console.error("PDF Error:", error);
        }
    };

    const handlePayment = async (method) => {
        // CRITICAL FIX: Ensure userId is not undefined
        const userId = userData?._id || userData?.id;
        if (!userId || userId === "undefined") {
            alert("Session Error: Please login again.");
            return;
        }

        setIsProcessing(true);

        try {
            if (method === 'upi') {
                const orderRes = await axios.post('http://localhost:5000/api/payments/create-order', {
                    amount: totalAmount
                });

                const options = {
                    key: "rzp_test_SMGBD3sG7OuZnO",
                    amount: orderRes.data.amount,
                    currency: orderRes.data.currency,
                    name: "Smart Ration System",
                    description: "Provision Payment",
                    order_id: orderRes.data.id,
                    handler: async (response) => {
                        try {
                            const verifyRes = await axios.post('http://localhost:5000/api/payments/verify', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                cart: cart,
                                userId: userId
                            });

                            if (verifyRes.data.success) {
                                generateReceipt(verifyRes.data.order);
                                alert("✅ Payment Successful!");
                                navigate('/store');
                            }
                        } catch (err) {
                            alert("Verification failed. Your payment method string may not match the database enum.");
                            setIsProcessing(false);
                        }
                    },
                    prefill: {
                        name: userData?.holderName,
                        contact: userData?.phone
                    },
                    theme: { color: "#2563eb" },
                    modal: { ondismiss: () => setIsProcessing(false) }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();

            } else {
                const orderPayload = {
                    rationCard: userId,
                    items: cart.map(item => ({
                        product: item._id, 
                        quantity: item.selectedQty
                    })),
                    paymentMethod: 'Cash' // Matches Backend Enum
                };

                const res = await axios.post('http://localhost:5000/api/orders', orderPayload);
                if (res.status === 201 || res.status === 200) {
                    generateReceipt(res.data.data);
                    alert(`✅ Order ${res.data.data.orderNumber} Booked!`);
                    navigate('/store'); 
                }
            }
        } catch (err) {
            console.error("Payment Error:", err);
            alert("Process Failed: " + (err.response?.data?.message || "Server Error"));
            setIsProcessing(false);
        }
    };

    if (!cart.length) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
                <ShoppingBag size={64} className="text-muted mb-3 opacity-25" />
                <h4 className="fw-bold">Your cart is empty</h4>
                <button className="btn btn-primary rounded-pill mt-3 px-4" onClick={() => navigate('/store')}>
                    Go to Store
                </button>
            </div>
        );
    }

    return (
        <div className="min-vh-100 p-4 p-md-5" style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)' }}>
            <style>{`
                .payment-container { max-width: 1000px; margin: 0 auto; }
                .glass-card { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(15px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
                .item-line { border-bottom: 1px dashed #94a3b8; padding: 14px 0; }
                .pay-btn { transition: 0.3s; }
                .pay-btn:hover:not(:disabled) { transform: translateY(-3px); }
            `}</style>

            <div className="payment-container text-start">
                <button onClick={() => navigate('/store')} className="btn btn-link text-dark text-decoration-none mb-4 d-flex align-items-center gap-2 fw-bold">
                    <ChevronLeft size={20} /> Edit Selection
                </button>

                <div className="row g-4">
                    <div className="col-lg-7">
                        <div className="glass-card p-4 h-100 d-flex flex-column">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <ShoppingBag className="text-primary" size={24} />
                                <h5 className="fw-bold mb-0">Invoice Summary</h5>
                            </div>

                            <div className="flex-grow-1">
                                {cart.map(item => (
                                    <div key={item._id} className="item-line d-flex justify-content-between">
                                        <div>
                                            <p className="mb-0 fw-bold text-dark">{item.name}</p>
                                            <small className="text-muted">{item.selectedQty} {item.unit} x ₹{item.pricePerUnit}</small>
                                        </div>
                                        <span className="fw-bold text-dark">₹{item.totalPrice.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 p-3 rounded-4 bg-primary text-white shadow">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold small text-uppercase opacity-75">Payable Amount</span>
                                    <span className="h4 mb-0 fw-bold">₹{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="glass-card p-4 mb-4">
                            <h6 className="text-muted small fw-bold mb-3 text-uppercase">Identity Details</h6>
                            <div className="bg-white p-3 rounded-4 border border-light mb-3 shadow-sm">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-primary-subtle p-2 rounded-3 text-primary"><CreditCard size={20} /></div>
                                    <div>
                                        <p className="mb-0 text-muted small uppercase fw-bold" style={{fontSize: '10px'}}>Card Holder</p>
                                        <p className="mb-0 fw-bold text-dark">{userData?.holderName || "Guest User"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-4 border border-light mb-3 shadow-sm">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-info-subtle p-2 rounded-3 text-info"><CheckCircle2 size={20} /></div>
                                    <div>
                                        <p className="mb-0 text-muted small uppercase fw-bold" style={{fontSize: '10px'}}>Ration Card Number</p>
                                        <p className="mb-0 fw-bold text-dark">{userData?.cardNumber || userData?.rationNumber || "---"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-4 border border-light shadow-sm">
                                <div className="d-flex align-items-start gap-3">
                                    <div className="bg-success-subtle p-2 rounded-3 text-success"><MapPin size={20} /></div>
                                    <div>
                                        <p className="mb-0 text-muted small uppercase fw-bold" style={{fontSize: '10px'}}>Pickup Branch</p>
                                        <p className="mb-0 fw-bold text-dark small">{userData?.branch || "Central Zonal Shop"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-4">
                            <h6 className="text-dark fw-bold mb-3">Complete Booking</h6>
                            <button 
                                className="btn btn-primary w-100 py-3 rounded-4 fw-bold mb-3 shadow pay-btn d-flex align-items-center justify-content-center gap-2"
                                onClick={() => handlePayment('upi')}
                                disabled={isProcessing}
                            >
                                {isProcessing ? <div className="spinner-border spinner-border-sm text-white" /> : <Wallet size={20} />}
                                {isProcessing ? "Processing..." : "Pay Online (Razorpay)"}
                            </button>
                            
                            <button 
                                className="btn btn-outline-primary w-100 py-3 rounded-4 fw-bold d-flex align-items-center justify-content-center gap-2 pay-btn" 
                                onClick={() => handlePayment('cash')}
                                disabled={isProcessing}
                            >
                                <Printer size={20} /> Cash at Counter
                                <ChevronRight size={18} className="ms-auto" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;