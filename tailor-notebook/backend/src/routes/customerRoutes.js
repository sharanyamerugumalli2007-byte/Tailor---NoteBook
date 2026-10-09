const router = require('express').Router();
const c = require('../controllers/customerController');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate, idParam } = require('../middleware/validationMiddleware');
const v = require('../validators/customerValidator');

router.get('/', validate(v.list, 'query'), c.list);
router.post('/', validate(v.customer), c.create);
router.get('/:id', idParam(), c.get);
router.put('/:id', idParam(), validate(v.customer), c.update);
router.delete('/:id', idParam(), requireRole('admin'), c.remove);
router.get('/:id/history', idParam(), c.history);

module.exports = router;
