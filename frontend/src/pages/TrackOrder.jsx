import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { orderService } from '../services/orderService';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatters';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Scissors,
  Ruler,
  Layers,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  FileDown,
  ChevronRight
} from 'lucide-react';

const TRACKING_STAGES = [
  { id: 'Order Placed', label: 'Order Placed', icon: ShoppingBag, desc: 'Bespoke order confirmed & advance recorded' },
  { id: 'Measurement Confirmed', label: 'Measurement Confirmed', icon: Ruler, desc: 'Measurements verified by master tailor' },
  { id: 'Fabric Received', label: 'Fabric Received', icon: Layers, desc: 'Selected fabric inspected & pre-washed' },
  { id: 'Cutting', label: 'Cutting & Drafting', icon: Scissors, desc: 'Individual body pattern drafted and cut' },
  { id: 'Stitching', label: 'Master Stitching', icon: Sparkles, desc: 'Garment assembled with lining & canvas' },
  { id: 'Quality Check', label: 'Quality & Steam Press', icon: CheckCircle2, desc: 'Seams, hemline, and finish inspected' },
  { id: 'Ready for Delivery', label: 'Ready for Delivery', icon: Package, desc: 'Bagged & prepared for store trial or dispatch' },
  { id: 'Out for Delivery', label: 'Out for Delivery', icon: Truck, desc: 'Assigned to courier with live tracking' },
  { id: 'Delivered', label: 'Delivered & Fitted', icon: CheckCircle2, desc: 'Delivered to customer with 100% fit assurance' }
];

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [orderQuery, setOrderQuery] = useState(initialId);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (queryToSearch) => {
    const q = queryToSearch || orderQuery;
    if (!q || !q.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      // First try fetching orders by query term or specific ID
      const res = await orderService.getOrders({ q: q.trim(), limit: 5 });
      if (res.success && res.data?.orders?.length > 0) {
        // Fetch full details of the matched order
        const matched = res.data.orders[0];
        const detailRes = await orderService.getOrderById(matched.id);
        if (detailRes.success && detailRes.data) {
          setOrderData(detailRes.data);
        } else {
          setOrderData({ order: matched });
        }
      } else {
        // Fallback: try direct ID lookup if numeric
        if (!isNaN(q.trim())) {
          const directRes = await orderService.getOrderById(q.trim());
          if (directRes.success && directRes.data?.order) {
            setOrderData(detailRes.data);
          } else {
            setError(`No order found matching "${q}". Please verify your Order Number or Tracking ID.`);
            setOrderData(null);
          }
        } else {
          setError(`No order found matching "${q}". Please verify your Order Number or Tracking ID.`);
          setOrderData(null);
        }
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to retrieve order status. Please try again.');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const order = orderData?.order;
  const currentStageName = order?.shipment_status || 'Order Placed';
  
  // Map current stage to stage index
  const stageMap = {
    'Order Placed': 0,
    'Confirmed': 1,
    'Measurement Confirmed': 1,
    'Fabric Received': 2,
    'Cutting': 3,
    'Processing': 4,
    'Stitching': 4,
    'Quality Check': 5,
    'Ready for Delivery': 6,
    'Ready': 6,
    'Out for Delivery': 7,
    'Delivered': 8
  };

  const currentStageIndex = stageMap[currentStageName] !== undefined ? stageMap[currentStageName] : 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '3.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--rose-primary)', fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <Package size={16} /> Live Tailoring Progress
          </div>
          <h1 className="heading-serif" style={{ fontSize: '2.4rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            Track Your Bespoke Order
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            View real-time workshop milestones from fabric inspection to master stitching and doorstep dispatch.
          </p>
        </div>

        {/* Search Bar */}
        <div className="card" style={{ maxWidth: '650px', margin: '0 auto 3rem', padding: '1.75rem', border: '1.5px solid var(--pink-border)' }}>
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Enter Order ID (e.g., ORD-1001, TC-2026-000001)..."
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.6rem' }}
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Track Status'}
            </button>
          </form>

          {/* Quick Demo Pill Suggestions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span>Quick Try:</span>
            {['ORD-1001', 'ORD-1002', 'ORD-1003', 'ORD-1004', 'ORD-1005'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => { setOrderQuery(id); handleSearch(id); }}
                className="btn btn-soft-pink btn-sm"
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid var(--pink-soft)', borderTopColor: 'var(--rose-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }} />
            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>Fetching live workshop status...</div>
          </div>
        )}

        {error && !loading && (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', borderColor: 'var(--pink-accent)' }}>
            <AlertCircle size={36} className="text-rose" style={{ margin: '0 auto 1rem' }} />
            <h3 className="heading-serif" style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              Order Not Found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
              {error}
            </p>
            <Link to="/customer/orders" className="btn btn-secondary btn-sm">
              View All My Orders
            </Link>
          </div>
        )}

        {/* Successful Order Details & 9-Stage Stepper */}
        {order && !loading && (
          <div className="card" style={{ overflow: 'hidden', border: '1.5px solid var(--pink-border)', boxShadow: 'var(--shadow-lg)' }}>
            {/* Header Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e8 100%)',
              padding: '1.75rem 2rem',
              borderBottom: '1px solid var(--pink-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
                    Order #{order.order_number}
                  </h2>
                  <span className="badge badge-rose">{order.status || 'STITCHING'}</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Booked: <strong>{formatDate(order.order_date)}</strong> &bull; Target Delivery: <strong>{formatDate(order.expected_delivery_date)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <a
                  href={`/api/pdf/orders/${order.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <FileDown size={15} /> Download PDF Receipt
                </a>
              </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: '2rem' }}>
              {/* Order Info Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2.5rem'
              }}>
                <div style={{ background: 'var(--pink-blush)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--pink-soft)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Customer</span>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginTop: '2px' }}>{orderData?.customer?.name || order.customer_name || 'Client'}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{orderData?.customer?.phone || order.customer_phone}</div>
                </div>

                <div style={{ background: 'var(--pink-blush)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--pink-soft)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Payment Status</span>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginTop: '2px', color: order.payment_status === 'Paid' ? 'var(--success)' : 'var(--rose-primary)' }}>
                    {order.payment_status || 'Partially Paid'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Total: {formatCurrency(order.total_amount)} | Adv: {formatCurrency(order.advance_amount)}
                  </div>
                </div>

                <div style={{ background: 'var(--pink-blush)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--pink-soft)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Carrier / Dispatch</span>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginTop: '2px' }}>
                    {order.carrier_name || 'Studio Express'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Tracking: <strong>{order.tracking_number || order.order_number}</strong>
                  </div>
                </div>

                <div style={{ background: 'var(--pink-blush)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--pink-soft)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Delivery Type</span>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginTop: '2px' }}>
                    {order.delivery_type || 'Courier Delivery'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {order.shipping_address ? order.shipping_address.substring(0, 30) + '...' : 'Studio Collection'}
                  </div>
                </div>
              </div>

              {/* 9-Stage Visual Milestone Stepper */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 className="heading-serif" style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} className="text-rose" /> Production & Dispatch Milestones
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {TRACKING_STAGES.map((stg, idx) => {
                    const isPassed = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    const IconComponent = stg.icon;

                    return (
                      <div
                        key={stg.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1.25rem',
                          padding: '1rem 1.25rem',
                          borderRadius: 'var(--radius-md)',
                          background: isCurrent ? 'var(--pink-soft)' : isPassed ? '#ffffff' : 'var(--pink-blush)',
                          border: isCurrent ? '1.5px solid var(--rose-primary)' : isPassed ? '1px solid #a7f3d0' : '1px solid var(--pink-soft)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: isCurrent ? 'var(--rose-gradient)' : isPassed ? 'var(--success)' : '#e2e8f0',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: isCurrent ? 'var(--shadow-rose)' : 'none'
                        }}>
                          {isPassed ? <CheckCircle2 size={20} /> : <IconComponent size={20} />}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{
                              fontWeight: 700,
                              fontSize: '1rem',
                              color: isCurrent ? 'var(--rose-primary)' : isPassed ? 'var(--primary)' : 'var(--text-muted)'
                            }}>
                              {stg.label}
                            </div>
                            {isCurrent && (
                              <span className="badge badge-rose pulse-glow">Current Stage</span>
                            )}
                            {isPassed && (
                              <span className="badge badge-green">Completed</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {stg.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items Table if available */}
              {orderData?.items?.length > 0 && (
                <div>
                  <h3 className="heading-serif" style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                    Itemized Garments
                  </h3>
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Item / Garment</th>
                          <th>Size / Type</th>
                          <th>Instructions</th>
                          <th style={{ textAlign: 'right' }}>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderData.items.map((item, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{item.description || item.item_type}</td>
                            <td><span className="badge badge-pink">{item.size || 'Custom Fit'}</span></td>
                            <td style={{ color: 'var(--text-muted)' }}>{item.special_instructions || 'Standard stitching'}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--rose-dark)' }}>{formatCurrency(item.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrder;
