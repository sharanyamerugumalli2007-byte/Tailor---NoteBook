const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/dashboard', authenticate, requireRole('admin', 'staff'), adminController.getAdminDashboard);
router.get('/settings', authenticate, requireRole('admin', 'staff'), adminController.getSettings);
router.put('/settings', authenticate, requireRole('admin', 'staff'), adminController.updateSettings);

module.exports = router;
