const { z, isoDate, time, id, emptyToUndef, optionalText } = require('./common');

const PURPOSES = ['MEASUREMENT', 'TRIAL', 'DELIVERY', 'CONSULTATION', 'ALTERATION'];
const STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'];

const appointment = z.object({
  customer_id: id,
  appointment_date: isoDate,
  appointment_time: time,
  purpose: z.enum(PURPOSES, { errorMap: () => ({ message: 'Choose a valid purpose' }) }),
  status: z.preprocess(emptyToUndef, z.enum(STATUSES).optional()),
  notes: optionalText,
});

const statusPatch = z.object({ status: z.enum(STATUSES, { errorMap: () => ({ message: 'Invalid status' }) }) });

const list = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.preprocess(emptyToUndef, z.enum(STATUSES).optional()),
  date: z.preprocess(emptyToUndef, isoDate.optional()),
  from: z.preprocess(emptyToUndef, isoDate.optional()),
  to: z.preprocess(emptyToUndef, isoDate.optional()),
});

module.exports = { appointment, statusPatch, list };
