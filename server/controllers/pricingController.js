const Product = require('../models/Product');
const PricingRule = require('../models/PricingRule');
const { evaluateRules } = require('../services/pricingEngine');

/**
 * POST /api/pricing/calculate
 * Body: { productId, configuration: { voltage: "220", material: "copper", ... } }
 */
const calculatePrice = async (req, res) => {
  try {
    const { productId, configuration } = req.body;

    if (!productId || !configuration) {
      return res.status(400).json({ success: false, message: 'productId and configuration are required.' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Fetch product-specific + global rules
    const rules = await PricingRule.find({
      $or: [{ productId }, { productId: null }],
      isActive: true,
    });

    const { totalAdded, appliedRules } = evaluateRules(configuration, rules);
    const totalPrice = product.basePrice + totalAdded;

    res.json({
      success: true,
      data: {
        basePrice: product.basePrice,
        rulesApplied: appliedRules,
        totalAdded,
        totalPrice,
        currency: product.currency || 'INR',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { calculatePrice };
