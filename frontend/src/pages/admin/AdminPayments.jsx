import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner, EmptyState, ConfirmationModal } from '../../components/CommonComponents';
import {
  getAdminPayments,
  verifyPayment,
  rejectPayment
} from '../../services/paymentService';
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Verify / Reject Modal
  const [activePayment, setActivePayment] = useState(null);
  const [actionType, setActionType] = useState('verify'); // 'verify' or 'reject'
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = () => {
    setLoading(true);
    getAdminPayments({ status: statusFilter })
      .then((data) => setPayments(data))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  };

  const handleOpenAction = (payment, type) => {
    setActivePayment(payment);
    setActionType(type);
    setReviewNotes(type === 'verify' ? 'Verified with Studio UPI HDFC Bank Account statement.' : 'Incorrect transaction UTR number.');
  };

  const handleConfirmAction = async () => {
    if (!activePayment) return;
    setProcessing(true);

    try {
      if (actionType === 'verify') {
        await verifyPayment(activePayment.id, reviewNotes);
      } else {
        await rejectPayment(activePayment.id, reviewNotes);
      }
      setActivePayment(null);
      fetchPayments();
    } catch (err) {
      alert(err.message || `Failed to ${actionType} payment.`);
    } finally {
      setProcessing(false);
    }
  };

  const filtered = payments.filter((p) => {
    if (!search) return true;
    return (
      (p.transaction_reference || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.order_number || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.customer_name || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="portal-page admin-portal-page">
      <div className="container portal-container">
        <AdminSidebar />

        <main className="portal-content">
          <div className="portal-header-row">
            <div>
              <span className="section-tag">Direct Atelier Bank Reconciliation</span>
              <h1 className="portal-main-title font-serif">Payment Verification Desk</h1>
            </div>
          </div>

          <div className="filter-bar studio-card">
            <div className="category-pills">
              {['ALL', 'SUBMITTED', 'VERIFIED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`cat-pill ${statusFilter === st ? 'active' : ''}`}
                >
                  {st === 'SUBMITTED' ? 'Pending Review' : st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by UTR reference, order #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Retrieving payment submissions..." size="large" />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payment submissions found"
              description="No customer payment references match your filter criteria."
            />
          ) : (
            <div className="studio-card">
              <div className="table-responsive">
                <table className="size-table">
                  <thead>
                    <tr>
                      <th>Order # & Garment</th>
                      <th>Client</th>
                      <th>Payable & Paid</th>
                      <th>UTR / Transaction Ref</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong className="text-rose font-bold">#{p.order_number || p.order_id}</strong>
                          <span className="d-block text-xs text-muted">{p.garment_type}</span>
                        </td>
                        <td>
                          <strong>{p.customer_name || 'Client'}</strong>
                          <span className="d-block text-xs text-muted">{p.customer_phone}</span>
                        </td>
                        <td>
                          <div className="font-bold">₹{Number(p.amount).toFixed(2)}</div>
                          <span className="d-block text-xs text-muted">
                            Order Total: ₹{Number(p.total_amount || 0).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <code className="font-mono">{p.transaction_reference}</code>
                          <span className="d-block text-xs text-muted">
                            {new Date(p.created_at).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-placed">{p.payment_method}</span>
                        </td>
                        <td>
                          <StatusBadge status={p.status} type="payment" />
                        </td>
                        <td>
                          {p.status === 'SUBMITTED' || p.status === 'PENDING' ? (
                            <div className="table-actions-cell">
                              <button
                                onClick={() => handleOpenAction(p, 'verify')}
                                className="btn btn-primary btn-sm"
                              >
                                <CheckCircle2 size={14} />
                                <span>Verify</span>
                              </button>
                              <button
                                onClick={() => handleOpenAction(p, 'reject')}
                                className="btn btn-outline btn-sm text-danger"
                              >
                                <XCircle size={14} />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted">
                              Reviewed by {p.reviewer_name || 'Admin'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Confirmation Modal */}
          {activePayment && (
            <div className="modal-overlay animate-fade">
              <div className="modal-dialog studio-card">
                <h3 className="modal-title font-serif">
                  {actionType === 'verify' ? 'Verify & Credit Advance Payment' : 'Reject Payment Reference'}
                </h3>
                <p className="modal-message">
                  {actionType === 'verify'
                    ? `Confirm verifying payment of ₹${Number(activePayment.amount).toFixed(2)} for Order #${activePayment.order_number}? This will automatically deduct from the outstanding order balance and confirm the order for stitching.`
                    : `Are you sure you want to reject payment reference ${activePayment.transaction_reference}? The customer will be notified to resubmit.`}
                </p>

                <div className="form-group mb-4">
                  <label className="form-label">Review / Audit Note</label>
                  <input
                    type="text"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setActivePayment(null)}
                    disabled={processing}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAction}
                    disabled={processing}
                    className={`btn btn-sm ${actionType === 'verify' ? 'btn-primary' : 'btn-danger'}`}
                  >
                    {processing ? 'Processing...' : (actionType === 'verify' ? 'Confirm & Verify' : 'Confirm Rejection')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
