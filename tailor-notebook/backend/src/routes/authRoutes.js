const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const v = require('../validators/authValidator');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again in a few minutes.' },
});

router.post('/login', loginLimiter, validate(v.login), c.login);
router.post('/logout', authenticate, c.logout);
router.get('/me', authenticate, c.me);
router.put('/profile', authenticate, validate(v.profile), c.updateProfile);

module.exports = router;
