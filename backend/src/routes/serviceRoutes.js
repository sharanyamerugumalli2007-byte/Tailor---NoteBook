const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { optionalAuth, authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', optionalAuth, serviceController.getAllServices);
router.get('/:id', optionalAuth, serviceController.getServiceById);
router.post('/', authenticate, requireRole('admin', 'staff'), serviceController.createService);
router.put('/:id', authenticate, requireRole('admin', 'staff'), serviceController.updateService);
router.delete('/:id', authenticate, requireRole('admin', 'staff'), serviceController.deleteService);

module.exports = router;
