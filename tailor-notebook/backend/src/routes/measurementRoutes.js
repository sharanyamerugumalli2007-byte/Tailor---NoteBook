const router = require('express').Router();
const c = require('../controllers/measurementController');
const { validate, idParam } = require('../middleware/validationMiddleware');
const { measurement } = require('../validators/measurementValidator');

router.get('/customers/:customerId/measurements', idParam('customerId'), c.listForCustomer);
router.get('/customers/:customerId/measurements/history', idParam('customerId'), c.listForCustomer);
router.post('/customers/:customerId/measurements', idParam('customerId'), validate(measurement), c.create);
router.get('/measurements/:id', idParam(), c.get);
router.put('/measurements/:id', idParam(), validate(measurement), c.update);
router.post('/measurements/:id/restore', idParam(), c.restore);

module.exports = router;
