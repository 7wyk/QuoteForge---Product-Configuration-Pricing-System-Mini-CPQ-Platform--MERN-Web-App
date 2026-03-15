const express = require('express');
const { calculatePrice } = require('../controllers/pricingController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.post('/calculate', calculatePrice);

module.exports = router;
