import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { getCustomer } from '../../services/customerService';
import { listMeasurements, restoreMeasurement } from '../../services/measurementService';
import { openMeasurementPdf } from '../../services/pdfService';
import { errorMessage } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { Async } from '../../components/Feedback';
import ConfirmDialog from '../../components/ConfirmDialog';
import MeasurementGrid from '../../components/MeasurementGrid';
import { useToast } from '../../components/Toast';
import { MEASUREMENT_FIELDS } from '../../utils/validation';
import { formatDate } from '../../utils/formatters';

export default function MeasurementHistory() {
  const { customerId } = useParams();
  const toast = useToast();
  const [restoring, setRestoring] = useState(null);
  const [busy, setBusy] = useState(false);
  const state = useFetch(async () => ({ customer: await getCustomer(customerId), versions: await listMeasurements(customerId) }), [customerId]);

  const restore = async () => {
    setBusy(true);
    try {
      const m = await restoreMeasurement(restoring.id);
      toast.success(`Version ${restoring.version} restored as version ${m.version}`);
      setRestoring(null);
      state.reload();
    } catch (err) { toast.error(errorMessage(err)); } finally { setBusy(false); }
  };

  const pdf = async (id) => { try { await openMeasurementPdf(customerId, id); } catch (err) { toast.error(errorMessage(err)); } };

  return (
    <Async state={state} loadingText="Loading measurement history…" errorText="Unable to load measurements."
      isEmpty={(d) => d.versions.length === 0} emptyText="No measurements recorded yet."
      emptyAction={<Link className="btn btn-primary" to={`/customers/${customerId}/measurements/new`}>Add measurements</Link>}>
      {({ customer, versions }) => (
        <>
          <PageHeader title={`Measurement history — ${customer.name}`} subtitle={`${versions.length} version${versions.length === 1 ? '' : 's'}. Changes from the previous version are highlighted.`}>
            <Link className="btn" to={`/customers/${customerId}`}>Back to customer</Link>
            <Link className="btn btn-primary" to={`/customers/${customerId}/measurements/new`}>Add new version</Link>
          </PageHeader>

          <div className="stack">
            {versions.map((m, i) => (
              <section className="card" key={m.id}>
                <div className="card-head">
                  <h2>Version {m.version} <span className="muted" style={{ fontWeight: 400 }}>· {formatDate(m.created_at)}</span> {m.is_current && <span className="badge badge-good">Current</span>}</h2>
                  <div className="page-actions">
                    <button className="btn btn-sm" onClick={() => pdf(m.id)}>PDF</button>
                    <Link className="btn btn-sm" to={`/customers/${customerId}/measurements/new?from=${m.id}`}>Edit as new version</Link>
                    {!m.is_current && <button className="btn btn-sm" onClick={() => setRestoring(m)}>Restore</button>}
                  </div>
                </div>
                <MeasurementGrid m={m} compareTo={versions[i + 1]} />
              </section>
            ))}

            {versions.length > 1 && (
              <section className="card">
                <h2 style={{ marginBottom: 12 }}>Compare versions</h2>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Measurement</th>{versions.map((m) => <th key={m.id} className="num">v{m.version} ({m.unit})</th>)}</tr></thead>
                    <tbody>
                      {MEASUREMENT_FIELDS.filter(([k]) => versions.some((m) => m[k] != null)).map(([k, text]) => (
                        <tr key={k}><td>{text}</td>{versions.map((m) => <td key={m.id} className="num">{m[k] ?? '—'}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {restoring && (
            <ConfirmDialog title="Restore this version?" confirmText="Restore" busy={busy} onCancel={() => setRestoring(null)} onConfirm={restore}
              message={`Version ${restoring.version} will be copied as a new current version. Nothing is deleted, so you can switch back at any time.`} />
          )}
        </>
      )}
    </Async>
  );
}
