import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { formatDate, formatTime, getTodayDateInput } from '../../utils/dateUtils';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { useNotifications } from '../../context/NotificationContext';
import { Calendar, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const CustomerAppointments = () => {
  const { customer } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    appointmentDate: getTodayDateInput(),
    appointmentTime: '11:00:00',
    purpose: 'Measurement',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const { showToast } = useNotifications();

  const fetchAppointments = async () => {
    if (!customer?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await appointmentService.getAppointments({ customerId: customer.id });
      if (res.success) setAppointments(res.data || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [customer]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!customer?.id) return;

    try {
      setSubmitting(true);
      setModalError(null);
      const res = await appointmentService.createAppointment({
        customerId: customer.id,
        ...formData
      });
      if (res.success) {
        showToast('Fitting appointment scheduled!', 'success');
        setIsModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      setModalError(err.userMessage || 'Selected time slot is already booked.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading your fitting appointments..." />;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
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
            My Fitting & Trial Sessions
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Book appointments for body measurements, basted trials, or final garment collections.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Book New Session
        </button>
      </div>

      {error && <ErrorMessage message={error} retry={fetchAppointments} />}

      {appointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <Calendar size={44} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            No appointments scheduled
          </h4>
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Book a dedicated fitting slot with our master tailor for personalized styling.
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
            Schedule a Session
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.map((app) => (
            <div key={app.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem 1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>
                    {app.purpose} Fitting
                  </strong>
                  <StatusBadge status={app.status} />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  📅 {formatDate(app.appointment_date)} at <strong>{formatTime(app.appointment_time)}</strong>
                </div>
                {app.notes && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginTop: '0.35rem' }}>
                    Notes: {app.notes}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Venue: Heritage Bespoke Studio, Bengaluru
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Fitting Session with Master Tailor"
        maxWidth="480px"
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

        <form onSubmit={handleBook}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Preferred Date *</label>
              <input
                type="date"
                min={getTodayDateInput()}
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
                {['10:00:00', '11:00:00', '12:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00', '18:00:00'].map(t => (
                  <option key={t} value={t}>{formatTime(t)}</option>
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
              <option value="Measurement">Measurement (Body Tape Record)</option>
              <option value="Trial">Trial (Garment Fitting & Check)</option>
              <option value="Delivery">Delivery (Final Collection)</option>
              <option value="Consultation">Consultation (Design & Fabric Selection)</option>
              <option value="Alteration">Alteration (Fit Adjustment)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Garment or Fitting Notes</label>
            <textarea
              rows="2"
              className="form-control"
              placeholder="e.g. Trial for wedding blouse before final hook stitch"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Checking Availability...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerAppointments;
