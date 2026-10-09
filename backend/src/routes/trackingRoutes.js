const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const { optionalAuth, authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/:orderNumber', optionalAuth, trackingController.getOrderTracking);
router.post('/admin/orders/:id/tracking', authenticate, requireRole('admin', 'staff'), trackingController.addTrackingEvent);
router.post('/:id', authenticate, requireRole('admin', 'staff'), trackingController.addTrackingEvent);

module.exports = router;
