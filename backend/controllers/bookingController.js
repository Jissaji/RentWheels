const BookingModel = require('../models/bookingModel');
const CarModel = require('../models/carModel');
const PaymentModel = require('../models/paymentModel');
const { query } = require('../config/db');

// Helper to format date YYYY-MM-DD
const getTodayString = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

// Helper to create notifications
const createNotification = async (userId, title, message, type = 'info') => {
  try {
    await query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
      [userId, title, message, type]
    );
  } catch (err) {
    console.warn('Could not insert notification:', err.message);
  }
};

// @desc    Calculate price breakdown preview
// @route   POST /api/bookings/calculate
// @access  Public
const calculatePrice = async (req, res, next) => {
  try {
    const { car_id, pickup_date, return_date } = req.body;

    if (!car_id || !pickup_date || !return_date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide car_id, pickup_date, and return_date.'
      });
    }

    const car = await CarModel.getById(car_id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found.'
      });
    }

    const start = new Date(pickup_date);
    const end = new Date(return_date);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'Return date cannot be earlier than pickup date.'
      });
    }

    const diffTime = Math.abs(end - start);
    const rental_days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const price_per_day = parseFloat(car.price_per_day);
    const subtotal = Math.round(rental_days * price_per_day * 100) / 100;
    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST

    let discount = 0;
    if (rental_days >= 7) {
      discount = 800.00;
    } else if (rental_days >= 3) {
      discount = 300.00;
    }

    const total_amount = Math.max(0, Math.round((subtotal + tax - discount) * 100) / 100);

    res.status(200).json({
      success: true,
      calculation: {
        car_id,
        brand: car.brand,
        model: car.model,
        pickup_date,
        return_date,
        rental_days,
        price_per_day,
        subtotal,
        tax,
        discount,
        total_amount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const {
      car_id,
      pickup_location = 'Connaught Place, New Delhi',
      return_location = 'Connaught Place, New Delhi',
      pickup_date,
      return_date,
      payment_method = 'UPI',
      special_requests = null
    } = req.body;

    // 1. Validation
    if (!car_id || !pickup_date || !return_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing mandatory booking parameters: car_id, pickup_date, and return_date are required.'
      });
    }

    const todayStr = getTodayString();
    if (pickup_date < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Pickup date cannot be in the past.'
      });
    }

    if (return_date < pickup_date) {
      return res.status(400).json({
        success: false,
        message: 'Return date cannot be earlier than pickup date.'
      });
    }

    // 2. Check car existence and status
    const car = await CarModel.getById(car_id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found.'
      });
    }

    if (car.status === 'Maintenance') {
      return res.status(400).json({
        success: false,
        message: 'This vehicle is currently undergoing maintenance and is not available for booking.'
      });
    }

    if (car.status === 'Inactive') {
      return res.status(400).json({
        success: false,
        message: 'This vehicle is deactivated from the active fleet.'
      });
    }

    // 3. Recheck overlapping booking immediately before booking
    const overlapping = await BookingModel.checkOverlap(car_id, pickup_date, return_date);
    if (overlapping.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This car is already booked by another customer for the selected dates. Please choose different dates or select another car.'
      });
    }

    // 4. Calculate prices dynamically using database price
    const start = new Date(pickup_date);
    const end = new Date(return_date);
    const diffTime = Math.abs(end - start);
    const rental_days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const price_per_day = parseFloat(car.price_per_day);
    const subtotal = Math.round(rental_days * price_per_day * 100) / 100;
    const tax = Math.round(subtotal * 0.18 * 100) / 100;

    let discount = 0;
    if (rental_days >= 7) {
      discount = 800.00;
    } else if (rental_days >= 3) {
      discount = 300.00;
    }

    const total_amount = Math.max(0, Math.round((subtotal + tax - discount) * 100) / 100);

    // 5. Create booking record in database
    const booking_id = await BookingModel.create({
      user_id,
      car_id,
      pickup_location,
      return_location,
      pickup_date,
      return_date,
      rental_days,
      price_per_day,
      subtotal,
      tax,
      discount,
      total_amount,
      booking_status: 'Confirmed', // Automatically confirmed upon payment
      special_requests
    });

    // 6. Create simulated payment transaction
    const payment = await PaymentModel.create({
      booking_id,
      amount: total_amount,
      payment_method,
      payment_status: payment_method === 'Cash' ? 'Pending' : 'Paid'
    });

    // 7. Create in-app notification for the customer
    await createNotification(
      user_id,
      `Booking Confirmed #${booking_id}`,
      `Your reservation for ${car.brand} ${car.model} (${pickup_date} to ${return_date}) is confirmed! Pickup at: ${pickup_location}.`,
      'success'
    );

    const fullBooking = await BookingModel.getById(booking_id);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully! Your reservation has been placed.',
      booking_id,
      transaction_id: payment.transaction_id,
      booking: fullBooking,
      emailStatus: {
        sent: false,
        note: 'SMTP email server is not configured in this environment. In-app confirmation notification was delivered successfully.'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings of the logged-in user
// @route   GET /api/bookings/my-bookings
// @access  Private
const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await BookingModel.getByUserId(req.user.user_id);
    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer dashboard metrics
// @route   GET /api/bookings/customer-summary
// @access  Private
const getCustomerSummary = async (req, res, next) => {
  try {
    const summary = await BookingModel.getCustomerSummary(req.user.user_id);
    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin/Staff)
// @route   GET /api/bookings
// @access  Private (Admin, Staff)
const getAllBookings = async (req, res, next) => {
  try {
    const { search, status, startDate, endDate } = req.query;
    const bookings = await BookingModel.getAll({ search, status, startDate, endDate });
    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await BookingModel.getById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Role verification: Customer can only view their own booking
    if (req.user.role !== 'Admin' && req.user.role !== 'Staff' && booking.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this booking record.'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Modify eligible booking details (Admin or Customer before pickup)
// @route   PUT /api/bookings/:id
// @access  Private
const modifyBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      car_id,
      pickup_location,
      return_location,
      pickup_date,
      return_date,
      special_requests
    } = req.body;

    const existing = await BookingModel.getById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Role verification
    if (req.user.role !== 'Admin' && existing.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to modify this booking.'
      });
    }

    // Only allow modifying Pending or Confirmed bookings
    if (!['Pending', 'Confirmed'].includes(existing.booking_status)) {
      return res.status(400).json({
        success: false,
        message: `Bookings in status "${existing.booking_status}" cannot be modified.`
      });
    }

    const targetCarId = car_id || existing.car_id;
    const targetPickup = pickup_date || existing.pickup_date;
    const targetReturn = return_date || existing.return_date;

    if (targetReturn < targetPickup) {
      return res.status(400).json({
        success: false,
        message: 'Return date cannot be earlier than pickup date.'
      });
    }

    // Check car
    const car = await CarModel.getById(targetCarId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Selected car not found.'
      });
    }

    if (car.status === 'Maintenance' || car.status === 'Inactive') {
      return res.status(400).json({
        success: false,
        message: `This vehicle is currently ${car.status.toLowerCase()} and cannot be selected.`
      });
    }

    // Recheck availability for target car and dates excluding current booking
    const overlapping = await BookingModel.checkOverlap(targetCarId, targetPickup, targetReturn, id);
    if (overlapping.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'The car is not available for the updated date range due to an existing booking.'
      });
    }

    // Calculate new price
    const start = new Date(targetPickup);
    const end = new Date(targetReturn);
    const diffTime = Math.abs(end - start);
    const rental_days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const price_per_day = parseFloat(car.price_per_day);
    const subtotal = Math.round(rental_days * price_per_day * 100) / 100;
    const tax = Math.round(subtotal * 0.18 * 100) / 100;

    let discount = 0;
    if (rental_days >= 7) {
      discount = 800.00;
    } else if (rental_days >= 3) {
      discount = 300.00;
    }

    const total_amount = Math.max(0, Math.round((subtotal + tax - discount) * 100) / 100);

    const updated = await BookingModel.updateBookingDetails(id, {
      car_id: targetCarId,
      pickup_location: pickup_location || existing.pickup_location,
      return_location: return_location || existing.return_location,
      pickup_date: targetPickup,
      return_date: targetReturn,
      rental_days,
      price_per_day,
      subtotal,
      tax,
      discount,
      total_amount,
      special_requests: special_requests !== undefined ? special_requests : existing.special_requests
    });

    // Notify customer
    await createNotification(
      existing.user_id,
      `Booking #${id} Updated`,
      `Your reservation has been updated to ${car.brand} ${car.model} for ${targetPickup} to ${targetReturn}. Total amount: ₹${total_amount}.`,
      'info'
    );

    res.status(200).json({
      success: true,
      message: 'Booking details successfully updated and price re-calculated.',
      booking: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    const booking = await BookingModel.getById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Role permission
    if (req.user.role !== 'Admin' && booking.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this booking.'
      });
    }

    if (booking.booking_status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled.'
      });
    }

    if (booking.booking_status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed bookings cannot be cancelled.'
      });
    }

    const updatedBooking = await BookingModel.updateStatus(id, 'Cancelled', reason);

    // Update payment status if paid
    await query('UPDATE payments SET payment_status = "Refunded" WHERE booking_id = ?', [id]);

    // Check if car status was 'Rented', return to 'Available'
    const car = await CarModel.getById(booking.car_id);
    if (car && car.status === 'Rented') {
      const activeCount = await BookingModel.checkOverlap(booking.car_id, getTodayString(), getTodayString(), id);
      if (activeCount.length === 0) {
        await CarModel.updateStatus(booking.car_id, 'Available');
      }
    }

    // Notify customer
    await createNotification(
      booking.user_id,
      `Booking #${id} Cancelled`,
      `Your reservation has been cancelled. Any pre-paid charges have been marked for refund. Reason: ${reason}`,
      'danger'
    );

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Admin/Staff: Approve, Reject, Active, Completed)
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin, Staff)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const booking = await BookingModel.getById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    const updatedBooking = await BookingModel.updateStatus(id, status, reason);

    // Synchronize car status
    if (status === 'Active') {
      await CarModel.updateStatus(booking.car_id, 'Rented');
    } else if (status === 'Completed' || status === 'Cancelled' || status === 'Rejected') {
      const car = await CarModel.getById(booking.car_id);
      if (car && car.status === 'Rented') {
        const today = getTodayString();
        const activeRentals = await BookingModel.checkOverlap(booking.car_id, today, today, id);
        if (activeRentals.length === 0) {
          await CarModel.updateStatus(booking.car_id, 'Available');
        }
      }
    }

    // Notify customer
    await createNotification(
      booking.user_id,
      `Booking #${id} Status: ${status}`,
      `Your reservation status has been updated to "${status}". ${reason ? 'Note: ' + reason : ''}`,
      status === 'Confirmed' || status === 'Completed' ? 'success' : status === 'Active' ? 'info' : 'warning'
    );

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculatePrice,
  createBooking,
  getUserBookings,
  getCustomerSummary,
  getAllBookings,
  getBookingById,
  modifyBooking,
  cancelBooking,
  updateBookingStatus
};
