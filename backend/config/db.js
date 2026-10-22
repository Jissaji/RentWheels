const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let dbType = 'mysql';
let mysqlPool = null;
let sqliteDb = null;

const {
  users,
  cars,
  bookings,
  payments,
  maintenance,
  pickupReturnRecords,
  notifications
} = require('../database/seedData');

// Initialize database connection
async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'car_rental_db';

  if (process.env.DB_CLIENT === 'sqlite') {
    return initSQLite();
  }

  try {
    console.log(`🔌 Attempting connection to MySQL at ${host}:${port} as ${user}...`);
    // First connect without database to ensure database exists
    const tempConn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      connectTimeout: 4000
    });

    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await tempConn.end();

    // Now connect to the database with a connection pool
    mysqlPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 4000,
      dateStrings: true
    });

    // Test pool connection
    const connection = await mysqlPool.getConnection();
    console.log(`✅ [RDBMS] Successfully connected to MySQL database: ${database}`);
    connection.release();
    dbType = 'mysql';

    // Verify and seed tables if empty or missing columns
    await verifyAndSeedMySQL();
    return { type: 'mysql' };
  } catch (err) {
    console.warn(`⚠️ [RDBMS Notice] Could not connect to MySQL (${err.code || err.message}).`);
    if (process.env.DB_FALLBACK !== 'false') {
      console.log(`🔄 [Auto-Fallback] Initializing local embedded SQLite database so all APIs, login, and CRUD work without interruption!`);
      return initSQLite();
    } else {
      throw err;
    }
  }
}

// Verify tables and seed MySQL
async function verifyAndSeedMySQL() {
  try {
    const [tables] = await mysqlPool.query("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log('📦 Executing schema.sql on MySQL...');
      const schemaPath = path.join(__dirname, '../../database/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const statements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.toUpperCase().startsWith('CREATE DATABASE') && !s.toUpperCase().startsWith('USE'));
        for (const stmt of statements) {
          try {
            await mysqlPool.query(stmt);
          } catch (e) {
            // ignore drop errors
          }
        }
      }
    } else {
      // Run migrations for existing MySQL tables
      try {
        await mysqlPool.query("ALTER TABLE cars ADD COLUMN category VARCHAR(50) DEFAULT 'Sedan' NOT NULL AFTER year");
      } catch (e) { /* column exists */ }
      try {
        await mysqlPool.query("ALTER TABLE bookings ADD COLUMN pickup_location VARCHAR(150) DEFAULT 'Connaught Place, New Delhi' NOT NULL AFTER car_id");
        await mysqlPool.query("ALTER TABLE bookings ADD COLUMN return_location VARCHAR(150) DEFAULT 'Connaught Place, New Delhi' NOT NULL AFTER pickup_location");
      } catch (e) { /* column exists */ }
      try {
        await mysqlPool.query(`
          CREATE TABLE IF NOT EXISTS pickup_return_records (
            record_id INT AUTO_INCREMENT PRIMARY KEY,
            booking_id INT NOT NULL,
            staff_id INT NOT NULL,
            pickup_time DATETIME NULL,
            pickup_odometer INT NULL,
            pickup_condition TEXT NULL,
            return_time DATETIME NULL,
            return_odometer INT NULL,
            return_condition TEXT NULL,
            damage_reported BOOLEAN DEFAULT FALSE,
            damage_notes TEXT NULL,
            damage_fee DECIMAL(10, 2) DEFAULT 0.00,
            additional_charges DECIMAL(10, 2) DEFAULT 0.00,
            status ENUM('Picked_Up', 'Returned') DEFAULT 'Picked_Up' NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
            FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE RESTRICT
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
      } catch (e) { /* table exists */ }
      try {
        await mysqlPool.query(`
          CREATE TABLE IF NOT EXISTS notifications (
            notification_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(150) NOT NULL,
            message TEXT NOT NULL,
            type ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info' NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
      } catch (e) { /* table exists */ }
    }

    const [carRows] = await mysqlPool.query("SELECT COUNT(*) as count FROM cars");
    if (carRows[0].count < 20) {
      console.log('🌱 Seeding/Updating MySQL with full expanded 22-car Indian fleet data...');
      await seedMySQLData();
    } else {
      console.log(`ℹ️ MySQL database already contains ${carRows[0].count} vehicles.`);
    }
  } catch (err) {
    console.error('Error verifying MySQL tables:', err.message);
  }
}

async function seedMySQLData() {
  // Insert users
  for (const u of users) {
    await mysqlPool.query(
      `INSERT INTO users (user_id, name, email, password, phone, role, status, address, driving_license)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), role=VALUES(role), status=VALUES(status)`,
      [u.user_id, u.name, u.email, u.password, u.phone, u.role, u.status, u.address, u.driving_license]
    );
  }
  // Insert cars
  for (const c of cars) {
    await mysqlPool.query(
      `INSERT INTO cars (car_id, brand, model, registration_number, year, category, fuel_type, transmission, seats, mileage, price_per_day, image, description, status, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE brand=VALUES(brand), model=VALUES(model), year=VALUES(year), category=VALUES(category), fuel_type=VALUES(fuel_type), transmission=VALUES(transmission), seats=VALUES(seats), mileage=VALUES(mileage), price_per_day=VALUES(price_per_day), image=VALUES(image), description=VALUES(description), status=VALUES(status), is_featured=VALUES(is_featured)`,
      [c.car_id, c.brand, c.model, c.registration_number, c.year, c.category, c.fuel_type, c.transmission, c.seats, c.mileage, c.price_per_day, c.image, c.description, c.status, c.is_featured]
    );
  }
  // Insert bookings
  for (const b of bookings) {
    await mysqlPool.query(
      `INSERT IGNORE INTO bookings (booking_id, user_id, car_id, pickup_location, return_location, pickup_date, return_date, rental_days, price_per_day, subtotal, tax, discount, total_amount, booking_status, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.booking_id, b.user_id, b.car_id, b.pickup_location, b.return_location, b.pickup_date, b.return_date, b.rental_days, b.price_per_day, b.subtotal, b.tax, b.discount, b.total_amount, b.booking_status, b.special_requests]
    );
  }
  // Insert payments
  for (const p of payments) {
    await mysqlPool.query(
      `INSERT IGNORE INTO payments (payment_id, booking_id, amount, payment_method, payment_status, transaction_id, payment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p.payment_id, p.booking_id, p.amount, p.payment_method, p.payment_status, p.transaction_id, p.payment_date]
    );
  }
  // Insert maintenance
  for (const m of maintenance) {
    await mysqlPool.query(
      `INSERT IGNORE INTO maintenance (maintenance_id, car_id, maintenance_type, description, start_date, end_date, cost, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [m.maintenance_id, m.car_id, m.maintenance_type, m.description, m.start_date, m.end_date, m.cost, m.status]
    );
  }
  // Insert pickupReturnRecords
  for (const r of pickupReturnRecords) {
    await mysqlPool.query(
      `INSERT IGNORE INTO pickup_return_records (record_id, booking_id, staff_id, pickup_time, pickup_odometer, pickup_condition, return_time, return_odometer, return_condition, damage_reported, damage_notes, damage_fee, additional_charges, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.record_id, r.booking_id, r.staff_id, r.pickup_time, r.pickup_odometer, r.pickup_condition, r.return_time, r.return_odometer, r.return_condition, r.damage_reported, r.damage_notes, r.damage_fee, r.additional_charges, r.status]
    );
  }
  // Insert notifications
  for (const n of notifications) {
    await mysqlPool.query(
      `INSERT IGNORE INTO notifications (notification_id, user_id, title, message, type, is_read)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [n.notification_id, n.user_id, n.title, n.message, n.type, n.is_read]
    );
  }
  console.log('✅ Seed data successfully populated in MySQL!');
}

// Fallback SQLite initialization
function initSQLite() {
  return new Promise((resolve, reject) => {
    dbType = 'sqlite';
    const dbPath = path.join(__dirname, '../car_rental.sqlite');
    sqliteDb = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        console.error('❌ Failed to open SQLite database:', err.message);
        return reject(err);
      }
      console.log(`✅ [SQLite Engine] Local relational database ready at: ${dbPath}`);
      try {
        await setupSQLiteSchemaAndSeed();
        resolve({ type: 'sqlite' });
      } catch (setupErr) {
        reject(setupErr);
      }
    });
  });
}

function runSQLite(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ insertId: this.lastID, affectedRows: this.changes });
    });
  });
}

function allSQLite(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

async function setupSQLiteSchemaAndSeed() {
  await runSQLite(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT DEFAULT 'Customer' NOT NULL,
      status TEXT DEFAULT 'Active' NOT NULL,
      address TEXT,
      driving_license TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await runSQLite(`
    CREATE TABLE IF NOT EXISTS cars (
      car_id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      registration_number TEXT NOT NULL UNIQUE,
      year INTEGER NOT NULL,
      category TEXT DEFAULT 'Sedan' NOT NULL,
      fuel_type TEXT NOT NULL,
      transmission TEXT NOT NULL,
      seats INTEGER NOT NULL,
      mileage TEXT DEFAULT '16 km/l',
      price_per_day REAL NOT NULL,
      image TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'Available' NOT NULL,
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration: Add category to cars if missing
  try {
    await runSQLite("ALTER TABLE cars ADD COLUMN category TEXT DEFAULT 'Sedan' NOT NULL");
  } catch (e) {
    // Column already exists
  }

  await runSQLite(`
    CREATE TABLE IF NOT EXISTS bookings (
      booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      car_id INTEGER NOT NULL,
      pickup_location TEXT DEFAULT 'Connaught Place, New Delhi' NOT NULL,
      return_location TEXT DEFAULT 'Connaught Place, New Delhi' NOT NULL,
      pickup_date TEXT NOT NULL,
      return_date TEXT NOT NULL,
      rental_days INTEGER NOT NULL,
      price_per_day REAL NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      discount REAL DEFAULT 0.00,
      total_amount REAL NOT NULL,
      booking_status TEXT DEFAULT 'Pending' NOT NULL,
      cancellation_reason TEXT,
      special_requests TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (car_id) REFERENCES cars(car_id) ON DELETE RESTRICT
    );
  `);

  // Migrations for bookings
  try {
    await runSQLite("ALTER TABLE bookings ADD COLUMN pickup_location TEXT DEFAULT 'Connaught Place, New Delhi' NOT NULL");
  } catch (e) { }
  try {
    await runSQLite("ALTER TABLE bookings ADD COLUMN return_location TEXT DEFAULT 'Connaught Place, New Delhi' NOT NULL");
  } catch (e) { }

  await runSQLite(`
    CREATE TABLE IF NOT EXISTS payments (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'UPI' NOT NULL,
      payment_status TEXT DEFAULT 'Paid' NOT NULL,
      transaction_id TEXT,
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
    );
  `);

  await runSQLite(`
    CREATE TABLE IF NOT EXISTS maintenance (
      maintenance_id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id INTEGER NOT NULL,
      maintenance_type TEXT NOT NULL,
      description TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      cost REAL NOT NULL DEFAULT 0.00,
      status TEXT DEFAULT 'Scheduled' NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (car_id) REFERENCES cars(car_id) ON DELETE CASCADE
    );
  `);

  await runSQLite(`
    CREATE TABLE IF NOT EXISTS pickup_return_records (
      record_id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      staff_id INTEGER NOT NULL,
      pickup_time DATETIME,
      pickup_odometer INTEGER,
      pickup_condition TEXT,
      return_time DATETIME,
      return_odometer INTEGER,
      return_condition TEXT,
      damage_reported INTEGER DEFAULT 0,
      damage_notes TEXT,
      damage_fee REAL DEFAULT 0.00,
      additional_charges REAL DEFAULT 0.00,
      status TEXT DEFAULT 'Picked_Up' NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
      FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE RESTRICT
    );
  `);

  await runSQLite(`
    CREATE TABLE IF NOT EXISTS notifications (
      notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info' NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
  `);

  const carRows = await allSQLite("SELECT COUNT(*) as count FROM cars");
  if (carRows[0].count < 20) {
    console.log('🌱 Seeding expanded 22-car Indian fleet in SQLite...');
    // Seed users
    for (const u of users) {
      await runSQLite(
        `INSERT OR REPLACE INTO users (user_id, name, email, password, phone, role, status, address, driving_license)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.user_id, u.name, u.email, u.password, u.phone, u.role, u.status, u.address, u.driving_license]
      );
    }
    // Seed cars
    for (const c of cars) {
      await runSQLite(
        `INSERT OR REPLACE INTO cars (car_id, brand, model, registration_number, year, category, fuel_type, transmission, seats, mileage, price_per_day, image, description, status, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.car_id, c.brand, c.model, c.registration_number, c.year, c.category, c.fuel_type, c.transmission, c.seats, c.mileage, c.price_per_day, c.image, c.description, c.status, c.is_featured]
      );
    }
    // Seed bookings
    for (const b of bookings) {
      await runSQLite(
        `INSERT OR IGNORE INTO bookings (booking_id, user_id, car_id, pickup_location, return_location, pickup_date, return_date, rental_days, price_per_day, subtotal, tax, discount, total_amount, booking_status, special_requests)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [b.booking_id, b.user_id, b.car_id, b.pickup_location, b.return_location, b.pickup_date, b.return_date, b.rental_days, b.price_per_day, b.subtotal, b.tax, b.discount, b.total_amount, b.booking_status, b.special_requests]
      );
    }
    // Seed payments
    for (const p of payments) {
      await runSQLite(
        `INSERT OR IGNORE INTO payments (payment_id, booking_id, amount, payment_method, payment_status, transaction_id, payment_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [p.payment_id, p.booking_id, p.amount, p.payment_method, p.payment_status, p.transaction_id, p.payment_date]
      );
    }
    // Seed maintenance
    for (const m of maintenance) {
      await runSQLite(
        `INSERT OR IGNORE INTO maintenance (maintenance_id, car_id, maintenance_type, description, start_date, end_date, cost, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [m.maintenance_id, m.car_id, m.maintenance_type, m.description, m.start_date, m.end_date, m.cost, m.status]
      );
    }
    // Seed pickupReturnRecords
    for (const r of pickupReturnRecords) {
      await runSQLite(
        `INSERT OR IGNORE INTO pickup_return_records (record_id, booking_id, staff_id, pickup_time, pickup_odometer, pickup_condition, return_time, return_odometer, return_condition, damage_reported, damage_notes, damage_fee, additional_charges, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [r.record_id, r.booking_id, r.staff_id, r.pickup_time, r.pickup_odometer, r.pickup_condition, r.return_time, r.return_odometer, r.return_condition, r.damage_reported, r.damage_notes, r.damage_fee, r.additional_charges, r.status]
      );
    }
    // Seed notifications
    for (const n of notifications) {
      await runSQLite(
        `INSERT OR IGNORE INTO notifications (notification_id, user_id, title, message, type, is_read)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [n.notification_id, n.user_id, n.title, n.message, n.type, n.is_read]
      );
    }
    console.log('✅ Local database seed completed with 22 cars and demo records!');
  }
}

// Unified Query Function
async function query(sql, params = []) {
  if (dbType === 'mysql' && mysqlPool) {
    const [result] = await mysqlPool.query(sql, params);
    if (Array.isArray(result)) {
      return { rows: result, insertId: null, affectedRows: 0 };
    }
    return { rows: [], insertId: result.insertId, affectedRows: result.affectedRows };
  } else if (sqliteDb) {
    const trimmed = sql.trim().toUpperCase();
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('SHOW') || trimmed.startsWith('PRAGMA')) {
      const rows = await allSQLite(sql, params);
      return { rows, insertId: null, affectedRows: 0 };
    } else {
      const res = await runSQLite(sql, params);
      return { rows: [], insertId: res.insertId, affectedRows: res.affectedRows };
    }
  } else {
    throw new Error('Database connection not established.');
  }
}

function getDatabaseType() {
  return dbType;
}

module.exports = {
  initDatabase,
  query,
  getDatabaseType
};
