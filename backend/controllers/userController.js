const UserModel = require('../models/userModel');
const BookingModel = require('../models/bookingModel');

// @desc    Get all customers / users
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;
    const users = await UserModel.getAll({ search, role, status });
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer details + booking history
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    const bookings = await BookingModel.getByUserId(req.params.id);

    res.status(200).json({
      success: true,
      user,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate or deactivate customer account
// @route   PUT /api/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Active, Inactive, or Suspended.'
      });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (user.role === 'Admin' && status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'System Administrator accounts cannot be deactivated.'
      });
    }

    const updated = await UserModel.updateStatus(id, status);
    res.status(200).json({
      success: true,
      message: `Account status updated to ${status}.`,
      user: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus
};
