import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { authService } from '../../../services/authService';
import { User, Lock, Phone, Mail, Store, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await authService.updateProfile({
        name,
        phone,
        password: password || undefined
      });
      if (res.success) {
        showToast('Profile information updated', 'success');
        setPassword('');
        refreshProfile();
      }
    } catch (err) {
      alert(err.userMessage || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="heading-serif" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
          Shop Profile & User Settings
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Manage your account credentials, shop identity, and receipt printing settings.
        </p>
      </div>

      {/* Shop Information Card */}
      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Store size={20} color="var(--accent)" />
          <h3 className="heading-serif" style={{ fontSize: '1.15rem' }}>
            Heritage Bespoke Tailors Studio
          </h3>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          <div><strong>Address:</strong> 42 Silk Thread Blvd, Bengaluru</div>
          <div><strong>Shop Phone:</strong> +91 98765 43210</div>
          <div><strong>Official UPI ID:</strong> heritagetailors@okaxis</div>
          <div><strong>Database Mode:</strong> MySQL 8.0 Active</div>
        </div>
      </div>

      {/* User Account Form */}
      <div className="card">
        <h3 className="heading-serif" style={{ fontSize: '1.15rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          Personal Account Information
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.4rem' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email (Username)</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.4rem', backgroundColor: '#f1f5f9' }}
                  value={user?.email || ''}
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  className="form-control"
                  style={{ paddingLeft: '2.4rem' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">New Password (leave blank to keep current)</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="Enter new password if changing"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
