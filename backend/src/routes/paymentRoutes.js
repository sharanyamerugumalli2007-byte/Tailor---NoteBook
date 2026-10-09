const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Get payments list
router.get('/', authenticate, (req, res, next) => {
  if (req.baseUrl.includes('/admin')) {
    return paymentController.getAdminPayments(req, res, next);
  }
  return paymentController.getCustomerPayments(req, res, next);
});

router.get('/admin/all', authenticate, requireRole('admin', 'staff'), paymentController.getAdminPayments);
router.get('/admin', authenticate, requireRole('admin', 'staff'), paymentController.getAdminPayments);

// Customer Payment Submission
router.post('/orders/:id/payments', authenticate, paymentController.submitPayment);
router.post('/orders/:id', authenticate, paymentController.submitPayment);
router.post('/:orderId', authenticate, (req, res, next) => {
  // If the param is followed by verify or reject, let express router handle those routes instead
  if (req.url.endsWith('/verify') || req.url.endsWith('/reject')) {
    return next();
  }
  return paymentController.submitPayment(req, res, next);
});
router.post('/', authenticate, paymentController.submitPayment);

// Admin Payment Verification and Rejection
router.post('/admin/:id/verify', authenticate, requireRole('admin', 'staff'), paymentController.verifyPayment);
router.post('/admin/:id/reject', authenticate, requireRole('admin', 'staff'), paymentController.rejectPayment);
router.post('/:id/verify', authenticate, requireRole('admin', 'staff'), paymentController.verifyPayment);
router.post('/:id/reject', authenticate, requireRole('admin', 'staff'), paymentController.rejectPayment);

module.exports = router;
