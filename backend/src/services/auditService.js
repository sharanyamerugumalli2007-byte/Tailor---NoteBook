const { query, isMySQLConnected, getLocalStore, saveLocalStore } = require('../config/database');

const logActivity = async ({ userId = null, userName = 'System', action, entityType, entityId = null, details = '' }) => {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (isMySQLConnected()) {
      await query(
        'INSERT INTO activity_logs (user_id, user_name, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, userName, action, entityType, entityId, details, timestamp]
      );
    } else {
      const store = getLocalStore();
      if (store && store.activity_logs) {
        store.activity_logs.unshift({
          id: Date.now(),
          user_id: userId,
          user_name: userName,
          action,
          entity_type: entityType,
          entity_id: entityId,
          details,
          created_at: timestamp
        });
        saveLocalStore();
      }
    }
  } catch (err) {
    console.error('[AuditService Error]:', err.message);
  }
};

const getRecentLogs = async (limit = 50) => {
  if (isMySQLConnected()) {
    return await query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ?', [limit]);
  }
  const store = getLocalStore();
  return (store?.activity_logs || []).slice(0, limit);
};

module.exports = {
  logActivity,
  getRecentLogs
};
