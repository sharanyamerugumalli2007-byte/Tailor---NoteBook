import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CustomerSidebar from '../../components/CustomerSidebar';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner, EmptyState, ConfirmationModal } from '../../components/CommonComponents';
import { getOrderById, cancelOrder } from '../../services/orderService';
import {
  Scissors,
  ArrowLeft,
  Ruler,
  Truck,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  MapPin,
  Calendar
} from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = () => {
    setLoading(true);
    getOrderById(id)
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message || 'Failed to load order details.'))
      .finally(() => setLoading(false));
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await cancelOrder(order.id, cancelReason);
      setCancelModalOpen(false);
      fetchOrder();
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving order specs..." size="large" />;
  if (error || !order) {
    return (
      <div className="portal-page">
        <div className="container portal-container">
          <CustomerSidebar />
          <main className="portal-content">
            <EmptyState
              title="Order Not Found"
              description={error || "We couldn't retrieve the specified order details."}
              actionText="Back to My Orders"
              onAction={() => navigate('/customer/orders')}
            />
          </main>
        </div>
      </div>
    );
  }

  // Parse measurement snapshot
  let snapshot = null;
  if (order.measurement_snapshot) {
    try {
      snapshot = typeof order.measurement_snapshot === 'string'
        ? JSON.parse(order.measurement_snapshot)
        : order.measurement_snapshot;
    } catch (e) {}
  }

  const advReq = Number(order.advance_required) || 0;
  const advPaid = Number(order.advance_paid) || 0;
  const needsAdvance = advReq > advPaid && order.payment_status !== 'VERIFIED';
  const canCancel = ['ORDER_PLACED', 'CONFIRMED'].includes(order.status);

  return (
    <div className="portal-page">
      <div className="container portal-container">
        <CustomerSidebar />

        <main className="portal-content">
          <div className="order-nav-top mb-3">
            <Link to="/customer/orders" className="back-link">
              <ArrowLeft size={16} />
              <span>Back to My Orders</span>
            </Link>
          </div>

          {/* Main Order Header Card */}
          <div className="order-header-card studio-card">
            <div className="order-header-main">
              <div>
                <span className="section-tag">Digital Tailoring Docket</span>
                <h1 className="order-page-title font-serif">Order #{order.order_number}</h1>
                <p className="order-date-line">
                  Created on {new Date(order.created_at).toLocaleString()}
                </p>
              </div>

              <div className="order-header-badges">
                <StatusBadge status={order.payment_status} type="payment" />
                <StatusBadge status={order.status} type="order" />
              </div>
            </div>

            {/* Quick Advance Prompt */}
            {needsAdvance && (
              <div className="advance-action-banner animate-fade mt-3">
                <div className="adv-banner-txt">
                  <Clock size={18} className="text-warning" />
                  <span>
                    Advance of <strong>₹{advReq.toFixed(2)}</strong> required to start master cutting.
                  </span>
                </div>
                <Link to="/customer/payments" className="btn btn-primary btn-sm">
                  <CreditCard size={14} />
                  <span>Pay UPI Advance Now</span>
                </Link>
              </div>
            )}
          </div>

          {/* Grid Layout: Garment Specs & Measurement Snapshot */}
          <div className="grid-2">
            {/* Customization Specs */}
            <div className="details-card studio-card">
              <h3 className="card-section-title font-serif">
                <Scissors size={18} /> Garment & Styling Specs
              </h3>

              <div className="specs-list">
                <div className="spec-item">
                  <span className="spec-label">Garment Type</span>
                  <span className="spec-val">{order.garment_type} (Qty: {order.quantity})</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Fabric Source</span>
                  <span className="spec-val">{order.fabric_source === 'customer_provided' ? 'Customer Fabric' : 'Studio Fabric (+₹300)'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Fabric Material</span>
                  <span className="spec-val">{order.fabric_type || 'Customer Spec'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Color / Pattern</span>
                  <span className="spec-val">{order.color || 'Standard'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Sleeve Design</span>
                  <span className="spec-val">{order.sleeve_style || 'Standard'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Neckline Style</span>
                  <span className="spec-val">{order.neck_design || 'Standard'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Fit Preference</span>
                  <span className="spec-val">{order.fit_preference || 'Custom Fit'}</span>
                </div>
                {order.customization_notes && (
                  <div className="spec-item notes-item">
                    <span className="spec-label">Special Notes</span>
                    <span className="spec-val notes-val">{order.customization_notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Saved Measurement Snapshot */}
            <div className="details-card studio-card">
              <h3 className="card-section-title font-serif">
                <Ruler size={18} /> Measurement Snapshot (Preserved)
              </h3>

              {snapshot ? (
                <div className="snapshot-grid">
                  <div className="snap-metric">
                    <span className="snap-lbl">Unit</span>
                    <span className="snap-val">{snapshot.unit || 'in'}</span>
                  </div>
                  {snapshot.bust && <div className="snap-metric"><span className="snap-lbl">Bust/Chest</span><span className="snap-val">{snapshot.bust} {snapshot.unit || 'in'}</span></div>}
                  {snapshot.waist && <div className="snap-metric"><span className="snap-lbl">Waist</span><span className="snap-val">{snapshot.waist} {snapshot.unit || 'in'}</span></div>}
                  {snapshot.hip && <div className="snap-metric"><span className="snap-lbl">Hip</span><span className="snap-val">{snapshot.hip} {snapshot.unit || 'in'}</span></div>}
                  {snapshot.shoulder && <div className="snap-metric"><span className="snap-lbl">Shoulder</span><span className="snap-val">{snapshot.shoulder} {snapshot.unit || 'in'}</span></div>}
                  {snapshot.sleeve_length && <div className="snap-metric"><span className="snap-lbl">Sleeve Length</span><span className="snap-val">{snapshot.sleeve_length} {snapshot.unit || 'in'}</span></div>}
                  {snapshot.armhole && <div className="snap-metric"><span className="snap-lbl">Armhole</span><span className="snap-val">{snapshot.armhole} {snapshot.unit || 'in'}</span></div>}
                  {snapshot.shirt_length && <div className="snap-metric"><span className="snap-lbl">Length</span><span className="snap-val">{snapshot.shirt_length} {snapshot.unit || 'in'}</span></div>}
                  {snapshot.neck && <div className="snap-metric"><span className="snap-lbl">Front Neck</span><span className="snap-val">{snapshot.neck} {snapshot.unit || 'in'}</span></div>}
                  {snapshot.inseam && <div className="snap-metric"><span className="snap-lbl">Inseam</span><span className="snap-val">{snapshot.inseam} {snapshot.unit || 'in'}</span></div>}
                  {snapshot.outseam && <div className="snap-metric"><span className="snap-lbl">Outseam</span><span className="snap-val">{snapshot.outseam} {snapshot.unit || 'in'}</span></div>}
                </div>
              ) : (
                <p className="text-muted">Standard size pattern utilized for this order cut.</p>
              )}

              <div className="delivery-summary-box mt-4">
                <h4 className="del-box-title"><MapPin size={16} /> Delivery Address</h4>
                <p className="del-addr-txt">
                  {order.delivery_address}, {order.delivery_city}, {order.delivery_state} {order.delivery_postal_code}
                </p>
                {order.preferred_delivery_date && (
                  <p className="del-date-txt">
                    <Calendar size={14} /> Preferred Delivery: {new Date(order.preferred_delivery_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Breakdown & Status History */}
          <div className="grid-2">
            {/* Financial Summary */}
            <div className="details-card studio-card">
              <h3 className="card-section-title font-serif">
                <CreditCard size={18} /> Financial Summary
              </h3>

              <div className="price-lines-box">
                <div className="p-row">
                  <span>Unit Price ({order.quantity}x):</span>
                  <span>₹{Number(order.unit_price * order.quantity).toFixed(2)}</span>
                </div>
                {Number(order.customization_price) > 0 && (
                  <div className="p-row">
                    <span>Fabric Surcharge:</span>
                    <span>₹{Number(order.customization_price).toFixed(2)}</span>
                  </div>
                )}
                <div className="p-row">
                  <span>Delivery Logistics:</span>
                  <span>₹{Number(order.delivery_fee).toFixed(2)}</span>
                </div>
                <div className="p-row total-p-row">
                  <span>Total Order Value:</span>
                  <span className="text-rose font-bold">₹{Number(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="p-row">
                  <span>Advance Paid:</span>
                  <span className="text-success font-bold">₹{advPaid.toFixed(2)}</span>
                </div>
                <div className="p-row remaining-p-row">
                  <span>Remaining Balance Due:</span>
                  <span className="font-bold">₹{Number(order.remaining_balance).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Status History Stepper */}
            <div className="details-card studio-card">
              <h3 className="card-section-title font-serif">
                <Clock size={18} /> Stitching Status History
              </h3>

              <div className="history-timeline">
                {(order.history || []).map((h, idx) => (
                  <div key={h.id || idx} className="timeline-item">
                    <div className="timeline-marker">
                      <CheckCircle2 size={14} />
                    </div>
                    <div className="timeline-body">
                      <div className="timeline-title-row">
                        <span className="timeline-status">{h.status.replace(/_/g, ' ')}</span>
                        <span className="timeline-time">{new Date(h.changed_at).toLocaleString()}</span>
                      </div>
                      <p className="timeline-notes">{h.notes || 'Status updated by atelier team.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cancellation Option */}
          {canCancel && (
            <div className="cancel-order-bar studio-card">
              <div>
                <h4 className="cancel-title">Need to cancel this order?</h4>
                <p className="cancel-desc">
                  Orders in 'Order Placed' or 'Confirmed' stages may be cancelled before cutting begins.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="btn btn-outline btn-sm btn-cancel-action"
              >
                <XCircle size={16} />
                <span>Cancel Order</span>
              </button>
            </div>
          )}

          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={cancelModalOpen}
            title="Cancel Tailoring Order?"
            message="Are you sure you want to cancel this order? This action will halt fabric preparation."
            confirmText="Yes, Cancel Order"
            cancelText="Keep Order"
            isDanger={true}
            isLoading={cancelling}
            onConfirm={handleCancelOrder}
            onCancel={() => setCancelModalOpen(false)}
          />
        </main>
      </div>

      <style>{`
        .order-nav-top {
          display: flex;
          align-items: center;
        }
        .order-header-card {
          padding: 2rem 2.5rem;
          background: #ffffff;
        }
        .order-header-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .order-page-title {
          font-size: 2.2rem;
          margin: 0.2rem 0;
        }
        .order-date-line {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .order-header-badges {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .advance-action-banner {
          background: #FFF0F5;
          border: 1px solid var(--primary-pink);
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .adv-banner-txt {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--deep-rose);
        }
        .details-card {
          padding: 2rem;
          background: #ffffff;
        }
        .card-section-title {
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.65rem;
          border-bottom: 1px solid var(--border-color);
        }
        .specs-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .spec-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          padding-bottom: 0.4rem;
          border-bottom: 1px dashed var(--bg-main);
        }
        .spec-label { color: var(--text-muted); }
        .spec-val { font-weight: 600; color: var(--text-main); }
        .notes-item {
          flex-direction: column;
          gap: 0.25rem;
        }
        .notes-val {
          font-size: 0.825rem;
          color: var(--text-muted);
          font-style: italic;
        }
        .snapshot-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        .snap-metric {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
        }
        .snap-lbl {
          font-size: 0.7rem;
          color: var(--text-light);
          text-transform: uppercase;
        }
        .snap-val {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--deep-rose);
        }
        .delivery-summary-box {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 1rem 1.25rem;
          border-radius: var(--radius-md);
        }
        .del-box-title {
          font-size: 0.9rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.35rem;
        }
        .del-addr-txt {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.45;
        }
        .del-date-txt {
          font-size: 0.8rem;
          color: var(--deep-rose);
          font-weight: 600;
          margin-top: 0.35rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .price-lines-box {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .p-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .total-p-row {
          font-size: 1.15rem;
          color: var(--text-main);
          padding-top: 0.75rem;
          border-top: 1px dashed var(--border-color);
        }
        .remaining-p-row {
          font-size: 1rem;
          color: var(--text-main);
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-color);
        }
        .font-bold { font-weight: 700; }
        .history-timeline {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
          padding-left: 1.5rem;
        }
        .history-timeline::before {
          content: '';
          position: absolute;
          left: 6px;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: var(--border-color);
        }
        .timeline-item {
          position: relative;
        }
        .timeline-marker {
          position: absolute;
          left: -1.5rem;
          top: 2px;
          width: 16px;
          height: 16px;
          border-radius: var(--radius-full);
          background: var(--rose-accent);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .timeline-title-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.2rem;
        }
        .timeline-status {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--deep-rose);
        }
        .timeline-time {
          font-size: 0.725rem;
          color: var(--text-light);
        }
        .timeline-notes {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .cancel-order-bar {
          padding: 1.25rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FFF8FA;
          border: 1px solid #FFCDD2;
        }
        .cancel-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--error);
        }
        .cancel-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .btn-cancel-action {
          color: var(--error);
          border-color: #FFCDD2;
        }
      `}</style>
    </div>
  );
}
