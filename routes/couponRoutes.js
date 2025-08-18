const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getAllCoupons,
  updateCouponCode,
  deleteCoupon,
  verifyCoupon,
} = require('../controllers/couponController');

// Route to create a new coupon
router.post('/', createCoupon);

// Route to get all coupons
router.get('/', getAllCoupons);

// Route to update a coupon's code
router.patch('/:id', updateCouponCode);

// Route to delete a coupon
router.delete('/:id', deleteCoupon);

// Route to verify a coupon and get the discount
router.post('/verify', verifyCoupon);

module.exports = router;
