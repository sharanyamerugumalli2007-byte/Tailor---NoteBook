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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async ({ email, password }) => {
    setError('');
    try {
      await login(email, password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not log in. Please try again.'));
    }
  };

  return (
    <div className="login-page">
      <section className="login-art">
        <div className="login-tape" aria-hidden="true" />
        <h1>Every fitting, in one book.</h1>
        <p>Measurements, orders and appointments for your shop — kept in order and never lost to a torn page.</p>
      </section>
      <section className="login-form-wrap">
        <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <h2>Log in to Tailor Notebook</h2>
          {error && <div className="form-error" role="alert">{error}</div>}
          <Field label="Email" error={errors.email}>
            <input type="email" autoComplete="username" autoFocus {...register('email', { required: 'Email is required' })} />
          </Field>
          <Field label="Password" error={errors.password}>
            <input type="password" autoComplete="current-password" {...register('password', { required: 'Password is required' })} />
          </Field>
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Logging in…' : 'Log in'}</button>
        </form>
      </section>
    </div>
  );
}
