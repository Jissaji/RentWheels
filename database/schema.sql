-- =====================================================================
-- CAR RENTAL MANAGEMENT SYSTEM (CRMS)
-- Database Schema for MySQL / RDBMS
-- Standard Normalized Relational Schema (3NF)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS car_rental_db;
USE car_rental_db;

-- DROP IN REVERSE ORDER OF DEPENDENCY
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS pickup_return_records;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS maintenance;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS users;

-- 1. USERS TABLE
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('Customer', 'Admin', 'Staff') DEFAULT 'Customer' NOT NULL,
    status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active' NOT NULL,
    address VARCHAR(255) NULL,
    driving_license VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CARS TABLE
CREATE TABLE cars (
    car_id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    registration_number VARCHAR(30) NOT NULL UNIQUE,
    year INT NOT NULL,
    category ENUM('Hatchback', 'Sedan', 'SUV', 'Premium', 'Electric') DEFAULT 'Sedan' NOT NULL,
    fuel_type ENUM('Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG') NOT NULL,
    transmission ENUM('Manual', 'Automatic') NOT NULL,
    seats INT NOT NULL,
    mileage VARCHAR(50) DEFAULT '16 km/l',
    price_per_day DECIMAL(10, 2) NOT NULL,
    image TEXT NOT NULL,
    description TEXT,
    status ENUM('Available', 'Rented', 'Maintenance', 'Inactive') DEFAULT 'Available' NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_car_status (status),
    INDEX idx_car_brand (brand),
    INDEX idx_car_category (category),
    INDEX idx_car_price (price_per_day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BOOKINGS TABLE
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    pickup_location VARCHAR(150) DEFAULT 'Connaught Place, New Delhi' NOT NULL,
    return_location VARCHAR(150) DEFAULT 'Connaught Place, New Delhi' NOT NULL,
    pickup_date DATE NOT NULL,
    return_date DATE NOT NULL,
    rental_days INT NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_status ENUM('Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled', 'Rejected') DEFAULT 'Pending' NOT NULL,
    cancellation_reason TEXT NULL,
    special_requests TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(car_id) ON DELETE RESTRICT,
    INDEX idx_booking_user (user_id),
    INDEX idx_booking_car (car_id),
    INDEX idx_booking_status (booking_status),
    INDEX idx_booking_dates (pickup_date, return_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PAYMENTS TABLE
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('UPI', 'Card', 'Net Banking', 'Cash') DEFAULT 'UPI' NOT NULL,
    payment_status ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Paid' NOT NULL,
    transaction_id VARCHAR(100) NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    INDEX idx_payment_booking (booking_id),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. MAINTENANCE TABLE
CREATE TABLE maintenance (
    maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('Scheduled', 'In Progress', 'Completed') DEFAULT 'Scheduled' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(car_id) ON DELETE CASCADE,
    INDEX idx_maintenance_car (car_id),
    INDEX idx_maintenance_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PICKUP & RETURN RECORDS TABLE (Staff Handover and Check-in)
CREATE TABLE pickup_return_records (
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
    FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_record_booking (booking_id),
    INDEX idx_record_staff (staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. NOTIFICATIONS TABLE (Customer and Staff In-App Alerts)
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info' NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
