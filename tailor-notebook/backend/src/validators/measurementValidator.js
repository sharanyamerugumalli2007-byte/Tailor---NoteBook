const { z, optionalText } = require('./common');

const dim = z.preprocess(
  (v) => (v === '' || v === null ? undefined : v),
  z.coerce.number({ invalid_type_error: 'Must be a number' }).positive('Must be greater than 0').max(300, 'Value looks too large').optional()
);

const FIELDS = ['shoulder', 'chest', 'waist', 'hip', 'neck', 'sleeve_length', 'armhole',
  'shirt_length', 'pant_length', 'thigh', 'knee', 'inseam', 'outseam'];

const shape = { unit: z.enum(['in', 'cm'], { errorMap: () => ({ message: 'Unit must be in or cm' }) }) };
FIELDS.forEach((f) => { shape[f] = dim; });
shape.other_measurements = optionalText;
shape.notes = optionalText;

const measurement = z.object(shape).refine(
  (d) => FIELDS.some((f) => d[f] !== undefined) || d.other_measurements,
  { message: 'Enter at least one measurement', path: ['chest'] }
);

module.exports = { measurement, FIELDS };
