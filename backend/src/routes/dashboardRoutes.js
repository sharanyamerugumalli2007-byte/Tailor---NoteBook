const router = require('express').Router();
const c = require('../controllers/dashboardController');

router.get('/stats', c.stats);
router.get('/recent-orders', c.recentOrders);
router.get('/upcoming-appointments', c.upcomingAppointments);

module.exports = router;
