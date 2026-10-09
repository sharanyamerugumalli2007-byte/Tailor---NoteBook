import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate, formatMoney, formatTime, label } from '../utils/formatters';

export function OrdersTable({ orders }) {
  if (!orders.length) return <p className="muted">No orders yet.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Order</th><th>Date</th><th>Items</th><th className="num">Amount</th><th>Delivery</th><th>Status</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td><Link to={`/orders/${o.id}`}>#{o.id}</Link></td>
              <td>{formatDate(o.order_date)}</td>
              <td>{o.items_summary || '—'}</td>
              <td className="num">{formatMoney(o.total_amount)}</td>
              <td>{formatDate(o.expected_delivery_date)}</td>
              <td><StatusBadge value={o.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AppointmentsTable({ appointments }) {
  if (!appointments.length) return <p className="muted">No appointments yet.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Time</th><th>Purpose</th><th>Status</th></tr></thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.id}>
              <td>{formatDate(a.appointment_date)}</td>
              <td>{formatTime(a.appointment_time)}</td>
              <td>{label(a.purpose)}</td>
              <td><StatusBadge value={a.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
