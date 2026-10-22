const express = require('express');
const router = express.Router();
const {
  getAllPayments,
  processPayment,
  updatePaymentStatus
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, processPayment);
router.get('/', protect, authorize('Admin'), getAllPayments);
router.put('/:id', protect, authorize('Admin'), updatePaymentStatus);

module.exports = router;
