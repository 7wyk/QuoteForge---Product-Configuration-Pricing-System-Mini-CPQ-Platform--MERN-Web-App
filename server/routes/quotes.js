const express = require('express');
const {
  createQuote,
  getQuotes,
  getQuote,
  updateQuoteStatus,
  downloadQuotePDF,
  getQuoteStats,
} = require('../controllers/quoteController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(authenticate);

router.get('/stats', requireRole('admin'), getQuoteStats);
router.get('/', getQuotes);
router.get('/:id', getQuote);
router.get('/:id/pdf', downloadQuotePDF);
router.post('/', createQuote);
router.put('/:id/status', updateQuoteStatus);

module.exports = router;
