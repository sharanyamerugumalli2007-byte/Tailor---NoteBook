import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { LoadingSpinner, EmptyState, ConfirmationModal } from '../../components/CommonComponents';
import {
  getServices,
  createService,
  updateService,
  deleteService
} from '../../services/serviceService';
import { Scissors, PlusCircle, Edit2, Trash2, CheckCircle2, X, Clock, Sparkles } from 'lucide-react';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'stitching',
    short_description: '',
    description: '',
    base_price: 600,
    estimated_days: 5,
    image_url: '',
    is_active: 1
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = () => {
    setLoading(true);
    getServices({ includeInactive: 'true' })
      .then((data) => setServices(data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'stitching',
      short_description: '',
      description: '',
      base_price: 650,
      estimated_days: 4,
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      is_active: 1
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingId(s.id);
    setFormData({
      name: s.name,
      category: s.category || 'stitching',
      short_description: s.short_description || '',
      description: s.description || '',
      base_price: s.base_price,
      estimated_days: s.estimated_days || 5,
      image_url: s.image_url || '',
      is_active: s.is_active !== undefined ? s.is_active : 1
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.base_price) {
      setErrorMsg('Please specify service name and base price.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      if (editingId) {
        await updateService(editingId, formData);
      } else {
        await createService(formData);
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteService(deleteId);
      setDeleteId(null);
      fetchServices();
    } catch (err) {
      alert(err.message || 'Failed to deactivate service.');
    }
  };

  return (
    <div className="portal-page admin-portal-page">
      <div className="container portal-container">
        <AdminSidebar />

        <main className="portal-content">
          <div className="portal-header-row">
            <div>
              <span className="section-tag">Atelier Offerings Catalog</span>
              <h1 className="portal-main-title font-serif">Tailoring Services Management</h1>
            </div>
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
              <PlusCircle size={16} />
              <span>Add New Service</span>
            </button>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading tailoring service catalog..." size="large" />
          ) : (
            <div className="grid-3 services-admin-grid">
              {services.map((s) => (
                <div key={s.id} className="service-item-card studio-card">
                  <div className="service-img-container" style={{ height: '180px' }}>
                    <img
                      src={s.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
                      alt={s.name}
                      className="service-card-img"
                    />
                    <div className="turnaround-tag">
                      <Clock size={12} /> {s.estimated_days} Days
                    </div>
                  </div>

                  <div className="service-card-body">
                    <span className="category-label">{s.category}</span>
                    <h3 className="service-title font-serif">{s.name}</h3>
                    <p className="service-text">{s.short_description}</p>

                    <div className="service-card-bottom">
                      <div className="price-tag-wrap">
                        <span className="starting-text">Stitching Fee</span>
                        <span className="service-price-amount">₹{Number(s.base_price).toFixed(2)}</span>
                      </div>

                      <div className="actions-cluster">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="btn btn-outline btn-sm"
                          title="Edit Service"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="btn btn-outline btn-sm text-danger"
                          title="Deactivate Service"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
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
                    {editingId ? 'Edit Tailoring Service' : 'Add New Tailoring Service'}
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

                <form onSubmit={handleSave} className="service-form">
                  <div className="grid-2 mb-3">
                    <div className="form-group">
                      <label className="form-label">Service Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Designer Saree Blouse Stitching"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="form-select"
                      >
                        <option value="blouse">Custom Blouse</option>
                        <option value="dress">Dress & Gown</option>
                        <option value="kurti">Kurti & Tunic</option>
                        <option value="alteration">Alterations & Repairs</option>
                        <option value="bottomwear">Trousers & Pants</option>
                        <option value="skirt">Lehenga & Skirts</option>
                        <option value="suit">Suits & Salwars</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-2 mb-3">
                    <div className="form-group">
                      <label className="form-label">Base Stitching Fee (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.base_price}
                        onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Turnaround Days</label>
                      <input
                        type="number"
                        value={formData.estimated_days}
                        onChange={(e) => setFormData({ ...formData, estimated_days: parseInt(e.target.value) || 1 })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">Image URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">Short Description (Cards)</label>
                    <input
                      type="text"
                      placeholder="Brief 1-line overview of the service..."
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">Full Details & Customization Overview</label>
                    <textarea
                      rows="3"
                      placeholder="Comprehensive details on necklines, padding, seam allowances..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="form-textarea"
                    />
                  </div>

                  <div className="modal-footer-actions">
                    <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving} className="btn btn-primary">
                      {saving ? 'Saving...' : 'Save Service'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={!!deleteId}
            title="Deactivate Tailoring Service?"
            message="This service will be marked inactive and hidden from the public client catalog."
            confirmText="Deactivate"
            cancelText="Cancel"
            isDanger={true}
            onConfirm={handleDelete}
            onCancel={() => setDeleteId(null)}
          />
        </main>
      </div>
    </div>
  );
}
