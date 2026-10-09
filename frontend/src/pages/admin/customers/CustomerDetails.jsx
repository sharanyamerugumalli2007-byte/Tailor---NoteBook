import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { customerService } from '../../../services/customerService';
import { measurementService } from '../../../services/measurementService';
import { formatDate, formatTime } from '../../../utils/dateUtils';
import { formatCurrency } from '../../../utils/formatters';
import StatusBadge from '../../../components/StatusBadge';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import Modal from '../../../components/Modal';
import { useNotifications } from '../../../context/NotificationContext';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Ruler,
  Scissors,
  Calendar,
  History,
  FileDown,
  Edit2,
  Plus,
  ArrowLeft
} from 'lucide-react';

const CustomerDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick Add Measurement Modal State
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [measForm, setMeasForm] = useState({
    unit: 'inches',
    shoulder: '',
    chest: '',
    waist: '',
    hip: '',
    neck: '',
    sleeve_length: '',
    armhole: '',
    shirt_length: '',
    pant_length: '',
    thigh: '',
    knee: '',
    inseam: '',
    outseam: '',
    other_measurements: '',
    notes: ''
  });
  const [measSubmitting, setMeasSubmitting] = useState(false);

  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await customerService.getCustomerById(id);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch customer details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleOpenAddMeasurement = () => {
    // Pre-fill with current measurement values if available for easy adjustments!
    if (data?.latestMeasurement) {
      const cur = data.latestMeasurement;
      setMeasForm({
        unit: cur.unit || 'inches',
        shoulder: cur.shoulder || '',
        chest: cur.chest || '',
        waist: cur.waist || '',
        hip: cur.hip || '',
        neck: cur.neck || '',
        sleeve_length: cur.sleeve_length || '',
        armhole: cur.armhole || '',
        shirt_length: cur.shirt_length || '',
        pant_length: cur.pant_length || '',
        thigh: cur.thigh || '',
        knee: cur.knee || '',
        inseam: cur.inseam || '',
        outseam: cur.outseam || '',
        other_measurements: cur.other_measurements || '',
        notes: `Adjusted from v${cur.version}`
      });
    }
    setIsMeasurementModalOpen(true);
  };

  const handleSaveMeasurement = async (e) => {
    e.preventDefault();
    try {
      setMeasSubmitting(true);
      const res = await measurementService.createMeasurement(id, measForm);
      if (res.success) {
        showToast(res.message || 'New measurement version preserved!', 'success');
        setIsMeasurementModalOpen(false);
        fetchDetails();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to record measurements.');
    } finally {
      setMeasSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!data?.latestMeasurement) {
      alert('Please add measurements first before downloading PDF.');
      return;
    }
    window.open(`/api/pdf/measurements/${id}`, '_blank');
  };

  if (loading) return <Loading message="Loading customer profile & measurement records..." />;
  if (error) return <ErrorMessage message={error} retry={fetchDetails} />;
  if (!data?.customer) return <ErrorMessage message="Customer not found." />;

  const { customer, latestMeasurement, recentOrders, upcomingAppointments } = data;

  return (
    <div>
      {/* Top Breadcrumb & Action Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/customers')}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
              {customer.name}
            </h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Customer ID #{customer.id} &bull; Member since {formatDate(customer.created_at)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={handleDownloadPDF}
            disabled={!latestMeasurement}
            title="Download Customer Measurement Card PDF"
          >
            <FileDown size={16} /> Measurement Card PDF
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleOpenAddMeasurement}
          >
            <Ruler size={16} /> Add Measurement (v+)
          </button>
          <Link
            to={`/admin/orders/new?customerId=${customer.id}`}
            className="btn btn-primary btn-sm"
          >
            <Scissors size={16} /> Create Order
          </Link>
          <Link
            to={`/admin/customers/${customer.id}/history`}
            className="btn btn-secondary btn-sm"
          >
            <History size={16} /> Full 360 History
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Customer Information Card */}
        <div className="card">
          <h3 className="heading-serif" style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            Customer Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <User size={16} color="var(--text-muted)" />
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Full Name</span>
                <strong>{customer.name}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Phone size={16} color="var(--text-muted)" />
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Phone</span>
                <strong>{customer.phone}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Mail size={16} color="var(--text-muted)" />
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Email</span>
                <span>{customer.email || 'None provided'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <MapPin size={16} color="var(--text-muted)" style={{ marginTop: '0.2rem' }} />
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Address</span>
                <span>{customer.address || 'None provided'}</span>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Tailor Fit Notes</span>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginTop: '0.2rem', fontStyle: customer.notes ? 'normal' : 'italic' }}>
                {customer.notes || 'No notes specified.'}
              </p>
            </div>
          </div>
        </div>

        {/* Latest Measurements Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <div>
              <h3 className="heading-serif" style={{ fontSize: '1.15rem' }}>
                Latest Measurements
              </h3>
              {latestMeasurement && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Version {latestMeasurement.version} &bull; Recorded on {formatDate(latestMeasurement.created_at)}
                </span>
              )}
            </div>

            {latestMeasurement && (
              <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                Unit: {latestMeasurement.unit === 'cm' ? 'Centimeters' : 'Inches'}
              </span>
            )}
          </div>

          {!latestMeasurement ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <Ruler size={36} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <p style={{ fontWeight: 600 }}>No measurements recorded yet</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.75rem' }}
                onClick={handleOpenAddMeasurement}
              >
                <Plus size={14} /> Record First Measurement
              </button>
            </div>
          ) : (
            <div>
              {/* Measurement Points Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                {[
                  { label: 'Shoulder', val: latestMeasurement.shoulder },
                  { label: 'Chest', val: latestMeasurement.chest },
                  { label: 'Waist', val: latestMeasurement.waist },
                  { label: 'Hip', val: latestMeasurement.hip },
                  { label: 'Neck', val: latestMeasurement.neck },
                  { label: 'Sleeve Length', val: latestMeasurement.sleeve_length },
                  { label: 'Armhole', val: latestMeasurement.armhole },
                  { label: 'Shirt Length', val: latestMeasurement.shirt_length },
                  { label: 'Pant Length', val: latestMeasurement.pant_length },
                  { label: 'Thigh', val: latestMeasurement.thigh },
                  { label: 'Knee', val: latestMeasurement.knee },
                  { label: 'Inseam', val: latestMeasurement.inseam }
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: '#f8fafc',
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{item.label}</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>
                      {item.val != null ? `${item.val} ${latestMeasurement.unit === 'cm' ? 'cm' : '"'}` : '—'}
                    </strong>
                  </div>
                ))}
              </div>

              {latestMeasurement.other_measurements && (
                <div style={{ background: '#fffbeb', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#92400e' }}>Other Measurements: </strong>
                  <span style={{ color: '#78350f' }}>{latestMeasurement.other_measurements}</span>
                </div>
              )}

              {latestMeasurement.notes && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <strong>Measurement Notes: </strong> {latestMeasurement.notes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders & Appointments */}
      <div className="grid-2">
        {/* Customer Orders */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="heading-serif" style={{ fontSize: '1.15rem' }}>Recent Order History</h3>
            <Link to={`/admin/orders/new?customerId=${customer.id}`} className="btn btn-secondary btn-sm">
              <Plus size={14} /> New Order
            </Link>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Order Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(!recentOrders || recentOrders.length === 0) ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                      No orders yet for this customer.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <Link to={`/admin/orders/${ord.id}`} style={{ fontWeight: 600, color: 'var(--accent)' }}>
                          {ord.order_number}
                        </Link>
                      </td>
                      <td>{formatDate(ord.order_date)}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(ord.total_amount)}</td>
                      <td><StatusBadge status={ord.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Appointments */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="heading-serif" style={{ fontSize: '1.15rem' }}>Appointment History</h3>
            <Link to="/admin/appointments" className="btn btn-secondary btn-sm">
              <Plus size={14} /> Book Fitting
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {(!upcomingAppointments || upcomingAppointments.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No scheduled appointments.
              </div>
            ) : (
              upcomingAppointments.map((app) => (
                <div
                  key={app.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>{app.purpose} Fitting</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {formatDate(app.appointment_date)} at {formatTime(app.appointment_time)}
                    </div>
                  </div>
                  <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Record New Measurement Version Modal */}
      <Modal
        isOpen={isMeasurementModalOpen}
        onClose={() => setIsMeasurementModalOpen(false)}
        title={`Record New Measurement Version for ${customer.name}`}
        maxWidth="750px"
      >
        <form onSubmit={handleSaveMeasurement}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Preserves previous measurements and creates version v{(latestMeasurement?.version || 0) + 1}.
            </span>

            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${measForm.unit === 'inches' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => setMeasForm({ ...measForm, unit: 'inches' })}
              >
                Inches (")
              </button>
              <button
                type="button"
                className={`btn btn-sm ${measForm.unit === 'cm' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => setMeasForm({ ...measForm, unit: 'cm' })}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[
              { id: 'shoulder', label: 'Shoulder' },
              { id: 'chest', label: 'Chest / Bust' },
              { id: 'waist', label: 'Waist' },
              { id: 'hip', label: 'Hip' },
              { id: 'neck', label: 'Neck' },
              { id: 'sleeve_length', label: 'Sleeve Length' },
              { id: 'armhole', label: 'Armhole' },
              { id: 'shirt_length', label: 'Shirt / Kurta Length' },
              { id: 'pant_length', label: 'Pant / Trouser Length' },
              { id: 'thigh', label: 'Thigh' },
              { id: 'knee', label: 'Knee' },
              { id: 'inseam', label: 'Inseam' },
              { id: 'outseam', label: 'Outseam' }
            ].map((fld) => (
              <div key={fld.id} className="form-group" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>{fld.label}</label>
                <input
                  type="number"
                  step="0.25"
                  className="form-control"
                  placeholder={measForm.unit === 'inches' ? 'e.g. 36.5' : 'e.g. 92'}
                  value={measForm[fld.id] || ''}
                  onChange={(e) => setMeasForm({ ...measForm, [fld.id]: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label">Additional Custom Points</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Cross Back: 14.5, Bust Point: 10, Cuff: 9"
              value={measForm.other_measurements}
              onChange={(e) => setMeasForm({ ...measForm, other_measurements: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes for this version</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Taken for wedding lehenga blouse; comfort ease required"
              value={measForm.notes}
              onChange={(e) => setMeasForm({ ...measForm, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsMeasurementModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={measSubmitting}>
              {measSubmitting ? 'Saving Version...' : 'Save New Measurement Version'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerDetails;
