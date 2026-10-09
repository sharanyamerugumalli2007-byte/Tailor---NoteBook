import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { measurementService } from '../../services/measurementService';
import { customerService } from '../../services/customerService';
import { formatDate } from '../../utils/dateUtils';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { useNotifications } from '../../context/NotificationContext';
import {
  Ruler,
  FileDown,
  Sparkles,
  CheckCircle2,
  Save,
  PlusCircle,
  Clock,
  UserCheck,
  History,
  Trash2
} from 'lucide-react';

const CustomerMeasurements = () => {
  const { user } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [measurementsData, setMeasurementsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  // Form State
  const [form, setForm] = useState({
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
    notes: 'My Blouse & Dress Measurements'
  });

  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch customer
      const custRes = await customerService.getCustomers({ limit: 100 });
      let currentCust = null;
      if (custRes.success && custRes.data) {
        const list = custRes.data.customers || custRes.data;
        currentCust = list.find(c => c.user_id === user?.id || c.email === user?.email);
        setCustomer(currentCust);
      }

      // 2. Fetch measurements
      if (currentCust) {
        const res = await measurementService.getCustomerMeasurements(currentCust.id);
        if (res.success && res.data) {
          setMeasurementsData(res.data);
          const cur = res.data.current || (Array.isArray(res.data) ? res.data[0] : res.data);
          if (cur) {
            setForm({
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
              notes: cur.notes || 'My Saved Measurements'
            });
          }
        }
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load measurements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!customer?.id) {
      showToast('Customer record not found. Please contact studio.', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        unit: form.unit,
        shoulder: parseFloat(form.shoulder) || null,
        chest: parseFloat(form.chest) || null,
        waist: parseFloat(form.waist) || null,
        hip: parseFloat(form.hip) || null,
        neck: parseFloat(form.neck) || null,
        sleeve_length: parseFloat(form.sleeve_length) || null,
        armhole: parseFloat(form.armhole) || null,
        shirt_length: parseFloat(form.shirt_length) || null,
        pant_length: parseFloat(form.pant_length) || null,
        thigh: parseFloat(form.thigh) || null,
        knee: parseFloat(form.knee) || null,
        inseam: parseFloat(form.inseam) || null,
        outseam: parseFloat(form.outseam) || null,
        other_measurements: form.other_measurements,
        notes: form.notes
      };

      const res = await measurementService.createMeasurement(customer.id, payload);
      if (res.success) {
        showToast('✨ New measurement version saved successfully!', 'success');
        fetchMeasurements();
      }
    } catch (err) {
      showToast(err.userMessage || 'Failed to save measurements.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Loading digital measurement profiles..." />;
  if (error) return <ErrorMessage message={error} retry={fetchMeasurements} />;

  const currentM = measurementsData?.current;
  const historyList = measurementsData?.history || [];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--rose-primary)', fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            <Ruler size={16} /> Precision Fit Vault
          </div>
          <h1 className="heading-serif" style={{ fontSize: '2rem', color: 'var(--primary)' }}>
            My Body Measurements
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            Save your measurements once and instantly apply them to all your bespoke orders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/customer/orders/new" className="btn btn-primary btn-pill pulse-glow">
            <PlusCircle size={16} /> Use for New Order
          </Link>
          {customer && (
            <a
              href={`/api/pdf/measurements/${customer.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-pill"
            >
              <FileDown size={15} /> Download PDF Card
            </a>
          )}
        </div>
      </div>

      {/* Main Measurements Form Card */}
      <div className="card" style={{ padding: '2.25rem 2rem', marginBottom: '2.5rem', border: '1.5px solid var(--pink-border)', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <h2 className="heading-serif" style={{ fontSize: '1.35rem', color: 'var(--primary)' }}>
              Active Profile Measurements
            </h2>
            {currentM && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--rose-primary)', fontWeight: 600 }}>
                Version {currentM.version} &bull; Last updated {formatDate(currentM.created_at)}
              </span>
            )}
          </div>

          {/* Unit Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Unit:</span>
            <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-full)', border: '1px solid var(--pink-border)', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, unit: 'inches' }))}
                style={{
                  padding: '0.35rem 0.85rem',
                  border: 'none',
                  background: form.unit === 'inches' ? 'var(--rose-primary)' : 'white',
                  color: form.unit === 'inches' ? 'white' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  cursor: 'pointer'
                }}
              >
                Inches
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, unit: 'cm' }))}
                style={{
                  padding: '0.35rem 0.85rem',
                  border: 'none',
                  background: form.unit === 'cm' ? 'var(--rose-primary)' : 'white',
                  color: form.unit === 'cm' ? 'white' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  cursor: 'pointer'
                }}
              >
                Centimeters
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.75rem'
          }}>
            <div className="form-group">
              <label className="form-label">Shoulder Width ({form.unit})</label>
              <input type="number" step="0.1" name="shoulder" value={form.shoulder} onChange={handleChange} className="form-control" placeholder="14.5" />
            </div>
            <div className="form-group">
              <label className="form-label">Bust / Chest ({form.unit}) *</label>
              <input type="number" step="0.1" name="chest" value={form.chest} onChange={handleChange} className="form-control" placeholder="36.0" required />
            </div>
            <div className="form-group">
              <label className="form-label">Waist ({form.unit}) *</label>
              <input type="number" step="0.1" name="waist" value={form.waist} onChange={handleChange} className="form-control" placeholder="30.0" required />
            </div>
            <div className="form-group">
              <label className="form-label">Hip ({form.unit})</label>
              <input type="number" step="0.1" name="hip" value={form.hip} onChange={handleChange} className="form-control" placeholder="38.0" />
            </div>
            <div className="form-group">
              <label className="form-label">Neck ({form.unit})</label>
              <input type="number" step="0.1" name="neck" value={form.neck} onChange={handleChange} className="form-control" placeholder="14.0" />
            </div>
            <div className="form-group">
              <label className="form-label">Sleeve Length ({form.unit})</label>
              <input type="number" step="0.1" name="sleeve_length" value={form.sleeve_length} onChange={handleChange} className="form-control" placeholder="16.5" />
            </div>
            <div className="form-group">
              <label className="form-label">Armhole ({form.unit})</label>
              <input type="number" step="0.1" name="armhole" value={form.armhole} onChange={handleChange} className="form-control" placeholder="16.0" />
            </div>
            <div className="form-group">
              <label className="form-label">Shirt / Blouse Length ({form.unit})</label>
              <input type="number" step="0.1" name="shirt_length" value={form.shirt_length} onChange={handleChange} className="form-control" placeholder="24.0" />
            </div>
            <div className="form-group">
              <label className="form-label">Pant / Skirt Length ({form.unit})</label>
              <input type="number" step="0.1" name="pant_length" value={form.pant_length} onChange={handleChange} className="form-control" placeholder="38.5" />
            </div>
            <div className="form-group">
              <label className="form-label">Thigh ({form.unit})</label>
              <input type="number" step="0.1" name="thigh" value={form.thigh} onChange={handleChange} className="form-control" placeholder="21.5" />
            </div>
            <div className="form-group">
              <label className="form-label">Inseam ({form.unit})</label>
              <input type="number" step="0.1" name="inseam" value={form.inseam} onChange={handleChange} className="form-control" placeholder="28.5" />
            </div>
            <div className="form-group">
              <label className="form-label">Profile Label</label>
              <input type="text" name="notes" value={form.notes} onChange={handleChange} className="form-control" placeholder="e.g. My Festive Fit" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--pink-soft)', paddingTop: '1.25rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-pill"
              disabled={saving}
            >
              <Save size={16} /> {saving ? 'Saving Measurements...' : 'Save New Measurement Version'}
            </button>
          </div>
        </form>
      </div>

      {/* Version History Table */}
      {historyList.length > 0 && (
        <div className="card" style={{ overflow: 'hidden', border: '1px solid var(--pink-border)' }}>
          <div className="card-header">
            <h3 className="heading-serif" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
              Measurement Revision History
            </h3>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Date Recorded</th>
                  <th>Unit</th>
                  <th>Bust</th>
                  <th>Waist</th>
                  <th>Hip</th>
                  <th>Shoulder</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 700 }}>v{m.version}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDate(m.created_at)}</td>
                    <td><span className="badge badge-pink">{m.unit}</span></td>
                    <td style={{ fontWeight: 600 }}>{m.chest}</td>
                    <td style={{ fontWeight: 600 }}>{m.waist}</td>
                    <td>{m.hip || '—'}</td>
                    <td>{m.shoulder || '—'}</td>
                    <td>
                      {m.is_current ? (
                        <span className="badge badge-green">Active Current</span>
                      ) : (
                        <span className="badge badge-rose">Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMeasurements;
