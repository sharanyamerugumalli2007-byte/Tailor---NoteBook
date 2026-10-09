import React, { useEffect, useState } from 'react';
import CustomerSidebar from '../../components/CustomerSidebar';
import { LoadingSpinner, EmptyState, ConfirmationModal } from '../../components/CommonComponents';
import {
  getMeasurements,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement
} from '../../services/measurementService';
import {
  Ruler,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Sparkles,
  Info
} from 'lucide-react';

export default function Measurements() {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    garment_type: 'blouse',
    unit: 'in',
    bust: '',
    waist: '',
    hip: '',
    shoulder: '',
    sleeve_length: '',
    armhole: '',
    shirt_length: '',
    pant_length: '',
    neck: '',
    inseam: '',
    outseam: '',
    other_measurements: '',
    notes: ''
  });

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = () => {
    setLoading(true);
    getMeasurements()
      .then((data) => setMeasurements(data))
      .catch(() => setMeasurements([]))
      .finally(() => setLoading(false));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: 'Blouse Custom Fit',
      garment_type: 'blouse',
      unit: 'in',
      bust: '36.0',
      waist: '30.0',
      hip: '38.0',
      shoulder: '14.5',
      sleeve_length: '10.5',
      armhole: '16.0',
      shirt_length: '14.0',
      pant_length: '',
      neck: '7.0',
      inseam: '',
      outseam: '',
      other_measurements: '',
      notes: ''
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      garment_type: item.garment_type || 'general',
      unit: item.unit || 'in',
      bust: item.bust || '',
      waist: item.waist || '',
      hip: item.hip || '',
      shoulder: item.shoulder || '',
      sleeve_length: item.sleeve_length || '',
      armhole: item.armhole || '',
      shirt_length: item.shirt_length || '',
      pant_length: item.pant_length || '',
      neck: item.neck || '',
      inseam: item.inseam || '',
      outseam: item.outseam || '',
      other_measurements: item.other_measurements || '',
      notes: item.notes || ''
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      setErrorMsg('Please specify a profile title (e.g. My Saree Blouse).');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      if (editingId) {
        await updateMeasurement(editingId, formData);
      } else {
        await createMeasurement(formData);
      }
      setModalOpen(false);
      fetchList();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save measurement profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMeasurement(deleteId);
      setDeleteId(null);
      fetchList();
    } catch (err) {
      alert(err.message || 'Failed to delete measurement profile.');
    }
  };

  return (
    <div className="portal-page">
      <div className="container portal-container">
        <CustomerSidebar />

        <main className="portal-content">
          <div className="portal-header-row">
            <div>
              <span className="section-tag">Bespoke Vault</span>
              <h1 className="portal-main-title font-serif">My Saved Measurements</h1>
            </div>
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
              <PlusCircle size={16} />
              <span>Create New Profile</span>
            </button>
          </div>

          {loading ? (
            <LoadingSpinner text="Accessing your measurements vault..." size="large" />
          ) : measurements.length === 0 ? (
            <EmptyState
              icon={Ruler}
              title="No measurement profiles saved"
              description="Save your exact body measurements once to quickly attach them to any future tailoring order."
              actionText="Create Your First Profile"
              onAction={handleOpenAdd}
            />
          ) : (
            <div className="grid-2 measurements-card-grid">
              {measurements.map((m) => (
                <div key={m.id} className="measurement-profile-card studio-card">
                  <div className="meas-card-top">
                    <div>
                      <span className="meas-type-tag">{m.garment_type}</span>
                      <h3 className="meas-profile-name">{m.title}</h3>
                    </div>
                    <div className="meas-top-actions">
                      <span className="meas-unit-badge">{m.unit}</span>
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="icon-action-btn"
                        title="Edit profile"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteId(m.id)}
                        className="icon-action-btn text-danger"
                        title="Delete profile"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="meas-values-grid">
                    {m.bust && <div className="meas-val-cell"><span className="k">Bust</span><span className="v">{m.bust} {m.unit}</span></div>}
                    {m.waist && <div className="meas-val-cell"><span className="k">Waist</span><span className="v">{m.waist} {m.unit}</span></div>}
                    {m.hip && <div className="meas-val-cell"><span className="k">Hip</span><span className="v">{m.hip} {m.unit}</span></div>}
                    {m.shoulder && <div className="meas-val-cell"><span className="k">Shoulder</span><span className="v">{m.shoulder} {m.unit}</span></div>}
                    {m.sleeve_length && <div className="meas-val-cell"><span className="k">Sleeve</span><span className="v">{m.sleeve_length} {m.unit}</span></div>}
                    {m.armhole && <div className="meas-val-cell"><span className="k">Armhole</span><span className="v">{m.armhole} {m.unit}</span></div>}
                    {m.shirt_length && <div className="meas-val-cell"><span className="k">Length</span><span className="v">{m.shirt_length} {m.unit}</span></div>}
                    {m.neck && <div className="meas-val-cell"><span className="k">Front Neck</span><span className="v">{m.neck} {m.unit}</span></div>}
                    {m.inseam && <div className="meas-val-cell"><span className="k">Inseam</span><span className="v">{m.inseam} {m.unit}</span></div>}
                    {m.outseam && <div className="meas-val-cell"><span className="k">Outseam</span><span className="v">{m.outseam} {m.unit}</span></div>}
                  </div>

                  {m.notes && <p className="meas-notes-line">Note: {m.notes}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Add / Edit Modal */}
          {modalOpen && (
            <div className="modal-overlay animate-fade">
              <div className="modal-dialog-large studio-card">
                <div className="modal-header-row">
                  <h3 className="modal-title font-serif">
                    {editingId ? 'Edit Measurement Profile' : 'New Measurement Profile'}
                  </h3>
                  <button onClick={() => setModalOpen(false)} className="close-btn">
                    <X size={20} />
                  </button>
                </div>

                {errorMsg && (
                  <div className="alert alert-error animate-fade mb-3">
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSave} className="meas-form">
                  <div className="grid-3 mb-3">
                    <div className="form-group">
                      <label className="form-label">Profile Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Blouse Standard Fit"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Garment Category</label>
                      <select
                        value={formData.garment_type}
                        onChange={(e) => setFormData({ ...formData, garment_type: e.target.value })}
                        className="form-select"
                      >
                        <option value="blouse">Custom Blouse</option>
                        <option value="kurti">Kurti & Tunic</option>
                        <option value="dress">Dress & Gown</option>
                        <option value="bottomwear">Trousers & Pants</option>
                        <option value="skirt">Lehenga & Skirt</option>
                        <option value="suit">Suit & Salwar</option>
                        <option value="general">General Fit</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Measurement Unit</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="form-select"
                      >
                        <option value="in">Inches (in)</option>
                        <option value="cm">Centimeters (cm)</option>
                      </select>
                    </div>
                  </div>

                  {/* Body Measurements Grid */}
                  <div className="grid-4 mb-3">
                    <div className="form-group">
                      <label className="form-label">Bust / Chest ({formData.unit})</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.bust}
                        onChange={(e) => setFormData({ ...formData, bust: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Waist ({formData.unit})</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.waist}
                        onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Hip ({formData.unit})</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.hip}
                        onChange={(e) => setFormData({ ...formData, hip: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Shoulder ({formData.unit})</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.shoulder}
                        onChange={(e) => setFormData({ ...formData, shoulder: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="grid-4 mb-3">
                    <div className="form-group">
                      <label className="form-label">Sleeve Length ({formData.unit})</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.sleeve_length}
                        onChange={(e) => setFormData({ ...formData, sleeve_length: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Armhole ({formData.unit})</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.armhole}
                        onChange={(e) => setFormData({ ...formData, armhole: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Garment Length ({formData.unit})</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.shirt_length}
                        onChange={(e) => setFormData({ ...formData, shirt_length: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Front Neck Depth ({formData.unit})</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.neck}
                        onChange={(e) => setFormData({ ...formData, neck: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="grid-3 mb-3">
                    <div className="form-group">
                      <label className="form-label">Pant / Bottom Length ({formData.unit})</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.pant_length}
                        onChange={(e) => setFormData({ ...formData, pant_length: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Inseam ({formData.unit})</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.inseam}
                        onChange={(e) => setFormData({ ...formData, inseam: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Outseam ({formData.unit})</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.outseam}
                        onChange={(e) => setFormData({ ...formData, outseam: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fitting Notes / Preferences</label>
                    <input
                      type="text"
                      placeholder="e.g. Princess cut preferred, deep back 8 inches, padded cups"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="modal-footer-actions mt-4">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn btn-primary"
                    >
                      {saving ? 'Saving Profile...' : 'Save Measurement Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          <ConfirmationModal
            isOpen={!!deleteId}
            title="Delete Measurement Profile?"
            message="Are you sure you want to remove this measurement profile from your vault? Previously submitted orders will retain their snapshots."
            confirmText="Delete Profile"
            cancelText="Keep Profile"
            isDanger={true}
            onConfirm={handleDelete}
            onCancel={() => setDeleteId(null)}
          />
        </main>
      </div>

      <style>{`
        .measurement-profile-card {
          padding: 1.75rem;
          background: #ffffff;
        }
        .meas-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.25rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--border-color);
        }
        .meas-type-tag {
          font-size: 0.725rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--rose-accent);
          letter-spacing: 0.05em;
        }
        .meas-profile-name {
          font-size: 1.2rem;
          font-weight: 700;
        }
        .meas-top-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .icon-action-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.35rem;
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }
        .icon-action-btn:hover {
          color: var(--deep-rose);
          background: var(--soft-blush);
        }
        .icon-action-btn.text-danger:hover {
          color: var(--error);
          background: var(--error-bg);
        }
        .meas-values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.65rem;
          margin-bottom: 1rem;
        }
        .meas-val-cell {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          display: flex;
          justify-content: space-between;
          font-size: 0.825rem;
        }
        .meas-val-cell .k { color: var(--text-muted); }
        .meas-val-cell .v { font-weight: 700; color: var(--deep-rose); }
        .meas-notes-line {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-style: italic;
        }
        .modal-dialog-large {
          max-width: 720px;
          width: 100%;
          background: #ffffff;
          padding: 2.5rem;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .modal-footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  );
}
