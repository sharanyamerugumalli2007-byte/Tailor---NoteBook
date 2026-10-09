import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { orderService } from '../../services/orderService';
import { customerService } from '../../services/customerService';
import { formatCurrency, formatStatus } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Truck,
  CreditCard,
  FileDown,
  XCircle,
  CheckCircle2,
  Clock,
  Eye
} from 'lucide-react';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const CustomerOrders = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch customer profile
      const custRes = await customerService.getCustomers({ limit: 100 });
      let customerId = null;
      if (custRes.success && custRes.data) {
        const list = custRes.data.customers || custRes.data;
        const myCust = list.find(c => c.user_id === user?.id || c.email === user?.email);
        if (myCust) customerId = myCust.id;
      }

      const res = await orderService.getOrders(customerId ? { customerId } : {});
      if (res.success && res.data) {
        const list = res.data.orders || res.data;
        setOrders(list);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Cancel order handler
  const handleCancelOrder = async (orderId, orderNum) => {
    if (!window.confirm(`Are you sure you want to request cancellation for Order #${orderNum}?`)) {
      return;
    }

    try {
      const res = await orderService.updateOrderStatus(orderId, {
        status: 'CANCELLED',
        notes: 'Cancellation requested by customer from online portal'
      });
      if (res.success) {
        showToast(`Order #${orderNum} cancellation recorded.`, 'info');
        fetchOrders();
      }
    } catch (err) {
      showToast(err.userMessage || 'Failed to cancel order.', 'error');
    }
  };

  if (loading) return <Loading message="Loading your bespoke tailoring orders..." />;
  if (error) return <ErrorMessage message={error} retry={fetchOrders} />;

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    // Search query filter
    const matchesQuery = searchQuery === '' ||
      (o.order_number && o.order_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.tracking_number && o.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;

    // Status category filter
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Pending') return o.status === 'ORDER_RECEIVED' || o.payment_status === 'Pending';
    if (activeFilter === 'In Progress') return ['MEASUREMENT_TAKEN', 'CUTTING', 'STITCHING', 'TRIAL_READY', 'ALTERATION'].includes(o.status);
    if (activeFilter === 'Completed') return o.status === 'READY' || o.status === 'DELIVERED';
    if (activeFilter === 'Cancelled') return o.status === 'CANCELLED';
    return true;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 className="heading-serif" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
            My Tailoring Orders
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            Track production milestones, view measurements, and download official PDF invoices.
          </p>
        </div>

        <Link to="/customer/orders/new" className="btn btn-primary btn-pill pulse-glow">
          <PlusCircle size={18} /> PLACE NEW ORDER
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem', border: '1px solid var(--pink-border)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  border: activeFilter === f ? '1.5px solid var(--rose-primary)' : '1px solid var(--border)',
                  background: activeFilter === f ? 'var(--pink-soft)' : 'white',
                  color: activeFilter === f ? 'var(--rose-primary)' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by Order #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.4rem', fontSize: '0.875rem' }}
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card" style={{ overflow: 'hidden', border: '1px solid var(--pink-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Order Date</th>
                <th>Target Delivery</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Stitching Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                    No orders match your filter criteria.{' '}
                    <Link to="/customer/orders/new" style={{ color: 'var(--rose-primary)', fontWeight: 700 }}>
                      Place a new bespoke order!
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const hasRemainingBalance = parseFloat(o.remaining_amount || 0) > 0;
                  const canCancel = o.status === 'ORDER_RECEIVED' || o.status === 'MEASUREMENT_TAKEN';

                  return (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 700 }}>
                        <span style={{ color: 'var(--rose-primary)' }}>{o.order_number}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatDate(o.order_date)}</td>
                      <td style={{ fontWeight: 600 }}>{formatDate(o.expected_delivery_date)}</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(o.total_amount)}</td>
                      <td>
                        <span className={`badge ${o.payment_status === 'Paid' ? 'badge-green' : o.payment_status === 'Partially Paid' ? 'badge-amber' : 'badge-rose'}`}>
                          {o.payment_status || 'Partially Paid'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-rose">
                          {formatStatus(o.status)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <Link
                            to={`/customer/orders/${o.id}/track`}
                            className="btn btn-primary btn-sm btn-pill"
                            title="Live Milestone Tracking"
                          >
                            <Truck size={14} /> Track
                          </Link>

                          {hasRemainingBalance && (
                            <Link
                              to="/customer/payments"
                              className="btn btn-soft-pink btn-sm btn-pill"
                              title="Pay Remaining Balance"
                            >
                              <CreditCard size={14} /> Pay
                            </Link>
                          )}

                          <a
                            href={`/api/pdf/orders/${o.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            title="Download PDF Invoice"
                          >
                            <FileDown size={14} />
                          </a>

                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(o.id, o.order_number)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--danger)' }}
                              title="Request Order Cancellation"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrders;
