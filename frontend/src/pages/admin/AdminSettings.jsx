import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { LoadingSpinner } from '../../components/CommonComponents';
import { getSettings, updateSettings } from '../../services/adminService';
import { Settings, CheckCircle2, ShieldCheck, CreditCard, Truck, Phone, Mail, MapPin } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    shop_name: 'Tailor Notebook',
    upi_id: 'tailornotebook@okaxis',
    upi_payee_name: 'Tailor Notebook Studio',
    advance_percentage: '30',
    default_delivery_fee: '50',
    contact_phone: '+91 98765 43210',
    contact_email: 'support@tailornotebook.com',
    studio_address: 'Shop 12, Blossom Lane, Fashion District, Bengaluru 560001'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getSettings()
      .then((data) => {
        if (data) setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateSettings(settings);
      setSuccessMsg('Studio settings saved successfully to MySQL database!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="portal-page admin-portal-page">
      <div className="container portal-container">
        <AdminSidebar />

        <main className="portal-content">
          <div className="portal-header-row">
            <div>
              <span className="section-tag">Atelier Configuration</span>
              <h1 className="portal-main-title font-serif">Studio & Payment Settings</h1>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Retrieving studio configurations..." size="large" />
          ) : (
            <form onSubmit={handleSubmit} className="settings-form-layout">
              {successMsg && (
                <div className="alert alert-success animate-fade mb-3">
                  <CheckCircle2 size={18} />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="alert alert-error animate-fade mb-3">
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* UPI & Payments Section */}
              <div className="settings-card studio-card mb-4">
                <h3 className="card-section-title font-serif">
                  <CreditCard size={18} /> UPI Advance & Fee Settings
                </h3>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Studio UPI ID (VPA)</label>
                    <input
                      type="text"
                      name="upi_id"
                      value={settings.upi_id}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">UPI Payee Display Name</label>
                    <input
                      type="text"
                      name="upi_payee_name"
                      value={settings.upi_payee_name}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Required Advance Percentage (%)</label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      name="advance_percentage"
                      value={settings.advance_percentage}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Default Doorstep Delivery Logistics Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      name="default_delivery_fee"
                      value={settings.default_delivery_fee}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Studio Contact & Branding */}
              <div className="settings-card studio-card mb-4">
                <h3 className="card-section-title font-serif">
                  <Settings size={18} /> Studio Profile & Public Contact
                </h3>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Studio Name</label>
                    <input
                      type="text"
                      name="shop_name"
                      value={settings.shop_name}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Support Phone Number</label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={settings.contact_phone}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Support Email Address</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={settings.contact_email}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Atelier Address</label>
                  <textarea
                    rows="2"
                    name="studio_address"
                    value={settings.studio_address}
                    onChange={handleChange}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="settings-action-bar">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary btn-lg"
                >
                  <CheckCircle2 size={18} />
                  <span>{saving ? 'Saving Settings...' : 'Save All Settings'}</span>
                </button>
              </div>
            </form>
          )}
        </main>
      </div>

      <style>{`
        .settings-card {
          padding: 2.25rem;
          background: #ffffff;
        }
        .settings-action-bar {
          display: flex;
          justify-content: flex-end;
          padding-top: 1rem;
        }
      `}</style>
    </div>
  );
}
