const { Pool, types } = require('pg');
const env = require('./env');

// NUMERIC -> number, DATE -> 'YYYY-MM-DD' string (avoids timezone shifts)
types.setTypeParser(1700, (v) => parseFloat(v));
types.setTypeParser(1082, (v) => v);

const pool = new Pool(env.db);

pool.on('error', (err) => console.error('Unexpected PostgreSQL error:', err.message));

const query = (text, params) => pool.query(text, params);

/** Run fn(client) inside BEGIN/COMMIT, rolling back on any error. */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
