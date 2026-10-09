const { query } = require('../config/database');

const LIST_WHERE = `
  ($1::text IS NULL OR o.id::text = $2 OR c.name ILIKE $1 OR c.phone ILIKE $1 OR o.status ILIKE $1)
  AND ($3::text IS NULL OR o.status = $3)
  AND ($4::text IS NULL OR o.payment_status = $4)
  AND ($5::date IS NULL OR o.expected_delivery_date >= $5)
  AND ($6::date IS NULL OR o.expected_delivery_date <= $6)`;

async function list(f) {
  const like = f.search ? `%${f.search}%` : null;
  const params = [like, f.search || null, f.status ?? null, f.payment_status ?? null, f.delivery_from ?? null, f.delivery_to ?? null];
  const from = `FROM orders o JOIN customers c ON c.id = o.customer_id WHERE ${LIST_WHERE}`;
  const total = (await query(`SELECT count(*)::int AS n ${from}`, params)).rows[0].n;
  const { rows } = await query(
    `SELECT o.*, c.name AS customer_name, c.phone AS customer_phone,
       (SELECT string_agg(i.item_type, ', ' ORDER BY i.id) FROM order_items i WHERE i.order_id = o.id) AS items_summary
     ${from} ORDER BY o.order_date DESC, o.id DESC LIMIT $7 OFFSET $8`,
    [...params, f.limit, (f.page - 1) * f.limit]
  );
  return { items: rows, total, page: f.page, limit: f.limit };
}

async function findById(id, db = { query }) {
  const { rows } = await db.query(
    `SELECT o.*, c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email,
            m.version AS measurement_version
     FROM orders o JOIN customers c ON c.id = o.customer_id
     LEFT JOIN measurements m ON m.id = o.measurement_id WHERE o.id = $1`, [id]);
  if (!rows[0]) return null;
  const [items, history] = await Promise.all([
    db.query('SELECT * FROM order_items WHERE order_id = $1 ORDER BY id', [id]),
    db.query('SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY changed_at, id', [id]),
  ]);
  return { ...rows[0], items: items.rows, status_history: history.rows };
}

async function insertItems(client, orderId, items) {
  for (const i of items) {
    await client.query(
      `INSERT INTO order_items (order_id, item_type, description, quantity, price, special_instructions)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [orderId, i.item_type, i.description ?? null, i.quantity, i.price, i.special_instructions ?? null]);
  }
}

async function create(client, d, pay) {
  const { rows } = await client.query(
    `INSERT INTO orders (customer_id, measurement_id, order_date, expected_delivery_date,
        total_amount, advance_amount, remaining_amount, payment_status, notes)
     VALUES ($1,$2,COALESCE($3::date, CURRENT_DATE),$4,$5,$6,$7,$8,$9) RETURNING id`,
    [d.customer_id, d.measurement_id ?? null, d.order_date ?? null, d.expected_delivery_date ?? null,
     pay.total, pay.advance, pay.remaining, pay.paymentStatus, d.notes ?? null]);
  const id = rows[0].id;
  await insertItems(client, id, d.items);
  await client.query(`INSERT INTO order_status_history (order_id, status, notes) VALUES ($1,'ORDER_RECEIVED','Order created')`, [id]);
  return id;
}

async function update(client, id, d, pay) {
  const { rowCount } = await client.query(
    `UPDATE orders SET measurement_id=$2, order_date=COALESCE($3::date, order_date), expected_delivery_date=$4,
        total_amount=$5, advance_amount=$6, remaining_amount=$7, payment_status=$8, notes=$9, updated_at=now()
     WHERE id=$1`,
    [id, d.measurement_id ?? null, d.order_date ?? null, d.expected_delivery_date ?? null,
     pay.total, pay.advance, pay.remaining, pay.paymentStatus, d.notes ?? null]);
  if (!rowCount) return false;
  await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);
  await insertItems(client, id, d.items);
  return true;
}

async function setStatus(client, id, status, notes) {
  await client.query('UPDATE orders SET status=$2, updated_at=now() WHERE id=$1', [id, status]);
  await client.query('INSERT INTO order_status_history (order_id, status, notes) VALUES ($1,$2,$3)', [id, status, notes ?? null]);
}

const remove = async (id) => (await query('DELETE FROM orders WHERE id = $1 RETURNING id', [id])).rowCount > 0;

const forCustomer = async (customerId) =>
  (await query(
    `SELECT o.*, (SELECT string_agg(i.item_type, ', ' ORDER BY i.id) FROM order_items i WHERE i.order_id = o.id) AS items_summary
     FROM orders o WHERE o.customer_id = $1 ORDER BY o.order_date DESC, o.id DESC`, [customerId])).rows;

module.exports = { list, findById, create, update, setStatus, remove, forCustomer };
