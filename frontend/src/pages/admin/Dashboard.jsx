import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/adminService';
import { formatCurrency, formatStatus } from '../../utils/formatters';
import { formatDate, formatTime } from '../../utils/dateUtils';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Users,
  Scissors,
  Clock,
  CheckCircle,
  Truck,
  Calendar,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowRight,
  Ruler
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, ordersRes, apptsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentOrders(),
        dashboardService.getUpcomingAppointments()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (ordersRes.success) setRecentOrders(ordersRes.data || []);
      if (apptsRes.success) setUpcomingAppointments(apptsRes.data || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading message="Loading tailoring studio dashboard..." />;
  }

  return (
    <div>
      {/* Top Welcome & Quick Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div>
          <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
            Tailor Workshop Overview
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Real-time shop statistics, active cutting/stitching pipelines, and customer appointments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Link to="/admin/customers" className="btn btn-secondary btn-sm">
            <Users size={16} /> Customers
          </Link>
          <Link to="/admin/measurements" className="btn btn-secondary btn-sm">
            <Ruler size={16} /> New Measurement
          </Link>
          <Link to="/admin/orders/new" className="btn btn-primary btn-sm">
            <Plus size={16} /> Create Order
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} retry={fetchDashboardData} />}

      {/* Main Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Customers
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
              {stats?.totalCustomers || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 500 }}>
              Registered in notebook
            </span>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Orders
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
              {stats?.totalOrders || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 500 }}>
              {stats?.inProgressOrders || 0} In Production
            </span>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
            <Scissors size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Ready For Delivery
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#15803d', marginTop: '0.25rem' }}>
              {stats?.readyOrders || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Completed steam press
            </span>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Today's Appointments
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
              {stats?.todayAppointments || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {stats?.upcomingAppointments || 0} upcoming upcoming days
            </span>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
            <Calendar size={24} />
          </div>
        </div>
      </div>

      {/* Revenue & Pipeline Summary Cards */}
      <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <strong style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Business Value</strong>
            <TrendingUp size={18} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
            {formatCurrency(stats?.revenue?.total || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Advance collected: <strong>{formatCurrency(stats?.revenue?.collected || 0)}</strong>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <strong style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pending Balances Due</strong>
            <AlertCircle size={18} color="#b91c1c" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#b91c1c' }}>
            {formatCurrency(stats?.revenue?.pending || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Receivable upon trial & order delivery
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <strong style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pending QR Verifications</strong>
            <Clock size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706' }}>
            {stats?.pendingPayments || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            <Link to="/admin/payments" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Verify advance receipts &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Tables Section: Recent Orders & Upcoming Appointments */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Orders */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 className="heading-serif" style={{ fontSize: '1.2rem' }}>Recent Tailor Orders</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest bespoke garments created</p>
            </div>
            <Link to="/admin/orders" className="btn btn-secondary btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Customer</th>
                  <th>Delivery Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <Link to={`/admin/orders/${ord.id}`} style={{ fontWeight: 600, color: 'var(--accent)' }}>
                          {ord.order_number}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{ord.customer_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.customer_phone}</div>
                      </td>
                      <td>{formatDate(ord.expected_delivery_date)}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(ord.total_amount)}</td>
                      <td>
                        <StatusBadge status={ord.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 className="heading-serif" style={{ fontSize: '1.2rem' }}>Appointments</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upcoming fittings & trials</p>
            </div>
            <Link to="/admin/appointments" className="btn btn-secondary btn-sm">
              Calendar <Calendar size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcomingAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No scheduled fittings for upcoming days.
              </div>
            ) : (
              upcomingAppointments.map((app) => (
                <div
                  key={app.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {app.customer_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {formatDate(app.appointment_date)} at {formatTime(app.appointment_time)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 500, marginTop: '0.1rem' }}>
                      Purpose: {app.purpose}
                    </div>
                  </div>
                  <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
