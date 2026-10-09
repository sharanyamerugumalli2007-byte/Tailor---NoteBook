import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { getCustomerHistory } from '../../services/customerService';
import PageHeader from '../../components/PageHeader';
import { Async } from '../../components/Feedback';
import MeasurementGrid from '../../components/MeasurementGrid';
import { OrdersTable, AppointmentsTable } from '../../components/CustomerSections';
import { formatDate, formatMoney } from '../../utils/formatters';

export default function CustomerHistory() {
  const { id } = useParams();
  const state = useFetch(() => getCustomerHistory(id), [id]);

  return (
    <Async state={state} loadingText="Loading history…" errorText="Unable to load this customer's history.">
      {({ customer: c, measurements, orders, appointments }) => {
        const spent = orders.filter((o) => o.status !== 'CANCELLED').reduce((s, o) => s + o.total_amount, 0);
        return (
          <>
            <PageHeader title={`${c.name} — full history`} subtitle={`${c.phone}${c.email ? ` · ${c.email}` : ''}`}>
              <Link className="btn" to={`/customers/${c.id}`}>Back to customer</Link>
            </PageHeader>
            <div className="stats">
              <div className="stat"><div className="stat-value">{orders.length}</div><div className="stat-label">Orders</div></div>
              <div className="stat"><div className="stat-value">{formatMoney(spent)}</div><div className="stat-label">Total ordered</div></div>
              <div className="stat"><div className="stat-value">{measurements.length}</div><div className="stat-label">Measurement versions</div></div>
              <div className="stat"><div className="stat-value">{appointments.length}</div><div className="stat-label">Appointments</div></div>
            </div>
            <div className="stack">
              <section className="card">
                <h2 style={{ marginBottom: 12 }}>Measurement history</h2>
                {measurements.length === 0 ? <p className="muted">No measurements recorded yet.</p> : measurements.map((m, i) => (
                  <details key={m.id} open={i === 0} style={{ marginBottom: 10 }}>
                    <summary><strong>Version {m.version}</strong> · {formatDate(m.created_at)} {m.is_current && <span className="badge badge-good">Current</span>}</summary>
                    <div style={{ marginTop: 10 }}><MeasurementGrid m={m} compareTo={measurements[i + 1]} /></div>
                  </details>
                ))}
              </section>
              <section className="card"><h2 style={{ marginBottom: 12 }}>Order history</h2><OrdersTable orders={orders} /></section>
              <section className="card"><h2 style={{ marginBottom: 12 }}>Appointment history</h2><AppointmentsTable appointments={appointments} /></section>
            </div>
          </>
        );
      }}
    </Async>
  );
}
