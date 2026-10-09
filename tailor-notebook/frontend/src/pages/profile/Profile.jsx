import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { createBackup, downloadBackup, listBackups, updateProfile } from '../../services/authService';
import { errorMessage } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Field from '../../components/Field';
import { Async } from '../../components/Feedback';
import { useToast } from '../../components/Toast';
import { rules } from '../../utils/validation';
import { formatDateTime } from '../../utils/formatters';

function Backups() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const state = useFetch(listBackups);

  const create = async () => {
    setBusy(true);
    try { const r = await createBackup(); toast.success(r.message || 'Backup created'); state.reload(); }
    catch (err) { toast.error(errorMessage(err, 'Backup failed.')); } finally { setBusy(false); }
  };
  const download = async (name) => { try { await downloadBackup(name); } catch (err) { toast.error(errorMessage(err, 'Download failed.')); } };

  return (
    <section className="card">
      <div className="card-head">
        <div><h2>Database backup</h2><p className="muted">Backups are created on the server and can be downloaded by the shop owner only.</p></div>
        <button className="btn btn-primary" onClick={create} disabled={busy}>{busy ? 'Creating backup…' : 'Create backup'}</button>
      </div>
      <Async state={state} loadingText="Loading backups…" errorText="Unable to load backups." isEmpty={(d) => d.length === 0} emptyText="No backups yet.">
        {(d) => (
          <ul className="list">
            {d.map((b) => (
              <li key={b.name}>
                <div>{b.name}<div className="sub">{formatDateTime(b.created_at)} · {(b.size / 1024).toFixed(1)} KB</div></div>
                <button className="btn btn-sm" onClick={() => download(b.name)}>Download</button>
              </li>
            ))}
          </ul>
        )}
      </Async>
    </section>
  );
}

export default function Profile() {
  const { user, setUser, isAdmin } = useAuth();
  const toast = useToast();
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: user.name, email: user.email, currentPassword: '', newPassword: '' },
  });
  const newPassword = watch('newPassword');

  const onSubmit = async (v) => {
    setError('');
    const payload = { name: v.name, email: v.email };
    if (v.newPassword) { payload.currentPassword = v.currentPassword; payload.newPassword = v.newPassword; }
    try {
      const updated = await updateProfile(payload);
      setUser(updated);
      reset({ name: updated.name, email: updated.email, currentPassword: '', newPassword: '' });
      toast.success('Profile updated');
    } catch (err) { setError(errorMessage(err)); }
  };

  return (
    <>
      <PageHeader title="Profile" subtitle={isAdmin ? 'Shop owner account' : 'Staff account'} />
      <div className="stack">
        <form className="card" onSubmit={handleSubmit(onSubmit)} noValidate>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="form-grid">
            <Field label="Name" error={errors.name}><input {...register('name', { ...rules.required('Name'), minLength: { value: 2, message: 'Name must be at least 2 characters' } })} /></Field>
            <Field label="Email" error={errors.email}><input type="email" {...register('email', { ...rules.required('Email'), ...rules.email })} /></Field>
            <Field label="Current password" error={errors.currentPassword} hint="Only needed to change your password">
              <input type="password" autoComplete="current-password" {...register('currentPassword', { validate: (v) => !newPassword || !!v || 'Enter your current password' })} />
            </Field>
            <Field label="New password" error={errors.newPassword} hint="At least 8 characters">
              <input type="password" autoComplete="new-password" {...register('newPassword', { minLength: { value: 8, message: 'Use at least 8 characters' } })} />
            </Field>
          </div>
          <div className="form-actions"><button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save profile'}</button></div>
        </form>
        {isAdmin && <Backups />}
      </div>
    </>
  );
}
