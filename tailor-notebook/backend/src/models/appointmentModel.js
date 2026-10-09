const { query } = require('../config/database');

const SELECT = `SELECT a.*, c.name AS customer_name, c.phone AS customer_phone
  FROM appointments a JOIN customers c ON c.id = a.customer_id`;

async function list(f) {
  const like = f.search ? `%${f.search}%` : null;
  const { rows } = await query(
    `${SELECT}
     WHERE ($1::text IS NULL OR c.name ILIKE $1 OR c.phone ILIKE $1)
       AND ($2::text IS NULL OR a.status = $2)
       AND ($3::date IS NULL OR a.appointment_date = $3)
       AND ($4::date IS NULL OR a.appointment_date >= $4)
       AND ($5::date IS NULL OR a.appointment_date <= $5)
     ORDER BY a.appointment_date, a.appointment_time`,
    [like, f.status ?? null, f.date ?? null, f.from ?? null, f.to ?? null]);
  return rows;
}

const findById = async (id) => (await query(`${SELECT} WHERE a.id = $1`, [id])).rows[0];

const findConflict = async (date, time, excludeId = null) =>
  (await query(
    `SELECT a.id, c.name AS customer_name FROM appointments a JOIN customers c ON c.id = a.customer_id
     WHERE a.appointment_date = $1 AND a.appointment_time = $2 AND a.status IN ('SCHEDULED','RESCHEDULED')
       AND ($3::int IS NULL OR a.id <> $3)`, [date, time, excludeId])).rows[0];

const create = async (d) =>
  (await query(
    `INSERT INTO appointments (customer_id, appointment_date, appointment_time, purpose, status, notes)
     VALUES ($1,$2,$3,$4,COALESCE($5,'SCHEDULED'),$6) RETURNING id`,
    [d.customer_id, d.appointment_date, d.appointment_time, d.purpose, d.status ?? null, d.notes ?? null])).rows[0].id;

const update = async (id, d) =>
  (await query(
    `UPDATE appointments SET customer_id=$2, appointment_date=$3, appointment_time=$4, purpose=$5,
        status=COALESCE($6,status), notes=$7, updated_at=now() WHERE id=$1 RETURNING id`,
    [id, d.customer_id, d.appointment_date, d.appointment_time, d.purpose, d.status ?? null, d.notes ?? null])).rows[0];

const setStatus = async (id, status) =>
  (await query('UPDATE appointments SET status=$2, updated_at=now() WHERE id=$1 RETURNING id', [id, status])).rows[0];

const remove = async (id) => (await query('DELETE FROM appointments WHERE id=$1', [id])).rowCount > 0;

module.exports = { list, findById, findConflict, create, update, setStatus, remove };
