const express = require('express');
const router = express.Router();
const {
  calculatePrice,
  createBooking,
  getUserBookings,
  getCustomerSummary,
  getAllBookings,
  getBookingById,
  modifyBooking,
  cancelBooking,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public price calculator
router.post('/calculate', calculatePrice);

// Protected routes (Customer, Staff & Admin)
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.get('/customer-summary', protect, getCustomerSummary);
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, modifyBooking);
router.put('/:id/cancel', protect, cancelBooking);

// Admin & Staff operations
router.get('/', protect, authorize('Admin', 'Staff'), getAllBookings);
router.put('/:id/status', protect, authorize('Admin', 'Staff'), updateBookingStatus);

module.exports = router;
