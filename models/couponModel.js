const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 99,
  },
  // This is the new, important field.
  // It holds an array of product IDs (or SKUs) the coupon is valid for.
  // If the array is empty, the coupon applies to the whole cart.
  validForProducts: {
    type: [String],
    default: [], // Defaults to an empty array, making it a cart-wide coupon by default.
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
