const { query } = require('../config/db');

const BookingModel = {
  // Check overlapping bookings
  async checkOverlap(carId, pickupDate, returnDate, excludeBookingId = null) {
    let sql = `
      SELECT booking_id, pickup_date, return_date, booking_status
      FROM bookings
      WHERE car_id = ?
        AND booking_status IN ('Pending', 'Confirmed', 'Active')
        AND pickup_date <= ?
        AND return_date >= ?
    `;
    const params = [carId, returnDate, pickupDate];

    if (excludeBookingId) {
      sql += ' AND booking_id != ?';
      params.push(excludeBookingId);
    }

    const { rows } = await query(sql, params);
    return rows;
  },

  async create(data) {
    const {
      user_id,
      car_id,
      pickup_location = 'Connaught Place, New Delhi',
      return_location = 'Connaught Place, New Delhi',
      pickup_date,
      return_date,
      rental_days,
      price_per_day,
      subtotal,
      tax,
      discount = 0.00,
      total_amount,
      booking_status = 'Pending',
      special_requests = null
    } = data;

    const result = await query(
      `INSERT INTO bookings
       (user_id, car_id, pickup_location, return_location, pickup_date, return_date, rental_days, price_per_day, subtotal, tax, discount, total_amount, booking_status, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, car_id, pickup_location, return_location, pickup_date, return_date, rental_days, price_per_day, subtotal, tax, discount, total_amount, booking_status, special_requests]
    );
    return result.insertId;
  },

  async getById(id) {
    const sql = `
      SELECT b.*,
             u.name as customer_name, u.email as customer_email, u.phone as customer_phone, u.driving_license,
             c.brand, c.model, c.registration_number, c.year, c.category, c.fuel_type, c.transmission, c.seats, c.image as car_image,
             p.payment_id, p.amount as paid_amount, p.payment_method, p.payment_status, p.transaction_id, p.payment_date
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN cars c ON b.car_id = c.car_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      WHERE b.booking_id = ?
    `;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  },

  async getByUserId(userId) {
    const sql = `
      SELECT b.*,
             c.brand, c.model, c.registration_number, c.category, c.fuel_type, c.transmission, c.image as car_image,
             p.payment_status, p.payment_method, p.transaction_id
      FROM bookings b
      JOIN cars c ON b.car_id = c.car_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      WHERE b.user_id = ?
      ORDER BY b.booking_id DESC
    `;
    const { rows } = await query(sql, [userId]);
    return rows;
  },

  async getAll({ search = '', status = '', startDate = '', endDate = '' } = {}) {
    let sql = `
      SELECT b.*,
             u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
             c.brand, c.model, c.registration_number, c.category, c.image as car_image,
             p.payment_status, p.payment_method, p.transaction_id
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN cars c ON b.car_id = c.car_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ? OR c.brand LIKE ? OR c.model LIKE ? OR c.registration_number LIKE ? OR b.booking_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status && status !== 'ALL') {
      sql += ' AND b.booking_status = ?';
      params.push(status);
    }

    if (startDate) {
      sql += ' AND b.pickup_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND b.return_date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY b.booking_id DESC';
    const { rows } = await query(sql, params);
    return rows;
  },

  async updateStatus(id, status, cancellationReason = null) {
    if (cancellationReason) {
      await query(
        `UPDATE bookings SET booking_status = ?, cancellation_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE booking_id = ?`,
        [status, cancellationReason, id]
      );
    } else {
      await query(
        `UPDATE bookings SET booking_status = ?, updated_at = CURRENT_TIMESTAMP WHERE booking_id = ?`,
        [status, id]
      );
    }
    return this.getById(id);
  },

  async updateBookingDetails(id, data) {
    const {
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
      special_requests
    } = data;

    await query(
      `UPDATE bookings SET
        car_id = ?,
        pickup_location = ?,
        return_location = ?,
        pickup_date = ?,
        return_date = ?,
        rental_days = ?,
        price_per_day = ?,
        subtotal = ?,
        tax = ?,
        discount = ?,
        total_amount = ?,
        special_requests = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = ?`,
      [car_id, pickup_location, return_location, pickup_date, return_date, rental_days, price_per_day, subtotal, tax, discount, total_amount, special_requests, id]
    );

    // Also update payment amount if payment exists
    await query(`UPDATE payments SET amount = ? WHERE booking_id = ?`, [total_amount, id]);

    return this.getById(id);
  },

  async getCustomerSummary(userId) {
    const totalQuery = await query(
      `SELECT
        COUNT(*) as total_bookings,
        COALESCE(SUM(CASE WHEN booking_status NOT IN ('Cancelled', 'Rejected') THEN total_amount ELSE 0 END), 0) as total_spent,
        COALESCE(SUM(CASE WHEN booking_status = 'Completed' THEN 1 ELSE 0 END), 0) as completed_rentals,
        COALESCE(SUM(CASE WHEN booking_status IN ('Active', 'Confirmed', 'Pending') THEN 1 ELSE 0 END), 0) as active_bookings
       FROM bookings WHERE user_id = ?`,
      [userId]
    );

    const activeQuery = await query(
      `SELECT b.*, c.brand, c.model, c.image as car_image, c.registration_number, p.payment_status
       FROM bookings b
       JOIN cars c ON b.car_id = c.car_id
       LEFT JOIN payments p ON b.booking_id = p.booking_id
       WHERE b.user_id = ? AND b.booking_status IN ('Active', 'Confirmed', 'Pending')
       ORDER BY b.booking_id DESC
       LIMIT 1`,
      [userId]
    );

    return {
      stats: totalQuery.rows[0] || { total_bookings: 0, total_spent: 0, completed_rentals: 0, active_bookings: 0 },
      currentBooking: activeQuery.rows[0] || null
    };
  },

  async getAdminStats() {
    // 1. Total cars and availability
    const carStats = await query(`
      SELECT
        COUNT(*) as total_cars,
        COALESCE(SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END), 0) as available_cars,
        COALESCE(SUM(CASE WHEN status = 'Rented' THEN 1 ELSE 0 END), 0) as rented_cars,
        COALESCE(SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END), 0) as maintenance_cars
      FROM cars
    `);

    // 2. Customers and Staff count
    const customerStats = await query(`
      SELECT
        COALESCE(SUM(CASE WHEN role = 'Customer' THEN 1 ELSE 0 END), 0) as total_customers,
        COALESCE(SUM(CASE WHEN role = 'Staff' THEN 1 ELSE 0 END), 0) as total_staff
      FROM users
    `);

    // 3. Bookings and Revenue
    const bookingStats = await query(`
      SELECT
        COUNT(*) as total_bookings,
        COALESCE(SUM(CASE WHEN booking_status = 'Active' THEN 1 ELSE 0 END), 0) as active_rentals,
        COALESCE(SUM(CASE WHEN booking_status = 'Confirmed' THEN 1 ELSE 0 END), 0) as confirmed_bookings,
        COALESCE(SUM(CASE WHEN booking_status = 'Pending' THEN 1 ELSE 0 END), 0) as pending_bookings,
        COALESCE(SUM(CASE WHEN booking_status NOT IN ('Cancelled', 'Rejected') THEN total_amount ELSE 0 END), 0) as total_revenue
      FROM bookings
    `);

    // 4. Monthly revenue & bookings (Grouped by month)
    const monthlyStats = await query(`
      SELECT
        substr(created_at, 1, 7) as month,
        COUNT(booking_id) as booking_count,
        COALESCE(SUM(CASE WHEN booking_status NOT IN ('Cancelled', 'Rejected') THEN total_amount ELSE 0 END), 0) as revenue
      FROM bookings
      GROUP BY substr(created_at, 1, 7)
      ORDER BY month ASC
      LIMIT 6
    `);

    // 5. Recent 5 bookings
    const recentBookings = await query(`
      SELECT b.booking_id, b.pickup_date, b.return_date, b.total_amount, b.booking_status, b.created_at,
             u.name as customer_name,
             c.brand, c.model, c.image as car_image
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN cars c ON b.car_id = c.car_id
      ORDER BY b.booking_id DESC
      LIMIT 5
    `);

    return {
      cars: carStats.rows[0],
      customers: customerStats.rows[0],
      bookings: bookingStats.rows[0],
      monthly: monthlyStats.rows,
      recentBookings: recentBookings.rows
    };
  }
};

module.exports = BookingModel;
