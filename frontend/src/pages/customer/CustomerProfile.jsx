import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import CustomerSidebar from '../../components/CustomerSidebar';
import { updateProfile, changePassword } from '../../services/authService';
import api from '../../services/api';
import { User, Lock, MapPin, CheckCircle2, ShieldCheck, LogOut } from 'lucide-react';

export default function CustomerProfile() {
  const { user, updateUser, logout } = useContext(AuthContext);

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    gender: 'female',
    notes: ''
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    api.get('/customer/profile').then((res) => {
      const u = res.user || user;
      const c = res.customer || user?.profile;
      setProfileForm({
        name: u?.name || '',
        phone: u?.phone || '',
        address: c?.address || '',
        city: c?.city || '',
        state: c?.state || '',
        postal_code: c?.postal_code || '',
        gender: c?.gender || 'female',
        notes: c?.notes || ''
      });
    }).catch(() => {});
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const res = await updateProfile(profileForm);
      setProfileSuccess(res.message || 'Profile updated successfully!');
      updateUser({ name: profileForm.name, phone: profileForm.phone });
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long.');
      return;
    }

    setPwLoading(true);
    try {
      const res = await changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwSuccess(res.message || 'Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.message || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="portal-page">
      <div className="container portal-container">
        <CustomerSidebar />

        <main className="portal-content">
          <div className="portal-header-row">
            <div>
              <span className="section-tag">Patron Account Settings</span>
              <h1 className="portal-main-title font-serif">My Profile & Security</h1>
            </div>
          </div>

          <div className="grid-2">
            {/* Profile Update Card */}
            <div className="profile-card studio-card">
              <h3 className="card-section-title font-serif">
                <User size={18} /> Personal & Address Details
              </h3>

              {profileSuccess && (
                <div className="alert alert-success animate-fade mb-3">
                  <CheckCircle2 size={16} />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="alert alert-error animate-fade mb-3">
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email (Account ID)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="form-input"
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Default Delivery Street Address</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      value={profileForm.postal_code}
                      onChange={(e) => setProfileForm({ ...profileForm, postal_code: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn btn-primary mt-2"
                >
                  <span>{profileLoading ? 'Saving Changes...' : 'Save Profile Details'}</span>
                </button>
              </form>
            </div>

            {/* Security & Password Card */}
            <div className="security-card studio-card">
              <h3 className="card-section-title font-serif">
                <Lock size={18} /> Change Password
              </h3>

              {pwSuccess && (
                <div className="alert alert-success animate-fade mb-3">
                  <CheckCircle2 size={16} />
                  <span>{pwSuccess}</span>
                </div>
              )}

              {pwError && (
                <div className="alert alert-error animate-fade mb-3">
                  <span>{pwError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="pw-form">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password (Min 6 chars)</label>
                  <input
                    type="password"
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={pwLoading}
                  className="btn btn-secondary mt-2"
                >
                  <span>{pwLoading ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>

              <div className="session-logout-box mt-5">
                <h4 className="logout-box-title">Session Management</h4>
                <p className="logout-box-desc">Signing out will end your current session on this device.</p>
                <button onClick={logout} className="btn btn-outline btn-sm mt-2">
                  <LogOut size={16} />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .profile-card, .security-card {
          padding: 2.25rem;
          background: #ffffff;
        }
        .session-logout-box {
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }
        .logout-box-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .logout-box-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
