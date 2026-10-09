import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { formatDate } from '../../../utils/dateUtils';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import { useNotifications } from '../../../context/NotificationContext';
import { ShieldCheck, UserPlus, UserX, Edit3 } from 'lucide-react';

const TeamManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'order_manager',
    temporaryPassword: 'password123'
  });
  const [inviting, setInviting] = useState(false);

  // Edit Role State
  const [editingMember, setEditingMember] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [updatingRole, setUpdatingRole] = useState(false);

  const { showToast } = useNotifications();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getTeamMembers();
      if (res.success) setMembers(res.data || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      setInviting(true);
      const res = await adminService.inviteMember(inviteForm);
      if (res.success) {
        showToast(res.message || 'New team member invited!', 'success');
        setIsInviteModalOpen(false);
        fetchMembers();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to invite team member.');
    } finally {
      setInviting(false);
    }
  };

  const handleOpenEditRole = (member) => {
    setEditingMember(member);
    setNewRole(member.role);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    try {
      setUpdatingRole(true);
      const res = await adminService.updateRole(editingMember.id, newRole);
      if (res.success) {
        showToast('Member role updated successfully', 'success');
        setEditingMember(null);
        fetchMembers();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to update role.');
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove/deactivate admin access for ${name}?`)) return;
    try {
      await adminService.removeMember(id);
      showToast('Team member removed from active staff', 'info');
      fetchMembers();
    } catch (err) {
      alert(err.userMessage || 'Failed to remove member.');
    }
  };

  const roleLabels = {
    admin: 'Primary Shop Admin',
    order_manager: 'Order Production Manager',
    product_manager: 'Product & Stock Manager',
    payment_verifier: 'Payment & QR Verifier',
    staff: 'Shop Floor Craftsman'
  };

  const columns = [
    {
      header: 'Admin / Staff Name',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
        </div>
      )
    },
    {
      header: 'Assigned Role',
      accessor: (row) => (
        <span className={`badge ${row.role === 'admin' ? 'badge-amber' : 'badge-blue'}`} style={{ fontSize: '0.7rem' }}>
          {roleLabels[row.role] || row.role}
        </span>
      )
    },
    {
      header: 'Contact Phone',
      accessor: (row) => <span>{row.phone || 'N/A'}</span>
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`badge ${row.status === 'active' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.7rem' }}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Joined Date',
      accessor: (row) => <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(row.created_at)}</span>
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleOpenEditRole(row)}
            title="Change Role Permissions"
          >
            <Edit3 size={14} /> Role
          </button>
          {row.role !== 'admin' && row.status === 'active' && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--danger)' }}
              onClick={() => handleDeactivate(row.id, row.name)}
              title="Remove Access"
            >
              <UserX size={14} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
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
            Admin Team & Role Management
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Primary admin control center to invite workshop managers, assign delegation roles, and manage permissions.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus size={16} /> Invite New Admin / Staff
        </button>
      </div>

      {error && <ErrorMessage message={error} retry={fetchMembers} />}

      <DataTable
        columns={columns}
        data={members}
        loading={loading}
        emptyMessage="No team members found."
      />

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Workshop Member"
        maxWidth="500px"
      >
        <form onSubmit={handleInvite}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Rohit Verma"
              value={inviteForm.name}
              onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                placeholder="staff@tailor.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+91 98765 43210"
                value={inviteForm.phone}
                onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Role *</label>
            <select
              className="form-control form-select"
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
            >
              <option value="order_manager">Order Manager (Manage Orders, Stages, Stitching)</option>
              <option value="product_manager">Product Manager (Manage Garment Catalog & Stock)</option>
              <option value="payment_verifier">Payment Verifier (Verify UPI & QR Advances)</option>
              <option value="staff">Shop Staff (Record measurements, view orders)</option>
              <option value="admin">Admin (Full administrative privileges)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Temporary Password</label>
            <input
              type="text"
              className="form-control"
              value={inviteForm.temporaryPassword}
              onChange={(e) => setInviteForm({ ...inviteForm, temporaryPassword: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={inviting}>
              {inviting ? 'Inviting...' : 'Create Account & Assign Role'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        title={`Change Role for ${editingMember?.name}`}
        maxWidth="450px"
      >
        <form onSubmit={handleSaveRole}>
          <div className="form-group">
            <label className="form-label">Select New Role</label>
            <select
              className="form-control form-select"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="admin">Primary Admin</option>
              <option value="order_manager">Order Manager</option>
              <option value="product_manager">Product Manager</option>
              <option value="payment_verifier">Payment Verifier</option>
              <option value="staff">Shop Floor Staff</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setEditingMember(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updatingRole}>
              {updatingRole ? 'Updating...' : 'Save Role'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamManagement;
