const router = require('express').Router();
const c = require('../controllers/pdfController');
const { idParam } = require('../middleware/validationMiddleware');

router.get('/measurements/:customerId', idParam('customerId'), c.measurements);
router.get('/orders/:orderId', idParam('orderId'), c.order);

module.exports = router;
