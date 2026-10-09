const { query } = require('../config/database');

async function listForUser(userId, limit = 50) {
  const { rows } = await query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2', [userId, limit]);
  const unread = (await query('SELECT count(*)::int AS n FROM notifications WHERE user_id = $1 AND NOT is_read', [userId])).rows[0].n;
  return { items: rows, unread };
}

const markRead = async (id, userId) =>
  (await query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId])).rowCount > 0;

const markAllRead = async (userId) =>
  (await query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND NOT is_read', [userId])).rowCount;

module.exports = { listForUser, markRead, markAllRead };
