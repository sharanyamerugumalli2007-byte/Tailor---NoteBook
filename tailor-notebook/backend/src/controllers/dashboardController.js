const { query } = require('../config/database');
const { ok, asyncHandler } = require('../utils/response');

const stats = asyncHandler(async (_req, res) => {
  const { rows } = await query(`
    SELECT
      (SELECT count(*)::int FROM customers WHERE deleted_at IS NULL) AS total_customers,
      (SELECT count(*)::int FROM orders) AS total_orders,
      (SELECT count(*)::int FROM orders WHERE status = 'ORDER_RECEIVED') AS pending_orders,
      (SELECT count(*)::int FROM orders WHERE status IN ('MEASUREMENT_TAKEN','CUTTING','STITCHING','TRIAL')) AS in_progress_orders,
      (SELECT count(*)::int FROM orders WHERE status = 'READY') AS ready_orders,
      (SELECT count(*)::int FROM orders WHERE status = 'DELIVERED') AS delivered_orders,
      (SELECT count(*)::int FROM appointments WHERE appointment_date = CURRENT_DATE AND status IN ('SCHEDULED','RESCHEDULED')) AS todays_appointments,
      (SELECT count(*)::int FROM appointments WHERE appointment_date > CURRENT_DATE AND status IN ('SCHEDULED','RESCHEDULED')) AS upcoming_appointments,
      (SELECT COALESCE(sum(remaining_amount),0) FROM orders WHERE status <> 'CANCELLED') AS outstanding_balance`);
  const recentCustomers = (await query(
    'SELECT id, name, phone, created_at FROM customers WHERE deleted_at IS NULL ORDER BY created_at DESC, id DESC LIMIT 5')).rows;
  const notifications = (await query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT 5', [_req.user.id])).rows;
  ok(res, { ...rows[0], recent_customers: recentCustomers, recent_notifications: notifications });
});

const recentOrders = asyncHandler(async (_req, res) => {
  const { rows } = await query(
    `SELECT o.id, o.status, o.total_amount, o.order_date, o.expected_delivery_date, c.name AS customer_name
     FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY o.created_at DESC, o.id DESC LIMIT 6`);
  ok(res, rows);
});

const upcomingAppointments = asyncHandler(async (_req, res) => {
  const { rows } = await query(
    `SELECT a.id, a.appointment_date, a.appointment_time, a.purpose, a.status, c.name AS customer_name
     FROM appointments a JOIN customers c ON c.id = a.customer_id
     WHERE a.appointment_date >= CURRENT_DATE AND a.status IN ('SCHEDULED','RESCHEDULED')
     ORDER BY a.appointment_date, a.appointment_time LIMIT 6`);
  ok(res, rows);
});

module.exports = { stats, recentOrders, upcomingAppointments };
