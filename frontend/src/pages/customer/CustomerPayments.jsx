import React, { useEffect, useState } from 'react';
import CustomerSidebar from '../../components/CustomerSidebar';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner, EmptyState } from '../../components/CommonComponents';
import { getCustomerPayments, submitPayment } from '../../services/paymentService';
import { getCustomerOrders } from '../../services/orderService';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';

export default function CustomerPayments() {
  const [paymentsData, setPaymentsData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, oList] = await Promise.all([
        getCustomerPayments(),
        getCustomerOrders()
      ]);
      setPaymentsData(pRes);
      setOrders(oList);

      // Default to first order that needs advance
      const pendingOrder = oList.find(o => {
        const req = Number(o.advance_required) || 0;
        const paid = Number(o.advance_paid) || 0;
        return req > paid && o.payment_status !== 'VERIFIED';
      });

      if (pendingOrder) {
        setSelectedOrderId(String(pendingOrder.id));
        const needed = Math.max(0, (Number(pendingOrder.advance_required) || 0) - (Number(pendingOrder.advance_paid) || 0));
        setAmount(String(needed || pendingOrder.advance_required));
      } else if (oList.length > 0) {
        setSelectedOrderId(String(oList[0].id));
        setAmount(String(oList[0].advance_required || 300));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = (e) => {
    const oId = e.target.value;
    setSelectedOrderId(oId);
    const ord = orders.find(o => String(o.id) === String(oId));
    if (ord) {
      const needed = Math.max(0, (Number(ord.advance_required) || 0) - (Number(ord.advance_paid) || 0));
      setAmount(String(needed > 0 ? needed : ord.total_amount));
    }
  };

  const handleCopyUpi = () => {
    const upi = paymentsData?.upiConfig?.upiId || 'tailornotebook@okaxis';
    navigator.clipboard.writeText(upi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmitPaymentRef = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedOrderId) {
      setErrorMsg('Please select an order for payment.');
      return;
    }
    if (!transactionRef || transactionRef.trim().length < 4) {
      setErrorMsg('Please enter a valid 12-digit UTR or Transaction Reference.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitPayment(selectedOrderId, {
        amount: Number(amount),
        transaction_reference: transactionRef.trim(),
        payment_method: paymentMethod
      });
      setSuccessMsg(res.message || 'Payment reference submitted! Studio admin will verify it shortly.');
      setTransactionRef('');
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit payment reference.');
    } finally {
      setSubmitting(false);
    }
  };

  const upiId = paymentsData?.upiConfig?.upiId || 'tailornotebook@okaxis';
  const payeeName = paymentsData?.upiConfig?.payeeName || 'Tailor Notebook Studio';
  const currentPayAmount = parseFloat(amount) || 0;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${currentPayAmount}&cu=INR`;

  const paymentsList = paymentsData?.payments || [];

  return (
    <div className="portal-page">
      <div className="container portal-container">
        <CustomerSidebar />

        <main className="portal-content">
          <div className="portal-header-row">
            <div>
              <span className="section-tag">Direct Atelier Advance Settlement</span>
              <h1 className="portal-main-title font-serif">Payment & Advance Desk</h1>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading payment ledger..." size="large" />
          ) : (
            <>
              {/* Payment Submission Section */}
              <div className="payment-action-card studio-card">
                <div className="pay-split-grid grid-2">
                  {/* Left: Dynamic QR Code */}
                  <div className="qr-box-container">
                    <div className="qr-badge">
                      <Sparkles size={14} />
                      <span>Instant UPI Payment</span>
                    </div>

                    <div className="qr-image-wrap studio-card">
                      <img
                        src={upiQrUrl}
                        alt="Tailor Notebook UPI QR"
                        className="upi-qr-img"
                      />
                    </div>

                    <div className="upi-details-box">
                      <span className="upi-label">Payable Amount:</span>
                      <span className="upi-amount">₹{currentPayAmount.toFixed(2)}</span>
                    </div>

                    <div className="upi-id-pill">
                      <span>UPI ID: <strong>{upiId}</strong></span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="copy-btn"
                        title="Copy UPI ID"
                      >
                        <Copy size={14} />
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <p className="qr-footnote">
                      Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI banking app.
                    </p>
                  </div>

                  {/* Right: Payment Reference Form */}
                  <div className="pay-form-container">
                    <h3 className="pay-form-title font-serif">Submit Payment Reference</h3>
                    <p className="pay-form-desc">
                      After completing the UPI transfer, enter your 12-digit UTR / transaction number below.
                    </p>

                    {successMsg && (
                      <div className="alert alert-success animate-fade mb-3">
                        <CheckCircle2 size={18} />
                        <span>{successMsg}</span>
                      </div>
                    )}

                    {errorMsg && (
                      <div className="alert alert-error animate-fade mb-3">
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmitPaymentRef} className="payment-ref-form">
                      <div className="form-group">
                        <label className="form-label">Select Tailoring Order *</label>
                        <select
                          value={selectedOrderId}
                          onChange={handleOrderChange}
                          className="form-select"
                          required
                        >
                          {orders.map((o) => (
                            <option key={o.id} value={o.id}>
                              Order #{o.order_number} — {o.garment_type} (Adv: ₹{o.advance_required}, Paid: ₹{o.advance_paid || 0})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">Payment Amount (₹) *</label>
                          <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="form-input"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Payment Method</label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="form-select"
                          >
                            <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                            <option value="NET_BANKING">Bank IMPS / NEFT</option>
                            <option value="CASH">Studio Cash Advance</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <span>UPI Ref ID / UTR Number (12 Digits) *</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 324156789012"
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          className="form-input"
                          required
                        />
                        <span className="input-hint">
                          Found in your UPI app payment receipt under 'UPI Transaction ID' or 'UTR'.
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary btn-lg btn-block mt-3"
                      >
                        <CreditCard size={18} />
                        <span>{submitting ? 'Submitting to Studio Admin...' : 'Submit Transaction Reference'}</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Payment History Table */}
              <div className="payment-history-card studio-card mt-4">
                <h3 className="card-section-title font-serif">
                  <Clock size={18} /> My Payment Submission Ledger
                </h3>

                {paymentsList.length === 0 ? (
                  <p className="text-muted text-center py-4">No payment submissions recorded yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="size-table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Garment</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>UTR / Ref ID</th>
                          <th>Submitted Date</th>
                          <th>Verification Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentsList.map((p) => (
                          <tr key={p.id}>
                            <td className="font-bold text-rose">#{p.order_number}</td>
                            <td>{p.garment_type}</td>
                            <td className="font-bold">₹{Number(p.amount).toFixed(2)}</td>
                            <td>{p.payment_method}</td>
                            <td className="font-mono text-muted">{p.transaction_reference}</td>
                            <td>{new Date(p.created_at).toLocaleDateString()}</td>
                            <td>
                              <StatusBadge status={p.status} type="payment" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <style>{`
        .payment-action-card {
          padding: 2.5rem;
          background: #ffffff;
        }
        .pay-split-grid {
          align-items: center;
          gap: 3rem;
        }
        .qr-box-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 2rem 1.5rem;
          border-radius: var(--radius-lg);
        }
        .qr-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--soft-blush);
          color: var(--deep-rose);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          margin-bottom: 1.25rem;
        }
        .qr-image-wrap {
          padding: 0.75rem;
          background: #ffffff;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          margin-bottom: 1.25rem;
        }
        .upi-qr-img {
          width: 180px;
          height: 180px;
          display: block;
        }
        .upi-details-box {
          margin-bottom: 0.75rem;
        }
        .upi-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-right: 0.5rem;
        }
        .upi-amount {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--deep-rose);
        }
        .upi-id-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #ffffff;
          border: 1px solid var(--border-color);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.825rem;
          margin-bottom: 1rem;
        }
        .copy-btn {
          background: none;
          border: none;
          color: var(--rose-accent);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .copy-btn:hover {
          color: var(--deep-rose);
        }
        .qr-footnote {
          font-size: 0.75rem;
          color: var(--text-light);
          line-height: 1.4;
        }
        .pay-form-title {
          font-size: 1.75rem;
          margin-bottom: 0.35rem;
        }
        .pay-form-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: 1.75rem;
          line-height: 1.5;
        }
        .input-hint {
          font-size: 0.75rem;
          color: var(--text-light);
          margin-top: 0.25rem;
        }
        .payment-history-card {
          padding: 2rem;
          background: #ffffff;
        }
        .font-mono { font-family: monospace; }
        @media (max-width: 868px) {
          .pay-split-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
