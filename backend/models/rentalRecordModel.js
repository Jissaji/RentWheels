const { query } = require('../config/db');

const RentalRecordModel = {
  async getAll() {
    const sql = `
      SELECT r.*,
             b.pickup_date as booked_pickup, b.return_date as booked_return, b.total_amount, b.booking_status,
             b.pickup_location, b.return_location,
             u.name as customer_name, u.email as customer_email, u.phone as customer_phone, u.driving_license,
             s.name as staff_name, s.email as staff_email,
             c.car_id, c.brand, c.model, c.registration_number, c.image as car_image
      FROM pickup_return_records r
      JOIN bookings b ON r.booking_id = b.booking_id
      JOIN users u ON b.user_id = u.user_id
      JOIN users s ON r.staff_id = s.user_id
      JOIN cars c ON b.car_id = c.car_id
      ORDER BY r.record_id DESC
    `;
    const { rows } = await query(sql);
    return rows;
  },

  async getByBookingId(bookingId) {
    const sql = `
      SELECT r.*,
             s.name as staff_name, s.email as staff_email
      FROM pickup_return_records r
      JOIN users s ON r.staff_id = s.user_id
      WHERE r.booking_id = ?
      ORDER BY r.record_id DESC
      LIMIT 1
    `;
    const { rows } = await query(sql, [bookingId]);
    return rows[0] || null;
  },

  async getPendingPickups() {
    const sql = `
      SELECT b.*,
             u.name as customer_name, u.email as customer_email, u.phone as customer_phone, u.driving_license,
             c.brand, c.model, c.registration_number, c.image as car_image, c.fuel_type, c.mileage,
             p.payment_status, p.payment_method
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN cars c ON b.car_id = c.car_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      WHERE b.booking_status = 'Confirmed'
      ORDER BY b.pickup_date ASC, b.booking_id ASC
    `;
    const { rows } = await query(sql);
    return rows;
  },

  async getActiveReturns() {
    const sql = `
      SELECT b.*,
             u.name as customer_name, u.email as customer_email, u.phone as customer_phone, u.driving_license,
             c.brand, c.model, c.registration_number, c.image as car_image, c.fuel_type, c.mileage,
             p.payment_status, p.payment_method,
             r.record_id, r.pickup_time, r.pickup_odometer, r.pickup_condition,
             s.name as pickup_staff_name
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN cars c ON b.car_id = c.car_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      LEFT JOIN pickup_return_records r ON b.booking_id = r.booking_id
      LEFT JOIN users s ON r.staff_id = s.user_id
      WHERE b.booking_status = 'Active'
      ORDER BY b.return_date ASC, b.booking_id ASC
    `;
    const { rows } = await query(sql);
    return rows;
  },

  async recordPickup({ booking_id, staff_id, pickup_time, pickup_odometer, pickup_condition }) {
    const result = await query(
      `INSERT INTO pickup_return_records
        (booking_id, staff_id, pickup_time, pickup_odometer, pickup_condition, status)
       VALUES (?, ?, ?, ?, ?, 'Picked_Up')`,
      [booking_id, staff_id, pickup_time, pickup_odometer, pickup_condition]
    );
    return result.insertId;
  },

  async recordReturn(booking_id, { return_time, return_odometer, return_condition, damage_reported, damage_notes, damage_fee, additional_charges }) {
    await query(
      `UPDATE pickup_return_records SET
        return_time = ?,
        return_odometer = ?,
        return_condition = ?,
        damage_reported = ?,
        damage_notes = ?,
        damage_fee = ?,
        additional_charges = ?,
        status = 'Returned',
        updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = ?`,
      [return_time, return_odometer, return_condition, damage_reported ? 1 : 0, damage_notes || null, damage_fee || 0.00, additional_charges || 0.00, booking_id]
    );
    return this.getByBookingId(booking_id);
  }
};

module.exports = RentalRecordModel;
