const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const paymentController = require('../controllers/paymentController');
const trackingController = require('../controllers/trackingController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Get Orders (Admin or Customer based on endpoint mount or role)
router.get('/', authenticate, (req, res, next) => {
  if (req.baseUrl.includes('/admin')) {
    return orderController.getAdminOrders(req, res, next);
  }
  return orderController.getCustomerOrders(req, res, next);
});

router.get('/admin/all', authenticate, requireRole('admin', 'staff'), orderController.getAdminOrders);
router.get('/admin', authenticate, requireRole('admin', 'staff'), orderController.getAdminOrders);

// Create New Order
router.post('/', authenticate, orderController.createOrder);

// Order Tracking Sub-route
router.get('/:id/tracking', optionalAuth, trackingController.getOrderTracking);

// Order Details & Actions
router.get('/:id', authenticate, orderController.getOrderById);
router.post('/:id/cancel', authenticate, orderController.cancelOrder);
router.post('/:id/payments', authenticate, paymentController.submitPayment);

// Admin Status Updates
router.patch('/admin/:id/status', authenticate, requireRole('admin', 'staff'), orderController.updateOrderStatus);
router.patch('/:id/status', authenticate, requireRole('admin', 'staff'), orderController.updateOrderStatus);

module.exports = router;
