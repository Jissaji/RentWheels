const BookingModel = require('../models/bookingModel');

// @desc    Get admin dashboard aggregated statistics & charts
// @route   GET /api/stats/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await BookingModel.getAdminStats();
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
