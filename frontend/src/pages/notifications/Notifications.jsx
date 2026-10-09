import { CheckCheck } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { listNotifications, markAllRead, markRead } from '../../services/notificationService';
import { errorMessage } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { Async } from '../../components/Feedback';
import { useToast } from '../../components/Toast';
import { formatDateTime } from '../../utils/formatters';

const refreshBell = () => window.dispatchEvent(new Event('tn:notifications'));

export default function Notifications() {
  const toast = useToast();
  const state = useFetch(listNotifications);

  const read = async (n) => {
    if (n.is_read) return;
    try { await markRead(n.id); refreshBell(); state.reload(); } catch (err) { toast.error(errorMessage(err)); }
  };
  const readAll = async () => {
    try { await markAllRead(); refreshBell(); state.reload(); toast.success('All notifications marked as read'); } catch (err) { toast.error(errorMessage(err)); }
  };

  return (
    <>
      <PageHeader title="Notifications" subtitle={state.data ? `${state.data.unread} unread` : undefined}>
        <button className="btn" onClick={readAll} disabled={!state.data?.unread}><CheckCheck size={16} /> Mark all as read</button>
      </PageHeader>
      <div className="card">
        <Async state={state} loadingText="Loading notifications…" errorText="Unable to load notifications."
          isEmpty={(d) => d.items.length === 0} emptyText="No notifications yet. Order and appointment updates will show up here.">
          {(d) => (
            <ul className="list">
              {d.items.map((n) => (
                <li key={n.id}>
                  <div style={{ fontWeight: n.is_read ? 400 : 600 }}>
                    {!n.is_read && <span aria-label="Unread" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--tape)', border: '1px solid var(--ink)', marginRight: 8 }} />}
                    {n.message}
                    <div className="sub">{n.title} · {formatDateTime(n.created_at)}</div>
                  </div>
                  {!n.is_read && <button className="btn btn-sm" onClick={() => read(n)}>Mark as read</button>}
                </li>
              ))}
            </ul>
          )}
        </Async>
      </div>
    </>
  );
}
