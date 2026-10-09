const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { signToken } = require('../utils/jwt');
const logger = require('../utils/logger');

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, phone, password, address, city, state, postal_code, gender } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const emailNorm = String(email).trim().toLowerCase();

    // Check duplicate
    const existing = await query('SELECT * FROM users WHERE email = ?', [emailNorm]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userRes = await query(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name, emailNorm, phone || '', passwordHash, 'customer']
    );

    const userId = userRes.insertId || (userRes.rows && userRes.rows[0] ? userRes.rows[0].id : 1);

    // Create customer profile
    const custRes = await query(
      'INSERT INTO customers (user_id, name, phone, email, address, city, state, postal_code, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, phone || '', emailNorm, address || '', city || '', state || '', postal_code || '', gender || 'female']
    );

    const customerId = custRes.insertId || (custRes.rows && custRes.rows[0] ? custRes.rows[0].id : 1);

    const user = {
      id: userId,
      customerId,
      name,
      email: emailNorm,
      phone: phone || '',
      role: 'customer'
    };

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Tailor Notebook.',
      token,
      user
    });
  } catch (err) {
    logger.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password, requiredRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const result = await query('SELECT * FROM users WHERE email = ?', [emailNorm]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const userRecord = result.rows[0];
    const isMatch = await bcrypt.compare(password, userRecord.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (requiredRole && userRecord.role !== requiredRole && requiredRole === 'admin' && userRecord.role !== 'admin' && userRecord.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required.' });
    }

    // Get customer profile if role is customer
    let customerId = null;
    let customerProfile = null;
    const custRes = await query('SELECT * FROM customers WHERE user_id = ? OR email = ?', [userRecord.id, userRecord.email]);
    if (custRes.rows && custRes.rows.length > 0) {
      customerId = custRes.rows[0].id;
      customerProfile = custRes.rows[0];
    }

    const user = {
      id: userRecord.id,
      customerId,
      name: userRecord.name,
      email: userRecord.email,
      phone: userRecord.phone || '',
      role: userRecord.role,
      profile: customerProfile
    };

    const token = signToken(user);

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user
    });
  } catch (err) {
    logger.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  try {
    const userId = req.user.id;
    const result = await query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [userId]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const userRecord = result.rows[0];
    let customerProfile = null;
    const custRes = await query('SELECT * FROM customers WHERE user_id = ? OR email = ?', [userRecord.id, userRecord.email]);
    if (custRes.rows && custRes.rows.length > 0) {
      customerProfile = custRes.rows[0];
    }

    return res.json({
      success: true,
      user: {
        ...userRecord,
        customerId: customerProfile ? customerProfile.id : null,
        profile: customerProfile
      }
    });
  } catch (err) {
    logger.error('GetMe error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
}

// POST /api/auth/change-password
async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new passwords are required.' });
    }

    const result = await query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    logger.error('Change password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const result = await query('SELECT * FROM users WHERE email = ?', [String(email).trim().toLowerCase()]);
    if (!result.rows || result.rows.length === 0) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, reset instructions have been generated.',
        devNotice: 'In development mode: You can log in directly using your password or contact studio admin.'
      });
    }

    return res.json({
      success: true,
      message: 'Password reset request acknowledged.',
      devNotice: 'Email gateway is in studio mode. Please contact the Tailor Notebook studio desk or use your existing credentials.'
    });
  } catch (err) {
    logger.error('Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process password recovery request.' });
  }
}

// PUT /api/auth/profile
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone, address, city, state, postal_code, gender } = req.body;

    await query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone, userId]);

    const custRes = await query('SELECT * FROM customers WHERE user_id = ?', [userId]);
    if (custRes.rows && custRes.rows.length > 0) {
      await query(
        'UPDATE customers SET name = ?, phone = ?, address = ?, city = ?, state = ?, postal_code = ?, gender = ? WHERE user_id = ?',
        [name, phone, address, city, state, postal_code, gender, userId]
      );
    } else {
      await query(
        'INSERT INTO customers (user_id, name, phone, email, address, city, state, postal_code, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, name, phone, req.user.email, address, city, state, postal_code, gender]
      );
    }

    return res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    logger.error('Update profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  forgotPassword,
  updateProfile
};
