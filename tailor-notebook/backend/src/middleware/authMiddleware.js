const { verifyToken } = require('../utils/jwt');
const { AppError, asyncHandler } = require('../utils/response');
const { query } = require('../config/database');

/** Requires a valid Bearer token and loads the current user from the database. */
const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AppError('Authentication required', 401);

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError('Session expired or invalid. Please log in again.', 401);
  }

  const { rows } = await query('SELECT id, name, email, role FROM users WHERE id = $1', [payload.sub]);
  if (!rows[0]) throw new AppError('User no longer exists', 401);
  req.user = rows[0];
  next();
});

module.exports = { authenticate };
