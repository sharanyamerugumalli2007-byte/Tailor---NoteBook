const { pool, query } = require('../config/database');
const logger = require('../utils/logger');

/** Creates one notification per user. Pass a transaction client as `db` to keep it atomic. */
async function notifyAll({ title, message, type = 'INFO' }, db = pool) {
  await db.query(
    'INSERT INTO notifications (user_id, title, message, type) SELECT id, $1, $2, $3 FROM users',
    [title, message, type]);
}

const money = (n) => `Rs. ${Number(n).toFixed(2)}`;

/**
 * Time-based reminders (appointments, deliveries, pending payments).
 * Runs at startup and hourly; the NOT EXISTS clause prevents duplicates within 24h.
 */
async function generateReminders() {
  const insert = (title, type, messageExpr, source) => query(
    `INSERT INTO notifications (user_id, title, message, type)
     SELECT u.id, $1, s.msg, $2 FROM users u CROSS JOIN (${source}) s
     WHERE NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = u.id AND n.type = $2
                       AND n.message = s.msg AND n.created_at > now() - interval '24 hours')`,
    [title, type]);

  await insert('Appointment reminder', 'APPOINTMENT', null,
    `SELECT 'Appointment with ' || c.name || ' is ' ||
            CASE WHEN a.appointment_date = CURRENT_DATE THEN 'today' ELSE 'tomorrow' END ||
            ' at ' || a.appointment_time || ' (' || lower(a.purpose) || ').' AS msg
     FROM appointments a JOIN customers c ON c.id = a.customer_id
     WHERE a.status IN ('SCHEDULED','RESCHEDULED') AND a.appointment_date IN (CURRENT_DATE, CURRENT_DATE + 1)`);

  await insert('Delivery date approaching', 'DELIVERY_DUE', null,
    `SELECT 'Order #' || o.id || ' for ' || c.name || ' is due on ' || to_char(o.expected_delivery_date, 'DD Mon') || '.' AS msg
     FROM orders o JOIN customers c ON c.id = o.customer_id
     WHERE o.status NOT IN ('READY','DELIVERED','CANCELLED')
       AND o.expected_delivery_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 2`);

  await insert('Payment pending', 'PAYMENT', null,
    `SELECT 'Order #' || o.id || ' (' || c.name || ') is ready with Rs. ' || to_char(o.remaining_amount, 'FM999999990.00') || ' pending.' AS msg
     FROM orders o JOIN customers c ON c.id = o.customer_id
     WHERE o.status = 'READY' AND o.remaining_amount > 0`);
}

function startReminderJob() {
  const run = () => generateReminders().catch((e) => logger.error('Reminder job failed:', e.message));
  run();
  return setInterval(run, 60 * 60 * 1000);
}

module.exports = { notifyAll, generateReminders, startReminderJob, money };
