import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { customerService } from '../../../services/customerService';
import { measurementService } from '../../../services/measurementService';
import { orderService } from '../../../services/orderService';
import { formatCurrency } from '../../../utils/formatters';
import { getTodayDateInput } from '../../../utils/dateUtils';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import { useNotifications } from '../../../context/NotificationContext';
import {
  Scissors,
  Plus,
  Trash2,
  ArrowLeft,
  Ruler,
  Calendar,
  CreditCard,
  MapPin,
  CheckCircle
} from 'lucide-react';

const CreateOrder = () => {
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId') || '';

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(preselectedCustomerId);
  const [measurementVersions, setMeasurementVersions] = useState([]);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState('');

  const [orderDate, setOrderDate] = useState(getTodayDateInput());
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7); // Default 7 days delivery
    return d.toISOString().slice(0, 10);
  });

  const [items, setItems] = useState([
    {
      item_type: 'Shirt',
      description: 'Custom Bespoke Fit',
      quantity: 1,
      price: 1800,
      size: 'Custom',
      special_instructions: ''
    }
  ]);

  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [deliveryType, setDeliveryType] = useState('Store Pickup');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Load Customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await customerService.getCustomers({ limit: 100 });
        if (res.success && res.data) {
          setCustomers(res.data.customers || []);
          if (preselectedCustomerId) {
            setSelectedCustomerId(preselectedCustomerId);
          } else if (res.data.customers?.length > 0) {
            setSelectedCustomerId(res.data.customers[0].id);
          }
        }
      } catch (err) {
        setError('Failed to load customers.');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [preselectedCustomerId]);

  // When customer changes, load their measurement versions
  useEffect(() => {
    if (!selectedCustomerId) return;
    const fetchMeasurements = async () => {
      try {
        const res = await measurementService.getCustomerMeasurements(selectedCustomerId);
        if (res.success && res.data) {
          const vers = res.data.versions || [];
          setMeasurementVersions(vers);
          const current = vers.find(v => v.is_current === 1 || v.is_current === true) || vers[0];
          setSelectedMeasurementId(current ? current.id : '');
        }
      } catch (err) {
        console.warn('Could not load measurements for customer:', err);
      }
    };
    fetchMeasurements();
  }, [selectedCustomerId]);

  // Calculate Total
  const totalAmount = items.reduce((sum, it) => {
    const q = parseInt(it.quantity, 10) || 0;
    const p = parseFloat(it.price) || 0;
    return sum + (q * p);
  }, 0);

  const remainingAmount = Math.max(0, totalAmount - (parseFloat(advanceAmount) || 0));

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        item_type: 'Pant',
        description: '',
        quantity: 1,
        price: 1500,
        size: 'Custom',
        special_instructions: ''
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      alert('Order must contain at least one item.');
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }

    if (new Date(expectedDeliveryDate) < new Date(orderDate)) {
      setError('Expected delivery date cannot be before the order date.');
      return;
    }

    const adv = parseFloat(advanceAmount) || 0;
    if (adv > totalAmount) {
      setError('Advance amount cannot exceed total order amount.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const orderPayload = {
        customerId: selectedCustomerId,
        measurementId: selectedMeasurementId || null,
        orderDate,
        expectedDeliveryDate,
        advanceAmount: adv,
        items,
        deliveryType,
        shippingAddress: deliveryType === 'Courier Delivery' ? shippingAddress : null,
        notes
      };

      const res = await orderService.createOrder(orderPayload);
      if (res.success && res.data) {
        showToast(`Order created successfully! (${res.data.orderNumber})`, 'success');
        navigate(`/admin/orders/${res.data.orderId}`);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Preparing order creation workspace..." />;

  const itemTypeOptions = [
    'Shirt', 'Pant', 'Blouse', 'Saree Blouse', 'Kurta', 'Kurta Pajama',
    '2-Piece Suit', '3-Piece Suit', 'Sherwani', 'Safari Suit',
    'Dress', 'Lehenga Choli Skirt', 'Waistcoat / Nehru Jacket', 'Custom Item'
  ];

  return (
    <div>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => navigate('/admin/orders')}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft size={16} /> Back to Orders
        </button>
        <div>
          <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
            Create New Bespoke Order
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Configure garment items, lock customer measurement version, and record advance deposit.
          </span>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Left Column: Customer & Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Customer & Measurement Version Card */}
            <div className="card">
              <h3 className="heading-serif" style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                1. Customer & Measurement Selection
              </h3>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Customer *</label>
                  <select
                    className="form-control form-select"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    required
                  >
                    <option value="">Select a customer...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Lock Measurement Version</label>
                  <select
                    className="form-control form-select"
                    value={selectedMeasurementId}
                    onChange={(e) => setSelectedMeasurementId(e.target.value)}
                  >
                    {measurementVersions.length === 0 ? (
                      <option value="">No measurements saved for customer</option>
                    ) : (
                      measurementVersions.map((v) => (
                        <option key={v.id} value={v.id}>
                          Version {v.version} ({v.unit}) {v.is_current ? '— Current' : ''}
                        </option>
                      ))
                    )}
                  </select>
                  {measurementVersions.length === 0 && selectedCustomerId && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.2rem', display: 'block' }}>
                      <Link to={`/admin/customers/${selectedCustomerId}`}>Take measurements first</Link> or proceed with standard custom sizing.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Itemized Garments Builder Card */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <h3 className="heading-serif" style={{ fontSize: '1.15rem' }}>
                  2. Order Items ({items.length})
                </h3>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddItem}
                >
                  <Plus size={14} /> Add Another Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
                        Item #{index + 1}
                      </strong>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                          title="Remove Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid-3" style={{ marginBottom: '0.75rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Garment Type</label>
                        <select
                          className="form-control form-select"
                          value={item.item_type}
                          onChange={(e) => handleItemChange(index, 'item_type', e.target.value)}
                        >
                          {itemTypeOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Price per Item (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          className="form-control"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Item Description / Fabric Style</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Navy Blue Raw Silk with Gold Piping"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Special Tailor Instructions</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Double vents, 2.5 inch cuff, deep back neck"
                          value={item.special_instructions}
                          onChange={(e) => handleItemChange(index, 'special_instructions', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Schedule & Financial Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Delivery Dates & Logistics */}
            <div className="card">
              <h3 className="heading-serif" style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                3. Delivery Dates & Method
              </h3>

              <div className="form-group">
                <label className="form-label">Order Booking Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Delivery Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={expectedDeliveryDate}
                  min={orderDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Mode</label>
                <select
                  className="form-control form-select"
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value)}
                >
                  <option value="Store Pickup">Store Pickup</option>
                  <option value="Courier Delivery">Courier Delivery</option>
                </select>
              </div>

              {deliveryType === 'Courier Delivery' && (
                <div className="form-group">
                  <label className="form-label">Courier Shipping Address</label>
                  <textarea
                    rows="2"
                    className="form-control"
                    placeholder="Delivery street, landmark, city, pin"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Financial Calculation & Payment Card */}
            <div className="card" style={{ backgroundColor: '#fffdf7', border: '1.5px solid #fde68a' }}>
              <h3 className="heading-serif" style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid #fde68a', paddingBottom: '0.5rem' }}>
                4. Payment & Advance Summary
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.925rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Calculated Amount:</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>
                  {formatCurrency(totalAmount)}
                </strong>
              </div>

              <div className="form-group" style={{ margin: '0.75rem 0' }}>
                <label className="form-label">Advance Deposit Received (₹)</label>
                <input
                  type="number"
                  min="0"
                  max={totalAmount}
                  step="100"
                  className="form-control"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px dashed #fde68a', fontSize: '0.925rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Balance Remaining at Delivery:</span>
                <strong style={{ fontSize: '1.1rem', color: remainingAmount > 0 ? '#b91c1c' : '#15803d' }}>
                  {formatCurrency(remainingAmount)}
                </strong>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment Status: </span>
                <strong style={{ fontSize: '0.75rem', color: remainingAmount === 0 ? 'var(--success)' : advanceAmount > 0 ? 'var(--accent)' : 'var(--danger)' }}>
                  {remainingAmount === 0 ? 'PAID IN FULL' : advanceAmount > 0 ? 'PARTIALLY PAID' : 'PENDING'}
                </strong>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">General Order Notes</label>
                <textarea
                  rows="2"
                  className="form-control"
                  placeholder="Special instructions or trial urgency notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={submitting || totalAmount <= 0}
              >
                {submitting ? 'Generating Order...' : `Confirm & Place Order (${formatCurrency(totalAmount)})`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;
