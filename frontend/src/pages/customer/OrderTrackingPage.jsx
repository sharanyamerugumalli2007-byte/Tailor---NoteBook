import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { formatCurrency, formatStatus } from '../../utils/formatters';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import QRPaymentModal from '../../components/QRPaymentModal';
import { useNotifications } from '../../context/NotificationContext';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  FileDown,
  CreditCard,
  QrCode,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const SHIPMENT_STAGES = [
  'Order Placed',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered'
];

const OrderTrackingPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderService.getOrderById(id);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) return <Loading message="Retrieving live order tracking & courier status..." />;
  if (error) return <ErrorMessage message={error} retry={fetchOrder} />;
  if (!data?.order) return <ErrorMessage message="Order not found." />;

  const { order, customer, items = [], payments = [], statusHistory = [] } = data;

  const currentShipmentStatus = order.shipment_status || 'Order Placed';
  const currentStageIndex = SHIPMENT_STAGES.indexOf(currentShipmentStatus);

  // Latest payment status
  const latestPayment = payments.length > 0 ? payments[0] : null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => navigate('/customer/orders')}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft size={16} /> My Orders
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
                Order #{order.order_number} Tracking
              </h2>
              <span className="badge badge-green">Confirmed</span>
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Placed: {formatDate(order.order_date)} &bull; Delivery Target: <strong>{formatDate(order.expected_delivery_date)}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => window.open(`/api/pdf/orders/${order.id}`, '_blank')}
          >
            <FileDown size={14} /> Download Invoice PDF
          </button>
          {order.remaining_amount > 0 && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsQRModalOpen(true)}
            >
              <QrCode size={14} /> Pay Advance via UPI QR
            </button>
          )}
        </div>
      </div>

      {/* Courier & Tracking Number Card */}
      <div className="card" style={{ marginBottom: '1.75rem', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Truck size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Shipment Tracking Number (AWB)
              </span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                {order.tracking_number || 'TN-BLR-PENDING'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Carrier Partner: <strong>{order.carrier_name || 'Heritage Bespoke Express'}</strong> &bull; {order.delivery_type}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Current Live Status:</span>
            <span className="badge badge-amber" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
              {currentShipmentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Live Shipment Progress Stepper */}
      <div className="card" style={{ marginBottom: '1.75rem', padding: '2rem 1.5rem' }}>
        <h3 className="heading-serif" style={{ fontSize: '1.15rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Live Shipment & Production Milestones
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {SHIPMENT_STAGES.map((stageName, idx) => {
            const isPassed = currentStageIndex >= idx;
            const isCurrent = currentStageIndex === idx;

            return (
              <div key={stageName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: isPassed ? '#10b981' : '#e2e8f0',
                  color: isPassed ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.25)' : 'none',
                  transition: 'all 0.25s ease'
                }}>
                  {isPassed ? <CheckCircle2 size={20} /> : idx + 1}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? 700 : 500,
                  marginTop: '0.5rem',
                  color: isCurrent ? 'var(--primary)' : isPassed ? '#10b981' : 'var(--text-muted)',
                  textAlign: 'center'
                }}>
                  {stageName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advance Payment Verification Status Box */}
      <div className="card" style={{ marginBottom: '1.75rem', backgroundColor: '#fffdf7', border: '1.5px solid #fde68a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #fde68a', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} color="var(--accent)" />
            <h3 className="heading-serif" style={{ fontSize: '1.15rem' }}>
              Advance Payment & Verification Status
            </h3>
          </div>

          <StatusBadge status={order.payment_status} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Order Value</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{formatCurrency(order.total_amount)}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Advance Paid / Credited</span>
            <strong style={{ fontSize: '1.1rem', color: '#15803d' }}>{formatCurrency(order.advance_amount)}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Balance Due at Handover</span>
            <strong style={{ fontSize: '1.1rem', color: order.remaining_amount > 0 ? '#b91c1c' : '#15803d' }}>
              {formatCurrency(order.remaining_amount)}
            </strong>
          </div>
        </div>

        {/* Latest Payment Reference Details */}
        {latestPayment && (
          <div style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                Latest Payment Reference (UTR):
              </span>
              <code style={{ fontSize: '0.85rem', fontWeight: 600 }}>{latestPayment.reference_utr}</code>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Amount: {formatCurrency(latestPayment.amount)} &bull; {formatDateTime(latestPayment.created_at)}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Verification State:</span>
              <StatusBadge status={latestPayment.status} />
              {latestPayment.status === 'Rejected' && latestPayment.rejection_reason && (
                <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.2rem' }}>
                  {latestPayment.rejection_reason}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pay advance button if pending */}
        {order.remaining_amount > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsQRModalOpen(true)}
            >
              <QrCode size={14} /> Scan UPI QR to Pay Advance & Submit UTR
            </button>
          </div>
        )}
      </div>

      {/* Itemized Garments in this Order */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h3 className="heading-serif" style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          Garments in this Order
        </h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Garment Description</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>
                    <strong>{it.item_type}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {it.description}
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{it.size || 'Custom'}</span></td>
                  <td>{it.quantity}</td>
                  <td>{formatCurrency(it.price)}</td>
                  <td><strong>{formatCurrency(it.quantity * it.price)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment & Workshop Log Timeline */}
      <div className="card">
        <h3 className="heading-serif" style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          Tracking Activity Timeline
        </h3>

        {statusHistory.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No updates logged yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {statusHistory.map((h) => (
              <div
                key={h.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StatusBadge status={h.status} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{h.notes}</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatDateTime(h.changed_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Modal */}
      <QRPaymentModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        order={order}
        onSuccess={() => {
          showToast('Payment submitted for verification!', 'success');
          fetchOrder();
        }}
      />
    </div>
  );
};

export default OrderTrackingPage;
