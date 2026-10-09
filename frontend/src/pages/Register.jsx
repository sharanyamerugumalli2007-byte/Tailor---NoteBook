import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors, User, Mail, Phone, Lock, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import { IMAGE_CONFIG } from '../utils/imageConfig';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    gender: 'Female',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password) {
      setError('Please fill in all required fields (Name, Email, Mobile Number, Password).');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Phone validation
    if (formData.phone.replace(/[^0-9]/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      // Redirect to customer dashboard upon registration
      navigate('/customer/dashboard');
    } else {
      setError(res.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-main)',
      padding: '2.5rem 1rem',
      backgroundImage: `linear-gradient(135deg, rgba(255, 240, 245, 0.92) 0%, rgba(255, 255, 255, 0.88) 100%), url(${IMAGE_CONFIG.loginBanner})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="card glass-panel" style={{
        maxWidth: '540px',
        width: '100%',
        padding: '2.5rem 2rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        border: '1.5px solid var(--pink-border)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'var(--rose-gradient)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-rose)'
            }}>
              <Scissors size={24} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <span className="heading-serif" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                Tailor<span className="text-rose">Craft</span>
              </span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-rose)', fontWeight: 600 }}>
                Customer Registration
              </span>
            </div>
          </Link>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Create your account to place custom bespoke orders and track stitching live.
          </p>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} style={{ marginBottom: '1.25rem' }} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                name="name"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="e.g. Anusha Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="+91 9811223344"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Re-type password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                name="address"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Apartment, Street, City, Pincode"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-pill"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem', fontSize: '0.9375rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Your Profile...' : (
              <>
                Create Customer Account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--rose-primary)', fontWeight: 700 }}>
            Sign In to Customer Hub
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
