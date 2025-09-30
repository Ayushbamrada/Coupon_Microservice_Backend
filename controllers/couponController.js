const Coupon = require('../models/couponModel');

// @desc    Create a new coupon
// @route   POST /api/coupons
exports.createCoupon = async (req, res) => {
  try {
    // We now look for 'validForProducts' in the request body.
    const { code, discountPercentage, validForProducts } = req.body;

    if (!code || !discountPercentage) {
      return res.status(400).json({ message: 'Please provide a code and discount percentage.' });
    }

    // Create the new coupon with all the provided details.
    // If validForProducts is not provided, it will default to an empty array.
    const newCoupon = new Coupon({ code, discountPercentage, validForProducts });
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
  } catch (error)
{
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify a coupon and calculate the discount based on cart items
// @route   POST /api/coupons/verify
exports.verifyCoupon = async (req, res) => {
  try {
    // We now expect 'cartItems' instead of 'originalPrice'.
    const { code, cartItems } = req.body;

    if (!code || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Please provide a coupon code and a valid list of cart items.' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code.' });
    }

    let originalPrice = 0;
    let totalDiscount = 0;
    const isProductSpecific = coupon.validForProducts && coupon.validForProducts.length > 0;

    // Check if the coupon is product-specific
    if (isProductSpecific) {
      // --- LOGIC FOR PRODUCT-SPECIFIC COUPON ---
      let eligibleItemFound = false;
      
      // Loop through each item in the user's cart
      cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        originalPrice += itemTotal; // Add to the total price regardless

        // Check if this item's ID is in the coupon's list of valid products
        if (coupon.validForProducts.includes(item.productId)) {
          eligibleItemFound = true;
          // Calculate discount ONLY for this specific item
          totalDiscount += (itemTotal * coupon.discountPercentage) / 100;
        }
      });

      // If the cart contains none of the eligible products, the coupon is invalid for this cart.
      if (!eligibleItemFound) {
        return res.status(400).json({ message: 'This coupon is not valid for any of the items in your cart.' });
      }

    } else {
      // --- LOGIC FOR A GENERAL, CART-WIDE COUPON ---
      // Loop through cart items to get the total price
      cartItems.forEach(item => {
        originalPrice += item.price * item.quantity;
      });
      // Calculate discount on the entire cart's price
      totalDiscount = (originalPrice * coupon.discountPercentage) / 100;
    }

    const finalPrice = originalPrice - totalDiscount;

    res.status(200).json({
      message: 'Coupon applied successfully!',
      discountPercentage: coupon.discountPercentage,
      originalPrice: parseFloat(originalPrice.toFixed(2)),
      discountAmount: parseFloat(totalDiscount.toFixed(2)),
      finalPrice: parseFloat(finalPrice.toFixed(2)),
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
