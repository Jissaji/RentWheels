const { query } = require('../config/db');

const CarModel = {
  async getAll({
    search = '',
    brand = '',
    category = '',
    fuel_type = '',
    transmission = '',
    seats = '',
    min_price = '',
    max_price = '',
    status = '',
    pickup_date = '',
    return_date = '',
    sort_by = 'newest'
  } = {}) {
    let sql = 'SELECT * FROM cars WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (brand LIKE ? OR model LIKE ? OR registration_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (brand) {
      sql += ' AND brand = ?';
      params.push(brand);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (fuel_type) {
      sql += ' AND fuel_type = ?';
      params.push(fuel_type);
    }

    if (transmission) {
      sql += ' AND transmission = ?';
      params.push(transmission);
    }

    if (seats) {
      sql += ' AND seats >= ?';
      params.push(parseInt(seats));
    }

    if (min_price) {
      sql += ' AND price_per_day >= ?';
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      sql += ' AND price_per_day <= ?';
      params.push(parseFloat(max_price));
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    // Date-based availability check: only show cars that are not booked in this interval
    if (pickup_date && return_date) {
      sql += ` AND status NOT IN ('Maintenance', 'Inactive')
               AND car_id NOT IN (
                 SELECT car_id FROM bookings
                 WHERE booking_status IN ('Pending', 'Confirmed', 'Active')
                   AND pickup_date <= ?
                   AND return_date >= ?
               )`;
      params.push(return_date, pickup_date);
    }

    switch (sort_by) {
      case 'price_asc':
        sql += ' ORDER BY price_per_day ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY price_per_day DESC';
        break;
      case 'year_desc':
        sql += ' ORDER BY year DESC, car_id DESC';
        break;
      case 'newest':
      default:
        sql += ' ORDER BY car_id DESC';
        break;
    }

    const { rows } = await query(sql, params);
    return rows;
  },

  async getFeatured() {
    const { rows } = await query('SELECT * FROM cars WHERE is_featured = 1 AND status = "Available" LIMIT 8');
    return rows;
  },

  async getById(id) {
    const { rows } = await query('SELECT * FROM cars WHERE car_id = ?', [id]);
    return rows[0] || null;
  },

  async findByRegistrationNumber(regNo) {
    const { rows } = await query('SELECT * FROM cars WHERE registration_number = ?', [regNo]);
    return rows[0] || null;
  },

  async create(data) {
    const {
      brand,
      model,
      registration_number,
      year,
      category = 'Sedan',
      fuel_type,
      transmission,
      seats,
      mileage = '16 km/l',
      price_per_day,
      image,
      description = '',
      status = 'Available',
      is_featured = 0
    } = data;

    const result = await query(
      `INSERT INTO cars (brand, model, registration_number, year, category, fuel_type, transmission, seats, mileage, price_per_day, image, description, status, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [brand, model, registration_number, year, category, fuel_type, transmission, seats, mileage, price_per_day, image, description, status, is_featured ? 1 : 0]
    );
    return result.insertId;
  },

  async update(id, data) {
    const {
      brand,
      model,
      registration_number,
      year,
      category,
      fuel_type,
      transmission,
      seats,
      mileage,
      price_per_day,
      image,
      description,
      status,
      is_featured
    } = data;

    await query(
      `UPDATE cars SET
        brand = ?,
        model = ?,
        registration_number = ?,
        year = ?,
        category = ?,
        fuel_type = ?,
        transmission = ?,
        seats = ?,
        mileage = ?,
        price_per_day = ?,
        image = ?,
        description = ?,
        status = ?,
        is_featured = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE car_id = ?`,
      [brand, model, registration_number, year, category, fuel_type, transmission, seats, mileage, price_per_day, image, description, status, is_featured ? 1 : 0, id]
    );
    return this.getById(id);
  },

  async updateStatus(id, status) {
    await query('UPDATE cars SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE car_id = ?', [status, id]);
    return this.getById(id);
  },

  async countActiveBookings(carId) {
    const { rows } = await query(
      `SELECT COUNT(*) as count FROM bookings WHERE car_id = ? AND booking_status IN ('Pending', 'Confirmed', 'Active')`,
      [carId]
    );
    return rows[0] ? rows[0].count : 0;
  },

  async getBookingsHistory(carId) {
    const { rows } = await query(
      `SELECT b.booking_id, b.pickup_date, b.return_date, b.rental_days, b.total_amount, b.booking_status, b.created_at,
              u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM bookings b
       JOIN users u ON b.user_id = u.user_id
       WHERE b.car_id = ?
       ORDER BY b.booking_id DESC`,
      [carId]
    );
    return rows;
  },

  async delete(id) {
    // Check if bookings exist
    const { rows } = await query('SELECT COUNT(*) as count FROM bookings WHERE car_id = ?', [id]);
    if (rows[0] && rows[0].count > 0) {
      // Soft-delete / deactivate to preserve historical foreign key integrity
      await query('UPDATE cars SET status = "Inactive", updated_at = CURRENT_TIMESTAMP WHERE car_id = ?', [id]);
      return { softDeleted: true, message: 'Car deactivated because associated booking records exist.' };
    } else {
      await query('DELETE FROM cars WHERE car_id = ?', [id]);
      return { softDeleted: false, message: 'Car permanently removed.' };
    }
  }
};

module.exports = CarModel;
