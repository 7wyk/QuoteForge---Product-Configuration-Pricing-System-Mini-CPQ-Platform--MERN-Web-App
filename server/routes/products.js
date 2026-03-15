const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(authenticate);

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', requireRole('admin'), createProduct);
router.put('/:id', requireRole('admin'), updateProduct);
router.delete('/:id', requireRole('admin'), deleteProduct);

module.exports = router;
