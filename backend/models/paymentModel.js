const { query } = require('../config/db');

const PaymentModel = {
  async create({ booking_id, amount, payment_method = 'UPI', payment_status = 'Paid', transaction_id = null }) {
    const txnId = transaction_id || `TXN-${payment_method.toUpperCase()}-${Date.now().toString().slice(-7)}`;
    const result = await query(
      `INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id)
       VALUES (?, ?, ?, ?, ?)`,
      [booking_id, amount, payment_method, payment_status, txnId]
    );
    return { payment_id: result.insertId, transaction_id: txnId };
  },

  async getAll({ search = '', method = '', status = '' } = {}) {
    let sql = `
      SELECT p.*,
             b.user_id, b.pickup_date, b.return_date, b.total_amount as booking_total,
             u.name as customer_name, u.email as customer_email,
             c.brand as car_brand, c.model as car_model
      FROM payments p
      JOIN bookings b ON p.booking_id = b.booking_id
      JOIN users u ON b.user_id = u.user_id
      JOIN cars c ON b.car_id = c.car_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ? OR p.transaction_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (method) {
      sql += ' AND p.payment_method = ?';
      params.push(method);
    }

    if (status) {
      sql += ' AND p.payment_status = ?';
      params.push(status);
    }

    sql += ' ORDER BY p.payment_id DESC';
    const { rows } = await query(sql, params);
    return rows;
  },

  async getByBookingId(bookingId) {
    const { rows } = await query('SELECT * FROM payments WHERE booking_id = ?', [bookingId]);
    return rows[0] || null;
  },

  async updateStatus(paymentId, status) {
    await query('UPDATE payments SET payment_status = ? WHERE payment_id = ?', [status, paymentId]);
    const { rows } = await query('SELECT * FROM payments WHERE payment_id = ?', [paymentId]);
    return rows[0] || null;
  }
};

module.exports = PaymentModel;
