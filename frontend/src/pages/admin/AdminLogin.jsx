import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export default function AdminLogin() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@tailornotebook.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter administrator credentials.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password, 'admin');
      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/admin/dashboard');
      } else {
        setError('Access denied: Administrator privileges required.');
      }
    } catch (err) {
      setError(err.message || 'Invalid administrator email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page admin-auth-page">
      <div className="container" style={{ maxWidth: '460px' }}>
        <div className="auth-card studio-card animate-fade admin-card-border">
          <div className="auth-header text-center">
            <div className="admin-badge-icon">
              <ShieldCheck size={28} />
            </div>
            <span className="section-tag">Master Atelier Control</span>
            <h1 className="auth-title font-serif">Studio Admin Login</h1>
            <p className="auth-subtitle">Secure management portal for orders, measurements, verified payments, and shipments.</p>
          </div>

          {error && (
            <div className="auth-alert alert-error animate-fade mb-3">
              <span>{error}</span>
            </div>
          )}

          <div className="dev-credentials-box mb-3">
            <Sparkles size={14} className="text-rose" />
            <span>Default Admin: <strong>admin@tailornotebook.com</strong> / <strong>admin123</strong></span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Administrator Email</label>
              <div className="input-icon-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input with-icon"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Secret Key / Password</label>
              <div className="input-icon-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg btn-block mt-3"
            >
              <ShieldCheck size={18} />
              <span>{loading ? 'Verifying Admin Access...' : 'Access Studio Dashboard'}</span>
            </button>
          </form>

          <div className="auth-footer text-center">
            <Link to="/login" className="text-muted-link">
              ← Return to Customer Login Portal
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .admin-auth-page {
          background: radial-gradient(circle at 50% 30%, #F5DDE5 0%, #FFF8FA 70%);
        }
        .admin-card-border {
          border: 1.5px solid #E2C0CC;
        }
        .admin-badge-icon {
          width: 58px;
          height: 58px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--deep-rose) 0%, #7A2442 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem auto;
          box-shadow: 0 4px 14px rgba(168, 63, 98, 0.4);
        }
        .dev-credentials-box {
          background: var(--bg-main);
          border: 1px dashed var(--rose-accent);
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.775rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
}
