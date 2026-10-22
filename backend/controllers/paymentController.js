const PaymentModel = require('../models/paymentModel');
const BookingModel = require('../models/bookingModel');

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private (Admin)
const getAllPayments = async (req, res, next) => {
  try {
    const { search, method, status } = req.query;
    const payments = await PaymentModel.getAll({ search, method, status });
    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate or record a payment transaction
// @route   POST /api/payments
// @access  Private
const processPayment = async (req, res, next) => {
  try {
    const { booking_id, amount, payment_method } = req.body;

    if (!booking_id || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and amount are required.'
      });
    }

    const booking = await BookingModel.getById(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    const payment = await PaymentModel.create({
      booking_id,
      amount: parseFloat(amount),
      payment_method: payment_method || 'UPI',
      payment_status: 'Paid'
    });

    res.status(201).json({
      success: true,
      message: 'Payment simulated and processed successfully.',
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status (Admin)
// @route   PUT /api/payments/:id
// @access  Private (Admin)
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    if (!['Pending', 'Paid', 'Failed', 'Refunded'].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status.'
      });
    }

    const updated = await PaymentModel.updateStatus(id, payment_status);
    res.status(200).json({
      success: true,
      message: `Payment status updated to ${payment_status}`,
      payment: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPayments,
  processPayment,
  updatePaymentStatus
};
