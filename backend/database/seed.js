// Creates the Oracle schema and two development sign-in accounts.
// WARNING: schema.sql drops and recreates the Tailor Notebook tables.
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const { query, pool } = require('../src/config/database');

async function runSchema() {
  const source = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  for (const section of source.split(/^\s*\/\s*$/m)) {
    const sql = section.replace(/^\s*--.*(?:\r?\n|$)/gm, '').trim();
    if (!sql) continue;
    if (/^BEGIN\b/i.test(sql) || /^CREATE\s+OR\s+REPLACE\s+TRIGGER\b/i.test(sql)) {
      await query(sql);
    } else {
      for (const statement of sql.split(';').map((part) => part.trim()).filter(Boolean)) {
        if (!statement.startsWith('--')) await query(statement);
      }
    }
  }
}

(async () => {
  try {
    await runSchema();
    await query('INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4)',
      ['Shop Owner', 'admin@tailor.local', await bcrypt.hash('Admin@123', 10), 'admin']);
    await query('INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4)',
      ['Shop Staff', 'staff@tailor.local', await bcrypt.hash('Staff@123', 10), 'staff']);
    console.log('Oracle schema created and development accounts added.');
    console.log('Admin: admin@tailor.local / Admin@123');
    console.log('Staff: staff@tailor.local / Staff@123');
  } catch (err) {
    console.error('Setup failed:', err.message);
    process.exitCode = 1;
  } finally { await pool.close(); }
})();
