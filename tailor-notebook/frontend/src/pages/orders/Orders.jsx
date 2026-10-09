import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch, useDebounced } from '../../hooks/useFetch';
import { listOrders } from '../../services/orderService';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import { Async } from '../../components/Feedback';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../utils/validation';
import { formatDate, formatMoney, label } from '../../utils/formatters';

export default function Orders() {
  const [f, setF] = useState({ search: '', status: '', payment_status: '', delivery_from: '', delivery_to: '' });
  const [page, setPage] = useState(1);
  const q = useDebounced(f.search);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPage(1); };
  const filtered = f.status || f.payment_status || f.delivery_from || f.delivery_to || q;

  const state = useFetch(() => listOrders({
    search: q || undefined, status: f.status || undefined, payment_status: f.payment_status || undefined,
    delivery_from: f.delivery_from || undefined, delivery_to: f.delivery_to || undefined, page, limit: 10,
  }), [q, f.status, f.payment_status, f.delivery_from, f.delivery_to, page]);

  return (
    <>
      <PageHeader title="Orders" subtitle="Track every garment from order to delivery">
        <Link className="btn btn-primary" to="/orders/new">New order</Link>
      </PageHeader>
      <div className="card">
        <div className="toolbar">
          <SearchBar value={f.search} onChange={(v) => { setF({ ...f, search: v }); setPage(1); }} placeholder="Order #, customer name or phone" />
          <select value={f.status} onChange={set('status')} aria-label="Filter by order status">
            <option value="">All statuses</option>{ORDER_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
          <select value={f.payment_status} onChange={set('payment_status')} aria-label="Filter by payment status">
            <option value="">All payments</option>{PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
          <label className="muted">Delivery from <input type="date" value={f.delivery_from} onChange={set('delivery_from')} /></label>
          <label className="muted">to <input type="date" value={f.delivery_to} onChange={set('delivery_to')} /></label>
        </div>
        <Async state={state} loadingText="Loading orders…" errorText="Unable to load orders." isEmpty={(d) => d.items.length === 0}
          emptyText={filtered ? 'No orders match these filters.' : 'No orders found. Create your first order.'}>
          {(d) => (
            <>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Delivery</th><th className="num">Total</th><th className="num">Balance</th><th>Payment</th><th>Status</th></tr></thead>
                  <tbody>
                    {d.items.map((o) => (
                      <tr key={o.id}>
                        <td><Link to={`/orders/${o.id}`}><strong>#{o.id}</strong></Link></td>
                        <td>{o.customer_name}<div className="muted" style={{ fontSize: '.8rem' }}>{o.customer_phone}</div></td>
                        <td>{o.items_summary}</td>
                        <td>{formatDate(o.expected_delivery_date)}</td>
                        <td className="num">{formatMoney(o.total_amount)}</td>
                        <td className="num">{formatMoney(o.remaining_amount)}</td>
                        <td><StatusBadge value={o.payment_status} /></td>
                        <td><StatusBadge value={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={d.page} limit={d.limit} total={d.total} onChange={setPage} />
            </>
          )}
        </Async>
      </div>
    </>
  );
}
