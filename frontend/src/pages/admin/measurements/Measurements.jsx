import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customerService } from '../../../services/customerService';
import { measurementService } from '../../../services/measurementService';
import SearchBar from '../../../components/SearchBar';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import { useNotifications } from '../../../context/NotificationContext';
import { formatDate } from '../../../utils/dateUtils';
import {
  Ruler,
  Plus,
  History,
  FileDown,
  Eye,
  ArrowRight
} from 'lucide-react';

const Measurements = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Measurement Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
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
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await customerService.getCustomers({ q: searchQuery });
      if (res.success && res.data) {
        setCustomers(res.data.customers || []);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch customer measurement lists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenAdd = (cust) => {
    setSelectedCustomerId(cust.id);
    setMeasForm({
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
    setIsModalOpen(true);
  };

  const handleSaveMeasurement = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Please select a customer.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await measurementService.createMeasurement(selectedCustomerId, measForm);
      if (res.success) {
        showToast(res.message || 'New measurement version recorded!', 'success');
        setIsModalOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to save measurement version.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Customer',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.phone}</div>
        </div>
      )
    },
    {
      header: 'Current Active Version',
      accessor: (row) => (
        row.current_measurement_version ? (
          <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
            Version {row.current_measurement_version}
          </span>
        ) : (
          <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
            Not Recorded
          </span>
        )
      )
    },
    {
      header: 'Total History Versions',
      accessor: (row) => (
        <span>{row.total_measurement_versions || 0} version(s) in archive</span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={(e) => { e.stopPropagation(); handleOpenAdd(row); }}
            title="Take New Measurement Version"
          >
            <Plus size={14} /> New Version
          </button>
          <Link
            to={`/admin/measurements/customer/${row.id}`}
            className="btn btn-secondary btn-sm"
            title="View History & Compare Versions"
          >
            <History size={14} /> Versions & Compare
          </Link>
          {row.current_measurement_version && (
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/api/pdf/measurements/${row.id}`, '_blank');
              }}
              title="Download Measurement Card PDF"
            >
              <FileDown size={14} /> PDF
            </button>
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
            Measurements Management
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage versioned customer measurements, preserve historical changes, and generate printable measurement cards.
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} retry={fetchCustomers} />}

      {/* Search Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search customer for measurements..."
          onClear={() => setSearchQuery('')}
        />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        emptyMessage="No customer records found."
        onRowClick={(row) => navigate(`/admin/measurements/customer/${row.id}`)}
      />

      {/* Record Measurement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Measurement Version"
        maxWidth="750px"
      >
        <form onSubmit={handleSaveMeasurement}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <strong style={{ fontSize: '0.9rem' }}>
                Customer: {customers.find(c => c.id == selectedCustomerId)?.name || 'Selected Customer'}
              </strong>
            </div>

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
                  value={measForm[fld.id]}
                  onChange={(e) => setMeasForm({ ...measForm, [fld.id]: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label">Other Custom Measurements</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Cross Back: 14.5, Front Depth: 7, Bicep: 13"
              value={measForm.other_measurements}
              onChange={(e) => setMeasForm({ ...measForm, other_measurements: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes for this version</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Taken for festival sherwani fit; relaxed armhole requested"
              value={measForm.notes}
              onChange={(e) => setMeasForm({ ...measForm, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving Version...' : 'Save New Version'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Measurements;
