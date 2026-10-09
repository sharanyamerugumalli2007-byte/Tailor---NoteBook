const router = require('express').Router();
const c = require('../controllers/notificationController');
const { idParam } = require('../middleware/validationMiddleware');

router.get('/', c.list);
router.patch('/read-all', c.markAllRead); // must be declared before /:id
router.patch('/:id/read', idParam(), c.markRead);

module.exports = router;
