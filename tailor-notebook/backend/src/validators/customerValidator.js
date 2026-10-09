const { z, emptyToUndef, optionalText } = require('./common');

const customer = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  phone: z.string().trim().regex(/^\+?[0-9][0-9\s-]{6,17}$/, 'Enter a valid phone number'),
  email: z.preprocess(emptyToUndef, z.string().trim().email('Enter a valid email address').max(150).optional()),
  address: optionalText,
  gender: z.preprocess(emptyToUndef, z.enum(['male', 'female', 'other']).optional()),
  notes: optionalText,
});

const list = z.object({
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

module.exports = { customer, list };
