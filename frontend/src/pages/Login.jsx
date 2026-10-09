import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { errorMessage } from '../services/api';
import Field from '../components/Field';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (user) return <Navigate to="/" replace />;

  const fillCredentials = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
    setError('');
  };

  const onSubmit = async ({ email, password }) => {
    setError('');
    try {
      await login(email, password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not log in. Please check your credentials and make sure the server is running.'));
    }
  };

  return (
    <div className="login-page">
      <section className="login-art">
        <div className="login-tape" aria-hidden="true" />
        <h1>Every fitting, in one book.</h1>
        <p>Measurements, custom orders, and fittings for your boutique atelier — beautifully organized with flawless precision.</p>
      </section>
      <section className="login-form-wrap">
        <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <h2>Log in to Tailor Notebook</h2>
            <p className="muted" style={{ fontSize: '0.85rem', margin: '4px 0 0' }}>Enter your credentials to manage your boutique</p>
          </div>

          {error && <div className="form-error" role="alert">{error}</div>}

          <Field label="Email address" error={errors.email}>
            <input
              type="email"
              autoComplete="username"
              placeholder="admin@tailor.local"
              autoFocus
              {...register('email', { required: 'Email is required' })}
            />
          </Field>

          <Field label="Password" error={errors.password}>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
          </Field>

          <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={{ width: '100%', marginTop: '4px' }}>
            {isSubmitting ? 'Logging in…' : 'Log in to Notebook'}
          </button>

          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'var(--pink-50)',
            border: '1px dashed var(--line)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
          }}>
            <div style={{ fontWeight: 600, color: 'var(--pink-700)', marginBottom: '6px' }}>Quick Sign-in Accounts:</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => fillCredentials('admin@tailor.local', 'Admin@123')}
                style={{ fontSize: '0.78rem', padding: '4px 8px' }}
              >
                👑 Owner (Admin)
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => fillCredentials('staff@tailor.local', 'Staff@123')}
                style={{ fontSize: '0.78rem', padding: '4px 8px' }}
              >
                ✂️ Staff
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
