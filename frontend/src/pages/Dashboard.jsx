import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { dashboardStats, recentOrders, upcomingAppointments } from '../services/notificationService';
import PageHeader from '../components/PageHeader';
import { Async } from '../components/Feedback';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatDateTime, formatMoney, formatTime, label } from '../utils/formatters';

const STAT_CARDS = [
  ['total_customers', 'Total customers'], ['total_orders', 'Total orders'], ['pending_orders', 'Pending orders'],
  ['in_progress_orders', 'In progress'], ['ready_orders', 'Ready for pickup'], ['delivered_orders', 'Delivered'],
  ['todays_appointments', "Today's appointments"], ['upcoming_appointments', 'Upcoming appointments'],
];

export default function Dashboard() {
  const state = useFetch(async () => {
    const [stats, orders, appts] = await Promise.all([dashboardStats(), recentOrders(), upcomingAppointments()]);
    return { stats, orders, appts };
  });

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Where the shop stands today">
        <Link className="btn" to="/customers/new">Add customer</Link>
        <Link className="btn btn-primary" to="/orders/new">New order</Link>
      </PageHeader>

      <Async state={state} loadingText="Loading dashboard…" errorText="Unable to load the dashboard.">
        {({ stats, orders, appts }) => (
          <>
            <div className="stats">
              {STAT_CARDS.map(([k, text]) => (
                <div className="stat" key={k}><div className="stat-value">{stats[k]}</div><div className="stat-label">{text}</div></div>
              ))}
              <div className="stat"><div className="stat-value">{formatMoney(stats.outstanding_balance)}</div><div className="stat-label">Balance still to collect</div></div>
            </div>

            <div className="grid grid-2">
              <section className="card">
                <div className="card-head"><h2>Recent orders</h2><Link to="/orders">View all</Link></div>
                {orders.length === 0 ? <p className="muted">No orders yet.</p> : (
                  <ul className="list">
                    {orders.map((o) => (
                      <li key={o.id}>
                        <div><Link to={`/orders/${o.id}`}>#{o.id} · {o.customer_name}</Link><div className="sub">Due {formatDate(o.expected_delivery_date)} · {formatMoney(o.total_amount)}</div></div>
                        <StatusBadge value={o.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="card">
                <div className="card-head"><h2>Upcoming appointments</h2><Link to="/appointments">Calendar</Link></div>
                {appts.length === 0 ? <p className="muted">Nothing scheduled.</p> : (
                  <ul className="list">
                    {appts.map((a) => (
                      <li key={a.id}>
                        <div>{a.customer_name}<div className="sub">{formatDate(a.appointment_date)} · {formatTime(a.appointment_time)}</div></div>
                        <span className="badge badge-info">{label(a.purpose)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="card">
                <div className="card-head"><h2>Recent customers</h2><Link to="/customers">View all</Link></div>
                {stats.recent_customers.length === 0 ? <p className="muted">No customers yet.</p> : (
                  <ul className="list">
                    {stats.recent_customers.map((c) => (
                      <li key={c.id}><Link to={`/customers/${c.id}`}>{c.name}</Link><span className="muted">{c.phone}</span></li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="card">
                <div className="card-head"><h2>Recent notifications</h2><Link to="/notifications">View all</Link></div>
                {stats.recent_notifications.length === 0 ? <p className="muted">No notifications.</p> : (
                  <ul className="list">
                    {stats.recent_notifications.map((n) => (
                      <li key={n.id}><div style={{ fontWeight: n.is_read ? 400 : 600 }}>{n.message}<div className="sub">{formatDateTime(n.created_at)}</div></div></li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </Async>
    </>
  );
}
