const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const quoteSchema = new mongoose.Schema(
  {
    quoteNumber: { type: String, unique: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      company: { type: String },
      phone: { type: String },
    },
    product: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String, required: true },
      category: { type: String },
    },
    configuration: {
      type: Map,
      of: String,
      default: {},
    },
    basePrice: { type: Number, required: true },
    lineItems: [lineItemSchema],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'draft',
    },
    salesRep: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
      email: { type: String },
    },
    notes: { type: String },
    validUntil: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

// Auto-generate quote number before saving
quoteSchema.pre('save', async function (next) {
  if (!this.quoteNumber) {
    const count = await mongoose.model('Quote').countDocuments();
    const year = new Date().getFullYear();
    this.quoteNumber = `QF-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Quote', quoteSchema);
