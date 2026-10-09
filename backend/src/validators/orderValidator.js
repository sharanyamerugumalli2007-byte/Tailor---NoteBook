const { z, isoDate, id, emptyToUndef, optionalText } = require('./common');

const item = z.object({
  item_type: z.string().trim().min(1, 'Item type is required').max(50),
  description: optionalText,
  quantity: z.coerce.number().int('Quantity must be a whole number').positive('Quantity must be at least 1').max(1000),
  price: z.coerce.number().min(0, 'Price cannot be negative').max(10000000),
  special_instructions: optionalText,
});

const base = {
  measurement_id: z.preprocess(emptyToUndef, id.optional()),
  order_date: z.preprocess(emptyToUndef, isoDate.optional()),
  expected_delivery_date: z.preprocess(emptyToUndef, isoDate.optional()),
  advance_amount: z.preprocess(emptyToUndef, z.coerce.number().min(0, 'Advance cannot be negative').default(0)),
  notes: optionalText,
  items: z.array(item).min(1, 'Add at least one item').max(50),
};

const dateOrder = (d) => !d.order_date || !d.expected_delivery_date || d.expected_delivery_date >= d.order_date;
const dateMsg = { message: 'Delivery date cannot be before the order date', path: ['expected_delivery_date'] };

const createOrder = z.object({ customer_id: id, ...base }).refine(dateOrder, dateMsg);
const updateOrder = z.object(base).refine(dateOrder, dateMsg);

const STATUSES = ['ORDER_RECEIVED', 'MEASUREMENT_TAKEN', 'CUTTING', 'STITCHING', 'TRIAL', 'READY', 'DELIVERED', 'CANCELLED'];
const statusPatch = z.object({ status: z.enum(STATUSES, { errorMap: () => ({ message: 'Invalid order status' }) }), notes: optionalText });

const list = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.preprocess(emptyToUndef, z.enum(STATUSES).optional()),
  payment_status: z.preprocess(emptyToUndef, z.enum(['PENDING', 'PARTIALLY_PAID', 'PAID']).optional()),
  delivery_from: z.preprocess(emptyToUndef, isoDate.optional()),
  delivery_to: z.preprocess(emptyToUndef, isoDate.optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

module.exports = { createOrder, updateOrder, statusPatch, list, STATUSES };
