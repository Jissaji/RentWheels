// Realistic Indian Seed Data for Car Rental Management System (CRMS)
// Default Passwords:
//   Admin: admin123 -> $2b$10$UJPaLBAdnLYVmlj5TbKkkeY3QZ1pWE2Ath99eQKPtX1K8IxU0ezKW
//   Staff: password123 -> $2b$10$TwvXAWDWAuWxDdzY1I0w1umMPOV2IhCW6y2mM6EVhCW8OfeZm3sm.
//   Customers: password123 -> $2b$10$TwvXAWDWAuWxDdzY1I0w1umMPOV2IhCW6y2mM6EVhCW8OfeZm3sm.

const users = [
  {
    user_id: 1,
    name: 'System Administrator',
    email: 'admin@rentwheels.com',
    password: '$2b$10$UJPaLBAdnLYVmlj5TbKkkeY3QZ1pWE2Ath99eQKPtX1K8IxU0ezKW', // admin123
    phone: '+91 98765 43210',
    role: 'Admin',
    status: 'Active',
    address: 'HQ Connaught Place, New Delhi',
    driving_license: 'DL-ADMIN-001'
  },
  {
    user_id: 2,
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@example.com',
    password: '$2b$10$TwvXAWDWAuWxDdzY1I0w1umMPOV2IhCW6y2mM6EVhCW8OfeZm3sm.', // password123
    phone: '+91 98111 22334',
    role: 'Customer',
    status: 'Active',
    address: 'Sector 62, Noida, Uttar Pradesh',
    driving_license: 'DL-0420180012345'
  },
  {
    user_id: 3,
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    password: '$2b$10$TwvXAWDWAuWxDdzY1I0w1umMPOV2IhCW6y2mM6EVhCW8OfeZm3sm.', // password123
    phone: '+91 98222 33445',
    role: 'Customer',
    status: 'Active',
    address: 'Andheri West, Mumbai, Maharashtra',
    driving_license: 'MH-0220190023456'
  },
  {
    user_id: 4,
    name: 'Amit Verma',
    email: 'amit.verma@example.com',
    password: '$2b$10$TwvXAWDWAuWxDdzY1I0w1umMPOV2IhCW6y2mM6EVhCW8OfeZm3sm.', // password123
    phone: '+91 98333 44556',
    role: 'Customer',
    status: 'Active',
    address: 'Indiranagar, Bengaluru, Karnataka',
    driving_license: 'KA-0320200034567'
  },
  {
    user_id: 5,
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    password: '$2b$10$TwvXAWDWAuWxDdzY1I0w1umMPOV2IhCW6y2mM6EVhCW8OfeZm3sm.', // password123
    phone: '+91 98444 55667',
    role: 'Customer',
    status: 'Active',
    address: 'Banjara Hills, Hyderabad, Telangana',
    driving_license: 'TS-0920210045678'
  },
  {
    user_id: 6,
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    password: '$2b$10$TwvXAWDWAuWxDdzY1I0w1umMPOV2IhCW6y2mM6EVhCW8OfeZm3sm.', // password123
    phone: '+91 98555 66778',
    role: 'Customer',
    status: 'Active',
    address: 'Malviya Nagar, Jaipur, Rajasthan',
    driving_license: 'RJ-1420220056789'
  },
  {
    user_id: 7,
    name: 'Vikash Sharma (Staff Ops)',
    email: 'staff@rentwheels.com',
    password: '$2b$10$TwvXAWDWAuWxDdzY1I0w1umMPOV2IhCW6y2mM6EVhCW8OfeZm3sm.', // password123
    phone: '+91 98777 88990',
    role: 'Staff',
    status: 'Active',
    address: 'Fleet Hub, IGI Terminal 3, New Delhi',
    driving_license: 'DL-STAFF-007'
  }
];

const cars = [
  // --- ECONOMY HATCHBACKS ---
  {
    car_id: 1,
    brand: 'Maruti Suzuki',
    model: 'Swift ZXi Plus',
    registration_number: 'DL-01-AX-1011',
    year: 2024,
    category: 'Hatchback',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    seats: 5,
    mileage: '24.8 km/l',
    price_per_day: 1600.00,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
    description: 'India\'s favorite agile city hatchback with great fuel efficiency, keyless entry, and 6 standard airbags.',
    status: 'Available',
    is_featured: 1
  },
  {
    car_id: 2,
    brand: 'Maruti Suzuki',
    model: 'Baleno Alpha AGS',
    registration_number: 'DL-02-BY-2022',
    year: 2024,
    category: 'Hatchback',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    mileage: '22.9 km/l',
    price_per_day: 1800.00,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    description: 'Spacious premium hatchback with heads-up display, 360-degree view camera, and smooth automatic transmission.',
    status: 'Available',
    is_featured: 0
  },
  {
    car_id: 3,
    brand: 'Hyundai',
    model: 'Grand i10 Nios Asta',
    registration_number: 'HR-26-CZ-3033',
    year: 2024,
    category: 'Hatchback',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    seats: 5,
    mileage: '20.7 km/l',
    price_per_day: 1500.00,
    image: 'https://images.unsplash.com/photo-1590362891988-f77804783e60?auto=format&fit=crop&w=1200&q=80',
    description: 'Compact and refined family hatchback featuring smartphone connectivity, rear AC vents, and wireless phone charger.',
    status: 'Available',
    is_featured: 0
  },
  {
    car_id: 4,
    brand: 'Tata',
    model: 'Tiago XZ Plus',
    registration_number: 'MH-12-DT-4044',
    year: 2024,
    category: 'Hatchback',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    seats: 5,
    mileage: '20.0 km/l',
    price_per_day: 1400.00,
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80',
    description: 'Robust 4-star GNCAP safety rated hatchback with Harman 8-speaker audio system and dynamic sporty styling.',
    status: 'Available',
    is_featured: 0
  },
  {
    car_id: 5,
    brand: 'Tata',
    model: 'Altroz XZ Plus (S)',
    registration_number: 'KA-04-EU-5055',
    year: 2024,
    category: 'Hatchback',
    fuel_type: 'Diesel',
    transmission: 'Manual',
    seats: 5,
    mileage: '23.6 km/l',
    price_per_day: 1700.00,
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
    description: 'Gold standard premium hatchback with 5-star adult safety rating, electric voice sunroof, and punchy diesel pull.',
    status: 'Available',
    is_featured: 0
  },

  // --- SEDANS ---
  {
    car_id: 6,
    brand: 'Honda',
    model: 'City ZX CVT',
    registration_number: 'DL-03-FV-6066',
    year: 2024,
    category: 'Sedan',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    mileage: '18.4 km/l',
    price_per_day: 2500.00,
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    description: 'Sophisticated executive sedan with legendary i-VTEC refinement, expansive legroom, and Honda Sensing ADAS.',
    status: 'Available',
    is_featured: 1
  },
  {
    car_id: 7,
    brand: 'Hyundai',
    model: 'Verna SX (O) Turbo DCT',
    registration_number: 'HR-51-GW-7077',
    year: 2024,
    category: 'Sedan',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    mileage: '20.6 km/l',
    price_per_day: 2600.00,
    image: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=1200&q=80',
    description: 'Futuristic fastback sedan with 160 PS turbo power, paddle shifters, ventilated front seats, and Bose 8-speaker sound.',
    status: 'Available',
    is_featured: 1
  },
  {
    car_id: 8,
    brand: 'Maruti Suzuki',
    model: 'Dzire ZXi Plus',
    registration_number: 'UP-16-HX-8088',
    year: 2024,
    category: 'Sedan',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    seats: 5,
    mileage: '25.7 km/l',
    price_per_day: 1700.00,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    description: 'Elegantly proportioned compact sedan with supreme fuel efficiency, generous boot space, and smooth highway cruise.',
    status: 'Available',
    is_featured: 0
  },
  {
    car_id: 9,
    brand: 'Volkswagen',
    model: 'Virtus GT Plus DSG',
    registration_number: 'MH-01-JY-9099',
    year: 2024,
    category: 'Sedan',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    mileage: '19.6 km/l',
    price_per_day: 2800.00,
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80',
    description: 'High-performance German-engineered sedan boasting 1.5L TSI Evo engine, red calipers, and razor-sharp steering dynamics.',
    status: 'Available',
    is_featured: 1
  },

  // --- SUVS & FAMILY VEHICLES ---
  {
    car_id: 10,
    brand: 'Hyundai',
    model: 'Creta SX (O) AT',
    registration_number: 'HR-26-EF-9012',
    year: 2024,
    category: 'SUV',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    mileage: '17.4 km/l',
    price_per_day: 2600.00,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    description: 'India\'s top-selling mid-size SUV featuring panoramic sunroof, ventilated leatherette seats, and Level 2 ADAS.',
    status: 'Available',
    is_featured: 1
  },
  {
    car_id: 11,
    brand: 'Kia',
    model: 'Seltos GTX+ Dark Edition',
    registration_number: 'RJ-14-OP-0123',
    year: 2024,
    category: 'SUV',
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    seats: 5,
    mileage: '18.0 km/l',
    price_per_day: 2800.00,
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80',
    description: 'Striking modern SUV with dual 10.25-inch panoramic screens, heads-up display, and 360-degree blind spot monitors.',
    status: 'Available',
    is_featured: 1
  },
  {
    car_id: 12,
    brand: 'Tata',
    model: 'Nexon Fearless+ S',
    registration_number: 'TS-08-KZ-1122',
    year: 2024,
    category: 'SUV',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    seats: 5,
    mileage: '17.4 km/l',
    price_per_day: 2200.00,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
    description: 'High-safety 5-star compact SUV equipped with sequential LED indicators, capacitive climate console, and 360 camera.',
    status: 'Available',
    is_featured: 0
  },
  {
    car_id: 13,
    brand: 'Mahindra',
    model: 'Scorpio-N Z8L 4WD',
    registration_number: 'TS-07-MN-6789',
    year: 2024,
    category: 'SUV',
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    seats: 7,
    mileage: '14.5 km/l',
    price_per_day: 3600.00,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    description: 'The Big Daddy of SUVs with authentic ladder-frame 4XPLOR capability, 12-speaker Sony audio, and 7 comfortable seats.',
    status: 'Rented',
    is_featured: 1
  },
  {
    car_id: 14,
    brand: 'Mahindra',
    model: 'XUV700 AX7 Luxury Pack',
    registration_number: 'KA-05-LX-2233',
    year: 2024,
    category: 'SUV',
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    seats: 7,
    mileage: '16.5 km/l',
    price_per_day: 4000.00,
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    description: 'Flagship smart 7-seater SUV with dual superscreens, smart door handles, panoramic Skyroof, and adaptive cruise control.',
    status: 'Available',
    is_featured: 1
  },
  {
    car_id: 15,
    brand: 'Toyota',
    model: 'Innova Hycross ZX (O)',
    registration_number: 'DL-01-AB-1234',
    year: 2024,
    category: 'SUV',
    fuel_type: 'Hybrid',
    transmission: 'Automatic',
    seats: 7,
    mileage: '21.1 km/l',
    price_per_day: 3800.00,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    description: 'Premium 7-seater MPV/SUV with plush powered ottoman seats, panoramic sunroof, and unmatched hybrid ride comfort.',
    status: 'Available',
    is_featured: 1
  },
  {
    car_id: 16,
    brand: 'Kia',
    model: 'Carens Luxury Plus',
    registration_number: 'UP-32-MY-3344',
    year: 2024,
    category: 'SUV',
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    seats: 7,
    mileage: '18.4 km/l',
    price_per_day: 2700.00,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
    description: 'Family recreational 7-seater with one-touch electric tumble second row, ventilated front seats, and integrated air purifier.',
    status: 'Available',
    is_featured: 0
  },
  {
    car_id: 17,
    brand: 'Mahindra',
    model: 'Thar LX 4x4 Hard Top',
    registration_number: 'DL-03-CD-5678',
    year: 2024,
    category: 'SUV',
    fuel_type: 'Diesel',
    transmission: 'Manual',
    seats: 4,
    mileage: '15.2 km/l',
    price_per_day: 3200.00,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    description: 'Iconic off-roader with rugged 4x4 capability, high ground clearance, roll cage, and bold commanding highway presence.',
    status: 'Available',
    is_featured: 1
  },

  // --- PREMIUM VEHICLES ---
  {
    car_id: 18,
    brand: 'BMW',
    model: '3 Series Gran Limousine M Sport',
    registration_number: 'DL-01-ST-8901',
    year: 2024,
    category: 'Premium',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    mileage: '15.3 km/l',
    price_per_day: 8500.00,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    description: 'Luxury performance sedan offering best-in-class rear legroom, Harman Kardon sound, and BMW Curved Display cockpit.',
    status: 'Available',
    is_featured: 1
  },
  {
    car_id: 19,
    brand: 'Mercedes-Benz',
    model: 'C-Class C220d',
    registration_number: 'MH-02-NZ-4455',
    year: 2024,
    category: 'Premium',
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    seats: 5,
    mileage: '16.9 km/l',
    price_per_day: 9200.00,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    description: 'Baby S-Class opulence featuring vertical infotainment, 64-color ambient lighting, and whisper-quiet highway ride.',
    status: 'Available',
    is_featured: 1
  },
  {
    car_id: 20,
    brand: 'Audi',
    model: 'A4 Technology 40 TFSI',
    registration_number: 'KA-01-PZ-5566',
    year: 2024,
    category: 'Premium',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    mileage: '17.1 km/l',
    price_per_day: 8800.00,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80',
    description: 'Executive luxury with Audi Virtual Cockpit Plus, Matrix LED headlights, and 19-speaker Bang & Olufsen sound.',
    status: 'Available',
    is_featured: 1
  },

  // --- ELECTRIC VEHICLES ---
  {
    car_id: 21,
    brand: 'Tata',
    model: 'Nexon EV Empowered+ LR',
    registration_number: 'MH-02-GH-3456',
    year: 2024,
    category: 'Electric',
    fuel_type: 'Electric',
    transmission: 'Automatic',
    seats: 5,
    mileage: '465 km range',
    price_per_day: 2900.00,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    description: 'Leading electric compact SUV with instant acceleration torque, silent cabin, and fast DC charging support.',
    status: 'Available',
    is_featured: 1
  },
  {
    car_id: 22,
    brand: 'MG',
    model: 'ZS EV Exclusive Pro',
    registration_number: 'DL-04-QZ-6677',
    year: 2024,
    category: 'Electric',
    fuel_type: 'Electric',
    transmission: 'Automatic',
    seats: 5,
    mileage: '461 km range',
    price_per_day: 3300.00,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80',
    description: 'Futuristic electric crossover with full Level 2 ADAS suite, dual-pane panoramic skyroof, and 50.3 kWh battery pack.',
    status: 'Maintenance',
    is_featured: 0
  }
];

const bookings = [
  {
    booking_id: 1,
    user_id: 2,
    car_id: 15, // Toyota Innova Hycross
    pickup_location: 'Connaught Place, New Delhi',
    return_location: 'Connaught Place, New Delhi',
    pickup_date: '2026-09-01',
    return_date: '2026-09-04',
    rental_days: 3,
    price_per_day: 3800.00,
    subtotal: 11400.00,
    tax: 2052.00,
    discount: 500.00,
    total_amount: 12952.00,
    booking_status: 'Completed',
    special_requests: 'Airport pickup requested'
  },
  {
    booking_id: 2,
    user_id: 3,
    car_id: 10, // Hyundai Creta
    pickup_location: 'Andheri West, Mumbai',
    return_location: 'Andheri West, Mumbai',
    pickup_date: '2026-09-05',
    return_date: '2026-09-08',
    rental_days: 3,
    price_per_day: 2600.00,
    subtotal: 7800.00,
    tax: 1404.00,
    discount: 0.00,
    total_amount: 9204.00,
    booking_status: 'Completed',
    special_requests: 'Child safety seat required'
  },
  {
    booking_id: 3,
    user_id: 4,
    car_id: 17, // Mahindra Thar
    pickup_location: 'Indiranagar, Bengaluru',
    return_location: 'Indiranagar, Bengaluru',
    pickup_date: '2026-09-10',
    return_date: '2026-09-14',
    rental_days: 4,
    price_per_day: 3200.00,
    subtotal: 12800.00,
    tax: 2304.00,
    discount: 600.00,
    total_amount: 14504.00,
    booking_status: 'Completed',
    special_requests: 'Weekend road trip to Coorg'
  },
  {
    booking_id: 4,
    user_id: 5,
    car_id: 1, // Maruti Swift
    pickup_location: 'Banjara Hills, Hyderabad',
    return_location: 'Banjara Hills, Hyderabad',
    pickup_date: '2026-09-15',
    return_date: '2026-09-17',
    rental_days: 2,
    price_per_day: 1600.00,
    subtotal: 3200.00,
    tax: 576.00,
    discount: 0.00,
    total_amount: 3776.00,
    booking_status: 'Completed',
    special_requests: 'City errand driving'
  },
  {
    booking_id: 5,
    user_id: 6,
    car_id: 6, // Honda City
    pickup_location: 'Malviya Nagar, Jaipur',
    return_location: 'Malviya Nagar, Jaipur',
    pickup_date: '2026-09-20',
    return_date: '2026-09-23',
    rental_days: 3,
    price_per_day: 2500.00,
    subtotal: 7500.00,
    tax: 1350.00,
    discount: 300.00,
    total_amount: 8550.00,
    booking_status: 'Completed',
    special_requests: 'Business client transfer'
  },
  {
    booking_id: 6,
    user_id: 2,
    car_id: 13, // Mahindra Scorpio-N (Active rental)
    pickup_location: 'Connaught Place, New Delhi',
    return_location: 'Connaught Place, New Delhi',
    pickup_date: '2026-10-18',
    return_date: '2026-10-25',
    rental_days: 7,
    price_per_day: 3600.00,
    subtotal: 25200.00,
    tax: 4536.00,
    discount: 1000.00,
    total_amount: 28736.00,
    booking_status: 'Active',
    special_requests: 'Trip to Manali with family'
  },
  {
    booking_id: 7,
    user_id: 3,
    car_id: 11, // Kia Seltos
    pickup_location: 'Chhatrapati Shivaji Airport, Mumbai',
    return_location: 'Chhatrapati Shivaji Airport, Mumbai',
    pickup_date: '2026-10-24',
    return_date: '2026-10-27',
    rental_days: 3,
    price_per_day: 2800.00,
    subtotal: 8400.00,
    tax: 1512.00,
    discount: 400.00,
    total_amount: 9512.00,
    booking_status: 'Confirmed',
    special_requests: 'Self drive Mumbai to Pune'
  },
  {
    booking_id: 8,
    user_id: 4,
    car_id: 21, // Tata Nexon EV
    pickup_location: 'Kempegowda Airport, Bengaluru',
    return_location: 'Kempegowda Airport, Bengaluru',
    pickup_date: '2026-10-26',
    return_date: '2026-10-29',
    rental_days: 3,
    price_per_day: 2900.00,
    subtotal: 8700.00,
    tax: 1566.00,
    discount: 300.00,
    total_amount: 9966.00,
    booking_status: 'Confirmed',
    special_requests: 'Eco-friendly commute with charging cable'
  },
  {
    booking_id: 9,
    user_id: 5,
    car_id: 18, // BMW 3 Series
    pickup_location: 'Rajiv Gandhi Airport, Hyderabad',
    return_location: 'Rajiv Gandhi Airport, Hyderabad',
    pickup_date: '2026-10-30',
    return_date: '2026-11-02',
    rental_days: 3,
    price_per_day: 8500.00,
    subtotal: 25500.00,
    tax: 4590.00,
    discount: 800.00,
    total_amount: 29290.00,
    booking_status: 'Pending',
    special_requests: 'VIP corporate reception'
  },
  {
    booking_id: 10,
    user_id: 6,
    car_id: 17, // Mahindra Thar
    pickup_location: 'Malviya Nagar, Jaipur',
    return_location: 'Malviya Nagar, Jaipur',
    pickup_date: '2026-09-28',
    return_date: '2026-09-30',
    rental_days: 2,
    price_per_day: 3200.00,
    subtotal: 6400.00,
    tax: 1152.00,
    discount: 0.00,
    total_amount: 7552.00,
    booking_status: 'Cancelled',
    special_requests: 'Plans changed due to family emergency'
  }
];

const payments = [
  {
    payment_id: 1,
    booking_id: 1,
    amount: 12952.00,
    payment_method: 'UPI',
    payment_status: 'Paid',
    transaction_id: 'TXN-UPI-9018241',
    payment_date: '2026-09-01 10:15:00'
  },
  {
    payment_id: 2,
    booking_id: 2,
    amount: 9204.00,
    payment_method: 'Card',
    payment_status: 'Paid',
    transaction_id: 'TXN-CARD-4481902',
    payment_date: '2026-09-05 11:20:00'
  },
  {
    payment_id: 3,
    booking_id: 3,
    amount: 14504.00,
    payment_method: 'Net Banking',
    payment_status: 'Paid',
    transaction_id: 'TXN-NET-7719203',
    payment_date: '2026-09-10 09:45:00'
  },
  {
    payment_id: 4,
    booking_id: 4,
    amount: 3776.00,
    payment_method: 'UPI',
    payment_status: 'Paid',
    transaction_id: 'TXN-UPI-3391024',
    payment_date: '2026-09-15 14:30:00'
  },
  {
    payment_id: 5,
    booking_id: 5,
    amount: 8550.00,
    payment_method: 'Card',
    payment_status: 'Paid',
    transaction_id: 'TXN-CARD-1182745',
    payment_date: '2026-09-20 16:10:00'
  },
  {
    payment_id: 6,
    booking_id: 6,
    amount: 28736.00,
    payment_method: 'UPI',
    payment_status: 'Paid',
    transaction_id: 'TXN-UPI-8849106',
    payment_date: '2026-10-18 08:30:00'
  },
  {
    payment_id: 7,
    booking_id: 7,
    amount: 9512.00,
    payment_method: 'Net Banking',
    payment_status: 'Paid',
    transaction_id: 'TXN-NET-2291837',
    payment_date: '2026-10-19 12:00:00'
  },
  {
    payment_id: 8,
    booking_id: 8,
    amount: 9966.00,
    payment_method: 'UPI',
    payment_status: 'Paid',
    transaction_id: 'TXN-UPI-6649108',
    payment_date: '2026-10-20 17:40:00'
  },
  {
    payment_id: 9,
    booking_id: 9,
    amount: 29290.00,
    payment_method: 'Cash',
    payment_status: 'Pending',
    transaction_id: 'TXN-CASH-PENDING',
    payment_date: '2026-10-20 11:00:00'
  },
  {
    payment_id: 10,
    booking_id: 10,
    amount: 7552.00,
    payment_method: 'Card',
    payment_status: 'Refunded',
    transaction_id: 'TXN-REFUND-55102',
    payment_date: '2026-09-28 15:00:00'
  }
];

const maintenance = [
  {
    maintenance_id: 1,
    car_id: 22, // MG ZS EV
    maintenance_type: 'Software Update & High-Voltage Battery Inspection',
    description: 'Scheduled EV diagnostics, firmware upgrade, and cooling pump inspection.',
    start_date: '2026-10-15',
    end_date: '2026-10-25',
    cost: 5500.00,
    status: 'In Progress'
  },
  {
    maintenance_id: 2,
    car_id: 1, // Swift
    maintenance_type: 'Periodic 20,000 km Service',
    description: 'Engine oil replacement, synthetic brake fluid flush, and cabin air filter renewal.',
    start_date: '2026-08-10',
    end_date: '2026-08-12',
    cost: 4200.00,
    status: 'Completed'
  }
];

const pickupReturnRecords = [
  {
    record_id: 1,
    booking_id: 1,
    staff_id: 7,
    pickup_time: '2026-09-01 10:30:00',
    pickup_odometer: 14200,
    pickup_condition: 'Vehicle inspected, clean exterior, all accessories present.',
    return_time: '2026-09-04 18:00:00',
    return_odometer: 14750,
    return_condition: 'Vehicle returned in perfect showroom condition. Full fuel tank verified.',
    damage_reported: 0,
    damage_notes: null,
    damage_fee: 0.00,
    additional_charges: 0.00,
    status: 'Returned'
  },
  {
    record_id: 2,
    booking_id: 6,
    staff_id: 7,
    pickup_time: '2026-10-18 09:00:00',
    pickup_odometer: 28400,
    pickup_condition: 'Pre-handover 40-point safety check completed. Spare wheel and toolkit verified.',
    return_time: null,
    return_odometer: null,
    return_condition: null,
    damage_reported: 0,
    damage_notes: null,
    damage_fee: 0.00,
    additional_charges: 0.00,
    status: 'Picked_Up'
  }
];

const notifications = [
  {
    notification_id: 1,
    user_id: 2,
    title: 'Booking Confirmed - Mahindra Scorpio-N',
    message: 'Your booking #6 for Mahindra Scorpio-N has been confirmed for 18-25 Oct 2026.',
    type: 'success',
    is_read: 1
  },
  {
    notification_id: 2,
    user_id: 2,
    title: 'Vehicle Handover Completed',
    message: 'Staff member Vikash Sharma has recorded your pickup. Have a safe drive to Manali!',
    type: 'info',
    is_read: 0
  },
  {
    notification_id: 3,
    user_id: 3,
    title: 'Reservation Confirmed - Kia Seltos',
    message: 'Booking #7 is confirmed. Please bring your original driving license (MH-0220190023456) at pickup.',
    type: 'success',
    is_read: 0
  },
  {
    notification_id: 4,
    user_id: 4,
    title: 'Booking Confirmed - Tata Nexon EV',
    message: 'Booking #8 is confirmed for Kempegowda Airport pickup. 100% battery charge ensured.',
    type: 'success',
    is_read: 0
  }
];

module.exports = {
  users,
  cars,
  bookings,
  payments,
  maintenance,
  pickupReturnRecords,
  notifications
};
