// Usage: npm run seed   (runs schema.sql then seed.sql)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

(async () => {
  const pool = new Pool({
    host: process.env.DATABASE_HOST, port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME, user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  });
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    let seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    seed = seed
      .replace('__ADMIN_HASH__', await bcrypt.hash('Admin@123', 10))
      .replace('__STAFF_HASH__', await bcrypt.hash('Staff@123', 10));
    await pool.query(schema);
    await pool.query(seed);
    console.log('Database reset and seeded.');
    console.log('Admin: admin@tailor.local / Admin@123');
    console.log('Staff: staff@tailor.local / Staff@123');
  } catch (e) {
    console.error('Seed failed:', e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
