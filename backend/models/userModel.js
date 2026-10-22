const { query } = require('../config/db');

const UserModel = {
  async findByEmail(email) {
    const { rows } = await query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query(
      'SELECT user_id, name, email, phone, role, status, address, driving_license, created_at, updated_at FROM users WHERE user_id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, password, phone, role = 'Customer', address = null, driving_license = null }) {
    const result = await query(
      `INSERT INTO users (name, email, password, phone, role, status, address, driving_license)
       VALUES (?, ?, ?, ?, ?, 'Active', ?, ?)`,
      [name, email, password, phone, role, address, driving_license]
    );
    return result.insertId;
  },

  async update(id, { name, phone, address, driving_license }) {
    await query(
      `UPDATE users SET name = ?, phone = ?, address = ?, driving_license = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [name, phone, address, driving_license, id]
    );
    return this.findById(id);
  },

  async updatePassword(id, hashedPassword) {
    await query(
      `UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [hashedPassword, id]
    );
  },

  async updateStatus(id, status) {
    await query(
      `UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [status, id]
    );
    return this.findById(id);
  },

  async getAll({ search = '', role = '', status = '' } = {}) {
    let sql = `
      SELECT u.user_id, u.name, u.email, u.phone, u.role, u.status, u.address, u.driving_license, u.created_at,
             COUNT(b.booking_id) as total_bookings,
             COALESCE(SUM(CASE WHEN b.booking_status NOT IN ('Cancelled', 'Rejected') THEN b.total_amount ELSE 0 END), 0) as total_spent
      FROM users u
      LEFT JOIN bookings b ON u.user_id = b.user_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      sql += ` AND u.role = ?`;
      params.push(role);
    }

    if (status) {
      sql += ` AND u.status = ?`;
      params.push(status);
    }

    sql += ` GROUP BY u.user_id ORDER BY u.user_id DESC`;
    const { rows } = await query(sql, params);
    return rows;
  }
};

module.exports = UserModel;
