const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, measurementController.getCustomerMeasurements);
router.get('/:id', authenticate, measurementController.getMeasurementById);
router.post('/', authenticate, measurementController.createMeasurement);
router.put('/:id', authenticate, measurementController.updateMeasurement);
router.delete('/:id', authenticate, measurementController.deleteMeasurement);

module.exports = router;
