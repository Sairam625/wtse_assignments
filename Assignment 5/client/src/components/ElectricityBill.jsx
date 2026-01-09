import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const PLANS = [
    { name: 'Basic Plan', pricePerUnit: 5, unitsIncluded: 100, validity: 30, status: 'Active' },
    { name: 'Standard Plan', pricePerUnit: 7, unitsIncluded: 200, validity: 30, status: 'Active' },
    { name: 'Premium Plan', pricePerUnit: 10, unitsIncluded: 500, validity: 30, status: 'Active' }
];

const LightningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '40px', height: '40px', color: '#facc15', filter: 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.6))' }}>
        <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
    </svg>
);

const ElectricityBill = () => {
    const [step, setStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [consumerId, setConsumerId] = useState('');
    const [consumerName, setConsumerName] = useState('');
    const [unitsUsed, setUnitsUsed] = useState('');
    const [billDetails, setBillDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [estimatedCost, setEstimatedCost] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [sessionBills, setSessionBills] = useState([]);

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setStep(2);
        setError('');
    };

    const handleDetailsSubmit = (e) => {
        e.preventDefault();
        if (!consumerId || !consumerName || !unitsUsed) {
            setError('Please fill in all fields.');
            return;
        }
        const cost = Number(unitsUsed) * selectedPlan.pricePerUnit;
        setEstimatedCost(cost);
        setStep(3);
        setError('');
    };

    const handleFinalPayment = async () => {
        if (!paymentMethod) {
            setError('Please select a payment method.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('/api/paybill', {
                consumerId,
                consumerName,
                planName: selectedPlan.name,
                unitsUsed: Number(unitsUsed),
                paymentMethod
            });
            console.log('Payment Response:', response.data);
            setBillDetails(response.data.data);

            // Add to session history
            const newTxn = {
                id: `TXN-${Math.floor(Math.random() * 1000000)}`,
                consumer: consumerName,
                plan: selectedPlan.name,
                amount: estimatedCost,
                date: new Date().toLocaleTimeString(),
                method: paymentMethod
            };
            setSessionBills(prev => [newTxn, ...prev]);

            setStep(4);
        } catch (err) {
            console.error('Payment Error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to process payment');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setBillDetails(null);
        setConsumerId('');
        setConsumerName('');
        setUnitsUsed('');
        setSelectedPlan(null);
        setStep(1);
        setEstimatedCost(0);
        setPaymentMethod('');
    };

    return (
        <div className="main-container">
            <AnimatePresence mode="wait">
                {/* STEP 1: PLAN SELECTION */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '2rem' }}>
                            <LightningIcon />
                            <h1 style={{ margin: 0, background: 'none', WebkitTextFillColor: 'initial', color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.5)', fontSize: '2rem' }}>HESCOM ELECTRICITY BILL PAYMENT</h1>
                        </div>

                        <h2 style={{ justifyContent: 'center' }}>Select Your Energy Plan</h2>
                        <div className="grid">
                            {PLANS.map((plan) => (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    key={plan.name}
                                    className="plan-card"
                                    onClick={() => handlePlanSelect(plan)}
                                >
                                    <div className="status-badge">{plan.status}</div>
                                    <h3>{plan.name}</h3>
                                    <div className="price">₹{plan.pricePerUnit}<span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: '400', textShadow: 'none' }}> /unit</span></div>
                                    <p style={{ color: '#94a3b8' }}>{plan.unitsIncluded} High-Speed Units Included</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: CONSUMER DETAILS */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <button className="back-btn" onClick={() => setStep(1)}>&larr; Change Plan</button>
                        <h2>Consumer Details</h2>
                        <form onSubmit={handleDetailsSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <div>
                                <label>Customer ID</label>
                                <input
                                    type="text"
                                    placeholder="e.g. CUST-101"
                                    value={consumerId}
                                    onChange={(e) => setConsumerId(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Consumer Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={consumerName}
                                    onChange={(e) => setConsumerName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Energy Consumed (Units)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 150"
                                    value={unitsUsed}
                                    onChange={(e) => setUnitsUsed(e.target.value)}
                                    required
                                    min="1"
                                />
                            </div>
                            {error && <div className="error-msg">{error}</div>}
                            <button type="submit">Calculate Bill</button>
                        </form>
                    </motion.div>
                )}

                {/* STEP 3: REVIEW & PAYMENT */}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                    >
                        <button className="back-btn" onClick={() => setStep(2)}>&larr; Back to Details</button>
                        <div className="text-center" style={{ textAlign: 'center' }}>
                            <h2>Bill Summary</h2>
                            <div className="summary-card">
                                <div style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '0.5rem', letterSpacing: '1px' }}>TOTAL AMOUNT DUE</div>
                                <div className="total-amount">₹{estimatedCost}</div>
                                <div style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.9rem' }}>Plan: <span style={{ color: '#fff' }}>{selectedPlan?.name}</span></div>
                            </div>

                            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'left', color: '#fff' }}>Select Payment Method</h3>

                            <div className="payment-options">
                                {['Card', 'UPI', 'Net Banking'].map((method) => (
                                    <div
                                        key={method}
                                        className={`payment-option ${paymentMethod === method ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod(method)}
                                    >
                                        <div className="radio-circle">
                                            {paymentMethod === method && <div className="inner-circle" />}
                                        </div>
                                        <span>{method}</span>
                                    </div>
                                ))}
                            </div>

                            {error && <div className="error-msg">{error}</div>}

                            <div style={{ maxWidth: '450px', margin: '2rem auto 0' }}>
                                <button
                                    onClick={handleFinalPayment}
                                    disabled={loading}
                                    style={{
                                        opacity: loading ? 0.7 : 1,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {loading ? (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                            Processing...
                                        </span>
                                    ) : `INITIATE PAYMENT ₹${estimatedCost}`}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 4: SUCCESS */}
                {step === 4 && billDetails && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
                        className="text-center"
                        style={{ textAlign: 'center' }}
                    >
                        <div className="success-icon-container">
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                                className="success-tick"
                            >
                                ✓
                            </motion.div>
                        </div>

                        <h2 style={{ color: '#10b981', marginTop: '1.5rem', justifyContent: 'center', textShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>Payment Successful!</h2>
                        <p style={{ color: '#94a3b8' }}>Transaction ID: #TXN-{Math.floor(Math.random() * 1000000)}</p>

                        <div className="receipt">
                            <div className="receipt-header">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <LightningIcon /> HESCOM RECEIPT
                                </span>
                                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{new Date().toLocaleDateString()}</span>
                            </div>
                            <div style={{ padding: '2rem' }}>
                                <div className="receipt-row">
                                    <span>Consumer</span>
                                    <strong>{billDetails.consumerName}</strong>
                                </div>
                                <div className="receipt-row">
                                    <span>Method</span>
                                    <strong>{paymentMethod}</strong>
                                </div>
                                <div className="receipt-row">
                                    <span>Plan</span>
                                    <strong>{billDetails.planName}</strong>
                                </div>
                                <div className="receipt-row">
                                    <span>Units</span>
                                    <strong>{billDetails.unitsUsed}</strong>
                                </div>
                                <div className="receipt-row total">
                                    <span>Total Paid</span>
                                    <span style={{ fontSize: '1.4rem' }}>₹{billDetails.totalCost}</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={resetForm} className="secondary-btn" style={{ maxWidth: '300px' }}>Make Another Payment</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SESSION HISTORY TABLE */}
            {sessionBills.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="history-section"
                    style={{ marginTop: '3rem', borderTop: '1px solid var(--border-glass)', paddingTop: '2rem' }}
                >
                    <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '1.5rem' }}>Recent Transactions (This Session)</h3>
                    <div className="history-table-container">
                        <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Time</th>
                                    <th style={{ padding: '10px' }}>Consumer</th>
                                    <th style={{ padding: '10px' }}>Plan</th>
                                    <th style={{ padding: '10px' }}>Amount</th>
                                    <th style={{ padding: '10px' }}>Method</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessionBills.map((bill, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '10px' }}>{bill.date}</td>
                                        <td style={{ padding: '10px' }}>{bill.consumer}</td>
                                        <td style={{ padding: '10px' }}>{bill.plan}</td>
                                        <td style={{ padding: '10px', color: 'var(--neon-yellow)' }}>₹{bill.amount}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                fontSize: '0.8rem',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.1)'
                                            }}>
                                                {bill.method}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ElectricityBill;
