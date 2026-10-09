import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { getCustomerHistory } from '../../services/customerService';
import { openMeasurementPdf } from '../../services/pdfService';
import { errorMessage } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { Async } from '../../components/Feedback';
import MeasurementGrid from '../../components/MeasurementGrid';
import { OrdersTable, AppointmentsTable } from '../../components/CustomerSections';
import { useToast } from '../../components/Toast';
import { formatDate, label } from '../../utils/formatters';

export default function CustomerDetails() {
  const { id } = useParams();
  const toast = useToast();
  const state = useFetch(() => getCustomerHistory(id), [id]);

  const pdf = async (customerId) => {
    try { await openMeasurementPdf(customerId); } catch (err) {
      // blob error bodies are not JSON; give a clear message
      toast.error(err.response?.status === 404 ? 'Add measurements before generating a PDF' : errorMessage(err));
    }
  };

  return (
    <Async state={state} loadingText="Loading customer…" errorText="Unable to load this customer.">
      {({ customer: c, measurements, orders, appointments }) => {
        const current = measurements.find((m) => m.is_current);
        return (
          <>
            <PageHeader title={c.name} subtitle={`Customer since ${formatDate(c.created_at)}`}>
              <Link className="btn" to={`/customers/${c.id}/edit`}>Edit customer</Link>
              <Link className="btn" to={`/customers/${c.id}/measurements/new`}>Add measurement</Link>
              <Link className="btn" to={`/orders/new?customerId=${c.id}`}>Create order</Link>
              <Link className="btn" to={`/appointments?customerId=${c.id}&new=1`}>Schedule appointment</Link>
              <Link className="btn" to={`/customers/${c.id}/history`}>View full history</Link>
              <button className="btn btn-primary" onClick={() => pdf(c.id)} disabled={!current}>Measurement PDF</button>
            </PageHeader>

            <div className="stack">
              <section className="card">
                <h2 style={{ marginBottom: 12 }}>Customer information</h2>
                <dl className="kv">
                  <div><dt>Phone</dt><dd>{c.phone}</dd></div>
                  <div><dt>Email</dt><dd>{c.email || '—'}</dd></div>
                  <div><dt>Gender</dt><dd>{c.gender ? label(c.gender) : '—'}</dd></div>
                  <div><dt>Address</dt><dd>{c.address || '—'}</dd></div>
                  <div><dt>Notes</dt><dd>{c.notes || '—'}</dd></div>
                </dl>
              </section>

              <section className="card">
                <div className="card-head">
                  <h2>Latest measurements {current && <span className="muted" style={{ fontWeight: 400 }}>· version {current.version}, {formatDate(current.created_at)}</span>}</h2>
                  {measurements.length > 0 && <Link to={`/customers/${c.id}/measurements/history`}>All {measurements.length} versions</Link>}
                </div>
                {current ? <MeasurementGrid m={current} /> : <p className="muted">No measurements recorded yet.</p>}
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
