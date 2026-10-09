import React, { useState, useEffect } from 'react';
import { paymentService } from '../../../services/paymentService';
import { formatCurrency } from '../../../utils/formatters';
import { formatDate } from '../../../utils/dateUtils';
import StatusBadge from '../../../components/StatusBadge';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import { useNotifications } from '../../../context/NotificationContext';
import { CreditCard, Check, X, ExternalLink, AlertCircle } from 'lucide-react';

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reject Modal State
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const { showToast } = useNotifications();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await paymentService.getPayments({
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      if (res.success) setPayments(res.data || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      setProcessing(true);
      const res = await paymentService.verifyPayment(id, { action: 'approve' });
      if (res.success) {
        showToast('Payment verified and credited to order balance!', 'success');
        fetchPayments();
      }
    } catch (err) {
      alert(err.userMessage || 'Verification failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenReject = (id) => {
    setRejectingId(id);
    setRejectionReason('UTR transaction reference not matching bank credits');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      const res = await paymentService.verifyPayment(rejectingId, {
        action: 'reject',
        rejectionReason
      });
      if (res.success) {
        showToast('Payment marked as rejected', 'info');
        setIsRejectModalOpen(false);
        fetchPayments();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to reject payment.');
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    {
      header: 'Order & Customer',
      accessor: (row) => (
        <div>
          <strong style={{ color: 'var(--accent)' }}>#{row.order_number}</strong>
          <div style={{ fontWeight: 600, marginTop: '0.15rem' }}>{row.customer_name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.customer_phone}</div>
        </div>
      )
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <div>
          <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>
            {formatCurrency(row.amount)}
          </strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Method: {row.payment_method}
          </div>
        </div>
      )
    },
    {
      header: 'Reference UTR / Slip',
      accessor: (row) => (
        <div>
          <code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>
            {row.reference_utr || 'No UTR'}
          </code>
          {row.receipt_url && (
            <div style={{ marginTop: '0.25rem' }}>
              <a
                href={row.receipt_url}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.75rem', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
              >
                View Slip <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Submitted On',
      accessor: (row) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {formatDate(row.created_at)}
        </span>
      )
    },
    {
      header: 'Verification Status',
      accessor: (row) => (
        <div>
          <StatusBadge status={row.status} />
          {row.rejection_reason && (
            <div style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: '0.2rem' }}>
              Reason: {row.rejection_reason}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          {row.status === 'Pending Verification' ? (
            <>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleApprove(row.id)}
                disabled={processing}
                title="Verify & Credit Deposit"
              >
                <Check size={14} /> Approve
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--danger)' }}
                onClick={() => handleOpenReject(row.id)}
                disabled={processing}
                title="Reject with Reason"
              >
                <X size={14} /> Reject
              </button>
            </>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Processed by {row.verifier_name || 'Admin'}
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
            QR & Advance Payment Verification
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Review customer UPI/QR advance transfers, verify transaction UTR references, and confirm deposits.
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} retry={fetchPayments} />}

      {/* Filter Tabs */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter Status:</label>
        <select
          className="form-control form-select"
          style={{ width: '200px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Transactions</option>
          <option value="Pending Verification">Pending Verification Only</option>
          <option value="Verified">Verified Only</option>
          <option value="Rejected">Rejected Only</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        emptyMessage="No payment records found matching the status filter."
      />

      {/* Reject Payment Reason Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Payment Reference"
        maxWidth="450px"
      >
        <form onSubmit={handleConfirmReject}>
          <div className="form-group">
            <label className="form-label">Reason for Rejection *</label>
            <textarea
              rows="3"
              className="form-control"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
              This explanation will be shared with the customer so they can provide the correct reference.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={processing}>
              {processing ? 'Processing...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentVerification;
