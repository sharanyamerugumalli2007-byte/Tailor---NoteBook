const { query } = require('../config/database');
const logger = require('../utils/logger');

// GET /api/customer/notifications or /api/notifications
async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const result = await query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50',
      [userId]
    );

    const notifications = result.rows || [];
    const unreadCount = notifications.filter(n => !n.is_read || n.is_read === 0).length;

    return res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (err) {
    logger.error('Error fetching notifications:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
}

// PATCH /api/customer/notifications/:id/read
async function markNotificationRead(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;

    await query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    logger.error('Error marking notification read:', err);
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
}

// POST /api/customer/notifications/read-all
async function markAllNotificationsRead(req, res) {
  try {
    const userId = req.user.id;
    await query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    logger.error('Error marking all notifications read:', err);
    return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
}

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
