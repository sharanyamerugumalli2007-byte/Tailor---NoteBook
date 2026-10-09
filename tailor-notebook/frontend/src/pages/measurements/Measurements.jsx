import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch, useDebounced } from '../../hooks/useFetch';
import { listCustomers } from '../../services/customerService';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import { Async } from '../../components/Feedback';

export default function Measurements() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounced(search);
  const state = useFetch(() => listCustomers({ search: q || undefined, page, limit: 10 }), [q, page]);

  return (
    <>
      <PageHeader title="Measurements" subtitle="Find a customer to view, update or print their measurements" />
      <div className="card">
        <div className="toolbar">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name, phone or email" />
        </div>
        <Async state={state} loadingText="Loading customers…" errorText="Unable to load customers."
          isEmpty={(d) => d.items.length === 0} emptyText="No customers found. Add a customer first, then record their measurements.">
          {(d) => (
            <>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Customer</th><th>Phone</th><th /></tr></thead>
                  <tbody>
                    {d.items.map((c) => (
                      <tr key={c.id}>
                        <td><Link to={`/customers/${c.id}`}><strong>{c.name}</strong></Link></td>
                        <td>{c.phone}</td>
                        <td>
                          <div className="row-actions">
                            <Link className="btn btn-sm" to={`/customers/${c.id}/measurements/history`}>Versions</Link>
                            <Link className="btn btn-sm btn-primary" to={`/customers/${c.id}/measurements/new`}>Add / update</Link>
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
    </>
  );
}
