import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerSidebar from '../../components/CustomerSidebar';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner, EmptyState } from '../../components/CommonComponents';
import { getCustomerOrders } from '../../services/orderService';
import {
  Scissors,
  Search,
  PlusCircle,
  CreditCard,
  Compass,
  ArrowRight,
  Clock,
  Package
} from 'lucide-react';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = () => {
    setLoading(true);
    getCustomerOrders({ status: statusFilter })
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  const filteredOrders = orders.filter((o) => {
    if (!search) return true;
    return (
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.garment_type.toLowerCase().includes(search.toLowerCase())
    );
  });

  const filterTabs = [
    { id: 'ALL', label: 'All Orders' },
    { id: 'ORDER_PLACED', label: 'Placed' },
    { id: 'CONFIRMED', label: 'Confirmed' },
    { id: 'PROCESSING', label: 'In Progress' },
    { id: 'SHIPPED', label: 'Shipped' },
    { id: 'DELIVERED', label: 'Delivered' },
  ];

  return (
    <div className="portal-page">
      <div className="container portal-container">
        <CustomerSidebar />

        <main className="portal-content">
          <div className="portal-header-row">
            <div>
              <span className="section-tag">Order History</span>
              <h1 className="portal-main-title font-serif">My Tailoring Orders</h1>
            </div>
            <Link to="/customer/orders/new" className="btn btn-primary btn-sm">
              <PlusCircle size={16} />
              <span>New Order</span>
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar studio-card">
            <div className="category-pills">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`cat-pill ${statusFilter === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search order # or garment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Retrieving your orders..." size="large" />
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No orders found"
              description={search ? "No orders match your search query." : "You haven't placed any custom tailoring orders in this category yet."}
              actionText="Place a Custom Order"
              onAction={() => window.location.href = '/customer/orders/new'}
            />
          ) : (
            <div className="orders-list-wrap">
              {filteredOrders.map((ord) => {
                const advReq = Number(ord.advance_required) || 0;
                const advPaid = Number(ord.advance_paid) || 0;
                const needsAdvance = advReq > advPaid && ord.payment_status !== 'VERIFIED';

                return (
                  <div key={ord.id} className="order-summary-card studio-card">
                    <div className="order-card-top">
                      <div className="order-number-cluster">
                        <span className="order-no">Order #{ord.order_number}</span>
                        <span className="order-placed-time">
                          Placed on {new Date(ord.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="order-badges-cluster">
                        <StatusBadge status={ord.payment_status} type="payment" />
                        <StatusBadge status={ord.status} type="order" />
                      </div>
                    </div>

                    <div className="order-card-middle">
                      <div className="garment-main-info">
                        <div className="garment-thumb-icon">
                          <Scissors size={20} />
                        </div>
                        <div>
                          <h3 className="garment-name">{ord.garment_type}</h3>
                          <p className="garment-specs-sub">
                            Qty: {ord.quantity} | Style: {ord.sleeve_style || 'Standard'}, {ord.neck_design || 'Standard'}
                          </p>
                        </div>
                      </div>

                      <div className="order-financials">
                        <div className="fin-col">
                          <span className="fin-lbl">Total Amount</span>
                          <span className="fin-val">₹{Number(ord.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="fin-col">
                          <span className="fin-lbl">Advance Paid</span>
                          <span className="fin-val text-rose">₹{advPaid.toFixed(2)}</span>
                        </div>
                        <div className="fin-col">
                          <span className="fin-lbl">Balance Due</span>
                          <span className="fin-val">₹{Number(ord.remaining_balance).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="order-card-bottom-actions">
                      {needsAdvance && (
                        <div className="advance-alert-inline">
                          <span className="advance-warn-txt">Advance required: ₹{advReq}</span>
                          <Link to="/customer/payments" className="btn btn-primary btn-sm">
                            <CreditCard size={14} />
                            <span>Pay Advance UPI</span>
                          </Link>
                        </div>
                      )}

                      <div className="right-action-buttons">
                        <Link to={`/customer/tracking?order=${ord.order_number}`} className="btn btn-outline btn-sm">
                          <Compass size={14} />
                          <span>Track Order</span>
                        </Link>
                        <Link to={`/customer/orders/${ord.id}`} className="btn btn-secondary btn-sm">
                          <span>View Full Order & Specs</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <style>{`
        .portal-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .portal-main-title {
          font-size: 2.2rem;
          margin-top: 0.2rem;
        }
        .orders-list-wrap {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .order-summary-card {
          padding: 1.75rem;
          background: #ffffff;
        }
        .order-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .order-number-cluster {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }
        .order-no {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--deep-rose);
        }
        .order-placed-time {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .order-badges-cluster {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .order-card-middle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .garment-main-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .garment-thumb-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--soft-blush);
          color: var(--deep-rose);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .garment-name {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }
        .garment-specs-sub {
          font-size: 0.825rem;
          color: var(--text-muted);
        }
        .order-financials {
          display: flex;
          gap: 2rem;
        }
        .fin-col {
          display: flex;
          flex-direction: column;
        }
        .fin-lbl {
          font-size: 0.725rem;
          color: var(--text-light);
          text-transform: uppercase;
        }
        .fin-val {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .order-card-bottom-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
          flex-wrap: wrap;
          gap: 1rem;
        }
        .advance-alert-inline {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #FFF0F5;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--primary-pink);
        }
        .advance-warn-txt {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--deep-rose);
        }
        .right-action-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: auto;
        }
        @media (max-width: 768px) {
          .order-financials {
            width: 100%;
            justify-content: space-between;
          }
          .right-action-buttons {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}
