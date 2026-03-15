const mongoose = require('mongoose');

/**
 * Pricing Rule structure:
 *  condition: { field, operator, value }
 *  e.g. { field: "voltage", operator: ">", value: "200" }
 *  addedPrice: number added when condition is true
 */
const pricingRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null, // null = global rule
    },
    condition: {
      field: { type: String, required: true },
      operator: {
        type: String,
        enum: ['>', '<', '==', '!=', '>=', '<=', 'includes'],
        required: true,
      },
      value: { type: String, required: true },
    },
    addedPrice: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingRule', pricingRuleSchema);
