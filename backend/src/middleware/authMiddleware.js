const { verifyToken } = require('../utils/jwt');
const { query } = require('../config/database');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Session expired or invalid. Please log in again.' });
    }

    const userId = payload.sub || payload.id;
    const result = await query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [userId]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User account no longer exists.' });
    }

    const user = result.rows[0];

    // Find customer id if present
    const custRes = await query('SELECT * FROM customers WHERE user_id = ? OR email = ?', [user.id, user.email]);
    if (custRes.rows && custRes.rows.length > 0) {
      user.customerId = custRes.rows[0].id;
      user.customerProfile = custRes.rows[0];
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Authentication verification failed.' });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = verifyToken(token);
    const userId = payload.sub || payload.id;
    query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [userId]).then((result) => {
      if (result.rows && result.rows.length > 0) {
        req.user = result.rows[0];
      }
      next();
    }).catch(() => next());
  } catch {
    next();
  }
}

module.exports = { authenticate, optionalAuth };
