import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../../services/orderService';
import { formatDate, formatDateTime } from '../../../utils/dateUtils';
import { formatCurrency, formatStatus } from '../../../utils/formatters';
import StatusBadge from '../../../components/StatusBadge';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import Modal from '../../../components/Modal';
import { useNotifications } from '../../../context/NotificationContext';
import {
  Scissors,
  ArrowLeft,
  FileDown,
  Truck,
  CreditCard,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Ruler
} from 'lucide-react';

const TAILOR_PIPELINE = [
  'ORDER_RECEIVED',
  'MEASUREMENT_TAKEN',
  'CUTTING',
  'STITCHING',
  'TRIAL',
  'READY',
  'DELIVERED'
];

const OrderDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Shipment / Tracking Modal State
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [shipmentStatus, setShipmentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [updatingShipment, setUpdatingShipment] = useState(false);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [additionalPayment, setAdditionalPayment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderService.getOrderById(id);
      if (res.success) {
        setData(res.data);
        setSelectedStatus(res.data.order.status);
        setShipmentStatus(res.data.order.shipment_status || 'Order Placed');
        setTrackingNumber(res.data.order.tracking_number || '');
        setCarrierName(res.data.order.carrier_name || '');
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setUpdatingStatus(true);
      const res = await orderService.updateStatus(id, {
        status: selectedStatus,
        notes: statusNotes
      });
      if (res.success) {
        showToast(res.message || 'Order status updated successfully', 'success');
        setIsStatusModalOpen(false);
        setStatusNotes('');
        fetchOrderDetails();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateShipment = async (e) => {
    e.preventDefault();
    try {
      setUpdatingShipment(true);
      const res = await orderService.updateShipment(id, {
        shipmentStatus,
        trackingNumber,
        carrierName
      });
      if (res.success) {
        showToast('Shipment & live tracking updated!', 'success');
        setIsShipmentModalOpen(false);
        fetchOrderDetails();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to update shipment.');
    } finally {
      setUpdatingShipment(false);
    }
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    const amt = parseFloat(additionalPayment) || 0;
    if (amt <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    try {
      setUpdatingPayment(true);
      const res = await orderService.updatePayment(id, {
        additionalAmount: amt,
        paymentMethod
      });
      if (res.success) {
        showToast('Payment recorded successfully', 'success');
        setIsPaymentModalOpen(false);
        setAdditionalPayment('');
        fetchOrderDetails();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to update payment.');
    } finally {
      setUpdatingPayment(false);
    }
  };

  if (loading) return <Loading message="Loading order details..." />;
  if (error) return <ErrorMessage message={error} retry={fetchOrderDetails} />;
  if (!data?.order) return <ErrorMessage message="Order not found." />;

  const { order, customer, measurement, items = [], payments = [], statusHistory = [] } = data;

  const currentStepIndex = TAILOR_PIPELINE.indexOf(order.status);

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
                Order #{order.order_number}
              </h2>
              <StatusBadge status={order.status} />
              <StatusBadge status={order.payment_status} />
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Booked on {formatDate(order.order_date)} &bull; Due for Delivery: <strong>{formatDate(order.expected_delivery_date)}</strong>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => window.open(`/api/pdf/orders/${id}`, '_blank')}
            title="Download Invoice PDF"
          >
            <FileDown size={16} /> Order Receipt PDF
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={order.remaining_amount <= 0}
          >
            <CreditCard size={16} /> Add Payment
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsShipmentModalOpen(true)}
          >
            <Truck size={16} /> Update Shipment & Tracking
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsStatusModalOpen(true)}
          >
            <RefreshCw size={16} /> Update Status
          </button>
        </div>
      </div>

      {/* Production Pipeline Visual Progress Tracker */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem 1rem' }}>
        <h4 className="heading-serif" style={{ fontSize: '1rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Workshop Production Pipeline
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', maxWidth: '900px', margin: '0 auto' }}>
          {TAILOR_PIPELINE.map((stage, idx) => {
            const isCompleted = currentStepIndex > idx || order.status === 'DELIVERED';
            const isActive = currentStepIndex === idx;

            return (
              <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? '#10b981' : isActive ? 'var(--accent)' : '#e2e8f0',
                  color: (isCompleted || isActive) ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  boxShadow: isActive ? '0 0 0 4px var(--accent-glow)' : 'none',
                  transition: 'all 0.25s ease'
                }}>
                  {isCompleted ? <CheckCircle size={18} /> : idx + 1}
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  marginTop: '0.5rem',
                  color: isActive ? 'var(--accent)' : isCompleted ? '#10b981' : 'var(--text-muted)',
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}>
                  {formatStatus(stage)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left Column: Order Items & Locked Measurements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Order Items Table */}
          <div className="card">
            <h3 className="heading-serif" style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Itemized Garments & Tailoring Tasks ({items.length})
            </h3>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Item Type & Description</th>
                    <th>Size/Fit</th>
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
                          {it.description || 'Custom tailored garment'}
                        </div>
                        {it.special_instructions && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.2rem' }}>
                            Instructions: {it.special_instructions}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                          {it.size || 'Custom'}
                        </span>
                      </td>
                      <td>{it.quantity}</td>
                      <td>{formatCurrency(it.price)}</td>
                      <td><strong>{formatCurrency(it.quantity * it.price)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Locked Measurement Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Ruler size={18} color="var(--accent)" />
                <h3 className="heading-serif" style={{ fontSize: '1.15rem' }}>
                  Locked Measurement Specification
                </h3>
              </div>
              {measurement ? (
                <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                  Version {measurement.version} ({measurement.unit})
                </span>
              ) : (
                <span className="badge badge-gray" style={{ fontSize: '0.75rem' }}>
                  No Linked Version
                </span>
              )}
            </div>

            {!measurement ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                This order was booked without locking a specific measurement version.
              </p>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {[
                    { label: 'Shoulder', val: measurement.shoulder },
                    { label: 'Chest', val: measurement.chest },
                    { label: 'Waist', val: measurement.waist },
                    { label: 'Hip', val: measurement.hip },
                    { label: 'Neck', val: measurement.neck },
                    { label: 'Sleeve', val: measurement.sleeve_length },
                    { label: 'Armhole', val: measurement.armhole },
                    { label: 'Shirt L', val: measurement.shirt_length },
                    { label: 'Pant L', val: measurement.pant_length },
                    { label: 'Thigh', val: measurement.thigh },
                    { label: 'Inseam', val: measurement.inseam },
                    { label: 'Outseam', val: measurement.outseam }
                  ].map((p) => (
                    <div key={p.label} style={{ background: '#f8fafc', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{p.label}</span>
                      <strong style={{ fontSize: '0.875rem' }}>
                        {p.val != null ? `${p.val} ${measurement.unit === 'cm' ? 'cm' : '"'}` : '—'}
                      </strong>
                    </div>
                  ))}
                </div>

                {measurement.notes && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <strong>Measurement Notes:</strong> {measurement.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer Info & Financial Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Customer Summary */}
          <div className="card">
            <h3 className="heading-serif" style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Customer Details
            </h3>

            <div style={{ fontSize: '0.875rem' }}>
              <Link to={`/admin/customers/${customer?.id}`} style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent)' }}>
                {customer?.name}
              </Link>
              <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Phone: {customer?.phone}
              </div>
              <div style={{ color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                Email: {customer?.email || 'N/A'}
              </div>

              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Delivery Method:</span>
                <strong>{order.delivery_type}</strong>
                {order.shipping_address && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                    {order.shipping_address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="card" style={{ backgroundColor: '#fffdf7', border: '1.5px solid #fde68a' }}>
            <h3 className="heading-serif" style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid #fde68a', paddingBottom: '0.5rem' }}>
              Payment Breakdown
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
              <strong style={{ fontSize: '1.05rem' }}>{formatCurrency(order.total_amount)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Advance Received:</span>
              <strong style={{ color: '#15803d' }}>{formatCurrency(order.advance_amount)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px dashed #fde68a', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Remaining Balance:</span>
              <strong style={{ fontSize: '1.15rem', color: order.remaining_amount > 0 ? '#b91c1c' : '#15803d' }}>
                {formatCurrency(order.remaining_amount)}
              </strong>
            </div>

            {/* Payments List */}
            {payments.length > 0 && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #fde68a' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Recorded Payment Deposits:
                </span>
                {payments.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.2rem 0' }}>
                    <span>{p.payment_method} ({formatDate(p.created_at)}):</span>
                    <strong>{formatCurrency(p.amount)} &bull; {p.status}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tracking Number & Carrier */}
          <div className="card">
            <h3 className="heading-serif" style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>
              Logistics & Tracking
            </h3>

            <div style={{ fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Shipment Status</span>
                <span className="badge badge-blue">{order.shipment_status || 'Order Placed'}</span>
              </div>
              <div style={{ marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Tracking Number</span>
                <strong>{order.tracking_number || 'Pending Assignment'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Courier Partner</span>
                <span>{order.carrier_name || 'In-House Delivery'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Production Status History Audit Log */}
      <div className="card">
        <h3 className="heading-serif" style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          Production Status Audit History
        </h3>

        {statusHistory.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No status change history recorded.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-main)', fontWeight: 500 }}>
                      {h.notes}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Changed by: {h.changed_by_name || 'System / Admin'}
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

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Production Status"
        maxWidth="480px"
      >
        <form onSubmit={handleUpdateStatus}>
          <div className="form-group">
            <label className="form-label">New Production Stage</label>
            <select
              className="form-control form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              required
            >
              <option value="ORDER_RECEIVED">Order Received</option>
              <option value="MEASUREMENT_TAKEN">Measurement Taken</option>
              <option value="CUTTING">Cutting (Fabric Pattern)</option>
              <option value="STITCHING">Stitching (Assembly)</option>
              <option value="TRIAL">Trial (Customer Fitting)</option>
              <option value="READY">Ready for Handover</option>
              <option value="DELIVERED">Delivered to Customer</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status Notes / Reason</label>
            <textarea
              rows="2"
              className="form-control"
              placeholder="e.g. Sleeves stitched, lining pressed, ready for fitting..."
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updatingStatus}>
              {updatingStatus ? 'Updating...' : 'Save Status Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Shipment & Tracking Update Modal */}
      <Modal
        isOpen={isShipmentModalOpen}
        onClose={() => setIsShipmentModalOpen(false)}
        title="Update Shipment & Live Tracking"
        maxWidth="480px"
      >
        <form onSubmit={handleUpdateShipment}>
          <div className="form-group">
            <label className="form-label">Shipment Milestone</label>
            <select
              className="form-control form-select"
              value={shipmentStatus}
              onChange={(e) => setShipmentStatus(e.target.value)}
              required
            >
              <option value="Order Placed">Order Placed</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tracking Number / AWB</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. TN-BLR-892101 or courier AWB"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Courier Partner Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. BlueDart, DTDC, SpeedPost"
              value={carrierName}
              onChange={(e) => setCarrierName(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsShipmentModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updatingShipment}>
              {updatingShipment ? 'Saving...' : 'Update Tracking'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Additional Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment Deposit"
        maxWidth="450px"
      >
        <form onSubmit={handleUpdatePayment}>
          <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Balance Remaining:</div>
            <strong style={{ fontSize: '1.2rem', color: '#b91c1c' }}>{formatCurrency(order.remaining_amount)}</strong>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Amount (₹) *</label>
            <input
              type="number"
              min="1"
              max={order.remaining_amount}
              step="50"
              className="form-control"
              placeholder={`Max: ${order.remaining_amount}`}
              value={additionalPayment}
              onChange={(e) => setAdditionalPayment(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-control form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Cash">Cash in Hand</option>
              <option value="UPI_QR">UPI / QR Code</option>
              <option value="Card">Debit / Credit Card</option>
              <option value="Bank Transfer">Bank Transfer / NEFT</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updatingPayment}>
              {updatingPayment ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrderDetails;
