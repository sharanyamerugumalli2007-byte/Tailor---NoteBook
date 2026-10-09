import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, Info } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [devNotice, setDevNotice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');
    setDevNotice('');

    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
      if (res.devNotice) setDevNotice(res.devNotice);
    } catch (err) {
      setError(err.message || 'Failed to submit reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="auth-card studio-card animate-fade">
          <Link to="/login" className="back-link mb-3">
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>

          <div className="auth-header text-center">
            <div className="auth-logo-badge">
              <KeyRound size={24} />
            </div>
            <h1 className="auth-title font-serif">Password Recovery</h1>
            <p className="auth-subtitle">Enter your registered email address to receive password reset support.</p>
          </div>

          {message && (
            <div className="alert alert-success animate-fade mb-3">
              <CheckCircle2 size={18} />
              <span>{message}</span>
            </div>
          )}

          {devNotice && (
            <div className="dev-notice-box animate-fade mb-3">
              <Info size={16} />
              <span>{devNotice}</span>
            </div>
          )}

          {error && (
            <div className="auth-alert alert-error animate-fade mb-3">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Registered Email Address</label>
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg btn-block mt-3"
            >
              <span>{loading ? 'Sending Request...' : 'Send Password Reset Link'}</span>
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .dev-notice-box {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          color: #1E40AF;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.825rem;
          line-height: 1.45;
        }
      `}</style>
    </div>
  );
}
