import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customerService } from '../../../services/customerService';
import SearchBar from '../../../components/SearchBar';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import ConfirmDialog from '../../../components/ConfirmDialog';
import ErrorMessage from '../../../components/ErrorMessage';
import { useNotifications } from '../../../context/NotificationContext';
import {
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  Ruler,
  Scissors,
  History,
  FileText
} from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');

  // Add/Edit Customer Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gender: 'Unspecified',
    notes: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await customerService.getCustomers({
        q: searchQuery,
        gender: genderFilter !== 'all' ? genderFilter : undefined
      });
      if (res.success && res.data) {
        setCustomers(res.data.customers || []);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, genderFilter]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      gender: 'Unspecified',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer, e) => {
    e?.stopPropagation();
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      gender: customer.gender || 'Unspecified',
      notes: customer.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Name and phone number are required.');
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, formData);
        showToast('Customer information updated successfully', 'success');
      } else {
        await customerService.createCustomer(formData);
        showToast('New customer added to notebook', 'success');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      alert(err.userMessage || 'Failed to save customer.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await customerService.deleteCustomer(deleteTarget.id);
      showToast('Customer record removed', 'success');
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      alert(err.userMessage || 'Failed to delete customer.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'Customer',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email || 'No email registered'}</div>
        </div>
      )
    },
    {
      header: 'Phone',
      accessor: (row) => <strong>{row.phone}</strong>
    },
    {
      header: 'Gender',
      accessor: (row) => (
        <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
          {row.gender || 'Unspecified'}
        </span>
      )
    },
    {
      header: 'Measurements',
      accessor: (row) => (
        row.current_measurement_version ? (
          <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
            Version {row.current_measurement_version}
          </span>
        ) : (
          <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
            No Measurement
          </span>
        )
      )
    },
    {
      header: 'Orders',
      accessor: (row) => (
        <span style={{ fontWeight: 600 }}>{row.total_orders || 0} order(s)</span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/admin/customers/${row.id}`); }}
            title="View Details"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/admin/customers/${row.id}/history`); }}
            title="View 360 Full History"
          >
            <History size={14} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={(e) => handleOpenEdit(row, e)}
            title="Edit Customer"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--danger)' }}
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
              setIsDeleteOpen(true);
            }}
            title="Delete Customer"
          >
            <Trash2 size={14} />
          </button>
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
            Customer Management
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Directory of shop clients, contact details, and their linked measurement files.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <UserPlus size={16} /> Add New Customer
        </button>
      </div>

      {error && <ErrorMessage message={error} retry={fetchCustomers} />}

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, phone, or email..."
          onClear={() => setSearchQuery('')}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Gender:</label>
          <select
            className="form-control form-select"
            style={{ width: '150px' }}
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="all">All Genders</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Customer DataTable */}
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        emptyMessage="No customers found. Click 'Add New Customer' to record someone into the notebook."
        onRowClick={(row) => navigate(`/admin/customers/${row.id}`)}
      />

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? `Edit Customer: ${editingCustomer.name}` : 'Add New Tailoring Customer'}
        maxWidth="550px"
      >
        <form onSubmit={handleSaveCustomer}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Anusha Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="customer@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Gender (for tailoring patterns)</label>
              <select
                className="form-control form-select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Unspecified">Unspecified</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Physical Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="Apartment, Street, Area"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tailor Notes & Fit Preferences</label>
            <textarea
              rows="3"
              className="form-control"
              placeholder="Special preferences, shoulder posture, preferred fabric style..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
              {formSubmitting ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Create Customer Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Safe Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeleteTarget(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer Record"
        message={`Are you sure you want to delete ${deleteTarget?.name}? Note: Customers with active orders cannot be deleted.`}
        confirmText="Delete Record"
        danger={true}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Customers;
