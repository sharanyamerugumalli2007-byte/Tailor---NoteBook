const { query } = require('../config/database');

const findByEmail = async (email) =>
  (await query('SELECT * FROM users WHERE lower(email) = lower($1)', [email])).rows[0];

const findById = async (id) =>
  (await query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id])).rows[0];

const getWithHash = async (id) => (await query('SELECT * FROM users WHERE id = $1', [id])).rows[0];

const update = async (id, { name, email, passwordHash }) =>
  (await query(
    `UPDATE users SET name = COALESCE($2, name), email = COALESCE($3, email),
       password_hash = COALESCE($4, password_hash), updated_at = now()
     WHERE id = $1 RETURNING id, name, email, role`,
    [id, name ?? null, email ?? null, passwordHash ?? null]
  )).rows[0];

module.exports = { findByEmail, findById, getWithHash, update };
