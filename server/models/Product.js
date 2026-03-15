const mongoose = require('mongoose');

/**
 * Each attribute has:
 *  - name: display name (e.g. "voltage")
 *  - type: "select" | "toggle"
 *  - options: array of { label, value, priceImpact }
 *  - required: boolean
 */
const attributeOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    priceImpact: { type: Number, default: 0 },
  },
  { _id: false }
);

const attributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    displayName: { type: String, required: true },
    type: { type: String, enum: ['select', 'toggle'], default: 'select' },
    options: [attributeOptionSchema],
    required: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, default: 'Industrial' },
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    attributes: [attributeSchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
