const Coupon = require('../models/couponModel');

// @desc    Create a new coupon
// @route   POST /api/coupons
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountPercentage } = req.body;

    if (!code || !discountPercentage) {
      return res.status(400).json({ message: 'Please provide a code and discount percentage.' });
    }

    const newCoupon = new Coupon({ code, discountPercentage });
    await newCoupon.save();

    res.status(201).json({ message: 'Coupon created successfully!', coupon: newCoupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Coupon code already exists.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// @desc    Update a coupon's code
// @route   PATCH /api/coupons/:id
exports.updateCouponCode = async (req, res) => {
  try {
    const { code } = req.body;
    const { id } = req.params;

    if (!code) {
      return res.status(400).json({ message: 'Please provide the new coupon code.' });
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      { code: code.toUpperCase() },
      { new: true, runValidators: true }
    );

    if (!updatedCoupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }

    res.status(200).json({ message: 'Coupon code updated successfully!', coupon: updatedCoupon });
  } catch (error) {
     if (error.code === 11000) {
      return res.status(409).json({ message: 'New coupon code already exists.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }

    res.status(200).json({ message: 'Coupon deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify a coupon and calculate the discount
// @route   POST /api/coupons/verify
// 
exports.verifyCoupon = async (req, res) => {
  try {
    const { code, originalPrice } = req.body;

    if (!code || originalPrice === undefined) {
      return res.status(400).json({ message: 'Please provide coupon code and original price.' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code.' });
    }

    const discountAmount = (originalPrice * coupon.discountPercentage) / 100;
    const finalPrice = originalPrice - discountAmount;

    res.status(200).json({
      message: 'Coupon applied successfully!',
      discountPercentage: coupon.discountPercentage,
      originalPrice,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalPrice: parseFloat(finalPrice.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
