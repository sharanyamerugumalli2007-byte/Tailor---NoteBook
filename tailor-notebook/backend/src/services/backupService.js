const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const { AppError } = require('../utils/response');

// Outside any static-served folder; only reachable through authenticated admin endpoints
const BACKUP_DIR = path.resolve(__dirname, '../../backups');
const NAME_RE = /^backup-[\d-]+\.sql$/;

function ensureDir() { fs.mkdirSync(BACKUP_DIR, { recursive: true, mode: 0o700 }); }

function createBackup() {
  ensureDir();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const name = `backup-${stamp.replace('_', '-')}.sql`;
  const file = path.join(BACKUP_DIR, name);

  return new Promise((resolve, reject) => {
    const args = ['-h', env.db.host, '-p', String(env.db.port), '-U', env.db.user, '-d', env.db.database, '--no-owner', '-f', file];
    // Password goes through the environment, never on the command line
    const proc = spawn(env.pgDumpPath, args, { env: { ...process.env, PGPASSWORD: env.db.password || '' } });
    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d; });
    proc.on('error', () => reject(new AppError('pg_dump was not found. Install PostgreSQL client tools or set PG_DUMP_PATH.', 500)));
    proc.on('close', (code) => {
      if (code !== 0) {
        fs.rmSync(file, { force: true });
        console.error('pg_dump failed:', stderr);
        return reject(new AppError('Backup failed. Check the server logs.', 500));
      }
      fs.chmodSync(file, 0o600);
      resolve({ name, size: fs.statSync(file).size });
    });
  });
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
  const p = path.join(BACKUP_DIR, name);
  if (!fs.existsSync(p)) throw new AppError('Backup not found', 404);
  return p;
}

module.exports = { createBackup, listBackups, backupPath };
