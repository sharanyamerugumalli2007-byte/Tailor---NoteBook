const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, notificationController.getNotifications);
router.patch('/:id/read', authenticate, notificationController.markNotificationRead);
router.post('/read-all', authenticate, notificationController.markAllNotificationsRead);

module.exports = router;
