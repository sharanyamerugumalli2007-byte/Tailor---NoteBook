const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');
const { AppError } = require('../utils/response');

const BACKUP_DIR = path.resolve(__dirname, '../../backups');
const NAME_RE = /^backup-[\dTZ_-]+\.json$/;
const TABLES = ['users', 'customers', 'measurements', 'orders', 'order_items', 'order_status_history', 'appointments', 'notifications'];

function ensureDir() { fs.mkdirSync(BACKUP_DIR, { recursive: true, mode: 0o700 }); }

async function createBackup() {
  ensureDir();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const name = `backup-${stamp}.json`;
  const data = { format: 'tailor-notebook-oracle-export-v1', exported_at: new Date().toISOString(), tables: {} };
  for (const table of TABLES) data.tables[table] = (await query(`SELECT * FROM ${table}`)).rows;
  const file = path.join(BACKUP_DIR, name);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), { mode: 0o600 });
  return { name, size: fs.statSync(file).size };
}

function listBackups() {
  ensureDir();
  return fs.readdirSync(BACKUP_DIR).filter((f) => NAME_RE.test(f)).map((name) => {
    const s = fs.statSync(path.join(BACKUP_DIR, name));
    return { name, size: s.size, created_at: s.mtime };
  }).sort((a, b) => b.created_at - a.created_at);
}

function backupPath(name) {
  if (!NAME_RE.test(name)) throw new AppError('Invalid backup name', 400);
  const file = path.join(BACKUP_DIR, name);
  if (!fs.existsSync(file)) throw new AppError('Backup not found', 404);
  return file;
}

module.exports = { createBackup, listBackups, backupPath };
