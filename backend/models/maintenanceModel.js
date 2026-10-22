const { query } = require('../config/db');

const MaintenanceModel = {
  async getAll({ car_id = '', status = '' } = {}) {
    let sql = `
      SELECT m.*,
             c.brand, c.model, c.registration_number, c.status as car_status
      FROM maintenance m
      JOIN cars c ON m.car_id = c.car_id
      WHERE 1=1
    `;
    const params = [];

    if (car_id) {
      sql += ' AND m.car_id = ?';
      params.push(car_id);
    }

    if (status) {
      sql += ' AND m.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY m.maintenance_id DESC';
    const { rows } = await query(sql, params);
    return rows;
  },

  async getById(id) {
    const sql = `
      SELECT m.*, c.brand, c.model, c.registration_number
      FROM maintenance m
      JOIN cars c ON m.car_id = c.car_id
      WHERE m.maintenance_id = ?
    `;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { car_id, maintenance_type, description, start_date, end_date = null, cost = 0.00, status = 'Scheduled' } = data;

    const result = await query(
      `INSERT INTO maintenance (car_id, maintenance_type, description, start_date, end_date, cost, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [car_id, maintenance_type, description, start_date, end_date, cost, status]
    );

    // If status is In Progress or Scheduled currently active, set car status to Maintenance
    if (status === 'In Progress') {
      await query('UPDATE cars SET status = "Maintenance" WHERE car_id = ?', [car_id]);
    }

    return result.insertId;
  },

  async update(id, data) {
    const { car_id, maintenance_type, description, start_date, end_date, cost, status } = data;

    await query(
      `UPDATE maintenance SET
        car_id = ?,
        maintenance_type = ?,
        description = ?,
        start_date = ?,
        end_date = ?,
        cost = ?,
        status = ?
       WHERE maintenance_id = ?`,
      [car_id, maintenance_type, description, start_date, end_date, cost, status, id]
    );

    if (status === 'In Progress') {
      await query('UPDATE cars SET status = "Maintenance" WHERE car_id = ?', [car_id]);
    } else if (status === 'Completed') {
      // Check if any other in-progress maintenance exists for this car
      const { rows } = await query('SELECT COUNT(*) as count FROM maintenance WHERE car_id = ? AND status = "In Progress" AND maintenance_id != ?', [car_id, id]);
      if (rows[0].count === 0) {
        await query('UPDATE cars SET status = "Available" WHERE car_id = ?', [car_id]);
      }
    }

    return this.getById(id);
  },

  async delete(id) {
    const record = await this.getById(id);
    await query('DELETE FROM maintenance WHERE maintenance_id = ?', [id]);
    if (record && record.car_id) {
      // Re-evaluate car status
      const { rows } = await query('SELECT COUNT(*) as count FROM maintenance WHERE car_id = ? AND status = "In Progress"', [record.car_id]);
      if (rows[0].count === 0) {
        // If not rented, restore to Available
        await query('UPDATE cars SET status = "Available" WHERE car_id = ? AND status = "Maintenance"', [record.car_id]);
      }
    }
  }
};

module.exports = MaintenanceModel;
