import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { useFetch, useDebounced } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { deleteCustomer, listCustomers } from '../../services/customerService';
import { errorMessage } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Async } from '../../components/Feedback';
import { useToast } from '../../components/Toast';
import { formatDate } from '../../utils/formatters';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const q = useDebounced(search);
  const { isAdmin } = useAuth();
  const toast = useToast();

  const state = useFetch(() => listCustomers({ search: q || undefined, page, limit: 10 }), [q, page]);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteCustomer(toDelete.id);
      toast.success(`${toDelete.name} deleted`);
      setToDelete(null);
      state.reload();
    } catch (err) { toast.error(errorMessage(err)); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Customers" subtitle="Everyone who has a page in your notebook">
        <Link className="btn btn-primary" to="/customers/new">Add customer</Link>
      </PageHeader>
      <div className="card">
        <div className="toolbar">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name, phone or email" />
        </div>
        <Async state={state} loadingText="Loading customers…" errorText="Unable to load customers." isEmpty={(d) => d.items.length === 0}
          emptyText={q ? `No customers match "${q}".` : 'No customers found. Add your first customer to get started.'}>
          {(d) => (
            <>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th className="num">Orders</th><th>Added</th><th /></tr></thead>
                  <tbody>
                    {d.items.map((c) => (
                      <tr key={c.id}>
                        <td><Link to={`/customers/${c.id}`}><strong>{c.name}</strong></Link></td>
                        <td>{c.phone}</td>
                        <td>{c.email || '—'}</td>
                        <td className="num">{c.order_count}</td>
                        <td>{formatDate(c.created_at)}</td>
                        <td>
                          <div className="row-actions">
                            <Link className="icon-btn" to={`/customers/${c.id}`} aria-label={`View ${c.name}`}><Eye size={16} /></Link>
                            <Link className="icon-btn" to={`/customers/${c.id}/edit`} aria-label={`Edit ${c.name}`}><Pencil size={16} /></Link>
                            {isAdmin && <button className="icon-btn" aria-label={`Delete ${c.name}`} onClick={() => setToDelete(c)}><Trash2 size={16} /></button>}
                          </div>
                        </td>
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
      {toDelete && (
        <ConfirmDialog danger title="Delete customer?" confirmText="Delete customer" busy={busy} onCancel={() => setToDelete(null)} onConfirm={confirmDelete}
          message={`${toDelete.name} will be removed from your customer list. Their orders and measurements stay in your records.`} />
      )}
    </>
  );
}
