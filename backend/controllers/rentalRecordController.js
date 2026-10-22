const RentalRecordModel = require('../models/rentalRecordModel');
const BookingModel = require('../models/bookingModel');
const CarModel = require('../models/carModel');
const { query } = require('../config/db');

// Helper to create notifications
const createNotification = async (userId, title, message, type = 'info') => {
  try {
    await query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
      [userId, title, message, type]
    );
  } catch (err) {
    console.warn('Notification insert error:', err.message);
  }
};

// @desc    Get all pickup/return handover records
// @route   GET /api/rental-records
// @access  Private (Staff, Admin)
const getAllRecords = async (req, res, next) => {
  try {
    const records = await RentalRecordModel.getAll();
    res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get confirmed bookings awaiting pickup
// @route   GET /api/rental-records/pending-pickups
// @access  Private (Staff, Admin)
const getPendingPickups = async (req, res, next) => {
  try {
    const pending = await RentalRecordModel.getPendingPickups();
    res.status(200).json({
      success: true,
      count: pending.length,
      bookings: pending
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active rentals awaiting vehicle return
// @route   GET /api/rental-records/active-returns
// @access  Private (Staff, Admin)
const getActiveReturns = async (req, res, next) => {
  try {
    const active = await RentalRecordModel.getActiveReturns();
    res.status(200).json({
      success: true,
      count: active.length,
      bookings: active
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record vehicle handover / pickup
// @route   POST /api/rental-records/pickup
// @access  Private (Staff, Admin)
const processPickup = async (req, res, next) => {
  try {
    const staff_id = req.user.user_id;
    const {
      booking_id,
      pickup_time = new Date().toISOString().replace('T', ' ').substring(0, 19),
      pickup_odometer,
      pickup_condition = 'Normal wear and tear. Pre-handover checklist verified.'
    } = req.body;

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required.'
      });
    }

    const booking = await BookingModel.getById(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    if (booking.booking_status !== 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot process pickup for booking in "${booking.booking_status}" status. Only Confirmed bookings are eligible for handover.`
      });
    }

    // Verify not already picked up
    const existingRecord = await RentalRecordModel.getByBookingId(booking_id);
    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'A pickup record for this booking has already been created.'
      });
    }

    // Insert record
    const recordId = await RentalRecordModel.recordPickup({
      booking_id,
      staff_id,
      pickup_time,
      pickup_odometer: pickup_odometer ? parseInt(pickup_odometer) : 0,
      pickup_condition
    });

    // Update booking status to 'Active'
    await BookingModel.updateStatus(booking_id, 'Active');

    // Update car status to 'Rented'
    await CarModel.updateStatus(booking.car_id, 'Rented');

    // Notify customer
    await createNotification(
      booking.user_id,
      `Vehicle Handover Complete #${booking_id}`,
      `Staff member ${req.user.name} has recorded your vehicle pickup. Initial Odometer: ${pickup_odometer || 'Verified'} km. Have a wonderful trip!`,
      'info'
    );

    res.status(201).json({
      success: true,
      message: `Pickup recorded successfully. Rental #${booking_id} is now Active!`,
      recordId
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record vehicle return & inspection
// @route   POST /api/rental-records/return
// @access  Private (Staff, Admin)
const processReturn = async (req, res, next) => {
  try {
    const staff_id = req.user.user_id;
    const {
      booking_id,
      return_time = new Date().toISOString().replace('T', ' ').substring(0, 19),
      return_odometer,
      return_condition = 'Returned in good condition.',
      damage_reported = false,
      damage_notes = '',
      damage_fee = 0.00,
      additional_charges = 0.00,
      send_to_maintenance = false
    } = req.body;

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required.'
      });
    }

    const booking = await BookingModel.getById(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    if (booking.booking_status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `Cannot process return for booking in "${booking.booking_status}" status. Only Active rentals can be returned.`
      });
    }

    // Update or insert return record
    const existingRecord = await RentalRecordModel.getByBookingId(booking_id);
    if (!existingRecord) {
      // If no prior pickup record was entered, insert one now with return details
      await RentalRecordModel.recordPickup({
        booking_id,
        staff_id,
        pickup_time: booking.pickup_date + ' 09:00:00',
        pickup_odometer: 0,
        pickup_condition: 'Retroactively logged during return'
      });
    }

    await RentalRecordModel.recordReturn(booking_id, {
      return_time,
      return_odometer: return_odometer ? parseInt(return_odometer) : 0,
      return_condition,
      damage_reported,
      damage_notes,
      damage_fee: parseFloat(damage_fee) || 0.00,
      additional_charges: parseFloat(additional_charges) || 0.00
    });

    // Mark booking as Completed
    await BookingModel.updateStatus(booking_id, 'Completed');

    // If extra charges were applied, add them to total_amount
    const extraTotal = (parseFloat(damage_fee) || 0) + (parseFloat(additional_charges) || 0);
    if (extraTotal > 0) {
      await query(
        `UPDATE bookings SET total_amount = total_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE booking_id = ?`,
        [extraTotal, booking_id]
      );
    }

    // Determine Car Operational Status
    if (damage_reported || send_to_maintenance) {
      // Mark car as Maintenance for detailed inspection
      await CarModel.updateStatus(booking.car_id, 'Maintenance');
      // Create maintenance record
      const today = new Date().toISOString().split('T')[0];
      await query(
        `INSERT INTO maintenance (car_id, maintenance_type, description, start_date, cost, status)
         VALUES (?, 'Post-Rental Inspection / Damage Repair', ?, ?, ?, 'In Progress')`,
        [booking.car_id, damage_notes || 'Vehicle flagged with damage during staff return check.', today, parseFloat(damage_fee) || 0.00]
      );
    } else {
      // Mark car as Available
      await CarModel.updateStatus(booking.car_id, 'Available');
    }

    // Notify customer
    await createNotification(
      booking.user_id,
      `Vehicle Return Completed #${booking_id}`,
      `Your rental for ${booking.brand} ${booking.model} has been safely returned and verified by staff member ${req.user.name}. Thank you for choosing RentWheels!`,
      'success'
    );

    res.status(200).json({
      success: true,
      message: `Return recorded successfully. Booking #${booking_id} is marked Completed. Vehicle status set to ${damage_reported || send_to_maintenance ? 'Maintenance' : 'Available'}.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRecords,
  getPendingPickups,
  getActiveReturns,
  processPickup,
  processReturn
};
