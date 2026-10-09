import React, { useState } from 'react';
import Modal from './Modal';
import { formatCurrency } from '../utils/formatters';
import { QrCode, Copy, Check, Upload, AlertCircle } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { useNotifications } from '../context/NotificationContext';

const QRPaymentModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [referenceUtr, setReferenceUtr] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const { showToast } = useNotifications();

  if (!order) return null;

  const advanceDue = parseFloat(order.remaining_amount > 0 ? (order.advance_amount > 0 ? order.remaining_amount : order.total_amount * 0.5) : order.total_amount);
  const upiId = 'heritagetailors@okaxis';
  const payeeName = 'Heritage Bespoke Tailors';

  // Dynamic QR code API URL via standard QR image generator
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${advanceDue.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Adv Order ${order.order_number}`)}`;
  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!referenceUtr.trim()) {
      setError('Please enter the 12-digit UPI transaction reference / UTR number.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await paymentService.submitAdvance({
        orderId: order.id,
        amount: advanceDue,
        referenceUtr: referenceUtr.trim(),
        paymentMethod: 'UPI_QR',
        receiptUrl: receiptUrl.trim() || null
      });

      if (res.success) {
        showToast('Advance payment submitted for verification!', 'success');
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        setError(res.message || 'Failed to submit payment.');
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to submit payment reference.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Advance Payment via UPI / QR Code" maxWidth="520px">
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Order #{order.order_number} &bull; Total: {formatCurrency(order.total_amount)}
        </p>
        <div style={{
          display: 'inline-block',
          backgroundColor: '#fef3c7',
          color: '#92400e',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          fontWeight: 700,
          fontSize: '1.1rem',
          marginTop: '0.5rem',
          border: '1px solid #fde68a'
        }}>
          Payable Advance: {formatCurrency(advanceDue)}
        </div>
      </div>

      {/* QR Code Container */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem'
      }}>
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid #e2e8f0',
          marginBottom: '0.75rem'
        }}>
          <img
            src={qrCodeImgUrl}
            alt="Scan UPI QR Code"
            style={{ width: '180px', height: '180px', display: 'block' }}
          />
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Scan using Google Pay, PhonePe, Paytm, or any UPI app
        </span>

        {/* Copy UPI ID */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.35rem 0.75rem',
          fontSize: '0.8125rem'
        }}>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{upiId}</span>
          <button
            type="button"
            onClick={handleCopyUpi}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: copied ? 'var(--success)' : 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span style={{ fontSize: '0.75rem' }}>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'var(--danger-bg)',
          color: '#991b1b',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Payment Reference Submission Form */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">UPI Reference / UTR Number *</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. 12-digit UTR (UPI/20261006/...)"
            value={referenceUtr}
            onChange={(e) => setReferenceUtr(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Payment Receipt Image Link (Optional)</label>
          <input
            type="url"
            className="form-control"
            placeholder="e.g. https://imgur.com/... or receipt URL"
            value={receiptUrl}
            onChange={(e) => setReceiptUrl(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Payment for Verification'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default QRPaymentModal;
