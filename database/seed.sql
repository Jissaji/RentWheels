-- =====================================================================
-- CAR RENTAL MANAGEMENT SYSTEM (CRMS)
-- Database Seed Data (Realistic Indian Context)
-- Default Passwords:
--   Admin: admin123
--   Staff: password123
--   Customers: password123
-- =====================================================================

USE car_rental_db;

-- 1. SEED USERS
INSERT INTO users (user_id, name, email, password, phone, role, status, address, driving_license) VALUES
(1, 'System Administrator', 'admin@rentwheels.com', '$2b$10$UJPaLBAdnLYVmlj5TbKkkeY3QZ1pWE2Ath99eQKPtX1K8IxU0ezKW', '+91 98765 43210', 'Admin', 'Active', 'HQ Connaught Place, New Delhi', 'DL-ADMIN-001'),
(2, 'Rajesh Sharma', 'rajesh.sharma@example.com', '$2b$10$TwvXAWDWAuWxDdzY1I0w1umMPOV2IhCW6y2mM6EVhCW8OfeZm3sm.', '+91 98111 22334', 'Customer', 'Active', 'Sector 62, Noida, Uttar Pradesh', 'DL-0420180012345'),
(3, 'Priya Patel', 'priya.patel@example.com', '$2b$10$TwvXAWDWAuWxDdzY1I0w1umMPOV2IhCW6y2mM6EVhCW8OfeZm3sm.', '+91 98222 33445', 'Customer', 'Active', 'Andheri West, Mumbai, Maharashtra', 'MH-0220190023456'),
(4, 'Amit Verma', 'amit.verma@example.com', '$2b$10$TwvXAWDWAuWxDdzY1I0w1umMPOV2IhCW6y2mM6EVhCW8OfeZm3sm.', '+91 98333 44556', 'Customer', 'Active', 'Indiranagar, Bengaluru, Karnataka', 'KA-0320200034567'),
(5, 'Sneha Reddy', 'sneha.reddy@example.com', '$2b$10$TwvXAWDWAuWxDdzY1I0w1umMPOV2IhCW6y2mM6EVhCW8OfeZm3sm.', '+91 98444 55667', 'Customer', 'Active', 'Banjara Hills, Hyderabad, Telangana', 'TS-0920210045678'),
(6, 'Vikram Singh', 'vikram.singh@example.com', '$2b$10$TwvXAWDWAuWxDdzY1I0w1umMPOV2IhCW6y2mM6EVhCW8OfeZm3sm.', '+91 98555 66778', 'Customer', 'Active', 'Malviya Nagar, Jaipur, Rajasthan', 'RJ-1420220056789'),
(7, 'Vikash Sharma (Staff Ops)', 'staff@rentwheels.com', '$2b$10$TwvXAWDWAuWxDdzY1I0w1umMPOV2IhCW6y2mM6EVhCW8OfeZm3sm.', '+91 98777 88990', 'Staff', 'Active', 'Fleet Hub, IGI Terminal 3, New Delhi', 'DL-STAFF-007');

-- 2. SEED CARS (22 Realistic Indian Cars across Categories)
INSERT INTO cars (car_id, brand, model, registration_number, year, category, fuel_type, transmission, seats, mileage, price_per_day, image, description, status, is_featured) VALUES
(1, 'Maruti Suzuki', 'Swift ZXi Plus', 'DL-01-AX-1011', 2024, 'Hatchback', 'Petrol', 'Manual', 5, '24.8 km/l', 1600.00, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', 'India favorite agile city hatchback with great fuel efficiency, keyless entry, and 6 standard airbags.', 'Available', TRUE),
(2, 'Maruti Suzuki', 'Baleno Alpha AGS', 'DL-02-BY-2022', 2024, 'Hatchback', 'Petrol', 'Automatic', 5, '22.9 km/l', 1800.00, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', 'Spacious premium hatchback with heads-up display, 360-degree view camera, and smooth automatic transmission.', 'Available', FALSE),
(3, 'Hyundai', 'Grand i10 Nios Asta', 'HR-26-CZ-3033', 2024, 'Hatchback', 'Petrol', 'Manual', 5, '20.7 km/l', 1500.00, 'https://images.unsplash.com/photo-1590362891988-f77804783e60?auto=format&fit=crop&w=1200&q=80', 'Compact and refined family hatchback featuring smartphone connectivity, rear AC vents, and wireless phone charger.', 'Available', FALSE),
(4, 'Tata', 'Tiago XZ Plus', 'MH-12-DT-4044', 2024, 'Hatchback', 'Petrol', 'Manual', 5, '20.0 km/l', 1400.00, 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80', 'Robust 4-star GNCAP safety rated hatchback with Harman 8-speaker audio system and dynamic sporty styling.', 'Available', FALSE),
(5, 'Tata', 'Altroz XZ Plus (S)', 'KA-04-EU-5055', 2024, 'Hatchback', 'Diesel', 'Manual', 5, '23.6 km/l', 1700.00, 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80', 'Gold standard premium hatchback with 5-star adult safety rating, electric voice sunroof, and punchy diesel pull.', 'Available', FALSE),
(6, 'Honda', 'City ZX CVT', 'DL-03-FV-6066', 2024, 'Sedan', 'Petrol', 'Automatic', 5, '18.4 km/l', 2500.00, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80', 'Sophisticated executive sedan with legendary i-VTEC refinement, expansive legroom, and Honda Sensing ADAS.', 'Available', TRUE),
(7, 'Hyundai', 'Verna SX (O) Turbo DCT', 'HR-51-GW-7077', 2024, 'Sedan', 'Petrol', 'Automatic', 5, '20.6 km/l', 2600.00, 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=1200&q=80', 'Futuristic fastback sedan with 160 PS turbo power, paddle shifters, ventilated front seats, and Bose 8-speaker sound.', 'Available', TRUE),
(8, 'Maruti Suzuki', 'Dzire ZXi Plus', 'UP-16-HX-8088', 2024, 'Sedan', 'Petrol', 'Manual', 5, '25.7 km/l', 1700.00, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', 'Elegantly proportioned compact sedan with supreme fuel efficiency, generous boot space, and smooth highway cruise.', 'Available', FALSE),
(9, 'Volkswagen', 'Virtus GT Plus DSG', 'MH-01-JY-9099', 2024, 'Sedan', 'Petrol', 'Automatic', 5, '19.6 km/l', 2800.00, 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80', 'High-performance German-engineered sedan boasting 1.5L TSI Evo engine, red calipers, and razor-sharp steering dynamics.', 'Available', TRUE),
(10, 'Hyundai', 'Creta SX (O) AT', 'HR-26-EF-9012', 2024, 'SUV', 'Petrol', 'Automatic', 5, '17.4 km/l', 2600.00, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', 'India top-selling mid-size SUV featuring panoramic sunroof, ventilated leatherette seats, and Level 2 ADAS.', 'Available', TRUE),
(11, 'Kia', 'Seltos GTX+ Dark Edition', 'RJ-14-OP-0123', 2024, 'SUV', 'Diesel', 'Automatic', 5, '18.0 km/l', 2800.00, 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80', 'Striking modern SUV with dual 10.25-inch panoramic screens, heads-up display, and 360-degree blind spot monitors.', 'Available', TRUE),
(12, 'Tata', 'Nexon Fearless+ S', 'TS-08-KZ-1122', 2024, 'SUV', 'Petrol', 'Manual', 5, '17.4 km/l', 2200.00, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80', 'High-safety 5-star compact SUV equipped with sequential LED indicators, capacitive climate console, and 360 camera.', 'Available', FALSE),
(13, 'Mahindra', 'Scorpio-N Z8L 4WD', 'TS-07-MN-6789', 2024, 'SUV', 'Diesel', 'Automatic', 7, '14.5 km/l', 3600.00, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', 'The Big Daddy of SUVs with authentic ladder-frame 4XPLOR capability, 12-speaker Sony audio, and 7 comfortable seats.', 'Rented', TRUE),
(14, 'Mahindra', 'XUV700 AX7 Luxury Pack', 'KA-05-LX-2233', 2024, 'SUV', 'Diesel', 'Automatic', 7, '16.5 km/l', 4000.00, 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80', 'Flagship smart 7-seater SUV with dual superscreens, smart door handles, panoramic Skyroof, and adaptive cruise control.', 'Available', TRUE),
(15, 'Toyota', 'Innova Hycross ZX (O)', 'DL-01-AB-1234', 2024, 'SUV', 'Hybrid', 'Automatic', 7, '21.1 km/l', 3800.00, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', 'Premium 7-seater MPV/SUV with plush powered ottoman seats, panoramic sunroof, and unmatched hybrid ride comfort.', 'Available', TRUE),
(16, 'Kia', 'Carens Luxury Plus', 'UP-32-MY-3344', 2024, 'SUV', 'Diesel', 'Automatic', 7, '18.4 km/l', 2700.00, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80', 'Family recreational 7-seater with one-touch electric tumble second row, ventilated front seats, and integrated air purifier.', 'Available', FALSE),
(17, 'Mahindra', 'Thar LX 4x4 Hard Top', 'DL-03-CD-5678', 2024, 'SUV', 'Diesel', 'Manual', 4, '15.2 km/l', 3200.00, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', 'Iconic off-roader with rugged 4x4 capability, high ground clearance, roll cage, and bold commanding highway presence.', 'Available', TRUE),
(18, 'BMW', '3 Series Gran Limousine M Sport', 'DL-01-ST-8901', 2024, 'Premium', 'Petrol', 'Automatic', 5, '15.3 km/l', 8500.00, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', 'Luxury performance sedan offering best-in-class rear legroom, Harman Kardon sound, and BMW Curved Display cockpit.', 'Available', TRUE),
(19, 'Mercedes-Benz', 'C-Class C220d', 'MH-02-NZ-4455', 2024, 'Premium', 'Diesel', 'Automatic', 5, '16.9 km/l', 9200.00, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80', 'Baby S-Class opulence featuring vertical infotainment, 64-color ambient lighting, and whisper-quiet highway ride.', 'Available', TRUE),
(20, 'Audi', 'A4 Technology 40 TFSI', 'KA-01-PZ-5566', 2024, 'Premium', 'Petrol', 'Automatic', 5, '17.1 km/l', 8800.00, 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80', 'Executive luxury with Audi Virtual Cockpit Plus, Matrix LED headlights, and 19-speaker Bang & Olufsen sound.', 'Available', TRUE),
(21, 'Tata', 'Nexon EV Empowered+ LR', 'MH-02-GH-3456', 2024, 'Electric', 'Electric', 'Automatic', 5, '465 km range', 2900.00, 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80', 'India premier zero-emission SUV with long-range battery pack, V2V and V2L charging capabilities, and instant torque.', 'Available', TRUE),
(22, 'MG', 'ZS EV Exclusive Pro', 'DL-04-QZ-6677', 2024, 'Electric', 'Electric', 'Automatic', 5, '461 km range', 3300.00, 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80', 'Futuristic electric crossover with full Level 2 ADAS suite, dual-pane panoramic skyroof, and 50.3 kWh battery pack.', 'Maintenance', FALSE);

-- 3. SEED BOOKINGS
INSERT INTO bookings (booking_id, user_id, car_id, pickup_location, return_location, pickup_date, return_date, rental_days, price_per_day, subtotal, tax, discount, total_amount, booking_status, special_requests) VALUES
(1, 2, 15, 'Connaught Place, New Delhi', 'Connaught Place, New Delhi', '2026-09-01', '2026-09-04', 3, 3800.00, 11400.00, 2052.00, 500.00, 12952.00, 'Completed', 'Airport pickup requested'),
(2, 3, 10, 'Andheri West, Mumbai', 'Andheri West, Mumbai', '2026-09-05', '2026-09-08', 3, 2600.00, 7800.00, 1404.00, 0.00, 9204.00, 'Completed', 'Child safety seat required'),
(3, 4, 17, 'Indiranagar, Bengaluru', 'Indiranagar, Bengaluru', '2026-09-10', '2026-09-14', 4, 3200.00, 12800.00, 2304.00, 600.00, 14504.00, 'Completed', 'Weekend road trip to Coorg'),
(4, 5, 1, 'Banjara Hills, Hyderabad', 'Banjara Hills, Hyderabad', '2026-09-15', '2026-09-17', 2, 1600.00, 3200.00, 576.00, 0.00, 3776.00, 'Completed', 'City errand driving'),
(5, 6, 6, 'Malviya Nagar, Jaipur', 'Malviya Nagar, Jaipur', '2026-09-20', '2026-09-23', 3, 2500.00, 7500.00, 1350.00, 300.00, 8550.00, 'Completed', 'Business client transfer'),
(6, 2, 13, 'Connaught Place, New Delhi', 'Connaught Place, New Delhi', '2026-10-18', '2026-10-25', 7, 3600.00, 25200.00, 4536.00, 1000.00, 28736.00, 'Active', 'Trip to Manali with family'),
(7, 3, 11, 'Chhatrapati Shivaji Airport, Mumbai', 'Chhatrapati Shivaji Airport, Mumbai', '2026-10-24', '2026-10-27', 3, 2800.00, 8400.00, 1512.00, 400.00, 9512.00, 'Confirmed', 'Self drive Mumbai to Pune'),
(8, 4, 21, 'Kempegowda Airport, Bengaluru', 'Kempegowda Airport, Bengaluru', '2026-10-26', '2026-10-29', 3, 2900.00, 8700.00, 1566.00, 300.00, 9966.00, 'Confirmed', 'Eco-friendly commute with charging cable'),
(9, 5, 18, 'Rajiv Gandhi Airport, Hyderabad', 'Rajiv Gandhi Airport, Hyderabad', '2026-10-30', '2026-11-02', 3, 8500.00, 25500.00, 4590.00, 800.00, 29290.00, 'Pending', 'VIP corporate reception'),
(10, 6, 17, 'Malviya Nagar, Jaipur', 'Malviya Nagar, Jaipur', '2026-09-28', '2026-09-30', 2, 3200.00, 6400.00, 1152.00, 0.00, 7552.00, 'Cancelled', 'Plans changed due to family emergency');

-- 4. SEED PAYMENTS
INSERT INTO payments (payment_id, booking_id, amount, payment_method, payment_status, transaction_id, payment_date) VALUES
(1, 1, 12952.00, 'UPI', 'Paid', 'TXN-UPI-9018241', '2026-09-01 10:15:00'),
(2, 2, 9204.00, 'Card', 'Paid', 'TXN-CARD-4481902', '2026-09-05 11:20:00'),
(3, 3, 14504.00, 'Net Banking', 'Paid', 'TXN-NET-7719203', '2026-09-10 09:45:00'),
(4, 4, 3776.00, 'UPI', 'Paid', 'TXN-UPI-3391024', '2026-09-15 14:30:00'),
(5, 5, 8550.00, 'Card', 'Paid', 'TXN-CARD-1182745', '2026-09-20 16:10:00'),
(6, 6, 28736.00, 'UPI', 'Paid', 'TXN-UPI-8849106', '2026-10-18 08:30:00'),
(7, 7, 9512.00, 'Net Banking', 'Paid', 'TXN-NET-2291837', '2026-10-19 12:00:00'),
(8, 8, 9966.00, 'UPI', 'Paid', 'TXN-UPI-6649108', '2026-10-20 17:40:00'),
(9, 9, 29290.00, 'Cash', 'Pending', 'TXN-CASH-PENDING', '2026-10-20 11:00:00'),
(10, 10, 7552.00, 'Card', 'Refunded', 'TXN-REFUND-55102', '2026-09-28 15:00:00');

-- 5. SEED MAINTENANCE
INSERT INTO maintenance (maintenance_id, car_id, maintenance_type, description, start_date, end_date, cost, status) VALUES
(1, 22, 'Software Update & Battery Diagnostic', 'Scheduled EV diagnostics, firmware upgrade, and high-voltage battery cooling inspection.', '2026-10-15', '2026-10-25', 5500.00, 'In Progress'),
(2, 1, 'Periodic 20,000 km Service', 'Engine oil change, synthetic brake fluid flush, and cabin air filter renewal.', '2026-08-10', '2026-08-12', 4200.00, 'Completed');

-- 6. SEED PICKUP & RETURN RECORDS
INSERT INTO pickup_return_records (record_id, booking_id, staff_id, pickup_time, pickup_odometer, pickup_condition, return_time, return_odometer, return_condition, damage_reported, damage_notes, damage_fee, additional_charges, status) VALUES
(1, 1, 7, '2026-09-01 10:30:00', 14200, 'Vehicle inspected, clean exterior, all accessories present.', '2026-09-04 18:00:00', 14750, 'Vehicle returned in perfect showroom condition. Full fuel tank verified.', 0, NULL, 0.00, 0.00, 'Returned'),
(2, 6, 7, '2026-10-18 09:00:00', 28400, 'Pre-handover 40-point safety check completed. Spare wheel and toolkit verified.', NULL, NULL, NULL, 0, NULL, 0.00, 0.00, 'Picked_Up');

-- 7. SEED NOTIFICATIONS
INSERT INTO notifications (notification_id, user_id, title, message, type, is_read) VALUES
(1, 2, 'Booking Confirmed - Mahindra Scorpio-N', 'Your booking #6 for Mahindra Scorpio-N has been confirmed for 18-25 Oct 2026.', 'success', 1),
(2, 2, 'Vehicle Handover Completed', 'Staff member Vikash Sharma has recorded your pickup. Have a safe drive to Manali!', 'info', 0),
(3, 3, 'Reservation Confirmed - Kia Seltos', 'Booking #7 is confirmed. Please bring your original driving license (MH-0220190023456) at pickup.', 'success', 0),
(4, 4, 'Booking Confirmed - Tata Nexon EV', 'Booking #8 is confirmed for Kempegowda Airport pickup. 100% battery charge ensured.', 'success', 0);
