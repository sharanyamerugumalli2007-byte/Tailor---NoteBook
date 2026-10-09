const router = require('express').Router();
const c = require('../controllers/appointmentController');
const { validate, idParam } = require('../middleware/validationMiddleware');
const v = require('../validators/appointmentValidator');

router.get('/', validate(v.list, 'query'), c.list);
router.post('/', validate(v.appointment), c.create);
router.get('/:id', idParam(), c.get);
router.put('/:id', idParam(), validate(v.appointment), c.update);
router.delete('/:id', idParam(), c.remove);
router.patch('/:id/status', idParam(), validate(v.statusPatch), c.updateStatus);

module.exports = router;
