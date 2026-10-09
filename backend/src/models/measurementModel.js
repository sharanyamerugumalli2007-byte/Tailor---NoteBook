const { query } = require('../config/database');
const { FIELDS } = require('../validators/measurementValidator');

const COLS = ['unit', ...FIELDS, 'other_measurements', 'notes'];

const listForCustomer = async (customerId) =>
  (await query('SELECT * FROM measurements WHERE customer_id = $1 ORDER BY version DESC', [customerId])).rows;

const findById = async (id) => (await query('SELECT * FROM measurements WHERE id = $1', [id])).rows[0];

const findCurrent = async (customerId) =>
  (await query('SELECT * FROM measurements WHERE customer_id = $1 AND is_current', [customerId])).rows[0];

/**
 * Creates a NEW version and marks it current. Older versions are never modified
 * (apart from is_current = false), so history is preserved.
 * Must be called inside a transaction (pass the client).
 */
async function createVersion(client, customerId, data) {
  // Serialise concurrent version creation for this customer
  await client.query('SELECT id FROM customers WHERE id = $1 FOR UPDATE', [customerId]);
  const { rows: [{ next }] } = await client.query(
    'SELECT COALESCE(MAX(version), 0) + 1 AS next FROM measurements WHERE customer_id = $1', [customerId]);
  await client.query('UPDATE measurements SET is_current = FALSE WHERE customer_id = $1 AND is_current', [customerId]);

  const values = COLS.map((c) => data[c] ?? null);
  const placeholders = COLS.map((_, i) => `$${i + 3}`).join(', ');
  const { rows } = await client.query(
    `INSERT INTO measurements (customer_id, version, ${COLS.join(', ')}, is_current)
     VALUES ($1, $2, ${placeholders}, TRUE) RETURNING *`,
    [customerId, next, ...values]
  );
  return rows[0];
}

module.exports = { listForCustomer, findById, findCurrent, createVersion, COLS };
