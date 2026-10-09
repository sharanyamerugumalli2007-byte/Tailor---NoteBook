import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { createOrder, getOrder, updateOrder } from '../../services/orderService';
import { listMeasurements } from '../../services/measurementService';
import { errorMessage } from '../../services/api';
import { ITEM_TYPES } from '../../utils/validation';
import { todayISO } from '../../utils/dateUtils';
import { formatMoney } from '../../utils/formatters';
import PageHeader from '../../components/PageHeader';
import Field from '../../components/Field';
import CustomerPicker from '../../components/CustomerPicker';
import { Loading, ErrorMessage } from '../../components/Feedback';
import { useToast } from '../../components/Toast';

const blankItem = { item_type: 'Shirt', description: '', quantity: 1, price: '', special_instructions: '' };

export default function OrderForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const editing = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [versions, setVersions] = useState([]);

  const { register, control, handleSubmit, reset, watch, getValues, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      customer_id: params.get('customerId') || '', measurement_id: '', order_date: todayISO(), expected_delivery_date: '',
      advance_amount: 0, notes: '', items: [blankItem],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const customerId = watch('customer_id');
  const items = watch('items');
  const advance = Number(watch('advance_amount')) || 0;
  const total = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0);

  // Load the order when editing
  useEffect(() => {
    if (!editing) return;
    getOrder(id).then((o) => reset({
      customer_id: o.customer_id, measurement_id: o.measurement_id || '', order_date: o.order_date,
      expected_delivery_date: o.expected_delivery_date || '', advance_amount: o.advance_amount, notes: o.notes || '',
      items: o.items.map((i) => ({ item_type: i.item_type, description: i.description || '', quantity: i.quantity, price: i.price, special_instructions: i.special_instructions || '' })),
    })).catch((err) => setLoadError(errorMessage(err))).finally(() => setLoading(false));
  }, [id, editing, reset]);

  // Load the customer's measurement versions and default to the current one
  useEffect(() => {
    if (!customerId) { setVersions([]); return; }
    listMeasurements(customerId).then((v) => {
      setVersions(v);
      if (!getValues('measurement_id')) {
        const cur = v.find((m) => m.is_current);
        if (cur) setValue('measurement_id', cur.id);
      }
    }).catch(() => setVersions([]));
  }, [customerId, getValues, setValue]);

  const onSubmit = async (values) => {
    setError('');
    const payload = { ...values, customer_id: Number(values.customer_id), measurement_id: values.measurement_id ? Number(values.measurement_id) : undefined };
    try {
      const saved = editing ? await updateOrder(id, payload) : await createOrder(payload);
      toast.success(editing ? 'Order updated' : `Order #${saved.id} created`);
      navigate(`/orders/${saved.id}`);
    } catch (err) { setError(errorMessage(err)); }
  };

  if (loading) return <Loading text="Loading order…" />;
  if (loadError) return <ErrorMessage message={loadError} />;

  return (
    <>
      <PageHeader title={editing ? `Edit order #${id}` : 'New order'} />
      <form className="card" onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-grid">
          <Field label="Customer" error={errors.customer_id} className="full">
            <Controller name="customer_id" control={control} rules={{ required: 'Choose a customer' }}
              render={({ field }) => <CustomerPicker value={field.value} disabled={editing} invalid={!!errors.customer_id} onChange={(c) => field.onChange(c ? c.id : '')} />} />
          </Field>
          <Field label="Measurement version used" hint={customerId && versions.length === 0 ? 'No measurements recorded for this customer yet' : undefined}>
            <select {...register('measurement_id')} disabled={!versions.length}>
              <option value="">None</option>
              {versions.map((m) => <option key={m.id} value={m.id}>Version {m.version}{m.is_current ? ' (current)' : ''}</option>)}
            </select>
          </Field>
          <span />
          <Field label="Order date" error={errors.order_date}>
            <input type="date" {...register('order_date', { required: 'Order date is required' })} />
          </Field>
          <Field label="Expected delivery date" error={errors.expected_delivery_date}>
            <input type="date" {...register('expected_delivery_date', {
              validate: (v) => !v || v >= getValues('order_date') || 'Delivery date cannot be before the order date',
            })} />
          </Field>
        </div>

        <h2 style={{ margin: '24px 0 4px' }}>Items</h2>
        <div className="item-head"><span>Item</span><span>Description</span><span>Qty</span><span>Price (₹)</span><span /></div>
        {fields.map((f, idx) => {
          const e = errors.items?.[idx] || {};
          return (
            <div className="item-row" key={f.id}>
              <Field label="Item" error={e.item_type}>
                <select {...register(`items.${idx}.item_type`, { required: 'Choose an item' })}>
                  {ITEM_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Description" className="span-2"><input {...register(`items.${idx}.description`)} placeholder="Fabric, style…" /></Field>
              <Field label="Qty" error={e.quantity}>
                <input type="number" min="1" step="1" {...register(`items.${idx}.quantity`, { required: 'Required', validate: (v) => (Number.isInteger(Number(v)) && Number(v) > 0) || 'Whole number ≥ 1' })} />
              </Field>
              <Field label="Price (₹)" error={e.price}>
                <input type="number" min="0" step="0.01" {...register(`items.${idx}.price`, { required: 'Required', validate: (v) => Number(v) >= 0 || 'Cannot be negative' })} />
              </Field>
              <button type="button" className="icon-btn" aria-label="Remove item" disabled={fields.length === 1} onClick={() => remove(idx)}><Trash2 size={16} /></button>
              <Field label="Special instructions" className="item-note"><input {...register(`items.${idx}.special_instructions`)} placeholder="Special instructions (optional)" /></Field>
            </div>
          );
        })}
        <button type="button" className="btn btn-sm" style={{ marginTop: 10 }} onClick={() => append(blankItem)}><Plus size={14} /> Add item</button>

        <div className="form-grid" style={{ marginTop: 24 }}>
          <div>
            <Field label="Advance paid (₹)" error={errors.advance_amount}>
              <input type="number" min="0" step="0.01" {...register('advance_amount', {
                validate: (v) => (Number(v) >= 0 && Number(v) <= total) || (Number(v) < 0 ? 'Cannot be negative' : 'Advance cannot be greater than the total'),
              })} />
            </Field>
            <Field label="Notes (optional)" className="" ><textarea rows={3} {...register('notes')} /></Field>
          </div>
          <div className="totals">
            <div><span>Total</span><strong>{formatMoney(total)}</strong></div>
            <div><span>Advance</span><span>{formatMoney(advance)}</span></div>
            <div className="grand"><span>Remaining</span><span>{formatMoney(Math.max(total - advance, 0))}</span></div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Create order'}</button>
          <Link className="btn" to={editing ? `/orders/${id}` : '/orders'}>Cancel</Link>
        </div>
      </form>
    </>
  );
}
