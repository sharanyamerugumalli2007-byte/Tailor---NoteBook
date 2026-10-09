/**
 * Standalone MySQL Database Initialization Script
 * Usage: node database/init.js
 */
const { initDatabase, isMySQLConnected, getPool } = require('../src/config/database');

async function run() {
  console.log('====================================================');
  console.log(' Tailor Notebook: Initializing MySQL Database');
  console.log('====================================================');

  try {
    await initDatabase();
    if (isMySQLConnected()) {
      console.log('✅ MySQL Database initialized and seeded successfully!');
      const pool = getPool();
      if (pool) await pool.end();
    } else {
      console.log('ℹ️ Local storage mode initialized. To use MySQL, ensure MySQL server is running.');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization error:', err);
    process.exit(1);
  }
}

run();
