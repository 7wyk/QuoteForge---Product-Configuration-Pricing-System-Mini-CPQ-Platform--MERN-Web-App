const Quote = require('../models/Quote');
const Product = require('../models/Product');
const PricingRule = require('../models/PricingRule');
const { evaluateRules } = require('../services/pricingEngine');
const { generateQuotePDF } = require('../services/pdfService');

/** POST /api/quotes */
const createQuote = async (req, res) => {
  try {
    const { customer, productId, configuration, notes } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const rules = await PricingRule.find({
      $or: [{ productId }, { productId: null }],
      isActive: true,
    });

    const { totalAdded, appliedRules } = evaluateRules(configuration || {}, rules);
    const totalPrice = product.basePrice + totalAdded;

    const lineItems = appliedRules.map((r) => ({
      description: r.description || r.name,
      amount: r.addedPrice,
    }));

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    const quote = await Quote.create({
      customer,
      product: { id: product._id, name: product.name, category: product.category },
      configuration,
      basePrice: product.basePrice,
      lineItems,
      totalPrice,
      salesRep: { id: req.user._id, name: req.user.name, email: req.user.email },
      notes,
      validUntil,
    });

    res.status(201).json({ success: true, data: quote });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/** GET /api/quotes */
const getQuotes = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { 'salesRep.id': req.user._id };
    const { status, page = 1, limit = 20 } = req.query;
    if (status) filter.status = status;

    const total = await Quote.countDocuments(filter);
    const quotes = await Quote.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: quotes, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/quotes/:id */
const getQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found.' });

    // Sales users can only view their own quotes
    if (req.user.role === 'sales' && String(quote.salesRep?.id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: quote });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/quotes/:id/status */
const updateQuoteStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const allowed = ['draft', 'pending', 'approved', 'rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found.' });

    // Only admin can approve/reject
    if (['approved', 'rejected'].includes(status) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can approve or reject quotes.' });
    }

    quote.status = status;
    if (status === 'approved') quote.approvedBy = req.user._id;
    if (status === 'rejected') quote.rejectionReason = rejectionReason || '';
    await quote.save();

    res.json({ success: true, data: quote });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/quotes/:id/pdf */
const downloadQuotePDF = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found.' });

    const pdfBuffer = await generateQuotePDF(quote);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${quote.quoteNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/quotes/stats  (admin) */
const getQuoteStats = async (req, res) => {
  try {
    const [statusCounts, recentQuotes] = await Promise.all([
      Quote.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } }]),
      Quote.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: '$totalPrice' },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
    ]);

    const stats = { draft: 0, pending: 0, approved: 0, rejected: 0, totalRevenue: 0, totalQuotes: 0 };
    statusCounts.forEach((s) => {
      stats[s._id] = s.count;
      stats.totalRevenue += s._id === 'approved' ? s.revenue : 0;
      stats.totalQuotes += s.count;
    });

    res.json({ success: true, data: { stats, trend: recentQuotes } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createQuote, getQuotes, getQuote, updateQuoteStatus, downloadQuotePDF, getQuoteStats };
