import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getCustomer } from '../../services/customerService';
import { createMeasurement, getMeasurement, listMeasurements, updateMeasurement } from '../../services/measurementService';
import { errorMessage } from '../../services/api';
import { MEASUREMENT_FIELDS, rules } from '../../utils/validation';
import PageHeader from '../../components/PageHeader';
import Field from '../../components/Field';
import { Loading, ErrorMessage } from '../../components/Feedback';
import { useToast } from '../../components/Toast';

export default function MeasurementForm() {
  const { customerId } = useParams();
  const [params] = useSearchParams();
  const fromId = params.get('from'); // edit an older version -> saved as a new version
  const navigate = useNavigate();
  const toast = useToast();
  const [ctx, setCtx] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues: { unit: 'in' } });
  const unit = watch('unit');

  useEffect(() => {
    (async () => {
      try {
        const [customer, versions] = await Promise.all([getCustomer(customerId), listMeasurements(customerId)]);
        const base = fromId ? await getMeasurement(fromId) : versions.find((m) => m.is_current);
        if (base && base.customer_id !== Number(customerId)) throw new Error('mismatch');
        const values = { unit: base?.unit || 'in', other_measurements: base?.other_measurements ?? '', notes: '' };
        MEASUREMENT_FIELDS.forEach(([k]) => { values[k] = base?.[k] ?? ''; });
        reset(values);
        setCtx({ customer, nextVersion: (versions[0]?.version || 0) + 1, base });
      } catch (err) { setLoadError(err.response ? errorMessage(err) : 'Unable to load this customer.'); }
    })();
  }, [customerId, fromId, reset]);

  const onSubmit = async (values) => {
    setError('');
    try {
      const saved = fromId ? await updateMeasurement(fromId, values) : await createMeasurement(customerId, values);
      toast.success(`Saved as version ${saved.version}`);
      navigate(`/customers/${customerId}`);
    } catch (err) { setError(errorMessage(err)); }
  };

  if (loadError) return <ErrorMessage message={loadError} />;
  if (!ctx) return <Loading text="Loading measurements…" />;

  return (
    <>
      <PageHeader title={`Measurements — ${ctx.customer.name}`} subtitle={`This will be saved as version ${ctx.nextVersion}. Earlier versions are kept.`} />
      <form className="card" onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && <div className="form-error" role="alert">{error}</div>}
        {ctx.base && <p className="muted">Values are pre-filled from version {ctx.base.version}. Change what has changed.</p>}

        <div style={{ margin: '12px 0 18px' }}>
          <div className="field-label" style={{ marginBottom: 6 }}>Measurement unit</div>
          <div className="unit-toggle" role="radiogroup" aria-label="Measurement unit">
            <label><input type="radio" value="in" {...register('unit')} /><span>Inches</span></label>
            <label><input type="radio" value="cm" {...register('unit')} /><span>Centimetres</span></label>
          </div>
        </div>

        <div className="measure-form">
          {MEASUREMENT_FIELDS.map(([k, text]) => (
            <Field key={k} label={text} error={errors[k]}>
              <span className="input-unit" data-unit={unit}>
                <input type="number" step="0.01" inputMode="decimal" {...register(k, rules.positiveOptional)} />
              </span>
            </Field>
          ))}
        </div>

        <div className="form-grid" style={{ marginTop: 16 }}>
          <Field label="Other measurements" className="full" hint="Anything not listed above, e.g. “Back neck depth 7”"><textarea rows={2} {...register('other_measurements')} /></Field>
          <Field label="Notes for this version" className="full"><textarea rows={2} {...register('notes')} /></Field>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : `Save as version ${ctx.nextVersion}`}</button>
          <Link className="btn" to={`/customers/${customerId}`}>Cancel</Link>
        </div>
      </form>
    </>
  );
}
