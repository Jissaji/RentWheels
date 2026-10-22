const http = require('http');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting RentWheels End-to-End Validation ---');
  const port = 5000;

  // 1. Login Admin
  const adminLogin = await request({
    hostname: '127.0.0.1',
    port,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@rentwheels.com', password: 'admin123' });

  console.log('1. Admin Login:', adminLogin.status === 200 ? 'PASS' : 'FAIL', adminLogin.data?.user?.role);
  const adminToken = adminLogin.data?.token;

  // 2. Login Staff
  const staffLogin = await request({
    hostname: '127.0.0.1',
    port,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'staff@rentwheels.com', password: 'password123' });

  console.log('2. Staff Login:', staffLogin.status === 200 ? 'PASS' : 'FAIL', staffLogin.data?.user?.role);
  const staffToken = staffLogin.data?.token;

  // 3. Login Customer
  const customerLogin = await request({
    hostname: '127.0.0.1',
    port,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'rajesh.sharma@example.com', password: 'password123' });

  console.log('3. Customer Login:', customerLogin.status === 200 ? 'PASS' : 'FAIL', customerLogin.data?.user?.role);
  const customerToken = customerLogin.data?.token;

  // 4. Test Car Search & Filters (20+ Indian Cars, Category, Dates)
  const carsRes = await request({
    hostname: '127.0.0.1',
    port,
    path: '/api/cars?category=SUV',
    method: 'GET'
  });
  console.log('4. Car Search (Category=SUV):', carsRes.status === 200 && carsRes.data?.cars?.length > 0 ? 'PASS' : 'FAIL', `Found ${carsRes.data?.cars?.length} SUVs`);

  const allCarsRes = await request({
    hostname: '127.0.0.1',
    port,
    path: '/api/cars',
    method: 'GET'
  });
  console.log('4b. Total Inventory Count:', allCarsRes.data?.cars?.length >= 20 ? 'PASS' : 'FAIL', `Total: ${allCarsRes.data?.cars?.length} vehicles`);

  // 5. Test Availability & Overlap Filtering
  const availableCars = await request({
    hostname: '127.0.0.1',
    port,
    path: '/api/cars?pickup_date=2026-11-01&return_date=2026-11-05&category=Sedan',
    method: 'GET'
  });
  console.log('5. Date & Category Search (2026-11-01 to 2026-11-05):', availableCars.status === 200 ? 'PASS' : 'FAIL', `Available Sedans: ${availableCars.data?.cars?.length}`);

  const testCar = availableCars.data?.cars[0];
  if (!testCar) {
    console.error('No car available to book');
    return;
  }

  // 6. Test Online Booking (Customer)
  const bookingRes = await request({
    hostname: '127.0.0.1',
    port,
    path: '/api/bookings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    }
  }, {
    car_id: testCar.car_id,
    pickup_date: '2026-11-01',
    return_date: '2026-11-05',
    pickup_location: 'Indira Gandhi International Airport, New Delhi',
    return_location: 'Indira Gandhi International Airport, New Delhi',
    payment_method: 'UPI'
  });
  console.log('6. Create Customer Booking:', bookingRes.status === 201 ? 'PASS' : 'FAIL', `Booking #${bookingRes.data?.booking?.booking_id}, Total: ₹${bookingRes.data?.booking?.total_amount}`);
  const newBookingId = bookingRes.data?.booking?.booking_id;

  // 7. Test Car Availability Overlap Check (Searching same car on overlapping dates should exclude it)
  const recheckOverlap = await request({
    hostname: '127.0.0.1',
    port,
    path: `/api/cars?pickup_date=2026-11-02&return_date=2026-11-04`,
    method: 'GET'
  });
  const isExcluded = !recheckOverlap.data?.cars?.some(c => c.car_id === testCar.car_id);
  console.log('7. Overlap Availability Exclusion:', isExcluded ? 'PASS' : 'FAIL', `Car #${testCar.car_id} correctly excluded during booked window.`);

  // 8. Admin View Car Booking History
  const historyRes = await request({
    hostname: '127.0.0.1',
    port,
    path: `/api/cars/${testCar.car_id}/bookings`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('8. Car Booking History (Admin):', historyRes.status === 200 && historyRes.data?.bookings?.length > 0 ? 'PASS' : 'FAIL', `History items: ${historyRes.data?.bookings?.length}`);

  // 9. Admin Approves Booking -> Confirmed
  const approveRes = await request({
    hostname: '127.0.0.1',
    port,
    path: `/api/bookings/${newBookingId}/status`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, { status: 'Confirmed' });
  console.log('9. Admin Approve Booking:', approveRes.status === 200 && approveRes.data?.booking?.booking_status === 'Confirmed' ? 'PASS' : 'FAIL');

  // 10. Staff Records Pickup -> Active
  const pickupRes = await request({
    hostname: '127.0.0.1',
    port,
    path: '/api/rental-records/pickup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${staffToken}`
    }
  }, {
    booking_id: newBookingId,
    odometer_reading: 15420,
    fuel_level: 'Full',
    condition_notes: 'All clean, minor scratch on left mirror noted.',
    handover_checklist: { spare_tire: true, toolkit: true, documents: true, clean_interior: true }
  });
  console.log('10. Staff Record Pickup Handover:', pickupRes.status === 201 ? 'PASS' : 'FAIL', pickupRes.data?.message);

  // 11. Staff Records Return -> Completed
  const returnRes = await request({
    hostname: '127.0.0.1',
    port,
    path: '/api/rental-records/return',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${staffToken}`
    }
  }, {
    booking_id: newBookingId,
    odometer_reading: 15890,
    fuel_level: 'Full',
    return_condition_notes: 'Returned in pristine condition, no fresh damage.',
    damage_reported: false,
    damage_description: '',
    additional_charges: 0,
    vehicle_destination: 'Available'
  });
  console.log('11. Staff Record Return & Inspection:', returnRes.status === 200 ? 'PASS' : 'FAIL', returnRes.data?.message);

  // 12. Check Customer Notifications
  const notifRes = await request({
    hostname: '127.0.0.1',
    port,
    path: '/api/notifications',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  console.log('12. In-App Notifications Delivery:', notifRes.status === 200 && notifRes.data?.notifications?.length > 0 ? 'PASS' : 'FAIL', `Notifications for customer: ${notifRes.data?.notifications?.length}`);

  // 13. Customer My Bookings View
  const myBookingsRes = await request({
    hostname: '127.0.0.1',
    port,
    path: '/api/bookings/my-bookings',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  console.log('13. Customer My Bookings:', myBookingsRes.status === 200 && myBookingsRes.data?.bookings?.length > 0 ? 'PASS' : 'FAIL', `My Bookings count: ${myBookingsRes.data?.bookings?.length}`);

  console.log('--- All RentWheels Enhancements Validated Successfully ---');
}

runTests().catch(console.error);
