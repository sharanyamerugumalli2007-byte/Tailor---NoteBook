const router = require('express').Router();
const c = require('../controllers/backupController');

// Mounted behind authenticate + requireRole('admin') in server.js
router.get('/', c.list);
router.post('/', c.create);
router.get('/:name/download', c.download);

module.exports = router;
