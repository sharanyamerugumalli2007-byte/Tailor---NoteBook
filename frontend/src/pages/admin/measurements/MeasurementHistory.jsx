import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { customerService } from '../../../services/customerService';
import { measurementService } from '../../../services/measurementService';
import { formatDate } from '../../../utils/dateUtils';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import Modal from '../../../components/Modal';
import { useNotifications } from '../../../context/NotificationContext';
import {
  Ruler,
  ArrowLeft,
  RotateCcw,
  GitCompare,
  FileDown,
  CheckCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';

const MeasurementHistory = () => {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [measurementsData, setMeasurementsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Compare Tool State
  const [v1Id, setV1Id] = useState('');
  const [v2Id, setV2Id] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparing, setComparing] = useState(false);

  // Restore State
  const [restoringId, setRestoringId] = useState(null);

  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [custRes, measRes] = await Promise.all([
        customerService.getCustomerById(customerId),
        measurementService.getCustomerMeasurements(customerId)
      ]);

      if (custRes.success) setCustomer(custRes.data.customer);
      if (measRes.success) {
        setMeasurementsData(measRes.data);
        const vers = measRes.data.versions || [];
        if (vers.length >= 2) {
          setV1Id(vers[1].id);
          setV2Id(vers[0].id);
        } else if (vers.length === 1) {
          setV1Id(vers[0].id);
          setV2Id(vers[0].id);
        }
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch measurement history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [customerId]);

  const handleCompare = async () => {
    if (!v1Id || !v2Id) return;
    try {
      setComparing(true);
      const res = await measurementService.compareVersions(v1Id, v2Id);
      if (res.success) {
        setComparisonResult(res.data);
      }
    } catch (err) {
      alert(err.userMessage || 'Comparison failed.');
    } finally {
      setComparing(false);
    }
  };

  const handleRestore = async (version) => {
    if (!window.confirm(`Are you sure you want to restore Version ${version.version} as the current active measurement?`)) {
      return;
    }

    try {
      setRestoringId(version.id);
      const res = await measurementService.restoreVersion(version.id);
      if (res.success) {
        showToast(res.message || `Restored version ${version.version} as current!`, 'success');
        fetchData();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to restore version.');
    } finally {
      setRestoringId(null);
    }
  };

  if (loading) return <Loading message="Loading measurement versions archive..." />;
  if (error) return <ErrorMessage message={error} retry={fetchData} />;

  const versions = measurementsData?.versions || [];

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/measurements')}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
              Measurement History & Comparison
            </h2>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Customer: <strong>{customer?.name}</strong> &bull; {versions.length} version(s) in record
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => window.open(`/api/pdf/measurements/${customerId}`, '_blank')}
          disabled={versions.length === 0}
        >
          <FileDown size={16} /> Download Active Card PDF
        </button>
      </div>

      {/* Version Comparison Selector Card */}
      {versions.length >= 2 && (
        <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <GitCompare size={20} color="var(--accent)" />
            <h3 className="heading-serif" style={{ fontSize: '1.15rem' }}>
              Compare Two Measurement Versions
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Baseline Version:</label>
              <select
                className="form-control form-select"
                style={{ width: '160px' }}
                value={v1Id}
                onChange={(e) => setV1Id(e.target.value)}
              >
                {versions.map(v => (
                  <option key={v.id} value={v.id}>
                    v{v.version} ({formatDate(v.created_at)})
                  </option>
                ))}
              </select>
            </div>

            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>VS</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Target Version:</label>
              <select
                className="form-control form-select"
                style={{ width: '160px' }}
                value={v2Id}
                onChange={(e) => setV2Id(e.target.value)}
              >
                {versions.map(v => (
                  <option key={v.id} value={v.id}>
                    v{v.version} ({formatDate(v.created_at)}) {v.is_current ? '★ Current' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCompare}
              disabled={comparing}
            >
              {comparing ? 'Calculating...' : 'Compare Side-by-Side'}
            </button>
          </div>

          {/* Comparison Diff Table */}
          {comparisonResult && (
            <div style={{ marginTop: '1.25rem' }}>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Measurement Point</th>
                      <th>Version {comparisonResult.version1.version} ({comparisonResult.version1.unit})</th>
                      <th>Version {comparisonResult.version2.version} ({comparisonResult.version2.unit})</th>
                      <th>Difference / Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonResult.comparisons.map((c) => {
                      const hasDiff = c.diff !== 0 && c.diff != null;
                      const isPositive = c.diff > 0;
                      return (
                        <tr key={c.field}>
                          <td><strong>{c.label}</strong></td>
                          <td>{c.v1 != null ? `${c.v1}` : '—'}</td>
                          <td>{c.v2 != null ? `${c.v2}` : '—'}</td>
                          <td>
                            {c.diff == null ? (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            ) : c.diff === 0 ? (
                              <span style={{ color: 'var(--text-muted)' }}>No change (0.00)</span>
                            ) : (
                              <span style={{
                                fontWeight: 700,
                                color: isPositive ? 'var(--accent)' : '#0284c7'
                              }}>
                                {isPositive ? `+${c.diff}` : c.diff} {comparisonResult.version2.unit === 'cm' ? 'cm' : '"'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Version Archive List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {versions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            No measurement versions saved yet for this customer.
          </div>
        ) : (
          versions.map((ver) => (
            <div
              key={ver.id}
              className="card"
              style={{
                border: ver.is_current ? '2px solid var(--accent)' : '1px solid var(--border)',
                backgroundColor: ver.is_current ? '#fffdf7' : '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: ver.is_current ? 'var(--accent)' : 'var(--bg-subtle)',
                    color: ver.is_current ? '#ffffff' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}>
                    v{ver.version}
                  </div>
                  <div>
                    <strong style={{ fontSize: '1rem' }}>Measurement Version {ver.version}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Recorded on {formatDate(ver.created_at)} &bull; Unit: {ver.unit === 'cm' ? 'Centimeters' : 'Inches'}
                    </div>
                  </div>
                  {ver.is_current ? (
                    <span className="badge badge-amber" style={{ marginLeft: '0.5rem' }}>
                      CURRENT ACTIVE VERSION
                    </span>
                  ) : null}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => window.open(`/api/pdf/measurements/${customerId}?versionId=${ver.id}`, '_blank')}
                  >
                    <FileDown size={14} /> PDF Card
                  </button>
                  {!ver.is_current && (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleRestore(ver)}
                      disabled={restoringId === ver.id}
                      title="Promote this older version to current active"
                    >
                      <RotateCcw size={14} /> {restoringId === ver.id ? 'Restoring...' : 'Restore as Current'}
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of values */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {[
                  { label: 'Shoulder', val: ver.shoulder },
                  { label: 'Chest', val: ver.chest },
                  { label: 'Waist', val: ver.waist },
                  { label: 'Hip', val: ver.hip },
                  { label: 'Neck', val: ver.neck },
                  { label: 'Sleeve Length', val: ver.sleeve_length },
                  { label: 'Armhole', val: ver.armhole },
                  { label: 'Shirt Length', val: ver.shirt_length },
                  { label: 'Pant Length', val: ver.pant_length },
                  { label: 'Thigh', val: ver.thigh },
                  { label: 'Knee', val: ver.knee },
                  { label: 'Inseam', val: ver.inseam }
                ].map((item) => (
                  <div key={item.label} style={{ background: '#f8fafc', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{item.label}</span>
                    <strong style={{ fontSize: '0.875rem' }}>
                      {item.val != null ? `${item.val} ${ver.unit === 'cm' ? 'cm' : '"'}` : '—'}
                    </strong>
                  </div>
                ))}
              </div>

              {ver.other_measurements && (
                <div style={{ fontSize: '0.8125rem', color: '#78350f', backgroundColor: '#fffbeb', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
                  <strong>Other: </strong> {ver.other_measurements}
                </div>
              )}

              {ver.notes && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  <strong>Notes: </strong> {ver.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MeasurementHistory;
