const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Customer Self Routes
router.get('/dashboard', authenticate, customerController.getCustomerDashboard);
router.get('/profile', authenticate, customerController.getProfile);
router.put('/profile', authenticate, customerController.updateProfile);

// Admin-specific customer routes
router.get('/admin/all', authenticate, requireRole('admin', 'staff'), customerController.getAdminCustomers);
router.get('/admin/:id', authenticate, requireRole('admin', 'staff'), customerController.getAdminCustomerById);

// Root /:id for /api/admin/customers
router.get('/', authenticate, requireRole('admin', 'staff'), customerController.getAdminCustomers);
router.get('/:id', authenticate, (req, res, next) => {
  if (req.params.id === 'dashboard') return customerController.getCustomerDashboard(req, res, next);
  if (req.params.id === 'profile') return customerController.getProfile(req, res, next);
  return customerController.getAdminCustomerById(req, res, next);
});

module.exports = router;
