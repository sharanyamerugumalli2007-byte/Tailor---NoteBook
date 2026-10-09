import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import StatusBadge from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/CommonComponents';
import { getAdminDashboard } from '../../services/adminService';
import {
  ShieldCheck,
  ShoppingBag,
  Users,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Scissors
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    setLoading(true);
    getAdminDashboard()
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  const stats = data?.stats || {
    totalCustomers: 0,
    totalOrders: 0,
    newOrders: 0,
    confirmedOrders: 0,
    inProgressOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    pendingPaymentCount: 0,
    verifiedRevenue: 0
  };

  const recentOrders = data?.recentOrders || [];
  const recentPayments = data?.recentPayments || [];
  const recentCustomers = data?.recentCustomers || [];

  return (
    <div className="portal-page admin-portal-page">
      <div className="container portal-container">
        <AdminSidebar />

        <main className="portal-content">
          {/* Header Banner */}
          <div className="admin-banner studio-card">
            <div>
              <span className="section-tag">Master Atelier Command Center</span>
              <h1 className="banner-title font-serif">Studio Operations Overview</h1>
              <p className="banner-sub">
                Live statistics backed directly by MySQL 8 database records. Monitor client orders, verify UPI payments, and manage workflow.
              </p>
            </div>
            <div className="banner-quick-actions">
              <Link to="/admin/orders" className="btn btn-primary btn-sm">
                <ShoppingBag size={16} />
                <span>Manage Orders</span>
              </Link>
              <Link to="/admin/payments" className="btn btn-secondary btn-sm">
                <CreditCard size={16} />
                <span>Verify Payments ({stats.pendingPaymentCount})</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Compiling atelier database metrics..." size="large" />
          ) : (
            <>
              {/* Primary Stats Grid */}
              <div className="grid-4 mb-4">
                <div className="metric-card studio-card">
                  <div className="metric-header">
                    <span className="metric-label">Verified Revenue</span>
                    <div className="metric-icon-wrap bg-green">
                      <TrendingUp size={20} className="text-success" />
                    </div>
                  </div>
                  <span className="metric-val text-success">
                    ₹{Number(stats.verifiedRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="metric-footer">From verified advance & full payments</span>
                </div>

                <div className="metric-card studio-card">
                  <div className="metric-header">
                    <span className="metric-label">Total Orders</span>
                    <div className="metric-icon-wrap bg-blush">
                      <ShoppingBag size={20} className="text-rose" />
                    </div>
                  </div>
                  <span className="metric-val">{stats.totalOrders}</span>
                  <span className="metric-footer">{stats.newOrders} new / awaiting confirmation</span>
                </div>

                <div className="metric-card studio-card">
                  <div className="metric-header">
                    <span className="metric-label">Pending Verification</span>
                    <div className="metric-icon-wrap bg-yellow">
                      <CreditCard size={20} className="text-warning" />
                    </div>
                  </div>
                  <span className="metric-val text-warning">{stats.pendingPaymentCount}</span>
                  <span className="metric-footer">
                    <Link to="/admin/payments" className="text-rose font-bold">
                      Review UPI References →
                    </Link>
                  </span>
                </div>

                <div className="metric-card studio-card">
                  <div className="metric-header">
                    <span className="metric-label">Total Clients</span>
                    <div className="metric-icon-wrap bg-pink">
                      <Users size={20} className="text-rose" />
                    </div>
                  </div>
                  <span className="metric-val">{stats.totalCustomers}</span>
                  <span className="metric-footer">Registered customer accounts</span>
                </div>
              </div>

              {/* Status Breakdown Pills */}
              <div className="status-overview-card studio-card mb-4">
                <h3 className="section-subheading font-serif">Order Lifecycle Distribution</h3>
                <div className="status-pills-row">
                  <div className="status-pill-box bg-placed">
                    <span className="count">{stats.newOrders}</span>
                    <span className="lbl">Order Placed</span>
                  </div>
                  <div className="status-pill-box bg-confirmed">
                    <span className="count">{stats.confirmedOrders}</span>
                    <span className="lbl">Confirmed</span>
                  </div>
                  <div className="status-pill-box bg-processing">
                    <span className="count">{stats.inProgressOrders}</span>
                    <span className="lbl">In Progress</span>
                  </div>
                  <div className="status-pill-box bg-shipped">
                    <span className="count">{stats.shippedOrders}</span>
                    <span className="lbl">Shipped</span>
                  </div>
                  <div className="status-pill-box bg-delivered">
                    <span className="count">{stats.deliveredOrders}</span>
                    <span className="lbl">Delivered</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders & Pending Payments */}
              <div className="grid-2">
                {/* Recent Orders */}
                <div className="dashboard-section-card studio-card">
                  <div className="section-title-row">
                    <h3 className="section-subheading font-serif">Recent Orders</h3>
                    <Link to="/admin/orders" className="view-all-link">Manage All Orders →</Link>
                  </div>

                  {recentOrders.length === 0 ? (
                    <p className="text-muted text-center py-4">No orders placed yet.</p>
                  ) : (
                    <div className="orders-mini-list">
                      {recentOrders.map((ord) => (
                        <div key={ord.id} className="order-mini-item">
                          <div className="order-mini-info">
                            <span className="order-mini-num">#{ord.order_number}</span>
                            <h4 className="order-mini-garment">{ord.garment_type}</h4>
                            <span className="order-mini-date">
                              Value: ₹{ord.total_amount} | {new Date(ord.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="order-mini-status">
                            <StatusBadge status={ord.status} />
                            <Link to={`/admin/orders?search=${ord.order_number}`} className="mini-details-btn">
                              Update →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Payments Pending Verification */}
                <div className="dashboard-section-card studio-card">
                  <div className="section-title-row">
                    <h3 className="section-subheading font-serif">Payment Submissions</h3>
                    <Link to="/admin/payments" className="view-all-link">Verification Desk →</Link>
                  </div>

                  {recentPayments.length === 0 ? (
                    <p className="text-muted text-center py-4">No payment references submitted.</p>
                  ) : (
                    <div className="orders-mini-list">
                      {recentPayments.map((p) => (
                        <div key={p.id} className="order-mini-item">
                          <div className="order-mini-info">
                            <span className="order-mini-num font-mono">UTR: {p.transaction_reference}</span>
                            <h4 className="order-mini-garment">₹{Number(p.amount).toFixed(2)}</h4>
                            <span className="order-mini-date">
                              Order #{p.order_number || p.order_id} | {new Date(p.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="order-mini-status">
                            <StatusBadge status={p.status} type="payment" />
                            <Link to="/admin/payments" className="mini-details-btn">
                              Review →
                            </Link>
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
        .admin-banner {
          background: linear-gradient(135deg, #FFF0F5 0%, #F5DDE5 100%);
          border: 1px solid #E2C0CC;
          padding: 2.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .banner-title {
          font-size: 2.2rem;
          margin: 0.25rem 0 0.5rem 0;
        }
        .banner-sub {
          font-size: 0.95rem;
          color: var(--text-muted);
          max-width: 600px;
          line-height: 1.5;
        }
        .banner-quick-actions {
          display: flex;
          gap: 0.75rem;
        }
        .status-overview-card {
          padding: 1.75rem;
          background: #ffffff;
        }
        .status-pills-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
          margin-top: 1rem;
        }
        .status-pill-box {
          padding: 1rem;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .status-pill-box .count {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          font-weight: 800;
          line-height: 1.1;
        }
        .status-pill-box .lbl {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-top: 0.25rem;
        }
        .bg-placed { background: #FCE4EC; color: #A83F62; }
        .bg-confirmed { background: #E0F2FE; color: #0284C7; }
        .bg-processing { background: #FEF3C7; color: #D97706; }
        .bg-shipped { background: #EDE9FE; color: #7C3AED; }
        .bg-delivered { background: #DCFCE7; color: #15803D; }
        @media (max-width: 868px) {
          .status-pills-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
