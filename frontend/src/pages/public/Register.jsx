import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Scissors, User, Mail, Phone, Lock, MapPin, Eye, EyeOff, Sparkles, CheckSquare, Square } from 'lucide-react';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    gender: 'female',
    termsAccepted: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('Please accept the studio terms & privacy conditions.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        gender: formData.gender
      });

      navigate('/customer/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container register-container">
        <div className="auth-card studio-card animate-fade">
          <div className="auth-header text-center">
            <div className="auth-logo-badge">
              <Sparkles size={24} />
            </div>
            <h1 className="auth-title font-serif">Create Atelier Account</h1>
            <p className="auth-subtitle">Join Tailor Notebook to save your measurement vault and track custom stitching orders.</p>
          </div>

          {error && (
            <div className="auth-alert alert-error animate-fade mb-3">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div className="input-icon-wrap">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Priya Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input with-icon"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div className="input-icon-wrap">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 00000"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input with-icon"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div className="input-icon-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="priya@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input with-icon"
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Password (Min 6 characters) *</label>
                <div className="input-icon-wrap">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a secure password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input with-icon"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div className="input-icon-wrap">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input with-icon"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="form-group">
              <label className="form-label">Delivery Street Address</label>
              <div className="input-icon-wrap">
                <MapPin size={18} className="input-icon" />
                <input
                  type="text"
                  name="address"
                  placeholder="Flat / House No., Apartment, Street name"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-input with-icon"
                />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Bengaluru"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="e.g. Karnataka"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  name="postal_code"
                  placeholder="560001"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Terms */}
            <label className="terms-checkbox-label">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="terms-checkbox"
              />
              <span>
                I agree to the Tailor Notebook bespoke tailoring terms, fitting guarantee policies, and privacy guidelines.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg btn-block mt-3"
            >
              <Scissors size={18} />
              <span>{loading ? 'Creating Your Account...' : 'Complete Registration'}</span>
            </button>
          </form>

          <div className="auth-footer text-center">
            <p className="auth-switch-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign In Instead
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .register-container {
          max-width: 640px;
          width: 100%;
        }
        .terms-checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.825rem;
          color: var(--text-muted);
          line-height: 1.45;
          margin: 1rem 0;
          cursor: pointer;
        }
        .terms-checkbox {
          margin-top: 0.2rem;
          accent-color: var(--deep-rose);
        }
      `}</style>
    </div>
  );
}
