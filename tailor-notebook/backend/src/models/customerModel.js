const { query } = require('../config/database');

const SEARCH = `c.deleted_at IS NULL AND ($1::text IS NULL OR c.name ILIKE $1 OR c.phone ILIKE $1 OR c.email ILIKE $1)`;

async function list({ search, page, limit }) {
  const like = search ? `%${search}%` : null;
  const total = (await query(`SELECT count(*)::int AS n FROM customers c WHERE ${SEARCH}`, [like])).rows[0].n;
  const { rows } = await query(
    `SELECT c.*,
       (SELECT count(*)::int FROM orders o WHERE o.customer_id = c.id) AS order_count
     FROM customers c WHERE ${SEARCH}
     ORDER BY c.created_at DESC, c.id DESC LIMIT $2 OFFSET $3`,
    [like, limit, (page - 1) * limit]
  );
  return { items: rows, total, page, limit };
}

const findById = async (id) =>
  (await query('SELECT * FROM customers WHERE id = $1 AND deleted_at IS NULL', [id])).rows[0];

const create = async (d) =>
  (await query(
    `INSERT INTO customers (name, phone, email, address, gender, notes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [d.name, d.phone, d.email ?? null, d.address ?? null, d.gender ?? null, d.notes ?? null]
  )).rows[0];

const update = async (id, d) =>
  (await query(
    `UPDATE customers SET name=$2, phone=$3, email=$4, address=$5, gender=$6, notes=$7, updated_at=now()
     WHERE id=$1 AND deleted_at IS NULL RETURNING *`,
    [id, d.name, d.phone, d.email ?? null, d.address ?? null, d.gender ?? null, d.notes ?? null]
  )).rows[0];

// Soft delete: orders, measurements and appointments stay intact for the shop's records
const softDelete = async (id) =>
  (await query('UPDATE customers SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id', [id])).rows[0];

async function history(id) {
  const [measurements, orders, appointments] = await Promise.all([
    query('SELECT * FROM measurements WHERE customer_id = $1 ORDER BY version DESC', [id]),
    query(
      `SELECT o.*, (SELECT string_agg(i.item_type, ', ' ORDER BY i.id) FROM order_items i WHERE i.order_id = o.id) AS items_summary
       FROM orders o WHERE o.customer_id = $1 ORDER BY o.order_date DESC, o.id DESC`, [id]),
    query('SELECT * FROM appointments WHERE customer_id = $1 ORDER BY appointment_date DESC, appointment_time DESC', [id]),
  ]);
  return { measurements: measurements.rows, orders: orders.rows, appointments: appointments.rows };
}

module.exports = { list, findById, create, update, softDelete, history };
