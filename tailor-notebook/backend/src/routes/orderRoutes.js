const router = require('express').Router();
const c = require('../controllers/orderController');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate, idParam } = require('../middleware/validationMiddleware');
const v = require('../validators/orderValidator');

router.get('/orders', validate(v.list, 'query'), c.list);
router.post('/orders', validate(v.createOrder), c.create);
router.get('/orders/:id', idParam(), c.get);
router.put('/orders/:id', idParam(), validate(v.updateOrder), c.update);
router.delete('/orders/:id', idParam(), requireRole('admin'), c.remove);
router.patch('/orders/:id/status', idParam(), validate(v.statusPatch), c.updateStatus);
router.get('/customers/:customerId/orders', idParam('customerId'), c.forCustomer);

module.exports = router;
