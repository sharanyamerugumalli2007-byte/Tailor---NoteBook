const { z } = require('./common');

const login = z.object({
  email: z.string().trim().min(1, 'Email is required').max(150),
  password: z.string().min(1, 'Password is required').max(200),
});

const profile = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().trim().email('Enter a valid email address').max(150).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(200).optional(),
}).refine((d) => !d.newPassword || d.currentPassword, { message: 'Current password is required to set a new one', path: ['currentPassword'] });

module.exports = { login, profile };
