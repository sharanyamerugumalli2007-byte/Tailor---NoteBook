const { z } = require('zod');

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid date');
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM (24-hour) format');
const id = z.coerce.number().int().positive();
const emptyToUndef = (v) => (v === '' || v === null ? undefined : v);
const optionalText = z.preprocess(emptyToUndef, z.string().trim().max(2000).optional());

module.exports = { z, isoDate, time, id, emptyToUndef, optionalText };
