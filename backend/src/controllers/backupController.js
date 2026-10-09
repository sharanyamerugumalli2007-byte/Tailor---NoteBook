const backup = require('../services/backupService');
const { ok, created, asyncHandler } = require('../utils/response');

const create = asyncHandler(async (_req, res) => created(res, await backup.createBackup(), 'Backup created'));
const list = asyncHandler(async (_req, res) => ok(res, backup.listBackups()));
const download = asyncHandler(async (req, res) => res.download(backup.backupPath(req.params.name)));

module.exports = { create, list, download };
