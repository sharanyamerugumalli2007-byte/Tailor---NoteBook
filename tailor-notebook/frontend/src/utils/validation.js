// Mirrors the backend validators. The backend remains the source of truth.
export const rules = {
  required: (name) => ({ required: `${name} is required` }),
  phone: {
    required: 'Phone number is required',
    pattern: { value: /^\+?[0-9][0-9\s-]{6,17}$/, message: 'Enter a valid phone number' },
  },
  email: { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' } },
  positiveOptional: {
    validate: (v) => v === '' || v == null || (Number(v) > 0 && Number(v) <= 300) || 'Enter a number between 0 and 300',
  },
};

export const MEASUREMENT_FIELDS = [
  ['shoulder', 'Shoulder'], ['chest', 'Chest'], ['waist', 'Waist'], ['hip', 'Hip'], ['neck', 'Neck'],
  ['sleeve_length', 'Sleeve length'], ['armhole', 'Armhole'], ['shirt_length', 'Shirt / kurta length'],
  ['pant_length', 'Pant length'], ['thigh', 'Thigh'], ['knee', 'Knee'], ['inseam', 'Inseam'], ['outseam', 'Outseam'],
];

export const ORDER_STATUSES = ['ORDER_RECEIVED', 'MEASUREMENT_TAKEN', 'CUTTING', 'STITCHING', 'TRIAL', 'READY', 'DELIVERED', 'CANCELLED'];
export const PAYMENT_STATUSES = ['PENDING', 'PARTIALLY_PAID', 'PAID'];
export const APPT_PURPOSES = ['MEASUREMENT', 'TRIAL', 'DELIVERY', 'CONSULTATION', 'ALTERATION'];
export const APPT_STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'];
export const ITEM_TYPES = ['Shirt', 'Pant', 'Blouse', 'Kurta', 'Saree blouse', 'Dress', 'Suit', 'Custom item'];
