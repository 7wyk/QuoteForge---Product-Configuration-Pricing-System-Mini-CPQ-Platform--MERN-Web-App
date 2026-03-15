const User = require('../models/User');
const PricingRule = require('../models/PricingRule');
const Product = require('../models/Product');
const Quote = require('../models/Quote');

/** GET /api/admin/users */
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/admin/users/:id */
const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(role && { role }), ...(isActive !== undefined && { isActive }) },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/** GET /api/admin/rules */
const getRules = async (req, res) => {
  try {
    const rules = await PricingRule.find().populate('productId', 'name').sort({ priority: -1 });
    res.json({ success: true, data: rules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/admin/rules */
const createRule = async (req, res) => {
  try {
    const rule = await PricingRule.create(req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/** PUT /api/admin/rules/:id */
const updateRule = async (req, res) => {
  try {
    const rule = await PricingRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rule) return res.status(404).json({ success: false, message: 'Rule not found.' });
    res.json({ success: true, data: rule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/** DELETE /api/admin/rules/:id */
const deleteRule = async (req, res) => {
  try {
    await PricingRule.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Rule deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/admin/overview */
const getAdminOverview = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalQuotes, pendingQuotes, approvedRevenue] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Quote.countDocuments(),
      Quote.countDocuments({ status: 'pending' }),
      Quote.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, revenue: { $sum: '$totalPrice' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalQuotes,
        pendingQuotes,
        estimatedRevenue: approvedRevenue[0]?.revenue || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getUsers, updateUser, getRules, createRule, updateRule, deleteRule, getAdminOverview };
