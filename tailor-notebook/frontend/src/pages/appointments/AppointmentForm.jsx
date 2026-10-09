import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Modal from '../../components/Modal';
import Field from '../../components/Field';
import CustomerPicker from '../../components/CustomerPicker';
import { createAppointment, updateAppointment } from '../../services/appointmentService';
import { errorMessage } from '../../services/api';
import { APPT_PURPOSES, APPT_STATUSES } from '../../utils/validation';
import { todayISO } from '../../utils/dateUtils';
import { label } from '../../utils/formatters';

/** Modal form for adding or editing/rescheduling an appointment. */
export default function AppointmentForm({ appointment, defaults = {}, onClose, onSaved }) {
  const editing = !!appointment;
  const [error, setError] = useState('');
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: editing
      ? { customer_id: appointment.customer_id, appointment_date: appointment.appointment_date, appointment_time: appointment.appointment_time.slice(0, 5),
          purpose: appointment.purpose, status: appointment.status, notes: appointment.notes || '' }
      : { customer_id: defaults.customerId || '', appointment_date: defaults.date || todayISO(), appointment_time: '10:00', purpose: 'MEASUREMENT', status: '', notes: '' },
  });

  const onSubmit = async (v) => {
    setError('');
    const payload = { ...v, customer_id: Number(v.customer_id), status: v.status || undefined };
    try {
      const saved = editing ? await updateAppointment(appointment.id, payload) : await createAppointment(payload);
      onSaved(saved, editing);
    } catch (err) { setError(errorMessage(err)); }
  };

  return (
    <Modal wide title={editing ? 'Edit appointment' : 'Add appointment'} onClose={onClose}
      footer={<>
        <button className="btn" type="button" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" type="submit" form="appt-form" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save appointment'}</button>
      </>}>
      <form id="appt-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-grid">
          <Field label="Customer" error={errors.customer_id} className="full">
            <Controller name="customer_id" control={control} rules={{ required: 'Choose a customer' }}
              render={({ field }) => <CustomerPicker value={field.value} invalid={!!errors.customer_id} onChange={(c) => field.onChange(c ? c.id : '')} />} />
          </Field>
          <Field label="Date" error={errors.appointment_date}>
            <input type="date" min={editing ? undefined : todayISO()} {...register('appointment_date', { required: 'Date is required' })} />
          </Field>
          <Field label="Time" error={errors.appointment_time}>
            <input type="time" {...register('appointment_time', { required: 'Time is required' })} />
          </Field>
          <Field label="Purpose">
            <select {...register('purpose')}>{APPT_PURPOSES.map((p) => <option key={p} value={p}>{label(p)}</option>)}</select>
          </Field>
          {editing && (
            <Field label="Status">
              <select {...register('status')}>{APPT_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
            </Field>
          )}
          <Field label="Notes (optional)" className="full"><textarea rows={2} {...register('notes')} /></Field>
        </div>
      </form>
    </Modal>
  );
}
