import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createCustomer, getCustomer, updateCustomer } from '../../services/customerService';
import { errorMessage } from '../../services/api';
import { rules } from '../../utils/validation';
import PageHeader from '../../components/PageHeader';
import Field from '../../components/Field';
import { Loading, ErrorMessage } from '../../components/Feedback';
import { useToast } from '../../components/Toast';

const EMPTY = { name: '', phone: '', email: '', address: '', gender: '', notes: '' };

export default function CustomerForm() {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: EMPTY });

  useEffect(() => {
    if (!editing) return;
    getCustomer(id)
      .then((c) => reset({ ...EMPTY, ...Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v ?? ''])) }))
      .catch((err) => setLoadError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, editing, reset]);

  const onSubmit = async (values) => {
    setError('');
    try {
      const saved = editing ? await updateCustomer(id, values) : await createCustomer(values);
      toast.success(editing ? 'Customer updated' : 'Customer added');
      navigate(`/customers/${saved.id}`);
    } catch (err) { setError(errorMessage(err)); }
  };

  if (loading) return <Loading text="Loading customer…" />;
  if (loadError) return <ErrorMessage message={loadError} />;

  return (
    <>
      <PageHeader title={editing ? 'Edit customer' : 'Add customer'} />
      <form className="card" onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-grid">
          <Field label="Full name" error={errors.name}>
            <input {...register('name', { ...rules.required('Name'), minLength: { value: 2, message: 'Name must be at least 2 characters' } })} />
          </Field>
          <Field label="Phone number" error={errors.phone}><input type="tel" {...register('phone', rules.phone)} /></Field>
          <Field label="Email (optional)" error={errors.email}><input type="email" {...register('email', rules.email)} /></Field>
          <Field label="Gender (optional)">
            <select {...register('gender')}>
              <option value="">Not specified</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option>
            </select>
          </Field>
          <Field label="Address (optional)" className="full"><textarea rows={2} {...register('address')} /></Field>
          <Field label="Notes (optional)" className="full" hint="Preferences, fit habits, anything worth remembering"><textarea rows={3} {...register('notes')} /></Field>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Add customer'}</button>
          <Link className="btn" to={editing ? `/customers/${id}` : '/customers'}>Cancel</Link>
        </div>
      </form>
    </>
  );
}
