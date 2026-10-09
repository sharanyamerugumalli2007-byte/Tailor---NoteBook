import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFetch, useDebounced } from '../../hooks/useFetch';
import { deleteAppointment, listAppointments, updateAppointmentStatus } from '../../services/appointmentService';
import { errorMessage } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';
import { Async } from '../../components/Feedback';
import { useToast } from '../../components/Toast';
import Calendar from './Calendar';
import AppointmentForm from './AppointmentForm';
import { APPT_STATUSES } from '../../utils/validation';
import { monthGrid, todayISO } from '../../utils/dateUtils';
import { formatDate, formatTime, label } from '../../utils/formatters';
import { Link } from 'react-router-dom';

export default function Appointments() {
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const now = new Date();
  const [view, setView] = useState('calendar');
  const [ym, setYm] = useState([now.getFullYear(), now.getMonth()]);
  const [selected, setSelected] = useState(todayISO());
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const q = useDebounced(search);

  // null = closed; {} = new; {appointment} = edit
  const [form, setForm] = useState(params.get('new') ? { defaults: { customerId: params.get('customerId') } } : null);
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const days = useMemo(() => monthGrid(ym[0], ym[1]), [ym]);
  const state = useFetch(() => listAppointments(view === 'calendar'
    ? { from: days[0], to: days[41], search: q || undefined }
    : { search: q || undefined, status: status || undefined }),
  [view, days, q, status]);

  const byDate = useMemo(() => {
    const m = {};
    (state.data || []).forEach((a) => { (m[a.appointment_date] ||= []).push(a); });
    return m;
  }, [state.data]);

  const closeForm = () => { setForm(null); if (params.get('new')) setParams({}, { replace: true }); };
  const saved = (a, editing) => { toast.success(editing ? 'Appointment updated' : 'Appointment scheduled'); closeForm(); setDetail(null); state.reload(); };

  const act = async (fn, msg) => {
    setBusy(true);
    try { await fn(); toast.success(msg); setConfirm(null); setDetail(null); state.reload(); }
    catch (err) { toast.error(errorMessage(err)); } finally { setBusy(false); }
  };

  const selectedList = byDate[selected] || [];

  return (
    <>
      <PageHeader title="Appointments" subtitle="Measurements, trials, deliveries and consultations">
        <div className="unit-toggle" role="radiogroup" aria-label="View">
          <label><input type="radio" checked={view === 'calendar'} onChange={() => setView('calendar')} /><span>Calendar</span></label>
          <label><input type="radio" checked={view === 'list'} onChange={() => setView('list')} /><span>List</span></label>
        </div>
        <button className="btn btn-primary" onClick={() => setForm({ defaults: { date: view === 'calendar' && selected >= todayISO() ? selected : undefined } })}>Add appointment</button>
      </PageHeader>

      <div className="card">
        <div className="toolbar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by customer name or phone" />
          {view === 'list' && (
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>{APPT_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
            </select>
          )}
        </div>

        <Async state={state} loadingText="Loading appointments…" errorText="Unable to load appointments."
          isEmpty={(d) => view === 'list' && d.length === 0} emptyText="No appointments found.">
          {(d) => view === 'calendar' ? (
            <>
              <Calendar year={ym[0]} month={ym[1]} byDate={byDate} selected={selected} onSelectDate={setSelected} onSelectAppt={setDetail} onNavigate={(y, m) => setYm([y, m])} />
              <h3 style={{ margin: '18px 0 8px' }}>{formatDate(selected)}</h3>
              {selectedList.length === 0 ? <p className="muted">No appointments on this day.</p> : (
                <ul className="list">
                  {selectedList.map((a) => (
                    <li key={a.id}>
                      <button className="btn btn-sm" onClick={() => setDetail(a)}>{formatTime(a.appointment_time)}</button>
                      <span style={{ flex: 1 }}>{a.customer_name} · {label(a.purpose)}</span>
                      <StatusBadge value={a.status} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Time</th><th>Customer</th><th>Purpose</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {d.map((a) => (
                    <tr key={a.id}>
                      <td>{formatDate(a.appointment_date)}</td><td>{formatTime(a.appointment_time)}</td>
                      <td><Link to={`/customers/${a.customer_id}`}>{a.customer_name}</Link></td>
                      <td>{label(a.purpose)}</td><td><StatusBadge value={a.status} /></td>
                      <td><div className="row-actions"><button className="btn btn-sm" onClick={() => setDetail(a)}>Details</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Async>
      </div>

      {detail && !form && (
        <Modal title="Appointment details" onClose={() => setDetail(null)}
          footer={<>
            <button className="btn btn-danger" onClick={() => setConfirm({ type: 'delete' })}>Delete</button>
            {['SCHEDULED', 'RESCHEDULED'].includes(detail.status) && <>
              <button className="btn" onClick={() => setConfirm({ type: 'cancel' })}>Cancel appointment</button>
              <button className="btn" onClick={() => act(() => updateAppointmentStatus(detail.id, 'COMPLETED'), 'Marked as completed')}>Mark completed</button>
            </>}
            <button className="btn btn-primary" onClick={() => setForm({ appointment: detail })}>Edit / reschedule</button>
          </>}>
          <dl className="kv">
            <div><dt>Customer</dt><dd><Link to={`/customers/${detail.customer_id}`}>{detail.customer_name}</Link></dd></div>
            <div><dt>Phone</dt><dd>{detail.customer_phone}</dd></div>
            <div><dt>Date</dt><dd>{formatDate(detail.appointment_date)}</dd></div>
            <div><dt>Time</dt><dd>{formatTime(detail.appointment_time)}</dd></div>
            <div><dt>Purpose</dt><dd>{label(detail.purpose)}</dd></div>
            <div><dt>Status</dt><dd><StatusBadge value={detail.status} /></dd></div>
            {detail.notes && <div><dt>Notes</dt><dd>{detail.notes}</dd></div>}
          </dl>
        </Modal>
      )}

      {form && <AppointmentForm appointment={form.appointment} defaults={form.defaults} onClose={closeForm} onSaved={saved} />}

      {confirm?.type === 'cancel' && (
        <ConfirmDialog title="Cancel appointment?" confirmText="Cancel appointment" danger busy={busy} onCancel={() => setConfirm(null)}
          onConfirm={() => act(() => updateAppointmentStatus(detail.id, 'CANCELLED'), 'Appointment cancelled')}
          message={`The appointment with ${detail.customer_name} on ${formatDate(detail.appointment_date)} will be marked cancelled.`} />
      )}
      {confirm?.type === 'delete' && (
        <ConfirmDialog title="Delete appointment?" confirmText="Delete" danger busy={busy} onCancel={() => setConfirm(null)}
          onConfirm={() => act(() => deleteAppointment(detail.id), 'Appointment deleted')}
          message="This permanently removes the appointment. To keep a record, cancel it instead." />
      )}
    </>
  );
}
