const express = require('express');
const router = express.Router();
const {
  getAllCars,
  getFeaturedCars,
  getCarById,
  checkAvailability,
  getCarBookingHistory,
  createCar,
  updateCar,
  deleteCar
} = require('../controllers/carController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/', getAllCars);
router.get('/featured', getFeaturedCars);
router.get('/:id', getCarById);
router.get('/:id/check-availability', checkAvailability);

// Admin / Staff endpoints
router.get('/:id/bookings', protect, authorize('Admin', 'Staff'), getCarBookingHistory);

// Admin endpoints
router.post('/', protect, authorize('Admin'), createCar);
router.put('/:id', protect, authorize('Admin'), updateCar);
router.delete('/:id', protect, authorize('Admin'), deleteCar);

module.exports = router;
