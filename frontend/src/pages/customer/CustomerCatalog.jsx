import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { orderService } from '../../services/orderService';
import { getTodayDateInput } from '../../utils/dateUtils';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Modal from '../../components/Modal';
import SizeGuideModal from '../../components/SizeGuideModal';
import QRPaymentModal from '../../components/QRPaymentModal';
import {
  ShoppingBag,
  Ruler,
  Check,
  Sparkles,
  Info,
  CreditCard,
  QrCode
} from 'lucide-react';

const CustomerCatalog = () => {
  const { customer, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Selected Product for Ordering
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [deliveryType, setDeliveryType] = useState('Store Pickup');
  const [shippingAddress, setShippingAddress] = useState(customer?.address || '');

  // Checkout & QR Payment States
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrderData, setPlacedOrderData] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Size Guide Modal State
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const { showToast } = useNotifications();

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await productService.getProducts({
        category: categoryFilter !== 'all' ? categoryFilter : undefined
      });
      if (res.success) setProducts(res.data || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [categoryFilter]);

  const handleOpenOrder = (prod) => {
    setSelectedProduct(prod);
    const sizes = prod.available_sizes ? prod.available_sizes.split(',') : ['M'];
    setSelectedSize(sizes[0] || 'M');
    setQuantity(1);
    setSpecialInstructions('');
    setShippingAddress(customer?.address || '');
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!customer?.id) {
      alert('Please complete your profile or log in to place orders.');
      return;
    }

    try {
      setPlacingOrder(true);

      const today = getTodayDateInput();
      const dDate = new Date();
      dDate.setDate(dDate.getDate() + 8);
      const expectedDeliveryDate = dDate.toISOString().slice(0, 10);

      const itemTotal = (parseFloat(selectedProduct.base_price) || 0) * quantity;
      const advanceRequired = Math.round(itemTotal * 0.5); // 50% advance

      const orderPayload = {
        customerId: customer.id,
        orderDate: today,
        expectedDeliveryDate,
        advanceAmount: 0, // initially 0 until UPI QR reference submitted
        items: [
          {
            productId: selectedProduct.id,
            item_type: selectedProduct.category,
            description: `${selectedProduct.name} - ${selectedProduct.fabric_details || 'Standard'}`,
            quantity,
            price: selectedProduct.base_price,
            size: selectedSize,
            special_instructions: specialInstructions
          }
        ],
        deliveryType,
        shippingAddress: deliveryType === 'Courier Delivery' ? shippingAddress : null,
        notes: `Online catalog order: Size ${selectedSize}`
      };

      const res = await orderService.createOrder(orderPayload);
      if (res.success && res.data) {
        showToast('Order confirmed! Please scan the UPI QR code to complete advance payment.', 'success');
        const newOrder = {
          id: res.data.orderId,
          order_number: res.data.orderNumber,
          total_amount: res.data.totalAmount,
          advance_amount: 0,
          remaining_amount: res.data.totalAmount
        };
        setPlacedOrderData(newOrder);
        setSelectedProduct(null);
        setIsQRModalOpen(true);
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <Loading message="Loading tailoring apparel catalog..." />;

  const categories = ['all', 'Suits', 'Shirts', 'Kurtas', 'Blouses', 'Trousers', 'Dresses'];

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
        <div>
          <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
            Bespoke Garments & Fabric Catalog
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Choose your garment, select your size from XS to 3XL+, and book with easy UPI/QR advance payment.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => setIsSizeGuideOpen(true)}
        >
          <Ruler size={16} /> Size Guide & Recommender
        </button>
      </div>

      {error && <ErrorMessage message={error} retry={fetchCatalog} />}

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat === 'all' ? 'All Garments' : cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {products.map((p) => {
          const sizes = p.available_sizes ? p.available_sizes.split(',') : ['S', 'M', 'L', 'XL'];
          return (
            <div key={p.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={p.image_url || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600'}
                  alt={p.name}
                  style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                />
                <span className="badge badge-amber" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  {p.category}
                </span>
              </div>

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h4 className="heading-serif" style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                  {p.name}
                </h4>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Fabric: <strong>{p.fabric_details || 'Bespoke Premium Fabric'}</strong>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: 1.4, flex: 1, marginBottom: '0.75rem' }}>
                  {p.description}
                </p>

                {/* Available Sizes Pills */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Available Sizes:
                  </span>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {sizes.map((s) => (
                      <span key={s} style={{
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Starting Price</span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                      {formatCurrency(p.base_price)}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleOpenOrder(p)}
                  >
                    <ShoppingBag size={14} /> Stitch / Order
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Garment Order Configuration Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={`Order: ${selectedProduct.name}`}
          maxWidth="550px"
        >
          <form onSubmit={handleConfirmOrder}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
              />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedProduct.name}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedProduct.fabric_details}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', marginTop: '0.25rem' }}>
                  {formatCurrency(selectedProduct.base_price)}
                </div>
              </div>
            </div>

            {/* Size Selection */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Choose Size *</label>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Size Guide &rarr;
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                {selectedProduct.available_sizes.split(',').map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s.trim())}
                    className={`btn btn-sm ${selectedSize === s.trim() ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ minWidth: '45px' }}
                  >
                    {s.trim()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-control"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
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
            </div>

            {deliveryType === 'Courier Delivery' && (
              <div className="form-group">
                <label className="form-label">Delivery Shipping Address *</label>
                <textarea
                  rows="2"
                  className="form-control"
                  placeholder="Street, City, Pincode"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Special Tailoring Notes / Fit Adjustments</label>
              <textarea
                rows="2"
                className="form-control"
                placeholder="e.g. Slightly longer sleeves, double vent, loose collar..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>

            {/* Advance Deposit Notice */}
            <div style={{ backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', fontSize: '0.8125rem', color: '#92400e', marginBottom: '1.25rem' }}>
              <strong>Total Amount: {formatCurrency(selectedProduct.base_price * quantity)}</strong>
              <div style={{ marginTop: '0.2rem' }}>
                A 50% advance deposit ({formatCurrency(Math.round(selectedProduct.base_price * quantity * 0.5))}) can be paid instantly via UPI/QR code upon confirming!
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={placingOrder}>
                {placingOrder ? 'Confirming...' : 'Confirm Order & Pay Advance'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* QR Advance Payment Modal */}
      <QRPaymentModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        order={placedOrderData}
        onSuccess={() => {
          showToast('Payment submitted! Tracking is now active.', 'success');
        }}
      />
    </div>
  );
};

export default CustomerCatalog;
