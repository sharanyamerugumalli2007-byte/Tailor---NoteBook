import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import CustomerSidebar from '../../components/CustomerSidebar';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/CommonComponents';
import api from '../../services/api';
import {
  Scissors,
  PlusCircle,
  ShoppingBag,
  Ruler,
  Compass,
  CreditCard,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = () => {
    setLoading(true);
    api.get('/customer/dashboard')
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  const metrics = data?.metrics || {
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    pendingAdvanceCount: 0,
    totalSpent: 0
  };

  const recentOrders = data?.recentOrders || [];
  const recentNotifications = data?.recentNotifications || [];

  return (
    <div className="portal-page">
      <div className="container portal-container">
        <CustomerSidebar />

        <main className="portal-content">
          {/* Welcome Banner */}
          <div className="welcome-banner studio-card">
            <div className="welcome-text">
              <span className="section-tag">Bespoke Atelier Portal</span>
              <h1 className="welcome-title font-serif">
                Namaste, {user?.name?.split(' ')[0] || 'Patron'}!
              </h1>
              <p className="welcome-sub">
                Welcome to your personal tailoring notebook. Track active garments, manage your bespoke measurements, and submit custom stitching orders.
              </p>
            </div>
            <Link to="/customer/orders/new" className="btn btn-primary btn-lg">
              <PlusCircle size={18} />
              <span>Place New Order</span>
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Fetching your tailoring dashboard..." size="large" />
          ) : (
            <>
              {/* Metrics Grid */}
              <div className="grid-4 metrics-grid mb-4">
                <div className="metric-card studio-card">
                  <div className="metric-header">
                    <span className="metric-label">Total Orders</span>
                    <div className="metric-icon-wrap bg-blush">
                      <ShoppingBag size={20} className="text-rose" />
                    </div>
                  </div>
                  <span className="metric-val">{metrics.totalOrders}</span>
                  <span className="metric-footer">Bespoke garments placed</span>
                </div>

                <div className="metric-card studio-card">
                  <div className="metric-header">
                    <span className="metric-label">In Progress</span>
                    <div className="metric-icon-wrap bg-yellow">
                      <Clock size={20} className="text-warning" />
                    </div>
                  </div>
                  <span className="metric-val">{metrics.inProgressOrders}</span>
                  <span className="metric-footer">Cutting & stitching</span>
                </div>

                <div className="metric-card studio-card">
                  <div className="metric-header">
                    <span className="metric-label">Completed</span>
                    <div className="metric-icon-wrap bg-green">
                      <CheckCircle2 size={20} className="text-success" />
                    </div>
                  </div>
                  <span className="metric-val">{metrics.completedOrders}</span>
                  <span className="metric-footer">Delivered to doorstep</span>
                </div>

                <div className="metric-card studio-card">
                  <div className="metric-header">
                    <span className="metric-label">Advance Pending</span>
                    <div className="metric-icon-wrap bg-pink">
                      <CreditCard size={20} className="text-rose" />
                    </div>
                  </div>
                  <span className="metric-val">{metrics.pendingAdvanceCount}</span>
                  <span className="metric-footer">
                    {metrics.pendingAdvanceCount > 0 ? (
                      <Link to="/customer/payments" className="text-rose-link">
                        Pay UPI Advance →
                      </Link>
                    ) : (
                      'All advances verified'
                    )}
                  </span>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="quick-actions-card studio-card mb-4">
                <h3 className="section-subheading font-serif">Quick Studio Actions</h3>
                <div className="quick-actions-grid">
                  <Link to="/customer/orders/new" className="quick-action-btn">
                    <div className="qa-icon"><PlusCircle size={20} /></div>
                    <span>Place Order</span>
                  </Link>
                  <Link to="/customer/orders" className="quick-action-btn">
                    <div className="qa-icon"><ShoppingBag size={20} /></div>
                    <span>My Orders</span>
                  </Link>
                  <Link to="/customer/measurements" className="quick-action-btn">
                    <div className="qa-icon"><Ruler size={20} /></div>
                    <span>Measurements</span>
                  </Link>
                  <Link to="/customer/tracking" className="quick-action-btn">
                    <div className="qa-icon"><Compass size={20} /></div>
                    <span>Track Order</span>
                  </Link>
                  <Link to="/customer/payments" className="quick-action-btn">
                    <div className="qa-icon"><CreditCard size={20} /></div>
                    <span>UPI Payments</span>
                  </Link>
                </div>
              </div>

              {/* Recent Orders & Notifications */}
              <div className="dashboard-columns grid-2">
                {/* Recent Orders */}
                <div className="dashboard-section-card studio-card">
                  <div className="section-title-row">
                    <h3 className="section-subheading font-serif">Recent Tailoring Orders</h3>
                    <Link to="/customer/orders" className="view-all-link">
                      View All ({metrics.totalOrders})
                    </Link>
                  </div>

                  {recentOrders.length === 0 ? (
                    <div className="empty-box text-center py-4">
                      <Scissors size={28} className="text-light mb-2" />
                      <p className="text-muted mb-3">No orders placed yet.</p>
                      <Link to="/customer/orders/new" className="btn btn-primary btn-sm">
                        Create Your First Order
                      </Link>
                    </div>
                  ) : (
                    <div className="orders-mini-list">
                      {recentOrders.map((ord) => (
                        <div key={ord.id} className="order-mini-item">
                          <div className="order-mini-info">
                            <span className="order-mini-num">#{ord.order_number}</span>
                            <h4 className="order-mini-garment">{ord.garment_type}</h4>
                            <span className="order-mini-date">
                              {new Date(ord.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="order-mini-status">
                            <StatusBadge status={ord.status} />
                            <Link to={`/customer/orders/${ord.id}`} className="mini-details-btn">
                              Details →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Notifications */}
                <div className="dashboard-section-card studio-card">
                  <div className="section-title-row">
                    <h3 className="section-subheading font-serif">Studio Notifications</h3>
                    <Link to="/customer/notifications" className="view-all-link">
                      View All
                    </Link>
                  </div>

                  {recentNotifications.length === 0 ? (
                    <div className="empty-box text-center py-4">
                      <Bell size={28} className="text-light mb-2" />
                      <p className="text-muted">You are completely up to date!</p>
                    </div>
                  ) : (
                    <div className="notifications-mini-list">
                      {recentNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`notif-mini-item ${notif.is_read ? 'read' : 'unread'}`}
                        >
                          <div className="notif-mini-icon">
                            <Bell size={16} />
                          </div>
                          <div className="notif-mini-body">
                            <h5 className="notif-mini-title">{notif.title}</h5>
                            <p className="notif-mini-msg">{notif.message}</p>
                            <span className="notif-mini-time">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <style>{`
        .portal-page {
          padding: 2.5rem 0 5rem 0;
          min-height: calc(100vh - 140px);
        }
        .portal-container {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }
        .portal-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .welcome-banner {
          background: linear-gradient(135deg, #FFF0F5 0%, #FCE4EC 100%);
          border: 1px solid var(--border-color);
          padding: 2rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .welcome-title {
          font-size: 2.2rem;
          margin: 0.25rem 0 0.5rem 0;
        }
        .welcome-sub {
          font-size: 0.95rem;
          color: var(--text-muted);
          max-width: 580px;
          line-height: 1.5;
        }
        .metric-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }
        .metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .metric-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .metric-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bg-blush { background: var(--soft-blush); }
        .bg-yellow { background: var(--warning-bg); }
        .bg-green { background: var(--success-bg); }
        .bg-pink { background: #FFF0F5; }
        .metric-val {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1.1;
          margin-bottom: 0.25rem;
        }
        .metric-footer {
          font-size: 0.775rem;
          color: var(--text-light);
        }
        .text-rose-link {
          color: var(--deep-rose);
          font-weight: 700;
        }
        .quick-actions-card {
          padding: 1.5rem 2rem;
          background: #ffffff;
        }
        .section-subheading {
          font-size: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }
        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 0.75rem;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
          text-align: center;
          transition: all 0.2s;
        }
        .quick-action-btn:hover {
          background: var(--soft-blush);
          color: var(--deep-rose);
          transform: translateY(-2px);
          border-color: var(--rose-accent);
        }
        .qa-icon {
          color: var(--deep-rose);
        }
        .dashboard-section-card {
          padding: 1.75rem;
          background: #ffffff;
        }
        .section-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .view-all-link {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--rose-accent);
        }
        .orders-mini-list, .notifications-mini-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .order-mini-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1rem;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }
        .order-mini-num {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-light);
        }
        .order-mini-garment {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .order-mini-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .order-mini-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.35rem;
        }
        .mini-details-btn {
          font-size: 0.775rem;
          color: var(--deep-rose);
          font-weight: 600;
        }
        .notif-mini-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.85rem;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }
        .notif-mini-item.unread {
          border-left: 3px solid var(--rose-accent);
          background: #FFF0F5;
        }
        .notif-mini-icon {
          color: var(--rose-accent);
          margin-top: 0.15rem;
        }
        .notif-mini-title {
          font-size: 0.875rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }
        .notif-mini-msg {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
          margin-bottom: 0.25rem;
        }
        .notif-mini-time {
          font-size: 0.7rem;
          color: var(--text-light);
        }
        @media (max-width: 992px) {
          .portal-container {
            flex-direction: column;
          }
          .quick-actions-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 600px) {
          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-columns {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
