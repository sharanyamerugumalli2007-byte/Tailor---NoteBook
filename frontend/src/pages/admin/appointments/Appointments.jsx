import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../../services/appointmentService';
import { customerService } from '../../../services/customerService';
import { formatDate, formatTime, getTodayDateInput } from '../../../utils/dateUtils';
import StatusBadge from '../../../components/StatusBadge';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import { useNotifications } from '../../../context/NotificationContext';
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Month navigation for Calendar View
  const [currentDate, setCurrentDate] = useState(new Date());

  // Add Appointment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    appointmentDate: getTodayDateInput(),
    appointmentTime: '11:00',
    purpose: 'Measurement',
    notes: ''
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const { showToast } = useNotifications();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [apptsRes, custRes] = await Promise.all([
        appointmentService.getAppointments({
          status: statusFilter !== 'all' ? statusFilter : undefined
        }),
        customerService.getCustomers({ limit: 100 })
      ]);

      if (apptsRes.success) setAppointments(apptsRes.data || []);
      if (custRes.success) setCustomers(custRes.data?.customers || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleOpenAdd = (selectedDay = null) => {
    setModalError(null);
    setFormData({
      customerId: customers.length > 0 ? customers[0].id : '',
      appointmentDate: selectedDay || getTodayDateInput(),
      appointmentTime: '11:00',
      purpose: 'Measurement',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.appointmentDate || !formData.appointmentTime) {
      setModalError('Customer, date, and time are required.');
      return;
    }

    try {
      setModalSubmitting(true);
      setModalError(null);
      const res = await appointmentService.createAppointment(formData);
      if (res.success) {
        showToast('Appointment scheduled successfully!', 'success');
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setModalError(err.userMessage || 'Conflict or scheduling error.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, { status });
      showToast(`Appointment marked as ${status}`, 'success');
      fetchData();
    } catch (err) {
      alert(err.userMessage || 'Failed to update status.');
    }
  };

  // Calendar Calculation Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Group appointments by date string YYYY-MM-DD
  const apptsByDate = {};
  appointments.forEach(a => {
    const dStr = a.appointment_date ? a.appointment_date.slice(0, 10) : '';
    if (!apptsByDate[dStr]) apptsByDate[dStr] = [];
    apptsByDate[dStr].push(a);
  });

  const columns = [
    {
      header: 'Date & Time',
      accessor: (row) => (
        <div>
          <strong>{formatDate(row.appointment_date)}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            at {formatTime(row.appointment_time)}
          </div>
        </div>
      )
    },
    {
      header: 'Customer',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.customer_name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.customer_phone}</div>
        </div>
      )
    },
    {
      header: 'Purpose',
      accessor: (row) => (
        <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
          {row.purpose} Fitting
        </span>
      )
    },
    {
      header: 'Notes',
      accessor: (row) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {row.notes || '—'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          {row.status === 'Scheduled' && (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ color: '#15803d' }}
                onClick={() => handleStatusChange(row.id, 'Completed')}
                title="Mark Completed"
              >
                <CheckCircle size={14} /> Completed
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ color: '#b91c1c' }}
                onClick={() => handleStatusChange(row.id, 'Cancelled')}
                title="Cancel Appointment"
              >
                <XCircle size={14} /> Cancel
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
            Appointments & Fitting Schedule
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Interactive studio calendar to organize body measurements, basted trials, and final garment handovers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 0 }}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon size={16} /> Calendar
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 0 }}
              onClick={() => setViewMode('list')}
            >
              <List size={16} /> List
            </button>
          </div>

          <button type="button" className="btn btn-primary btn-sm" onClick={() => handleOpenAdd()}>
            <Plus size={16} /> Book Appointment
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} retry={fetchData} />}

      {/* Filter Header */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status Filter:</label>
          <select
            className="form-control form-select"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Appointments</option>
            <option value="Scheduled">Scheduled Only</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {viewMode === 'calendar' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={prevMonth}>
              <ChevronLeft size={16} />
            </button>
            <strong style={{ fontSize: '1rem', minWidth: '150px', textAlign: 'center' }}>
              {monthName} {year}
            </strong>
            <button type="button" className="btn btn-secondary btn-sm" onClick={nextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* View 1: Calendar View */}
      {viewMode === 'calendar' ? (
        <div className="card" style={{ padding: '1rem' }}>
          {/* Day of Week Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.5rem 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {/* Blank leading days */}
            {Array.from({ length: firstDay }).map((_, idx) => (
              <div key={`blank-${idx}`} style={{ minHeight: '100px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', opacity: 0.5 }} />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayAppts = apptsByDate[dateKey] || [];
              const isToday = dateKey === getTodayDateInput();

              return (
                <div
                  key={dateKey}
                  onClick={() => handleOpenAdd(dateKey)}
                  style={{
                    minHeight: '110px',
                    border: isToday ? '2px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem',
                    backgroundColor: isToday ? '#fffdf7' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{
                      fontWeight: isToday ? 800 : 600,
                      fontSize: '0.8125rem',
                      color: isToday ? 'var(--accent)' : 'var(--text-main)',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      backgroundColor: isToday ? 'var(--accent-light)' : 'transparent'
                    }}>
                      {dayNum}
                    </span>
                    {dayAppts.length > 0 && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)' }}>
                        {dayAppts.length} fitting(s)
                      </span>
                    )}
                  </div>

                  {/* Appointment Chips in Cell */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', flex: 1 }}>
                    {dayAppts.map(a => (
                      <div
                        key={a.id}
                        style={{
                          backgroundColor: a.status === 'Completed' ? '#dcfce7' : a.status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                          border: `1px solid ${a.status === 'Completed' ? '#bbf7d0' : a.status === 'Cancelled' ? '#fecaca' : '#fde68a'}`,
                          borderRadius: '4px',
                          padding: '2px 4px',
                          fontSize: '0.65rem',
                          lineHeight: 1.2
                        }}
                        title={`${a.customer_name} (${a.purpose}) at ${formatTime(a.appointment_time)}`}
                      >
                        <strong style={{ color: 'var(--text-main)' }}>{formatTime(a.appointment_time)}</strong>: {a.customer_name.split(' ')[0]} ({a.purpose})
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* View 2: List View */
        <DataTable
          columns={columns}
          data={appointments}
          loading={loading}
          emptyMessage="No scheduled appointments found."
        />
      )}

      {/* Book Appointment Modal (with Conflict Checking) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Fitting Appointment"
        maxWidth="500px"
      >
        {modalError && (
          <div style={{
            background: 'var(--danger-bg)',
            color: '#991b1b',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <AlertTriangle size={18} />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleCreateAppointment}>
          <div className="form-group">
            <label className="form-label">Customer *</label>
            <select
              className="form-control form-select"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-control"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time Slot *</label>
              <select
                className="form-control form-select"
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                required
              >
                {['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'].map(t => (
                  <option key={t} value={`${t}:00`}>{formatTime(`${t}:00`)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Fitting Purpose *</label>
            <select
              className="form-control form-select"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            >
              <option value="Measurement">Measurement (Initial Body Tape)</option>
              <option value="Trial">Trial (Basted Fit / Hem Adjustment)</option>
              <option value="Delivery">Delivery (Final Inspection & Pick-up)</option>
              <option value="Consultation">Consultation (Design & Fabric Sketch)</option>
              <option value="Alteration">Alteration (Fit Adjustment)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              rows="2"
              className="form-control"
              placeholder="Garment reference or customer notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={modalSubmitting}>
              {modalSubmitting ? 'Checking Slot & Scheduling...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;
