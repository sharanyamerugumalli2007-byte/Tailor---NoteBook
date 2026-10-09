const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public catalog viewing
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin / Product Manager protected modifications
router.post('/', authenticate, authorize('admin', 'product_manager'), createProduct);
router.put('/:id', authenticate, authorize('admin', 'product_manager'), updateProduct);
router.delete('/:id', authenticate, authorize('admin', 'product_manager'), deleteProduct);

module.exports = router;
