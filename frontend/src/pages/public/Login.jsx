import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Scissors, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/customer/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password, 'customer');
      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/admin/dashboard');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid login credentials. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <div className="auth-card studio-card animate-fade">
          <div className="auth-header text-center">
            <div className="auth-logo-badge">
              <Scissors size={24} />
            </div>
            <h1 className="auth-title font-serif">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to track orders, save measurements, and submit custom stitching requests.</p>
          </div>

          {error && (
            <div className="auth-alert alert-error animate-fade">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email or Client ID *</label>
              <div className="input-icon-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="priya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input with-icon"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">
                <span>Password *</span>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>
              <div className="input-icon-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
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
              <span>{loading ? 'Authenticating...' : 'Sign In to My Studio'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer text-center">
            <p className="auth-switch-text">
              New to Tailor Notebook?{' '}
              <Link to="/register" className="auth-link">
                Create an Account
              </Link>
            </p>
            <div className="admin-switch-link mt-3">
              <Link to="/admin/login" className="text-muted-link">
                <ShieldCheck size={14} />
                <span>Atelier Staff & Master Tailor Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: calc(100vh - 120px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 1.5rem;
          background: radial-gradient(circle at 50% 30%, #FCE4EC 0%, #FFF8FA 70%);
        }
        .auth-container {
          max-width: 480px;
          width: 100%;
        }
        .auth-card {
          background: #ffffff;
          padding: 3rem 2.5rem;
          box-shadow: var(--shadow-md);
        }
        .auth-logo-badge {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--rose-accent) 0%, var(--deep-rose) 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem auto;
          box-shadow: 0 4px 12px rgba(217, 108, 138, 0.35);
        }
        .auth-title {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .auth-subtitle {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
          line-height: 1.5;
        }
        .input-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-light);
          pointer-events: none;
        }
        .form-input.with-icon {
          padding-left: 2.75rem;
          padding-right: 2.75rem;
        }
        .password-toggle-btn {
          position: absolute;
          right: 0.85rem;
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0.25rem;
        }
        .password-toggle-btn:hover {
          color: var(--deep-rose);
        }
        .forgot-link {
          font-size: 0.775rem;
          color: var(--rose-accent);
          font-weight: 600;
        }
        .auth-alert {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
        }
        .auth-footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }
        .auth-switch-text {
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .auth-link {
          color: var(--deep-rose);
          font-weight: 700;
        }
        .text-muted-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--text-light);
        }
        .text-muted-link:hover {
          color: var(--deep-rose);
        }
      `}</style>
    </div>
  );
}
