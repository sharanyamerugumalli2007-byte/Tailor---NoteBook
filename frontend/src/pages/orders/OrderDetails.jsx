import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { deleteOrder, getOrder, updateOrderStatus } from '../../services/orderService';
import { openOrderPdf, openMeasurementPdf } from '../../services/pdfService';
import { errorMessage } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { Async } from '../../components/Feedback';
import StatusBadge from '../../components/StatusBadge';
import OrderTracker from '../../components/OrderTracker';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';
import { ORDER_STATUSES } from '../../utils/validation';
import { formatDate, formatDateTime, formatMoney, label } from '../../utils/formatters';

const NEXT = { ORDER_RECEIVED: 'MEASUREMENT_TAKEN', MEASUREMENT_TAKEN: 'CUTTING', CUTTING: 'STITCHING', STITCHING: 'TRIAL', TRIAL: 'READY', READY: 'DELIVERED' };

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const state = useFetch(() => getOrder(id), [id]);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [confirm, setConfirm] = useState(null); // { type: 'status', status } | { type: 'delete' }
  const [busy, setBusy] = useState(false);

  const run = async (fn, okMsg) => {
    setBusy(true);
    try { await fn(); toast.success(okMsg); setConfirm(null); return true; }
    catch (err) { toast.error(errorMessage(err)); return false; }
    finally { setBusy(false); }
  };

  const changeStatus = async (status) => {
    if (await run(() => updateOrderStatus(id, status, note || undefined), `Order marked ${label(status).toLowerCase()}`)) { setNote(''); setNewStatus(''); state.reload(); }
  };

  const pdf = async (fn) => { try { await fn(); } catch (err) { toast.error(errorMessage(err, 'Unable to generate the PDF.')); } };

  return (
    <Async state={state} loadingText="Loading order…" errorText="Unable to load this order.">
      {(o) => {
        const locked = ['DELIVERED', 'CANCELLED'].includes(o.status);
        const next = NEXT[o.status];
        return (
          <>
            <PageHeader title={`Order #${o.id}`} subtitle={`Placed ${formatDate(o.order_date)} · due ${formatDate(o.expected_delivery_date)}`}>
              <StatusBadge value={o.status} />
              <button className="btn" onClick={() => pdf(() => openOrderPdf(o.id))}>Receipt PDF</button>
              {o.measurement_id && <button className="btn" onClick={() => pdf(() => openMeasurementPdf(o.customer_id, o.measurement_id))}>Measurement PDF</button>}
              {!locked && <Link className="btn" to={`/orders/${o.id}/edit`}>Edit order</Link>}
              {isAdmin && <button className="btn btn-danger" onClick={() => setConfirm({ type: 'delete' })}>Delete</button>}
            </PageHeader>

            <div className="stack">
              <section className="card"><OrderTracker status={o.status} history={o.status_history} /></section>

              {!locked && (
                <section className="card">
                  <h2 style={{ marginBottom: 12 }}>Update status</h2>
                  <div className="toolbar" style={{ marginBottom: 0 }}>
                    {next && <button className="btn btn-primary" disabled={busy} onClick={() => setConfirm({ type: 'status', status: next })}>Mark as {label(next).toLowerCase()}</button>}
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} aria-label="Choose a status">
                      <option value="">Other status…</option>
                      {ORDER_STATUSES.filter((s) => s !== o.status).map((s) => <option key={s} value={s}>{label(s)}</option>)}
                    </select>
                    <input style={{ maxWidth: 260 }} placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
                    <button className="btn" disabled={!newStatus || busy} onClick={() => setConfirm({ type: 'status', status: newStatus })}>Update</button>
                  </div>
                </section>
              )}

              <div className="grid grid-2">
                <section className="card">
                  <h2 style={{ marginBottom: 12 }}>Customer</h2>
                  <dl className="kv">
                    <div><dt>Name</dt><dd><Link to={`/customers/${o.customer_id}`}>{o.customer_name}</Link></dd></div>
                    <div><dt>Phone</dt><dd>{o.customer_phone}</dd></div>
                    <div><dt>Measurement used</dt><dd>{o.measurement_version ? <Link to={`/customers/${o.customer_id}/measurements/history`}>Version {o.measurement_version}</Link> : '—'}</dd></div>
                    {o.notes && <div><dt>Notes</dt><dd>{o.notes}</dd></div>}
                  </dl>
                </section>
                <section className="card">
                  <div className="card-head"><h2>Payment</h2><StatusBadge value={o.payment_status} /></div>
                  <div className="totals" style={{ marginLeft: 0 }}>
                    <div><span>Total</span><strong>{formatMoney(o.total_amount)}</strong></div>
                    <div><span>Advance paid</span><span>{formatMoney(o.advance_amount)}</span></div>
                    <div className="grand"><span>Remaining</span><span>{formatMoney(o.remaining_amount)}</span></div>
                  </div>
                  {!locked && <p className="muted" style={{ marginTop: 10, fontSize: '.85rem' }}>To record a payment, edit the order and update the advance amount.</p>}
                </section>
              </div>

              <section className="card">
                <h2 style={{ marginBottom: 12 }}>Items</h2>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Item</th><th>Details</th><th className="num">Qty</th><th className="num">Price</th><th className="num">Amount</th></tr></thead>
                    <tbody>
                      {o.items.map((i) => (
                        <tr key={i.id}>
                          <td><strong>{i.item_type}</strong></td>
                          <td>{[i.description, i.special_instructions && `Note: ${i.special_instructions}`].filter(Boolean).join(' · ') || '—'}</td>
                          <td className="num">{i.quantity}</td><td className="num">{formatMoney(i.price)}</td><td className="num">{formatMoney(i.quantity * i.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="card">
                <h2 style={{ marginBottom: 12 }}>Status history</h2>
                <ul className="timeline">
                  {o.status_history.map((h) => (
                    <li key={h.id}><strong>{label(h.status)}</strong> <span className="muted">· {formatDateTime(h.changed_at)}</span>{h.notes && <div className="muted">{h.notes}</div>}</li>
                  ))}
                </ul>
              </section>
            </div>

            {confirm?.type === 'status' && (
              <ConfirmDialog title="Update order status?" confirmText="Update status" busy={busy} onCancel={() => setConfirm(null)} onConfirm={() => changeStatus(confirm.status)}
                danger={confirm.status === 'CANCELLED'}
                message={`Order #${o.id} will be marked ${label(confirm.status).toLowerCase()}.${['DELIVERED', 'CANCELLED'].includes(confirm.status) ? ' This is final and cannot be undone.' : ''}`} />
            )}
            {confirm?.type === 'delete' && (
              <ConfirmDialog danger title="Delete order?" confirmText="Delete order" busy={busy} onCancel={() => setConfirm(null)}
                onConfirm={async () => { if (await run(() => deleteOrder(o.id), 'Order deleted')) navigate('/orders'); }}
                message={`Order #${o.id} and its items and status history will be permanently deleted. To keep a record, cancel the order instead.`} />
            )}
          </>
        );
      }}
    </Async>
  );
}
