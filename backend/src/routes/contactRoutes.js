const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/', contactController.submitContactMessage);
router.get('/admin', authenticate, requireRole('admin', 'staff'), contactController.getContactMessages);

module.exports = router;
